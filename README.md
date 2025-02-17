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
    manifest.json        # Auto-generated list of all modules
    basic-greetings.json # Example flashcard module
    simple-phrases.json  # Example sentence completion module
  /images/
    /food-1/            # Images for food module
    /animals-1/         # Images for animals module
/src
  /components/          # Reusable UI components
  /pages/              # Page components
  /types/              # TypeScript interfaces
  /hooks/              # Custom React hooks
  /utils/              # Utility functions
/scripts
  generate-manifest.js  # Script to generate module manifest
  validate-modules.js   # Script to validate module files
```

## Module Management

### Module Validation

The project includes automatic validation of module files to ensure consistency and correctness. To validate modules:

```bash
npm run validate-modules
```

The validator checks for:
- Required fields (id, title, description, type, questions)
- Unique module IDs
- Valid module types (flashcards, sentence-completion)
- Question format and completeness
- Image paths for image-based flashcards
- Correct answer presence in options
- JSON syntax

### Manifest Generation

The manifest file (`public/modules/manifest.json`) is automatically generated from individual module files:

```bash
npm run generate-manifest
```

Both validation and manifest generation are run automatically during the build process.

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
  ],
  "generatedAt": "2024-03-10T12:00:00.000Z"
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
      "variant": "text",
      "prompt": "English Word",
      "correctAnswer": "Afrikaans Word",
      "options": ["Option 1", "Option 2", "Option 3", "Option 4"]
    }
  ]
}
```

### Image-based Flashcard
```json
{
  "type": "flashcards",
  "variant": "image",
  "imagePath": "/images/module-name/image.webp",
  "correctAnswer": "Afrikaans Word",
  "options": ["Option 1", "Option 2", "Option 3", "Option 4"]
}
```

### Sentence Completion
```json
{
  "type": "sentence-completion",
  "prompt": "English Sentence",
  "correctAnswer": "Afrikaans Sentence",
  "hint": "Optional hint for the user"
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
2. Follow the module format shown above
3. For image-based flashcards:
   - Add images to `/public/images/[module-id]/`
   - Use WebP format for better performance
   - Keep image sizes reasonable (500-800px wide)
4. Validate your module:
   ```bash
   npm run validate-modules
   ```
5. Generate the updated manifest:
   ```bash
   npm run generate-manifest
   ```

The new module will automatically appear in the app after rebuilding.

## Deployment

The application is designed to be deployed on Netlify:

1. Push your changes to GitHub
2. Connect your repository to Netlify
3. Configure the build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`

## License

MIT License
