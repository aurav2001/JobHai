const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../services/cloudinary');

const resumeStorage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: 'jobhai/resumes',
        allowed_formats: ['pdf', 'doc', 'docx'],
        resource_type: 'raw',
    },
});

const avatarStorage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: 'jobhai/avatars',
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
        transformation: [{ width: 400, height: 400, crop: 'fill' }],
    },
});

const uploadResume = multer({
    storage: resumeStorage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: (req, file, cb) => {
        const allowed = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
        if (allowed.includes(file.mimetype)) cb(null, true);
        else cb(new Error('Only PDF and Word documents are allowed'));
    },
});

const uploadAvatar = multer({
    storage: avatarStorage,
    limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) cb(null, true);
        else cb(new Error('Only image files are allowed'));
    },
});

module.exports = { uploadResume, uploadAvatar };
