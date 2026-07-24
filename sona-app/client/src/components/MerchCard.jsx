import { React } from 'react';

export default function MerchCard({ merch }) {
  return (
    <div className="card">
      <img src={merch.photo} alt={merch.name} className="card-photo" />

      <div className="name-bar">{merch.name}</div>
      <span className="genre-tag">{merch.type}</span>

      <div className="card-actions">
        <span className="price-tag">${Number(merch.price).toFixed(2)}</span>
      </div>
    </div>
  );
}