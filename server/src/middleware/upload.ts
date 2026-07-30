// ──────────────────────────────────────────────
// Multer File Upload Configuration
// ──────────────────────────────────────────────

import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { Request, Response, NextFunction } from 'express';
import { env } from '../config/env';

// Ensure upload directory exists
if (!fs.existsSync(env.UPLOAD_DIR)) {
  fs.mkdirSync(env.UPLOAD_DIR, { recursive: true });
}

// Allowed MIME types for receipts and documents
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/csv',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
];

// Storage configuration
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, env.UPLOAD_DIR);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueName = `${uuidv4()}${ext}`;
    cb(null, uniqueName);
  },
});

// File filter
function fileFilter(
  _req: Express.Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
): void {
  if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`File type ${file.mimetype} is not allowed. Allowed types: images, PDF, DOC, XLS, CSV`));
  }
}

// Create the multer instance
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: env.MAX_FILE_SIZE,
    files: 5, // Max 5 files per upload
  },
});

// Single file upload middleware
export const uploadSingle = (fieldName: string = 'file') => {
  return upload.single(fieldName);
};

// Multiple files upload middleware
export const uploadMultiple = (fieldName: string = 'files', maxCount: number = 5) => {
  return upload.array(fieldName, maxCount);
};

// Error handler for multer errors
export function handleMulterError(
  err: Error,
  _req: Request,
  res: Response,
  next: NextFunction
): void {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      res.status(400).json({
        success: false,
        error: 'File Too Large',
        message: `File exceeds maximum size of ${env.MAX_FILE_SIZE / 1024 / 1024}MB`,
      });
      return;
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      res.status(400).json({
        success: false,
        error: 'Too Many Files',
        message: 'Exceeded maximum number of files',
      });
      return;
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      res.status(400).json({
        success: false,
        error: 'Unexpected File Field',
        message: err.message,
      });
      return;
    }
    res.status(400).json({
      success: false,
      error: 'Upload Error',
      message: err.message,
    });
    return;
  }

  if (err.message?.includes('File type')) {
    res.status(400).json({
      success: false,
      error: 'Invalid File Type',
      message: err.message,
    });
    return;
  }

  next(err);
}
