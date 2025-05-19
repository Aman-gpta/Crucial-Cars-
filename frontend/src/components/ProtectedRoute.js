// frontend/src/components/ProtectedRoute.js
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
// Optional: Add a Spinner for loading state
// import Spinner from './layout/Spinner';

/**
 * A component that protects routes requiring authentication.
 * Redirects to the login page if the user is not authenticated.
 * Can optionally check for specific roles.
 *
 * @param {React.ReactNode} children - The component/page to render if authenticated.
 * @param {string[]} [roles] - Optional array of roles allowed to access the route.
 */
const ProtectedRoute = ({ children, roles }) => {
    const { isAuthenticated, userInfo, isLoading } = useAuth();
    const location = useLocation(); // Get current location to redirect back after login

    // 1. Handle Loading State (Optional but recommended)
    //    Prevents rendering anything until auth state is confirmed
    if (isLoading) {
        // You can return a loading spinner or null
        return <div className="flex justify-center items-center h-screen"><p>Loading...</p></div>; // Or <Spinner />
    }

    // 2. Check if Authenticated
    if (!isAuthenticated) {
        // Redirect them to the /login page, but save the current location they were
        // trying to go to. This allows us to send them back after login.
        // Pass the current path as 'state' to the login route.
        return <Navigate to="/login" state={{ from: location }} replace />;
        // 'replace' prevents the protected route from being added to history when redirected.
    }

    // 3. Check for Role Authorization (If roles prop is provided)
    if (roles && roles.length > 0 && !roles.includes(userInfo?.role)) {
        // User is logged in but doesn't have the required role
        // Redirect to a 'Not Authorized' page or back home
        // For simplicity, let's redirect home for now. Create a dedicated 'Unauthorized' page later if needed.
        console.warn(`User role '${userInfo?.role}' not authorized for this route. Required: ${roles.join(', ')}`);
        return <Navigate to="/" replace />;
    }

    // 4. User is Authenticated (and authorized, if roles were checked)
    // Render the child component (the actual protected page)
    return children;
};

export default ProtectedRoute;