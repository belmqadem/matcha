import multer from "multer";
import AppError from "../utils/AppError.js";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_MIME_TYPES.has(file.mimetype)) {
      return cb(null, true);
    }

    return cb(new AppError("Invalid file type", 400));
  },
});

const uploadSinglePhoto = (req, res, next) => {
  upload.single("photo")(req, res, (err) => {
    if (!err) {
      return next();
    }

    if (err.name === "MulterError" && err.code === "LIMIT_UNEXPECTED_FILE") {
      return next(new AppError("Unexpected file field", 400));
    }

    if (err.code === "LIMIT_FILE_SIZE") {
      return next(new AppError("File exceeds 5MB limit", 400));
    }

    return next(err);
  });
};

export default uploadSinglePhoto;
