import React, { useState } from 'react';
import InputField from '../common/InputField';
import Button from '../common/Button';

const LoginForm = ({ onSubmit, loading, error }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});

  const validate = () => {
    const tempErrors = {};
    if (!email) {
      tempErrors.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      tempErrors.email = 'Please enter a valid email address';
    }
    if (!password) {
      tempErrors.password = 'Password is required';
    } else if (password.length < 6) {
      tempErrors.password = 'Password must be at least 6 characters long';
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onSubmit({ email, password });
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      {error && <div className="auth-error">{error}</div>}

      <InputField
        label="Email Address"
        type="email"
        name="email"
        value={email}
        onChange={(e) => {
          setEmail(e.target.value);
          if (errors.email) setErrors({ ...errors, email: '' });
        }}
        placeholder="name@company.com"
        error={errors.email}
        required
      />

      <InputField
        label="Password"
        type="password"
        name="password"
        value={password}
        onChange={(e) => {
          setPassword(e.target.value);
          if (errors.password) setErrors({ ...errors, password: '' });
        }}
        placeholder="••••••••"
        error={errors.password}
        required
      />

      <div style={{ marginTop: '1.5rem' }}>
        <Button
          type="submit"
          variant="primary"
          loading={loading}
          disabled={loading}
          style={{ width: '100%', padding: '0.75rem' }}
        >
          Sign In
        </Button>
      </div>
    </form>
  );
};

export default LoginForm;
