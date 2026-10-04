import { useState } from 'react';
import { API_BASE_URL } from '../services/apiService';

export default function MenuCard({ item, onAdd }) {
  const price =
    item.todayOffer && item.offerPrice != null
      ? item.offerPrice
      : item.price;

  const soldOut = item.available === false;
  const [imageFailed, setImageFailed] = useState(false);

  const imageUrl =
    `${API_BASE_URL}/menu/${item.id}/image?v=${item.imageVersion || 0}`;

  return (
    <div className={`card menu-card h-100 ${soldOut ? 'opacity-75' : ''}`}>

      <div
        className="food-thumb"
        style={{
          minHeight: '180px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden'
        }}
      >
        {!imageFailed ? (
          <img
            src={imageUrl}
            alt={item.name}
            style={{
              width: '100%',
              height: '100%',
              minHeight: '180px',
              objectFit: 'cover',
              display: 'block'
            }}
            onError={() => setImageFailed(true)}
          />
        ) : (
          <div
            style={{
              fontSize: '15px',
              fontWeight: '700',
              letterSpacing: '1px',
              color: '#6b7280',
              textAlign: 'center'
            }}
          >
            FOOD IMAGE
          </div>
        )}
      </div>

      <div className="card-body d-flex flex-column">
        <div className="d-flex justify-content-between align-items-start gap-2">
          <div>
            <h6 className="mb-1 fw-bold">{item.name}</h6>
            <small className="text-muted">{item.category}</small>
          </div>

          <div className="d-flex gap-1 align-items-center">
            {soldOut && (
              <span className="badge text-bg-danger">
                Sold Out
              </span>
            )}

            {!soldOut && item.todayOffer && (
              <span className="badge text-bg-warning">
                Offer
              </span>
            )}
          </div>
        </div>

        <p className="small text-muted mt-2 mb-3">
          {item.description}
        </p>

        <div className="mt-auto d-flex justify-content-between align-items-center">
          <span className="fw-bold">
            &#8377;{Number(price).toFixed(2)}
          </span>

          <button
            className={`btn btn-sm ${
              soldOut ? 'btn-outline-secondary' : 'btn-warning'
            }`}
            disabled={soldOut}
            onClick={() => onAdd(item)}
          >
            {soldOut ? 'Sold Out' : 'Add to cart'}
          </button>
        </div>
      </div>
    </div>
  );
}
