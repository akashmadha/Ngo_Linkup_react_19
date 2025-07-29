import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronLeftIcon, EyeCloseIcon, EyeIcon } from "../../icons";
import Label from "../../components/form/Label";
import Input from "../../components/form/input/InputField";
import Button from "../../components/ui/button/Button";
import logo from "../../img/logo.png";
import "./AuthBg.css";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState("");
  const [toastType, setToastType] = useState<"success" | "error" | "">("");
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const resetEmail = localStorage.getItem("resetEmail");
    if (!resetEmail) {
      navigate("/forgot-password");
      return;
    }
    setEmail(resetEmail);
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!password || !confirmPassword) {
      setToast("All fields are required.");
      setToastType("error");
      return;
    }

    if (password !== confirmPassword) {
      setToast("Passwords do not match.");
      setToastType("error");
      return;
    }

    if (password.length < 6) {
      setToast("Password must be at least 6 characters long.");
      setToastType("error");
      return;
    }

    setLoading(true);
    setToast("");
    setToastType("");

    try {
      const res = await fetch("http://localhost:3001/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        setToast(data.message || "Password updated successfully!");
        setToastType("success");
        // Clear stored email
        localStorage.removeItem("resetEmail");
        setTimeout(() => {
          navigate("/signin");
        }, 2000);
      } else {
        setToast(data.error || "Failed to update password.");
        setToastType("error");
      }
    } catch (err) {
      setToast("Network error. Please try again.");
      setToastType("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="nice-bg">
      <div
        className="reset-password-card w-full flex flex-col items-center"
        style={{
          maxWidth: 400,
          minHeight: 300,
          background: "rgba(255,255,255,0.95)",
          borderRadius: 18,
          boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
          padding: 32,
        }}
      >
        {/* Logo at the top */}
        <img src={logo} alt="NGO Linkup Logo" className="h-20 w-auto mb-6 drop-shadow-lg" />
        <div className="w-full">
          <Link
            to="/verify-otp"
            className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 mb-4"
          >
            <ChevronLeftIcon className="size-5" />
            Back to Verify OTP
          </Link>
          <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 text-2xl">
            Reset Password
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Enter your new password
          </p>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <Label>
                New Password<span className="text-error-500">*</span>
              </Label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter new password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <span
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                >
                  {showPassword ? (
                    <EyeIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                  ) : (
                    <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                  )}
                </span>
              </div>
            </div>
            <div className="mb-4">
              <Label>
                Confirm Password<span className="text-error-500">*</span>
              </Label>
              <div className="relative">
                <Input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
                <span
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                >
                  {showConfirmPassword ? (
                    <EyeIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                  ) : (
                    <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                  )}
                </span>
              </div>
            </div>
            <Button
              className="w-full"
              size="sm"
              type="submit"
              disabled={loading}
            >
              {loading ? "Updating..." : "Update Password"}
            </Button>
            {toast && (
              <div className={`mt-2 text-center text-sm ${toastType === "success" ? "text-success-600" : "text-error-500"}`}>
                {toast}
              </div>
            )}
          </form>
          <div className="mt-5">
            <p className="text-sm font-normal text-center text-gray-700 dark:text-gray-400 sm:text-start">
              Remember your password?{" "}
              <Link
                to="/auth-selection"
                className="text-brand-500 hover:text-brand-600 dark:text-brand-400"
              >
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 