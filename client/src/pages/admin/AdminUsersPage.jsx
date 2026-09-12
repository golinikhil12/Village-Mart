import React, { useEffect, useState } from 'react';
import { Users, Tractor, ShieldCheck } from 'lucide-react';
import { api } from '../../services/api.js';

export const AdminUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [roleFilter, setRoleFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/admin/users?role=${roleFilter}`);
      if (res.success) {
        setUsers(res.users || []);
      }
    } catch (err) {
      console.error('Failed to fetch users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter]);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.8rem', color: 'var(--primary-deep)', margin: 0 }}>Registered Platform Users ({users.length})</h2>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button onClick={() => setRoleFilter('all')} className={`btn btn-sm ${roleFilter === 'all' ? 'btn-primary' : 'btn-outline'}`}>All</button>
          <button onClick={() => setRoleFilter('customer')} className={`btn btn-sm ${roleFilter === 'customer' ? 'btn-primary' : 'btn-outline'}`}>Customers</button>
          <button onClick={() => setRoleFilter('farmer')} className={`btn btn-sm ${roleFilter === 'farmer' ? 'btn-primary' : 'btn-outline'}`}>Farmers</button>
        </div>
      </div>

      {loading ? (
        <p>Loading users list...</p>
      ) : (
        <div className="card" style={{ padding: '1.5rem', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border-color)', color: 'var(--text-muted)' }}>
                <th style={{ padding: '0.75rem' }}>ID</th>
                <th style={{ padding: '0.75rem' }}>User Name</th>
                <th style={{ padding: '0.75rem' }}>Email / Phone</th>
                <th style={{ padding: '0.75rem' }}>Role</th>
                <th style={{ padding: '0.75rem' }}>Farm Name / Location</th>
                <th style={{ padding: '0.75rem' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '0.75rem', fontWeight: 800 }}>#{u.id}</td>
                  <td style={{ padding: '0.75rem', fontWeight: 700, color: 'var(--primary-deep)' }}>{u.name}</td>
                  <td style={{ padding: '0.75rem' }}>{u.email}<br /><span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{u.phone}</span></td>
                  <td style={{ padding: '0.75rem', textTransform: 'capitalize', fontWeight: 700 }}>{u.role}</td>
                  <td style={{ padding: '0.75rem' }}>{u.farm_name ? `${u.farm_name} (${u.location})` : '—'}</td>
                  <td style={{ padding: '0.75rem' }}>
                    {u.role === 'farmer' ? (
                      <span className={`badge ${u.verification_status === 'approved' ? 'badge-verified' : 'badge-pending'}`}>
                        {u.verification_status || 'pending'}
                      </span>
                    ) : (
                      <span className="badge badge-verified">Active</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
