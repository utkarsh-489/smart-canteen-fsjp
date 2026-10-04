export default function TopBar({ user, onLogout }) {
  return (
    <header className="topbar px-3 px-md-5">
      <div className="brand"><span className="brand-mark">☕</span><span>Smart Canteen</span><small>System</small></div>
      {user && (
        <div className="d-flex align-items-center gap-3">
          <div className="user-chip"><span className="user-dot">{user.role === 'ADMIN' ? 'A' : user.role === 'STAFF' ? 'S' : 'U'}</span><div><strong>{user.name}</strong><small>{user.role}</small></div></div>
          <button className="btn btn-sm btn-outline-light rounded-pill px-3" onClick={onLogout}>Sign out</button>
        </div>
      )}
    </header>
  );
}
