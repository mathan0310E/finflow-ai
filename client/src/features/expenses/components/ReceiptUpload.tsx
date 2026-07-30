'use client'

import { useState, useCallback, useRef, type ChangeEvent, type DragEvent } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Upload,
  X,
  FileText,
  Image as ImageIcon,
  Loader2,
  ScanLine,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react'

import { cn } from '@/lib/cn'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { ALLOWED_DOCUMENT_TYPES, FILE_SIZE_LIMITS } from '@/constants'

// 
// Types
// 

export interface ReceiptFile {
  file: File
  previewUrl: string
  progress: number
  status: 'pending' | 'uploading' | 'ocr_processing' | 'complete' | 'error'
  error?: string
}

export interface ReceiptUploadProps {
  value?: ReceiptFile | null
  onChange?: (receipt: ReceiptFile | null) => void
  onUpload?: (file: File) => Promise<void>
  isUploading?: boolean
  isOcrProcessing?: boolean
  className?: string
  error?: string
}

// 
// Constants
// 

const ALLOWED_TYPES = ALLOWED_DOCUMENT_TYPES
const MAX_SIZE = FILE_SIZE_LIMITS.RECEIPT
const MAX_SIZE_MB = MAX_SIZE / (1024 * 1024)

// 
// Component
// 

export function ReceiptUpload({
  value,
  onChange,
  onUpload,
  isUploading = false,
  isOcrProcessing = false,
  className,
  error: externalError,
}: ReceiptUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [internalError, setInternalError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const error = externalError ?? internalError

  const validateFile = useCallback((file: File): string | null => {
    if (!ALLOWED_TYPES.includes(file.type as any)) {
      return 'Unsupported file type. Allowed: JPG, PNG, PDF'
    }
    if (file.size > MAX_SIZE) {
      return 'File too large. Maximum size is ' + MAX_SIZE_MB + ' MB'
    }
    return null
  }, [])

  const handleFile = useCallback(
    (file: File) => {
      const validationError = validateFile(file)
      if (validationError) {
        setInternalError(validationError)
        return
      }

      setInternalError(null)

      const previewUrl = URL.createObjectURL(file)

      const receiptFile: ReceiptFile = {
        file,
        previewUrl,
        progress: 0,
        status: 'pending',
      }

      onChange?.(receiptFile)

      if (onUpload) {
        receiptFile.status = 'uploading'
        onChange?.({ ...receiptFile })
        onUpload(file).catch(() => {
          onChange?.(null)
        })
      }
    },
    [validateFile, onChange, onUpload],
  )

  const handleDragOver = useCallback((e: DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback(
    (e: DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDragging(false)

      const files = e.dataTransfer.files
      if (files.length > 0) {
        handleFile(files[0])
      }
    },
    [handleFile],
  )

  const handleBrowseClick = useCallback(() => {
    inputRef.current?.click()
  }, [])

  const handleInputChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files
      if (files && files.length > 0) {
        handleFile(files[0])
      }
      e.target.value = ''
    },
    [handleFile],
  )

  const handleRemove = useCallback(() => {
    if (value?.previewUrl) {
      URL.revokeObjectURL(value.previewUrl)
    }
    onChange?.(null)
    setInternalError(null)
  }, [value, onChange])

  const isPdf = value?.file.type === 'application/pdf'
  const showDropZone = !value || error

  return (
    <div className={cn('w-full', className)}>
      <AnimatePresence mode="wait">
        {showDropZone ? (
          <motion.div
            key="dropzone"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.2 }}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={handleBrowseClick}
            className={cn(
              'relative flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-8 text-center transition-all duration-200',
              isDragging
                ? 'border-blue-400 bg-blue-50 dark:border-blue-500 dark:bg-blue-950/30'
                : 'border-gray-300 bg-gray-50 hover:border-gray-400 hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-800/50 dark:hover:border-gray-500 dark:hover:bg-gray-800',
            )}
          >
            <motion.div
              animate={isDragging ? { scale: 1.1 } : { scale: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 15 }}
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400">
                <Upload className="h-6 w-6" />
              </div>
            </motion.div>

            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {isDragging ? 'Drop your receipt here' : 'Drag & drop your receipt here'}
              </p>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                or click to browse &middot; JPG, PNG, PDF up to {MAX_SIZE_MB} MB
              </p>
            </div>

            <input
              ref={inputRef}
              type="file"
              accept=".jpg,.jpeg,.png,.pdf,image/jpeg,image/png,application/pdf"
              className="hidden"
              onChange={handleInputChange}
            />

            <Button type="button" variant="secondary" size="sm">
              <Upload className="h-4 w-4" />
              Browse Files
            </Button>

            {error && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-1.5 text-xs text-red-500 dark:text-red-400"
              >
                <AlertCircle className="h-3.5 w-3.5" />
                {error}
              </motion.p>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="preview"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="relative overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800"
          >
            {/* Preview */}
            <div className="flex items-center gap-4 p-4">
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-700">
                {isPdf ? (
                  <div className="flex h-full w-full items-center justify-center text-red-500">
                    <FileText className="h-8 w-8" />
                  </div>
                ) : (
                  <img
                    src={value.previewUrl}
                    alt="Receipt preview"
                    className="h-full w-full object-cover"
                  />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-gray-900 dark:text-gray-100">
                  {value.file.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {(value.file.size / 1024).toFixed(1)} KB
                </p>

                {(value.status === 'uploading' || isUploading) && (
                  <div className="mt-2">
                    <Progress value={value.progress} className="h-1.5" />
                    <p className="mt-0.5 text-xs text-blue-500">Uploading...</p>
                  </div>
                )}

                {value.status === 'ocr_processing' && (
                  <div className="mt-2 flex items-center gap-2">
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-purple-500" />
                    <span className="text-xs text-purple-500">OCR processing...</span>
                  </div>
                )}

                {value.status === 'complete' && (
                  <div className="mt-2 flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                    <span className="text-xs text-green-600 dark:text-green-400">Uploaded & processed</span>
                  </div>
                )}

                {value.status === 'error' && value.error && (
                  <p className="mt-1 text-xs text-red-500">{value.error}</p>
                )}
              </div>

              <button
                type="button"
                onClick={handleRemove}
                className="shrink-0 rounded-full p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
