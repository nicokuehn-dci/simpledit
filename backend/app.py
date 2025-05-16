import os
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, Dict, Any, List
import httpx
import dotenv
from pathlib import Path

# Load environment variables from the parent directory's .env file
dotenv_path = Path(__file__).parent.parent / ".env"
dotenv.load_dotenv(dotenv_path)

# Get API key from environment variables
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
if not GROQ_API_KEY:
    raise ValueError("GROQ_API_KEY environment variable not set")

# FastAPI app
app = FastAPI(title="Groq AI Text Editor API")

# Configure CORS to allow requests from the React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3002"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"]  # Expose headers for preflight requests
)

# Base URL for Groq API
GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"

# Define models
class TextCompletionRequest(BaseModel):
    text: str
    mode: str  # "complete", "code_review", "format", "explain"
    language: Optional[str] = "plaintext"
    temperature: Optional[float] = 0.7
    max_tokens: Optional[int] = 500

class ChatMessage(BaseModel):
    role: str  # "user", "assistant", "system"
    content: str

class EditorContext(BaseModel):
    fileName: Optional[str] = None
    language: Optional[str] = "plaintext"
    selectedText: Optional[str] = None
    cursorPosition: Optional[Dict[str, int]] = None
    lineCount: Optional[int] = None
    hasFullContent: Optional[bool] = False
    fullContent: Optional[str] = None

class ChatRequest(BaseModel):
    messages: List[ChatMessage]
    editorContext: Optional[EditorContext] = None
    language: Optional[str] = "plaintext"
    temperature: Optional[float] = 0.7
    max_tokens: Optional[int] = 1000

class AiResponse(BaseModel):
    content: str
    usage: Optional[Dict[str, Any]] = None

class CodeAction(BaseModel):
    action: str  # "analyze", "improve", "generate_test", "explain", "debug", "format"
    code: str
    language: Optional[str] = "plaintext"
    temperature: Optional[float] = 0.7
    max_tokens: Optional[int] = 1000

class CodeActionResponse(BaseModel):
    content: str
    usage: Optional[Dict[str, Any]] = None
    suggestedEdits: Optional[Dict[str, Any]] = None

# Define code action model
class CodeActionRequest(BaseModel):
    code: str
    action: str  # "format", "explain", "debug", "improve", "generate_test"
    language: Optional[str] = "plaintext"

# Health check endpoint
@app.get("/health")
async def health_check():
    return {"status": "ok", "message": "Groq AI Text Editor API is running"}

# Helper function for making API calls to Groq
async def call_groq_api(messages, temperature=0.7, max_tokens=500, model="llama3-70b-8192"):
    headers = {
        "Authorization": f"Bearer {GROQ_API_KEY}",
        "Content-Type": "application/json"
    }
    
    data = {
        "model": model,
        "messages": messages,
        "temperature": temperature,
        "max_tokens": max_tokens
    }
    
    async with httpx.AsyncClient() as client:
        response = await client.post(GROQ_API_URL, json=data, headers=headers, timeout=30.0)
        
        if response.status_code != 200:
            raise HTTPException(status_code=response.status_code, 
                                detail=f"Groq API error: {response.text}")
        
        result = response.json()
        return result

