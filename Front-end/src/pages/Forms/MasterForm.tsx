import React, { useState } from "react";

interface StateItem {
  id: string;
  name: string;
}
interface DistrictItem {
  id: string;
  stateId: string;
  stateName: string;
  name: string;
}

const MasterForm: React.FC = () => {
  // State Master
  const [states, setStates] = useState<StateItem[]>([]);
  const [showAddState, setShowAddState] = useState(false);
  const [newState, setNewState] = useState<StateItem>({ id: "", name: "" });
  const [selectedStateId, setSelectedStateId] = useState<string>("");

  // District Master
  const [districts, setDistricts] = useState<DistrictItem[]>([]);
  const [showAddDistrict, setShowAddDistrict] = useState(false);
  const [newDistrict, setNewDistrict] = useState<{ id: string; name: string }>({ id: "", name: "" });

  // Main Form
  const [mainStateId, setMainStateId] = useState("");
  const [mainDistrictId, setMainDistrictId] = useState("");

  // Add State
  const handleAddState = () => {
    setShowAddState(true);
    setNewState({ id: "", name: "" });
  };
  const handleSaveState = () => {
    if (newState.id.trim() && newState.name.trim()) {
      setStates((prev) => [...prev, newState]);
      setShowAddState(false);
      setNewState({ id: "", name: "" });
    }
  };
  const handleCancelState = () => {
    setShowAddState(false);
    setNewState({ id: "", name: "" });
  };

  // Add District
  const handleAddDistrict = () => {
    setShowAddDistrict(true);
    setNewDistrict({ id: "", name: "" });
  };
  const handleSaveDistrict = () => {
    if (selectedStateId && newDistrict.id.trim() && newDistrict.name.trim()) {
      const stateName = states.find(s => s.id === selectedStateId)?.name || "";
      setDistricts((prev) => [...prev, { id: newDistrict.id, name: newDistrict.name, stateId: selectedStateId, stateName }]);
      setShowAddDistrict(false);
      setNewDistrict({ id: "", name: "" });
    }
  };
  const handleCancelDistrict = () => {
    setShowAddDistrict(false);
    setNewDistrict({ id: "", name: "" });
  };

  // Filtered districts for selected state
  const filteredDistricts = districts.filter(d => d.stateId === selectedStateId);
  const mainDistricts = districts.filter(d => d.stateId === mainStateId);

  return (
    <div className="p-8 bg-white dark:bg-gray-900 rounded-lg shadow-md max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-brand-500">Master Form</h1>

      {/* State Master Section */}
      <section className="mb-10">
        <div className="flex items-center mb-2">
          <h2 className="text-lg font-semibold mr-4">1. State Master</h2>
          <button
            type="button"
            className="px-3 py-1 bg-brand-500 hover:bg-brand-600 text-white rounded text-sm"
            onClick={handleAddState}
            disabled={showAddState}
          >
            Add State
          </button>
        </div>
        {showAddState && (
          <div className="flex flex-col md:flex-row gap-2 mb-2">
            <input
              className="input input-bordered w-full md:w-32"
              placeholder="State ID"
              value={newState.id}
              onChange={e => setNewState(s => ({ ...s, id: e.target.value }))}
            />
            <input
              className="input input-bordered w-full"
              placeholder="State Name"
              value={newState.name}
              onChange={e => setNewState(s => ({ ...s, name: e.target.value }))}
            />
            <button
              type="button"
              className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white rounded text-sm"
              onClick={handleSaveState}
            >
              Save
            </button>
            <button
              type="button"
              className="px-3 py-1 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded text-sm"
              onClick={handleCancelState}
            >
              Cancel
            </button>
          </div>
        )}
        {states.length > 0 && (
          <table className="min-w-full mt-4 border text-sm">
            <thead>
              <tr className="bg-gray-100 dark:bg-gray-800">
                <th className="px-3 py-2 border">State ID</th>
                <th className="px-3 py-2 border">State Name</th>
              </tr>
            </thead>
            <tbody>
              {states.map((item, idx) => (
                <tr key={idx}>
                  <td className="px-3 py-2 border text-center">{item.id}</td>
                  <td className="px-3 py-2 border">{item.name}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {/* District Master Section */}
      <section className="mb-10">
        <div className="flex items-center mb-2">
          <h2 className="text-lg font-semibold mr-4">2. District Master</h2>
          <select
            className="input input-bordered mr-2"
            value={selectedStateId}
            onChange={e => setSelectedStateId(e.target.value)}
          >
            <option value="">Select State</option>
            {states.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
          <button
            type="button"
            className="px-3 py-1 bg-brand-500 hover:bg-brand-600 text-white rounded text-sm"
            onClick={handleAddDistrict}
            disabled={showAddDistrict || !selectedStateId}
          >
            Add District
          </button>
        </div>
        {showAddDistrict && (
          <div className="flex flex-col md:flex-row gap-2 mb-2">
            <input
              className="input input-bordered w-full md:w-32"
              placeholder="District ID"
              value={newDistrict.id}
              onChange={e => setNewDistrict(d => ({ ...d, id: e.target.value }))}
            />
            <input
              className="input input-bordered w-full"
              placeholder="District Name"
              value={newDistrict.name}
              onChange={e => setNewDistrict(d => ({ ...d, name: e.target.value }))}
            />
            <button
              type="button"
              className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white rounded text-sm"
              onClick={handleSaveDistrict}
            >
              Save
            </button>
            <button
              type="button"
              className="px-3 py-1 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded text-sm"
              onClick={handleCancelDistrict}
            >
              Cancel
            </button>
          </div>
        )}
        {selectedStateId && filteredDistricts.length > 0 && (
          <table className="min-w-full mt-4 border text-sm">
            <thead>
              <tr className="bg-gray-100 dark:bg-gray-800">
                <th className="px-3 py-2 border">District ID</th>
                <th className="px-3 py-2 border">State Name</th>
                <th className="px-3 py-2 border">District Name</th>
              </tr>
            </thead>
            <tbody>
              {filteredDistricts.map((item, idx) => (
                <tr key={idx}>
                  <td className="px-3 py-2 border text-center">{item.id}</td>
                  <td className="px-3 py-2 border">{item.stateName}</td>
                  <td className="px-3 py-2 border">{item.name}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
};

export default MasterForm; 