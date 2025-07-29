import PageMeta from "../../components/common/PageMeta";
import { UserGroupIcon } from '@heroicons/react/24/outline';
import React, { useState, useEffect } from "react";

function TrustMembersTableModern({ search }: { search: string }) {
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 10;
  const adminId = localStorage.getItem("userId") || "1";

  useEffect(() => {
    setLoading(true);
    setError("");
    fetch("http://localhost:3001/api/admin/trust-members", {
      headers: { "user-id": adminId }
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setMembers(data.data || []);
        } else {
          setError("Failed to load members.");
        }
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load members.");
        setLoading(false);
      });
  }, []);

  // Search
  const filtered = members.filter((m) =>
    Object.values(m).join(" ").toLowerCase().includes(search.toLowerCase())
  );
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  // Toggle status
  const handleToggleStatus = (member: any) => {
    const newStatus = member.status === "active" ? "inactive" : "active";
    fetch(`http://localhost:3001/api/admin/member/${member.id}/status`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "user-id": adminId
      },
      body: JSON.stringify({ status: newStatus })
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setMembers(members => members.map(m => m.id === member.id ? { ...m, status: newStatus } : m));
        } else {
          alert(data.error || "Failed to update status.");
        }
      })
      .catch(() => alert("Failed to update status."));
  };

  return (
    <div className="p-4">
      <div className="overflow-x-auto">
        <table className="min-w-full text-xs">
          <thead>
            <tr className="bg-gray-100 dark:bg-gray-800">
              <th className="px-6 py-4 text-left font-bold whitespace-nowrap">#</th>
              <th className="px-6 py-4 text-left font-bold whitespace-nowrap max-w-[180px]">Name</th>
              <th className="px-6 py-4 text-left font-bold whitespace-nowrap max-w-[220px]">Email</th>
              <th className="px-6 py-4 text-left font-bold whitespace-nowrap max-w-[140px]">Phone</th>
              <th className="px-6 py-4 text-left font-bold whitespace-nowrap max-w-[120px]">Type</th>
              <th className="px-6 py-4 text-left font-bold whitespace-nowrap max-w-[180px]">SPOC</th>
              <th className="px-6 py-4 text-left font-bold whitespace-nowrap max-w-[120px]">Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} className="text-center py-8 text-xs">Loading...</td></tr>
            ) : error ? (
              <tr><td colSpan={7} className="text-center py-8 text-red-500 text-xs">{error}</td></tr>
            ) : paginated.length === 0 ? (
              <tr><td colSpan={7} className="text-center py-8 text-gray-400 text-xs">No members found.</td></tr>
            ) : (
              paginated.map((member, idx) => (
                <tr key={member.id || idx} className="border-b hover:bg-blue-50 dark:hover:bg-gray-800 transition text-xs">
                  <td className="px-6 py-4 whitespace-nowrap text-xs">{(currentPage - 1) * PAGE_SIZE + idx + 1}</td>
                  <td className="px-6 py-4 max-w-[180px] truncate text-xs" title={member.name}>{member.name || "-"}</td>
                  <td className="px-6 py-4 max-w-[220px] truncate text-xs" title={member.email}>{member.email || "-"}</td>
                  <td className="px-6 py-4 max-w-[140px] truncate text-xs" title={member.phone}>{member.phone || "-"}</td>
                  <td className="px-6 py-4 max-w-[120px] truncate text-xs" title={member.organizationType}>{member.organizationType || "-"}</td>
                  <td className="px-6 py-4 max-w-[180px] truncate text-xs" title={member.spocName}>{member.spocName || "-"}</td>
                  <td className="px-6 py-4 max-w-[120px] truncate text-xs" title={member.status}>
                    <button
                      className={`px-4 py-1 rounded-full font-semibold text-white focus:outline-none focus:ring-2 focus:ring-blue-400 transition ${member.status === 'active' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}
                      onClick={() => handleToggleStatus(member)}
                    >
                      {member.status === 'active' ? 'Active' : 'Deactive'}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-end items-center gap-2 mt-4">
          <button
            className="px-3 py-1 rounded border bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 hover:bg-blue-100 dark:hover:bg-gray-700 disabled:opacity-50"
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1}
          >Previous</button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
            <button
              key={page}
              className={`px-3 py-1 rounded border text-xs font-semibold ${
                currentPage === page
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 hover:bg-blue-100 dark:hover:bg-gray-700 border-gray-300"
              }`}
              onClick={() => setCurrentPage(page)}
            >
              {page}
            </button>
          ))}
          <button
            className="px-3 py-1 rounded border bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 hover:bg-blue-100 dark:hover:bg-gray-700 disabled:opacity-50"
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage === totalPages}
          >Next</button>
        </div>
      )}
    </div>
  );
}

export default function BasicTables() {
  const [search, setSearch] = useState("");
  return (
    <>
      <PageMeta
        title="OM Members List | TailAdmin - Next.js Admin Dashboard Template"
        description="This is the OM Members List page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
      />
      <div className="max-w-7xl mx-auto px-2 sm:px-4 md:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-10 mt-6">
          <div className="flex items-center gap-3">
            <UserGroupIcon className="w-10 h-10 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white tracking-wide">OM Members List</h1>
          </div>
          <div className="w-full sm:w-auto">
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search members..."
              className="w-full sm:w-72 border border-gray-300 dark:border-gray-700 rounded-lg px-5 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition bg-white dark:bg-gray-900 text-gray-800 dark:text-white placeholder:text-gray-400"
              aria-label="Search members"
            />
          </div>
        </div>
        <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-2xl">
          <TrustMembersTableModern search={search} />
        </div>
      </div>
    </>
  );
}
