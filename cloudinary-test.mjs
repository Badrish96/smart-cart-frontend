import { v2 as cloudinary } from 'cloudinary'

// ── Step 1: Configure Cloudinary ─────────────────────────────────────────────
cloudinary.config({
  cloud_name: 'dngdl83of',
  api_key:    '724541974262354',
  api_secret: 'q-07fQfp2TFMeRZhbRzdzfGklRw',
})

// ── Step 2: Upload a sample image ────────────────────────────────────────────
console.log('Uploading image...')

const uploadResult = await cloudinary.uploader.upload(
  'https://res.cloudinary.com/demo/image/upload/sample.jpg',
  { public_id: 'smartcart_sample' }
)

console.log('\n✅ Upload complete')
console.log('   Secure URL :', uploadResult.secure_url)
console.log('   Public ID  :', uploadResult.public_id)

// ── Step 3: Get image details ─────────────────────────────────────────────────
console.log('\nFetching image details...')

const details = await cloudinary.api.resource(uploadResult.public_id)

console.log('\n📋 Image details')
console.log('   Width  :', details.width, 'px')
console.log('   Height :', details.height, 'px')
console.log('   Format :', details.format)
console.log('   Size   :', details.bytes, 'bytes')

// ── Step 4: Transform the image ───────────────────────────────────────────────
const transformedUrl = cloudinary.url(uploadResult.public_id, {
  transformation: [
    { fetch_format: 'auto' },  // f_auto — serves WebP/AVIF/JPEG depending on the browser
    { quality: 'auto' },       // q_auto — picks the best quality level to keep file size small
  ],
  secure: true,
})

console.log('\n✨ Done! Click link below to see optimized version of the image.')
console.log('   Check the size and the format.')
console.log('\n   Transformed URL:', transformedUrl)
