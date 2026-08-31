import { useState } from 'react';
import Button from '../components/Button/Button.jsx';
import { useAuth } from '../hooks/useAuth.js';
import { getErrorMessage, getFieldErrors } from '../utils/apiErrors.js';

const initialForm = {
  email: '',
  password: '',
};

export default function AuthPage() {
  const { error: authError, login, register } = useAuth();
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const isLogin = mode === 'login';

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));

    setErrors((current) => ({
      ...current,
      [name]: '',
    }));
    setSubmitError('');
  }

  function switchMode(nextMode) {
    setMode(nextMode);
    setErrors({});
    setSubmitError('');
  }

  function validateForm() {
    const nextErrors = {};

    if (!form.email.trim()) {
      nextErrors.email = 'Enter your email address.';
    }

    if (!form.password) {
      nextErrors.password = 'Enter your password.';
    } else if (!isLogin && form.password.length < 8) {
      nextErrors.password =
        'Password must contain at least 8 characters.';
    }

    return nextErrors;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const nextErrors = validateForm();

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setSubmitting(true);
    setSubmitError('');

    try {
      const credentials = {
        email: form.email.trim(),
        password: form.password,
      };

      if (isLogin) {
        await login(credentials);
      } else {
        await register(credentials);
      }
    } catch (error) {
      setErrors(getFieldErrors(error));
      setSubmitError(
        getErrorMessage(error, 'Unable to complete authentication.'),
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="auth-shell">
      <section className="auth-panel" aria-labelledby="auth-title">
        <div className="auth-panel__copy">
          <p>Huddle workspace</p>
          <h1 id="auth-title">
            {isLogin ? 'Sign in to Huddle' : 'Create your Huddle account'}
          </h1>
          <span>Protected task boards powered by the live API.</span>
        </div>

        <div className="auth-tabs" aria-label="Authentication mode">
          <Button
            type="button"
            variant={isLogin ? 'primary' : 'secondary'}
            onClick={() => switchMode('login')}
          >
            Sign in
          </Button>
          <Button
            type="button"
            variant={isLogin ? 'secondary' : 'primary'}
            onClick={() => switchMode('register')}
          >
            Sign up
          </Button>
        </div>

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <label>
            Email
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="user1@nsbm.lk"
              aria-invalid={Boolean(errors.email)}
              aria-describedby={
                errors.email ? 'auth-email-error' : undefined
              }
            />
            {errors.email && (
              <span className="form-error" id="auth-email-error">
                {errors.email}
              </span>
            )}
          </label>

          <label>
            Password
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="password123"
              aria-invalid={Boolean(errors.password)}
              aria-describedby={
                errors.password ? 'auth-password-error' : undefined
              }
            />
            {errors.password && (
              <span className="form-error" id="auth-password-error">
                {errors.password}
              </span>
            )}
          </label>

          {(submitError || authError) && (
            <p className="auth-form__error" role="alert">
              {submitError || authError}
            </p>
          )}

          <Button type="submit" disabled={submitting}>
            {submitting
              ? 'Working...'
              : isLogin
                ? 'Sign in'
                : 'Create account'}
          </Button>
        </form>
      </section>
    </main>
  );
}
