import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from '../components/auth/AuthLayout';
import { useAuth } from '../context/AuthContext';
import './AuthForm.css';

const SignupPage = () => {
  const { register, login } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setFieldErrors({});
    setIsSubmitting(true);

    try {
      await register(formData);
      await login({ email: formData.email, password: formData.password });
      navigate('/dashboard');
    } catch (error) {
      const response = error.response;

      if (response?.status === 400 && response.data?.errors) {
        const errors = {};
        response.data.errors.forEach((err) => {
          errors[err.field] = err.message;
        });
        setFieldErrors(errors);
      } else {
        setFormError(response?.data?.message || 'Something went wrong. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout title="Join AniNotes" subtitle="Create your account and start jotting things down.">
      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        {formError && (<div className="auth-banner-error" role="alert">{formError}</div>)}

        <div className="auth-field">
          <label htmlFor="username">Username</label>
          <input
            id="username"
            name="username"
            type="text"
            autoComplete="username"
            value={formData.username}
            onChange={handleChange}
            required
            aria-invalid={fieldErrors.username ? 'true' : 'false'}
            aria-describedby={fieldErrors.username ? 'username-error' : undefined}
          />
          {fieldErrors.username && (<span id="username-error" className="auth-field-error">{fieldErrors.username}</span>)}
        </div>

        <div className="auth-field">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            value={formData.email}
            onChange={handleChange}
            required
            aria-invalid={fieldErrors.email ? 'true' : 'false'}
            aria-describedby={fieldErrors.email ? 'email-error' : undefined}
          />
          {fieldErrors.email && (<span id="email-error" className="auth-field-error">{fieldErrors.email}</span>)}
        </div>

        <div className="auth-field">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            value={formData.password}
            onChange={handleChange}
            required
            aria-invalid={fieldErrors.password ? 'true' : 'false'}
            aria-describedby={fieldErrors.password ? 'password-error' : undefined}
          />
          {fieldErrors.password && (<span id="password-error" className="auth-field-error">{fieldErrors.password}</span>)}
        </div>

        <button className="auth-submit" type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Creating account…' : 'Create account'}
        </button>
      </form>

      <p className="auth-switch">
        Already have an account? <Link to="/login">Log in</Link>
      </p>
    </AuthLayout>
  );
};

export default SignupPage;
