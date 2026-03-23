import multer from "multer";

const storage = multer.memoryStorage();

export const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
  fileFilter: (req, file, cb) => {
    const allowedTypes = {
      "audio/mpeg": true,
      "audio/wav": true,
      "image/jpeg": true,
      "image/png": true,
      "image/webp": true,
    };
    allowedTypes[file.mimetype]
      ? cb(null, true)
      : cb(new Error(`File type ${file.mimetype} not allowed`));
  },
});