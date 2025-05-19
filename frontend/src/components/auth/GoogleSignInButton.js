// components/auth/GoogleSignInButton.js
import React from 'react';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../../firebase';
import { useAuth } from '../../context/AuthContext';

const GoogleSignInButton = ({ role }) => {
  const { loginWithFirebase, error } = useAuth();

  const handleGoogleSignIn = async () => {
    try {
      // Sign in with Google using Firebase
      const result = await signInWithPopup(auth, googleProvider);
      
      // Get the user token
      const idToken = await result.user.getIdToken();
      
      // Use our custom function to register/login with backend
      await loginWithFirebase(idToken, role);
      
    } catch (error) {
      console.error('Google Sign In Error:', error);
    }
  };

  return (
    <div>
      <button
        onClick={handleGoogleSignIn}
        className="w-full bg-white border border-gray-300 text-gray-700 py-2 px-4 rounded-md shadow-sm flex items-center justify-center hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 mb-4"
      >
        <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google Logo" className="w-6 h-6 mr-2" />
        Continue with Google
      </button>
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
};

export default GoogleSignInButton;
