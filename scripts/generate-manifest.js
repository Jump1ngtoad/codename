import fs from 'fs/promises'
import path from 'path'

const MODULES_DIR = 'public/modules'
const MANIFEST_PATH = path.join(MODULES_DIR, 'manifest.json')

async function generateManifest() {
  try {
    // Get all .json files in the modules directory
    const files = await fs.readdir(MODULES_DIR)
    const moduleFiles = files.filter(file => 
      file.endsWith('.json') && 
      file !== 'manifest.json'
    )

    // Read and parse each module file
    const modules = await Promise.all(
      moduleFiles.map(async (file) => {
        const content = await fs.readFile(
          path.join(MODULES_DIR, file),
          'utf-8'
        )
        const module = JSON.parse(content)

        // Ensure module ID matches filename (without .json)
        const expectedId = file.replace('.json', '')
        if (module.id !== expectedId) {
          console.warn(`⚠️  Warning: Module ID '${module.id}' doesn't match filename '${expectedId}'. Updating...`)
          module.id = expectedId
          // Update the file with the corrected ID
          await fs.writeFile(
            path.join(MODULES_DIR, file),
            JSON.stringify(module, null, 4)
          )
        }

        return {
          id: module.id,
          title: module.title,
          description: module.description,
          type: module.type
        }
      })
    )

    // Sort modules by ID to maintain consistent order
    modules.sort((a, b) => a.id.localeCompare(b.id))

    // Create manifest content
    const manifest = {
      modules,
      generatedAt: new Date().toISOString()
    }

    // Write manifest file
    await fs.writeFile(
      MANIFEST_PATH,
      JSON.stringify(manifest, null, 2)
    )

    console.log('✅ Manifest generated successfully!')
    console.log(`📦 Total modules: ${modules.length}`)
  } catch (error) {
    console.error('❌ Error generating manifest:', error)
    process.exit(1)
  }
}

// Run the script
generateManifest() 