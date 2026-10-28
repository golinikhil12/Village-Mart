import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { buildStoreLayout, SECTIONS, buildProductOnShelf, SECTION_PRODUCT_SLOTS } from './SupermarketScene.js';
import { PlayerController } from './PlayerController.js';
import { CharacterModel } from './CharacterModel.js';
import { ProductInteraction, getSectionForProduct } from './ProductInteraction.js';
import { useCart } from '../../context/CartContext.jsx';
import { api } from '../../services/api.js';

// ─── LOADING SCREEN ───────────────────────────────────────────────
function LoadingScreen({ progress, message }) {
  return (
    <div style={{
      position:'absolute',inset:0,
      background:'linear-gradient(135deg,#1a5c2a 0%,#2e7d32 50%,#1b5e20 100%)',
      display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',
      zIndex:100,color:'white',fontFamily:"'Inter',sans-serif"
    }}>
      <div style={{fontSize:'4rem',marginBottom:'1rem'}}>🏪</div>
      <h1 style={{fontSize:'2.5rem',fontWeight:800,margin:'0 0 0.5rem 0',
        background:'linear-gradient(to right,#a5d6a7,#ffffff)',
        WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'
      }}>VILLAGE MART</h1>
      <p style={{fontSize:'1.1rem',color:'#a5d6a7',margin:'0 0 2rem 0'}}>Virtual Supermarket Experience</p>
      <div style={{width:'280px',background:'rgba(255,255,255,0.15)',borderRadius:'999px',height:'8px',overflow:'hidden'}}>
        <div style={{
          height:'100%',width:`${progress}%`,
          background:'linear-gradient(to right,#a5d6a7,#4caf50)',
          borderRadius:'999px',transition:'width 0.3s ease'
        }}/>
      </div>
      <p style={{fontSize:'0.85rem',color:'#81c784',marginTop:'1rem'}}>{message}</p>
    </div>
  );
}

