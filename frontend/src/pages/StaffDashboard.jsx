import { useEffect, useState } from 'react';
import {
  acceptOrder,
  createMenuItem,
  deleteMenuItem,
  getMenu,
  getStaffOrders,
  markCollected,
  markReady,
  rejectOrder,
  updateMenuItem,
  API_BASE_URL
} from '../services/apiService';
import OrderStatusBadge from '../components/OrderStatusBadge';
import StatCard from '../components/StatCard';

const emptyForm = {
  name: '',
  category: 'Snacks',
  price: '',
  todayOffer: false,
  offerPrice: '',
  available: true,
  description: ''
};

export default function StaffDashboard() {
  const [orders, setOrders] = useState([]);
  const [menu, setMenu] = useState([]);
  const [prep, setPrep] = useState({});
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', category: 'Snacks', price: '', description: '' });
  const [message, setMessage] = useState('');
  const [newImageFile, setNewImageFile] = useState(null);
  const [uploadingId, setUploadingId] = useState(null);
  const [imageVersion, setImageVersion] = useState({});

  const load = async () => {
    const [o, m] = await Promise.all([getStaffOrders(), getMenu()]);
    setOrders(o.data);
    setMenu(m.data);
  };

  useEffect(() => {
    load().catch((e) => setMessage(e?.response?.data?.message || 'Could not load staff data'));
  }, []);

  const act = async (fn) => {
    try {
      await fn();
      await load();
    } catch (e) {
      setMessage(e?.response?.data?.message || 'Action failed');
    }
  };

  const uploadMenuImage = async (itemId, file) => {
    if (!file) return false;

    const token = localStorage.getItem('smartCanteenToken');
    const fd = new FormData();
    fd.append('image', file, file.name);

    setUploadingId(itemId);
    setMessage('Uploading food image...');

    try {
      const res = await fetch(`${API_BASE_URL}/menu/${itemId}/image`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: fd
      });

      const raw = await res.text();
      let data = {};
      try { data = raw ? JSON.parse(raw) : {}; } catch { data = { message: raw }; }

      if (!res.ok) {
        throw new Error(data.message || data.error || `Image upload failed (HTTP ${res.status})`);
      }

      setMessage('Food image uploaded successfully.');
      setMenu(prev => prev.map(item => item.id === itemId
        ? { ...item, imageVersion: Date.now() }
        : item
      ));
      return true;
    } catch (e) {
      setMessage(e.message || 'Could not upload image');
      return false;
    } finally {
      setUploadingId(null);
    }
  };

  const submitMenu = async (e) => {
    e.preventDefault();
    try {
      const created = await createMenuItem({
        ...form,
        price: Number(form.price),
        offerPrice: form.todayOffer ? Number(form.offerPrice) : null
      });

      const createdItem =
        created?.data?.data ??
        created?.data ??
        created;

      const createdId = createdItem?.id;

      let imageUploaded = false;
      if (newImageFile && createdId) {
        imageUploaded = await uploadMenuImage(createdId, newImageFile);
      }

      setForm(emptyForm);
      setNewImageFile(null);
      if (imageUploaded) {
        setMessage('Menu item and food image added successfully.');
      } else if (!newImageFile) {
        setMessage('Menu item added successfully.');
      }
      await load().catch(() => {});
    } catch (e) {
      setMessage(e?.response?.data?.message || 'Could not add item');
    }
  };

  const startEdit = (item) => {
    setEditingId(item.id);
    setEditForm({
      name: item.name,
      category: item.category || 'Snacks',
      price: item.price,
      description: item.description || ''
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({ name: '', category: 'Snacks', price: '', description: '' });
  };

  const saveEdit = async (item) => {
    try {
      await updateMenuItem(item.id, {
        name: editForm.name,
        category: editForm.category,
        price: Number(editForm.price),
        description: editForm.description,
        // Preserve today's-offer settings and availability while editing the normal menu fields.
        todayOffer: Boolean(item.todayOffer),
        offerPrice: item.todayOffer && item.offerPrice != null ? Number(item.offerPrice) : null,
        available: Boolean(item.available)
      });
      cancelEdit();
      setMessage(`${item.name} updated successfully.`);
      await load();
    } catch (e) {
      setMessage(e?.response?.data?.message || 'Could not update item');
    }
  };

  const toggleAvailability = async (item) => {
    try {
      await updateMenuItem(item.id, {
        name: item.name,
        category: item.category,
        price: Number(item.price),
        description: item.description || '',
        todayOffer: Boolean(item.todayOffer),
        offerPrice: item.todayOffer && item.offerPrice != null ? Number(item.offerPrice) : null,
        available: !item.available
      });
      setMessage(item.available ? `${item.name} marked Out of Stock.` : `${item.name} is available again.`);
      await load();
    } catch (e) {
      setMessage(e?.response?.data?.message || 'Could not update availability');
    }
  };

  const removeItem = async (item) => {
    if (!window.confirm(`Remove "${item.name}" from the menu?`)) return;
    try {
      await deleteMenuItem(item.id);
      setMessage(`${item.name} removed from the menu.`);
      await load();
    } catch (e) {
      setMessage(e?.response?.data?.message || 'Could not remove item. Use Out of Stock if it is already in order history.');
    }
  };

  const counts = {
    NEW: orders.filter(o => o.status === 'NEW').length,
    PREPARING: orders.filter(o => o.status === 'PREPARING').length,
    READY: orders.filter(o => o.status === 'READY').length,
    COLLECTED: orders.filter(o => o.status === 'COLLECTED').length
  };

  return (
    <div className="container-fluid px-3 px-md-5 py-4">
      {message && (
        <div className="alert alert-info py-2" onClick={() => setMessage('')}>
          {message}
        </div>
      )}

      <div className="d-flex justify-content-between mb-3">
        <div>
          <h4 className="fw-bold mb-1">Staff Dashboard</h4>
          <small className="text-muted">Manage the live order queue and today's offers.</small>
        </div>
        <button className="btn btn-outline-secondary btn-sm" onClick={() => load().catch(() => {})}>Refresh</button>
      </div>

      <div className="row g-3 mb-4">
        <div className="col-6 col-lg-3"><StatCard label="NEW" value={counts.NEW} /></div>
        <div className="col-6 col-lg-3"><StatCard label="PREPARING" value={counts.PREPARING} tone="warning" /></div>
        <div className="col-6 col-lg-3"><StatCard label="READY" value={counts.READY} tone="success" /></div>
        <div className="col-6 col-lg-3"><StatCard label="COLLECTED" value={counts.COLLECTED} tone="secondary" /></div>
      </div>

      <div className="row g-4">
        <div className="col-lg-8">
          <div className="card shadow-sm border-0">
            <div className="card-header bg-white fw-bold">Order Queue</div>
            <div className="table-responsive">
              <table className="table mb-0 align-middle">
                <thead>
                  <tr><th>Token</th><th>Student</th><th>Items</th><th>Amount</th><th>Status</th><th>Action</th></tr>
                </thead>
                <tbody>
                  {orders.map(o => (
                    <tr key={o.id}>
                      <td className="fw-bold text-primary">{o.tokenNumber}</td>
                      <td>{o.student?.name}</td>
                      <td>{o.items.map(i => <div key={i.id}>{i.quantity} {String.fromCharCode(215)} {i.menuItem.name}</div>)}</td>
                      <td>{String.fromCharCode(8377)}{Number(o.totalAmount).toFixed(2)}</td>
                      <td><OrderStatusBadge status={o.status} /></td>
                      <td>
                        {o.status === 'NEW' && (
                          <div className="d-flex gap-2">
                            <input
                              className="form-control form-control-sm"
                              style={{ width: 85 }}
                              type="number"
                              min="1"
                              placeholder="min"
                              value={prep[o.id] || ''}
                              onChange={e => setPrep({ ...prep, [o.id]: e.target.value })}
                            />
                            <button className="btn btn-sm btn-warning" onClick={() => act(() => acceptOrder(o.id, Number(prep[o.id] || 10)))}>Accept</button>
                            <button className="btn btn-sm btn-outline-danger" onClick={() => act(() => rejectOrder(o.id))}>Reject</button>
                          </div>
                        )}
                        {o.status === 'PREPARING' && <button className="btn btn-sm btn-warning" onClick={() => act(() => markReady(o.id))}>Mark Ready</button>}
                        {o.status === 'READY' && <button className="btn btn-sm btn-outline-primary" onClick={() => act(() => markCollected(o.id))}>Mark Collected</button>}
                        {o.status === 'COLLECTED' && <small className="text-muted">Done</small>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="col-lg-4">
          <div className="card shadow-sm border-0">
            <div className="card-header bg-white fw-bold">Add Today's Offer / Food Item</div>
            <div className="card-body">
              <form onSubmit={submitMenu}>
                <input className="form-control mb-2" placeholder="Food name" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                <select className="form-select mb-2" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                  <option>Snacks</option><option>Beverages</option><option>Meals</option><option>Dessert</option>
                </select>
                <input className="form-control mb-2" type="number" min="0" step="0.01" placeholder="Price" required value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} />
                <div className="form-check mb-2">
                  <input className="form-check-input" type="checkbox" checked={form.todayOffer} onChange={e => setForm({ ...form, todayOffer: e.target.checked })} />
                  <label className="form-check-label">Today's Offer</label>
                </div>
                {form.todayOffer && <input className="form-control mb-2" type="number" min="0" step="0.01" placeholder="Offer price" required value={form.offerPrice} onChange={e => setForm({ ...form, offerPrice: e.target.value })} />}
                <textarea
                  className="form-control mb-2"
                  placeholder="Short description"
                  value={form.description}
                  onChange={e =>
                    setForm({
                      ...form,
                      description: e.target.value
                    })
                  }
                />

                <label className="form-label fw-semibold mb-1">
                  Food Image
                </label>

                <input
                  className="form-control mb-3"
                  type="file"
                  accept="image/png,image/jpeg"
                  onChange={e =>
                    setNewImageFile(
                      e.target.files?.[0] || null
                    )
                  }
                />

                <button className="btn btn-warning w-100 fw-bold">
                  <i className="bi bi-plus-circle me-1"></i>
                  Add Item
                </button>
              </form>
            </div>
          </div>

          <div className="card shadow-sm border-0 mt-4">
            <div className="card-header bg-white fw-bold">Manage Menu</div>
            <div className="table-responsive">
              <table className="table table-sm mb-0 align-middle">
                <thead>
                  <tr><th>Item</th><th>Price</th><th>Status</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {menu.map(m => (
                    <tr key={m.id}>
                      {editingId === m.id ? (
                        <td colSpan="4">
                          <div className="p-2 bg-light rounded">
                            <input className="form-control form-control-sm mb-2" value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })} placeholder="Food name" />
                            <div className="row g-2 mb-2">
                              <div className="col-6">
                                <select className="form-select form-select-sm" value={editForm.category} onChange={e => setEditForm({ ...editForm, category: e.target.value })}>
                                  <option>Snacks</option><option>Beverages</option><option>Meals</option><option>Dessert</option>
                                </select>
                              </div>
                              <div className="col-6">
                                <input className="form-control form-control-sm" type="number" min="0" step="0.01" value={editForm.price} onChange={e => setEditForm({ ...editForm, price: e.target.value })} placeholder="Price" />
                              </div>
                            </div>
                            <textarea className="form-control form-control-sm mb-2" value={editForm.description} onChange={e => setEditForm({ ...editForm, description: e.target.value })} placeholder="Description" />
                            <div className="d-flex gap-2">
                              <button className="btn btn-sm btn-warning" onClick={() => saveEdit(m)}>Save</button>
                              <button className="btn btn-sm btn-outline-secondary" onClick={cancelEdit}>Cancel</button>
                            </div>
                          </div>
                        </td>
                      ) : (
                        <>
                          <td>
                            <div className="d-flex align-items-center gap-2">
                              <img
                                src={`${API_BASE_URL}/menu/${m.id}/image?v=${imageVersion[m.id] || m.id}`}
                                alt={m.name}
                                style={{
                                  width: 52,
                                  height: 42,
                                  objectFit: 'cover',
                                  borderRadius: 8,
                                  border: '1px solid #eee'
                                }}
                                onError={e => {
                                  e.currentTarget.style.display = 'none';
                                }}
                              />

                              <div>
                                <div className="fw-semibold">
                                  {m.name}
                                </div>

                                <div className="small text-muted">
                                  {m.category}
                                </div>

                                {m.todayOffer && (
                                  <span className="badge text-bg-warning mt-1">
                                    Today's Offer
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>
                          <td>{String.fromCharCode(8377)}{Number(m.todayOffer && m.offerPrice != null ? m.offerPrice : m.price).toFixed(2)}</td>
                          <td>
                            {m.available ? <span className="badge text-bg-success">AVAILABLE</span> : <span className="badge text-bg-danger">OUT OF STOCK</span>}
                          </td>
                          <td>
                            <div className="d-flex flex-wrap gap-1">
                              <label className="btn btn-sm btn-outline-secondary mb-0">
                                <i className="bi bi-camera me-1"></i>
                                {uploadingId === m.id
                                  ? 'Uploading...'
                                  : 'Image'}

                                <input
                                  type="file"
                                  accept="image/png,image/jpeg"
                                  hidden
                                  disabled={uploadingId === m.id}
                                  onChange={e => {
                                    const file =
                                      e.target.files?.[0];

                                    if (file) {
                                      uploadMenuImage(m.id, file);
                                    }

                                    e.target.value = '';
                                  }}
                                />
                              </label>

                              <button
                                className="btn btn-sm btn-outline-primary"
                                onClick={() => startEdit(m)}
                              >
                                Edit
                              </button>
                              <button className="btn btn-sm btn-outline-warning" onClick={() => toggleAvailability(m)}>
                                {m.available ? 'Out of Stock' : 'Make Available'}
                              </button>
                              <button className="btn btn-sm btn-outline-danger" onClick={() => removeItem(m)}>Remove</button>
                            </div>
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                  {!menu.length && <tr><td colSpan="4" className="text-center text-muted py-3">No menu items yet.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>

          <div className="small text-muted mt-2">
            Tip: Use <strong>Out of Stock</strong> for items already present in order history; use <strong>Remove</strong> for items that are not referenced by previous orders.
          </div>
        </div>
      </div>
    </div>
  );
}



