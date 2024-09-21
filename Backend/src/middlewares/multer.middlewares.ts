import multer, { FileFilterCallback } from 'multer';
import path from 'path';

const storage = multer.diskStorage({
  destination: './public/temp',
  filename: (req, file, cb) => {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10000000 }, // Limit file size to 10MB
  fileFilter: (req, file, cb: FileFilterCallback) => {
    checkFileType(file, cb);
  },
}).single('file');

interface File {
  originalname: string;
  mimetype: string;
}

function checkFileType(file: File, cb: FileFilterCallback) {
  const filetypes = /jpeg|jpg|png|gif|svg|mp4|avi|mkv|webm|mov|mp3|wav|ogg|m4a|opus/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    cb(null, true); // File is accepted
  } else {
    cb(new Error('Error: File type not supported')); // Reject file with an error
  }
}

export { upload };
