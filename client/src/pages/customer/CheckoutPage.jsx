import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, ShieldCheck, CreditCard, CheckCircle2, ArrowRight, Plus } from 'lucide-react';
import { useCart } from '../../context/CartContext.jsx';
import { api } from '../../services/api.js';
import { useToast } from '../../context/ToastContext.jsx';

export const CheckoutPage = () => {
  const { cart, fetchCart } = useCart();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [submittingOrder, setSubmittingOrder] = useState(false);
  const [completedOrder, setCompletedOrder] = useState(null);

  const [newAddress, setNewAddress] = useState({
    full_name: '',
    phone: '',
    address_line: '',
    city: '',
    state: '',
    pincode: '',
    landmark: ''
  });

  useEffect(() => {
    api.get('/orders/addresses').then((res) => {
      if (res.success && res.addresses) {
        setAddresses(res.addresses);
        if (res.addresses.length > 0) {
          const defaultAddr = res.addresses.find((a) => a.is_default) || res.addresses[0];
          setSelectedAddressId(defaultAddr.id);
        } else {
          setShowNewAddressForm(true);
        }
      }
    });
  }, []);

  const handlePlaceOrder = async () => {
    setSubmittingOrder(true);
    try {
      const payload = {
        payment_method: paymentMethod
      };

      if (showNewAddressForm) {
        payload.new_address = newAddress;
      } else {
        payload.address_id = selectedAddressId;
      }

      const res = await api.post('/orders', payload);
      if (res.success) {
        setCompletedOrder({ id: res.orderId, total: cart.total });
        fetchCart();
        setStep(4); // Confirmation step
        addToast('Order placed successfully!', 'success');
      }
    } catch (err) {
      addToast(err.message || 'Failed to place order.', 'error');
    } finally {
      setSubmittingOrder(false);
    }
  };

  if (step === 4 && completedOrder) {
    return (
      <div className="container" style={{ padding: '5rem 0', maxWidth: 600, textAlign: 'center' }}>
        <div className="card" style={{ padding: '3rem' }}>
          <div style={{ width: 80, height: 80, borderRadius: '50%', background: '#dcfce7', color: '#15803d', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
            <CheckCircle2 size={48} />
          </div>
          <h1 style={{ fontSize: '2.2rem', color: 'var(--primary-deep)', marginBottom: '0.5rem' }}>Order Confirmed!</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', marginBottom: '1.5rem' }}>
            Your Order <strong>#{completedOrder.id}</strong> of <strong>₹{completedOrder.total}</strong> has been transmitted directly to local farmers.
          </p>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <button onClick={() => navigate('/customer/orders')} className="btn btn-primary btn-lg">
              Track Order Status
            </button>
            <button onClick={() => navigate('/shop')} className="btn btn-outline btn-lg">
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '3rem 0 5rem 0' }}>
      <div className="container">
        {/* CHECKOUT STEPS HEADER */}
        <div className="checkout-steps-bar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', opacity: step >= 1 ? 1 : 0.4 }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: step >= 1 ? 'var(--primary)' : 'var(--border-color)', color: '#fff', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>1</div>
            <span style={{ fontWeight: 700, color: 'var(--primary-deep)', fontSize: '0.95rem', whiteSpace: 'nowrap' }}>1. Delivery Address</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', opacity: step >= 2 ? 1 : 0.4 }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: step >= 2 ? 'var(--primary)' : 'var(--border-color)', color: '#fff', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>2</div>
            <span style={{ fontWeight: 700, color: 'var(--primary-deep)', fontSize: '0.95rem', whiteSpace: 'nowrap' }}>2. Order Summary</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', opacity: step >= 3 ? 1 : 0.4 }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: step >= 3 ? 'var(--primary)' : 'var(--border-color)', color: '#fff', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>3</div>
            <span style={{ fontWeight: 700, color: 'var(--primary-deep)', fontSize: '0.95rem', whiteSpace: 'nowrap' }}>3. Payment Method</span>
          </div>
        </div>

        <div className="checkout-layout">
          {/* LEFT STEP CONTENT */}
          <div>
            {/* STEP 1: ADDRESS */}
            {step === 1 && (
              <div className="card" style={{ padding: '2rem' }}>
                <h3 style={{ fontSize: '1.3rem', color: 'var(--primary-deep)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', wordBreak: 'break-word' }}>
                  <MapPin size={20} /> Select Delivery Address
                </h3>

                {addresses.length > 0 && !showNewAddressForm && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
                    {addresses.map((addr) => (
                      <div
                        key={addr.id}
                        onClick={() => setSelectedAddressId(addr.id)}
                        style={{
                          padding: '1.25rem',
                          borderRadius: 'var(--radius-md)',
                          border: selectedAddressId === addr.id ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                          background: selectedAddressId === addr.id ? 'var(--bg-main)' : '#ffffff',
                          cursor: 'pointer',
                          wordBreak: 'break-word',
                          overflowWrap: 'anywhere'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                          <strong style={{ color: 'var(--primary-deep)', wordBreak: 'break-word' }}>{addr.full_name} ({addr.phone})</strong>
                          {addr.is_default === 1 && <span className="badge badge-verified">Default</span>}
                        </div>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0, wordBreak: 'break-word' }}>
                          {addr.address_line}, {addr.city}, {addr.state} - {addr.pincode}
                        </p>
                      </div>
                    ))}

                    <button onClick={() => setShowNewAddressForm(true)} className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Plus size={16} /> Add New Shipping Address
                    </button>
                  </div>
                )}

                {/* NEW ADDRESS FORM */}
                {(showNewAddressForm || addresses.length === 0) && (
                  <div style={{ background: 'var(--bg-main)', padding: '1.5rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem' }}>
                    <h4 style={{ fontSize: '1rem', color: 'var(--primary-deep)', marginBottom: '1rem' }}>Add Delivery Address</h4>

                    <div className="form-row-2">
                      <div className="form-group">
                        <label className="form-label">Recipient Name *</label>
                        <input type="text" className="form-input" required value={newAddress.full_name} onChange={(e) => setNewAddress({ ...newAddress, full_name: e.target.value })} />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Mobile Phone *</label>
                        <input type="tel" className="form-input" required value={newAddress.phone} onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })} />
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Flat / House / Street Address *</label>
                      <input type="text" className="form-input" required value={newAddress.address_line} onChange={(e) => setNewAddress({ ...newAddress, address_line: e.target.value })} />
                    </div>

                    <div className="form-row-3">
                      <div className="form-group">
                        <label className="form-label">City *</label>
                        <input type="text" className="form-input" required value={newAddress.city} onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })} />
                      </div>
                      <div className="form-group">
                        <label className="form-label">State *</label>
                        <input type="text" className="form-input" required value={newAddress.state} onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })} />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Pincode *</label>
                        <input type="text" className="form-input" required value={newAddress.pincode} onChange={(e) => setNewAddress({ ...newAddress, pincode: e.target.value })} />
                      </div>
                    </div>

                    {addresses.length > 0 && (
                      <button onClick={() => setShowNewAddressForm(false)} className="btn btn-outline btn-sm">
                        Use Saved Address
                      </button>
                    )}
                  </div>
                )}

                <button onClick={() => setStep(2)} className="btn btn-primary btn-lg btn-block">
                  Continue to Order Review <ArrowRight size={20} />
                </button>
              </div>
            )}

            {/* STEP 2: SUMMARY */}
            {step === 2 && (
              <div className="card" style={{ padding: '2rem' }}>
                <h3 style={{ fontSize: '1.3rem', color: 'var(--primary-deep)', marginBottom: '1.5rem', wordBreak: 'break-word' }}>Review Farm Produce Order</h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
                  {cart.items.map((item) => (
                    <div key={item.cart_item_id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg-main)', padding: '1rem', borderRadius: 'var(--radius-md)', gap: '1rem', flexWrap: 'wrap' }}>
                      <div style={{ minWidth: 0, flex: 1, wordBreak: 'break-word' }}>
                        <h4 style={{ fontSize: '1rem', color: 'var(--primary-deep)', margin: 0, wordBreak: 'break-word' }}>{item.product_name}</h4>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0, wordBreak: 'break-word' }}>Producer: {item.farm_name || item.farmer_name} | Qty: {item.quantity}</p>
                      </div>
                      <span style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--primary-deep)', whiteSpace: 'nowrap' }}>₹{item.price * item.quantity}</span>
                    </div>
                  ))}
                </div>

                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                  <button onClick={() => setStep(1)} className="btn btn-outline">
                    Back to Address
                  </button>
                  <button onClick={() => setStep(3)} className="btn btn-primary" style={{ flex: 1 }}>
                    Proceed to Payment Options <ArrowRight size={20} />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: PAYMENT */}
            {step === 3 && (
              <div className="card" style={{ padding: '2rem' }}>
                <h3 style={{ fontSize: '1.3rem', color: 'var(--primary-deep)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', wordBreak: 'break-word' }}>
                  <CreditCard size={20} /> Payment Gateway (Direct Farmer Payment)
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '1rem',
                      padding: '1.25rem',
                      border: paymentMethod === 'COD' ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-md)',
                      cursor: 'pointer',
                      background: paymentMethod === 'COD' ? 'var(--bg-main)' : '#ffffff'
                    }}
                  >
                    <input type="radio" name="payment" checked={paymentMethod === 'COD'} onChange={() => setPaymentMethod('COD')} style={{ marginTop: 4 }} />
                    <div style={{ minWidth: 0, flex: 1, wordBreak: 'break-word', overflowWrap: 'anywhere' }}>
                      <strong style={{ display: 'block', color: 'var(--primary-deep)', fontSize: '1rem', marginBottom: 2 }}>Cash on Delivery (Pay at Farm Delivery)</strong>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.4, display: 'block' }}>Pay cash to logistics driver upon receiving fresh produce.</span>
                    </div>
                  </label>

                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '1rem',
                      padding: '1.25rem',
                      border: paymentMethod === 'UPI' ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-md)',
                      cursor: 'pointer',
                      background: paymentMethod === 'UPI' ? 'var(--bg-main)' : '#ffffff'
                    }}
                  >
                    <input type="radio" name="payment" checked={paymentMethod === 'UPI'} onChange={() => setPaymentMethod('UPI')} style={{ marginTop: 4 }} />
                    <div style={{ minWidth: 0, flex: 1, wordBreak: 'break-word', overflowWrap: 'anywhere' }}>
                      <strong style={{ display: 'block', color: 'var(--primary-deep)', fontSize: '1rem', marginBottom: 2 }}>Direct Farmer Instant UPI Payment</strong>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.4, display: 'block' }}>Instant zero-fee direct payout to farmer's UPI account.</span>
                    </div>
                  </label>
                </div>

                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                  <button onClick={() => setStep(2)} className="btn btn-outline">
                    Back to Summary
                  </button>
                  <button onClick={handlePlaceOrder} disabled={submittingOrder} className="btn btn-accent btn-lg" style={{ flex: 1 }}>
                    {submittingOrder ? 'Processing Direct Order...' : `Confirm & Pay ₹${cart.total}`}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT CHECKOUT SUMMARY BOX */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <h4 style={{ fontSize: '1.1rem', color: 'var(--primary-deep)', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
              Checkout Summary
            </h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.9rem', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Subtotal ({cart.items.length} items)</span>
                <strong>₹{cart.subtotal}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Shipping Fee</span>
                <strong>{cart.shipping_fee === 0 ? 'FREE' : `₹${cart.shipping_fee}`}</strong>
              </div>
              <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.2rem' }}>
                <span style={{ fontWeight: 800, color: 'var(--primary-deep)' }}>Total Amount</span>
                <strong style={{ color: 'var(--primary-deep)' }}>₹{cart.total}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
