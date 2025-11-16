import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { sendOTP } from '../services/api';
import './Login.css';

const Login = ({ onSwitchToSignup }) => {
  const [authMethod, setAuthMethod] = useState('email'); // 'email' or 'otp'
  
  // Email/Password state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // OTP state
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [sendingOTP, setSendingOTP] = useState(false);
  
  const { login, loginWithOTP } = useAuth();

  // Timer for OTP resend
  React.useEffect(() => {
    let interval = null;
    if (otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer((timer) => timer - 1);
      }, 1000);
    } else if (otpTimer === 0 && otpSent) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [otpTimer, otpSent]);

  const formatPhoneNumber = (value) => {
    // Remove all non-digit characters
    const digits = value.replace(/\D/g, '');
    
    // If it starts with a country code (like 91 for India), keep it
    // Otherwise, assume it's a local number and add + prefix if needed
    if (digits.length > 0 && !value.startsWith('+')) {
      // If it's a 10-digit number, assume it's Indian and add +91
      if (digits.length === 10) {
        return `+91${digits}`;
      }
      // Otherwise, add + prefix
      return `+${digits}`;
    }
    
    return value;
  };

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(email, password);
    
    if (!result.success) {
      setError(result.error);
    }
    
    setLoading(false);
  };

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!phoneNumber) {
      setError('Please enter your phone number');
      return;
    }

    const formattedPhone = formatPhoneNumber(phoneNumber);
    
    // Validate E.164 format
    if (!/^\+[1-9]\d{1,14}$/.test(formattedPhone)) {
      setError('Please enter a valid phone number (e.g., +1234567890)');
      return;
    }

    setSendingOTP(true);
    try {
      await sendOTP(formattedPhone);
      setOtpSent(true);
      setOtpTimer(300); // 5 minutes = 300 seconds
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setSendingOTP(false);
    }
  };

  const handleOTPLogin = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!otp || otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }

    const formattedPhone = formatPhoneNumber(phoneNumber);
    setLoading(true);

    const result = await loginWithOTP(formattedPhone, otp);
    
    if (!result.success) {
      setError(result.error);
    }
    
    setLoading(false);
  };

  const handleResendOTP = async () => {
    if (otpTimer > 0) return;
    
    const formattedPhone = formatPhoneNumber(phoneNumber);
    setSendingOTP(true);
    try {
      await sendOTP(formattedPhone);
      setOtpTimer(300);
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setSendingOTP(false);
    }
  };

  const switchToOTP = () => {
    setAuthMethod('otp');
    setError('');
    setOtpSent(false);
    setOtp('');
    setOtpTimer(0);
  };

  const switchToEmail = () => {
    setAuthMethod('email');
    setError('');
    setOtpSent(false);
    setOtp('');
    setOtpTimer(0);
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Sign In</h2>
        <p className="auth-subtitle">Welcome back! Please sign in to continue.</p>
        
        {/* Auth Method Tabs */}
        <div className="auth-tabs">
          <button
            type="button"
            className={`tab-button ${authMethod === 'email' ? 'active' : ''}`}
            onClick={switchToEmail}
          >
            Email & Password
          </button>
          <button
            type="button"
            className={`tab-button ${authMethod === 'otp' ? 'active' : ''}`}
            onClick={switchToOTP}
          >
            Phone & OTP
          </button>
        </div>
        
        {error && <div className="error-message">{error}</div>}
        
        {authMethod === 'email' ? (
          <form onSubmit={handleEmailLogin}>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="Enter your email"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Enter your password"
              />
            </div>
            
            <button type="submit" className="auth-button" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        ) : (
          <div>
            {!otpSent ? (
              <form onSubmit={handleSendOTP}>
                <div className="form-group">
                  <label htmlFor="phoneNumber">Phone Number</label>
                  <input
                    type="tel"
                    id="phoneNumber"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    required
                    placeholder="+1234567890 or 1234567890"
                  />
                  <small className="form-hint">Enter your phone number with country code (e.g., +91 for India)</small>
                </div>
                
                <button type="submit" className="auth-button" disabled={sendingOTP}>
                  {sendingOTP ? 'Sending OTP...' : 'Send OTP'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleOTPLogin}>
                <div className="form-group">
                  <label htmlFor="phoneNumberDisplay">Phone Number</label>
                  <input
                    type="tel"
                    id="phoneNumberDisplay"
                    value={formatPhoneNumber(phoneNumber)}
                    disabled
                    className="disabled-input"
                  />
                  <button
                    type="button"
                    className="link-button change-number"
                    onClick={() => {
                      setOtpSent(false);
                      setOtp('');
                      setOtpTimer(0);
                    }}
                  >
                    Change Number
                  </button>
                </div>
                
                <div className="form-group">
                  <label htmlFor="otp">Enter OTP</label>
                  <input
                    type="text"
                    id="otp"
                    value={otp}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                      setOtp(value);
                    }}
                    required
                    placeholder="000000"
                    maxLength="6"
                    className="otp-input"
                  />
                  <div className="otp-actions">
                    {otpTimer > 0 ? (
                      <small className="timer-text">
                        Resend OTP in {Math.floor(otpTimer / 60)}:{(otpTimer % 60).toString().padStart(2, '0')}
                      </small>
                    ) : (
                      <button
                        type="button"
                        className="link-button resend-otp"
                        onClick={handleResendOTP}
                        disabled={sendingOTP}
                      >
                        {sendingOTP ? 'Sending...' : 'Resend OTP'}
                      </button>
                    )}
                  </div>
                </div>
                
                <button type="submit" className="auth-button" disabled={loading}>
                  {loading ? 'Verifying...' : 'Verify & Sign In'}
                </button>
              </form>
            )}
          </div>
        )}
        
        <p className="auth-switch">
          Don't have an account?{' '}
          <button type="button" onClick={onSwitchToSignup} className="link-button">
            Sign Up
          </button>
        </p>
      </div>
    </div>
  );
};

export default Login;
