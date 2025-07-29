import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PageMeta from "../../components/common/PageMeta";
import ComponentCard from "../../components/common/ComponentCard";
import Badge from "../../components/ui/badge/Badge";
import Button from "../../components/ui/button/Button";
import { Modal } from "../../components/ui/modal";
import RegistrationDetailsForm from "../../components/UserProfile/RegistrationDetailsForm";
import OrganizationWizard from '../../components/UserProfile/OrganizationWizard';
import logo from "../../img/logo.png";

interface MemberDocument {
  id: number;
  document_name: string;
  file_path: string;
  file_type: string;
  file_size: number;
  created_at: string;
}

interface MemberProfile {
  id: number;
  organization_type: string;
  organization_name: string;
  pan_no: string;
  email: string;
  mobile_no: string;
  spoc_name: string;
  created_at: string;
  status: string;
  documents: MemberDocument[];
}

export default function MemberDashboard() {
  const [profile, setProfile] = useState<MemberProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showInactiveModal, setShowInactiveModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchMemberProfile();
  }, []);

  const fetchMemberProfile = async () => {
    try {
      setLoading(true);
      const userId = localStorage.getItem("userId");
      
      if (!userId) {
        navigate("/signin");
        return;
      }

      const response = await fetch("http://localhost:3001/api/member/profile", {
        headers: {
          'user-id': userId
        }
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setProfile(data.data);
      } else if (response.status === 403) {
        // Account is inactive
        setShowInactiveModal(true);
      } else {
        setError(data.error || "Failed to fetch profile");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDocumentDownload = async (documentId: number, documentName: string) => {
    try {
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
        <div className="text-gray-500 dark:text-gray-400">Loading your profile...</div>
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <img src={logo} alt="Logo" className="h-8 w-auto" />
              <h1 className="ml-3 text-xl font-semibold text-gray-900 dark:text-white">
                Member Dashboard
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Welcome, {profile?.spoc_name || 'Member'}
              </span>
              <Button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 text-white"
              >
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            <ComponentCard title="User Registration Details">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Organization Name
                    </label>
                    <p className="mt-1 text-sm text-gray-900 dark:text-white">
                      {profile?.organization_name || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Organization Type
                    </label>
                    <p className="mt-1 text-sm text-gray-900 dark:text-white">
                      {profile?.organization_type || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      SPOC Name
                    </label>
                    <p className="mt-1 text-sm text-gray-900 dark:text-white">
                      {profile?.spoc_name || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      PAN Number
                    </label>
                    <p className="mt-1 text-sm text-gray-900 dark:text-white">
                      {profile?.pan_no || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Email
                    </label>
                    <p className="mt-1 text-sm text-gray-900 dark:text-white">
                      {profile?.email || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Mobile Number
                    </label>
                    <p className="mt-1 text-sm text-gray-900 dark:text-white">
                      {profile?.mobile_no || 'N/A'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center mt-4">
                  <Badge
                    className={
                      profile?.status === 'active'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                    }
                  >
                    {profile?.status === 'active' ? 'Active' : 'Inactive'}
                  </Badge>
                  <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                    Account Status
                  </span>
                </div>
              </div>
            </ComponentCard>
          </div>

          <div>
            <ComponentCard title="Quick Actions">
              <div className="space-y-3">
                <Button
                  onClick={() => navigate('/member-documents')}
                  className="w-full bg-brand-500 hover:bg-brand-600 text-white"
                >
                  View Documents
                </Button>
                <Button
                  onClick={() => setShowInactiveModal(true)}
                  className="w-full bg-gray-500 hover:bg-gray-600 text-white"
                >
                  Update Profile
                </Button>
                <Button
                  onClick={() => setShowInactiveModal(true)}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white"
                >
                  Contact Support
                </Button>
              </div>
            </ComponentCard>
          </div>
        </div>

        {/* Documents Section */}
        <ComponentCard title="Recent Documents">
          {profile?.documents && profile.documents.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Document
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Size
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Uploaded
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                  {profile.documents.slice(0, 5).map((doc) => (
                    <tr key={doc.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className="text-lg mr-2">{getFileIcon(doc.file_type)}</span>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {doc.document_name}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {doc.file_type}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {formatFileSize(doc.file_size)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(doc.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <Button
                          onClick={() => handleDocumentDownload(doc.id, doc.document_name)}
                          className="bg-brand-500 hover:bg-brand-600 text-white text-xs"
                        >
                          Download
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {profile.documents.length > 5 && (
                <div className="mt-4 text-center">
                  <Button
                    onClick={() => navigate('/member-documents')}
                    className="bg-brand-500 hover:bg-brand-600 text-white"
                  >
                    View All Documents ({profile.documents.length})
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400">No documents uploaded yet.</p>
              <Button
                onClick={() => navigate('/member-documents')}
                className="mt-2 bg-brand-500 hover:bg-brand-600 text-white"
              >
                Upload Documents
              </Button>
            </div>
          )}
        </ComponentCard>

        {/* Organization Wizard */}
        <div className="mt-8">
          <ComponentCard title="Complete Your Profile">
            <OrganizationWizard />
          </ComponentCard>
        </div>
      </div>

      {/* Inactive Account Modal */}
      {showInactiveModal && (
        <Modal
          isOpen={showInactiveModal}
          onClose={() => setShowInactiveModal(false)}
          title="Account Status"
        >
          <div className="p-6">
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Your account is currently inactive. Please contact the administrator to activate your account.
            </p>
            <div className="flex justify-end space-x-3">
              <Button
                onClick={() => setShowInactiveModal(false)}
                className="bg-gray-500 hover:bg-gray-600 text-white"
              >
                Close
              </Button>
              <Button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 text-white"
              >
                Logout
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
} 