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
    <div className="animate-slideInUp">
      <button
        onClick={handleGoogleSignIn}
        className="w-full bg-theme-black-800 border border-theme-purple-500 text-white py-2 px-4 rounded-md shadow-purple-glow flex items-center justify-center hover:bg-theme-black-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-theme-purple-500 mb-4 transition-all duration-300 transform hover:scale-105"
      >
        <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google Logo" className="w-6 h-6 mr-2" />
        Continue with Google
      </button>
      {error && <p className="text-red-500 text-sm mt-1 animate-pulse">{error}</p>}
    </div>
  );
};

export default GoogleSignInButton;
