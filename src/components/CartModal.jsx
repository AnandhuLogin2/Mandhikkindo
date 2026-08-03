import { useState, useMemo } from "react";
import { useApp } from "../context/AppContext";
import "./CartModal.css";

function OrderConfetti() {
  const colors = ["#F59E0B", "#FFB703", "#F97316", "#D97706", "#22C55E"];
  const pieces = useMemo(
    () =>
      Array.from({ length: 30 }, (_, i) => ({
        left: Math.random() * 100,
        bg: colors[i % colors.length],
        delay: Math.random() * 0.5,
        round: Math.random() > 0.5,
      })),
    []
  );
  return (
    <div className="confetti" aria-hidden="true">
      {pieces.map((p, i) => (
        <span
          key={i}
          style={{
            left: `${p.left}%`,
            background: p.bg,
            animationDelay: `${p.delay}s`,
            borderRadius: p.round ? "50%" : "2px",
          }}
        />
      ))}
    </div>
  );
}

export default function CartModal() {
  const {
    cartOpen, setCartOpen,
    cart, updateCartQty, removeFromCart, clearCart,
    showToast, playSizzle,
  } = useApp();

  const [orderType, setOrderType] = useState("pickup"); // pickup | delivery
  const [pickupTime, setPickupTime] = useState("25 mins");
  const [coupon, setCoupon] = useState("");
  const [discountPct, setDiscountPct] = useState(0);
  const [specialNotes, setSpecialNotes] = useState("");
  const [orderComplete, setOrderComplete] = useState(null);

  if (!cartOpen) return null;

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const discount = Math.round((subtotal * discountPct) / 100);
  const packingFee = cart.length > 0 ? 25 : 0;
  const total = Math.max(0, subtotal - discount + packingFee);

  const applyCoupon = (e) => {
    e.preventDefault();
    if (coupon.trim().toUpperCase() === "MANDHI10") {
      setDiscountPct(10);
      showToast("Coupon MANDHI10 applied! 10% discount added 🎉");
    } else {
      showToast("Invalid coupon code. Try MANDHI10!");
    }
  };

  const handleCheckout = () => {
    playSizzle();
    const orderId = `MK-${Math.floor(100000 + Math.random() * 900000)}`;
    const shopName = cart[0]?.shopName || "Mandhi Pit";
    
    setOrderComplete({
      id: orderId,
      shopName,
      items: [...cart],
      total,
      type: orderType,
      time: pickupTime,
    });

    clearCart();
    showToast(`Order ${orderId} confirmed! Check receipt.`);
  };

  return (
    <div className="cart-modal-overlay" onClick={() => setCartOpen(false)}>
      <div className="cart-modal glass" onClick={(e) => e.stopPropagation()}>
        {/* Cart Header */}
        <div className="cart-header">
          <h3>🛒 Takeaway & Pre-Order Cart</h3>
          <button className="icon-btn" onClick={() => setCartOpen(false)}>✕</button>
        </div>

        {orderComplete ? (
          <div className="order-success-screen">
            <OrderConfetti />
            <div className="success-icon">🎉</div>
            <h2>Order Placed Successfully!</h2>
            <p className="order-id-badge">Order ID: #{orderComplete.id}</p>
            <div className="order-summary-box glass glass-tight">
              <h4>{orderComplete.shopName}</h4>
              <p>📍 {orderComplete.type === "pickup" ? "Self Pickup" : "Express Delivery"} · Ready in ~{orderComplete.time}</p>
              <div className="order-receipt-items">
                {orderComplete.items.map((it) => (
                  <div key={it.id} className="receipt-item">
                    <span>{it.qty}x {it.name}</span>
                    <span>₹{it.price * it.qty}</span>
                  </div>
                ))}
              </div>
              <div className="receipt-total-row">
                <span>Total Paid</span>
                <span className="receipt-total">₹{orderComplete.total}</span>
              </div>
            </div>
            <p className="success-note">Show this order ID at the restaurant counter for instant pickup.</p>
            <button
              className="btn btn-primary"
              onClick={() => {
                setOrderComplete(null);
                setCartOpen(false);
              }}
            >
              Done / Back to Exploring 🍗
            </button>
          </div>
        ) : cart.length === 0 ? (
          <div className="cart-empty-state">
            <span className="empty-cart-icon">🍱</span>
            <h3>Your Mandhi Cart is Empty</h3>
            <p>Explore shops, view menus and add your favourite Mandhi dishes & sides!</p>
            <button className="btn btn-primary" onClick={() => setCartOpen(false)}>
              Browse Shops Now
            </button>
          </div>
        ) : (
          <div className="cart-body">
            {/* Cart Items List */}
            <div className="cart-items-list">
              {cart.map((item) => (
                <div key={item.id} className="cart-item glass glass-tight">
                  <div className="cart-item-info">
                    <span className="cart-shop-name">{item.shopName}</span>
                    <h4 className="cart-item-title">{item.name}</h4>
                    <span className="cart-item-unit-price">₹{item.price} each</span>
                  </div>
                  <div className="cart-item-actions">
                    <div className="qty-controls">
                      <button onClick={() => updateCartQty(item.id, -1)}>-</button>
                      <span>{item.qty}</span>
                      <button onClick={() => updateCartQty(item.id, 1)}>+</button>
                    </div>
                    <span className="cart-item-total">₹{item.price * item.qty}</span>
                    <button className="cart-remove-btn" onClick={() => removeFromCart(item.id)}>✕</button>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Settings */}
            <div className="cart-options-panel glass glass-tight">
              <div className="order-type-tabs">
                <button
                  className={`type-btn ${orderType === "pickup" ? "active" : ""}`}
                  onClick={() => setOrderType("pickup")}
                >
                  🚶‍♂️ Self Pickup
                </button>
                <button
                  className={`type-btn ${orderType === "delivery" ? "active" : ""}`}
                  onClick={() => setOrderType("delivery")}
                >
                  🛵 Local Delivery
                </button>
              </div>

              <div className="cart-field-row">
                <label>Estimated Pickup/Delivery Time:
                  <select value={pickupTime} onChange={(e) => setPickupTime(e.target.value)}>
                    <option value="15-20 mins">ASAP (15-20 mins)</option>
                    <option value="30 mins">In 30 mins</option>
                    <option value="45 mins">In 45 mins</option>
                    <option value="Evening (7:30 PM)">Dinner Time (7:30 PM)</option>
                  </select>
                </label>
              </div>

              <form className="coupon-form" onSubmit={applyCoupon}>
                <input
                  type="text"
                  placeholder="Promo coupon (e.g. MANDHI10)"
                  value={coupon}
                  onChange={(e) => setCoupon(e.target.value)}
                />
                <button type="submit" className="btn btn-ghost small">Apply</button>
              </form>

              <input
                type="text"
                className="notes-input"
                placeholder="Special notes (e.g. Extra spicy sahawiq, separate rice)"
                value={specialNotes}
                onChange={(e) => setSpecialNotes(e.target.value)}
              />
            </div>

            {/* Bill Summary */}
            <div className="cart-bill-summary">
              <div className="bill-row">
                <span>Subtotal</span>
                <span>₹{subtotal}</span>
              </div>
              <div className="bill-row">
                <span>Packing & Counter Fee</span>
                <span>₹{packingFee}</span>
              </div>
              {discount > 0 && (
                <div className="bill-row discount">
                  <span>Coupon Discount (10%)</span>
                  <span>-₹{discount}</span>
                </div>
              )}
              <div className="bill-row total">
                <span>Total Amount</span>
                <span>₹{total}</span>
              </div>
            </div>

            <button className="btn btn-primary checkout-btn" onClick={handleCheckout}>
              Confirm Takeaway Order (₹{total}) 🍗
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
