import { useState } from "react";
import { Link } from "react-router";
import { ChevronLeftIcon, EyeCloseIcon, EyeIcon } from "../../icons";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import "./SignUpForm.css";

export default function SignUpForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [ngoType, setNgoType] = useState("");
  const [form, setForm] = useState({
    ngoType: "",
    ngoName: "",
    email: "",
    mobileNo: "",
    spocName: "",
    panNo: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({
    panNo: "",
    password: "",
    confirmPassword: "",
    email: "",
    mobileNo: "",
    ngoType: "",
    ngoName: "",
    spocName: "",
  });
  const [loading, setLoading] = useState(false);
  const [serverMsg, setServerMsg] = useState("");
  const [serverError, setServerError] = useState("");

  // PAN No validation (Indian PAN format: 5 letters, 4 digits, 1 letter)
  const validatePan = (pan: string) => {
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/i;
    return panRegex.test(pan);
  };

  // Email validation
  const validateEmail = (email: string) => {
    // Simple email regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Mobile number validation (10 digits, can start with 6-9)
  const validateMobile = (mobile: string) => {
    const mobileRegex = /^[6-9]\d{9}$/;
    return mobileRegex.test(mobile);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (name === "ngoType") setNgoType(value);
    // Clear errors on change
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleCancel = () => {
    setForm({
      ngoType: "",
      ngoName: "",
      email: "",
      mobileNo: "",
      spocName: "",
      panNo: "",
      password: "",
      confirmPassword: "",
    });
    setNgoType("");
    setErrors({
      panNo: "",
      password: "",
      confirmPassword: "",
      email: "",
      mobileNo: "",
      ngoType: "",
      ngoName: "",
      spocName: "",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let valid = true;
    let newErrors = {
      panNo: "",
      password: "",
      confirmPassword: "",
      email: "",
      mobileNo: "",
      ngoType: "",
      ngoName: "",
      spocName: "",
    };

    // Required field checks
    if (!form.ngoType) {
      newErrors.ngoType = "Organization type is required.";
      valid = false;
    }
    if (!form.ngoName) {
      newErrors.ngoName = "Organization name is required.";
      valid = false;
    }
    if (!form.panNo) {
      newErrors.panNo = "PAN number is required.";
      valid = false;
    }
    if (!form.email) {
      newErrors.email = "Email is required.";
      valid = false;
    }
    if (!form.mobileNo) {
      newErrors.mobileNo = "Mobile number is required.";
      valid = false;
    }
    if (!form.spocName) {
      newErrors.spocName = "SPOC name is required.";
      valid = false;
    }
    if (!form.password) {
      newErrors.password = "Password is required.";
      valid = false;
    }
    if (!form.confirmPassword) {
      newErrors.confirmPassword = "Confirm password is required.";
      valid = false;
    }

    // PAN No validation
    if (!validatePan(form.panNo)) {
      newErrors.panNo = "Invalid PAN number. Format: 5 letters, 4 digits, 1 letter (e.g. ABCDE1234F)";
      valid = false;
    }
    // Email format validation
    if (form.email && !validateEmail(form.email)) {
      newErrors.email = "Invalid email format.";
      valid = false;
    }
    // Mobile number validation
    if (form.mobileNo && !validateMobile(form.mobileNo)) {
      newErrors.mobileNo = "Invalid mobile number. Must be 10 digits, start with 6-9.";
      valid = false;
    }
    // Password match validation
    if (form.password !== form.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match.";
      valid = false;
    }
    setErrors(newErrors);
    if (!valid) return;

    setLoading(true);
    setServerMsg("");
    setServerError("");
    try {
      const res = await fetch("http://localhost:3001/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ngoType: form.ngoType,
          ngoName: form.ngoName,
          panNo: form.panNo,
          email: form.email,
          mobileNo: form.mobileNo,
          spocName: form.spocName,
          password: form.password,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setServerMsg(data.message || "Registration successful!");
        setForm({
          ngoType: "",
          ngoName: "",
          email: "",
          mobileNo: "",
          spocName: "",
          panNo: "",
          password: "",
          confirmPassword: "",
        });
        setNgoType("");
      } else {
        setServerError(data.error || "Registration failed.");
      }
    } catch (err) {
      setServerError("Network or server error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-form-container">
      <div className="signup-form-header">
        <Link to="/" className="back-link">
          <ChevronLeftIcon className="icon" />
          Back to dashboard
        </Link>
        <h1 className="signup-title">User Registration</h1>
        <p className="signup-subtitle">Register your NGO/Trust to get started!</p>
      </div>
      <form className="signup-form" onSubmit={handleSubmit}>
        <div className="signup-form-grid">
          <div className="form-group full-width">
            <Label>Organization Type<span className="required">*</span></Label>
            <select name="ngoType" value={form.ngoType} onChange={handleChange} required>
              <option value="">Select Organization Type</option>
              <option value="NGO">Company</option>
              <option value="Trust">NGO/Trust</option>
              <option value="Society">Proprietary Firm</option>
              <option value="Society">Partnership Firm</option>
            </select>
            {errors.ngoType && <p className="error-msg">{errors.ngoType}</p>}
          </div>
          <div className="form-group">
            <Label>{form.ngoType ? `${form.ngoType} Name` : "Organization Name"}<span className="required">*</span></Label>
            <Input type="text" name="ngoName" value={form.ngoName} onChange={handleChange} required />
            {errors.ngoName && <p className="error-msg">{errors.ngoName}</p>}
          </div>
          <div className="form-group">
            <Label>PAN No<span className="required">*</span></Label>
            <Input type="text" name="panNo" value={form.panNo} onChange={handleChange} required />
            {errors.panNo && <p className="error-msg">{errors.panNo}</p>}
          </div>
          <div className="form-group">
            <Label>Email<span className="required">*</span></Label>
            <Input type="email" name="email" value={form.email} onChange={handleChange} required />
            {errors.email && <p className="error-msg">{errors.email}</p>}
          </div>
          <div className="form-group">
            <Label>Mobile No<span className="required">*</span></Label>
            <Input type="text" name="mobileNo" value={form.mobileNo} onChange={handleChange} required />
            {errors.mobileNo && <p className="error-msg">{errors.mobileNo}</p>}
          </div>
          <div className="form-group">
            <Label>SPOC Name<span className="required">*</span></Label>
            <Input type="text" name="spocName" value={form.spocName} onChange={handleChange} required />
            {errors.spocName && <p className="error-msg">{errors.spocName}</p>}
          </div>
          <div className="form-group">
            <Label>Password<span className="required">*</span></Label>
            <Input type={showPassword ? "text" : "password"} name="password" value={form.password} onChange={handleChange} required endAdornment={<button type="button" onClick={() => setShowPassword((prev) => !prev)} tabIndex={-1} className="eye-btn">{showPassword ? <EyeCloseIcon /> : <EyeIcon />}</button>} />
            {errors.password && <p className="error-msg">{errors.password}</p>}
          </div>
          <div className="form-group">
            <Label>Confirm Password<span className="required">*</span></Label>
            <Input type={showConfirmPassword ? "text" : "password"} name="confirmPassword" value={form.confirmPassword} onChange={handleChange} required endAdornment={<button type="button" onClick={() => setShowConfirmPassword((prev) => !prev)} tabIndex={-1} className="eye-btn">{showConfirmPassword ? <EyeCloseIcon /> : <EyeIcon />}</button>} />
            {errors.confirmPassword && <p className="error-msg">{errors.confirmPassword}</p>}
          </div>
        </div>
        <div className="signup-form-actions">
          <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? "Registering..." : "Register"}</button>
          <button type="button" className="btn btn-secondary" onClick={handleCancel} disabled={loading}>Cancel</button>
        </div>
        {serverMsg && <p className="success-msg">{serverMsg}</p>}
        {serverError && <p className="error-msg">{serverError}</p>}
      </form>
      {/* Remove this duplicate footer link to avoid double 'Already have an account? Sign In' */}
    </div>
  );
}
