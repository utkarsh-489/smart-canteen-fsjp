export default function OrderStatusBadge({ status }) {
  const classes = { NEW:'status-new', PREPARING:'status-preparing', READY:'status-ready', COLLECTED:'status-collected', REJECTED:'status-rejected' };
  return <span className={`badge ${classes[status] || 'text-bg-secondary'}`}>{status}</span>;
}
