import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/client';
import Logo from '../components/Logo';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      const res = await api.post('/auth/login', { email, password });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      navigate('/board');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    }
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <div
        style={{
          flex: 1,
          background: 'var(--ink)',
          color: 'white',
          padding: '48px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}
      >
        <Logo size={30} wordmarkColor="white" />
        <div>
          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 42,
              lineHeight: 1.15,
              margin: '0 0 16px 0',
              maxWidth: 420,
            }}
          >
            Work, moving together.
          </h1>
          <p style={{ color: '#B8C1D9', fontSize: 16, maxWidth: 380, lineHeight: 1.6 }}>
            Plan projects, assign tasks, and watch your board update live as your
            team moves work forward — in sync, in real time.
          </p>
        </div>
        <p style={{ color: '#6B7B9E', fontSize: 13, margin: 0 }}>
          Built with role-based access control.
        </p>
      </div>

      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 24,
          background: 'var(--bg)',
        }}
      >
        <div style={{ width: '100%', maxWidth: 360 }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 28, marginBottom: 4 }}>
            Log in
          </h2>
          <p style={{ color: 'var(--slate)', marginTop: 0, marginBottom: 28 }}>
            Welcome back — pick up where you left off.
          </p>

          <form onSubmit={handleSubmit}>
            <label style={fieldLabel}>
              Email
              <input
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={inputStyle}
                required
              />
            </label>

            <label style={fieldLabel}>
              Password
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={inputStyle}
                required
              />
            </label>

            {error && (
              <p style={{ color: 'var(--danger)', fontSize: 14, marginBottom: 16 }}>{error}</p>
            )}

            <button type="submit" style={primaryButton}>
              Log in
            </button>
          </form>

          <p style={{ marginTop: 20, color: 'var(--slate)', fontSize: 14 }}>
            No account?{' '}
            <Link to="/signup" style={{ color: 'var(--ink)', fontWeight: 600 }}>
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

const fieldLabel = {
  display: 'block',
  fontSize: 13,
  fontWeight: 600,
  color: 'var(--ink)',
  marginBottom: 16,
};

const inputStyle = {
  width: '100%',
  padding: '10px 12px',
  marginTop: 6,
  border: '1px solid var(--border)',
  borderRadius: 8,
  fontSize: 15,
  background: 'var(--card)',
};

const primaryButton = {
  width: '100%',
  padding: '12px',
  background: 'var(--amber)',
  color: 'var(--ink)',
  border: 'none',
  borderRadius: 8,
  fontSize: 15,
  fontWeight: 700,
  marginTop: 4,
};

export default Login;