import React, { useState, useEffect } from 'react';

interface OtherDetail {
  detail: string;
  date: string;
}

interface RegistrationDetails {
  organizationName: string;
  registrationType: string;
  registrationNo: string;
  registrationDate: string;
  otherRegistrationNo: string;
  otherRegistrationDate: string;
  panNo: string;
  tanNo: string;
  gstNo: string;
  nitiAyogId: string;
  nitiAyogRegDate: string;
  otherDetails: OtherDetail[];
}

const initialState: RegistrationDetails = {
  organizationName: '',
  registrationType: '',
  registrationNo: '',
  registrationDate: '',
  otherRegistrationNo: '',
  otherRegistrationDate: '',
  panNo: '',
  tanNo: '',
  gstNo: '',
  nitiAyogId: '',
  nitiAyogRegDate: '',
  otherDetails: [],
};

const RegistrationDetailsForm: React.FC = () => {
  const [form, setForm] = useState<RegistrationDetails>(initialState);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Ensure otherDetails is always an array (fix for .map error)
  useEffect(() => {
    if (!Array.isArray(form.otherDetails)) {
      let parsed = [];
      if (typeof form.otherDetails === 'string') {
        try {
          parsed = JSON.parse(form.otherDetails) || [];
        } catch {
          parsed = [];
        }
      }
      setForm((prev) => ({ ...prev, otherDetails: parsed }));
    }
  }, [form.otherDetails]);

  // Load registration details from backend on mount
  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch('/api/member/registration-details', {
      headers: { 'user-id': localStorage.getItem('userId') || '' }
    })
      .then(res => res.json())
      .then(res => {
        if (res.data) {
          setForm({
            ...initialState,
            ...res.data,
            otherDetails: Array.isArray(res.data.other_details) ? res.data.other_details : [],
          });
        }
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load registration details.');
        setLoading(false);
      });
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Dynamic Other Details handlers
  const handleOtherDetailChange = (idx: number, field: 'detail' | 'date', value: string) => {
    setForm((prev) => ({
      ...prev,
      otherDetails: prev.otherDetails.map((od, i) => i === idx ? { ...od, [field]: value } : od)
    }));
  };

  const addOtherDetail = () => {
    setForm((prev) => ({
      ...prev,
      otherDetails: [...prev.otherDetails, { detail: '', date: '' }]
    }));
  };

  const removeOtherDetail = (idx: number) => {
    setForm((prev) => ({
      ...prev,
      otherDetails: prev.otherDetails.filter((_, i) => i !== idx)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(null);
    setError(null);
    fetch('/api/member/registration-details', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'user-id': localStorage.getItem('userId') || ''
      },
      body: JSON.stringify(form)
    })
      .then(res => res.json())
      .then(res => {
        if (res.success) {
          setSuccess('Registration details saved!');
        } else {
          setError(res.error || 'Error saving details');
        }
        setLoading(false);
      })
      .catch(() => {
        setError('Error saving details');
        setLoading(false);
      });
  };

  return (
    <form className="space-y-4 w-full bg-white rounded-lg shadow-lg p-6 flex flex-col items-center mt-8" style={{border: '1px solid rgb(50, 96, 168)', maxWidth: 700, margin: '2rem auto 15px auto'}} onSubmit={handleSubmit}>
      <h2 className="text-2xl font-semibold mb-6 text-center" style={{color: 'rgb(50, 96, 168)'}}>Organization Details</h2>
      {loading && <div className="text-blue-700 mb-2">Loading...</div>}
      {success && <div className="text-green-600 mb-2">{success}</div>}
      {error && <div className="text-red-600 mb-2">{error}</div>}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
        <div>
          <label className="block font-medium mb-1" style={{color: 'rgb(50, 96, 168)'}}>Name of the Organization</label>
          <input type="text" name="organizationName" value={form.organizationName} onChange={handleChange} className="input input-bordered w-full bg-white border-2" style={{borderColor: 'rgb(50, 96, 168)', background: 'white'}} />
        </div>
        <div>
          <label className="block font-medium mb-1" style={{color: 'rgb(50, 96, 168)'}}>Type of registration</label>
          <select name="registrationType" value={form.registrationType} onChange={handleChange} className="input input-bordered w-full bg-white border-2" style={{borderColor: 'rgb(50, 96, 168)', background: 'white'}}>
            <option value="">Select</option>
            <option value="Society">Society</option>
            <option value="Trust">Trust</option>
            <option value="Company">Company</option>
          </select>
        </div>
        <div>
          <label className="block font-medium mb-1" style={{color: 'rgb(50, 96, 168)'}}>Registration No.</label>
          <input type="text" name="registrationNo" value={form.registrationNo} onChange={handleChange} className="input input-bordered w-full bg-white border-2" style={{borderColor: 'rgb(50, 96, 168)', background: 'white'}} />
        </div>
        <div>
          <label className="block font-medium mb-1" style={{color: 'rgb(50, 96, 168)'}}>Registration Date</label>
          <input type="date" name="registrationDate" value={form.registrationDate} onChange={handleChange} className="input input-bordered w-full bg-white border-2" style={{borderColor: 'rgb(50, 96, 168)', background: 'white'}} />
        </div>
        <div>
          <label className="block font-medium mb-1" style={{color: 'rgb(50, 96, 168)'}}>Other Registration No.</label>
          <input type="text" name="otherRegistrationNo" value={form.otherRegistrationNo} onChange={handleChange} className="input input-bordered w-full bg-white border-2" style={{borderColor: 'rgb(50, 96, 168)', background: 'white'}} />
        </div>
        <div>
          <label className="block font-medium mb-1" style={{color: 'rgb(50, 96, 168)'}}>Other Registration Date</label>
          <input type="date" name="otherRegistrationDate" value={form.otherRegistrationDate} onChange={handleChange} className="input input-bordered w-full bg-white border-2" style={{borderColor: 'rgb(50, 96, 168)', background: 'white'}} />
        </div>
        <div>
          <label className="block font-medium mb-1" style={{color: 'rgb(50, 96, 168)'}}>PAN No.</label>
          <input type="text" name="panNo" value={form.panNo} onChange={handleChange} className="input input-bordered w-full bg-white border-2" style={{borderColor: 'rgb(50, 96, 168)', background: 'white'}} />
        </div>
        <div>
          <label className="block font-medium mb-1" style={{color: 'rgb(50, 96, 168)'}}>TAN No.</label>
          <input type="text" name="tanNo" value={form.tanNo} onChange={handleChange} className="input input-bordered w-full bg-white border-2" style={{borderColor: 'rgb(50, 96, 168)', background: 'white'}} />
        </div>
        <div>
          <label className="block font-medium mb-1" style={{color: 'rgb(50, 96, 168)'}}>GST No.</label>
          <input type="text" name="gstNo" value={form.gstNo} onChange={handleChange} className="input input-bordered w-full bg-white border-2" style={{borderColor: 'rgb(50, 96, 168)', background: 'white'}} />
        </div>
        <div>
          <label className="block font-medium mb-1" style={{color: 'rgb(50, 96, 168)'}}>Niti Ayog (NGO Darpan) ID</label>
          <input type="text" name="nitiAyogId" value={form.nitiAyogId} onChange={handleChange} className="input input-bordered w-full bg-white border-2" style={{borderColor: 'rgb(50, 96, 168)', background: 'white'}} />
        </div>
        <div>
          <label className="block font-medium mb-1" style={{color: 'rgb(50, 96, 168)'}}>Niti Ayog Registration Date</label>
          <input type="date" name="nitiAyogRegDate" value={form.nitiAyogRegDate} onChange={handleChange} className="input input-bordered w-full bg-white border-2" style={{borderColor: 'rgb(50, 96, 168)', background: 'white'}} />
        </div>
        <div>
          <label className="block font-medium mb-1" style={{color: 'rgb(50, 96, 168)'}}>Other Details Date</label>
          <input type="date" name="otherDetailsDate" value={form.otherDetailsDate || ''} onChange={handleChange} className="input input-bordered w-full bg-white border-2" style={{borderColor: 'rgb(50, 96, 168)', background: 'white'}} />
        </div>
        {/* Dynamic Other Details Section */}
        <div className="md:col-span-2">
          <label className="block font-medium mb-1" style={{color: 'rgb(50, 96, 168)'}}>Add Other Details</label>
          <div className="space-y-2">
            {form.otherDetails.map((od, idx) => (
              <div key={idx} className="flex flex-col md:flex-row gap-2 items-center mb-2">
                <input
                  type="text"
                  placeholder="Detail"
                  value={od.detail}
                  onChange={e => handleOtherDetailChange(idx, 'detail', e.target.value)}
                  className="input input-bordered bg-white border-2 flex-1"
                  style={{borderColor: 'rgb(50, 96, 168)', background: 'white'}}
                />
                <input
                  type="date"
                  value={od.date}
                  onChange={e => handleOtherDetailChange(idx, 'date', e.target.value)}
                  className="input input-bordered bg-white border-2"
                  style={{borderColor: 'rgb(50, 96, 168)', background: 'white'}}
                />
                <button type="button" onClick={() => removeOtherDetail(idx)} className="btn btn-sm ml-2 px-2 py-1 rounded-md" style={{backgroundColor: '#e53e3e', color: 'white'}}>Delete</button>
              </div>
            ))}
            <button type="button" onClick={addOtherDetail} className="btn btn-sm px-2 py-1 rounded-md" style={{backgroundColor: 'rgb(50, 96, 168)', color: 'white'}}>Add More</button>
          </div>
        </div>
      </div>
      <button type="submit" className="btn mt-4 w-full" style={{backgroundColor: 'rgb(50, 96, 168)', color: 'white'}} disabled={loading}>Save Details</button>
    </form>
  );
};

export default RegistrationDetailsForm; 