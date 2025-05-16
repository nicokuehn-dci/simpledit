# Text Editor + Groq AI Integration: Technical Documentation

## Overview

This document provides detailed technical documentation for the Groq AI integration in the Text Editor application. This integration enables AI-assisted text and code operations directly within the editor interface.

## Architecture

The integration follows a client-server architecture:

### Backend (Python FastAPI)

The backend is built with FastAPI and serves as a bridge between the React frontend and the Groq API.

- **Location**: `/backend/` directory
- **Main Files**:
  - `app.py`: Core backend implementation with API endpoints
  - `requirements.txt`: Python dependencies

### Frontend (React)

The frontend integration consists of a standalone React component that communicates with the backend.

- **Location**: `/src/components/AIAssistant/` directory
- **Main Files**:
  - `AIAssistant.jsx`: React component with UI and API communication logic
  - `AIAssistant.css`: Component styling

### Communication Flow

1. User selects text in the editor
2. User clicks the AI Assistant button and selects an operation mode
3. Selected text is sent to the FastAPI backend
4. Backend formats the request and forwards it to the Groq API
5. Groq API processes the request and returns a response
6. Backend forwards the response to the frontend
7. User can view and insert the AI-generated content back into the editor

## Backend Implementation Details

### API Endpoints

The backend exposes four main endpoints:

1. **`/complete`**: For text continuation and completion
   - Maintains writing style and context
   - Best for continuing paragraphs or code blocks

2. **`/code_review`**: For receiving feedback on code
   - Evaluates code quality, style, and potential bugs
   - Supports multiple programming languages

3. **`/format_text`**: For improving text/code formatting
   - Enhances structure, style, and readability
   - Uses lower temperature settings for predictable results

4. **`/explain`**: For explaining code or complex text
   - Provides detailed explanations of functionality
   - Breaks down complex concepts into understandable parts

### API Configuration

