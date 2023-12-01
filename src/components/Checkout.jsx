// src/components/Checkout.js
import React from 'react';

const Checkout = ({ cart, total }) => {
  return (
    <div>
      <h2>Checkout</h2>
      <ul>
        {cart.map((item) => (
          <li key={item.id}>
            {item.name} - ${item.price}
          </li>
        ))}
      </ul>
      <p>Total: ${total}</p>
      <button>Place Order</button>
    </div>
  );
};

export default Checkout;
