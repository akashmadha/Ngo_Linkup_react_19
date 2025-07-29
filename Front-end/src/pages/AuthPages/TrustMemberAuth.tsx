import React, { useState } from "react";
import SignInForm from "../../components/auth/SignInForm";
import SignUpForm from "../../components/auth/SignUpForm";
import PageMeta from "../../components/common/PageMeta";
import logo from "../../img/logo.png";
import "./AuthBg.css";

const TrustMemberAuth = () => {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <>
      <PageMeta title="Organization Member Portal - NGO Linkup" />
      <div className="nice-bg">
        <div
          className="trust-member-card w-full flex flex-col items-center"
          style={{
            maxWidth: 600,
            minHeight: 300,
            background: "rgba(255,255,255,0.9)",
            borderRadius: 18,
            boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
            padding: 32,
          }}
        >
          {/* Logo at the top */}
          <div className="flex items-center justify-evenly gap-4 mb-6 w-full">
            <img src={logo} alt="NGO Linkup Logo" className="h-16 w-auto drop-shadow-lg" />
            <div className="flex flex-col items-start">
              <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white leading-tight">
              Organization Management Portal
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {isLogin ? "Sign in to your account" : "Create your organization account"}
              </p>
            </div>
          </div>
          {/* Toggle Buttons */}
          <div className="flex rounded-lg bg-gray-100 dark:bg-gray-800 p-1 mb-6 w-full">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                isLogin
                  ? "bg-white text-gray-900 shadow-sm dark:bg-gray-700 dark:text-white"
                  : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                !isLogin
                  ? "bg-white text-gray-900 shadow-sm dark:bg-gray-700 dark:text-white"
                  : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
              }`}
            >
              Sign Up
            </button>
          </div>
          {/* Form */}
          <div className="mt-2 w-full">
            {isLogin ? (
              <SignInForm userType="member" />
            ) : (
              <SignUpForm />
            )}
          </div>
          {/* Additional Links */}
          {isLogin ? (
            <div className="text-center w-full mt-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Don't have an account?{' '}
                <button
                  onClick={() => setIsLogin(false)}
                  className="font-medium text-brand-600 hover:text-brand-500 dark:text-brand-400"
                  style={{ textDecoration: 'underline', cursor: 'pointer' }}
                >
                  Sign Up
                </button>
              </p>
            </div>
          ) : (
            <div className="text-center w-full mt-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Already have an account?{' '}
                <button
                  onClick={() => setIsLogin(true)}
                  className="font-medium text-brand-600 hover:text-brand-500 dark:text-brand-400"
                  style={{ textDecoration: 'underline', cursor: 'pointer' }}
                >
                  Sign In
                </button>
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default TrustMemberAuth; 