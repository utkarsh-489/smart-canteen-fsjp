export default function StatCard({ label, value, tone='primary' }) {
  return <div className={`stat-card border-${tone}`}><div className="stat-label">{label}</div><div className="stat-value">{value}</div></div>;
}
