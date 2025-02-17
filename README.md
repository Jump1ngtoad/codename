# Lekker Learning

A modern web application for learning Afrikaans through interactive flashcards and sentence completion exercises.

## Features

- **Flashcards Mode**: Match English and Afrikaans words with multiple-choice options
- **Sentence Completion Mode**: Practice typing translations in both English and Afrikaans
- **Module-based Learning**: Content organized into focused learning modules
- **Progress Tracking**: Keep track of completed modules
- **Mobile-Friendly**: Responsive design that works well on all devices
- **Offline Capable**: Works without an internet connection once loaded

## Technical Stack

- React with TypeScript for type-safe development
- Chakra UI for modern, accessible components
- React Router for navigation
- Local Storage for progress tracking
- Static JSON files for module data

## Project Structure

```
/public
  /modules/
    manifest.json        # List of all available modules
    basic-greetings.json # Example flashcard module
    simple-phrases.json  # Example sentence completion module
/src
  /components/          # Reusable UI components
  /pages/              # Page components
  /types/              # TypeScript interfaces
  /hooks/              # Custom React hooks
  /utils/              # Utility functions
```

## Module Format

### Manifest File (manifest.json)
```json
{
  "modules": [
    {
      "id": "module-id",
      "title": "Module Title",
      "description": "Module Description",
      "type": "flashcards | sentence-completion"
    }
  ]
}
```

### Module File (example.json)
```json
{
  "id": "module-id",
  "title": "Module Title",
  "description": "Module Description",
  "type": "flashcards",
  "questions": [
    {
      "type": "flashcards",
      "prompt": "English Word",
      "correctAnswer": "Afrikaans Word",
      "options": ["Option 1", "Option 2", "Option 3", "Option 4"]
    }
  ]
}
```

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Open http://localhost:5173 in your browser

## Adding New Modules

1. Create a new JSON file in the `/public/modules/` directory
2. Add the module information to `manifest.json`
3. Follow the module format shown above
4. The new module will automatically appear in the app

## Deployment

The application is designed to be deployed on Netlify:

1. Push your changes to GitHub
2. Connect your repository to Netlify
3. Configure the build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`

## License

MIT License
