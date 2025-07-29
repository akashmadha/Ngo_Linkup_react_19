import React, { useState, useEffect } from 'react';

const steps = [
  'Organization Details',
  'Certification Details',
  'Registered Office Address',
  'Communication Details',
  'Key Contact Person',
];

const initialFormData = {
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
  otherDetails: '',
};

const OrganizationWizard: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [completed, setCompleted] = useState<boolean[]>([false, false, false, false, false]);
  const [formData, setFormData] = useState(initialFormData);
  const [otherDetailsList, setOtherDetailsList] = useState([{ detail: '', date: '' }]);
  const [submitted, setSubmitted] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [stepSaved, setStepSaved] = useState<boolean[]>([false, false, false, false, false]);
  const [loading, setLoading] = useState(false);

  // Add state for Certification Details
  const [certification, setCertification] = useState({
    reg12A: '', reg12ADate: '',
    reg80G: '', reg80GDate: '',
    reg35AC: '', reg35ACDate: '',
    regFCRA: '', regFCRADate: '',
    regCSR1: '', regCSR1Date: '',
    regGCSR: '', regGCSRDate: '',
  });
  const [certOtherList, setCertOtherList] = useState([{ detail: '', date: '' }]);

  // Add state for Address of the registered office
  const [address, setAddress] = useState({
    address1: '',
    address2: '',
    state: '',
    district: '',
    tahsil: '',
    city: '',
    pincode: '',
  });
  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setAddress(prev => ({ ...prev, [name]: value }));
  };

  // Add state for Communication Details
  const [phones, setPhones] = useState(['']);
  const [emails, setEmails] = useState(['']);
  const [website, setWebsite] = useState('');
  const [socialLinks, setSocialLinks] = useState(['']);
  const handlePhoneChange = (idx: number, value: string) => {
    setPhones(list => {
      const updated = [...list];
      updated[idx] = value;
      return updated;
    });
  };
  const handleAddPhone = () => setPhones(list => [...list, '']);
  const handleRemovePhone = (idx: number) => setPhones(list => list.filter((_, i) => i !== idx));

  const handleEmailChange = (idx: number, value: string) => {
    setEmails(list => {
      const updated = [...list];
      updated[idx] = value;
      return updated;
    });
  };
  const handleAddEmail = () => setEmails(list => [...list, '']);
  const handleRemoveEmail = (idx: number) => setEmails(list => list.filter((_, i) => i !== idx));

  const handleWebsiteChange = (e: React.ChangeEvent<HTMLInputElement>) => setWebsite(e.target.value);
  const handleSocialLinkChange = (idx: number, value: string) => {
    setSocialLinks(list => {
      const updated = [...list];
      updated[idx] = value;
      return updated;
    });
  };
  const handleAddSocialLink = () => setSocialLinks(list => [...list, '']);
  const handleRemoveSocialLink = (idx: number) => setSocialLinks(list => list.filter((_, i) => i !== idx));

  // Add state for Key Contact Person
  const [contactPerson, setContactPerson] = useState({
    spoc: '',
    mobile: '',
    email: '',
  });
  const handleContactPersonChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setContactPerson(prev => ({ ...prev, [name]: value }));
  };

  // Animation classes
  const transition = 'transition-all duration-500 ease-in-out';

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleOtherDetailChange = (idx: number, field: 'detail' | 'date', value: string) => {
    setOtherDetailsList(list => {
      const updated = [...list];
      updated[idx][field] = value;
      return updated;
    });
  };

  const handleAddOtherDetail = () => {
    setOtherDetailsList(list => [...list, { detail: '', date: '' }]);
  };

  const handleRemoveOtherDetail = (idx: number) => {
    setOtherDetailsList(list => list.filter((_, i) => i !== idx));
  };

  const handleCertChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCertification(prev => ({ ...prev, [name]: value }));
  };
  const handleCertOtherChange = (idx: number, field: 'detail' | 'date', value: string) => {
    setCertOtherList(list => {
      const updated = [...list];
      updated[idx][field] = value;
      return updated;
    });
  };
  const handleAddCertOther = () => setCertOtherList(list => [...list, { detail: '', date: '' }]);
  const handleRemoveCertOther = (idx: number) => setCertOtherList(list => list.filter((_, i) => i !== idx));

  // Validation for each step
  const validateStep = () => {
    switch (currentStep) {
      case 0: // Organization Details
        if (!formData.organizationName || !formData.registrationType || !formData.registrationNo || !formData.registrationDate) {
          setErrorMsg('Please fill all required Organization Details fields.');
          return false;
        }
        break;
      case 1: // Certification Details
        // Example: require at least one certification number
        if (!certification.reg12A && !certification.reg80G && !certification.reg35AC && !certification.regFCRA && !certification.regCSR1 && !certification.regGCSR) {
          setErrorMsg('Please enter at least one certification number.');
          return false;
        }
        break;
      case 2: // Registered Office Address
        if (!address.address1 || !address.state || !address.district || !address.city || !address.pincode) {
          setErrorMsg('Please fill all required address fields.');
          return false;
        }
        break;
      case 3: // Communication Details
        if (!phones[0] || !emails[0]) {
          setErrorMsg('Please provide at least one phone and one email.');
          return false;
        }
        break;
      case 4: // Key Contact Person
        if (!contactPerson.spoc || !contactPerson.mobile || !contactPerson.email) {
          setErrorMsg('Please fill all required contact person fields.');
          return false;
        }
        break;
      default:
        break;
    }
    setErrorMsg('');
    return true;
  };

  // Fetch and pre-fill data on mount
  useEffect(() => {
    const fetchData = async () => {
      const userId = localStorage.getItem('userId');
      if (!userId) return;
      setLoading(true);
      try {
        const res = await fetch('http://localhost:3001/api/member/registration-details', {
          headers: { 'user-id': userId }
        });
        const data = await res.json();
        if (res.ok && data.data) {
          // Pre-fill all steps from backend data
          setFormData({
            organizationName: data.data.organization_name || '',
            registrationType: data.data.registration_type || '',
            registrationNo: data.data.registration_no || '',
            registrationDate: data.data.registration_date || '',
            otherRegistrationNo: data.data.other_registration_no || '',
            otherRegistrationDate: data.data.other_registration_date || '',
            panNo: data.data.pan_no || '',
            tanNo: data.data.tan_no || '',
            gstNo: data.data.gst_no || '',
            nitiAyogId: data.data.niti_ayog_id || '',
            nitiAyogRegDate: data.data.niti_ayog_reg_date || '',
            otherDetails: '',
          });
          setOtherDetailsList(Array.isArray(data.data.other_details) ? data.data.other_details : []);
          // TODO: Pre-fill other steps if backend supports them
        }
      } catch (err) {
        // ignore
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Save data to backend after every step
  const saveStepData = async () => {
    const userId = localStorage.getItem('userId');
    if (!userId) return;
    setLoading(true);
    setSuccessMsg('');
    setErrorMsg('');
    // Prepare payload (map all wizard state)
    const payload = {
      // Organization Details
      organizationName: formData.organizationName,
      registrationType: formData.registrationType,
      registrationNo: formData.registrationNo,
      registrationDate: formData.registrationDate,
      otherRegistrationNo: formData.otherRegistrationNo,
      otherRegistrationDate: formData.otherRegistrationDate,
      panNo: formData.panNo,
      tanNo: formData.tanNo,
      gstNo: formData.gstNo,
      nitiAyogId: formData.nitiAyogId,
      nitiAyogRegDate: formData.nitiAyogRegDate,
      otherDetails: '',
      otherDetailsList,
      // Certification Details
      reg12A: certification.reg12A,
      reg12ADate: certification.reg12ADate,
      reg80G: certification.reg80G,
      reg80GDate: certification.reg80GDate,
      reg35AC: certification.reg35AC,
      reg35ACDate: certification.reg35ACDate,
      regFCRA: certification.regFCRA,
      regFCRADate: certification.regFCRADate,
      regCSR1: certification.regCSR1,
      regCSR1Date: certification.regCSR1Date,
      regGCSR: certification.regGCSR,
      regGCSRDate: certification.regGCSRDate,
      certOtherList,
      // Address
      address1: address.address1,
      address2: address.address2,
      state: address.state,
      district: address.district,
      tahsil: address.tahsil,
      city: address.city,
      pincode: address.pincode,
      // Communication
      phones,
      emails,
      website,
      socialLinks,
      // Key Contact Person
      spoc: contactPerson.spoc,
      contactMobile: contactPerson.mobile,
      contactEmail: contactPerson.email,
    };
    try {
      const res = await fetch('http://localhost:3001/api/member/registration-details', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'user-id': userId
        },
        body: JSON.stringify(payload)
      });
      const result = await res.json();
      if (res.ok && result.success) {
        setSuccessMsg('Saved successfully!');
        setErrorMsg('');
        setStepSaved((prev) => {
          const updated = [...prev];
          updated[currentStep] = true;
          return updated;
        });
        setTimeout(() => setSuccessMsg(''), 2000);
      } else {
        setErrorMsg(result.error || 'Failed to save.');
        setSuccessMsg('');
      }
    } catch (err) {
      setErrorMsg('Network or server error. Please try again.');
      setSuccessMsg('');
    } finally {
      setLoading(false);
    }
  };

  const handleNext = async () => {
    if (loading) return; // Prevent duplicate submissions
    if (validateStep()) {
      await saveStepData();
      if (!errorMsg) {
        const newCompleted = [...completed];
        newCompleted[currentStep] = true;
        setCompleted(newCompleted);
        setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
      }
    }
  };

  const handleBack = () => {
    const newCompleted = [...completed];
    newCompleted[currentStep] = false;
    setCompleted(newCompleted);
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    // TODO: Integrate with backend if needed
  };

  // Progress bar with checkmarks
  const renderProgress = () => (
    <div className="flex items-center justify-between mb-8">
      {steps.map((label, idx) => (
        <div key={label} className="flex-1 flex flex-col items-center relative">
          <div
            className={`w-8 h-8 flex items-center justify-center rounded-full border-2 ${
              completed[idx] || currentStep > idx
                ? 'bg-green-500 border-green-500 text-white'
                : currentStep === idx
                ? 'border-brand-500 text-brand-500 bg-white'
                : 'border-gray-300 text-gray-400 bg-white'
            } ${transition}`}
          >
            {stepSaved[idx] || completed[idx] || currentStep > idx ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
            ) : (
              idx + 1
            )}
          </div>
          <span className="mt-2 text-xs text-center w-24 text-gray-700 dark:text-gray-200">{label}</span>
          {idx < steps.length - 1 && (
            <div className={`absolute top-4 left-full w-full h-1 ${stepSaved[idx] || completed[idx] ? 'bg-green-500' : 'bg-gray-300'} ${transition}`}></div>
          )}
        </div>
      ))}
    </div>
  );

  // Step content - only show Organization Details form
  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="p-6 bg-white rounded-lg shadow-md dark:bg-gray-900">
            <h2 className="text-lg font-semibold mb-4 text-brand-500">Organization Details</h2>
            {submitted ? (
              <div className="text-green-600 dark:text-green-400 font-medium text-center mb-4">
                Details submitted successfully!
              </div>
            ) : null}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Name of the Organization</label>
                  <input
                    className="input input-bordered w-full"
                    name="organizationName"
                    value={formData.organizationName}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Type of registration</label>
                  <select
                    className="input input-bordered w-full"
                    name="registrationType"
                    value={formData.registrationType}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select type</option>
                    <option value="Society">Society</option>
                    <option value="Trust">Trust</option>
                    <option value="Company">Company</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Registration No.</label>
                  <input
                    className="input input-bordered w-full"
                    name="registrationNo"
                    value={formData.registrationNo}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Registration Date</label>
                  <input
                    type="date"
                    className="input input-bordered w-full"
                    name="registrationDate"
                    value={formData.registrationDate}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Other Registration No.</label>
                  <input
                    className="input input-bordered w-full"
                    name="otherRegistrationNo"
                    value={formData.otherRegistrationNo}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Other Registration Date</label>
                  <input
                    type="date"
                    className="input input-bordered w-full"
                    name="otherRegistrationDate"
                    value={formData.otherRegistrationDate}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">PAN No.</label>
                  <input
                    className="input input-bordered w-full"
                    name="panNo"
                    value={formData.panNo}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">TAN No.</label>
                  <input
                    className="input input-bordered w-full"
                    name="tanNo"
                    value={formData.tanNo}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">GST No.</label>
                  <input
                    className="input input-bordered w-full"
                    name="gstNo"
                    value={formData.gstNo}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Niti Ayog (NGO Darpan) ID</label>
                  <input
                    className="input input-bordered w-full"
                    name="nitiAyogId"
                    value={formData.nitiAyogId}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Niti Ayog Registration Date</label>
                  <input
                    type="date"
                    className="input input-bordered w-full"
                    name="nitiAyogRegDate"
                    value={formData.nitiAyogRegDate}
                    onChange={handleChange}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1">Add Other Details With Date</label>
                  <div className="space-y-2">
                    {otherDetailsList.map((item, idx) => (
                      <div key={idx} className="flex flex-col md:flex-row md:items-center gap-2">
                        <input
                          className="input input-bordered flex-1"
                          placeholder="Detail/Description"
                          value={item.detail}
                          onChange={e => handleOtherDetailChange(idx, 'detail', e.target.value)}
                        />
                        <input
                          type="date"
                          className="input input-bordered w-40"
                          value={item.date}
                          onChange={e => handleOtherDetailChange(idx, 'date', e.target.value)}
                        />
                        <button
                          type="button"
                          className="text-red-500 hover:text-red-700 px-2"
                          onClick={() => handleRemoveOtherDetail(idx)}
                          disabled={otherDetailsList.length === 1}
                          title="Delete"
                        >
                          🗑️
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      className="mt-2 px-4 py-1 bg-brand-500 hover:bg-brand-600 text-white rounded"
                      onClick={handleAddOtherDetail}
                    >
                      + Add More
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        );
      case 1:
        return (
          <div className="p-6 bg-white rounded-lg shadow-md dark:bg-gray-900">
            <h2 className="text-lg font-semibold mb-4 text-brand-500">Certification Details</h2>
            <form className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">12A Registration No.</label>
                  <input
                    className="input input-bordered w-full"
                    name="reg12A"
                    value={certification.reg12A}
                    onChange={handleCertChange}
                  />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">12A Registration Date</label>
                  <input
                    type="date"
                    className="input input-bordered w-full"
                    name="reg12ADate"
                    value={certification.reg12ADate}
                    onChange={handleCertChange}
                  />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">80G Registration No.</label>
                  <input
                    className="input input-bordered w-full"
                    name="reg80G"
                    value={certification.reg80G}
                    onChange={handleCertChange}
                  />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">80G Registration Date</label>
                  <input
                    type="date"
                    className="input input-bordered w-full"
                    name="reg80GDate"
                    value={certification.reg80GDate}
                    onChange={handleCertChange}
                  />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">35AC Registration No.</label>
                  <input
                    className="input input-bordered w-full"
                    name="reg35AC"
                    value={certification.reg35AC}
                    onChange={handleCertChange}
                  />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">35AC Registration Date</label>
                  <input
                    type="date"
                    className="input input-bordered w-full"
                    name="reg35ACDate"
                    value={certification.reg35ACDate}
                    onChange={handleCertChange}
                  />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">FCRA Registration No.</label>
                  <input
                    className="input input-bordered w-full"
                    name="regFCRA"
                    value={certification.regFCRA}
                    onChange={handleCertChange}
                  />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">FCRA Registration Date</label>
                  <input
                    type="date"
                    className="input input-bordered w-full"
                    name="regFCRADate"
                    value={certification.regFCRADate}
                    onChange={handleCertChange}
                  />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">CSR 1 Registration No.</label>
                  <input
                    className="input input-bordered w-full"
                    name="regCSR1"
                    value={certification.regCSR1}
                    onChange={handleCertChange}
                  />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">CSR 1 Registration Date</label>
                  <input
                    type="date"
                    className="input input-bordered w-full"
                    name="regCSR1Date"
                    value={certification.regCSR1Date}
                    onChange={handleCertChange}
                  />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">GCSR/Other Registration No.</label>
                  <input
                    className="input input-bordered w-full"
                    name="regGCSR"
                    value={certification.regGCSR}
                    onChange={handleCertChange}
                  />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">GCSR/Other Registration Date</label>
                  <input
                    type="date"
                    className="input input-bordered w-full"
                    name="regGCSRDate"
                    value={certification.regGCSRDate}
                    onChange={handleCertChange}
                  />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">Add Other Details With Date</label>
                  <div className="space-y-2">
                    {certOtherList.map((item, idx) => (
                      <div key={idx} className="flex flex-col md:flex-row md:items-center gap-2">
                        <input
                          className="input input-bordered flex-1"
                          placeholder="Detail/Description"
                          value={item.detail}
                          onChange={e => handleCertOtherChange(idx, 'detail', e.target.value)}
                        />
                        <input
                          type="date"
                          className="input input-bordered w-40"
                          value={item.date}
                          onChange={e => handleCertOtherChange(idx, 'date', e.target.value)}
                        />
                        <button
                          type="button"
                          className="text-red-500 hover:text-red-700 px-2"
                          onClick={() => handleRemoveCertOther(idx)}
                          disabled={certOtherList.length === 1}
                          title="Delete"
                        >
                          🗑️
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      className="mt-2 px-4 py-1 bg-brand-500 hover:bg-brand-600 text-white rounded"
                      onClick={handleAddCertOther}
                    >
                      + Add More
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        );
      case 2:
        return (
          <div className="p-6 bg-white rounded-lg shadow-md dark:bg-gray-900">
            <h2 className="text-lg font-semibold mb-4 text-brand-500">Address of the Registered Office</h2>
            <form className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Address 1</label>
                  <input
                    className="input input-bordered w-full"
                    name="address1"
                    value={address.address1}
                    onChange={handleAddressChange}
                  />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Address 2</label>
                  <input
                    className="input input-bordered w-full"
                    name="address2"
                    value={address.address2}
                    onChange={handleAddressChange}
                  />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">State</label>
                  <input
                    className="input input-bordered w-full"
                    name="state"
                    value={address.state}
                    onChange={handleAddressChange}
                  />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">District</label>
                  <input
                    className="input input-bordered w-full"
                    name="district"
                    value={address.district}
                    onChange={handleAddressChange}
                  />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Tahsil/Taluka</label>
                  <input
                    className="input input-bordered w-full"
                    name="tahsil"
                    value={address.tahsil}
                    onChange={handleAddressChange}
                  />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">City/Village</label>
                  <input
                    className="input input-bordered w-full"
                    name="city"
                    value={address.city}
                    onChange={handleAddressChange}
                  />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">PinCode</label>
                  <input
                    className="input input-bordered w-full"
                    name="pincode"
                    value={address.pincode}
                    onChange={handleAddressChange}
                  />
                </div>
              </div>
            </form>
          </div>
        );
      case 3:
        return (
          <div className="p-6 bg-white rounded-lg shadow-md dark:bg-gray-900">
            <h2 className="text-lg font-semibold mb-4 text-brand-500">Communication Details</h2>
            <form className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1">Phone No.</label>
                  <div className="space-y-2">
                    {phones.map((phone, idx) => (
                      <div key={idx} className="flex gap-2 items-center">
                        <input
                          className="input input-bordered flex-1"
                          placeholder="Phone Number"
                          value={phone}
                          onChange={e => handlePhoneChange(idx, e.target.value)}
                        />
                        <button
                          type="button"
                          className="text-red-500 hover:text-red-700 px-2"
                          onClick={() => handleRemovePhone(idx)}
                          disabled={phones.length === 1}
                          title="Delete"
                        >
                          🗑️
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      className="mt-2 px-4 py-1 bg-brand-500 hover:bg-brand-600 text-white rounded"
                      onClick={handleAddPhone}
                    >
                      + Add More
                    </button>
                  </div>
              </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1">Email ID's</label>
                  <div className="space-y-2">
                    {emails.map((email, idx) => (
                      <div key={idx} className="flex gap-2 items-center">
                        <input
                          className="input input-bordered flex-1"
                          placeholder="Email Address"
                          value={email}
                          onChange={e => handleEmailChange(idx, e.target.value)}
                        />
                        <button
                          type="button"
                          className="text-red-500 hover:text-red-700 px-2"
                          onClick={() => handleRemoveEmail(idx)}
                          disabled={emails.length === 1}
                          title="Delete"
                        >
                          🗑️
                        </button>
              </div>
                    ))}
                    <button
                      type="button"
                      className="mt-2 px-4 py-1 bg-brand-500 hover:bg-brand-600 text-white rounded"
                      onClick={handleAddEmail}
                    >
                      + Add More
                    </button>
              </div>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">Website Address</label>
                  <input
                    className="input input-bordered w-full"
                    placeholder="Website URL"
                    value={website}
                    onChange={handleWebsiteChange}
                  />
              </div>
              <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1">Social Media</label>
                  <div className="space-y-2">
                    {socialLinks.map((link, idx) => (
                      <div key={idx} className="flex gap-2 items-center">
                        <input
                          className="input input-bordered flex-1"
                          placeholder="e.g. Facebook, Instagram, LinkedIn, Twitter, Other..."
                          value={link}
                          onChange={e => handleSocialLinkChange(idx, e.target.value)}
                        />
                        <button
                          type="button"
                          className="text-red-500 hover:text-red-700 px-2"
                          onClick={() => handleRemoveSocialLink(idx)}
                          disabled={socialLinks.length === 1}
                          title="Delete"
                        >
                          🗑️
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      className="mt-2 px-4 py-1 bg-brand-500 hover:bg-brand-600 text-white rounded"
                      onClick={handleAddSocialLink}
                    >
                      + Add More
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        );
      case 4:
        return (
          <div className="p-6 bg-white rounded-lg shadow-md dark:bg-gray-900">
            <h2 className="text-lg font-semibold mb-4 text-brand-500">Key Contact Person of the Organization</h2>
            <form className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">SPOC (Name)</label>
                  <input
                    className="input input-bordered w-full"
                    name="spoc"
                    value={contactPerson.spoc}
                    onChange={handleContactPersonChange}
                  />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Contact Person's Mobile No.</label>
                  <input
                    className="input input-bordered w-full"
                    name="mobile"
                    value={contactPerson.mobile}
                    onChange={handleContactPersonChange}
                  />
              </div>
                <div>
                <label className="block text-sm font-medium mb-1">Email ID</label>
                  <input
                    className="input input-bordered w-full"
                    name="email"
                    value={contactPerson.email}
                    onChange={handleContactPersonChange}
                  />
                </div>
              </div>
            </form>
          </div>
        );
      default:
        return (
          <div className="p-6 bg-white rounded-lg shadow-md dark:bg-gray-900">
            <h2 className="text-lg font-semibold mb-4 text-brand-500">{steps[currentStep]}</h2>
            <div className="text-gray-600 dark:text-gray-300 text-center py-8">
              This step is coming soon...
            </div>
          </div>
        );
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      {renderProgress()}
      {successMsg && (
        <div className="mb-4 text-green-600 font-semibold text-center">{successMsg}</div>
      )}
      {errorMsg && (
        <div className="mb-4 text-red-600 font-semibold text-center">{errorMsg}</div>
      )}
      <div className={`mb-8 ${transition}`}>{renderStep()}</div>
      <div className="flex justify-between">
        <button
          className="px-6 py-2 rounded bg-gray-200 text-gray-700 font-semibold disabled:opacity-50"
          onClick={handleBack}
          disabled={currentStep === 0}
        >
          Back
        </button>
        <button
          className="px-6 py-2 rounded bg-brand-500 text-white font-semibold disabled:opacity-50"
          onClick={handleNext}
          disabled={currentStep === steps.length - 1}
        >
          {currentStep === steps.length - 2 ? 'Finish' : 'Next'}
        </button>
      </div>
    </div>
  );
};

export default OrganizationWizard; 