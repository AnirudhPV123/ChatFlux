import multer from 'multer';
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
  fileFilter: (req, file, cb) => {
    console.log("filleeee:",file)
    checkFileType(file, cb);
  },
}).single('file');

function checkFileType(file, cb) {
  // file types
  // images - jpeg, jpg, png, gif, svg
  // video - mp4, avi, mkv, mov
  // audio - mp3, wav, ogg, m4a
  const filetypes = /jpeg|jpg|png|gif|svg|mp4|avi|mkv|webm|mov|mp3|wav|ogg|m4a|opus/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb('Error: File type not supported.');
  }
}

export { upload };
 