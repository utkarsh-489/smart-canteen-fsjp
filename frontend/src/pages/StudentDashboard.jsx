import { useEffect, useMemo, useState } from 'react';
import { getMenu, getStudentOrders, placeOrder, submitFeedback } from '../services/apiService';
import MenuCard from '../components/MenuCard';
import OrderStatusBadge from '../components/OrderStatusBadge';

export default function StudentDashboard() {
  const [menu, setMenu] = useState([]);
  const [orders, setOrders] = useState([]);
  const [cart, setCart] = useState([]);
  const [category, setCategory] = useState('ALL');
  const [search, setSearch] = useState('');
  const [message, setMessage] = useState('');
  const [feedbackOrder, setFeedbackOrder] = useState(null);
  const [showOffer, setShowOffer] = useState(false);

  const load = async (showOfferOnce = false) => {
    try {
      const [m, o] = await Promise.all([getMenu(), getStudentOrders()]);
      const version = Date.now();
      const nextMenu = m.data.map(item => ({ ...item, imageVersion: version }));
      setMenu(nextMenu);
      setOrders(o.data);

      if (showOfferOnce && nextMenu.some(item => item.todayOffer) && !sessionStorage.getItem('smartCanteenOfferShown')) {
        setShowOffer(true);
        sessionStorage.setItem('smartCanteenOfferShown', '1');
      }
    } catch (e) {
      setMessage(e?.response?.data?.message || 'Could not load data');
    }
  };

  useEffect(() => {
    load(true);
    const id = setInterval(() => load(false), 5000);
    return () => clearInterval(id);
  }, []);

  const offers = useMemo(() => menu.filter(item => item.todayOffer && item.available !== false), [menu]);
  const categories = ['ALL', ...new Set(menu.map(x => x.category).filter(Boolean))];
  const filtered = menu.filter(item =>
    (category === 'ALL' || item.category === category) &&
    item.name.toLowerCase().includes(search.toLowerCase())
  );
  const total = useMemo(() => cart.reduce((sum, item) => sum + item.price * item.quantity, 0), [cart]);

  const add = item => setCart(prev => {
    const existing = prev.find(x => x.id === item.id);
    const price = item.todayOffer && item.offerPrice != null ? Number(item.offerPrice) : Number(item.price);
    return existing
      ? prev.map(x => x.id === item.id ? { ...x, quantity: x.quantity + 1 } : x)
      : [...prev, { ...item, price, quantity: 1 }];
  });

  const updateQty = (id, delta) => setCart(prev =>
    prev.map(x => x.id === id ? { ...x, quantity: x.quantity + delta } : x).filter(x => x.quantity > 0)
  );

  const checkout = async () => {
    if (!cart.length) {
      setMessage('Add at least one item to the cart.');
      return;
    }
    try {
      const r = await placeOrder({
        items: cart.map(x => ({ menuItemId: x.id, quantity: x.quantity })),
        paymentMethod: 'DEMO-UPI'
      });
      setCart([]);
      setMessage(`Order ${r.data.tokenNumber} placed successfully. Payment: SUCCESS.`);
      await load(false);
    } catch (e) {
      setMessage(e?.response?.data?.message || 'Order failed');
    }
  };

  const feedback = async () => {
    try {
      await submitFeedback({
        orderId: feedbackOrder.id,
        rating: Number(feedbackOrder.rating),
        comment: feedbackOrder.comment
      });
      setFeedbackOrder(null);
      setMessage('Thank you for your feedback!');
    } catch (e) {
      setMessage(e?.response?.data?.message || 'Feedback failed');
    }
  };

  return (
    <div className="student-shell">
      {message && <div className="toast-message" onClick={() => setMessage('')}>{message}</div>}

      <div className="container-fluid px-3 px-md-5 py-4">
        <section className="student-hero mb-4">
          <div>
            <span className="hero-kicker">SMART CANTEEN • CAMPUS FOOD, REIMAGINED</span>
            <h1>Good food. Less waiting.</h1>
            <p>Order ahead, see the queue, and pick up when your meal is ready.</p>
            <div className="hero-chips">
              <span>{menu.length} menu items</span>
              <span>{offers.length} special offers</span>
              <span>Live order tracking</span>
            </div>
          </div>
          <div className="hero-plate">🍱</div>
        </section>

        {offers.length > 0 && (
          <section className="offer-strip mb-4">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <div>
                <div className="section-kicker">TODAY'S SPECIAL</div>
                <h5 className="mb-0 fw-bold">Fresh offers for you</h5>
              </div>
              <button className="btn btn-sm btn-dark rounded-pill" onClick={() => setShowOffer(true)}>View offers</button>
            </div>
            <div className="row g-3">
              {offers.slice(0, 3).map(item => (
                <div className="col-md-4" key={item.id}>
                  <button className="offer-mini-card" onClick={() => add(item)}>
                    <span className="offer-mini-icon">🔥</span>
                    <span className="text-start flex-grow-1">
                      <strong>{item.name}</strong>
                      <small>{item.category}</small>
                    </span>
                    <span className="offer-price">₹{Number(item.offerPrice ?? item.price).toFixed(0)}</span>
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
          <div>
            <h3 className="mb-1 fw-bold">Explore the menu</h3>
            <div className="text-muted small">Choose your food and build your cart.</div>
          </div>
          <span className="live-pill"><span></span> Menu updates every 5 sec</span>
        </div>

        <div className="row g-4">
          <div className="col-lg-8">
            <div className="card shell-card mb-4">
              <div className="card-body">
                <div className="d-flex gap-2 mb-3 menu-toolbar">
                  <div className="search-wrap flex-grow-1">
                    <span>⌕</span>
                    <input className="form-control" placeholder="Search for food items..." value={search} onChange={e => setSearch(e.target.value)} />
                  </div>
                  <select className="form-select category-select" value={category} onChange={e => setCategory(e.target.value)}>
                    {categories.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div className="row g-3">
                  {filtered.map(item => (
                    <div className="col-sm-6 col-xl-4" key={item.id}>
                      <MenuCard item={item} onAdd={add} />
                    </div>
                  ))}
                  {!filtered.length && <div className="text-center text-muted py-5">No food items match your search.</div>}
                </div>
              </div>
            </div>

            <div className="card shell-card">
              <div className="card-header section-card-header">
                <div><h5 className="mb-1 fw-bold">My Orders</h5><small className="text-muted">Track every order from kitchen to pickup.</small></div>
              </div>
              <div className="table-responsive">
                <table className="table table-hover mb-0 align-middle">
                  <thead><tr><th>Token</th><th>Items</th><th>Amount</th><th>Queue</th><th>Wait</th><th>Status</th><th>Action</th></tr></thead>
                  <tbody>
                    {orders.map(o => (
                      <tr key={o.id}>
                        <td className="fw-bold text-primary">{o.tokenNumber}</td>
                        <td>{o.items.map(i => <div key={i.id}>{i.quantity} × {i.menuItem.name}</div>)}</td>
                        <td>₹{Number(o.totalAmount).toFixed(2)}</td>
                        <td>{o.queuePosition ? `#${o.queuePosition}` : '—'}</td>
                        <td>{o.status === 'PREPARING' ? `${o.estimatedMinutes ?? '—'} min` : '—'}</td>
                        <td><OrderStatusBadge status={o.status} /></td>
                        <td>
                          {o.status === 'COLLECTED' && <button className="btn btn-sm btn-outline-primary rounded-pill" onClick={() => setFeedbackOrder({ ...o, rating: 5, comment: '' })}>Feedback</button>}
                          {o.status === 'READY' && <span className="text-success small fw-semibold">🟢 Ready for pickup</span>}
                        </td>
                      </tr>
                    ))}
                    {!orders.length && <tr><td colSpan="7" className="text-center text-muted py-4">No orders yet.</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="col-lg-4">
            <div className="card shell-card cart-panel">
              <div className="card-header section-card-header"><div><h5 className="mb-1 fw-bold">Your Cart</h5><small className="text-muted">Ready when you are.</small></div><span className="cart-count">{cart.reduce((s, i) => s + i.quantity, 0)}</span></div>
              <div className="card-body">
                {cart.map(i => (
                  <div className="cart-line" key={i.id}>
                    <div className="cart-line-main"><div className="fw-semibold">{i.name}</div><small className="text-muted">₹{i.price.toFixed(2)} × {i.quantity}</small></div>
                    <div className="btn-group btn-group-sm"><button className="btn btn-outline-secondary" onClick={() => updateQty(i.id, -1)}>-</button><button className="btn btn-outline-secondary disabled">{i.quantity}</button><button className="btn btn-outline-secondary" onClick={() => updateQty(i.id, 1)}>+</button></div>
                  </div>
                ))}
                {!cart.length && <div className="empty-cart"><div className="empty-cart-icon">🛒</div><strong>Your cart is empty</strong><span>Add an item from the menu to get started.</span></div>}
                <div className="cart-total"><span>Total</span><strong>₹{total.toFixed(2)}</strong></div>
                <button className="btn btn-warning w-100 mt-3 fw-bold btn-lg rounded-3" onClick={checkout}>Place Order & Pay</button>
                <div className="small text-muted mt-2 text-center">Payment is simulated for the FSJP project demo.</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showOffer && (
        <div className="modal-backdrop-custom">
          <div className="offer-modal">
            <button className="modal-close" onClick={() => setShowOffer(false)}>×</button>
            <div className="offer-modal-top">🎉 Today's Special Offer</div>
            <h3>Good food, better prices.</h3>
            <p className="text-muted">Limited-time canteen specials available today.</p>
            <div className="offer-modal-grid">
              {offers.slice(0, 3).map(item => (
                <div className="offer-modal-card" key={item.id}>
                  <div className="offer-modal-art">🍽️</div>
                  <strong>{item.name}</strong>
                  <span>{item.description || 'Freshly prepared and ready for you.'}</span>
                  <div className="d-flex justify-content-between align-items-center mt-2"><span className="offer-price">₹{Number(item.offerPrice ?? item.price).toFixed(0)}</span><button className="btn btn-warning btn-sm rounded-pill" onClick={() => { add(item); setShowOffer(false); }}>Add to cart</button></div>
                </div>
              ))}
            </div>
            <div className="d-flex justify-content-end mt-3"><button className="btn btn-light rounded-pill" onClick={() => setShowOffer(false)}>Maybe later</button></div>
          </div>
        </div>
      )}

      {feedbackOrder && (
        <div className="modal-backdrop-custom">
          <div className="mini-modal">
            <h5 className="fw-bold">Rate {feedbackOrder.tokenNumber}</h5>
            <select className="form-select mb-2" value={feedbackOrder.rating} onChange={e => setFeedbackOrder({ ...feedbackOrder, rating: e.target.value })}>{[5,4,3,2,1].map(v => <option key={v}>{v}</option>)}</select>
            <textarea className="form-control mb-3" placeholder="Your feedback" value={feedbackOrder.comment} onChange={e => setFeedbackOrder({ ...feedbackOrder, comment: e.target.value })}/>
            <div className="d-flex justify-content-end gap-2"><button className="btn btn-light" onClick={() => setFeedbackOrder(null)}>Cancel</button><button className="btn btn-warning" onClick={feedback}>Submit</button></div>
          </div>
        </div>
      )}
    </div>
  );
}
