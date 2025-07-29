import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronLeftIcon } from "../../icons";
import Label from "../../components/form/Label";
import Input from "../../components/form/input/InputField";
import Button from "../../components/ui/button/Button";
import logo from "../../img/logo.png";
import "./AuthBg.css";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState("");
  const [toastType, setToastType] = useState<"success" | "error" | "">("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setToast("Email is required.");
      setToastType("error");
      return;
    }

    setLoading(true);
    setToast("");
    setToastType("");

    try {
      const res = await fetch("http://localhost:3001/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        setToast(data.message || "OTP sent to your email!");
        setToastType("success");
        // Store email for next step
        localStorage.setItem("resetEmail", email);
        setTimeout(() => {
          navigate("/verify-otp");
        }, 2000);
      } else {
        setToast(data.error || "Failed to send OTP.");
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
        className="forgot-password-card w-full flex flex-col items-center"
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
            to="/auth-selection"
            className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 mb-4"
          >
            <ChevronLeftIcon className="size-5" />
            Back to Auth Selection
          </Link>
          <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 text-2xl">
            Forgot Password
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Enter your email to receive a password reset OTP
          </p>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <Label>
                Email<span className="text-error-500">*</span>
              </Label>
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <Button
              className="w-full"
              size="sm"
              type="submit"
              disabled={loading}
            >
              {loading ? "Sending..." : "Send OTP"}
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