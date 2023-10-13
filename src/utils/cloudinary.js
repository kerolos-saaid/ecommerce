import path from 'path'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'
//set directory dirname 
const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.join(__dirname, '../../config/.env') })
import cloudinary from 'cloudinary';


cloudinary.v2.config({
    api_key: process.env.CLOUDINARY_KEY,
    api_secret: process.env.CLOUDINARY_SECRET,
    cloud_name: process.env.CLOUDINARY_NAME,
    secure: true
})

export default cloudinary.v2;