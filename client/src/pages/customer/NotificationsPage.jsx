import React from 'react';
import { Bell, CheckCheck } from 'lucide-react';
import { useNotification } from '../../context/NotificationContext.jsx';

export const NotificationsPage = () => {
  const { notifications, markRead } = useNotification();

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.8rem', color: 'var(--primary-deep)', margin: 0 }}>In-App Notifications</h2>
        {notifications.length > 0 && (
          <button onClick={() => markRead('all')} className="btn btn-outline btn-sm" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <CheckCheck size={16} /> Mark All as Read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          <Bell size={40} color="var(--primary)" style={{ margin: '0 auto 1rem' }} />
          <p>No notifications yet.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {notifications.map((notif) => (
            <div
              key={notif.id}
              className="card"
              style={{
                padding: '1.25rem',
                borderLeft: notif.is_read ? '4px solid var(--border-color)' : '4px solid var(--primary)',
                background: notif.is_read ? '#ffffff' : 'var(--bg-main)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '1rem'
              }}
            >
              <div>
                <h4 style={{ fontSize: '1rem', color: 'var(--primary-deep)', margin: '0 0 0.3rem 0' }}>{notif.title}</h4>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-main)', margin: 0 }}>{notif.message}</p>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-light)', display: 'block', marginTop: 4 }}>
                  {new Date(notif.created_at).toLocaleString()}
                </span>
              </div>

              {!notif.is_read && (
                <button onClick={() => markRead(notif.id)} className="btn btn-outline btn-sm">
                  Mark Read
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
