// lib/cloudinary.ts
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default cloudinary;

// Upload file to Cloudinary
export async function uploadToCloudinary(
  file: Buffer,
  folder: string,
  resourceType: 'auto' | 'image' | 'video' | 'raw' = 'auto'
) {
  try {
    const base64 = file.toString('base64');
    const dataURI = `data:application/octet-stream;base64,${base64}`;
    
    const result = await cloudinary.uploader.upload(dataURI, {
      folder: folder,
      resource_type: resourceType,
    });
    
    return {
      url: result.secure_url,
      publicId: result.public_id,
      size: result.bytes,
      format: result.format,
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw error;
  }
}

// Delete file from Cloudinary
export async function deleteFromCloudinary(publicId: string) {
  try {
    await cloudinary.uploader.destroy(publicId);
    return true;
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    return false;
  }
}