// ─── WELCOME SCREEN ───────────────────────────────────────────────
function WelcomeScreen({ onEnter }) {
  return (
    <div style={{
      position:'absolute',inset:0,
      background:'linear-gradient(160deg,#0f2d13 0%,#1a5c2a 40%,#2e7d32 70%,#1b5e20 100%)',
      display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',
      zIndex:100,color:'white',fontFamily:"'Inter',sans-serif",
      padding:'2rem',textAlign:'center',overflow:'hidden'
    }}>
      <div style={{position:'relative',zIndex:1,maxWidth:560}}>
        <div style={{fontSize:'5rem',marginBottom:'1rem',filter:'drop-shadow(0 4px 12px rgba(0,0,0,0.5))'}}>🏪</div>
        <h1 style={{
          fontSize:'clamp(2rem,5vw,3.5rem)',fontWeight:900,margin:'0 0 0.5rem 0',
          background:'linear-gradient(to right,#a5d6a7,#ffffff,#c8e6c9)',
          WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',
          letterSpacing:'-0.02em'
        }}>VILLAGE MART</h1>
        <p style={{fontSize:'1.25rem',color:'#a5d6a7',margin:'0 0 0.75rem 0',fontWeight:500}}>
          Virtual 3D Supermarket
        </p>
        <p style={{fontSize:'0.95rem',color:'#81c784',margin:'0 0 2rem 0',lineHeight:1.6}}>
          Walk through our store, pick up real products from shelves, and checkout using the billing computer!
        </p>

        <div style={{display:'flex',gap:'0.6rem',flexWrap:'wrap',justifyContent:'center',marginBottom:'2rem'}}>
          {['🥦 Fresh Vegetables','🍎 Seasonal Fruits','🥛 Dairy & Eggs','🌾 Grains & Pulses'].map(tag=>(
            <span key={tag} style={{
              background:'rgba(255,255,255,0.12)',borderRadius:'999px',
              padding:'0.3rem 0.8rem',fontSize:'0.8rem',border:'1px solid rgba(255,255,255,0.2)'
            }}>{tag}</span>
          ))}
        </div>

        <button
          id="enter-store-btn"
          onClick={onEnter}
          style={{
            padding:'1rem 3rem',fontSize:'1.2rem',fontWeight:700,
            background:'linear-gradient(135deg,#4caf50,#2e7d32)',
            color:'white',border:'none',borderRadius:'999px',
            cursor:'pointer',boxShadow:'0 8px 32px rgba(76,175,80,0.45)',
            transition:'all 0.2s'
          }}
          onMouseEnter={e=>{e.target.style.transform='translateY(-3px)';e.target.style.boxShadow='0 12px 40px rgba(76,175,80,0.55)';}}
          onMouseLeave={e=>{e.target.style.transform='none';e.target.style.boxShadow='0 8px 32px rgba(76,175,80,0.45)';}}
        >
          🚶 Enter the Store
        </button>

        <div style={{marginTop:'2rem',display:'flex',gap:'2rem',justifyContent:'center',flexWrap:'wrap'}}>
          {[
            {icon:'⌨️',label:'W/A/S/D or Arrows to move'},
            {icon:'🖱️',label:'Click canvas + mouse to look'},
            {icon:'E',label:'Pick up product',mono:true},
            {icon:'🖥️',label:'Billing Computer to checkout',mono:false},
          ].map(({icon,label,mono})=>(
            <div key={label} style={{textAlign:'center',color:'#a5d6a7',fontSize:'0.78rem'}}>
              <div style={{
                fontSize:mono?'1rem':'1.4rem',
                background:'rgba(255,255,255,0.12)',borderRadius:8,
                padding:mono?'0.3rem 0.7rem':'0.4rem 0.6rem',
                marginBottom:'0.3rem',fontFamily:mono?'monospace':'inherit',
                fontWeight:mono?800:'normal'
              }}>{icon}</div>
              {label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── PRODUCT INFO CARD ────────────────────────────────────────────
function ProductCard({ product, onAddToCart, onClose }) {
  if (!product) return null;
  const p = product.product;
  const inStock = p?.quantity > 0;

  return (
    <div
      style={{
        position:'fixed',bottom:'140px',left:'50%',transform:'translateX(-50%)',
        background:'rgba(255,255,255,0.98)',borderRadius:20,
        padding:'1.25rem',maxWidth:360,width:'90%',
        boxShadow:'0 20px 60px rgba(0,0,0,0.3)',
        backdropFilter:'blur(16px)',zIndex:60,
        border:'1px solid rgba(76,175,80,0.3)',
        fontFamily:"'Inter',sans-serif",
        animation:'slideUp 0.2s ease'
      }}
      onClick={e => e.stopPropagation()}
    >
      <div style={{display:'flex',gap:'1rem',alignItems:'flex-start'}}>
        <img
          src={p?.primary_image || 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=300&auto=format&fit=crop&q=60'}
          alt={p?.name}
          style={{width:88,height:88,borderRadius:12,objectFit:'cover',flexShrink:0,border:'2px solid #e8f5e9'}}
          onError={e=>{e.target.src='https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=300&auto=format&fit=crop&q=60';}}
        />
        <div style={{flex:1,minWidth:0}}>
          <h3 style={{fontSize:'1.05rem',fontWeight:800,color:'#1a5c2a',margin:'0 0 0.3rem 0',lineHeight:1.25}}>
            {p?.name || 'Product'}
          </h3>
          <p style={{fontSize:'0.75rem',color:'#666',margin:'0 0 0.5rem 0',lineHeight:1.4}}>
            {(p?.description || '').substring(0,90)}{(p?.description||'').length>90?'…':''}
          </p>
          <div style={{display:'flex',alignItems:'center',gap:'0.5rem',flexWrap:'wrap'}}>
            <span style={{fontSize:'1.3rem',fontWeight:800,color:'#1a5c2a'}}>₹{p?.price}</span>
            <span style={{fontSize:'0.75rem',color:'#888'}}>/{p?.unit}</span>
            {p?.organic===1&&<span style={{fontSize:'0.65rem',background:'#e8f5e9',color:'#2e7d32',padding:'0.15rem 0.5rem',borderRadius:999,fontWeight:700}}>🌿 Organic</span>}
          </div>
        </div>
        <button onClick={onClose} style={{background:'#f5f5f5',border:'none',cursor:'pointer',color:'#666',fontSize:'1rem',padding:'0.3rem 0.5rem',borderRadius:8,flexShrink:0}}>✕</button>
      </div>

      {p?.farmer_name && (
        <div style={{display:'flex',alignItems:'center',gap:'0.6rem',margin:'0.75rem 0',padding:'0.5rem 0.75rem',background:'#f1f8e9',borderRadius:10}}>
          <span style={{fontSize:'1.3rem'}}>👨‍🌾</span>
          <div>
            <p style={{fontSize:'0.75rem',color:'#388e3c',fontWeight:700,margin:0}}>{p.farm_name||p.farmer_name}</p>
            <p style={{fontSize:'0.68rem',color:'#666',margin:0}}>{p.farmer_location||p.location||''}</p>
          </div>
        </div>
      )}

      <div style={{display:'flex',gap:'0.5rem',marginTop:'0.5rem'}}>
        {inStock ? (
          <button
            id="add-to-basket-btn"
            onClick={()=>onAddToCart(p)}
            style={{
              flex:1,padding:'0.75rem 1rem',background:'linear-gradient(135deg,#4caf50,#2e7d32)',
              color:'white',border:'none',borderRadius:12,fontWeight:700,
              cursor:'pointer',fontSize:'0.95rem',transition:'transform 0.15s'
            }}
            onMouseDown={e=>e.currentTarget.style.transform='scale(0.97)'}
            onMouseUp={e=>e.currentTarget.style.transform='scale(1)'}
          >
            🧺 Add to Basket
          </button>
        ) : (
          <div style={{flex:1,padding:'0.75rem',background:'#fee2e2',borderRadius:12,textAlign:'center',color:'#dc2626',fontWeight:700}}>
            Out of Stock
          </div>
        )}
      </div>
      <p style={{textAlign:'center',fontSize:'0.7rem',color:'#aaa',margin:'0.5rem 0 0'}}>
        Press <kbd style={{background:'#e8f5e9',padding:'1px 6px',borderRadius:4,color:'#2e7d32',fontWeight:700}}>E</kbd> to add · Walk to checkout to pay
      </p>
    </div>
  );
}

// ─── BILLING MODAL ────────────────────────────────────────────────
function BillingModal({ cart, cartCount, onClose, onCheckout }) {
  const [addressForm, setAddressForm] = useState({
    name: '', phone: '', address: '', city: '', state: '', pincode: ''
  });
  const [step, setStep] = useState(1); // 1=details, 2=confirm

  const handleSubmit = () => {
    if (!addressForm.name || !addressForm.phone || !addressForm.address || !addressForm.pincode) {
      alert('Please fill all required fields');
      return;
    }
    setStep(2);
  };

  const subtotal = cart?.subtotal || 0;
  const shipping = cart?.shipping_fee || 0;
  const total = cart?.total || subtotal + shipping;

  return (
    <div style={{
      position:'fixed',inset:0,background:'rgba(0,0,0,0.75)',backdropFilter:'blur(8px)',
      zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center',padding:'1rem'
    }}
      onClick={e=>{ if(e.target===e.currentTarget) onClose(); }}
    >
      <div style={{
        width:'min(580px,96vw)',maxHeight:'90vh',overflowY:'auto',
        background:'#fff',borderRadius:24,
        boxShadow:'0 40px 80px rgba(0,0,0,0.4)',
        fontFamily:"'Inter',sans-serif",overflow:'hidden'
      }}>
        {/* Header */}
        <div style={{
          background:'linear-gradient(135deg,#1a5c2a,#2e7d32)',
          padding:'1.5rem',color:'white',
          display:'flex',alignItems:'center',justifyContent:'space-between'
        }}>
          <div>
            <div style={{display:'flex',alignItems:'center',gap:'0.75rem'}}>
              <span style={{fontSize:'2rem'}}>🖥️</span>
              <div>
                <h2 style={{margin:0,fontSize:'1.3rem',fontWeight:800,color:'white'}}>Billing Counter</h2>
                <p style={{margin:0,fontSize:'0.8rem',color:'#a5d6a7'}}>Village Mart Virtual Checkout</p>
              </div>
            </div>
          </div>
          <button onClick={onClose} style={{background:'rgba(255,255,255,0.2)',border:'none',color:'white',borderRadius:10,padding:'0.4rem 0.8rem',cursor:'pointer',fontSize:'1.1rem'}}>✕</button>
        </div>

        {/* Step indicator */}
        <div style={{display:'flex',background:'#f8f9fa',borderBottom:'1px solid #e5e7eb'}}>
          {['📋 Delivery Details','✅ Confirm & Pay'].map((label,i)=>(
            <div key={i} style={{
              flex:1,padding:'0.75rem',textAlign:'center',fontSize:'0.82rem',fontWeight:700,
              color: step===i+1 ? '#1a5c2a' : '#999',
              borderBottom: step===i+1 ? '3px solid #2e7d32' : '3px solid transparent',
              transition:'all 0.2s'
            }}>{label}</div>
          ))}
        </div>

        <div style={{padding:'1.5rem',overflowY:'auto',maxHeight:'60vh'}}>
          {step === 1 ? (
            <>
              {/* Cart summary */}
              <div style={{background:'#f8fdf8',borderRadius:12,padding:'1rem',marginBottom:'1.25rem',border:'1px solid #e8f5e9'}}>
                <h3 style={{margin:'0 0 0.75rem',fontSize:'0.9rem',color:'#1a5c2a',fontWeight:700}}>
                  🧺 Your Basket ({cartCount} items)
                </h3>
                {cart?.items?.map(item=>(
                  <div key={item.cart_item_id||item.product_id} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'0.4rem 0',borderBottom:'1px solid #e8f5e9'}}>
                    <div style={{display:'flex',alignItems:'center',gap:'0.5rem'}}>
                      <img src={item.primary_image||''} alt="" style={{width:32,height:32,borderRadius:6,objectFit:'cover'}} onError={e=>e.target.style.display='none'}/>
                      <div>
                        <div style={{fontSize:'0.82rem',fontWeight:600,color:'#1a5c2a'}}>{item.product_name}</div>
                        <div style={{fontSize:'0.72rem',color:'#666'}}>Qty: {item.quantity} × ₹{item.price}</div>
                      </div>
                    </div>
                    <span style={{fontWeight:700,color:'#1a5c2a',fontSize:'0.9rem'}}>₹{(item.price*item.quantity).toFixed(0)}</span>
                  </div>
                ))}
                {(!cart?.items||cart.items.length===0)&&(
                  <p style={{textAlign:'center',color:'#999',fontSize:'0.85rem',margin:'0.5rem 0'}}>No items in basket yet</p>
                )}
              </div>

              {/* Delivery form */}
              <h3 style={{margin:'0 0 1rem',fontSize:'1rem',color:'#1a5c2a',fontWeight:800}}>📍 Delivery Address</h3>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'0.75rem'}}>
                {[
                  {key:'name',label:'Full Name *',placeholder:'Your full name',full:false},
                  {key:'phone',label:'Phone *',placeholder:'+91 XXXXXXXXXX',full:false},
                  {key:'address',label:'Address *',placeholder:'House / Street / Area',full:true},
                  {key:'city',label:'City *',placeholder:'City',full:false},
                  {key:'state',label:'State',placeholder:'State',full:false},
                  {key:'pincode',label:'PIN Code *',placeholder:'6-digit PIN',full:false},
                ].map(({key,label,placeholder,full})=>(
                  <div key={key} style={{gridColumn:full?'1/-1':'auto'}}>
                    <label style={{display:'block',fontSize:'0.78rem',fontWeight:700,color:'#444',marginBottom:'0.3rem'}}>{label}</label>
                    <input
                      type="text"
                      value={addressForm[key]}
                      onChange={e=>setAddressForm(p=>({...p,[key]:e.target.value}))}
                      placeholder={placeholder}
                      style={{
                        width:'100%',height:40,padding:'0.5rem 0.75rem',
                        borderRadius:10,border:'1.5px solid #d1d5db',
                        fontSize:'0.88rem',outline:'none',
                        transition:'border-color 0.2s',boxSizing:'border-box'
                      }}
                      onFocus={e=>e.target.style.borderColor='#2e7d32'}
                      onBlur={e=>e.target.style.borderColor='#d1d5db'}
                    />
                  </div>
                ))}
              </div>

              <div style={{marginTop:'1.25rem',background:'#f8fdf8',borderRadius:12,padding:'1rem',border:'1px solid #e8f5e9'}}>
                <div style={{display:'flex',justifyContent:'space-between',marginBottom:'0.4rem',fontSize:'0.88rem'}}>
                  <span style={{color:'#666'}}>Subtotal</span>
                  <span style={{fontWeight:700}}>₹{subtotal}</span>
                </div>
                <div style={{display:'flex',justifyContent:'space-between',marginBottom:'0.4rem',fontSize:'0.88rem'}}>
                  <span style={{color:'#666'}}>Delivery</span>
                  <span style={{fontWeight:700,color: shipping===0?'#2e7d32':'inherit'}}>{shipping===0?'FREE':`₹${shipping}`}</span>
                </div>
                <div style={{display:'flex',justifyContent:'space-between',paddingTop:'0.5rem',borderTop:'1px solid #e8f5e9',fontSize:'1rem'}}>
                  <span style={{fontWeight:800,color:'#1a5c2a'}}>Total</span>
                  <span style={{fontWeight:800,color:'#1a5c2a',fontSize:'1.2rem'}}>₹{total}</span>
                </div>
              </div>

              <button
                onClick={handleSubmit}
                disabled={!cartCount}
                style={{
                  width:'100%',marginTop:'1rem',padding:'0.9rem',
                  background: cartCount ? 'linear-gradient(135deg,#4caf50,#2e7d32)' : '#ccc',
                  color:'white',border:'none',borderRadius:14,
                  fontWeight:800,fontSize:'1rem',cursor: cartCount ? 'pointer' : 'not-allowed'
                }}
              >
                Proceed to Confirm →
              </button>
            </>
          ) : (
            <>
              {/* Confirmation screen */}
              <div style={{textAlign:'center',marginBottom:'1.5rem'}}>
                <div style={{fontSize:'4rem',marginBottom:'0.5rem'}}>🎉</div>
                <h3 style={{fontSize:'1.3rem',fontWeight:800,color:'#1a5c2a',margin:'0 0 0.25rem'}}>Confirm Your Order</h3>
                <p style={{color:'#666',fontSize:'0.88rem'}}>Review and confirm your order details</p>
              </div>

              <div style={{background:'#f8fdf8',borderRadius:12,padding:'1rem',marginBottom:'1rem',border:'1px solid #e8f5e9'}}>
                <h4 style={{margin:'0 0 0.75rem',fontSize:'0.9rem',color:'#1a5c2a'}}>📍 Delivering to:</h4>
                <p style={{margin:0,fontSize:'0.9rem',color:'#333',lineHeight:1.6}}>
                  <strong>{addressForm.name}</strong><br/>
                  {addressForm.phone}<br/>
                  {addressForm.address}<br/>
                  {addressForm.city}{addressForm.state?`, ${addressForm.state}`:''} - {addressForm.pincode}
                </p>
              </div>

              <div style={{background:'#f8fdf8',borderRadius:12,padding:'1rem',marginBottom:'1.5rem',border:'1px solid #e8f5e9',textAlign:'center'}}>
                <div style={{fontSize:'0.85rem',color:'#666',marginBottom:'0.25rem'}}>Order Total</div>
                <div style={{fontSize:'2.5rem',fontWeight:800,color:'#1a5c2a'}}>₹{total}</div>
                <div style={{fontSize:'0.75rem',color:'#888'}}>{cartCount} item{cartCount!==1?'s':''} · {shipping===0?'Free delivery':``}</div>
              </div>

              <div style={{display:'flex',gap:'0.75rem'}}>
                <button onClick={()=>setStep(1)} style={{flex:1,padding:'0.8rem',background:'#f1f8e9',color:'#1a5c2a',border:'1px solid #4caf50',borderRadius:12,fontWeight:700,cursor:'pointer',fontSize:'0.9rem'}}>
                  ← Edit Details
                </button>
                <button
                  id="confirm-pay-btn"
                  onClick={()=>{ onCheckout(addressForm); }}
                  style={{flex:2,padding:'0.8rem',background:'linear-gradient(135deg,#4caf50,#2e7d32)',color:'white',border:'none',borderRadius:12,fontWeight:800,cursor:'pointer',fontSize:'1rem',boxShadow:'0 4px 16px rgba(76,175,80,0.4)'}}
                >
                  ✅ Confirm & Pay ₹{total}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── BASKET PANEL ─────────────────────────────────────────────────
function BasketPanel({ cart, cartCount, updateQuantity, removeFromCart, isOpen, onToggle, onCheckout }) {
  const subtotal = cart?.subtotal || 0;
  const shipping = cart?.shipping_fee || 0;
  const total = cart?.total || subtotal + shipping;

  return (
    <>
      <button
        id="basket-toggle-btn"
        onClick={onToggle}
        style={{
          position:'fixed',top:'1rem',right:'1rem',
          background:'linear-gradient(135deg,#2e7d32,#1a5c2a)',
          color:'white',border:'none',borderRadius:999,
          padding:'0.6rem 1.1rem',cursor:'pointer',zIndex:200,
          display:'flex',alignItems:'center',gap:'0.5rem',
          boxShadow:'0 4px 20px rgba(0,0,0,0.3)',fontWeight:700,fontSize:'0.95rem',
          fontFamily:"'Inter',sans-serif"
        }}
      >
        🧺
        {cartCount > 0 && (
          <span style={{background:'#ef4444',borderRadius:999,padding:'0.1rem 0.45rem',fontSize:'0.75rem'}}>
            {cartCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div style={{
          position:'fixed',top:'4rem',right:'1rem',bottom:'1rem',
          width:'min(360px,94vw)',background:'rgba(255,255,255,0.97)',
          borderRadius:20,boxShadow:'0 20px 60px rgba(0,0,0,0.3)',
          backdropFilter:'blur(16px)',zIndex:200,
          display:'flex',flexDirection:'column',overflow:'hidden',
          border:'1px solid rgba(76,175,80,0.2)',
          fontFamily:"'Inter',sans-serif"
        }}>
          <div style={{padding:'1.25rem',background:'linear-gradient(135deg,#1a5c2a,#2e7d32)',color:'white'}}>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
              <h3 style={{margin:0,fontSize:'1.1rem',fontWeight:800}}>🧺 Shopping Basket</h3>
              <button onClick={onToggle} style={{background:'rgba(255,255,255,0.2)',border:'none',color:'white',borderRadius:8,padding:'0.2rem 0.6rem',cursor:'pointer',fontSize:'1rem'}}>✕</button>
            </div>
            <p style={{margin:'0.25rem 0 0',fontSize:'0.8rem',color:'#a5d6a7'}}>
              {cartCount} item{cartCount!==1?'s':''} in your basket
            </p>
          </div>

          <div style={{flex:1,overflowY:'auto',padding:'1rem'}}>
            {!cart?.items||cart.items.length===0 ? (
              <div style={{textAlign:'center',padding:'3rem 1rem',color:'#999'}}>
                <div style={{fontSize:'3rem',marginBottom:'0.5rem'}}>🧺</div>
                <p style={{fontSize:'0.9rem'}}>Your basket is empty</p>
                <p style={{fontSize:'0.8rem',color:'#bbb'}}>Approach products and press E to add them</p>
              </div>
            ) : (
              <div style={{display:'flex',flexDirection:'column',gap:'0.75rem'}}>
                {cart.items.map(item=>(
                  <div key={item.cart_item_id||item.product_id} style={{display:'flex',gap:'0.75rem',alignItems:'center',background:'#f9fafb',borderRadius:12,padding:'0.75rem'}}>
                    <img
                      src={item.primary_image||''}
                      alt={item.product_name}
                      style={{width:48,height:48,borderRadius:8,objectFit:'cover',flexShrink:0,background:'#f0f0f0'}}
                      onError={e=>{e.target.style.display='none';}}
                    />
                    <div style={{flex:1,minWidth:0}}>
                      <p style={{margin:'0 0 0.2rem',fontSize:'0.82rem',fontWeight:700,color:'#1a5c2a',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{item.product_name}</p>
                      <p style={{margin:0,fontSize:'0.72rem',color:'#666'}}>₹{item.price}/{item.unit}</p>
                    </div>
                    <div style={{display:'flex',flexDirection:'column',alignItems:'flex-end',gap:'0.25rem'}}>
                      <div style={{display:'flex',alignItems:'center',gap:'0.2rem',border:'1px solid #e5e7eb',borderRadius:8,overflow:'hidden'}}>
                        <button onClick={()=>updateQuantity(item.cart_item_id,item.quantity-1)} style={{width:24,height:24,border:'none',background:'none',cursor:'pointer',fontSize:'0.9rem'}}>−</button>
                        <span style={{fontSize:'0.85rem',fontWeight:700,minWidth:16,textAlign:'center'}}>{item.quantity}</span>
                        <button onClick={()=>updateQuantity(item.cart_item_id,item.quantity+1)} style={{width:24,height:24,border:'none',background:'none',cursor:'pointer',fontSize:'0.9rem'}}>+</button>
                      </div>
                      <div style={{display:'flex',alignItems:'center',gap:'0.35rem'}}>
                        <span style={{fontSize:'0.85rem',fontWeight:800,color:'#1a5c2a'}}>₹{(item.price*item.quantity).toFixed(0)}</span>
                        <button onClick={()=>removeFromCart(item.cart_item_id)} style={{background:'none',border:'none',cursor:'pointer',color:'#ef4444',fontSize:'0.85rem',padding:0}} title="Remove">🗑️</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {cart?.items&&cart.items.length>0&&(
            <div style={{padding:'1rem',borderTop:'1px solid #e5e7eb'}}>
              <div style={{display:'flex',flexDirection:'column',gap:'0.35rem',marginBottom:'0.75rem',fontSize:'0.85rem'}}>
                <div style={{display:'flex',justifyContent:'space-between'}}>
                  <span style={{color:'#666'}}>Subtotal</span><span style={{fontWeight:700}}>₹{subtotal}</span>
                </div>
                <div style={{display:'flex',justifyContent:'space-between'}}>
                  <span style={{color:'#666'}}>Delivery</span>
                  <span style={{fontWeight:700,color: shipping===0?'#2e7d32':'inherit'}}>{shipping===0?'FREE':`₹${shipping}`}</span>
                </div>
                <div style={{display:'flex',justifyContent:'space-between',paddingTop:'0.4rem',borderTop:'1px solid #e5e7eb',fontSize:'1rem'}}>
                  <span style={{fontWeight:700,color:'#1a5c2a'}}>Total</span>
                  <span style={{fontWeight:800,color:'#1a5c2a'}}>₹{total}</span>
                </div>
              </div>
              <div style={{display:'flex',flexDirection:'column',gap:'0.5rem'}}>
                <button onClick={()=>window.location.href='/cart'} style={{padding:'0.65rem',background:'#f1f8e9',color:'#2e7d32',border:'1px solid #4caf50',borderRadius:12,cursor:'pointer',fontWeight:700,fontSize:'0.85rem'}}>View Full Cart</button>
                <button
                  id="open-billing-btn"
                  onClick={onCheckout}
                  style={{padding:'0.75rem',background:'linear-gradient(135deg,#4caf50,#2e7d32)',color:'white',border:'none',borderRadius:12,cursor:'pointer',fontWeight:800,fontSize:'0.9rem',boxShadow:'0 4px 12px rgba(76,175,80,0.35)'}}
                >
                  🖥️ Go to Billing Counter →
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}

// ─── MINIMAP ──────────────────────────────────────────────────────
function MiniMap({ playerPos, isOpen, onToggle }) {
  const STORE_W=60, STORE_D=80, MAP_W=220, MAP_H=200;
  const mapX=(wx)=>((wx+STORE_W/2)/STORE_W)*MAP_W;
  const mapY=(wz)=>((wz+STORE_D/2)/STORE_D)*MAP_H;
  return (
    <div style={{position:'fixed',bottom:'1rem',left:'1rem',zIndex:200,fontFamily:"'Inter',sans-serif"}}>
      <button id="minimap-toggle-btn" onClick={onToggle} style={{
        background:'rgba(20,40,20,0.88)',color:'#a5d6a7',
        border:'1px solid rgba(76,175,80,0.3)',borderRadius:12,
        padding:'0.4rem 0.8rem',cursor:'pointer',fontSize:'0.78rem',
        backdropFilter:'blur(8px)',display:'flex',alignItems:'center',gap:'0.4rem',
        marginBottom:isOpen?'0.5rem':0
      }}>🗺️ {isOpen?'Hide Map':'Show Map'}</button>

      {isOpen&&(
        <div style={{width:MAP_W,height:MAP_H+24,background:'rgba(10,25,10,0.94)',borderRadius:16,border:'1px solid rgba(76,175,80,0.25)',overflow:'hidden',backdropFilter:'blur(12px)',boxShadow:'0 8px 32px rgba(0,0,0,0.5)'}}>
          <div style={{padding:'4px 8px',background:'rgba(76,175,80,0.15)',fontSize:'0.62rem',color:'#a5d6a7',textAlign:'center',letterSpacing:'0.08em'}}>STORE MAP</div>
          <div style={{position:'relative',width:MAP_W,height:MAP_H,background:'#0d1f0d'}}>
            <div style={{position:'absolute',inset:4,border:'1px solid rgba(76,175,80,0.35)',borderRadius:4}}/>
            {SECTIONS.map(s=>{
              const mx=mapX(s.x),my=mapY(s.z);
              const r=(s.color>>16)&0xff,g=(s.color>>8)&0xff,b=s.color&0xff;
              return (
                <div key={s.id} style={{position:'absolute',left:mx-14,top:my-10,width:28,height:20,background:`rgba(${r},${g},${b},0.55)`,border:`1px solid rgba(${r},${g},${b},0.85)`,borderRadius:4,display:'flex',alignItems:'center',justifyContent:'center'}}>
                  <span style={{fontSize:'8px'}}>{s.icon}</span>
                </div>
              );
            })}
            {playerPos&&(
              <div style={{position:'absolute',left:mapX(playerPos.x)-6,top:mapY(playerPos.z)-6,width:12,height:12,background:'#ffffff',borderRadius:'50%',border:'2px solid #4caf50',boxShadow:'0 0 8px rgba(76,175,80,0.9)',zIndex:10}}/>
            )}
            <div style={{position:'absolute',bottom:4,right:6,fontSize:'7px',color:'#4caf50',fontWeight:700}}>You ●</div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── D-PAD CONTROLS ──────────────────────────────────────────────
function DirectionalControls({ playerRef }) {
  const pressedRef = useRef({});

  const startMove = useCallback((x, y) => {
    pressedRef.current = { x, y };
    playerRef.current?.setVirtualDir(x, y);
  }, [playerRef]);

  const stopMove = useCallback(() => {
    pressedRef.current = {};
    playerRef.current?.setVirtualDir(0, 0);
  }, [playerRef]);

  const dirs = [
    { id:'up',    icon:'▲', x:0,  y:-1, style:{ gridColumn:2, gridRow:1 } },
    { id:'left',  icon:'◀', x:-1, y:0,  style:{ gridColumn:1, gridRow:2 } },
    { id:'right', icon:'▶', x:1,  y:0,  style:{ gridColumn:3, gridRow:2 } },
    { id:'down',  icon:'▼', x:0,  y:1,  style:{ gridColumn:2, gridRow:3 } },
  ];

  return (
    <div style={{
      position:'fixed',bottom:'5.5rem',left:'1rem',zIndex:200,
      display:'grid',gridTemplateColumns:'repeat(3, 48px)',gridTemplateRows:'repeat(3, 48px)',
      gap:'4px',userSelect:'none'
    }}>
      {dirs.map(({id,icon,x,y,style})=>(
        <button
          key={id}
          id={`dpad-${id}`}
          onMouseDown={e=>{e.preventDefault();startMove(x,y);}}
          onMouseUp={stopMove}
          onMouseLeave={stopMove}
          onTouchStart={e=>{e.preventDefault();startMove(x,y);}}
          onTouchEnd={e=>{e.preventDefault();stopMove();}}
          onTouchCancel={e=>{e.preventDefault();stopMove();}}
          style={{
            ...style,
            width:48,height:48,background:'rgba(20,60,20,0.8)',
            border:'1px solid rgba(76,175,80,0.45)',borderRadius:12,
            color:'#a5d6a7',fontSize:'1.1rem',cursor:'pointer',
            display:'flex',alignItems:'center',justifyContent:'center',
            backdropFilter:'blur(8px)',transition:'background 0.1s, transform 0.1s',
            touchAction:'none'
          }}
          onMouseEnter={e=>e.currentTarget.style.background='rgba(76,175,80,0.4)'}
        >
          {icon}
        </button>
      ))}
    </div>
  );
}

// ─── SECTION NAVIGATOR ────────────────────────────────────────────
function SectionNav({ playerRef, onShowToast }) {
  const [isOpen, setIsOpen] = useState(false);
  const navigateTo = (s) => {
    playerRef.current?.teleportTo(s.x, s.z + 4);
    onShowToast(`📍 Navigating to ${s.name}`);
    setIsOpen(false);
  };
  return (
    <div style={{position:'fixed',top:'4rem',left:'1rem',zIndex:200,fontFamily:"'Inter',sans-serif"}}>
      <button id="section-nav-btn" onClick={()=>setIsOpen(!isOpen)} style={{
        background:'rgba(20,40,20,0.88)',color:'#a5d6a7',
        border:'1px solid rgba(76,175,80,0.3)',borderRadius:12,
        padding:'0.4rem 0.85rem',cursor:'pointer',fontSize:'0.8rem',
        backdropFilter:'blur(8px)',display:'flex',alignItems:'center',gap:'0.4rem'
      }}>🗂️ Sections {isOpen?'▲':'▼'}</button>
      {isOpen&&(
        <div style={{
          position:'absolute',top:'110%',left:0,marginTop:'0.25rem',
          background:'rgba(10,25,10,0.97)',borderRadius:16,
          border:'1px solid rgba(76,175,80,0.3)',overflow:'hidden',
          backdropFilter:'blur(16px)',minWidth:210,
          boxShadow:'0 8px 32px rgba(0,0,0,0.5)'
        }}>
          {SECTIONS.map(s=>(
            <button key={s.id} onClick={()=>navigateTo(s)} style={{
              display:'block',width:'100%',padding:'0.6rem 1rem',
              background:'none',border:'none',color:'#c8e6c9',
              textAlign:'left',cursor:'pointer',fontSize:'0.85rem',
              transition:'background 0.15s',fontFamily:'inherit',
              borderBottom:'1px solid rgba(76,175,80,0.1)'
            }}
              onMouseEnter={e=>e.currentTarget.style.background='rgba(76,175,80,0.2)'}
              onMouseLeave={e=>e.currentTarget.style.background='none'}
            >
              {s.icon} {s.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── PRODUCT SEARCH ───────────────────────────────────────────────
function SearchBar({ products, playerRef, onShowToast, onShowProduct, sceneRef }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);

  const handleSearch = (q) => {
    setQuery(q);
    if (!q.trim()) { setResults([]); return; }
    const filtered = products.filter(p =>
      p.name.toLowerCase().includes(q.toLowerCase()) ||
      (p.category_name||'').toLowerCase().includes(q.toLowerCase())
    ).slice(0, 6);
    setResults(filtered);
  };

  const handleFind = (product) => {
    const section = getSectionForProduct(product);
    if (section && playerRef.current) {
      playerRef.current.teleportTo(section.x, section.z + 4);
      onShowToast(`🔍 ${product.name} found in ${section.name}`);
      onShowProduct({ product, section });
    }
    setQuery(''); setResults([]);
  };

  return (
    <div style={{position:'fixed',top:'1rem',left:'50%',transform:'translateX(-50%)',zIndex:200,width:'min(420px,88vw)',fontFamily:"'Inter',sans-serif"}}>
      <input
        id="store-search-input"
        type="text"
        value={query}
        onChange={e=>handleSearch(e.target.value)}
        placeholder="🔍 Search products..."
        style={{
          width:'100%',padding:'0.65rem 1.1rem',borderRadius:999,
          border:'1.5px solid rgba(76,175,80,0.4)',
          background:'rgba(255,255,255,0.97)',fontSize:'0.9rem',
          boxShadow:'0 4px 20px rgba(0,0,0,0.2)',outline:'none',
          boxSizing:'border-box',fontFamily:'inherit'
        }}
        onFocus={e=>e.target.style.borderColor='#2e7d32'}
        onBlur={e=>e.target.style.borderColor='rgba(76,175,80,0.4)'}
      />
      {results.length>0&&(
        <div style={{position:'absolute',top:'110%',left:0,right:0,background:'rgba(255,255,255,0.99)',borderRadius:16,boxShadow:'0 8px 32px rgba(0,0,0,0.18)',border:'1px solid rgba(76,175,80,0.25)',overflow:'hidden',zIndex:300}}>
          {results.map(p=>(
            <button key={p.id} onClick={()=>handleFind(p)} style={{
              display:'flex',alignItems:'center',gap:'0.75rem',
              width:'100%',padding:'0.65rem 1rem',background:'none',
              border:'none',cursor:'pointer',textAlign:'left',
              borderBottom:'1px solid #f0f0f0',fontFamily:'inherit'
            }}
              onMouseEnter={e=>e.currentTarget.style.background='#f1f8e9'}
              onMouseLeave={e=>e.currentTarget.style.background='none'}
            >
              <img src={p.primary_image||''} alt="" style={{width:38,height:38,borderRadius:8,objectFit:'cover',background:'#f0f0f0'}} onError={e=>e.target.style.display='none'}/>
              <div>
                <div style={{fontSize:'0.85rem',fontWeight:700,color:'#1a5c2a'}}>{p.name}</div>
                <div style={{fontSize:'0.72rem',color:'#666'}}>₹{p.price}/{p.unit} · {p.category_name}</div>
              </div>
              <span style={{marginLeft:'auto',fontSize:'0.72rem',color:'#4caf50',fontWeight:600,flexShrink:0}}>Find →</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── TOAST ────────────────────────────────────────────────────────
function GameToast({ message, visible }) {
  return visible ? (
    <div style={{
      position:'fixed',bottom:'12rem',left:'50%',transform:'translateX(-50%)',
      background:'rgba(30,100,40,0.95)',color:'white',
      padding:'0.75rem 1.5rem',borderRadius:999,fontSize:'1rem',fontWeight:700,
      zIndex:300,pointerEvents:'none',boxShadow:'0 4px 20px rgba(0,0,0,0.3)',
      animation:'toastIn 0.3s ease',fontFamily:"'Inter',sans-serif",
      whiteSpace:'nowrap'
    }}>{message}</div>
  ) : null;
}

// ─── CONTROLS HINT ────────────────────────────────────────────────
function ControlsHint({ locked }) {
  return (
    <div style={{
      position:'fixed',bottom:'1rem',right:'1rem',zIndex:200,
      background:'rgba(10,25,10,0.82)',borderRadius:12,padding:'0.6rem 0.9rem',
      border:'1px solid rgba(76,175,80,0.18)',backdropFilter:'blur(8px)',
      fontFamily:"'Inter',sans-serif",fontSize:'0.72rem',color:'#a5d6a7',
      lineHeight:1.6
    }}>
      {locked ? (
        <>
          <div>ESC → release cursor</div>
          <div><kbd style={{background:'rgba(76,175,80,0.2)',padding:'1px 4px',borderRadius:4}}>E</kbd> → pick up product</div>
          <div>Walk to 🖥️ Billing to checkout</div>
        </>
      ) : (
        <>
          <div>Click canvas → lock cursor &amp; look</div>
          <div>D-pad or WASD → move</div>
        </>
      )}
    </div>
  );
}

// ─── NEARBY PRODUCT HINT ─────────────────────────────────────────
function NearbyHint({ product }) {
  if (!product) return null;
  const p = product.product;
  return (
    <div style={{
      position:'fixed',bottom:'1rem',left:'50%',transform:'translateX(-50%)',
      background:'rgba(30,100,40,0.92)',color:'white',
      padding:'0.5rem 1.25rem',borderRadius:999,fontSize:'0.88rem',fontWeight:600,
      zIndex:150,pointerEvents:'none',backdropFilter:'blur(8px)',
      fontFamily:"'Inter',sans-serif",display:'flex',alignItems:'center',gap:'0.5rem'
    }}>
      <span>🛍️</span>
      <span>{p?.name}</span>
      <span style={{opacity:0.75}}>·</span>
      <span style={{color:'#a5d6a7'}}>₹{p?.price}/{p?.unit}</span>
      <span style={{background:'rgba(255,255,255,0.2)',borderRadius:6,padding:'0.1rem 0.4rem',fontSize:'0.75rem'}}>E to add</span>
    </div>
  );
}

// ─── MAIN VIRTUAL SUPERMARKET ─────────────────────────────────────
export const VirtualSupermarket = ({ onExit }) => {
  const canvasRef = useRef(null);
  const rendererRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const playerRef = useRef(null);
  const characterRef = useRef(null);
  const interactionRef = useRef(null);
  const animFrameRef = useRef(null);
  const lastTimeRef = useRef(0);
  const isDraggingRef = useRef(false);
  const lastMouseRef = useRef({ x: 0, y: 0 });
  const dismissedProductIdRef = useRef(null);
  const addToBasketPendingRef = useRef(false);
  const searchedProductIdRef = useRef(null);

  const { cart, cartCount, addToCart, updateQuantity, removeFromCart } = useCart();

  const [phase, setPhase] = useState('welcome');
  const [loadProgress, setLoadProgress] = useState(0);
  const [loadMessage, setLoadMessage] = useState('Initializing...');
  const [products, setProducts] = useState([]);
  const [hoveredProduct, setHoveredProduct] = useState(null);
  const [basketOpen, setBasketOpen] = useState(false);
  const [mapOpen, setMapOpen] = useState(false);
  const [billingOpen, setBillingOpen] = useState(false);
  const [pointerLocked, setPointerLocked] = useState(false);
  const [playerPos, setPlayerPos] = useState({ x: 0, z: 36 });
  const [toast, setToast] = useState({ visible: false, message: '' });

  const showToast = useCallback((msg) => {
    setToast({ visible: true, message: msg });
    setTimeout(() => setToast({ visible: false, message: '' }), 2200);
  }, []);

  // Fetch products
  useEffect(() => {
    api.get('/products?limit=60').then(res => {
      if (res?.success && res.products) setProducts(res.products);
    }).catch(() => {});
  }, []);

  // Place products in 3D world
  const placeProducts3D = useCallback((scene, productList) => {
    const placed = [];
    SECTIONS.filter(section => section.id !== 'checkout').forEach(section => {
      const sectionProducts = productList.filter(product => getSectionForProduct(product)?.id === section.id);

      SECTION_PRODUCT_SLOTS.forEach((slot, index) => {
        // Repeat real catalog items across the display so every stocked photo is purchasable.
        const product = sectionProducts.length ? sectionProducts[index % sectionProducts.length] : null;
        const mesh = buildProductOnShelf(scene, section, slot, product);
        if (product) placed.push({ mesh, product, section });
      });
    });

    return placed;
  }, []);

  // Init Three.js
  const initThreeJS = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setPhase('loading');
    setLoadProgress(10); setLoadMessage('Creating 3D environment...');

    const W = window.innerWidth, H = window.innerHeight;

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: 'low-power' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setSize(W, H);
    renderer.shadowMap.enabled = false;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    rendererRef.current = renderer;

    setLoadProgress(25); setLoadMessage('Building supermarket...');
    await new Promise(r => setTimeout(r, 30));

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87ceeb);
    scene.fog = new THREE.Fog(0xf0f8f0, 25, 85);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(72, W / H, 0.1, 100);
    cameraRef.current = camera;

    setLoadProgress(40); setLoadMessage('Placing shelves and sections...');
    await new Promise(r => setTimeout(r, 30));

    const solidObjects = buildStoreLayout(scene);

    setLoadProgress(60); setLoadMessage('Stocking shelves...');
    await new Promise(r => setTimeout(r, 30));

    const placed = placeProducts3D(scene, products);

    setLoadProgress(75); setLoadMessage('Getting your character ready...');
    await new Promise(r => setTimeout(r, 30));

    const character = new CharacterModel(scene);
    characterRef.current = character;

    const player = new PlayerController(camera, renderer.domElement);
    player.setSolidObjects(solidObjects);
    playerRef.current = player;

    const interaction = new ProductInteraction(camera, scene, placed);
    interactionRef.current = interaction;

    setLoadProgress(90); setLoadMessage('Almost ready...');
    await new Promise(r => setTimeout(r, 150));

    setLoadProgress(100); setLoadMessage('Welcome to Village Mart!');
    await new Promise(r => setTimeout(r, 350));
    setPhase('playing');

    // Pointer lock change
    const onPLChange = () => {
      setPointerLocked(document.pointerLockElement === renderer.domElement);
    };
    document.addEventListener('pointerlockchange', onPLChange);

    // Resize
    const onResize = () => {
      const rw = window.innerWidth, rh = window.innerHeight;
      camera.aspect = rw / rh;
      camera.updateProjectionMatrix();
      renderer.setSize(rw, rh);
    };
    window.addEventListener('resize', onResize);

    // E key handler
    const onKeyDown = (e) => {
      if (e.code === 'KeyE') {
        const h = interactionRef.current?.getHoveredProduct();
        if (h) handleAddToCart(h.product);
      }
      if (e.code === 'Escape') {
        setBasketOpen(false);
        setBillingOpen(false);
      }
    };
    document.addEventListener('keydown', onKeyDown);

    // Animation loop
    const animate = (now) => {
      animFrameRef.current = requestAnimationFrame(animate);
      const dt = Math.min((now - (lastTimeRef.current || now)) / 1000, 0.05);
      lastTimeRef.current = now;

      const isMoving = player.update(dt);
      const pos = player.position;

      // Character behind camera
      character.setPosition(pos.x, pos.y, pos.z);
      character.setRotationY(player.getCharacterRotation());
      character.update(dt, isMoving);
      character.updateCartCount(cartCount);

      // Update interaction
      interaction.setPlayerPosition(pos);
      interaction.update();

      const hovered = interaction.getHoveredProduct();
      setHoveredProduct(prev => {
        if (searchedProductIdRef.current) return prev;
        if (!hovered) {
          dismissedProductIdRef.current = null;
          return prev ? null : prev;
        }
        const hoveredId = String(hovered.product?.id ?? '');
        if (dismissedProductIdRef.current === hoveredId) return null;
        if (dismissedProductIdRef.current && dismissedProductIdRef.current !== hoveredId) {
          dismissedProductIdRef.current = null;
        }
        if (hovered && prev && hovered.product?.id === prev.product?.id) return prev;
        return hovered || null;
      });

      setPlayerPos({ x: pos.x, z: pos.z });
      renderer.render(scene, camera);
    };
    animFrameRef.current = requestAnimationFrame(animate);

    return () => {
      document.removeEventListener('pointerlockchange', onPLChange);
      window.removeEventListener('resize', onResize);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [products, placeProducts3D, cartCount]);

  const handleAddToCart = useCallback(async (product) => {
    if (!product || addToBasketPendingRef.current) return;
    addToBasketPendingRef.current = true;
    dismissedProductIdRef.current = String(product.id ?? '');
    searchedProductIdRef.current = null;
    setHoveredProduct(null);
    try {
      const success = await addToCart(product.id, 1, product);
      if (success === false) {
        showToast(`Could not add ${product.name} to your basket.`);
        return;
      }
      showToast(`✅ ${product.name} added to basket!`);
    } catch (error) {
      console.error('Failed to add product to basket:', error);
      showToast(`Could not add ${product.name} to your basket.`);
    } finally {
      addToBasketPendingRef.current = false;
    }
  }, [addToCart, showToast]);

  const handleShowSearchedProduct = useCallback((selection) => {
    searchedProductIdRef.current = String(selection.product?.id ?? '');
    setHoveredProduct(selection);
  }, []);

  const handleDismissProduct = useCallback((selection) => {
    dismissedProductIdRef.current = String(selection?.product?.id ?? '');
    searchedProductIdRef.current = null;
    setHoveredProduct(null);
  }, []);

  const handleCheckout = useCallback(async (addressForm) => {
    // Navigate to checkout with address pre-filled
    sessionStorage.setItem('billingAddress', JSON.stringify(addressForm));
    window.location.href = '/checkout';
  }, []);

  const handleEnterStore = useCallback(() => { initThreeJS(); }, [initThreeJS]);

  // Canvas interaction — mouse drag for camera when not pointer locked
  const handleCanvasMouseDown = useCallback((e) => {
    // Only lock pointer if clicking directly on canvas (not UI buttons)
    if (e.target === canvasRef.current) {
      if (!pointerLocked) {
        playerRef.current?.requestPointerLock();
      }
      isDraggingRef.current = true;
      lastMouseRef.current = { x: e.clientX, y: e.clientY };
    }
  }, [pointerLocked]);

  const handleCanvasMouseMove = useCallback((e) => {
    if (isDraggingRef.current && !pointerLocked && playerRef.current) {
      const dx = e.clientX - lastMouseRef.current.x;
      const dy = e.clientY - lastMouseRef.current.y;
      playerRef.current.rotateCameraBy(dx, dy);
      lastMouseRef.current = { x: e.clientX, y: e.clientY };
    }
  }, [pointerLocked]);

  const handleCanvasMouseUp = useCallback(() => {
    isDraggingRef.current = false;
  }, []);

  // Cleanup
  useEffect(() => {
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      playerRef.current?.dispose();
      characterRef.current?.dispose();
      rendererRef.current?.dispose();
      if (document.pointerLockElement) document.exitPointerLock();
    };
  }, []);

  return (
    <div style={{ position:'relative', width:'100%', height:'100vh', overflow:'hidden', background:'#0d1f0d', userSelect:'none' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        @keyframes slideUp { from{opacity:0;transform:translate(-50%,16px)} to{opacity:1;transform:translate(-50%,0)} }
        @keyframes toastIn { from{opacity:0;transform:translate(-50%,8px)} to{opacity:1;transform:translate(-50%,0)} }
      `}</style>

      {/* THREE.JS CANVAS */}
      <canvas
        ref={canvasRef}
        style={{
          display:'block', width:'100%', height:'100%',
          cursor: phase !== 'playing' ? 'default' : (pointerLocked ? 'none' : 'crosshair')
        }}
        onMouseDown={handleCanvasMouseDown}
        onMouseMove={handleCanvasMouseMove}
        onMouseUp={handleCanvasMouseUp}
        onMouseLeave={handleCanvasMouseUp}
      />

      {phase === 'welcome' && <WelcomeScreen onEnter={handleEnterStore} />}
      {phase === 'loading' && <LoadingScreen progress={loadProgress} message={loadMessage} />}

      {phase === 'playing' && (
        <>
          {/* Top bar */}
          <div style={{
            position:'fixed',top:0,left:0,right:0,zIndex:200,
            background:'linear-gradient(180deg,rgba(5,20,5,0.88) 0%,transparent 100%)',
            padding:'0.5rem 1rem',display:'flex',alignItems:'center',justifyContent:'space-between',
            pointerEvents:'none'
          }}>
            <div style={{display:'flex',alignItems:'center',gap:'0.5rem',pointerEvents:'auto'}}>
              <span style={{fontSize:'1.4rem'}}>🏪</span>
              <span style={{color:'#a5d6a7',fontWeight:800,fontSize:'1rem',fontFamily:"'Inter',sans-serif"}}>Village Mart</span>
            </div>
            <button
              id="exit-3d-btn"
              onClick={onExit}
              style={{
                pointerEvents:'auto',background:'rgba(220,38,38,0.88)',color:'white',
                border:'none',borderRadius:8,padding:'0.35rem 0.85rem',
                cursor:'pointer',fontSize:'0.82rem',fontWeight:700,fontFamily:"'Inter',sans-serif"
              }}
            >← Exit 3D Store</button>
          </div>

          <SearchBar
            products={products}
            playerRef={playerRef}
            onShowToast={showToast}
            onShowProduct={handleShowSearchedProduct}
            sceneRef={sceneRef}
          />

          <SectionNav playerRef={playerRef} onShowToast={showToast} />

          <MiniMap playerPos={playerPos} isOpen={mapOpen} onToggle={() => setMapOpen(!mapOpen)} />

          <DirectionalControls playerRef={playerRef} />

          <ControlsHint locked={pointerLocked} />

          <BasketPanel
            cart={cart} cartCount={cartCount}
            updateQuantity={updateQuantity} removeFromCart={removeFromCart}
            isOpen={basketOpen} onToggle={() => setBasketOpen(!basketOpen)}
            onCheckout={() => { setBasketOpen(false); setBillingOpen(true); }}
          />

          {/* Product card - only show if NOT interacting with billing */}
          {hoveredProduct && !billingOpen && (
            <ProductCard
              product={hoveredProduct}
              onAddToCart={handleAddToCart}
              onClose={() => handleDismissProduct(hoveredProduct)}
            />
          )}

          {/* Nearby hint bar at bottom */}
          {hoveredProduct && !billingOpen && (
            <NearbyHint product={hoveredProduct} />
          )}

          {/* Billing modal */}
          {billingOpen && (
            <BillingModal
              cart={cart}
              cartCount={cartCount}
              onClose={() => setBillingOpen(false)}
              onCheckout={handleCheckout}
            />
          )}

          <GameToast message={toast.message} visible={toast.visible} />

          {/* Billing computer proximity prompt */}
          {!billingOpen && (
            <div style={{
              position:'fixed',top:'50%',right:'1rem',transform:'translateY(-50%)',
              zIndex:150,pointerEvents:'auto'
            }}>
              <button
                id="open-billing-computer-btn"
                onClick={() => setBillingOpen(true)}
                style={{
                  background:'linear-gradient(135deg,#1a5c2a,#2e7d32)',color:'white',
                  border:'2px solid rgba(255,255,255,0.25)',borderRadius:16,
                  padding:'0.75rem 1.1rem',cursor:'pointer',
                  fontFamily:"'Inter',sans-serif",fontWeight:700,fontSize:'0.82rem',
                  boxShadow:'0 8px 24px rgba(0,0,0,0.4)',
                  display:'flex',flexDirection:'column',alignItems:'center',gap:'0.4rem'
                }}
                title="Open Billing Counter"
              >
                <span style={{fontSize:'1.8rem'}}>🖥️</span>
                <span>Billing</span>
                <span style={{fontSize:'0.7rem',color:'#a5d6a7',fontWeight:500}}>Counter</span>
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};
