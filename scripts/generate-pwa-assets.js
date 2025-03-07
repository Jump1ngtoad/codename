import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const IMAGES_DIR = path.join(__dirname, '../public/images')

// List of required PWA icons with their sizes
const PWA_ICONS = [
  // Standard icons
  { name: 'icon-192x192.png', size: 192 },
  { name: 'icon-512x512.png', size: 512 },
  
  // Maskable icons (with padding for safe area)
  { name: 'icon-maskable-192x192.png', size: 192, maskable: true },
  { name: 'icon-maskable-512x512.png', size: 512, maskable: true },
  
  // iOS specific icons
  { name: 'apple-icon-152x152.png', size: 152 },
  { name: 'apple-icon-167x167.png', size: 167 },
  { name: 'apple-icon-180x180.png', size: 180 },
  
  // iOS splash screens
  { name: 'apple-splash-2048-2732.png', width: 2048, height: 2732 },
  { name: 'apple-splash-1668-2388.png', width: 1668, height: 2388 },
  { name: 'apple-splash-1536-2048.png', width: 1536, height: 2048 },
  { name: 'apple-splash-1125-2436.png', width: 1125, height: 2436 },
  { name: 'apple-splash-1242-2688.png', width: 1242, height: 2688 },
  { name: 'apple-splash-828-1792.png', width: 828, height: 1792 },
  { name: 'apple-splash-750-1334.png', width: 750, height: 1334 },
]

async function generatePWAAssets() {
  try {
    // Check if the images directory exists
    try {
      await fs.access(IMAGES_DIR)
    } catch (error) {
      console.log('Creating images directory...')
      await fs.mkdir(IMAGES_DIR, { recursive: true })
    }

    // Generate a checklist of required icons
    console.log('PWA Assets Checklist:')
    console.log('=====================')
    
    for (const icon of PWA_ICONS) {
      const iconPath = path.join(IMAGES_DIR, icon.name)
      let exists = false
      
      try {
        await fs.access(iconPath)
        exists = true
      } catch (error) {
        // File doesn't exist
      }
      
      if (icon.width && icon.height) {
        console.log(`${exists ? '✅' : '❌'} ${icon.name} (${icon.width}x${icon.height})`)
      } else {
        console.log(`${exists ? '✅' : '❌'} ${icon.name} (${icon.size}x${icon.size})${icon.maskable ? ' (maskable)' : ''}`)
      }
    }
    
    console.log('\nInstructions:')
    console.log('1. Use your source image (favicon.png) to create these icons')
    console.log('2. For maskable icons, ensure the main content is within the safe area (centered 80%)')
    console.log('3. For splash screens, use a centered logo on a solid background')
    console.log('\nYou can use tools like:')
    console.log('- https://maskable.app/editor for maskable icons')
    console.log('- https://appsco.pe/developer/splash-screens for iOS splash screens')
    
  } catch (error) {
    console.error('Error generating PWA assets checklist:', error)
  }
}

// Run the script
generatePWAAssets() 