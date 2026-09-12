import { query, get, run } from '../config/database.js';

export const getAdminStats = async (req, res) => {
  try {
    const totalUsers = await get(`SELECT COUNT(*) as count FROM users WHERE role = 'customer'`);
    const totalFarmers = await get(`SELECT COUNT(*) as count FROM users WHERE role = 'farmer'`);
    const verifiedFarmers = await get(`SELECT COUNT(*) as count FROM farmer_profiles WHERE verification_status = 'approved'`);
    const pendingFarmersCount = await get(`SELECT COUNT(*) as count FROM farmer_profiles WHERE verification_status = 'pending'`);
    const totalProducts = await get(`SELECT COUNT(*) as count FROM products`);
    const totalOrders = await get(`SELECT COUNT(*) as count FROM orders`);
    const totalRevenue = await get(`SELECT COALESCE(SUM(total), 0) as total FROM orders WHERE order_status != 'cancelled'`);

    const pendingFarmers = await query(`
      SELECT u.id as user_id, u.name, u.email, u.phone, u.created_at,
             fp.id as profile_id, fp.farm_name, fp.location, fp.description, fp.farming_experience, fp.verification_status
      FROM users u
      JOIN farmer_profiles fp ON u.id = fp.user_id
      WHERE fp.verification_status = 'pending'
      ORDER BY u.created_at DESC
    `);

    const recentOrders = await query(`
      SELECT o.*, u.name as customer_name, a.city, a.state
      FROM orders o
      JOIN users u ON o.user_id = u.id
      JOIN addresses a ON o.address_id = a.id
      ORDER BY o.created_at DESC
      LIMIT 6
    `);

    return res.json({
      success: true,
      stats: {
        totalUsers: totalUsers.count,
        totalFarmers: totalFarmers.count,
        verifiedFarmers: verifiedFarmers.count,
        pendingFarmers: pendingFarmersCount.count,
        totalProducts: totalProducts.count,
        totalOrders: totalOrders.count,
        totalRevenue: totalRevenue.total
      },
      pendingFarmers,
      recentOrders
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch admin dashboard stats.' });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const { role } = req.query;
    let sql = `
      SELECT u.id, u.name, u.email, u.phone, u.role, u.created_at,
             fp.farm_name, fp.location, fp.verification_status
      FROM users u
      LEFT JOIN farmer_profiles fp ON u.id = fp.user_id
      WHERE 1=1
    `;
    const params = [];
    if (role && role !== 'all') {
      sql += ` AND u.role = ?`;
      params.push(role);
    }
    sql += ` ORDER BY u.created_at DESC`;

    const users = await query(sql, params);
    return res.json({ success: true, users });
  } catch (error) {
    console.error('Error fetching users:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch users list.' });
  }
};

export const updateFarmerVerification = async (req, res) => {
  try {
    const { farmerId } = req.params;
    const { status } = req.body; // 'approved' or 'rejected'

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid verification status.' });
    }

    const profile = await get('SELECT * FROM farmer_profiles WHERE user_id = ?', [farmerId]);
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Farmer profile not found.' });
    }

    await run('UPDATE farmer_profiles SET verification_status = ? WHERE user_id = ?', [status, farmerId]);

    // Send notification to farmer
    const title = status === 'approved' ? 'Farmer Verification Approved! 🎉' : 'Farmer Verification Update';
    const message = status === 'approved' 
      ? 'Congratulations! Your farmer account has been verified by Village Mart Admin. Your verified badge is now active.'
      : 'Your farmer application was not approved at this time. Please contact support for more details.';

    await run(`INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, 'system')`, [farmerId, title, message]);

    return res.json({
      success: true,
      message: `Farmer status updated to ${status}.`
    });
  } catch (error) {
    console.error('Error updating farmer verification:', error);
    return res.status(500).json({ success: false, message: 'Failed to update verification status.' });
  }
};

export const addCategory = async (req, res) => {
  try {
    const { name, description, image } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, message: 'Category name is required.' });
    }

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    const result = await run(`
      INSERT INTO categories (name, slug, description, image) VALUES (?, ?, ?, ?)
    `, [name, slug, description || '', image || '/placeholder-category.jpg']);

    return res.status(201).json({
      success: true,
      message: 'Category created successfully!',
      categoryId: result.lastID
    });
  } catch (error) {
    console.error('Error adding category:', error);
    return res.status(500).json({ success: false, message: 'Failed to create category.' });
  }
};
