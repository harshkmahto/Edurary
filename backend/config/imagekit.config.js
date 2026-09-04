import ImageKit from "imagekit";
import config from "../config/config.js";

const imagekit = new ImageKit({
    publicKey: config.IMAGEKIT_PUBLIC_KEY,
    privateKey: config.IMAGEKIT_PRIVATE_KEY,
    urlEndpoint: config.IMAGEKIT_URL_ENDPOINT
});

// Upload image
export const uploadImage = async (file, folder = "profiles") => {
    try {
        let fileData = file;
        if (file.buffer) {
            fileData = file.buffer.toString('base64');
        }

        const result = await imagekit.upload({
            file: fileData,
            fileName: `${Date.now()}_${Math.random().toString(36).substring(7)}.jpg`,
            folder: folder,
            useUniqueFileName: true,
            isPrivateFile: false,
            tags: ['image']
        });

        return {
            success: true,
            url: result.url,
            fileId: result.fileId,
            thumbnailUrl: result.thumbnailUrl,
            name: result.name,
            size: result.size
        };
    } catch (error) {
        console.error('ImageKit upload error:', error);
        throw new Error('Failed to upload image');
    }
};

// Upload file (PDF, EPUB, etc.)
export const uploadFile = async (file, folder = "books/content") => {
    try {
        let fileData = file;
        if (file.buffer) {
            fileData = file.buffer.toString('base64');
        }

        // Get file extension
        const originalName = file.originalname || file.name || 'file';
        const extension = originalName.split('.').pop().toLowerCase();
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${extension}`;

        const result = await imagekit.upload({
            file: fileData,
            fileName: fileName,
            folder: folder,
            useUniqueFileName: true,
            isPrivateFile: false,
            tags: ['book', 'document', extension]
            // REMOVED customMetadata - this was causing the error
        });

        return {
            success: true,
            url: result.url,
            fileId: result.fileId,
            name: result.name,
            size: result.size,
            format: extension,
            sizeInMB: (result.size / (1024 * 1024)).toFixed(2)
        };
    } catch (error) {
        console.error('ImageKit file upload error:', error);
        throw new Error('Failed to upload file');
    }
};

// Delete file
export const deleteFile = async (fileId) => {
    try {
        if (!fileId) return { success: true };
        
        const result = await imagekit.deleteFile(fileId);
        return {
            success: true,
            result
        };
    } catch (error) {
        console.error('ImageKit delete error:', error);
        return { success: false, error: error.message };
    }
};

// Delete image (alias for deleteFile)
export const deleteImage = async (fileId) => {
    return deleteFile(fileId);
};

// Update image
export const updateImage = async (oldFileId, newFile, folder = "profiles") => {
    try {
        if (oldFileId) {
            await deleteFile(oldFileId);
        }
        
        const uploadResult = await uploadImage(newFile, folder);
        return uploadResult;
    } catch (error) {
        console.error('Image update error:', error);
        throw new Error('Failed to update image');
    }
};

// Update file
export const updateFile = async (oldFileId, newFile, folder = "books/content") => {
    try {
        if (oldFileId) {
            await deleteFile(oldFileId);
        }
        
        const uploadResult = await uploadFile(newFile, folder);
        return uploadResult;
    } catch (error) {
        console.error('File update error:', error);
        throw new Error('Failed to update file');
    }
};

// Get optimized image URL
export const getOptimizedImageUrl = (url, width = 200, height = 200) => {
    if (!url) return null;

    const transformation = `tr:w-${width},h-${height},c-maintain_ratio`;
    
    if (url.includes('tr:')) {
        return url;
    }

    const urlParts = url.split('/upload/');
    if (urlParts.length === 2) {
        return `${urlParts[0]}/upload/${transformation}/${urlParts[1]}`;
    }
    
    return url;
};

export default {
    uploadImage,
    uploadFile,
    deleteFile,
    deleteImage,
    updateImage,
    updateFile,
    getOptimizedImageUrl
};