// NOTE: Make sure to install @heroicons/react: npm install @heroicons/react
import React, { useState, useEffect } from "react";
import { CheckCircleIcon, ExclamationTriangleIcon, TrashIcon, PencilIcon, PlusIcon, ChevronDownIcon } from '@heroicons/react/24/outline';

const API_BASE = "http://localhost:3001/api/admin";
const USER_ID = localStorage.getItem("userId") || "1";

type ToastType = 'success' | 'error';
type ToastProps = { type: ToastType; message: string; onClose: () => void };

const Toast: React.FC<ToastProps> = ({ type, message, onClose }) => (
  <div className={`fixed top-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded shadow-lg transition-all
    ${type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
    role="alert"
  >
    {type === 'success' ? <CheckCircleIcon className="w-5 h-5" /> : <ExclamationTriangleIcon className="w-5 h-5" />}
    <span className="font-medium">{message}</span>
    <button onClick={onClose} className="ml-2 text-lg font-bold">×</button>
  </div>
);

type Taluka = { id: number; name: string; state_id: number; district_id: number; state_name?: string; district_name?: string };
type ToastState = { type: ToastType; message: string } | null;

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

const TalukaMaster: React.FC = () => {
  const [states, setStates] = useState<any[]>([]);
  const [districts, setDistricts] = useState<any[]>([]);
  const [talukas, setTalukas] = useState<Taluka[]>([]);
  const [selectedState, setSelectedState] = useState<number | ''>('');
  const [selectedDistrict, setSelectedDistrict] = useState<number | ''>('');
  const [talukaName, setTalukaName] = useState("");
  const [loadingStates, setLoadingStates] = useState(false);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [loadingTalukas, setLoadingTalukas] = useState(false);
  const [toast, setToast] = useState<ToastState>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [editValue, setEditValue] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZE_OPTIONS[0]);
  const [search, setSearch] = useState("");

  // Fetch states on mount
  useEffect(() => {
    setLoadingStates(true);
    fetch(`${API_BASE}/states`, { headers: { "user-id": USER_ID } })
      .then((res) => res.json())
      .then((data) => setStates(data.data || []))
      .finally(() => setLoadingStates(false));
  }, []);

  // Fetch districts when state changes
  useEffect(() => {
    if (!selectedState) {
      setDistricts([]);
      setSelectedDistrict('');
      return;
    }
    setLoadingDistricts(true);
    fetch(`${API_BASE}/districts?stateId=${selectedState}`, { headers: { "user-id": USER_ID } })
      .then((res) => res.json())
      .then((data) => setDistricts(data.data || []))
      .finally(() => setLoadingDistricts(false));
  }, [selectedState]);

  // Fetch talukas when state or district changes
  useEffect(() => {
    if (!selectedState || !selectedDistrict) {
      setTalukas([]);
      return;
    }
    setLoadingTalukas(true);
    fetch(`${API_BASE}/talukas?stateId=${selectedState}&districtId=${selectedDistrict}`, { headers: { "user-id": USER_ID } })
      .then((res) => res.json())
      .then((data) => setTalukas(data.data || []))
      .finally(() => setLoadingTalukas(false));
  }, [selectedState, selectedDistrict, toast]);

  // Add Taluka
  const handleAddTaluka = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!talukaName.trim() || !selectedState || !selectedDistrict) {
      setError('Taluka name, state, and district are required');
      return;
    }
    try {
      const response = await fetch(`${API_BASE}/talukas`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'user-id': USER_ID,
        },
        body: JSON.stringify({
          name: talukaName.trim(),
          stateId: selectedState,
          districtId: selectedDistrict,
        })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to add taluka');
      setSuccess('Taluka added successfully!');
      setTalukaName('');
      setEditIndex(null);
      setEditValue('');
      setTimeout(() => setSuccess(''), 2000);
      setToast({ type: 'success', message: 'Taluka added successfully!' });
    } catch (err: any) {
      setError(err.message || 'Failed to add taluka. Please try again.');
      setToast({ type: 'error', message: err.message || 'Failed to add taluka.' });
    }
  };

  // Edit Taluka
  const handleEdit = (idx: number) => {
    setEditIndex(idx);
    setEditValue(talukas[idx].name);
    setSelectedState(talukas[idx].state_id);
    setSelectedDistrict(talukas[idx].district_id);
    setError("");
  };

  const handleEditSave = async (idx: number) => {
    if (!editValue.trim() || !selectedState || !selectedDistrict) {
      setError("Taluka name, state, and district are required");
      return;
    }
    try {
      const taluka = talukas[idx];
      const response = await fetch(`${API_BASE}/talukas/${taluka.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'user-id': USER_ID,
        },
        body: JSON.stringify({
          name: editValue.trim(),
          stateId: selectedState,
          districtId: selectedDistrict,
        })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to update taluka');
      setSuccess('Taluka updated successfully!');
      setEditIndex(null);
      setEditValue('');
      setTalukaName('');
      setTimeout(() => setSuccess(''), 2000);
      setToast({ type: 'success', message: 'Taluka updated successfully!' });
    } catch (err: any) {
      setError(err.message || 'Failed to update taluka. Please try again.');
      setToast({ type: 'error', message: err.message || 'Failed to update taluka.' });
    }
  };

  const handleEditCancel = () => {
    setEditIndex(null);
    setEditValue("");
    setTalukaName("");
    setError("");
  };

  // Delete Taluka
  const handleDelete = async (idx: number) => {
    const taluka = talukas[idx];
    if (!window.confirm("Are you sure you want to delete this Taluka?")) return;
    setLoadingTalukas(true);
    try {
      const response = await fetch(`${API_BASE}/talukas/${taluka.id}`, {
        method: "DELETE",
        headers: { "user-id": USER_ID },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to delete taluka');
      setToast({ type: 'success', message: data.message || "Deleted successfully" });
    } catch (err: any) {
      setToast({ type: 'error', message: err.message || "Delete failed." });
    } finally {
      setLoadingTalukas(false);
      setTimeout(() => setToast(null), 3000);
    }
  };

  // Search and Pagination
  const filteredTalukas = talukas.filter(t =>
    t.name.toLowerCase().includes(search.toLowerCase())
  );
  const totalPages = Math.ceil(filteredTalukas.length / pageSize);
  const paginatedTalukas = filteredTalukas.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const startEntry = filteredTalukas.length === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endEntry = Math.min(currentPage * pageSize, filteredTalukas.length);

  // Clear success message after 3 seconds
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(""), 2000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  return (
    <div className="flex items-center justify-center min-h-[80vh] bg-brand-50">
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
      <div className="bg-white shadow-theme-lg rounded-2xl p-8 w-full max-w-5xl border border-brand-100">
        <h2 className="text-3xl font-extrabold text-center text-brand-500 mb-6 tracking-wide drop-shadow">Taluka/Tehsil Master</h2>
        {/* Add/Edit Taluka Form */}
        <form onSubmit={editIndex === null ? handleAddTaluka : (e) => { e.preventDefault(); handleEditSave(editIndex); }} className="bg-white rounded-xl shadow-theme-md p-6 mb-8 flex flex-col md:flex-row gap-4 items-end border border-brand-100">
          <select
            value={selectedState}
            onChange={e => setSelectedState(Number(e.target.value))}
            className="border border-brand-300 rounded-lg px-4 py-2 min-w-[180px] w-auto flex-1 focus:outline-none focus:ring-2 focus:ring-brand-300 focus:border-brand-500 transition bg-brand-50 text-brand-700"
            required
          >
            <option value="">Select State</option>
            {states.map(state => (
              <option key={state.id} value={state.id}>{state.name}</option>
            ))}
          </select>
          <select
            value={selectedDistrict}
            onChange={e => setSelectedDistrict(Number(e.target.value))}
            className="border border-brand-300 rounded-lg px-4 py-2 min-w-[180px] w-auto flex-1 focus:outline-none focus:ring-2 focus:ring-brand-300 focus:border-brand-500 transition bg-brand-50 text-brand-700"
            required
            disabled={!selectedState}
          >
            <option value="">Select District</option>
            {districts.map(district => (
              <option key={district.id} value={district.id}>{district.name}</option>
            ))}
          </select>
          <input
            type="text"
            value={editIndex === null ? talukaName : editValue}
            onChange={e => editIndex === null ? setTalukaName(e.target.value) : setEditValue(e.target.value)}
            placeholder="Enter taluka/tehsil name"
            className="border border-brand-300 rounded-lg px-4 py-2 min-w-[180px] w-auto flex-1 focus:outline-none focus:ring-2 focus:ring-brand-300 focus:border-brand-500 transition bg-brand-50 text-brand-700 placeholder:text-brand-300"
            required
          />
          <button
            type="submit"
            className="bg-brand-500 text-white px-6 py-2 rounded-lg font-semibold shadow-theme-xs hover:bg-brand-600 focus:ring-2 focus:ring-brand-300 transition"
            disabled={loadingTalukas}
          >
            {editIndex === null ? <><PlusIcon className="w-5 h-5 inline-block mr-1" /> Add Taluka</> : <><PencilIcon className="w-5 h-5 inline-block mr-1" /> Update</>}
          </button>
          {editIndex !== null && (
            <button
              type="button"
              className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg font-semibold shadow-theme-xs hover:bg-gray-400 focus:ring-2 focus:ring-brand-300 transition"
              onClick={handleEditCancel}
              disabled={loadingTalukas}
            >
              Cancel
            </button>
          )}
        </form>
        {/* Messages */}
        {error && <div className="text-red-500 mb-4 text-center font-medium">{error}</div>}
        {success && <div className="text-green-500 mb-4 text-center font-medium">{success}</div>}
        {/* Search Bar */}
        <div className="flex justify-end mb-4">
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search taluka..."
            className="border border-brand-300 rounded-lg px-4 py-2 w-full max-w-xs focus:outline-none focus:ring-2 focus:ring-brand-300 focus:border-brand-500 transition bg-brand-50 text-brand-700 placeholder:text-brand-300"
          />
        </div>
        {/* Taluka Table */}
        <div className="overflow-hidden rounded-xl border border-brand-100 bg-white shadow-theme-md">
          <div className="max-w-full overflow-x-auto">
            <table className="min-w-full table-auto">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold text-brand-400 uppercase tracking-wider border-b border-brand-100">#</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-brand-400 uppercase tracking-wider border-b border-brand-100">Taluka/Tehsil Name</th>
                  <th className="px-6 py-3 text-center text-xs font-bold text-brand-400 uppercase tracking-wider border-b border-brand-100">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-100">
                {paginatedTalukas.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="text-center py-8 text-brand-300">No talukas found.</td>
                  </tr>
                ) : (
                  paginatedTalukas.map((taluka, idx) => (
                    <tr key={taluka.id} className="hover:bg-brand-50 transition">
                      <td className="px-6 py-3 border-b border-brand-100 text-brand-700 font-medium w-12">{startEntry + idx}</td>
                      <td className="px-6 py-3 border-b border-brand-100 text-brand-900 font-semibold">{taluka.name}</td>
                      <td className="px-6 py-3 border-b border-brand-100 text-center w-40">
                        <div className="flex gap-4 justify-center text-xl">
                          <button
                            className="text-blue-600 hover:text-blue-900"
                            onClick={() => handleEdit((currentPage - 1) * pageSize + idx)}
                            title="Edit"
                          >
                            <PencilIcon className="w-5 h-5 inline-block" />
                          </button>
                          <button
                            className="text-red-600 hover:text-red-900"
                            onClick={() => handleDelete((currentPage - 1) * pageSize + idx)}
                            title="Delete"
                          >
                            <TrashIcon className="w-5 h-5 inline-block" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mt-6 gap-2 px-6 pb-6">
              <div className="text-brand-400 text-sm">
                Showing {startEntry} to {endEntry} of {filteredTalukas.length} entries
              </div>
              <div className="flex gap-1 flex-wrap justify-center md:justify-end">
                <button
                  className="px-3 py-1 rounded border border-brand-200 bg-brand-50 text-brand-500 text-xs font-semibold disabled:opacity-50"
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                >Previous</button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    className={`px-3 py-1 rounded border text-xs font-semibold ${
                      currentPage === page
                        ? "bg-brand-500 text-white border-brand-500"
                        : "bg-brand-50 text-brand-500 border-brand-200"
                    }`}
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </button>
                ))}
                <button
                  className="px-3 py-1 rounded border border-brand-200 bg-brand-50 text-brand-500 text-xs font-semibold disabled:opacity-50"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >Next</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TalukaMaster; 