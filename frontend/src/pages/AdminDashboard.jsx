import { useEffect, useState } from 'react';
import { blockUser, createStaff, getAdminDashboard, getUsers, unblockUser } from '../services/apiService';
import StatCard from '../components/StatCard';
import OrderStatusBadge from '../components/OrderStatusBadge';

const emptyStaffForm = { name: '', email: '', password: '' };

export default function AdminDashboard() {
  const [data, setData] = useState({ ordersToday: 0, revenueToday: 0, pendingOrders: 0, popularItems: [], recentOrders: [], feedback: [] });
  const [users, setUsers] = useState([]);
  const [tab, setTab] = useState('overview');
  const [message, setMessage] = useState('');
  const [staffForm, setStaffForm] = useState(emptyStaffForm);
  const [staffBusy, setStaffBusy] = useState(false);

  const load = async () => {
    try {
      const [d, u] = await Promise.all([getAdminDashboard(), getUsers()]);
      setData(d.data);
      setUsers(u.data);
    } catch (e) {
      setMessage(e?.response?.data?.message || 'Could not load admin data');
    }
  };

  useEffect(() => { load(); }, []);

  const toggle = async (u) => {
    try {
      await (u.blocked ? unblockUser(u.id) : blockUser(u.id));
      await load();
    } catch (e) {
      setMessage(e?.response?.data?.message || 'Action failed');
    }
  };

  const submitStaff = async (e) => {
    e.preventDefault();
    setMessage('');
    setStaffBusy(true);
    try {
      await createStaff(staffForm);
      setStaffForm(emptyStaffForm);
      setMessage('Staff account created successfully. Share the email and password with the staff member.');
      await load();
    } catch (e) {
      setMessage(e?.response?.data?.message || 'Could not create staff account');
    } finally {
      setStaffBusy(false);
    }
  };

  return (
    <div className="container-fluid px-3 px-md-5 py-4">
      {message && <div className="alert alert-info py-2" onClick={() => setMessage('')}>{message}</div>}

      <div className="d-flex justify-content-between align-items-end mb-3">
        <div>
          <h4 className="fw-bold mb-1">Admin Dashboard</h4>
          <small className="text-muted">Full control over users, orders and feedback.</small>
        </div>
        <button className="btn btn-outline-secondary btn-sm" onClick={load}>↻ Refresh</button>
      </div>

      <div className="row g-3 mb-4">
        <div className="col-sm-6 col-lg-3"><StatCard label="ORDERS TODAY" value={data.ordersToday} /></div>
        <div className="col-sm-6 col-lg-3"><StatCard label="REVENUE TODAY" value={`₹${Number(data.revenueToday || 0).toFixed(2)}`} tone="success" /></div>
        <div className="col-sm-6 col-lg-3"><StatCard label="PENDING ORDERS" value={data.pendingOrders} tone="warning" /></div>
        <div className="col-sm-6 col-lg-3"><StatCard label="REGISTERED USERS" value={users.length} tone="danger" /></div>
      </div>

      <ul className="nav nav-tabs mb-3">
        <li className="nav-item"><button className={`nav-link ${tab === 'overview' ? 'active' : ''}`} onClick={() => setTab('overview')}>Overview</button></li>
        <li className="nav-item"><button className={`nav-link ${tab === 'users' ? 'active' : ''}`} onClick={() => setTab('users')}>Manage Users</button></li>
        <li className="nav-item"><button className={`nav-link ${tab === 'feedback' ? 'active' : ''}`} onClick={() => setTab('feedback')}>Feedback</button></li>
      </ul>

      {tab === 'overview' && (
        <div className="row g-4">
          <div className="col-lg-5">
            <div className="card shadow-sm border-0">
              <div className="card-header bg-white fw-bold">Popular Items</div>
              <div className="list-group list-group-flush">
                {data.popularItems.map((x) => <div className="list-group-item d-flex justify-content-between" key={x.name}><span>{x.name}</span><span className="text-muted">{x.quantity} sold</span></div>)}
                {!data.popularItems.length && <div className="p-3 text-muted">No sales data yet.</div>}
              </div>
            </div>
          </div>
          <div className="col-lg-7">
            <div className="card shadow-sm border-0">
              <div className="card-header bg-white fw-bold">Recent Orders</div>
              <div className="table-responsive">
                <table className="table mb-0">
                  <thead><tr><th>Token</th><th>Student</th><th>Amount</th><th>Status</th></tr></thead>
                  <tbody>{data.recentOrders.map((o) => <tr key={o.id}><td>{o.tokenNumber}</td><td>{o.student?.name}</td><td>₹{Number(o.totalAmount).toFixed(2)}</td><td><OrderStatusBadge status={o.status} /></td></tr>)}</tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === 'users' && (
        <>
          <div className="card shadow-sm border-0 mb-3">
            <div className="card-header bg-white fw-bold">Create Staff Account</div>
            <div className="card-body">
              <p className="small text-muted mb-3">Staff accounts are created by you. Share the credentials with the staff member so they can log in through the Staff tab.</p>
              <form className="row g-3" onSubmit={submitStaff}>
                <div className="col-md-4">
                  <label className="form-label">Staff Name</label>
                  <input className="form-control" required placeholder="Rohan Staff" value={staffForm.name} onChange={(e) => setStaffForm({ ...staffForm, name: e.target.value })} />
                </div>
                <div className="col-md-4">
                  <label className="form-label">Staff Email</label>
                  <input className="form-control" required type="email" placeholder="staff@canteen.com" value={staffForm.email} onChange={(e) => setStaffForm({ ...staffForm, email: e.target.value })} />
                </div>
                <div className="col-md-4">
                  <label className="form-label">Temporary Password</label>
                  <input className="form-control" required minLength={6} type="password" placeholder="Minimum 6 characters" value={staffForm.password} onChange={(e) => setStaffForm({ ...staffForm, password: e.target.value })} />
                </div>
                <div className="col-12">
                  <button disabled={staffBusy} className="btn btn-warning fw-bold">{staffBusy ? 'Creating...' : '+ Create Staff Account'}</button>
                </div>
              </form>
            </div>
          </div>

          <div className="card shadow-sm border-0">
            <div className="card-header bg-white fw-bold">User Management</div>
            <div className="table-responsive">
              <table className="table mb-0">
                <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Action</th></tr></thead>
                <tbody>{users.map((u) => <tr key={u.id}><td>{u.name}</td><td>{u.email}</td><td>{u.role}</td><td>{u.blocked ? <span className="badge text-bg-danger">BLOCKED</span> : <span className="badge text-bg-success">ACTIVE</span>}</td><td>{u.role !== 'ADMIN' && <button className={`btn btn-sm ${u.blocked ? 'btn-outline-success' : 'btn-outline-danger'}`} onClick={() => toggle(u)}>{u.blocked ? 'Unblock' : 'Block'}</button>}</td></tr>)}</tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {tab === 'feedback' && (
        <div className="card shadow-sm border-0">
          <div className="card-header bg-white fw-bold">Student Feedback</div>
          <div className="list-group list-group-flush">
            {data.feedback.map((f) => <div className="list-group-item" key={f.id}><div className="d-flex justify-content-between"><strong>{f.student?.name}</strong><span>⭐ {f.rating}/5</span></div><div className="small text-muted">Order: {f.order?.tokenNumber}</div><div className="mt-1">{f.comment || 'No comment'}</div></div>)}
            {!data.feedback.length && <div className="p-3 text-muted">No feedback yet.</div>}
          </div>
        </div>
      )}
    </div>
  );
}
