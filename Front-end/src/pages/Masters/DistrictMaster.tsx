import React, { useState, useEffect, useContext } from "react";
import { FaEdit, FaTrash, FaPlus, FaSearch, FaFilter, FaTimes } from 'react-icons/fa';
import './DistrictMaster.css';
import { Table, TableHeader, TableBody, TableRow, TableCell } from '../../components/ui/table';
import Button from '../../components/ui/button/Button';
import Badge from '../../components/ui/badge/Badge';
import { ModalContext } from "../../context/ModalContext";

interface State {
  id: number;
  name: string;
}

interface District {
  id: number;
  name: string;
  state_id: number;
  state_name: string;
}

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

const DistrictMaster: React.FC = () => {
  const [districts, setDistricts] = useState<District[]>([]);
  const [states, setStates] = useState<State[]>([]);
  const [selectedState, setSelectedState] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingDistrict, setEditingDistrict] = useState<District | null>(null);
  const [newDistrictNames, setNewDistrictNames] = useState([""]); // Start with one field
  const [newDistrictState, setNewDistrictState] = useState<number | "">("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZE_OPTIONS[0]);
  const [statesCurrentPage, setStatesCurrentPage] = useState(1);
  const [statesPageSize, setStatesPageSize] = useState(10);

  const API_BASE_URL = "http://localhost:3001";

  const { setModalOpen } = useContext(ModalContext);

  // Fetch all states for sidebar
  const fetchStates = async () => {
    try {
      const userId = localStorage.getItem("userId");
      const response = await fetch(`${API_BASE_URL}/api/admin/states`, {
        headers: { "user-id": userId || "" },
      });
      if (!response.ok) throw new Error("Failed to fetch states");
      const data = await response.json();
      setStates(data.data || []);
      // Auto-select first state if available
      if (data.data && data.data.length > 0 && !selectedState) {
        setSelectedState(data.data[0].id);
      }
    } catch (err) {
      setStates([]);
    }
  };

  // Fetch districts for selected state
  const fetchDistricts = async () => {
    if (!selectedState) return;
    
    setLoading(true);
    try {
      const userId = localStorage.getItem("userId");
      const response = await fetch(`${API_BASE_URL}/api/admin/districts`, {
        headers: { "user-id": userId || "" },
      });
      if (!response.ok) throw new Error("Failed to fetch districts");
      const data = await response.json();
      setDistricts(data.data || []);
    } catch (err) {
      setDistricts([]);
      setError("Failed to load districts. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStates();
  }, []);

  useEffect(() => {
    if (selectedState) {
      fetchDistricts();
    }
  }, [selectedState]);

  // Filter districts by selected state and search query
  const filteredDistricts = districts.filter(district => {
    const matchesState = selectedState ? district.state_id === selectedState : true;
    const matchesSearch = searchQuery ? 
      district.name.toLowerCase().includes(searchQuery.toLowerCase()) : true;
    return matchesState && matchesSearch;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredDistricts.length / pageSize);
  const paginatedDistricts = filteredDistricts.slice(
    (currentPage - 1) * pageSize, 
    currentPage * pageSize
  );

  // Get district count for each state
  const getDistrictCount = (stateId: number) => {
    return districts.filter(d => d.state_id === stateId).length;
  };

  // States pagination logic
  const totalStatesPages = Math.ceil(states.length / statesPageSize);
  const paginatedStates = states.slice(
    (statesCurrentPage - 1) * statesPageSize, 
    statesCurrentPage * statesPageSize
  );

  // States pagination navigation
  const goToStatesPage = (page: number) => {
    if (page >= 1 && page <= totalStatesPages) {
      setStatesCurrentPage(page);
    }
  };

  // Add new districts (1-5 at once)
  const handleAddDistrict = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDistrictState) {
      setError("Please select a state.");
      return;
    }
    const names = newDistrictNames.map(n => n.trim()).filter(Boolean);
    if (names.length === 0) {
      setError("Please enter at least one district name.");
      return;
    }
    setIsSubmitting(true);
    setError("");
    try {
      const userId = localStorage.getItem("userId");
      let added = 0;
      for (const name of names) {
        const response = await fetch(`${API_BASE_URL}/api/admin/districts`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "user-id": userId || "",
          },
          body: JSON.stringify({
            name,
            stateId: newDistrictState,
          }),
        });
        if (response.ok) added++;
      }
      setSuccess(`${added} district${added !== 1 ? "s" : ""} added successfully!`);
      setNewDistrictNames(["", "", "", "", ""]);
      setNewDistrictState("");
      setShowAddModal(false);
      fetchDistricts();
    } catch (err: any) {
      setError("Failed to add districts. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Add new input field (up to 5)
  const handleAddDistrictField = () => {
    if (newDistrictNames.length < 5) {
      setNewDistrictNames([...newDistrictNames, ""]);
    }
  };
  // Remove input field (except the first)
  const handleRemoveDistrictField = (idx: number) => {
    if (newDistrictNames.length > 1) {
      setNewDistrictNames(newDistrictNames.filter((_, i) => i !== idx));
    }
  };

  // Edit district
  const handleEditDistrict = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDistrict || !newDistrictNames[0].trim() || !newDistrictState) {
      setError("Please enter district name and select a state.");
      return;
    }

    setIsSubmitting(true);
    setError("");
    try {
      const userId = localStorage.getItem("userId");
      const response = await fetch(`${API_BASE_URL}/api/admin/districts/${editingDistrict.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "user-id": userId || "",
        },
        body: JSON.stringify({
          name: newDistrictNames[0].trim(),
          stateId: newDistrictState,
        }),
      });
      
      if (!response.ok) {
      const data = await response.json();
        throw new Error(data.error || "Failed to update district");
      }

      setSuccess("District updated successfully!");
      setEditingDistrict(null);
      setNewDistrictNames(["", "", "", "", ""]);
      setNewDistrictState("");
      setShowEditModal(false);
      fetchDistricts();
    } catch (err: any) {
      setError(err.message || "Failed to update district. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete district
  const handleDeleteDistrict = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this district?")) return;
    
    try {
      const userId = localStorage.getItem("userId");
      const response = await fetch(`${API_BASE_URL}/api/admin/districts/${id}`, {
        method: "DELETE",
        headers: { "user-id": userId || "" },
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to delete district");
      }
      
      setSuccess("District deleted successfully!");
      fetchDistricts();
    } catch (err: any) {
      setError(err.message || "Failed to delete district. Please try again.");
    }
  };

  // When opening modals
  const openAddModal = () => {
    setShowAddModal(true);
    setModalOpen(true);
  };
  const closeAddModal = () => {
    setShowAddModal(false);
    setModalOpen(false);
  };
  const openEditModal = (district: District) => {
    setEditingDistrict(district);
    setNewDistrictNames([district.name]);
    setNewDistrictState(district.state_id);
    setShowEditModal(true);
    setModalOpen(true);
  };
  const closeEditModal = () => {
    setShowEditModal(false);
    setModalOpen(false);
  };

  // Clear success message after 3 seconds
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  // Utility to capitalize each word
  function capitalizeWords(str: string) {
    return str.replace(/\b\w/g, c => c.toUpperCase()).replace(/\s+/g, ' ').trim();
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 to-brand-100">
      {/* Header (hide if modal is open) */}
      <div className="bg-white shadow-sm border-b border-brand-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div>
              <h1 className="text-2xl font-bold text-brand-900">District Master</h1>
              <p className="text-sm text-brand-600">Manage districts across states</p>
            </div>
            <Button 
              size="md" 
              variant="primary" 
              onClick={openAddModal}
              className="flex items-center gap-2"
              startIcon={<FaPlus className="w-4 h-4" />}
            >
              Add District
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-6">
          {/* Sidebar - State Selection */}
          <div className="w-80 flex-shrink-0">
            <div className="bg-white rounded-xl shadow-sm border border-brand-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-brand-900">States</h2>
                <Badge color="primary" size="sm">{states.length}</Badge>
              </div>
              <div className="space-y-2">
                {paginatedStates.map((state) => (
                  <button
                    key={state.id}
                    onClick={() => setSelectedState(state.id)}
                    className={`w-full text-left p-3 rounded-lg transition-all duration-200 flex items-center justify-between group ${
                      selectedState === state.id
                        ? 'bg-brand-500 text-white shadow-md'
                        : 'bg-brand-50 text-brand-700 hover:bg-brand-100'
                    }`}
                  >
                    <span className="font-medium">{state.name}</span>
                    <Badge 
                      color={selectedState === state.id ? "light" : "primary"} 
                      size="sm"
                    >
                      {getDistrictCount(state.id)}
                    </Badge>
                  </button>
                ))}
              </div>
              {/* State entry summary and pagination controls */}
              {totalStatesPages > 1 && (
                <div className="mt-4 pt-4 border-t border-brand-200">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      className="px-3 py-1 rounded border border-brand-200 bg-brand-50 text-brand-500 text-xs font-semibold disabled:opacity-50"
                      onClick={() => goToStatesPage(statesCurrentPage - 1)}
                      disabled={statesCurrentPage === 1}
                    >
                      Previous
                    </button>
                    {Array.from({ length: Math.min(5, totalStatesPages) }, (_, i) => {
                      const page = i + 1;
                      return (
                        <button
                          key={page}
                          className={`px-3 py-1 rounded border text-xs font-semibold ${
                            statesCurrentPage === page 
                              ? "bg-brand-500 text-white border-brand-500" 
                              : "bg-brand-50 text-brand-500 border-brand-200"
                          }`}
                          onClick={() => goToStatesPage(page)}
                        >
                          {page}
                        </button>
                      );
                    })}
                    <button
                      className="px-3 py-1 rounded border border-brand-200 bg-brand-50 text-brand-500 text-xs font-semibold disabled:opacity-50"
                      onClick={() => goToStatesPage(statesCurrentPage + 1)}
                      disabled={statesCurrentPage === totalStatesPages}
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1">
            {/* Search and Filter Bar */}
            <div className="bg-white rounded-xl shadow-sm border border-brand-200 p-6 mb-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-brand-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search districts..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-brand-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 bg-brand-50"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={pageSize}
                    onChange={(e) => setPageSize(Number(e.target.value))}
                    className="border border-brand-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 bg-brand-50"
                  >
                    {PAGE_SIZE_OPTIONS.map(size => (
                      <option key={size} value={size}>{size} per page</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            {/* Districts Display */}
            <div className="bg-white rounded-xl shadow-sm border border-brand-200 overflow-hidden">
              {selectedState ? (
                <>
                  <div className="px-6 py-4 border-b border-brand-200 bg-brand-50">
                    <h3 className="text-lg font-semibold text-brand-900">
                      Districts in {states.find(s => s.id === selectedState)?.name}
                    </h3>
                    <p className="text-sm text-brand-600">
                      {filteredDistricts.length} district{filteredDistricts.length !== 1 ? 's' : ''} found
                    </p>
                  </div>
                  {loading ? (
                    <div className="p-8 text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500 mx-auto"></div>
                      <p className="mt-2 text-brand-600">Loading districts...</p>
                    </div>
                  ) : paginatedDistricts.length === 0 ? (
                    <div className="p-8 text-center">
                      <div className="text-brand-400 mb-4">
                        <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-medium text-brand-900 mb-2">No districts found</h3>
                      <p className="text-brand-600">
                        {searchQuery ? 'Try adjusting your search terms.' : 'Get started by adding a new district.'}
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader className="bg-brand-50">
                            <TableRow>
                              <TableCell isHeader className="px-6 py-3 text-left text-xs font-bold text-brand-700 uppercase tracking-wider">
                                District Name
                              </TableCell>
                              <TableCell isHeader className="px-6 py-3 text-left text-xs font-bold text-brand-700 uppercase tracking-wider">
                                State
                              </TableCell>
                              <TableCell isHeader className="px-6 py-3 text-center text-xs font-bold text-brand-700 uppercase tracking-wider">
                                Actions
                              </TableCell>
                            </TableRow>
                          </TableHeader>
                          <TableBody className="divide-y divide-brand-200">
                            {paginatedDistricts.map((district) => (
                              <TableRow key={district.id} className="hover:bg-brand-50 transition-colors">
                                <TableCell className="px-6 py-4 text-brand-900 font-medium">
                                  {capitalizeWords(district.name)}
                                </TableCell>
                                <TableCell className="px-6 py-4 text-brand-700">
                                  {district.state_name}
                                </TableCell>
                                <TableCell className="px-6 py-4 text-center">
                                  <div className="flex items-center justify-center gap-2">
                                    <span
                                      role="button"
                                      title="Edit"
                                      className="cursor-pointer text-xl hover:text-brand-500"
                                      onClick={() => openEditModal(district)}
                                    >
                                      ✏️
                                    </span>
                                    <span
                                      role="button"
                                      title="Delete"
                                      className="cursor-pointer text-xl hover:text-error-500"
                                      onClick={() => handleDeleteDistrict(district.id)}
                                    >
                                      🗑️
                                    </span>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                      {/* District Pagination Controls (right-aligned) */}
                      {totalPages > 1 && (
                        <div className="px-6 py-4 border-t border-brand-200 bg-brand-50 flex items-center justify-end">
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setCurrentPage(currentPage - 1)}
                              disabled={currentPage === 1}
                            >
                              Previous
                            </Button>
                            <div className="flex items-center gap-1">
                              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                const page = i + 1;
                                return (
                                  <Button
                                    key={page}
                                    size="sm"
                                    variant={page === currentPage ? "primary" : "outline"}
                                    onClick={() => setCurrentPage(page)}
                                  >
                                    {page}
                                  </Button>
                                );
                              })}
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setCurrentPage(currentPage + 1)}
                              disabled={currentPage === totalPages}
                            >
                              Next
                            </Button>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </>
              ) : (
                <div className="p-8 text-center">
                  <div className="text-brand-400 mb-4">
                    <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 4m0 13V4m-6 3l6-3" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-brand-900 mb-2">Select a State</h3>
                  <p className="text-brand-600">Choose a state from the sidebar to view its districts.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="fixed top-4 right-4 bg-error-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center gap-2">
          <span>{error}</span>
          <button onClick={() => setError("")} className="ml-2">
            <FaTimes className="w-4 h-4" />
          </button>
        </div>
      )}
      
      {success && (
        <div className="fixed top-4 right-4 bg-success-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center gap-2">
          <span>{success}</span>
          <button onClick={() => setSuccess("")} className="ml-2">
            <FaTimes className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Add District Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(219,234,254,0.85)' }}>
          <div className="bg-white rounded-xl shadow-xl p-8 w-full max-w-xl mx-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-brand-900">Add New District</h2>
              <button
                onClick={closeAddModal}
                className="text-brand-400 hover:text-brand-600"
              >
                <FaTimes className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddDistrict} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-brand-700 mb-2">
                  State <span className="text-error-500">*</span>
                </label>
                <select
                  value={newDistrictState}
                  onChange={e => setNewDistrictState(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-brand-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                  required
                >
                  <option value="">Select a state</option>
                  {states.map(state => (
                    <option key={state.id} value={state.id}>{state.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-brand-700 mb-2">
                  District Name(s) <span className="text-error-500">*</span>
                </label>
                <div className="space-y-2">
                  {newDistrictNames.map((name, idx) => (
                    <div key={idx} className="flex gap-2 items-center">
                      <input
                        type="text"
                        value={name}
                        onChange={e => {
                          const arr = [...newDistrictNames];
                          arr[idx] = e.target.value;
                          setNewDistrictNames(arr);
                        }}
                        className="w-full px-3 py-2 border border-brand-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                        placeholder={`District name ${idx+1}`}
                        disabled={!newDistrictState || isSubmitting}
                      />
                      {newDistrictNames.length > 1 && (
                        <button
                          type="button"
                          className="text-error-500 text-lg px-2"
                          onClick={() => handleRemoveDistrictField(idx)}
                          disabled={isSubmitting}
                          title="Remove this field"
                        >
                          ❌
                        </button>
                      )}
                    </div>
                  ))}
                  {newDistrictNames.length < 5 && (
                    <button
                      type="button"
                      className="flex items-center gap-1 text-brand-500 hover:text-brand-700 mt-2 text-base font-medium"
                      onClick={handleAddDistrictField}
                      disabled={!newDistrictState || isSubmitting}
                    >
                      <span role="img" aria-label="Add">➕</span> Add another district
                    </button>
                  )}
                  <p className="text-xs text-brand-400 mt-1">You can add up to 5 districts at once. At least 1 is required.</p>
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 disabled:bg-brand-300 disabled:cursor-not-allowed transition"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Adding..." : "Add District(s)"}
                </button>
                <button
                  type="button"
                  className="flex-1 px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:cursor-not-allowed transition"
                  onClick={closeAddModal}
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit District Modal */}
      {showEditModal && editingDistrict && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-8 w-full max-w-xl mx-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-brand-900">Edit District</h2>
              <button
                onClick={closeEditModal}
                className="text-brand-400 hover:text-brand-600"
              >
                <FaTimes className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleEditDistrict} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-brand-700 mb-2">
                  State <span className="text-error-500">*</span>
                </label>
                <select
                  value={newDistrictState}
                  onChange={e => setNewDistrictState(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-brand-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                  required
                >
                  <option value="">Select a state</option>
                  {states.map(state => (
                    <option key={state.id} value={state.id}>{state.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-brand-700 mb-2">
                  District Name(s) <span className="text-error-500">*</span>
                </label>
                <div className="space-y-2">
                  {newDistrictNames.map((name, idx) => (
                    <div key={idx} className="flex gap-2 items-center">
                      <input
                        type="text"
                        value={name}
                        onChange={e => {
                          const arr = [...newDistrictNames];
                          arr[idx] = e.target.value;
                          setNewDistrictNames(arr);
                        }}
                        className="w-full px-3 py-2 border border-brand-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                        placeholder={`District name ${idx+1}`}
                        disabled={!newDistrictState || isSubmitting}
                      />
                      {newDistrictNames.length > 1 && (
                        <button
                          type="button"
                          className="text-error-500 text-lg px-2"
                          onClick={() => handleRemoveDistrictField(idx)}
                          disabled={isSubmitting}
                          title="Remove this field"
                        >
                          ❌
                        </button>
                      )}
                    </div>
                  ))}
                  {newDistrictNames.length < 5 && (
                    <button
                      type="button"
                      className="flex items-center gap-1 text-brand-500 hover:text-brand-700 mt-2 text-base font-medium"
                      onClick={handleAddDistrictField}
                      disabled={!newDistrictState || isSubmitting}
                    >
                      <span role="img" aria-label="Add">➕</span> Add another district
                    </button>
                  )}
                  <p className="text-xs text-brand-400 mt-1">Only the first field will be used for editing. You can add up to 5 fields for convenience.</p>
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 disabled:bg-brand-300 disabled:cursor-not-allowed transition"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Updating..." : "Update District"}
                </button>
                <button
                  type="button"
                  className="flex-1 px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:cursor-not-allowed transition"
                  onClick={closeEditModal}
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DistrictMaster;