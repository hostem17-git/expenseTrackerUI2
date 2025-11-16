import React, { useState } from 'react';
import { forgotPassword, resetPassword } from '../services/api';
import './ForgotPassword.css';

const ForgotPassword = ({ onBackToLogin }) => {
  const [step, setStep] = useState('request'); // 'request', 'verify'
  const [method, setMethod] = useState('email'); // 'email' or 'phone'
  
  // Request OTP state
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [requestLoading, setRequestLoading] = useState(false);
  
  // Reset password state
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Timer for OTP resend
  React.useEffect(() => {
    let interval = null;
    if (otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer((timer) => timer - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [otpTimer]);

  const formatPhoneNumber = (value) => {
    const digits = value.replace(/\D/g, '');
    if (digits.length > 0 && !value.startsWith('+')) {
      if (digits.length === 10) {
        return `+91${digits}`;
      }
      return `+${digits}`;
    }
    return value;
  };

  const handleRequestOTP = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (method === 'email' && !email) {
      setError('Please enter your email address');
      return;
    }

    if (method === 'phone' && !phoneNumber) {
      setError('Please enter your phone number');
      return;
    }

    setRequestLoading(true);
    try {
      const formattedPhone = method === 'phone' ? formatPhoneNumber(phoneNumber) : undefined;
      
      // Validate phone number format if using phone
      if (method === 'phone' && !/^\+[1-9]\d{1,14}$/.test(formattedPhone)) {
        setError('Please enter a valid phone number (e.g., +1234567890)');
        setRequestLoading(false);
        return;
      }

      await forgotPassword({
        email: method === 'email' ? email : undefined,
        phoneNumber: method === 'phone' ? formattedPhone : undefined,
      });

      setSuccess(
        method === 'email'
          ? 'If an account exists with this email, an OTP has been sent.'
          : 'If an account exists with this phone number, an OTP has been sent via WhatsApp.'
      );
      setStep('verify');
      setOtpTimer(600); // 10 minutes = 600 seconds
    } catch (err) {
      setError(err.message);
    } finally {
      setRequestLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!otp || otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setResetLoading(true);
    try {
      const formattedPhone = method === 'phone' ? formatPhoneNumber(phoneNumber) : undefined;
      
      await resetPassword({
        email: method === 'email' ? email : undefined,
        phoneNumber: method === 'phone' ? formattedPhone : undefined,
        otp,
        newPassword,
      });

      setSuccess('Password reset successfully! Redirecting to login...');
      setTimeout(() => {
        onBackToLogin();
      }, 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setResetLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (otpTimer > 0) return;
    
    setError('');
    setRequestLoading(true);
    try {
      const formattedPhone = method === 'phone' ? formatPhoneNumber(phoneNumber) : undefined;
      
      await forgotPassword({
        email: method === 'email' ? email : undefined,
        phoneNumber: method === 'phone' ? formattedPhone : undefined,
      });

      setSuccess('OTP resent successfully');
      setOtpTimer(600);
    } catch (err) {
      setError(err.message);
    } finally {
      setRequestLoading(false);
    }
  };

  const switchToEmail = () => {
    setMethod('email');
    setError('');
    setSuccess('');
    setEmail('');
    setPhoneNumber('');
  };

  const switchToPhone = () => {
    setMethod('phone');
    setError('');
    setSuccess('');
    setEmail('');
    setPhoneNumber('');
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-brand">
          <h1 className="auth-brand-title">Whatspense</h1>
        </div>
        <h2>Reset Password</h2>
        <p className="auth-subtitle">
          {step === 'request'
            ? 'Enter your email or phone number to receive a reset code'
            : 'Enter the OTP and your new password'}
        </p>

        {/* Method Tabs - Only show on request step */}
        {step === 'request' && (
          <div className="auth-tabs">
            <button
              type="button"
              className={`tab-button ${method === 'email' ? 'active' : ''}`}
              onClick={switchToEmail}
            >
              Email
            </button>
            <button
              type="button"
              className={`tab-button ${method === 'phone' ? 'active' : ''}`}
              onClick={switchToPhone}
            >
              Phone
            </button>
          </div>
        )}

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        {step === 'request' ? (
          <form onSubmit={handleRequestOTP}>
            {method === 'email' ? (
              <div className="form-group">
                <label htmlFor="reset-email">Email</label>
                <input
                  type="email"
                  id="reset-email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="Enter your email"
                />
              </div>
            ) : (
              <div className="form-group">
                <label htmlFor="reset-phone">Phone Number</label>
                <input
                  type="tel"
                  id="reset-phone"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  required
                  placeholder="+1234567890 or 1234567890"
                />
                <small className="form-hint">
                  Enter your phone number with country code (e.g., +91 for India)
                </small>
              </div>
            )}

            <button type="submit" className="auth-button" disabled={requestLoading}>
              {requestLoading ? 'Sending OTP...' : 'Send Reset Code'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword}>
            <div className="form-group">
              <label htmlFor="reset-identifier">
                {method === 'email' ? 'Email' : 'Phone Number'}
              </label>
              <input
                type={method === 'email' ? 'email' : 'tel'}
                id="reset-identifier"
                value={method === 'email' ? email : formatPhoneNumber(phoneNumber)}
                disabled
                className="disabled-input"
              />
              <button
                type="button"
                className="link-button change-identifier"
                onClick={() => {
                  setStep('request');
                  setOtp('');
                  setNewPassword('');
                  setConfirmPassword('');
                  setOtpTimer(0);
                }}
              >
                Change {method === 'email' ? 'Email' : 'Phone Number'}
              </button>
            </div>

            <div className="form-group">
              <label htmlFor="reset-otp">Enter OTP</label>
              <input
                type="text"
                id="reset-otp"
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
                    Resend OTP in {Math.floor(otpTimer / 60)}:{(otpTimer % 60)
                      .toString()
                      .padStart(2, '0')}
                  </small>
                ) : (
                  <button
                    type="button"
                    className="link-button resend-otp"
                    onClick={handleResendOTP}
                    disabled={requestLoading}
                  >
                    {requestLoading ? 'Sending...' : 'Resend OTP'}
                  </button>
                )}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="new-password">New Password</label>
              <input
                type="password"
                id="new-password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                placeholder="Enter new password (min 6 characters)"
                minLength="6"
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirm-password">Confirm Password</label>
              <input
                type="password"
                id="confirm-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                placeholder="Confirm new password"
                minLength="6"
              />
            </div>

            <button type="submit" className="auth-button" disabled={resetLoading}>
              {resetLoading ? 'Resetting Password...' : 'Reset Password'}
            </button>
          </form>
        )}

        <p className="auth-switch">
          Remember your password?{' '}
          <button type="button" onClick={onBackToLogin} className="link-button">
            Back to Sign In
          </button>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;

