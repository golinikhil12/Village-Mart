import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle2 } from 'lucide-react';
import { useToast } from '../context/ToastContext.jsx';

export const ContactPage = () => {
  const { addToast } = useToast();
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    addToast('Thank you! Your message has been sent to Village Mart support.', 'success');
  };

  return (
    <div style={{ paddingBottom: '5rem' }}>
      <div className="page-header">
        <div className="container" style={{ textAlign: 'center' }}>
          <h1>Get In Touch With Us</h1>
          <p>Have questions about direct farmer procurement, partnership, or bulk orders? We're here to help.</p>
        </div>
      </div>

      <div className="container">
        <div className="contact-layout">
          {/* Contact Details */}
          <div className="card" style={{ padding: '2rem', height: 'fit-content' }}>
            <h3 style={{ fontSize: '1.4rem', color: 'var(--primary-deep)', marginBottom: '1.5rem' }}>Village Mart Support</h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ background: 'var(--primary-mint)', color: 'var(--primary-deep)', padding: '0.75rem', borderRadius: 'var(--radius-md)' }}>
                  <MapPin size={22} />
                </div>
                <div>
                  <h4 style={{ fontSize: '1rem', color: 'var(--primary-deep)' }}>Primary Rural Hub</h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Warangal Agri Logistics Yard, Telangana 506002</p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ background: 'var(--primary-mint)', color: 'var(--primary-deep)', padding: '0.75rem', borderRadius: 'var(--radius-md)' }}>
                  <Phone size={22} />
                </div>
                <div>
                  <h4 style={{ fontSize: '1rem', color: 'var(--primary-deep)' }}>Phone Helpline</h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>+91 (800) 555-FARM / +91 98480 12345</p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ background: 'var(--primary-mint)', color: 'var(--primary-deep)', padding: '0.75rem', borderRadius: 'var(--radius-md)' }}>
                  <Mail size={22} />
                </div>
                <div>
                  <h4 style={{ fontSize: '1rem', color: 'var(--primary-deep)' }}>Email Inquiry</h4>
                  <p style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--primary-deep)' }}>golinikhil12@gmail.com</p>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>support@villagemart.com</p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="card" style={{ padding: '2.5rem' }}>
            <h3 style={{ fontSize: '1.5rem', color: 'var(--primary-deep)', marginBottom: '1.25rem' }}>Send Us a Message</h3>

            {submitted ? (
              <div style={{ textAlign: 'center', padding: '2rem' }}>
                <CheckCircle2 size={48} color="#10b981" style={{ margin: '0 auto 1rem' }} />
                <h3>Message Sent Successfully!</h3>
                <p style={{ color: 'var(--text-muted)' }}>Our agricultural support representative will get back to you within 24 hours.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="form-row-2">
                  <div className="form-group">
                    <label className="form-label">Your Name</label>
                    <input
                      type="text"
                      className="form-input"
                      required
                      placeholder="e.g. Rahul Sharma"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email Address</label>
                    <input
                      type="email"
                      className="form-input"
                      required
                      placeholder="name@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Subject</label>
                  <input
                    type="text"
                    className="form-input"
                    required
                    placeholder="e.g. Bulk produce order / Farmer onboarding"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Message</label>
                  <textarea
                    className="form-textarea"
                    rows={5}
                    required
                    placeholder="Write your message or question here..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  />
                </div>

                <button type="submit" className="btn btn-primary btn-lg btn-block">
                  <Send size={18} /> Send Message
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
