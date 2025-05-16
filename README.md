# SimpleEdit - Multilingual Text Editor

A modern, feature-rich text editor built with React, featuring AI assistance, dark mode, multilingual support, and functional programming concepts.

## Features

- **Groq AI Integration**: Intelligent text and code completion, explanation, and formatting
- **Modern Dashboard Interface**: Easily create, open, and manage files
- **Multiple Language Support**: Interface available in English, German, French, and Spanish
- **Dark Mode & Themes**: Choose between dark mode, light mode, or high contrast
- **Monaco Editor Integration**: Powerful code editing with syntax highlighting
- **Search & Replace**: Advanced search functionality with regex support
- **File Operations**: Create, open, save, and manage files
- **Functional Programming**: Demonstrates concepts like pure functions, recursion, and higher-order functions
- **Modern UI**: Custom Smooch Sans typography and cohesive styling with gradient accents

## Getting Started

### Prerequisites

- Node.js (v14.0.0 or higher)
- npm (v6.0.0 or higher)
- Python (v3.8 or higher) for the AI backend

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/simpledit.git
   cd simpledit
   ```

2. Install frontend dependencies:
   ```bash
   npm install
   ```

3. Set up the Python backend:
   ```bash
   cd backend
   pip install -r requirements.txt
   cd ..
   ```

4. Create a `.env` file in the root directory with your Groq API key:
   ```
   GROQ_API_KEY=your-api-key-here
   ```

5. Start the application:
   ```bash
   ./start.sh
   ```
   This will start both the React frontend and Python backend.

6. Open your browser and navigate to `http://localhost:3000`

## Technology Stack

- **React**: UI library for building the interface
- **Monaco Editor**: Code editor component that powers VS Code
- **FastAPI**: Python backend for the AI capabilities
- **Groq API**: AI language model for text and code intelligence
- **i18next**: Internationalization framework
- **styled-components**: CSS-in-JS styling
- **file-saver**: File saving functionality

## Project Structure

```
simpledit/
├── backend/              # Python FastAPI backend
│   ├── app.py            # FastAPI application
│   └── requirements.txt  # Python dependencies
├── Fonts/                # Typography resources
│   └── Smooch_Sans/      # Custom variable font
├── public/               # Public assets
│   └── examples/         # Example files for the editor
├── src/                  # Source code
│   ├── components/       # React components
│   │   ├── AIAssistant/  # AI integration components
│   │   ├── CommandPalette/ # Command palette UI
│   │   ├── ContextMenu/  # Context menu functionality
│   │   ├── Dashboard/    # Dashboard components
│   │   ├── Editor/       # Editor components
│   │   ├── MenuBar/      # Menu system
│   │   ├── SearchReplace/# Search functionality
│   │   ├── Settings/     # Settings panel
│   │   ├── StatusBar/    # Status information
│   │   └── Terminal/     # Embedded terminal
│   ├── hooks/            # Custom React hooks
│   ├── locales/          # Translation files
│   │   ├── en/           # English translations
│   │   ├── de/           # German translations
│   │   ├── fr/           # French translations
│   │   └── es/           # Spanish translations
│   ├── utils/            # Utility functions
│   ├── App.jsx           # Main application component
│   └── index.js          # Entry point
└── package.json          # Dependencies and scripts
```

## AI Assistant Features

The SimpleEdit editor comes with powerful AI capabilities powered by Groq:

- **Text Completion**: Get intelligent suggestions and completions for your text
- **Code Analysis**: Analyze code structure and understand how it works
- **Code Improvement**: Get suggestions for improving code quality and efficiency
- **Code Explanation**: Understand complex code with detailed explanations
- **Code Formatting**: Beautify and format your code according to best practices
- **Test Generation**: Generate unit tests for your code
- **Debugging Help**: Identify potential bugs and issues in your code

## Typography and Design

SimpleEdit uses the Smooch Sans variable font for a modern, clean interface with:

- Consistent and readable typography throughout the application
- Enhanced font sizes for better readability
- Dark orange accents with gradient effects and shadows
- Responsive design that works well on different screen sizes

## Functional Programming Concepts

This project demonstrates various functional programming concepts:

- **Pure Functions**: Functions that don't have side effects and always return the same output for the same input
- **Higher-Order Functions**: Functions that take other functions as arguments or return functions
- **Immutability**: Using non-mutating operations for state updates
- **Function Composition**: Combining multiple functions together
- **Recursion**: Functions that call themselves to solve problems

## License

MIT License

## Acknowledgements

- [Groq](https://groq.com/) for the powerful AI API
- [Smooch Sans](https://fonts.google.com/specimen/Smooch+Sans) font by [Tyler Finck](https://www.tylerfinck.com/)
- [Monaco Editor](https://microsoft.github.io/monaco-editor/) from Microsoft
- [FastAPI](https://fastapi.tiangolo.com/) for the Python backend framework
