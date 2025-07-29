import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../ui/table";
import Badge from "../../ui/badge/Badge";
import Button from "../../ui/button/Button";
import DocumentUploadModal from "./DocumentUploadModal";

interface TrustMember {
  id: number;
  name: string;
  email: string;
  phone: string;
  organizationType: string;
  spocName: string;
  status: string;
  createdAt: string;
}

export default function TrustMembersTable() {
  const [trustMembers, setTrustMembers] = useState<TrustMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingStatus, setUpdatingStatus] = useState<number | null>(null);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<TrustMember | null>(null);

  useEffect(() => {
    fetchTrustMembers();
  }, []);

  const fetchTrustMembers = async () => {
    try {
      setLoading(true);
      const adminId = localStorage.getItem("userId");
      
      if (!adminId) {
        setError("Admin authentication required. Please login again.");
        return;
      }

      const response = await fetch("http://localhost:3001/api/admin/trust-members", {
        headers: {
          'user-id': adminId
        }
      });
      const data = await response.json();

      if (response.ok) {
        setTrustMembers(data.data || []);
      } else {
        setError(data.error || "Failed to fetch trust members");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const formatStatus = (status: string) =>
    status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();

  const toggleMemberStatus = async (memberId: number, currentStatus: string) => {
    try {
      setUpdatingStatus(memberId);
      const adminId = localStorage.getItem("userId");
      
      if (!adminId) {
        alert("Admin authentication required. Please login again.");
        return;
      }

      const newStatus = currentStatus.toLowerCase() === "active" ? "inactive" : "active";

      const response = await fetch(`http://localhost:3001/api/admin/member/${memberId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          'user-id': adminId
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await response.json();

      if (response.ok) {
        setTrustMembers((prev) =>
          prev.map((member) =>
            member.id === memberId ? { ...member, status: formatStatus(newStatus) } : member
          )
        );
        console.log(`Member status updated to ${newStatus}`);
      } else {
        console.error("Failed to update status:", data.error);
        alert(`Failed to update status: ${data.error}`);
      }
    } catch (err) {
      console.error("Network error:", err);
      alert("Network error. Please try again.");
    } finally {
      setUpdatingStatus(null);
    }
  };

  const openUploadModal = (member: TrustMember) => {
    setSelectedMember(member);
    setUploadModalOpen(true);
  };

  const closeUploadModal = () => {
    setUploadModalOpen(false);
    setSelectedMember(null);
  };

  const handleUploadSuccess = () => {
    console.log("Document uploaded successfully");
    closeUploadModal();
    fetchTrustMembers(); // Refresh table
  };

  const getStatusColor = (status: string) => {
    const formatted = formatStatus(status);
    switch (formatted) {
      case "Active":
        return "success";
      case "Inactive":
        return "error";
      default:
        return "warning";
    }
  };

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString();

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-gray-500 dark:text-gray-400">
          Loading trust members...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-error-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="max-w-full overflow-x-auto">
        <Table>
          <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
            <TableRow>
              <TableCell isHeader className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400">Organization</TableCell>
              <TableCell isHeader className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400">Contact Info</TableCell>
              <TableCell isHeader className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400">SPOC</TableCell>
              <TableCell isHeader className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400">Type</TableCell>
              <TableCell isHeader className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400">Status</TableCell>
              <TableCell isHeader className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400">Registered</TableCell>
              <TableCell isHeader className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400">Actions</TableCell>
            </TableRow>
          </TableHeader>

          <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
            {trustMembers.map((member) => (
              <TableRow key={member.id}>
                <TableCell className="px-5 py-4 sm:px-6 text-start">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                      <span className="text-gray-600 dark:text-gray-400 font-medium text-sm">
                        {member.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                        {member.name}
                      </span>
                      <span className="block text-gray-500 text-theme-xs dark:text-gray-400">
                        ID: {member.id}
                      </span>
                    </div>
                  </div>
                </TableCell>

                <TableCell className="px-4 py-3 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                  <div>
                    <div className="text-gray-800 dark:text-white/90">{member.email}</div>
                    <div className="text-gray-500 dark:text-gray-400">{member.phone}</div>
                  </div>
                </TableCell>

                <TableCell className="px-4 py-3 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                  {member.spocName}
                </TableCell>

                <TableCell className="px-4 py-3 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                  {member.organizationType}
                </TableCell>

                <TableCell className="px-4 py-3 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                  <Badge size="sm" color={getStatusColor(member.status)}>
                    {formatStatus(member.status)}
                  </Badge>
                </TableCell>

                <TableCell className="px-4 py-3 text-theme-sm text-gray-500 dark:text-gray-400">
                  {formatDate(member.createdAt)}
                </TableCell>

                <TableCell className="px-4 py-3 text-start text-theme-sm text-gray-500 dark:text-gray-400">
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className={
                        formatStatus(member.status) === "Active"
                          ? "text-error-600 border-error-600 hover:bg-error-50 dark:text-error-400 dark:border-error-400 dark:hover:bg-error-400/10"
                          : "text-success-600 border-success-600 hover:bg-success-50 dark:text-success-400 dark:border-success-400 dark:hover:bg-success-400/10"
                      }
                      onClick={() =>
                        toggleMemberStatus(member.id, member.status)
                      }
                      disabled={updatingStatus === member.id}
                    >
                      {updatingStatus === member.id
                        ? "Updating..."
                        : formatStatus(member.status) === "Active"
                        ? "Deactivate"
                        : "Activate"}
                    </Button>

                    <Button
                      size="sm"
                      variant="outline"
                      className="text-brand-600 border-brand-600 hover:bg-brand-50 dark:text-brand-400 dark:border-brand-400 dark:hover:bg-brand-400/10"
                      onClick={() => openUploadModal(member)}
                    >
                      Upload Doc
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {trustMembers.length === 0 && (
        <div className="p-8 text-center text-gray-500 dark:text-gray-400">
          No trust members found
        </div>
      )}

      {/* Upload Modal */}
      {selectedMember && (
        <DocumentUploadModal
          isOpen={uploadModalOpen}
          onClose={closeUploadModal}
          memberId={selectedMember.id}
          memberName={selectedMember.name}
          onUploadSuccess={handleUploadSuccess}
        />
      )}
    </div>
  );
}
