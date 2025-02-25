import fs from 'fs/promises'
import path from 'path'

const MODULES_DIR = 'public/modules'

// Fisher-Yates shuffle algorithm
function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]]
  }
  return array
}

async function shuffleModules() {
  try {
    const files = await fs.readdir(MODULES_DIR)
    const moduleFiles = files.filter(file => 
      file.endsWith('.json') && 
      file !== 'manifest.json'
    )

    console.log(`📦 Found ${moduleFiles.length} module files to process`)

    for (const file of moduleFiles) {
      const filePath = path.join(MODULES_DIR, file)
      const content = await fs.readFile(filePath, 'utf-8')
      
      try {
        const module = JSON.parse(content)
        let modified = false

        // Process each question
        module.questions = module.questions.map(question => {
          // Handle flashcard questions
          if (question.type === 'flashcards' && Array.isArray(question.options)) {
            // Keep correct answer, shuffle other options
            const correctAnswer = question.correctAnswer
            const otherOptions = question.options.filter(opt => opt !== correctAnswer)
            const shuffledOtherOptions = shuffle([...otherOptions])
            
            // Insert correct answer at random position
            const insertPosition = Math.floor(Math.random() * (shuffledOtherOptions.length + 1))
            shuffledOtherOptions.splice(insertPosition, 0, correctAnswer)
            
            question.options = shuffledOtherOptions
            modified = true
          }
          
          // Handle sentence completion questions
          if (question.type === 'sentence-completion' && Array.isArray(question.words)) {
            question.words = shuffle([...question.words])
            modified = true
          }
          
          // Handle puzzle questions
          if (question.type === 'puzzle' && Array.isArray(question.fragments)) {
            // Keep first fragment, shuffle the rest
            const firstFragment = question.fragments[0]
            const remainingFragments = question.fragments.slice(1)
            question.fragments = [firstFragment, ...shuffle([...remainingFragments])]
            modified = true
          }
          
          return question
        })

        if (modified) {
          // Write back to file with pretty formatting
          await fs.writeFile(
            filePath, 
            JSON.stringify(module, null, 2),
            'utf-8'
          )
          console.log(`✅ Shuffled ${file}`)
        } else {
          console.log(`ℹ️ No changes needed for ${file}`)
        }

      } catch (error) {
        console.error(`❌ Error processing ${file}:`, error.message)
      }
    }

    console.log('\n✨ Finished shuffling modules!')
  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  }
}

// Run the script
shuffleModules() 