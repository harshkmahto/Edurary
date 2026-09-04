import multer from 'multer';
import path from 'path';

const storage = multer.memoryStorage();

const imageFilter = (req, file, cb) => {
    const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    
    if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Only image files (jpeg, jpg, png, gif, webp) are allowed'), false);
    }
};

const fileFilter = (req, file, cb) => {
    const allowedMimeTypes = [
        'application/pdf',
        'application/epub+zip',
        'application/x-mobipocket-ebook',
        'application/vnd.amazon.ebook',
        'application/octet-stream',
        'text/plain'
    ];
    
    const allowedExtensions = ['.pdf', '.epub', '.mobi', '.azw', '.azw3', '.txt'];
    const fileExtension = path.extname(file.originalname).toLowerCase();
    
    if (allowedMimeTypes.includes(file.mimetype) || allowedExtensions.includes(fileExtension)) {
        cb(null, true);
    } else {
        cb(new Error('Only document files (PDF, EPUB, MOBI, AZW, TXT) are allowed'), false);
    }
};


const bookFileFilter = (req, file, cb) => {
    // Check if the field is 'thumbnail' - apply image filter
    if (file.fieldname === 'thumbnail') {
        const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        if (allowedMimeTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Only image files (jpeg, jpg, png, gif, webp) are allowed for thumbnail'), false);
        }
    } 
    // Check if the field is 'content' - apply document filter
    else if (file.fieldname === 'content') {
        const allowedMimeTypes = [
            'application/pdf',
            'application/epub+zip',
            'application/x-mobipocket-ebook',
            'application/vnd.amazon.ebook',
            'application/octet-stream',
            'text/plain'
        ];
        
        const allowedExtensions = ['.pdf', '.epub', '.mobi', '.azw', '.azw3', '.txt'];
        const fileExtension = path.extname(file.originalname).toLowerCase();
        
        if (allowedMimeTypes.includes(file.mimetype) || allowedExtensions.includes(fileExtension)) {
            cb(null, true);
        } else {
            cb(new Error('Only document files (PDF, EPUB, MOBI, AZW, TXT) are allowed for content'), false);
        }
    } 
    else {
        cb(new Error('Unexpected field'), false);
    }
};

// Single multer instance for book uploads
export const uploadBook = multer({
    storage: storage,
    limits: { 
        fileSize: 50 * 1024 * 1024, // 50MB max (enough for both thumbnail and content)
    },
    fileFilter: bookFileFilter
});


export const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: imageFilter
});

export const uploadMultiple = multer({
    storage: storage,
    limits: { 
        fileSize: 5 * 1024 * 1024, // 5MB per file
        files: 5 
    },
    fileFilter: imageFilter
});

export const uploadFile = multer({
    storage: storage,
    limits: { 
        fileSize: 50 * 1024 * 1024 // 50MB - can adjust as needed
    },
    fileFilter: fileFilter
});

export const uploadMultipleFiles = multer({
    storage: storage,
    limits: { 
        fileSize: 50 * 1024 * 1024, // 50MB per file
        files: 10 // Max 10 files
    },
    fileFilter: fileFilter
});



export const uploadCourse = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024, 
    },
    fileFilter: (req, file, cb) => {
        if (file.fieldname === 'thumbnail' || file.fieldname === 'instructorProfiles') {
            const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
            if (allowedMimeTypes.includes(file.mimetype)) {
                cb(null, true);
            } else {
                cb(new Error('Only image files (jpeg, jpg, png, gif, webp) are allowed'), false);
            }
        } else {
            cb(new Error('Unexpected field'), false);
        }
    }
});