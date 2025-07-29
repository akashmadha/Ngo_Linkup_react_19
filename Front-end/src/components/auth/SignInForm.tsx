import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronLeftIcon, EyeCloseIcon, EyeIcon } from "../../icons";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Checkbox from "../form/input/Checkbox";
import Button from "../ui/button/Button";

interface SignInFormProps {
  userType?: "admin" | "member";
}

export default function SignInForm({ userType = "member" }: SignInFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState("");
  const [toastType, setToastType] = useState<"success" | "error" | "">("");
  const [step, setStep] = useState<'login' | 'otp'>("login");
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState("");
  const [tempUserId, setTempUserId] = useState<string | null>(null); // Store userId for OTP verification
  const navigate = useNavigate();
  const isLoggedIn = !!localStorage.getItem("userId");

  // Handler for username/password submit
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setToast("");
    setToastType("");
    setOtpError("");
    if (!username || !password) {
      setToast("Username and password are required.");
      setToastType("error");
      return;
    }
    setLoading(true);
    try {
      // Call backend to verify credentials and send OTP
      const res = await fetch("http://localhost:3001/request-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, userType }),
      });
      const data = await res.json();
      if (res.ok) {
        setStep("otp");
        setTempUserId(data.userId); // Store userId for OTP verification
        setToast("OTP sent to your email.");
        setToastType("success");
      } else {
        setToast(data.error || "Login failed.");
        setToastType("error");
      }
    } catch (err) {
      setToast("Network or server error. Please try again.");
      setToastType("error");
    } finally {
      setLoading(false);
    }
  };

  // Handler for OTP submit
  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setOtpError("");
    setLoading(true);
    try {
      const res = await fetch("http://localhost:3001/login-verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: tempUserId, otp }),
      });
      const data = await res.json();
      if (res.ok) {
        // OTP correct, log in user
        localStorage.setItem("userId", data.userId);
        localStorage.setItem("userType", data.userType || userType);
        setToast("Login successful!");
        setToastType("success");
        setTimeout(() => {
          if (data.userType === "admin" || userType === "admin") {
            navigate("/admin-dashboard");
          } else {
            navigate("/member-dashboard");
          }
        }, 1000);
      } else {
        setOtpError(data.error || "Invalid OTP.");
      }
    } catch (err) {
      setOtpError("Network or server error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handler for admin login (no OTP)
  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setToast("");
    setToastType("");
    if (!username || !password) {
      setToast("Username and password are required.");
      setToastType("error");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("http://localhost:3001/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, userType: "admin" }),
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem("userId", data.userId);
        localStorage.setItem("userType", data.userType || "admin");
        setToast("Login successful!");
        setToastType("success");
        setTimeout(() => {
          navigate("/admin-dashboard");
        }, 1000);
      } else {
        setToast(data.error || "Login failed.");
        setToastType("error");
      }
    } catch (err) {
      setToast("Network or server error. Please try again.");
      setToastType("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col flex-1">
      <div className="w-full max-w-md pt-10 mx-auto">
        {isLoggedIn ? (
          <Link
            to="/"
            className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          >
            <ChevronLeftIcon className="size-5" />
            Back to dashboard
          </Link>
        ) : (
          <button
            className="inline-flex items-center text-sm text-gray-400 cursor-not-allowed opacity-60"
            title="You must be logged in to access the dashboard"
            disabled
          >
            <ChevronLeftIcon className="size-5" />
            Back to dashboard
          </button>
        )}
      </div>
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          <div className="mb-5 sm:mb-8">
            <h1
              className="mb-2 font-semibold text-title-sm sm:text-title-md"
              style={step === 'otp' ? { fontSize: '22px', color: '#3093d5' } : {}}
            >
              {step === 'login' ? 'Sign In' : 'TWO FACTOR AUTHENTICATION'}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {step === 'login'
                ? 'Enter your email and password to sign in!'
                : 'Input the code sent to your registered mobile or email to confirm your identity.'}
            </p>
          </div>
          <div>
            {userType === 'admin' ? (
              <form onSubmit={handleAdminLogin}>
                <div className="space-y-6">
                  <div>
                    <Label>
                      Username <span className="text-error-500">*</span>
                    </Label>
                    <Input
                      placeholder="Email or Username"
                      value={username}
                      onChange={e => setUsername(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>
                      Password <span className="text-error-500">*</span>
                    </Label>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
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
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Checkbox
                        checked={isChecked}
                        onChange={checked => setIsChecked(checked)}
                        id="remember-me"
                      />
                      <label htmlFor="remember-me" className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                        Remember me
                      </label>
                    </div>
                    <Link
                      to="/forgot-password"
                      className="text-sm font-medium text-brand-600 hover:text-brand-500 dark:text-brand-400"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <button type="submit" className="w-full inline-flex items-center justify-center gap-2 rounded-lg transition px-5 py-3.5 text-sm bg-brand-500 text-white shadow-theme-xs hover:bg-brand-600 disabled:bg-brand-300" disabled={loading}>
                    {loading ? 'Signing in...' : 'Admin Sign In'}
                  </button>
                  {toast && (
                    <div className={`mt-2 text-sm ${toastType === 'error' ? 'text-red-500' : 'text-green-600'}`}>{toast}</div>
                  )}
                </div>
              </form>
            ) : step === 'login' ? (
              <form onSubmit={handleLoginSubmit}>
              <div className="space-y-6">
                <div>
                  <Label>
                    Username <span className="text-error-500">*</span>
                  </Label>
                  <Input
                    placeholder="Email or Mobile Number"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                  />
                </div>
                <div>
                  <Label>
                    Password <span className="text-error-500">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
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
                <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Checkbox
                        checked={isChecked}
                        onChange={checked => setIsChecked(checked)}
                        id="remember-me"
                      />
                      <label htmlFor="remember-me" className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                        Remember me
                      </label>
                  </div>
                  <Link
                    to="/forgot-password"
                      className="text-sm font-medium text-brand-600 hover:text-brand-500 dark:text-brand-400"
                  >
                    Forgot password?
                  </Link>
                </div>
                  <button type="submit" className="w-full inline-flex items-center justify-center gap-2 rounded-lg transition px-5 py-3.5 text-sm bg-brand-500 text-white shadow-theme-xs hover:bg-brand-600 disabled:bg-brand-300" disabled={loading}>
                    {loading ? 'Sending OTP...' : 'Sign In'}
                  </button>
                  {toast && (
                    <div className={`mt-2 text-sm ${toastType === 'error' ? 'text-red-500' : 'text-green-600'}`}>{toast}</div>
                  )}
                </div>
              </form>
            ) : (
              <form onSubmit={handleOtpSubmit}>
                <div className="space-y-6">
                  <div>
                    <Label>
                      Enter Authentication Code <span className="text-error-500">*</span>
                    </Label>
                    <Input
                      placeholder="Enter OTP"
                      value={otp}
                      onChange={e => setOtp(e.target.value)}
                    />
                  </div>
                  <button type="submit" className="w-full inline-flex items-center justify-center gap-2 rounded-lg transition px-5 py-3.5 text-sm bg-brand-500 text-white shadow-theme-xs hover:bg-brand-600 disabled:bg-brand-300" disabled={loading}>
                    {loading ? 'Verifying...' : 'Verify OTP'}
                  </button>
                  {otpError && (
                    <div className="mt-2 text-sm text-red-500">{otpError}</div>
                  )}
                  {toast && toastType === 'success' && (
                    <div className="mt-2 text-sm text-green-600">{toast}</div>
                )}
              </div>
            </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
