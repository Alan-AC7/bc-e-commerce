import './App.css';
import { useState, useEffect } from 'react';
import { LightningAddress } from '@getalby/lightning-tools';
import { Modal, launchModal, disconnect } from '@getalby/bitcoin-connect-react';

export default function App() {
  const [products, setProducts] = useState([
    { id: 1, name: 'Doritos', price: 24 }, 
    { id: 2, name: 'Coca - Cola', price: 10 }, 
    { id: 3, name: 'Nachos', price: 8 }, 
    { id: 4, name: 'Water', price: 10 },
  ]);

  const [cart, setCart] = useState({});
  const [connected, setConnected] = useState(false);
  const [invoice, setInvoice] = useState('');

  useEffect(() => {
    window.addEventListener('bc:connected', () => {
      setConnected(true);
    });
    window.addEventListener('bc:disconnected', () => {
      setConnected(false);
    });
  }, []);

  useEffect(() => {
    // Calculate the total amount in satoshis for the invoice
    const totalSatoshi = Object.entries(cart).reduce((total, [productId, quantity]) => {
      const product = products.find((p) => p.id.toString() === productId);
      return total + product.price * quantity;
    }, 0);

    (async () => {
      // Generate an invoice for the total amount in satoshis
      const ln = new LightningAddress('yoggyac7@getalby.com');
      await ln.fetch();
      const generatedInvoice = await ln.requestInvoice({ satoshi: totalSatoshi });
      setInvoice(generatedInvoice.paymentRequest);
    })();
  }, [cart, products]);

  const addToCart = (product) => {
    setCart((prevCart) => ({
      ...prevCart,
      [product.id]: (prevCart[product.id] || 0) + 1,
    }));
  };

  const removeFromCart = (product) => {
    setCart((prevCart) => {
      const updatedCart = { ...prevCart };
      if (updatedCart[product.id] > 1) {
        updatedCart[product.id] -= 1;
      } else {
        delete updatedCart[product.id];
      }
      return updatedCart;
    });
  };

  const calculateTotal = () => {
    return Object.entries(cart).reduce((total, [productId, quantity]) => {
      const product = products.find((p) => p.id.toString() === productId);
      return total + product.price * quantity;
    }, 0);
  };

  const handleCheckout = () => {
    launchModal({ invoice });
  };

  return (
    <main>
      <h1>Bitcoin Connect E-Commerce Payment Demo</h1>
      <p>This client-side web application will request permission to send a payment for a purchase in an e-commerce using Bitcoin Connect.</p>
      <Modal />
      <div>
        <h2>Product List</h2>
        <ul>
          {products.map((product) => (
            <li key={product.id}>
              {product.name} - {product.price} Sats
              <button onClick={() => addToCart(product)}>Add to Cart</button>
            </li>
          ))}
        </ul>
      </div>
      <div>
        <h2>Shopping Cart</h2>
        <ul>
          {Object.entries(cart).map(([productId, quantity]) => {
            const product = products.find((p) => p.id.toString() === productId);
            return (
              <li key={productId}>
                {product.name} - {product.price} Sats x {quantity}
                <button onClick={() => removeFromCart(product)}>Remove</button>
              </li>
            );
          })}
        </ul>
        <p>Total: {calculateTotal()} Sats</p>
        <button onClick={handleCheckout}>Checkout</button>
      </div>
      {connected && (
        <button
          onClick={() => {
            disconnect();
            setConnected(false);
          }}
        >
          Disconnect
        </button>
      )}
      <hr />
      <a href="https://replit.com/@rolznz/Bitcoin-Connect-Request-Payment-Modal#src/App.jsx">Source code on replit</a>
    </main>
  );
}