- **Base URL**: `http://localhost:8000`
- **Model**: `llama3-70b-8192` (Groq's implementation of Llama 3)
- **Authentication**: API key in `.env` file

### Error Handling

The backend implements comprehensive error handling:
- API key validation
- Request validation with Pydantic models
- HTTP exception handling for Groq API errors
- Timeout handling for long-running requests

## Frontend Implementation Details

### Component Structure

The `AIAssistant` component is designed to be non-intrusive and appears as a floating button in the editor interface.

#### Props
- `editorRef`: Reference to the Monaco editor instance
- `language`: Current file language (for context-aware AI responses)
- `onInsertText`: Callback to insert AI-generated text into the editor

#### State Management
- `isOpen`: Controls visibility of the assistant panel
- `mode`: Selected operation mode (complete, review, format, explain)
- `temperature`: Creativity setting (0.1-1.0)
- `loading`: Loading state during API requests
- `result`: AI-generated content
- `error`: Error message if request fails

### User Interface Elements

1. **Toggle Button**: Floating button in bottom-right corner
2. **Mode Selector**: Buttons to switch between operation modes
3. **Temperature Slider**: Controls AI response randomness/creativity
4. **Generate Button**: Initiates the AI request
5. **Result Display**: Shows AI-generated content
6. **Insert Button**: Inserts content into the editor

### Text Insertion Mechanism

The component uses Monaco Editor's editing API to insert AI-generated content:

```javascript
const handleInsertAIText = (text) => {
  if (editorRef.current) {
    const editor = editorRef.current;
    const selection = editor.getSelection();
    const id = { major: 1, minor: 1 };
    const op = { identifier: id, range: selection, text: text, forceMoveMarkers: true };
    editor.executeEdits("ai-assistant", [op]);
  }
};
```

This approach ensures that:
- Text is inserted at the current cursor position or replaces selected text
- Editor history (undo/redo) works correctly with inserted content
- Cursor position is properly maintained

## Internationalization (i18n)

The integration is fully internationalized and supports:
- English (en)
- German (de)
- French (fr)
- Spanish (es)

Translation keys are organized under the `aiAssistant` namespace in each language file.

## Setup Instructions

### Prerequisites
- Node.js and npm for the frontend
- Python 3.8+ for the backend
- Groq API key

### Installation Steps

1. **Backend Setup**:
   ```bash
   # Create virtual environment
   python -m venv backend/venv
   
   # Activate virtual environment
   source backend/venv/bin/activate
   
   # Install dependencies
   pip install -r backend/requirements.txt
   ```

2. **API Key Configuration**:
   ```
   # .env file in project root
   GROQ_API_KEY=your_api_key_here
   ```

3. **Starting the Application**:
   ```bash
   # Start both backend and frontend
   ./start.sh
   ```

## Usage Guide

### Basic Workflow

1. Open a file in the editor
2. Select the text you want to process
3. Click the AI Assistant button (lightning bolt icon)
4. Choose an operation mode:
   - **Complete**: For continuing your text or code
   - **Review**: For getting feedback on your code
   - **Format**: For improving text/code structure
   - **Explain**: For understanding complex code
5. Adjust the temperature slider if needed:
   - Lower (0.1-0.3): More predictable, consistent results
   - Medium (0.4-0.6): Balanced creativity and coherence
   - Higher (0.7-1.0): More creative, varied responses
6. Click "Generate" to process the text
7. Review the AI-generated content
8. Click "Insert" to add the content to your document

### Advanced Uses

#### Code Completion
When working with code, select a partial implementation or function signature and use the "Complete" mode to have AI suggest an implementation.

#### Style Improvement
Use "Format" mode with selected text to improve:
- Code readability and adherence to conventions
- Text structure and clarity
- Document organization

#### Learning Tool
The "Explain" mode can be used as a learning tool to understand:
- How specific algorithms work
- What certain code sections accomplish
- Complex programming concepts in simple terms

## Technical Considerations

### Security
- The backend only accepts requests from localhost by default
- API key is stored in an environment file, not in code
- User code is sent to Groq API but not persisted

### Performance
- Requests are asynchronous to prevent UI blocking
- Temperature setting allows balancing quality vs. speed
- Long text selections may take longer to process

### Limitations
- Requires internet connection to communicate with Groq API
- Language support limited to Groq's model capabilities
- Context window limited to model's token limit (8192 tokens)

## Future Enhancements

Potential improvements for future versions:

1. **Streaming Responses**: Implement streaming API for real-time results
2. **Code-Specific Modes**: Add specialized modes for different programming tasks
3. **Local Models**: Option to use local models when internet is unavailable
4. **Context Enhancement**: Include related files for better code understanding
5. **User Preferences**: Save preferred settings for different operation modes

## Troubleshooting

### Common Issues

1. **Backend Connection Failed**
   - Ensure backend server is running (`python backend/app.py`)
   - Check that port 8000 is not used by another application

2. **API Key Issues**
   - Verify API key is correctly set in `.env` file
   - Check Groq account status and API key validity

3. **Slow Responses**
   - Large text selections may take longer to process
   - Adjust temperature to lower values for faster responses
   - Check internet connection quality

4. **Component Import Error**
   - If you see the error "Element type is invalid" related to the AIAssistant component, this is typically caused by an issue with the component import
   - Solution: Ensure that the AIAssistant component is properly exported from its file and imported correctly in App.jsx
   - The component should be exported as default and imported directly from its location

## Developer Reference

### Key Files and Functions

#### Backend (`app.py`)
- `call_groq_api()`: Core function for Groq API communication
- Endpoint handlers: `complete_text()`, `review_code()`, `format_text()`, `explain_code()`

#### Frontend (`AIAssistant.jsx`)
- `handleAIInteraction()`: Manages API requests to backend
- `getSelectedText()`: Retrieves selected text from editor
- `handleInsertResult()`: Inserts AI responses into the editor

### API Reference

#### Complete Text
```
POST /complete
{
  "text": "Your text to complete",
  "mode": "complete",
  "language": "plaintext",
  "temperature": 0.7,
  "max_tokens": 500
}
```

#### Review Code
```
POST /code_review
{
  "text": "Your code to review",
  "mode": "review",
  "language": "javascript",
  "temperature": 0.7,
  "max_tokens": 500
}
```

#### Format Text
```
POST /format_text
{
  "text": "Your text to format",
  "mode": "format",
  "language": "python",
  "temperature": 0.3,
  "max_tokens": 500
}
```

#### Explain Code
```
POST /explain
{
  "text": "Your code to explain",
  "mode": "explain",
  "language": "python",
  "temperature": 0.7,
  "max_tokens": 500
}
```
