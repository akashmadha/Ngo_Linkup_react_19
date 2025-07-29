import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PageMeta from "../../components/common/PageMeta";
import ComponentCard from "../../components/common/ComponentCard";
import Badge from "../../components/ui/badge/Badge";
import Button from "../../components/ui/button/Button";
import { Modal } from "../../components/ui/modal";

interface MemberDocument {
  id: number;
  document_name: string;
  file_path: string;
  file_type: string;
  file_size: number;
  created_at: string;
}

export default function MemberDocuments() {
  const [documents, setDocuments] = useState<MemberDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showInactiveModal, setShowInactiveModal] = useState(false);
  const [downloadingDoc, setDownloadingDoc] = useState<number | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const userId = localStorage.getItem("userId");
      
      if (!userId) {
        navigate("/signin");
        return;
      }

      const response = await fetch("http://localhost:3001/api/member/documents", {
        headers: {
          'user-id': userId
        }
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setDocuments(data.data || []);
      } else if (response.status === 403) {
        // Account is inactive
        setShowInactiveModal(true);
      } else {
        setError(data.error || "Failed to fetch documents");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDocumentDownload = async (documentId: number, documentName: string) => {
    try {
      setDownloadingDoc(documentId);
      const userId = localStorage.getItem("userId");
      
      if (!userId) {
        navigate("/signin");
        return;
      }

      const response = await fetch(`http://localhost:3001/api/member/documents/${documentId}`, {
        headers: {
          'user-id': userId
        }
      });
      
      if (response.ok) {
        // Get the blob from the response
        const blob = await response.blob();
        
        // Create a download link
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        
        // Set filename with proper extension
        const fileName = documentName + getFileExtension(response.headers.get('content-type') || '');
        link.download = fileName;
        
        // Trigger download
        document.body.appendChild(link);
        link.click();
        
        // Cleanup
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } else {
        const data = await response.json();
        if (response.status === 403) {
          setShowInactiveModal(true);
        } else {
          alert(data.error || "Failed to download document");
        }
      }
    } catch (err) {
      alert("Network error. Please try again.");
    } finally {
      setDownloadingDoc(null);
    }
  };

  const getFileExtension = (contentType: string) => {
    switch (contentType) {
      case 'application/pdf':
        return '.pdf';
      case 'image/jpeg':
      case 'image/jpg':
        return '.jpg';
      case 'image/png':
        return '.png';
      case 'image/gif':
        return '.gif';
      case 'application/msword':
        return '.doc';
      case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        return '.docx';
      case 'application/vnd.ms-excel':
        return '.xls';
      case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
        return '.xlsx';
      default:
        return '';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.includes('pdf')) return '📄';
    if (fileType.includes('image')) return '🖼️';
    if (fileType.includes('word')) return '📝';
    if (fileType.includes('excel')) return '📊';
    return '📎';
  };

  const handleLogout = () => {
    localStorage.removeItem("userId");
    navigate("/signin");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500 dark:text-gray-400">Loading documents...</div>
      </div>
    );
  }

  if (error && !showInactiveModal) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-error-500">{error}</div>
      </div>
    );
  }

  return (
    <>
      <PageMeta
        title="My Documents | NGO Linkup"
        description="View and download your organization documents"
      />
      
      <div className="max-w-3xl mx-auto px-4 w-full space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-800 dark:text-white/90">
              My Documents
            </h1>
            <p className="text-gray-500 dark:text-gray-400">
              Secure access to your organization documents
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => navigate("/member-dashboard")}
            >
              Back to Dashboard
            </Button>
            <Button
              variant="outline"
              onClick={handleLogout}
              className="text-error-600 border-error-600 hover:bg-error-50"
            >
              Logout
            </Button>
          </div>
        </div>

        {/* Documents Section */}
        <ComponentCard title="Your Documents">
          {documents.length > 0 ? (
            <div className="space-y-4">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50"
                >
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">
                      {getFileIcon(doc.file_type)}
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white/90">
                        {doc.document_name}
                      </h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {formatFileSize(doc.file_size)} • Uploaded {formatDate(doc.created_at)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge
                      size="sm"
                      color="success"
                    >
                      Secure Download
                    </Badge>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDocumentDownload(doc.id, doc.document_name)}
                      disabled={downloadingDoc === doc.id}
                    >
                      {downloadingDoc === doc.id ? "Downloading..." : "Download"}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-4xl mb-4">📄</div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white/90 mb-2">
                No documents available
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                Documents uploaded by administrators will appear here.
              </p>
            </div>
          )}
        </ComponentCard>

        {/* Security Notice */}
        <ComponentCard title="Security Information">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <div className="flex items-start gap-3">
              <div className="text-blue-600 dark:text-blue-400 text-xl">🔒</div>
              <div>
                <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-1">
                  Secure Document Access
                </h4>
                <p className="text-sm text-blue-700 dark:text-blue-200">
                  All document downloads are secured and logged. Only active account holders can access their documents. 
                  Downloads are tracked for security purposes.
                </p>
              </div>
            </div>
          </div>
        </ComponentCard>
      </div>

      {/* Inactive Account Modal */}
      <Modal isOpen={showInactiveModal} onClose={() => {}} showCloseButton={false}>
        <div className="w-full max-w-md mx-auto p-6 text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-4">
            Account Inactive
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Your account is currently inactive. Please contact the administrator to reactivate your account and access documents.
          </p>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={handleLogout}
              className="flex-1"
            >
              Logout
            </Button>
            <Button
              onClick={() => setShowInactiveModal(false)}
              className="flex-1"
            >
              Try Again
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
} 