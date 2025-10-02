"use client"
import { UploadIcon, Cross2Icon, ImageIcon } from "@radix-ui/react-icons"
import { useRef, useState } from "react"
import { ButtonCustom } from "../../../components/Button/ButtonCustom"
import { cn } from "../../../utils/cn"

interface FileUploadButtonProps {
  onFileSelect: (files: FileList | null) => void
  accept?: string
  disabled?: boolean
  uploading?: boolean
  uploadProgress?: number | null
  uploadError?: string | null
  previewUrl?: string | null
  className?: string
}

export function FileUploadButton({
  onFileSelect,
  accept = "image/*",
  disabled = false,
  uploading = false,
  uploadProgress = null,
  uploadError = null,
  previewUrl = null,
  className
}: FileUploadButtonProps) {
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    if (!disabled && !uploading) {
      setIsDragging(true)
    }
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    if (disabled || uploading) return

    const files = e.dataTransfer.files
    if (files && files.length > 0) {
      onFileSelect(files)
    }
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFileSelect(e.target.files)
  }

  const handleButtonClick = () => {
    fileInputRef.current?.click()
  }

  const handleRemoveFile = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
    onFileSelect(null)
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  return (
    <div className={cn("space-y-3", className)}>
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileInputChange}
        disabled={disabled || uploading}
        className="hidden"
      />

      {!previewUrl ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={cn(
            "relative border-2 border-dashed rounded-lg p-6 text-center transition-all duration-200",
            isDragging && !disabled && !uploading
              ? "border-blue-8 bg-blue-2"
              : "border-gray-6 hover:border-gray-8",
            disabled || uploading
              ? "opacity-50 cursor-not-allowed"
              : "cursor-pointer hover:bg-gray-2"
          )}
          onClick={!disabled && !uploading ? handleButtonClick : undefined}
        >
          <div className="space-y-3">
            <div className="flex justify-center">
              {uploading ? (
                <div className="relative">
                  <div className="w-10 h-10 border-2 border-gray-6 rounded-full animate-spin border-t-blue-9"></div>
                </div>
              ) : (
                <UploadIcon className="w-10 h-10 text-gray-9" />
              )}
            </div>

            <div className="space-y-1">
              <div className="text-sm font-medium text-gray-12">
                {uploading ? "Uploading..." : "Upload a photo"}
              </div>
              <div className="text-xs text-gray-9">
                {uploading
                  ? uploadProgress !== null
                    ? `${uploadProgress}% complete`
                    : "Processing..."
                  : "Drag and drop or click to browse"
                }
              </div>
              <div className="text-xs text-gray-8">
                PNG, JPG up to 10MB
              </div>
            </div>

            {uploading && uploadProgress !== null && (
              <div className="w-full bg-gray-3 rounded-full h-2 mt-3">
                <div
                  className="bg-blue-9 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="relative border border-gray-6 rounded-lg overflow-hidden">
          <div className="relative">
            <img
              src={previewUrl}
              alt="Uploaded preview"
              className="w-full h-40 object-cover"
            />
            
          </div>
          <div className="p-3 bg-gray-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-gray-9" />
                <span className="text-sm text-gray-11">Photo stored on Filecoin</span>
              </div>
              <a
                href={previewUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-9 hover:text-blue-10 underline cursor-pointer transition-colors"
              >
                View on Filecoin
              </a>
            </div>
          </div>
        </div>
      )}

      {uploadError && (
        <div className="flex items-center gap-2 p-3 bg-red-2 border border-red-6 rounded-lg">
          <Cross2Icon className="w-4 h-4 text-red-9 flex-shrink-0" />
          <div className="text-sm text-red-11">{uploadError}</div>
        </div>
      )}
    </div>
  )
}