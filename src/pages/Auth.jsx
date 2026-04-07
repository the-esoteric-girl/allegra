import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useApp } from '../hooks/useApp';
import { Button, Card, Input, PageState } from '../components/ui';
import styles from './Auth.module.css';

export default function Auth() {
  const { user, loading, signIn, signUp } = useApp();
  const [mode, setMode] = useState('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();

    const trimmedEmail = email.trim();
    const trimmedUsername = username.trim();

    if (!trimmedEmail || !password) {
      setFormError('Email and password are required.');
      return;
    }

    if (mode === 'signup' && !trimmedUsername) {
      setFormError('Username is required for sign up.');
      return;
    }

    setSubmitting(true);
    setFormError('');

    const result = mode === 'signup'
      ? await signUp(trimmedEmail, password, trimmedUsername)
      : await signIn(trimmedEmail, password);

    if (!result.ok) {
      setFormError(result.error?.message || 'Something went wrong.');
    }

    setSubmitting(false);
  }

  if (loading) {
    return <PageState text="Loading..." className={styles.loading} />;
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Allegra</h1>
        <p className={styles.subtitle}>Move tracker</p>
      </div>

      <Card className={styles.card}>
        <div className={styles.modeRow}>
          <Button
            variant={mode === 'signin' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setMode('signin')}
            data-testid="auth-mode-signin"
          >
            Sign in
          </Button>
          <Button
            variant={mode === 'signup' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setMode('signup')}
            data-testid="auth-mode-signup"
          >
            Sign up
          </Button>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          {mode === 'signup' && (
            <Input
              id="auth-username"
              name="auth-username"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          )}

          <Input
            id="auth-email"
            name="auth-email"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <Input
            id="auth-password"
            name="auth-password"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {formError && <p className={styles.error}>{formError}</p>}

          <Button type="submit" fullWidth disabled={submitting} data-testid="auth-submit">
            {submitting
              ? (mode === 'signup' ? 'Creating account...' : 'Signing in...')
              : (mode === 'signup' ? 'Create account' : 'Sign in')}
          </Button>
        </form>
      </Card>
    </div>
  );
}
