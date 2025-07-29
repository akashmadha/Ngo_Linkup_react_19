import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Modal } from "../../ui/modal";
import Button from "../../ui/button/Button";
import Label from "../../form/Label";
import Input from "../../form/input/InputField";

interface DocumentUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  memberId: number;
  memberName: string;
  onUploadSuccess?: () => void;
}

interface UploadedFile {
  file: File;
  preview?: string;
}

export default function DocumentUploadModal({
  isOpen,
  onClose,
  memberId,
  memberName,
  onUploadSuccess
}: DocumentUploadModalProps) {
  const [documentName, setDocumentName] = useState("");
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      setUploadedFile({ file });
      setError("");
      
      // Auto-generate document name if not provided
      if (!documentName) {
        setDocumentName(file.name.replace(/\.[^/.]+$/, "")); // Remove extension
      }
    }
  }, [documentName]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "image/jpeg": [".jpg", ".jpeg"],
      "image/png": [".png"],
      "image/gif": [".gif"],
      "application/msword": [".doc"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
      "application/vnd.ms-excel": [".xls"],
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024, // 10MB
  });

  const handleUpload = async () => {
    if (!uploadedFile || !documentName.trim()) {
      setError("Please select a file and provide a document name");
      return;
    }

    setUploading(true);
    setError("");

    try {
      const adminId = localStorage.getItem("userId");
      
      if (!adminId) {
        setError("Admin authentication required. Please login again.");
        return;
      }

      const formData = new FormData();
      formData.append("document", uploadedFile.file);
      formData.append("documentName", documentName.trim());
      formData.append("documentType", uploadedFile.file.type);

      const response = await fetch(`http://localhost:3001/api/admin/member/${memberId}/documents`, {
        method: "POST",
        headers: {
          'user-id': adminId
        },
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        // Reset form
        setDocumentName("");
        setUploadedFile(null);
        onUploadSuccess?.();
        onClose();
      } else {
        setError(data.error || "Upload failed");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    setDocumentName("");
    setUploadedFile(null);
    setError("");
    onClose();
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <div className="w-full max-w-md mx-auto p-6">
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-2">
            Upload Document
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Upload a document for <span className="font-medium">{memberName}</span>
          </p>
        </div>

        <div className="space-y-4">
          {/* Document Name Input */}
          <div>
            <Label>
              Document Name <span className="text-error-500">*</span>
            </Label>
            <Input
              placeholder="Enter document name"
              value={documentName}
              onChange={(e) => setDocumentName(e.target.value)}
            />
          </div>

          {/* File Upload Area */}
          <div>
            <Label>Document File <span className="text-error-500">*</span></Label>
            <div
              {...getRootProps()}
              className={`mt-2 transition border border-gray-300 border-dashed cursor-pointer dark:hover:border-brand-500 dark:border-gray-700 rounded-xl hover:border-brand-500 ${
                isDragActive
                  ? "border-brand-500 bg-gray-100 dark:bg-gray-800"
                  : "border-gray-300 bg-gray-50 dark:border-gray-700 dark:bg-gray-900"
              }`}
            >
              <input {...getInputProps()} />
              
              {uploadedFile ? (
                <div className="p-4 text-center">
                  <div className="flex items-center justify-center mb-2">
                    <div className="w-12 h-12 bg-brand-100 dark:bg-brand-900 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-brand-600 dark:text-brand-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                  </div>
                  <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                    {uploadedFile.file.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {formatFileSize(uploadedFile.file.size)}
                  </p>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setUploadedFile(null);
                    }}
                    className="mt-2 text-xs text-error-500 hover:text-error-600"
                  >
                    Remove file
                  </button>
                </div>
              ) : (
                <div className="p-6 text-center">
                  <div className="mb-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-200 text-gray-700 dark:bg-gray-800 dark:text-gray-400 mx-auto">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                    </div>
                  </div>
                  <h4 className="mb-2 font-semibold text-gray-800 text-theme-sm dark:text-white/90">
                    {isDragActive ? "Drop File Here" : "Drag & Drop File Here"}
                  </h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                    PDF, Images, Word, Excel files (max 10MB)
                  </p>
                  <span className="text-xs font-medium text-brand-500">
                    Browse File
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="text-error-500 text-sm bg-error-50 dark:bg-error-900/20 p-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={uploading}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpload}
              disabled={!uploadedFile || !documentName.trim() || uploading}
              className="flex-1"
            >
              {uploading ? "Uploading..." : "Upload Document"}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
} 