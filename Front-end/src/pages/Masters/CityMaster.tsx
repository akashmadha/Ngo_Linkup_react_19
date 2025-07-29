import React, { useState, useEffect } from "react";
import { Table, TableHeader, TableBody, TableRow, TableCell } from '../../components/ui/table';
import Button from '../../components/ui/button/Button';
import Badge from '../../components/ui/badge/Badge';

interface City {
  id: number;
  name: string;
}

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

const CityMaster: React.FC = () => {
  const [cities, setCities] = useState<City[]>([]);
  const [cityName, setCityName] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [editValue, setEditValue] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZE_OPTIONS[0]);
  const [search, setSearch] = useState("");
  const [states, setStates] = useState<{ id: number, name: string }[]>([]);
  const [districts, setDistricts] = useState<{ id: number, name: string, state_id: number }[]>([]);
  const [talukas, setTalukas] = useState<{ id: number, name: string, state_id: number, district_id: number }[]>([]);
  const [selectedState, setSelectedState] = useState<number | ''>('');
  const [selectedDistrict, setSelectedDistrict] = useState<number | ''>('');
  const [selectedTaluka, setSelectedTaluka] = useState<number | ''>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch Cities
  const fetchCities = async (stateId?: number, districtId?: number, talukaId?: number) => {
    let url = 'http://localhost:3001/api/admin/cities';
    const params = [];
    if (stateId) params.push(`stateId=${stateId}`);
    if (districtId) params.push(`districtId=${districtId}`);
    if (talukaId) params.push(`talukaId=${talukaId}`);
    if (params.length > 0) url += `?${params.join('&')}`;
    const userId = localStorage.getItem('userId');
    try {
      const response = await fetch(url, {
        headers: { 'user-id': userId || '' }
      });
      const data = await response.json();
      setCities(data.data || []);
    } catch (err) {
      setCities([]);
    }
  };

  // Fetch cities on mount and when state/district/taluka changes
  useEffect(() => {
    if (selectedState && selectedDistrict && selectedTaluka) {
      fetchCities(Number(selectedState), Number(selectedDistrict), Number(selectedTaluka));
    } else if (selectedState && selectedDistrict) {
      fetchCities(Number(selectedState), Number(selectedDistrict));
    } else if (selectedState) {
      fetchCities(Number(selectedState));
    } else {
      fetchCities();
    }
  }, [selectedState, selectedDistrict, selectedTaluka]);

  useEffect(() => {
    // Fetch all states on mount
    fetch('http://localhost:3001/api/admin/states', {
      headers: { 'user-id': localStorage.getItem('userId') || '' }
    })
      .then(res => res.json())
      .then(data => setStates(data.data || []));
  }, []);

  useEffect(() => {
    // Fetch districts when state changes
    if (selectedState) {
      fetch(`http://localhost:3001/api/admin/districts?stateId=${selectedState}`, {
        headers: { 'user-id': localStorage.getItem('userId') || '' }
      })
        .then(res => res.json())
        .then(data => setDistricts(data.data || []));
    } else {
      setDistricts([]);
      setSelectedDistrict('');
    }
  }, [selectedState]);

  useEffect(() => {
    // Fetch talukas when district changes
    if (selectedState && selectedDistrict) {
      fetch(`http://localhost:3001/api/admin/talukas?stateId=${selectedState}&districtId=${selectedDistrict}`, {
        headers: { 'user-id': localStorage.getItem('userId') || '' }
      })
        .then(res => res.json())
        .then(data => setTalukas(data.data || []));
    } else {
      setTalukas([]);
      setSelectedTaluka('');
    }
  }, [selectedState, selectedDistrict]);

  // Edit City
  const handleEdit = (idx: number) => {
    setEditIndex(idx);
    setEditValue(cities[idx].name);
    setError("");
  };

  const handleEditSave = (idx: number) => {
    if (!editValue.trim()) {
      setError("City name is required");
      return;
    }
    if (cities.some((c, i) => c.name.toLowerCase() === editValue.trim().toLowerCase() && i !== idx)) {
      setError("City already exists");
      return;
    }
    const updated = [...cities];
    updated[idx] = { ...updated[idx], name: editValue.trim() };
    setCities(updated);
    setEditIndex(null);
    setEditValue("");
    setError("");
    setSuccess("City updated successfully!");
  };

  const handleEditCancel = () => {
    setEditIndex(null);
    setEditValue("");
    setError("");
  };

  // Delete City
  const handleDelete = (idx: number) => {
    setCities(cities.filter((_, i) => i !== idx));
    if (editIndex === idx) {
      setEditIndex(null);
      setEditValue("");
    }
    setSuccess("City deleted successfully!");
  };

  const handleAddCity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cityName.trim() || !selectedState || !selectedDistrict || !selectedTaluka) {
      setError('City name, state, district, and taluka are required');
      return;
    }
    setIsSubmitting(true);
    setError('');
    setSuccess('');
    try {
      const userId = localStorage.getItem('userId');
      const response = await fetch('http://localhost:3001/api/admin/cities', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'user-id': userId || ''
        },
        body: JSON.stringify({
          name: cityName.trim(),
          stateId: selectedState,
          districtId: selectedDistrict,
          talukaId: selectedTaluka
        })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to add city');
      setSuccess('City added successfully!');
      setCityName('');
      setSelectedState('');
      setSelectedDistrict('');
      setSelectedTaluka('');
      // Refresh city list after adding
      fetchCities();
    } catch (err: any) {
      setError(err.message || 'Failed to add city. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Search and Pagination
  const filteredCities = cities.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));
  const totalPages = Math.ceil(filteredCities.length / pageSize);
  const paginatedCities = filteredCities.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const startEntry = filteredCities.length === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endEntry = Math.min(currentPage * pageSize, filteredCities.length);

  // Clear success message after 3 seconds
  React.useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  return (
    <div className="flex items-center justify-center min-h-[80vh] bg-brand-50">
      <div className="bg-white shadow-theme-lg rounded-2xl p-8 w-full max-w-5xl border border-brand-100">
        <h2 className="text-3xl font-extrabold text-center text-brand-500 mb-6 tracking-wide drop-shadow">City Master</h2>
        {/* Add/Edit City Form */}
        <form onSubmit={editIndex === null ? handleAddCity : (e) => { e.preventDefault(); handleEditSave(editIndex); }} className="bg-white rounded-xl shadow-theme-md p-6 mb-8 flex flex-col gap-4 border border-brand-100">
          <div className="flex flex-col md:flex-row gap-4 items-end">
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
            <select
              value={selectedTaluka}
              onChange={e => setSelectedTaluka(Number(e.target.value))}
              className="border border-brand-300 rounded-lg px-4 py-2 min-w-[180px] w-auto flex-1 focus:outline-none focus:ring-2 focus:ring-brand-300 focus:border-brand-500 transition bg-brand-50 text-brand-700"
              required
              disabled={!selectedDistrict}
            >
              <option value="">Select Taluka</option>
              {talukas.map(taluka => (
                <option key={taluka.id} value={taluka.id}>{taluka.name}</option>
              ))}
            </select>
            <input
              type="text"
              value={cityName}
              onChange={e => setCityName(e.target.value)}
              placeholder="Enter city name"
              className="border border-brand-300 rounded-lg px-4 py-2 min-w-[180px] w-auto flex-1 focus:outline-none focus:ring-2 focus:ring-brand-300 focus:border-brand-500 transition bg-brand-50 text-brand-700 placeholder:text-brand-300"
              required
            />
            <Button size="md" variant="primary" disabled={isSubmitting}>
              {editIndex === null ? (isSubmitting ? 'Adding...' : 'Add City') : (isSubmitting ? 'Updating...' : 'Update City')}
            </Button>
            {editIndex !== null && (
              <Button size="md" variant="outline" onClick={handleEditCancel} disabled={isSubmitting}>
                Cancel
              </Button>
            )}
          </div>
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
            placeholder="Search city..."
            className="border border-brand-300 rounded-lg px-4 py-2 w-full max-w-xs focus:outline-none focus:ring-2 focus:ring-brand-300 focus:border-brand-500 transition bg-brand-50 text-brand-700 placeholder:text-brand-300"
          />
        </div>
        {/* City Table */}
        <div className="overflow-hidden rounded-xl border border-brand-100 bg-white shadow-theme-md">
          <div className="max-w-full overflow-x-auto">
            <Table>
              <TableHeader className="border-b border-brand-100">
                <TableRow>
                  <TableCell isHeader className="px-6 py-3 text-left text-xs font-bold text-brand-400 uppercase tracking-wider border-b border-brand-100">#</TableCell>
                  <TableCell isHeader className="px-6 py-3 text-left text-xs font-bold text-brand-400 uppercase tracking-wider border-b border-brand-100">City Name</TableCell>
                  <TableCell isHeader className="px-6 py-3 text-center text-xs font-bold text-brand-400 uppercase tracking-wider border-b border-brand-100">Actions</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-brand-100">
                {paginatedCities.length === 0 ? (
                  <TableRow>
                    <td colSpan={3} className="text-center py-8 text-brand-300">No cities found.</td>
                  </TableRow>
                ) : (
                  paginatedCities.map((city, idx) => (
                    <TableRow key={city.id} className="hover:bg-brand-50 transition">
                      <TableCell className="px-6 py-3 border-b border-brand-100 text-brand-700 font-medium w-12">{(currentPage - 1) * pageSize + idx + 1}</TableCell>
                      <TableCell className="px-6 py-3 border-b border-brand-100 text-brand-900 font-semibold">{city.name}</TableCell>
                      <TableCell className="px-6 py-3 border-b border-brand-100 text-center w-40">
                        <div className="flex gap-4 justify-center text-xl">
                          <Button size="sm" variant="outline" onClick={() => handleEdit((currentPage - 1) * pageSize + idx)}>
                            <span role="img" aria-label="Edit">✏️</span>
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleDelete((currentPage - 1) * pageSize + idx)}>
                            <span role="img" aria-label="Delete">🗑️</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mt-6 gap-2 px-6 pb-6">
              <div className="text-brand-400 text-sm">
                Showing {startEntry} to {endEntry} of {filteredCities.length} entries
              </div>
              <div className="flex gap-1 flex-wrap justify-center md:justify-end">
                <Button size="sm" variant="outline" onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage === 1}>Previous</Button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <Button
                    key={page}
                    size="sm"
                    variant={page === currentPage ? "primary" : "outline"}
                    onClick={() => setCurrentPage(page)}
                    disabled={page === currentPage}
                  >
                    {page}
                  </Button>
                ))}
                <Button size="sm" variant="outline" onClick={() => setCurrentPage(currentPage + 1)} disabled={currentPage === totalPages}>Next</Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CityMaster; 