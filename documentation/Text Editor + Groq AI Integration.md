# Text Editor + Groq AI Integration Guide

## Overview

This document provides an overview of how the Groq AI integration works in the Text Editor application. The integration allows users to leverage Groq's powerful AI model for text completion, code review, code formatting, and code explanation directly within the editor.

## Features

The AI Assistant offers four main modes:

1. **Complete**: Continues or completes your text based on selected context
2. **Review**: Reviews your code and provides feedback on quality, style, and potential issues
3. **Format**: Improves the formatting and style of your code
4. **Explain**: Explains what your code does in plain language

## Architecture

The integration consists of two main components:

### 1. Python FastAPI Backend

- Located in the `backend/` directory
- Handles communication with the Groq API
- Provides endpoints for text completion, code review, formatting, and explanation
- Requires a Groq API key stored in the `.env` file

### 2. React Frontend Component

- Located in `src/components/AIAssistant/`
- Provides a user interface for interacting with the AI features
- Sends user-selected text to the backend for processing
- Displays AI-generated results and allows insertion into the editor

## Setup and Requirements

1. **API Key**: A valid Groq API key must be set in the `.env` file at the project root:
   ```
   GROQ_API_KEY=your_api_key
   ```

2. **Dependencies**:
   - Python 3.8+ with FastAPI, uvicorn, httpx, and python-dotenv
   - React with existing project dependencies

## Usage

1. Start both the backend and frontend using the provided script:
   ```bash
   ./start.sh
   ```

2. In the Text Editor:
   - Select text you want to process
   - Click the AI Assistant button (lightning bolt) in the bottom-right corner
   - Choose the desired mode (Complete, Review, Format, Explain)
   - Adjust the "temperature" slider to control creativity/randomness
   - Click "Generate" to process the text
   - Click "Insert" to add the result to your document

## Customization

The integration is designed to be easily customizable:

- Temperature adjustment: Controls how creative vs. deterministic the AI responses are
- Multiple languages: The UI is fully translatable, with existing translations for English, German, French, and Spanish

## Troubleshooting

Common issues and solutions:

1. **"No text selected" error**: You must select text in the editor before using the AI features
2. **Backend connection issues**: Ensure the backend server is running on port 8000
3. **API key errors**: Verify your Groq API key is valid and correctly set in the `.env` file

## Developer Notes

- The backend uses the Groq chat completions API with the llama3-70b-8192 model
- The interface is designed to be non-intrusive and accessible only when needed
- All AI processing happens on Groq's servers, not locally
