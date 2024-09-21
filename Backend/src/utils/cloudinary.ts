import { v2 as cloudinary, UploadApiOptions } from 'cloudinary';
import fs from 'fs';

// cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath: string, format: string) => {
  console.log('file is uploading on cloudinary : ', localFilePath);
  console.log('format', format);
  try {
    if (!localFilePath) return null;

    let resourceType = 'auto';
    if (['mp4', 'avi', 'mkv', 'mov', 'webm'].includes(format)) {
      resourceType = 'video';
    } else if (['mp3', 'wav', 'ogg', 'm4a', 'opus'].includes(format)) {
      resourceType = 'video'; // Cloudinary treats audio files as video resource type
    } else if (['jpeg', 'jpg', 'png', 'gif', 'svg'].includes(format)) {
      resourceType = 'image';
    }

    type ResourceType = 'auto' | 'image' | 'video';

    // upload file on cloudinary
    // format is important (error occurred webm extension for camera)
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: resourceType as ResourceType,
      format: format,
    });
    // file has been uploaded
    // console.log("file is uploaded on cloudinary : ",response.url)
    fs.unlinkSync(localFilePath);
    return response;
  } catch (error) {
    // remove the locally saved file as the upload operation failed
    fs.unlinkSync(localFilePath);
    return null;
  }
};

export { uploadOnCloudinary };
