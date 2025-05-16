# Multilingual Text Editor

A modern, feature-rich text editor built with React, featuring dark mode, multilingual support, and functional programming concepts.

## Features

- **Modern Dashboard Interface**: Easily create, open, and manage files
- **Multiple Language Support**: Interface available in English, German, French, and Spanish
- **Dark Mode & Themes**: Choose between dark mode, light mode, or high contrast
- **Monaco Editor Integration**: Powerful code editing with syntax highlighting
- **Search & Replace**: Advanced search functionality with regex support
- **File Operations**: Create, open, save, and manage files
- **Functional Programming**: Demonstrates concepts like pure functions, recursion, and higher-order functions

## Getting Started

### Prerequisites

- Node.js (v14.0.0 or higher)
- npm (v6.0.0 or higher)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/react-text-editor.git
   cd react-text-editor
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

4. Open your browser and navigate to `http://localhost:3000`

## Technology Stack

- **React**: UI library for building the interface
- **Monaco Editor**: Code editor component that powers VS Code
- **i18next**: Internationalization framework
- **styled-components**: CSS-in-JS styling
- **file-saver**: File saving functionality

## Project Structure

```
react-text-editor/
├── public/               # Public assets
│   └── examples/         # Example files for the editor
├── src/                  # Source code
│   ├── components/       # React components
│   │   ├── Dashboard/    # Dashboard components
│   │   ├── Editor/       # Editor components
│   │   └── SearchReplace/# Search functionality
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

## Functional Programming Concepts

This project demonstrates various functional programming concepts:

- **Pure Functions**: Functions that don't have side effects and always return the same output for the same input
- **Higher-Order Functions**: Functions that take other functions as arguments or return functions
- **Immutability**: Using non-mutating operations for state updates
- **Function Composition**: Combining multiple functions together
- **Recursion**: Functions that call themselves to solve problems

## License

MIT License
