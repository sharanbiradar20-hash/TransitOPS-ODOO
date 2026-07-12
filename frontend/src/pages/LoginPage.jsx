import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoginForm from '../components/auth/LoginForm';

const LoginPage = () => {
  const { login, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // If already authenticated, redirect immediately
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleLoginSubmit = async ({ email, password }) => {
    setLoading(true);
    setError(null);
    
    // Slight artificial delay for premium micro-animations feel
    await new Promise((resolve) => setTimeout(resolve, 600));

    const result = await login(email, password);
    setLoading(false);
    
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ width: '2rem', height: '2rem', color: 'var(--accent-color)' }}
            >
              <path d="M4.5 16.5c-1.5 1.26-2.5 3.19-2.5 5.5h20c0-2.31-1-4.24-2.5-5.5" />
              <path d="M12 2v14.5" />
              <path d="m16 6-4-4-4 4" />
              <path d="M12 16.5c1.93 0 3.5-1.57 3.5-3.5S13.93 9.5 12 9.5 8.5 11.07 8.5 13s1.57 3.5 3.5 3.5z" />
            </svg>
            Transit<span>Ops</span>
          </div>
          <p className="auth-subtitle">Log in to manage vehicles, drivers, and operations</p>
        </div>
        <div className="auth-body">
          <LoginForm onSubmit={handleLoginSubmit} loading={loading} error={error} />
          
          <div className="auth-footer">
            <p>Demo accounts (Backend pre-loaded):</p>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              <strong>Fleet Mgr:</strong> manager@transitops.com (pw: password)<br/>
              <strong>Safety Officer:</strong> safety@transitops.com (pw: password)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
