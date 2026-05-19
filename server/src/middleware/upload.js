import multer from "multer";
import crypto from "crypto";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import AppError from "../utils/AppError.js";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const EXTENSIONS = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
};

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadsDir = path.resolve(__dirname, "..", "uploads");
fs.mkdirSync(uploadsDir, { recursive: true });

const upload = multer({
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 1,
  },
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
      return cb(
        new AppError("Only JPEG, PNG and WebP images are allowed", 400),
      );
    }

    return cb(null, true);
  },
  storage: multer.diskStorage({
    destination: uploadsDir,
    filename: (_req, file, cb) => {
      const ext = EXTENSIONS[file.mimetype];
      cb(null, `${crypto.randomUUID()}${ext}`);
    },
  }),
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
