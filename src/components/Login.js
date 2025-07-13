import React, { useState } from 'react';
import { useModal } from '../context/ModalContext';

const Login = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const { success, error } = useModal();

  const handleInputChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const validateForm = () => {
    if (!formData.email || !formData.password) {
      error('Please fill in all required fields');
      return false;
    }

    if (!formData.email.includes('@')) {
      error('Please enter a valid email address');
      return false;
    }

    if (formData.password.length < 6) {
      error('Password must be at least 6 characters long');
      return false;
    }

    if (!isLogin) {
      if (!formData.name) {
        error('Please enter your name');
        return false;
      }
      if (formData.password !== formData.confirmPassword) {
        error('Passwords do not match');
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      if (isLogin) {
        // Sign in with Firebase
        const { signInWithEmail } = await import('../firebase/auth');
        const user = await signInWithEmail(formData.email, formData.password);
        
        // Auto-redirect without popup
        onLogin({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName
        });
      } else {
        // Sign up with Firebase
        const { signUpWithEmail } = await import('../firebase/auth');
        const user = await signUpWithEmail(formData.email, formData.password, formData.name);
        
        success('Account created successfully!');
        onLogin({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName
        });
      }
    } catch (err) {
      console.error('Authentication error:', err);
      console.error('Error details:', err.code, err.message);
      
      // Handle specific Firebase errors
      let errorMessage = 'Something went wrong. Please try again.';
      
      if (err.code === 'auth/user-not-found' || err.message.includes('auth/user-not-found')) {
        // Special handling for user not found - suggest account creation
        error(`No account found with email "${formData.email}". Please create an account first by clicking "Sign Up" below, or check if you entered the correct email address.`);
        return;
      } else if (err.code === 'auth/wrong-password' || err.message.includes('auth/wrong-password')) {
        errorMessage = 'Incorrect password. Please check your password and try again.';
      } else if (err.code === 'auth/email-already-in-use' || err.message.includes('auth/email-already-in-use')) {
        errorMessage = 'An account with this email already exists. Please sign in instead.';
      } else if (err.code === 'auth/weak-password' || err.message.includes('auth/weak-password')) {
        errorMessage = 'Password should be at least 6 characters long.';
      } else if (err.code === 'auth/invalid-email' || err.message.includes('auth/invalid-email')) {
        errorMessage = 'Please enter a valid email address.';
      } else if (err.code === 'auth/too-many-requests' || err.message.includes('auth/too-many-requests')) {
        errorMessage = 'Too many failed attempts. Please try again later.';
      } else if (err.code === 'auth/invalid-credential' || err.message.includes('auth/invalid-credential')) {
        // This covers cases where the email/password combination is invalid
        error(`No account found with these credentials. If you don't have an account yet, please click "Sign Up" below to create one.`);
        return;
      } else {
        // For any other error, show a generic message
        errorMessage = 'Authentication failed. Please check your credentials and try again.';
      }
      
      error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setFormData({
      email: '',
      password: '',
      confirmPassword: '',
      name: ''
    });
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>Nail Polish Picker</h1>
          <p>Let me help you choose the perfect nail polish!</p>
        </div>
        
        <div className="login-form-container">
          <h2>{isLogin ? 'Welcome Back!' : 'Create Account'}</h2>
          <p className="login-subtitle">
            {isLogin 
              ? 'Sign in to access your nail polish collection' 
              : 'Join us to save your collection across devices'
            }
          </p>

          <form onSubmit={handleSubmit} className="login-form">
            {!isLogin && (
              <div className="form-group">
                <label htmlFor="name">Full Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter your full name"
                  required={!isLogin}
                />
              </div>
            )}

            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Enter your email"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Enter your password"
                required
              />
            </div>

            {!isLogin && (
              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm Password</label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="Confirm your password"
                  required={!isLogin}
                />
              </div>
            )}

            <button 
              type="submit" 
              className="login-button"
              disabled={isLoading}
            >
              {isLoading 
                ? (isLogin ? 'Signing In...' : 'Creating Account...') 
                : (isLogin ? 'Sign In' : 'Create Account')
              }
            </button>
          </form>

          <div className="login-toggle">
            <p>
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <button 
                type="button" 
                className="toggle-button"
                onClick={toggleMode}
              >
                {isLogin ? 'Sign Up' : 'Sign In'}
              </button>
            </p>
          </div>

          <div className="demo-note">
            <p><strong>Firebase Integration:</strong> This app uses Firebase Authentication and Firestore for secure user accounts and data storage across devices.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
