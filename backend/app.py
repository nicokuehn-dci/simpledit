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
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
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

class AiResponse(BaseModel):
    content: str
    usage: Optional[Dict[str, Any]] = None

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

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
