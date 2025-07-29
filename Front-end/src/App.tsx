import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import SignIn from "./pages/AuthPages/SignIn";
import SignUp from "./pages/AuthPages/SignUp";
import ForgotPassword from "./pages/AuthPages/ForgotPassword";
import VerifyOtp from "./pages/AuthPages/VerifyOtp";
import ResetPassword from "./pages/AuthPages/ResetPassword";
import AuthSelection from "./pages/AuthPages/AuthSelection";
import AdminLogin from "./pages/AuthPages/AdminLogin";
import TrustMemberAuth from "./pages/AuthPages/TrustMemberAuth";
import NotFound from "./pages/OtherPage/NotFound";
import UserProfiles from "./pages/UserProfiles";
import Videos from "./pages/UiElements/Videos";
import Images from "./pages/UiElements/Images";
import Alerts from "./pages/UiElements/Alerts";
import Badges from "./pages/UiElements/Badges";
import Avatars from "./pages/UiElements/Avatars";
import Buttons from "./pages/UiElements/Buttons";
import LineChart from "./pages/Charts/LineChart";
import BarChart from "./pages/Charts/BarChart";
import Calendar from "./pages/Calendar";
import BasicTables from "./pages/Tables/BasicTables";
import FormElements from "./pages/Forms/FormElements";
import Blank from "./pages/Blank";
import AppLayout from "./layout/AppLayout";
import { ScrollToTop } from "./components/common/ScrollToTop";
import Home from "./pages/Dashboard/Home";
import MemberDashboard from "./pages/MemberDashboard/MemberDashboard";
import MemberDocuments from "./pages/MemberDashboard/MemberDocuments";
import AdminDashboard from "./pages/Dashboard/AdminDashboard";
import MasterForm from "./pages/Forms/MasterForm";
import StateMaster from "./pages/Masters/StateMaster";
import DistrictMaster from "./pages/Masters/DistrictMaster";
import TalukaMaster from "./pages/Masters/TalukaMaster";
import CityMaster from "./pages/Masters/CityMaster";
import OccupationMaster from "./pages/Masters/OccupationMaster";
import DesignationMaster from "./pages/Masters/DesignationMaster";
import OMMemberForm from "./pages/Tables/OMMemberForm";

// ProtectedRoute component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isLoggedIn = !!localStorage.getItem("userId");
  return isLoggedIn ? children : <Navigate to="/signin" replace />;
}

export default function App() {
  return (
    <>
      <Router>
        <ScrollToTop />
        <Routes>
          {/* Protected Dashboard Layout */}
          <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
            <Route path="/admin-dashboard" element={<Home />} />
            {/* Remove old /dashboard route */}
            {/* <Route path="/dashboard" element={<Home />} /> */}
            {/* Others Page */}
            <Route path="/profile" element={<UserProfiles />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/blank" element={<Blank />} />
            {/* Forms */}
            <Route path="/form-elements" element={<FormElements />} />
            <Route path="/master-form" element={<MasterForm />} />
            {/* Tables */}
            <Route path="/basic-tables" element={<BasicTables />} />
            <Route path="/om-member-form" element={<OMMemberForm />} />
            {/* Ui Elements */}
            <Route path="/alerts" element={<Alerts />} />
            <Route path="/avatars" element={<Avatars />} />
            <Route path="/badge" element={<Badges />} />
            <Route path="/buttons" element={<Buttons />} />
            <Route path="/images" element={<Images />} />
            <Route path="/videos" element={<Videos />} />
            {/* Charts */}
            <Route path="/line-chart" element={<LineChart />} />
            <Route path="/bar-chart" element={<BarChart />} />
            {/* Masters (moved inside layout) */}
            <Route path="/admin/state-master" element={<StateMaster />} />
            <Route path="/admin/district-master" element={<DistrictMaster />} />
            <Route path="/admin/taluka-master" element={<TalukaMaster />} />
            <Route path="/admin/city-master" element={<CityMaster />} />
            <Route path="/admin/occupation-master" element={<OccupationMaster />} />
            <Route path="/admin/designation-master" element={<DesignationMaster />} />
          </Route>

          {/* Member Dashboard (No Layout) */}
          <Route path="/member-dashboard" element={<ProtectedRoute><MemberDashboard /></ProtectedRoute>} />
          <Route path="/member-documents" element={<ProtectedRoute><MemberDocuments /></ProtectedRoute>} />

          {/* Remove direct /admin-dashboard route if present */}

          {/* Redirect root to dashboard or auth selection based on login */}
          <Route path="/" element={!!localStorage.getItem("userId") ? <Navigate to="/admin-dashboard" replace /> : <Navigate to="/auth-selection" replace />} />

          {/* Auth Selection */}
          <Route path="/auth-selection" element={<AuthSelection />} />
          
          {/* Admin Auth */}
          <Route path="/admin-login" element={<AdminLogin />} />
          
          {/* Trust Member Auth */}
          <Route path="/trust-member-auth" element={<TrustMemberAuth />} />
          
          {/* Legacy Auth Routes (removed) */}
          {/* <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} /> */}
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/verify-otp" element={<VerifyOtp />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Fallback Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </>
  );
}