# Chat endpoint
@app.post("/chat", response_model=AiResponse)
async def chat(request: ChatRequest):
    # Convert our internal message format to Groq API format
    messages = []
    
    # Start with a system message if not already provided
    if not any(msg.role == "system" for msg in request.messages):
        messages.append({
            "role": "system", 
            "content": (
                "You are a helpful AI assistant integrated with the SimpleEdit text editor. "
                "You can help with writing, coding, debugging, and answering questions about code. "
                "When the user selects code or text in the editor, you can analyze it, explain it, "
                "suggest improvements, or help modify it. "
                "You can provide code snippets which the user can insert directly into their editor. "
                "Format code examples using markdown code blocks with the appropriate language tag. "
                "For example: ```python\nprint('Hello world')\n``` "
                "Be concise, helpful, and focus on providing practical solutions."
            )
        })
    
    # Add editor context if available
    if request.editorContext:
        ctx = request.editorContext
        editor_info = []
        
        # Add file information
        if ctx.fileName:
            editor_info.append(f"Current file: {ctx.fileName}")
        
        # Add language information
        editor_info.append(f"Language: {ctx.language or request.language}")
        
        # Add selected text information
        if ctx.selectedText:
            editor_info.append(f"Selected text: {len(ctx.selectedText)} characters")
            
            # Create context message
            context_message = {
                "role": "system",
                "content": (
                    f"Editor context:\n" + 
                    "\n".join(editor_info) + 
                    f"\n\nThe user has selected the following text in the editor:\n\n"
                    f"```{ctx.language or request.language}\n{ctx.selectedText}\n```"
                )
            }
            messages.append(context_message)
            
        # Add full content if available and not too large
        elif ctx.fullContent and ctx.hasFullContent:
            editor_info.append(f"File size: {len(ctx.fullContent)} characters")
            # Create context message with full content
            context_message = {
                "role": "system",
                "content": (
                    f"Editor context:\n" + 
                    "\n".join(editor_info) + 
                    f"\n\nThe full content of the file is:\n\n"
                    f"```{ctx.language or request.language}\n{ctx.fullContent}\n```"
                )
            }
            messages.append(context_message)
    # Fallback to old selectedText parameter for backward compatibility
    elif request.selectedText:
        context_message = {
            "role": "system",
            "content": f"The user has selected the following text in the editor (language: {request.language}):\n\n```{request.language}\n{request.selectedText}\n```"
        }
        messages.append(context_message)
    
    # Add all the messages from the conversation
    for msg in request.messages:
        messages.append({
            "role": msg.role,
            "content": msg.content
        })
    
    # Call Groq API
    response = await call_groq_api(
        messages=messages,
        temperature=request.temperature,
        max_tokens=request.max_tokens
    )
    
    return {
        "content": response["choices"][0]["message"]["content"],
        "usage": response.get("usage", {})
    }

# Complete text endpoint
@app.post("/complete", response_model=AiResponse)
async def complete_text(request: TextCompletionRequest):
    prompt = f"Complete the following text. Make sure to maintain the same style, tone, and context:\n\n{request.text}"
    
    messages = [
        {"role": "system", "content": "You are a helpful text completion assistant."},
        {"role": "user", "content": prompt}
    ]
    
    response = await call_groq_api(
        messages=messages,
        temperature=request.temperature,
        max_tokens=request.max_tokens
    )
    
    return {
        "content": response["choices"][0]["message"]["content"],
        "usage": response.get("usage", {})
    }

# Code review endpoint
@app.post("/code_review", response_model=AiResponse)
async def review_code(request: TextCompletionRequest):
    prompt = f"Review the following code written in {request.language}. Provide feedback on style, efficiency, and potential bugs:\n\n```{request.language}\n{request.text}\n```"
    
    messages = [
        {"role": "system", "content": "You are a skilled code reviewer. Provide clear, constructive feedback focused on improving code quality."},
        {"role": "user", "content": prompt}
    ]
    
    response = await call_groq_api(
        messages=messages,
        temperature=request.temperature,
        max_tokens=request.max_tokens
    )
    
    return {
        "content": response["choices"][0]["message"]["content"],
        "usage": response.get("usage", {})
    }

# Format text endpoint
@app.post("/format_text", response_model=AiResponse)
async def format_text(request: TextCompletionRequest):
    prompt = f"Format and improve the following text or code in {request.language}. Maintain the meaning but enhance clarity, structure, and style:\n\n```{request.language}\n{request.text}\n```"
    
    system_message = "You are an expert formatter and editor."
    if request.language not in ["plaintext", "text"]:
        system_message += f" You excel at formatting and optimizing code in {request.language}. Return only the formatted code without explanations."
    
    messages = [
        {"role": "system", "content": system_message},
        {"role": "user", "content": prompt}
    ]
    
    response = await call_groq_api(
        messages=messages,
        temperature=min(request.temperature, 0.5),  # Lower temperature for formatting
        max_tokens=request.max_tokens
    )
    
    return {
        "content": response["choices"][0]["message"]["content"],
        "usage": response.get("usage", {})
    }

# Explain code endpoint
@app.post("/explain", response_model=AiResponse)
async def explain_code(request: TextCompletionRequest):
    prompt = f"Explain the following code or text in detail:\n\n```{request.language}\n{request.text}\n```"
    
    messages = [
        {"role": "system", "content": "You are an expert educator who explains code and concepts clearly and thoroughly."},
        {"role": "user", "content": prompt}
    ]
    
    response = await call_groq_api(
        messages=messages,
        temperature=request.temperature,
        max_tokens=request.max_tokens
    )
    
    return {
        "content": response["choices"][0]["message"]["content"],
        "usage": response.get("usage", {})
    }

