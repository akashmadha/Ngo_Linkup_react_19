import React, { useState, useEffect } from "react";

interface State {
  id: number;
  name: string;
  code: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

function capitalizeWords(str: string) {
  return str.replace(/\b\w/g, c => c.toUpperCase()).replace(/\s+/g, ' ').trim();
}

const StateMaster: React.FC = () => {
  const [states, setStates] = useState<State[]>([]);
  const [stateName, setStateName] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [editValue, setEditValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZE_OPTIONS[0]);

  const API_BASE_URL = "http://localhost:3001";

  // Fetch states from API
  const fetchStates = async () => {
    setLoading(true);
    try {
      const userId = localStorage.getItem("userId");
      const response = await fetch(`${API_BASE_URL}/api/admin/states`, {
        headers: {
          "user-id": userId || "",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch states");
      }

      const data = await response.json();
      setStates(data.data || []);
    } catch (err) {
      console.error("Error fetching states:", err);
      setError("Failed to load states. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStates();
  }, []);

  // Reset to first page when states or pageSize change
  useEffect(() => {
    setCurrentPage(1);
  }, [states.length, pageSize]);

  const handleAddState = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stateName.trim()) {
      setError("State name is required");
      return;
    }

    setIsSubmitting(true);
    setError("");
    setSuccess("");

    try {
      const userId = localStorage.getItem("userId");
      const response = await fetch(`${API_BASE_URL}/api/admin/states`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "user-id": userId || "",
        },
        body: JSON.stringify({
          name: stateName.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to add state");
      }

      setSuccess("State added successfully!");
      setStateName("");
      fetchStates(); // Refresh the list
    } catch (err: any) {
      console.error("Error adding state:", err);
      setError(err.message || "Failed to add state. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this state?")) {
      return;
    }

    try {
      const userId = localStorage.getItem("userId");
      const response = await fetch(`${API_BASE_URL}/api/admin/states/${id}`, {
        method: "DELETE",
        headers: {
          "user-id": userId || "",
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to delete state");
      }

      setSuccess("State deleted successfully!");
      fetchStates(); // Refresh the list
      if (editIndex !== null) {
        setEditIndex(null);
        setStateName("");
      }
    } catch (err: any) {
      console.error("Error deleting state:", err);
      setError(err.message || "Failed to delete state. Please try again.");
    }
  };

  const handleEdit = (idx: number) => {
    const state = paginatedStates[idx];
    setEditIndex(idx);
    setStateName(state.name);
    setError("");
  };

  const handleEditSave = async (id: number) => {
    if (!editValue.trim()) {
      setError("State name is required");
      return;
    }

    try {
      const userId = localStorage.getItem("userId");
      const response = await fetch(`${API_BASE_URL}/api/admin/states/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "user-id": userId || "",
        },
        body: JSON.stringify({
          name: editValue.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update state");
      }

      setSuccess("State updated successfully!");
      setEditIndex(null);
      setEditValue("");
      fetchStates(); // Refresh the list
    } catch (err: any) {
      console.error("Error updating state:", err);
      setError(err.message || "Failed to update state. Please try again.");
    }
  };

  const handleEditCancel = () => {
    setEditIndex(null);
    setStateName("");
    setError("");
  };

  const handleUpdateState = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editIndex === null) return;
    if (!stateName.trim()) {
      setError("State name is required");
      return;
    }
    try {
      const userId = localStorage.getItem("userId");
      const id = states[editIndex].id;
      const response = await fetch(`${API_BASE_URL}/api/admin/states/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "user-id": userId || "",
        },
        body: JSON.stringify({
          name: stateName.trim(),
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to update state");
      setSuccess("State updated successfully!");
      setEditIndex(null);
      setStateName("");
      fetchStates();
    } catch (err: any) {
      setError(err.message || "Failed to update state. Please try again.");
    }
  };

  // Pagination logic
  const totalPages = Math.ceil(states.length / pageSize);
  const paginatedStates = states.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setEditIndex(null); // Cancel any edit on page change
      setStateName("");
      setCurrentPage(page);
    }
  };

  // Pagination with ellipsis logic
  const getPageNumbers = () => {
    const pages = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 4) {
        pages.push(1, 2, 3, 4, 5, '...', totalPages);
      } else if (currentPage >= totalPages - 3) {
        pages.push(1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
      }
    }
    return pages;
  };

  // Clear success message after 3 seconds
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  // Entry summary text
  const startEntry = states.length === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endEntry = Math.min(currentPage * pageSize, states.length);

  return (
    <div className="flex items-center justify-center min-h-[80vh] bg-brand-50">
      <div className="bg-white shadow-theme-lg rounded-2xl p-8 w-full max-w-5xl border border-brand-100">
        <h2 className="text-3xl font-extrabold text-center text-brand-500 mb-6 tracking-wide drop-shadow">State Master</h2>
        
        {/* Add State Form */}
        <form onSubmit={editIndex === null ? handleAddState : handleUpdateState} className="flex gap-2 mb-8 justify-center">
          <input
            type="text"
            value={stateName}
            onChange={e => setStateName(e.target.value)}
            placeholder="Enter state name"
            className="border border-brand-300 rounded-lg px-4 py-2 flex-1 focus:outline-none focus:ring-2 focus:ring-brand-300 focus:border-brand-500 transition bg-brand-50 text-brand-700 placeholder:text-brand-300"
            autoFocus
          />
          <button
            type="submit"
            className="bg-brand-500 text-white px-6 py-2 rounded-lg font-semibold shadow-theme-xs hover:bg-brand-600 focus:ring-2 focus:ring-brand-300 transition"
          >
            {editIndex === null ? "Add State" : "Update State"}
          </button>
          {editIndex !== null && (
            <button
              type="button"
              className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg font-semibold shadow-theme-xs hover:bg-gray-400 focus:ring-2 focus:ring-brand-300 transition"
              onClick={handleEditCancel}
            >
              Cancel
            </button>
          )}
        </form>

        {/* Messages */}
        {error && <div className="text-red-500 mb-4 text-center font-medium">{error}</div>}
        {success && <div className="text-green-500 mb-4 text-center font-medium">{success}</div>}

        {/* States List */}
        <div>
          <h3 className="text-xl font-semibold mb-4 text-brand-600 text-center">States List</h3>
          {loading ? (
            <div className="text-brand-300 text-center">Loading states...</div>
          ) : states.length === 0 ? (
            <div className="text-brand-300 text-center">No states found.</div>
          ) : (
            <>
            {/* Top controls */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-2 gap-2">
              <div className="text-brand-400 text-sm">
                Showing {startEntry} to {endEntry} of {states.length} entries
              </div>
              <div className="flex items-center gap-2">
                <label htmlFor="pageSize" className="text-brand-400 text-sm">Show</label>
                <select
                  id="pageSize"
                  className="border border-brand-300 rounded px-2 py-1 text-brand-700 bg-brand-50 focus:outline-none"
                  value={pageSize}
                  onChange={e => setPageSize(Number(e.target.value))}
                >
                  {PAGE_SIZE_OPTIONS.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
                <span className="text-brand-400 text-sm">entries</span>
              </div>
            </div>
           
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-brand-100 rounded-lg">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-bold text-brand-400 uppercase tracking-wider border-b border-brand-100">#</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-brand-400 uppercase tracking-wider border-b border-brand-100">State Name</th>
                    <th className="px-6 py-3 text-center text-xs font-bold text-brand-400 uppercase tracking-wider border-b border-brand-100">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedStates.map((state, idx) => (
                    <tr key={state.id} className="hover:bg-brand-50 transition">
                      <td className="px-6 py-3 border-b border-brand-100 text-brand-700 font-medium w-12">{(currentPage - 1) * pageSize + idx + 1}</td>
                      <td className="px-6 py-3 border-b border-brand-100 text-brand-900 font-semibold">
                        {capitalizeWords(state.name)}
                      </td>
                      <td className="px-6 py-3 border-b border-brand-100 text-center w-40">
                        <div className="flex gap-4 justify-center text-xl">
                          <span
                            role="button"
                            title="Edit"
                            style={{ cursor: 'pointer' }}
                            onClick={() => {
                              setEditIndex(idx);
                              setStateName(state.name);
                            }}
                          >
                            ✏️
                          </span>
                          <span
                            role="button"
                            title="Delete"
                            style={{ cursor: 'pointer' }}
                            onClick={() => handleDelete(state.id)}
                          >
                            🗑️
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mt-6 gap-2">
                <div className="text-brand-400 text-sm">
                  Showing {startEntry} to {endEntry} of {states.length} entries
                </div>
                <div className="flex gap-1 flex-wrap justify-center md:justify-end">
                  <button
                    className="px-3 py-1 rounded border border-brand-200 bg-brand-50 text-brand-500 font-semibold disabled:opacity-50"
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </button>
                  {getPageNumbers().map((page, idx) =>
                    page === '...'
                      ? <span key={idx} className="px-2 py-1 text-brand-400">...</span>
                      : <button
                          key={page as number}
                          className={`px-3 py-1 rounded border font-semibold ${currentPage === page ? "bg-brand-500 text-white border-brand-500" : "bg-brand-50 text-brand-500 border-brand-200"}`}
                          onClick={() => goToPage(Number(page))}
                        >
                          {page}
                        </button>
                  )}
                  <button
                    className="px-3 py-1 rounded border border-brand-200 bg-brand-50 text-brand-500 font-semibold disabled:opacity-50"
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default StateMaster; 