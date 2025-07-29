import React from "react";
import SignInForm from "../../components/auth/SignInForm";
import PageMeta from "../../components/common/PageMeta";
import logo from "../../img/logo.png";
import "./AuthBg.css";

const AdminLogin = () => {
  return (
    <>
      <PageMeta title="Admin Login - NGO Linkup" />
      <div className="nice-bg">
        <div className="w-full max-w-md space-y-8">
          {/* Logo and text in one line */}
          <div className="flex items-center justify-evenly gap-4 mb-6">
            <img src={logo} alt="NGO Linkup Logo" className="h-16 w-auto drop-shadow-lg" />
            <div className="flex flex-col items-start">
              <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white leading-tight">
                Admin Login
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Access the NGO management system
              </p>
            </div>
          </div>
          <SignInForm userType="admin" />
        </div>
      </div>
    </>
  );
};

export default AdminLogin; 