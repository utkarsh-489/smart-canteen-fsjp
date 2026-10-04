import { useState } from 'react';
import { login, register } from '../services/apiService';

export default function AuthPage({ onLogin }) {
  const [mode, setMode] = useState('login');
  const [role, setRole] = useState('STUDENT');
  const [form, setForm] = useState({ name:'', email:'', password:'' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault(); setError(''); setBusy(true);
    try {
      const res = mode === 'login'
        ? await login({ email: form.email, password: form.password, role })
        : await register(form);
      const data = res.data;
      localStorage.setItem('smartCanteenToken', data.token);
      localStorage.setItem('smartCanteenUser', JSON.stringify(data));
      onLogin(data);
    } catch (err) {
      setError(err?.response?.data?.message || 'Something went wrong');
    } finally { setBusy(false); }
  };

  return (
    <div className="auth-wrap">
      <div className="auth-split">
        <div className="auth-visual d-none d-lg-flex">
          <div className="auth-visual-content">
            <span className="hero-kicker">CAMPUS FOOD • MADE SMART</span>
            <h1>Good Food.<br/>Better Campus Life.</h1>
            <p>Skip the queue. Order ahead. Pick up when your meal is ready.</p>
            <div className="auth-food-stack"><span>🍔</span><span>🍕</span><span>🥤</span><span>🥟</span></div>
          </div>
        </div>

        <div className="auth-card">
          <div className="text-center mb-4">
            <div className="auth-icon">☕</div>
            <span className="auth-kicker">SMART CANTEEN SYSTEM</span>
            <h2 className="fw-bold mb-1">Welcome back</h2>
            <p className="text-muted small mb-0">{mode === 'login' ? 'Sign in to continue' : 'Create your student account'}</p>
          </div>

          {mode === 'login' && (
            <div className="role-tabs mb-3">
              {['STUDENT','STAFF','ADMIN'].map(r => <button key={r} className={role===r?'active':''} onClick={() => setRole(r)} type="button">{r[0] + r.slice(1).toLowerCase()}</button>)}
            </div>
          )}

          <form onSubmit={submit}>
            {mode === 'register' && <div className="mb-3"><label className="form-label">Full Name</label><input className="form-control" required placeholder="Enter your name" value={form.name} onChange={e => setForm({...form, name:e.target.value})}/></div>}
            <div className="mb-3"><label className="form-label">Email</label><input className="form-control" required type="email" placeholder="name@college.edu" value={form.email} onChange={e => setForm({...form,email:e.target.value})}/></div>
            <div className="mb-3"><label className="form-label">Password</label><input className="form-control" required minLength={6} type="password" placeholder="Enter your password" value={form.password} onChange={e => setForm({...form,password:e.target.value})}/></div>
            {error && <div className="alert alert-danger py-2 small">{error}</div>}
            <button disabled={busy} className="btn btn-warning w-100 fw-bold btn-lg rounded-3">{busy ? 'Please wait...' : mode === 'login' ? `Sign in as ${role.toLowerCase()}` : 'Create Account'}</button>
          </form>

          <div className="text-center mt-3 small">
            {mode === 'login'
              ? <><span className="text-muted">New student?</span> <button className="btn btn-link btn-sm p-0" onClick={() => {setMode('register');setRole('STUDENT');setError('')}}>Create your account</button></>
              : <><span className="text-muted">Already registered?</span> <button className="btn btn-link btn-sm p-0" onClick={() => setMode('login')}>Sign in</button></>}
          </div>

          {mode === 'login' && <div className="demo-hint mt-3"><strong>Demo credentials</strong><br/>Admin · admin@canteen.com · admin123<br/>Staff · staff@canteen.com · staff123<br/>Student · student@college.edu · student123</div>}
        </div>
      </div>
    </div>
  );
}