# Code action endpoint for direct code operations
@app.post("/code_action", response_model=CodeActionResponse)
async def perform_code_action(request: CodeAction):
    # Define prompts for different actions
    prompts = {
        "analyze": f"Analyze this code and provide insights on its structure, potential issues, and complexity:\n\n```{request.language}\n{request.code}\n```",
        "improve": f"Improve this code while maintaining its functionality. Consider performance, readability, and best practices:\n\n```{request.language}\n{request.code}\n```",
        "generate_test": f"Generate comprehensive tests for this code:\n\n```{request.language}\n{request.code}\n```",
        "explain": f"Explain this code in detail, including what each part does and how it works:\n\n```{request.language}\n{request.code}\n```",
        "debug": f"Debug this code. Identify any potential errors, bugs, or edge cases that could cause problems:\n\n```{request.language}\n{request.code}\n```",
        "format": f"Format and improve the style of this code according to best practices for {request.language}:\n\n```{request.language}\n{request.code}\n```",
    }
    
    if request.action not in prompts:
        raise HTTPException(status_code=400, detail=f"Unsupported action: {request.action}")
    
    # Create system message based on action
    system_message = {
        "role": "system",
        "content": (
            f"You are a code assistant specialized in {request.language} programming. "
            f"You are performing the '{request.action}' action on the provided code. "
            f"Provide a clear, helpful response with specific details. "
            f"When showing code improvements, use markdown code blocks with the appropriate language tag."
        )
    }
    
    # Create user message with the specific prompt
    user_message = {
        "role": "user",
        "content": prompts[request.action]
    }
    
    # Call Groq API
    response = await call_groq_api(
        messages=[system_message, user_message],
        temperature=request.temperature,
        max_tokens=request.max_tokens
    )
    
    result = {
        "content": response["choices"][0]["message"]["content"],
        "usage": response.get("usage", {})
    }
    
    # If improving or formatting, try to extract the suggested code changes
    if request.action in ["improve", "format"]:
        # Extract code blocks from the response
        import re
        code_blocks = re.findall(r"```(?:\w+)?\n([\s\S]+?)```", result["content"])
        if code_blocks:
            result["suggestedEdits"] = {
                "newCode": code_blocks[0],
                "original": request.code
            }
    
    return result

# Code action endpoint
@app.post("/code_action")
async def code_action(request: CodeActionRequest):
    """Process code actions like formatting, explaining, debugging, etc."""
    
    # Determine prompt based on action
    system_message = "You are a helpful coding assistant."
    user_message = request.code
    
    if request.action == "format":
        system_message = f"You are an expert programmer. Format the following {request.language} code to improve readability. Only return the formatted code without explanations or markdown formatting."
    
    elif request.action == "explain":
        system_message = f"You are an expert programmer. Explain this {request.language} code clearly and concisely. Include details about what the code does and how it works."
    
    elif request.action == "debug":
        system_message = f"You are an expert programmer. Debug the following {request.language} code. Identify potential issues, bugs, or inefficiencies, and suggest fixes."
    
    elif request.action == "improve":
        system_message = f"You are an expert programmer. Improve the following {request.language} code by making it more efficient, readable, or robust. Return the improved code with brief explanations of your changes."
    
    elif request.action == "generate_test":
        system_message = f"You are an expert programmer. Generate comprehensive tests for the following {request.language} code."
    
    # Call Groq API
    try:
        headers = {
            "Authorization": f"Bearer {GROQ_API_KEY}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "model": "llama3-8b-8192",  # Using Llama 3 model
            "messages": [
                {"role": "system", "content": system_message},
                {"role": "user", "content": user_message}
            ],
            "temperature": 0.2 if request.action == "format" else 0.7,
            "max_tokens": 2048
        }
        
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(GROQ_API_URL, json=payload, headers=headers)
            response.raise_for_status()
            data = response.json()
            
        content = data["choices"][0]["message"]["content"]
        return {"status": "success", "content": content}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing code action: {str(e)}")

if __name__ == "__main__":
    try:
        import uvicorn
        print("Starting Groq AI Text Editor backend server...")
        print("The server will be accessible at http://127.0.0.1:8000")
        uvicorn.run(app, host="127.0.0.1", port=8000, log_level="info")
    except ImportError:
        print("Error: uvicorn package not found. Installing required packages...")
        import subprocess
        import sys
        subprocess.check_call([sys.executable, "-m", "pip", "install", "uvicorn>=0.23.0"])
        print("Uvicorn installed. Restarting server...")
        import uvicorn
        uvicorn.run(app, host="127.0.0.1", port=8000, log_level="info")
