import fs from 'fs/promises'
import path from 'path'

const MODULES_DIR = 'public/modules'

const REQUIRED_MODULE_FIELDS = ['id', 'title', 'description', 'type', 'questions']
const VALID_TYPES = ['flashcards', 'sentence-completion', 'puzzle']
const VALID_VARIANTS = ['text', 'image']

async function validateModules() {
  try {
    const files = await fs.readdir(MODULES_DIR)
    const moduleFiles = files.filter(file => 
      file.endsWith('.json') && 
      file !== 'manifest.json'
    )

    let hasErrors = false
    const moduleIds = new Set()

    for (const file of moduleFiles) {
      const filePath = path.join(MODULES_DIR, file)
      const content = await fs.readFile(filePath, 'utf-8')
      
      try {
        const module = JSON.parse(content)
        
        // Check required fields
        for (const field of REQUIRED_MODULE_FIELDS) {
          if (!(field in module)) {
            console.error(`❌ ${file}: Missing required field '${field}'`)
            hasErrors = true
          }
        }

        // Check for duplicate IDs
        if (moduleIds.has(module.id)) {
          console.error(`❌ ${file}: Duplicate module ID '${module.id}'`)
          hasErrors = true
        }
        moduleIds.add(module.id)

        // Validate module type
        if (!VALID_TYPES.includes(module.type)) {
          console.error(`❌ ${file}: Invalid type '${module.type}'. Must be one of: ${VALID_TYPES.join(', ')}`)
          hasErrors = true
        }

        // Validate questions
        if (Array.isArray(module.questions)) {
          module.questions.forEach((question, index) => {
            // Check question type matches module type
            if (question.type !== module.type) {
              console.error(`❌ ${file}: Question ${index + 1} type '${question.type}' doesn't match module type '${module.type}'`)
              hasErrors = true
            }

            // Validate flashcard questions
            if (question.type === 'flashcards') {
              if (question.variant && !VALID_VARIANTS.includes(question.variant)) {
                console.error(`❌ ${file}: Question ${index + 1} has invalid variant '${question.variant}'. Must be one of: ${VALID_VARIANTS.join(', ')}`)
                hasErrors = true
              }

              if (question.variant === 'image' && !question.imagePath?.startsWith('/images/')) {
                console.error(`❌ ${file}: Question ${index + 1} image path must start with '/images/'`)
                hasErrors = true
              }

              if (!Array.isArray(question.options) || question.options.length < 2) {
                console.error(`❌ ${file}: Question ${index + 1} must have at least 2 options`)
                hasErrors = true
              }

              if (!question.options?.includes(question.correctAnswer)) {
                console.error(`❌ ${file}: Question ${index + 1} correct answer must be in options`)
                hasErrors = true
              }
            }

            // Validate sentence completion questions
            if (question.type === 'sentence-completion') {
              if (!question.prompt || !question.correctAnswer) {
                console.error(`❌ ${file}: Question ${index + 1} must have prompt and correctAnswer`)
                hasErrors = true
              }
            }
            
            // Validate puzzle questions
            if (question.type === 'puzzle') {
              if (!question.correctAnswer) {
                console.error(`❌ ${file}: Question ${index + 1} must have correctAnswer`)
                hasErrors = true
              }
              
              if (!Array.isArray(question.fragments) || question.fragments.length < 2) {
                console.error(`❌ ${file}: Question ${index + 1} must have at least 2 fragments`)
                hasErrors = true
              }
              
              if (question.imagePath && !question.imagePath.startsWith('/images/')) {
                console.error(`❌ ${file}: Question ${index + 1} image path must start with '/images/'`)
                hasErrors = true
              }
            }
          })
        } else {
          console.error(`❌ ${file}: 'questions' must be an array`)
          hasErrors = true
        }

      } catch (error) {
        console.error(`❌ ${file}: Invalid JSON - ${error.message}`)
        hasErrors = true
      }
    }

    if (hasErrors) {
      console.error('\n❌ Validation failed!')
      process.exit(1)
    } else {
      console.log('\n✅ All modules are valid!')
      console.log(`📦 Validated ${moduleFiles.length} module files`)
    }
  } catch (error) {
    console.error('❌ Error validating modules:', error)
    process.exit(1)
  }
}

// Run the script
validateModules() 