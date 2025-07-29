import React from "react";
import { Link } from "react-router-dom";
import PageMeta from "../../components/common/PageMeta";
import backgroundImg from "../../img/background-img.png";
import logo from "../../img/logo.png";

const AuthSelection = () => {
  return (
    <>
      <PageMeta title="Welcome - NGO Linkup" />
      <div
        className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900 px-4 py-12 sm:px-6 lg:px-8 relative"
        style={{
          backgroundImage: `url(${backgroundImg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div className="w-full max-w-md space-y-8 bg-white/80 dark:bg-gray-800/80 rounded-lg p-8 shadow-lg z-10 flex flex-col items-center">
          {/* Logo at the top */}
          <img src={logo} alt="NGO Linkup Logo" className="h-24 w-auto mb-6 drop-shadow-lg" />
          <div className="text-center w-full">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white mb-4">
              NGO Linkup
            </h1>
            <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Welcome Back
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Choose your login type to continue
            </p>
          </div>
          
          <div className="space-y-4">
            {/* Admin Login Card */}
            <Link
              to="/admin-login"
              className="block w-full p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-brand-500 dark:hover:border-brand-400 transition-colors shadow-sm hover:shadow-md"
            >
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-brand-100 dark:bg-brand-900 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-brand-600 dark:text-brand-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Admin Login
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Access the NGO management system
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </Link>

            {/* Trust Member Portal Card */}
            <Link
              to="/trust-member-auth"
              className="block w-full p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-brand-500 dark:hover:border-brand-400 transition-colors shadow-sm hover:shadow-md"
            >
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Trust Member Portal
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Login or register your organization
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </Link>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Need help?{" "}
              <a
                href="mailto:support@ngolinkup.com"
                className="font-medium text-brand-600 hover:text-brand-500 dark:text-brand-400"
              >
                Contact support
              </a>
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default AuthSelection; 