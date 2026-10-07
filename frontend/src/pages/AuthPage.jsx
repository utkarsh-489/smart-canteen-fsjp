import { useState } from 'react';
import { login, register, setupCanteen } from '../services/apiService';

const emptyStudentForm = { name: '', email: '', password: '' };
const emptySetupForm = {
  canteenName: '',
  collegeName: '',
  location: '',
  adminName: '',
  adminEmail: '',
  password: '',
  confirmPassword: ''
};

export default function AuthPage({ onLogin }) {
  const [mode, setMode] = useState('login');
  const [role, setRole] = useState('STUDENT');
  const [form, setForm] = useState(emptyStudentForm);
  const [setupForm, setSetupForm] = useState(emptySetupForm);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const clearMessages = () => setError('');

  const goToLogin = (nextRole = 'STUDENT') => {
    setMode('login');
    setRole(nextRole);
    setForm(emptyStudentForm);
    setSetupForm(emptySetupForm);
    clearMessages();
  };

  const openStudentRegister = () => {
    setMode('register');
    setRole('STUDENT');
    setForm(emptyStudentForm);
    clearMessages();
  };

  const openCanteenSetup = () => {
    setMode('canteenSetup');
    setSetupForm(emptySetupForm);
    clearMessages();
  };

  const saveSession = (data) => {
    localStorage.setItem('smartCanteenToken', data.token);
    localStorage.setItem('smartCanteenUser', JSON.stringify(data));
    onLogin(data);
  };

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);

    try {
      if (mode === 'canteenSetup') {
        if (setupForm.password !== setupForm.confirmPassword) {
          throw new Error('Passwords do not match');
        }
        if (setupForm.password.length < 6) {
          throw new Error('Password must be at least 6 characters');
        }

        const res = await setupCanteen(setupForm);
        saveSession(res.data);
        return;
      }

      const res = mode === 'login'
        ? await login({ email: form.email, password: form.password, role })
        : await register(form);

      saveSession(res.data);
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Something went wrong');
    } finally {
      setBusy(false);
    }
  };

  const isSetup = mode === 'canteenSetup';
  const isRegister = mode === 'register';

  return (
    <div className="auth-wrap">
      <div className="auth-split">
        <div className="auth-visual d-none d-lg-flex">
          <div className="auth-visual-content">
            <span className="hero-kicker">CAMPUS FOOD • MADE SMART</span>
            <h1>Good Food.<br />Better Campus Life.</h1>
            <p>Skip the queue. Order ahead. Pick up when your meal is ready.</p>
            <div className="auth-food-stack"><span>🍔</span><span>🍕</span><span>🥤</span><span>🥟</span></div>
          </div>
        </div>

        <div className="auth-card">
          <div className="text-center mb-4">
            <div className="auth-icon">☕</div>
            <span className="auth-kicker">SMART CANTEEN SYSTEM</span>
            <h2 className="fw-bold mb-1">
              {isSetup ? 'Set up your canteen' : isRegister ? 'Create your account' : 'Welcome back'}
            </h2>
            <p className="text-muted small mb-0">
              {isSetup
                ? 'Create your canteen and administrator account'
                : isRegister
                  ? 'Create your student account'
                  : 'Sign in to continue'}
            </p>
          </div>

          {mode === 'login' && (
            <div className="role-tabs mb-3">
              {['STUDENT', 'STAFF', 'ADMIN'].map((r) => (
                <button
                  key={r}
                  className={role === r ? 'active' : ''}
                  onClick={() => { setRole(r); clearMessages(); }}
                  type="button"
                >
                  {r[0] + r.slice(1).toLowerCase()}
                </button>
              ))}
            </div>
          )}

          {mode === 'login' && role === 'STAFF' && (
            <div className="demo-hint mb-3">
              <strong>Staff access</strong><br />
              Staff accounts are created by the Canteen Admin.<br />
              Use the email and password provided by your administrator.
            </div>
          )}

          {mode === 'login' && role === 'ADMIN' && (
            <div className="demo-hint mb-3">
              <strong>Admin access</strong><br />
              New canteen? Complete Canteen Setup to create the administrator account.
            </div>
          )}

          <form onSubmit={submit}>
            {isSetup ? (
              <>
                <div className="mb-3">
                  <label className="form-label">Canteen Name</label>
                  <input className="form-control" required placeholder="ABC College Canteen" value={setupForm.canteenName} onChange={(e) => setSetupForm({ ...setupForm, canteenName: e.target.value })} />
                </div>
                <div className="mb-3">
                  <label className="form-label">College / Institution Name</label>
                  <input className="form-control" required placeholder="ABC College of Engineering" value={setupForm.collegeName} onChange={(e) => setSetupForm({ ...setupForm, collegeName: e.target.value })} />
                </div>
                <div className="mb-3">
                  <label className="form-label">Location</label>
                  <input className="form-control" required placeholder="Mumbai, Maharashtra" value={setupForm.location} onChange={(e) => setSetupForm({ ...setupForm, location: e.target.value })} />
                </div>
                <div className="mb-3">
                  <label className="form-label">Admin Name</label>
                  <input className="form-control" required placeholder="Enter administrator name" value={setupForm.adminName} onChange={(e) => setSetupForm({ ...setupForm, adminName: e.target.value })} />
                </div>
                <div className="mb-3">
                  <label className="form-label">Admin Email</label>
                  <input className="form-control" required type="email" placeholder="admin@college.edu" value={setupForm.adminEmail} onChange={(e) => setSetupForm({ ...setupForm, adminEmail: e.target.value })} />
                </div>
                <div className="mb-3">
                  <label className="form-label">Password</label>
                  <input className="form-control" required minLength={6} type="password" placeholder="Create admin password" value={setupForm.password} onChange={(e) => setSetupForm({ ...setupForm, password: e.target.value })} />
                </div>
                <div className="mb-3">
                  <label className="form-label">Confirm Password</label>
                  <input className="form-control" required minLength={6} type="password" placeholder="Re-enter admin password" value={setupForm.confirmPassword} onChange={(e) => setSetupForm({ ...setupForm, confirmPassword: e.target.value })} />
                </div>
              </>
            ) : (
              <>
                {isRegister && (
                  <div className="mb-3">
                    <label className="form-label">Full Name</label>
                    <input className="form-control" required placeholder="Enter your name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                  </div>
                )}
                <div className="mb-3">
                  <label className="form-label">Email</label>
                  <input className="form-control" required type="email" placeholder="name@college.edu" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                </div>
                <div className="mb-3">
                  <label className="form-label">Password</label>
                  <input className="form-control" required minLength={6} type="password" placeholder="Enter your password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
                </div>
              </>
            )}

            {error && <div className="alert alert-danger py-2 small">{error}</div>}

            <button disabled={busy} className="btn btn-warning w-100 fw-bold btn-lg rounded-3">
              {busy
                ? 'Please wait...'
                : isSetup
                  ? 'Create Canteen & Admin Account'
                  : mode === 'login'
                    ? `Sign in as ${role.toLowerCase()}`
                    : 'Create Account'}
            </button>
          </form>

          <div className="text-center mt-3 small">
            {mode === 'login' && role === 'STUDENT' && (
              <><span className="text-muted">New student?</span> <button className="btn btn-link btn-sm p-0" onClick={openStudentRegister}>Create your account</button></>
            )}

            {mode === 'login' && role !== 'STUDENT' && (
              role === 'ADMIN'
                ? <><span className="text-muted">New canteen?</span> <button className="btn btn-link btn-sm p-0" onClick={openCanteenSetup}>Set up your canteen</button></>
                : <span className="text-muted">Need access? Contact your Canteen Admin.</span>
            )}

            {mode === 'register' && (
              <><span className="text-muted">Already registered?</span> <button className="btn btn-link btn-sm p-0" onClick={() => goToLogin('STUDENT')}>Sign in</button></>
            )}

            {mode === 'canteenSetup' && (
              <><span className="text-muted">Already have admin access?</span> <button className="btn btn-link btn-sm p-0" onClick={() => goToLogin('ADMIN')}>Sign in as Admin</button></>
            )}
          </div>

          {mode === 'login' && (
            <div className="demo-hint mt-3">
              <strong>Demo credentials</strong><br />
              Admin · admin@canteen.com · admin123<br />
              Staff · staff@canteen.com · staff123<br />
              Student · student@college.edu · student123
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
