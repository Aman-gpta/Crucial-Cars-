// frontend/src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

// Auth Context
import { AuthProvider } from './context/AuthContext';

// Layout Components
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import AnimatedBackground from './components/layout/AnimatedBackground';

// Page Components
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import CarDetailsPage from './pages/CarDetailsPage';
import NotFoundPage from './pages/NotFoundPage';
import CreateCarPage from './pages/CreateCarPage';
import ManageTestimonialsPage from './pages/admin/ManageTestimonialsPage'; // Import the admin page
import OwnerDashboardPage from './pages/owner/OwnerDashboardPage'; // Import the owner dashboard page
import JournalistDashboardPage from './pages/journalist/JournalistDashboardPage'; // Import the journalist dashboard page
import UserProfilePage from './pages/UserProfilePage'; // Import the user profile page
import TestRequestPage from './pages/test/TestRequestPage'; // Import the test page

// Import the ProtectedRoute component (assuming it's in src/components/)
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <Router>
        {/* Main layout structure */}
        <div className="flex flex-col min-h-screen">
          <AnimatedBackground /> {/* Add the animated background */}
          <Navbar /> {/* Navbar appears on all pages */}
          <main className="flex-grow container mx-auto px-4 py-8">
          {/* Define application routes */}
          <Routes>
            {/* --- Public Routes --- */}
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/cars/:id" element={<CarDetailsPage />} /> {/* Dynamic route for car details */}

            {/* --- Protected Routes --- */}
            {/* Routes below require the user to be logged in, and potentially have specific roles */}

            {/* Create Car Page: Requires login + 'Car Owner' role */}
            <Route
              path="/cars/new"
              element={
                <ProtectedRoute roles={['Car Owner']}> {/* Check for specific role */}
                  <CreateCarPage /> {/* Render CreateCarPage if authorized */}
                </ProtectedRoute>
              }
            />

            {/* Owner Dashboard: Requires login + 'Car Owner' role */}
            <Route
              path="/owner/dashboard"
              element={
                <ProtectedRoute roles={['Car Owner']}>
                  <OwnerDashboardPage />
                </ProtectedRoute>
              }
            />

            {/* Journalist Dashboard: Requires login + 'Journalist' role */}
            <Route
              path="/journalist/dashboard"
              element={
                <ProtectedRoute roles={['Journalist']}>
                  <JournalistDashboardPage />
                </ProtectedRoute>
              }
            />

            {/* Admin Routes */}
            <Route
              path="/admin/testimonials"
              element={
                <ProtectedRoute roles={['Admin']}>
                  <ManageTestimonialsPage />
                </ProtectedRoute>
              }
            />

            {/* User Profile Routes */}
            {/* Personal profile for editing - requires authentication */}
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <UserProfilePage />
                </ProtectedRoute>
              }
            />
            
            {/* Public profile view for viewing other users' profiles */}
            <Route path="/profile/:id" element={<UserProfilePage />} />
            
            {/* Test Routes - for developers only */}
            <Route path="/test/requests" element={<ProtectedRoute roles={['Journalist']}><TestRequestPage /></ProtectedRoute>} />

            {/* --- Catch-all 404 Route --- */}
            {/* This must be the last route */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>
        <Footer /> {/* Footer appears on all pages */}
      </div>
    </Router>
    </AuthProvider>
  );
}

export default App;