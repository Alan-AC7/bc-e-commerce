import React from "react";
import "./App.css";
import { useState, useEffect } from "react";
import { LightningAddress } from "@getalby/lightning-tools";
import { launchPaymentModal } from "@getalby/bitcoin-connect-react";
import coke from "./img/coke.png";
import cookies from "./img/oreo.png";
import water from "./img/water.png";

export default function App() {
  const [products, setProducts] = useState([
    {
      id: 1,
      name: "Coca - Cola",
      price: 10,
      image: coke,
      details: "A 330ml can of Coca-Cola",
    },
    {
      id: 2,
      name: "Cookies",
      price: 8,
      image: cookies,
      details: "Oreo 12 Pack",
    },
    {
      id: 3,
      name: "Water",
      price: 10,
      image: water,
      details: "A 250ml bottle of fresh water",
    },
  ]);

  const [cart, setCart] = useState({});
  const [invoice, setInvoice] = useState("");

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

  const getProductQuantity = (productId) => {
    return cart[productId] || 0;
  };

  const handleCheckout = async () => {
    if (Object.keys(cart).length === 0) {
      alert("Your Cart is empty. Please add some products!");
    } else {
      const totalSatoshi = Object.entries(cart).reduce(
        (total, [productId, quantity]) => {
          const product = products.find((p) => p.id.toString() === productId);
          return total + product.price * quantity;
        },
        0,
      );

      const ln = new LightningAddress("hello@getalby.com");
      await ln.fetch();
      const generatedInvoice = await ln.requestInvoice({
        satoshi: totalSatoshi,
      });

      setInvoice(generatedInvoice.paymentRequest);

      const { setPaid } = launchPaymentModal({
        invoice: generatedInvoice.paymentRequest,
        onPaid: ({}) => {
          clearInterval(checkPaymentInterval);
          setCart({});
        },
        onCancelled: () => {
          alert("Payment cancelled");
        },
      });
      const checkPaymentInterval = setInterval(async () => {
        const paid = await generatedInvoice.verifyPayment();

        if (paid && generatedInvoice.preimage) {
          setPaid({
            preimage: generatedInvoice.preimage,
          });
        }
      }, 1000);
    }
  };
  return (
    <main className="container mx-auto p-8">
      <h1 className="font-bold text-4xl text-[rgb(25,108,233)] text-center">
        Bitcoin Connect E-Commerce Payment Demo
      </h1>
      <br></br>
      <p className="text-[rgb(25,108,233)] text-2xl text-center">
        This client-side web application will request permission to send a
        payment for a purchase in an e-commerce using Bitcoin Connect.
      </p>

      <br></br>
      <br></br>
      <div className="flex flex-wrap justify-center">
        <div className="w-full md:w-1/2 lg:w-2/3 pr-4 mb-8">
          <section className="bg-neutral-800 border-4 border-[rgb(25,108,233)] rounded-lg pt-10 pb-10 dark:bg-white">
            <div className="mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-center">
                <h1 className="text-2xl font-semibold text-[rgb(25,108,233)]">
                  Your Cart
                </h1>
              </div>

              <div className="mx-auto mt-8 max-w-2xl md:mt-12">
                <div className="bg-neutral-100 shadow py-6 ">
                  <div className="px-4">
                    <div className="flow-root">
                      <ul className="-my-8">
                        {products.map((product) => (
                          <li
                            key={product.id}
                            className="flex flex-col space-y-3 py-6 text-left sm:flex-row sm:space-x-5 sm:space-y-0"
                          >
                            <div className="shrink-0">
                              <img
                                className="h-24 w-24 max-w-full rounded-lg object-cover"
                                src={product.image}
                                alt={product.name}
                              />
                            </div>

                            <div className="relative flex flex-1 flex-col justify-between">
                              <div className="sm:col-gap-5 sm:grid sm:grid-cols-2">
                                <div className="pr-8 sm:pr-5">
                                  <p className="text-base font-semibold text-[rgb(25,108,233)]">
                                    {product.name}
                                  </p>
                                  <p className="mx-0 mt-1 mb-0 text-sm text-[rgb(25,108,233)]">
                                    {product.details}
                                  </p>
                                </div>

                                <div className="mt-4 flex items-end justify-between sm:mt-0 sm:items-start sm:justify-end">
                                  <p className="shrink-0 w-20 text-base font-semibold text-[rgb(25,108,233)] sm:order-2 sm:ml-8 sm:text-right">
                                    {" "}
                                    x{product.price} Sats
                                  </p>

                                  <div className="sm:order-1">
                                    <div className="mx-auto flex h-8 items-stretch text-gray-600">
                                      <button
                                        className="flex items-center justify-center rounded-l-md bg-gray-200 text-2xl text-[rgb(25,108,233)] px-4 transition hover:bg-[rgb(25,108,233)] hover:text-white"
                                        onClick={() => removeFromCart(product)}
                                      >
                                        -
                                      </button>
                                      <div className="flex w-full items-center justify-center bg-gray-100 px-4 text-md text-[rgb(25,108,233)] uppercase transition">
                                        {getProductQuantity(product.id)}
                                      </div>
                                      <button
                                        className="flex items-center justify-center rounded-r-md bg-gray-200 text-2xl px-4 text-md text-[rgb(25,108,233)] transition hover:bg-[rgb(25,108,233)] hover:text-white"
                                        onClick={() => addToCart(product)}
                                      >
                                        +
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              <div className="absolute top-0 right-0 flex sm:bottom-0 sm:top-auto"></div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <br></br>
                    <br></br>
                    <hr className="border-[rgb(25,108,233)]"></hr>
                    <br></br>
                    <h1 className="text-2xl text-center font-semibold text-[rgb(25,108,233)]">
                      Order Summary
                    </h1>

                    <div className="mt-8">
                      {Object.entries(cart).map(([productId, quantity]) => {
                        const product = products.find(
                          (p) => p.id.toString() === productId,
                        );
                        const subtotal = product.price * quantity;

                        if (quantity > 0) {
                          return (
                            <div
                              key={productId}
                              className="flex justify-between items-center mb-4"
                            >
                              <div className="flex items-center">
                                <img
                                  className="h-12 w-12 mr-4"
                                  src={product.image}
                                  alt={product.name}
                                />
                                <div>
                                  <p className="text-lg font-semibold text-[rgb(25,108,233)]">
                                    {product.name}
                                  </p>
                                  <p className="text-[rgb(25,108,233)]">
                                    {quantity} x {product.price} Sats
                                  </p>
                                </div>
                              </div>
                              <p className="text-[rgb(25,108,233)] font-bold">
                                {subtotal} Sats
                              </p>
                            </div>
                          );
                        }

                        return null;
                      })}

                      {Object.keys(cart).length === 0 && (
                        <p className="text-[rgb(25,108,233)] mt-4 text-center">
                          Your card is Empty. Please add some products
                        </p>
                      )}
                    </div>
                    <br></br>

                    <hr className="border-[rgb(25,108,233)]"></hr>
                    <br></br>
                    <div className="flex justify-between items-center mb-4">
                      <p className="text-xl text-[rgb(25,108,233)] font-bold">
                        Total
                      </p>
                      <p className="text-xl text-[rgb(25,108,233)] font-bold">
                        <span className="text-lg font-normal text-[rgb(25,108,233)]">
                          {calculateTotal()}
                        </span>{" "}
                        Sats
                      </p>
                    </div>

                    <br></br>
                    <div className="mt-6 text-center">
                      <button
                        onClick={handleCheckout}
                        type="button"
                        className="group inline-flex w-full items-center justify-center rounded-md bg-[rgb(25,108,233)] px-6 py-4 text-lg font-semibold text-white transition-all duration-200 ease-in-out focus:shadow hover:bg-gray-800"
                      >
                        Pay with Bitcoin Connect!
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="group-hover:ml-8 ml-4 h-6 w-6 transition-all"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M13 7l5 5m0 0l-5 5m5-5H6"
                          />
                        </svg>
                      </button>
                    </div>

                    <div className="mt-6 text-center"></div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
      <hr className="my-8" />
      <br></br>
      <br></br>
    </main>
  );
}
