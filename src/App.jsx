
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/layout/Layout';
import LandingPage from './features/landing/LandingPage';
import Login from './features/auth/Login';
import Signup from './features/auth/Signup';
import ForgotPassword from './features/auth/ForgotPassword';
import ResetPassword from './features/auth/ResetPassword';
import ProfilePage from './features/auth/ProfilePage';
import ProjectList from './features/project/ProjectList';
import Board from './features/board/Board';
import Calendar from './features/calendar/Calendar'; // Add this
import ActiveSprints from './features/board/ActiveSprints'; // Add this
import Timeline from './features/timeline/Timeline';
import Reports from './features/reports/Reports';
import Issues from './features/issues/Issues';
import YourWork from './features/issues/YourWork';
import ProjectSettings from './features/project/ProjectSettings';
import ProjectSummary from './features/project/ProjectSummary';
import ListView from './features/issues/ListView';
import TeamsPage from './features/project/TeamsPage';
import TeamDetailsPage from './features/project/TeamDetailsPage';
import IssueDetailPage from './features/issues/IssueDetailPage';
import UserManagement from './features/admin/UserManagement';
import GlobalToast from './components/common/GlobalToast';
import GlobalModalContainer from './components/common/GlobalModalContainer';
import DashboardRedirect from './components/common/DashboardRedirect';

const RequireAuth = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="loading-screen">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="loading-screen">Loading...</div>;
  }

  if (user) {
    return <Navigate to="/projects" replace />;
  }

  return children;
};

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <div className="app-container">
          <GlobalToast />
          <GlobalModalContainer />

          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            } />
            <Route path="/signup" element={
              <PublicRoute>
                <Signup />
              </PublicRoute>
            } />
            <Route path="/forgot-password" element={
              <PublicRoute>
                <ForgotPassword />
              </PublicRoute>
            } />
            <Route path="/reset-password" element={
              <PublicRoute>
                <ResetPassword />
              </PublicRoute>
            } />

            {/* Protected Routes */}
            <Route element={<RequireAuth><Layout /></RequireAuth>}>
              <Route path="/dashboard" element={<DashboardRedirect />} />
              <Route path="/projects" element={<ProjectList />} />
              <Route path="/my-work" element={<YourWork />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/admin/users" element={<UserManagement />} />

              {/* Project specific routes */}
              <Route path="/projects/:projectId/summary" element={<ProjectSummary />} />
              <Route path="/projects/:projectId/list" element={<ListView />} />
              <Route path="/projects/:projectId/board" element={<Board />} />
              <Route path="/projects/:projectId/active-sprints" element={<ActiveSprints />} />
              <Route path="/projects/:projectId/calendar" element={<Calendar />} />
              <Route path="/projects/:projectId/timeline" element={<Timeline />} />
              <Route path="/projects/:projectId/reports" element={<Reports />} />
              <Route path="/projects/:projectId/issues" element={<Issues />} />
              <Route path="/projects/:projectId/issues/:issueId" element={<IssueDetailPage />} />
              <Route path="/projects/:projectId/settings" element={<ProjectSettings />} />
              <Route path="/projects/:projectId/teams" element={<TeamsPage />} />
              <Route path="/projects/:projectId/teams/:teamId" element={<TeamDetailsPage />} />
            </Route>

            {/* Catch all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App;
