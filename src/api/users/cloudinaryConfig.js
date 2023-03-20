import cloudinary from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer from "multer";

// Cloudinary configuration
cloudinary.v2.config({
    cloudinary_url: process.env.CLOUDINARY_URL,
});

// Multer configuration with Cloudinary storage
const storage = new CloudinaryStorage({
    cloudinary: cloudinary.v2,
    params: {
        folder: "LinkedIn-BE-Users", // The name of the folder in Cloudinary
        allowed_formats: ["jpg", "png"],
        transformation: [{ width: 500, height: 500, crop: "limit" }],
    },
});

const upload = multer({ storage });

export default upload;
