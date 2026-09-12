import { query, get } from '../config/database.js';

export const getFarmers = async (req, res) => {
  try {
    const { search, location, verification_status = 'approved' } = req.query;

    let sql = `
      SELECT u.id as user_id, u.name, u.email, u.phone, u.profile_image,
             fp.id as profile_id, fp.farm_name, fp.location, fp.description,
             fp.farming_experience, fp.farming_method, fp.verification_status, fp.rating,
             COALESCE((SELECT COUNT(*) FROM products WHERE farmer_id = u.id AND status = 'published'), 0) as products_count
      FROM users u
      JOIN farmer_profiles fp ON u.id = fp.user_id
      WHERE u.role = 'farmer'
    `;

    const params = [];

    if (verification_status && verification_status !== 'all') {
      sql += ` AND fp.verification_status = ?`;
      params.push(verification_status);
    }

    if (search) {
      sql += ` AND (u.name LIKE ? OR fp.farm_name LIKE ? OR fp.description LIKE ?)`;
      const searchParam = `%${search}%`;
      params.push(searchParam, searchParam, searchParam);
    }

    if (location) {
      sql += ` AND fp.location LIKE ?`;
      params.push(`%${location}%`);
    }

    sql += ` ORDER BY fp.rating DESC, products_count DESC`;

    const farmers = await query(sql, params);
    return res.json({ success: true, farmers });
  } catch (error) {
    console.error('Error fetching farmers:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch farmers directory.' });
  }
};

export const getFarmerById = async (req, res) => {
  try {
    const { id } = req.params;

    const sql = `
      SELECT u.id as user_id, u.name, u.email, u.phone, u.profile_image, u.created_at as joined_date,
             fp.id as profile_id, fp.farm_name, fp.location, fp.description,
             fp.farming_experience, fp.farming_method, fp.verification_status, fp.rating,
             COALESCE((SELECT COUNT(*) FROM products WHERE farmer_id = u.id AND status = 'published'), 0) as products_count
      FROM users u
      JOIN farmer_profiles fp ON u.id = fp.user_id
      WHERE u.id = ? AND u.role = 'farmer'
    `;

    const farmer = await get(sql, [id]);
    if (!farmer) {
      return res.status(404).json({ success: false, message: 'Farmer profile not found.' });
    }

    const products = await query(`
      SELECT p.*, c.name as category_name,
             COALESCE((SELECT image_url FROM product_images WHERE product_id = p.id ORDER BY is_primary DESC LIMIT 1), '/placeholder-product.jpg') as primary_image,
             COALESCE((SELECT AVG(rating) FROM reviews WHERE product_id = p.id), 5.0) as avg_rating,
             COALESCE((SELECT COUNT(*) FROM reviews WHERE product_id = p.id), 0) as review_count
      FROM products p
      JOIN categories c ON p.category_id = c.id
      WHERE p.farmer_id = ? AND p.status = 'published'
      ORDER BY p.created_at DESC
    `, [id]);

    return res.json({
      success: true,
      farmer,
      products
    });
  } catch (error) {
    console.error('Error fetching farmer profile:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch farmer profile.' });
  }
};

export const getFarmerDashboardStats = async (req, res) => {
  try {
    const farmerId = req.user.id;

    const totalProducts = await get(`SELECT COUNT(*) as count FROM products WHERE farmer_id = ?`, [farmerId]);
    const activeProducts = await get(`SELECT COUNT(*) as count FROM products WHERE farmer_id = ? AND status = 'published'`, [farmerId]);

    const orderStats = await get(`
      SELECT COUNT(DISTINCT oi.order_id) as total_orders,
             COALESCE(SUM(oi.quantity * oi.price), 0) as total_revenue
      FROM order_items oi
      JOIN orders o ON oi.order_id = o.id
      WHERE oi.farmer_id = ? AND o.order_status != 'cancelled'
    `, [farmerId]);

    const recentOrders = await query(`
      SELECT DISTINCT o.id as order_id, o.order_status, o.created_at, o.total, u.name as customer_name,
             SUM(oi.quantity * oi.price) as farmer_subtotal,
             COUNT(oi.id) as item_count
      FROM orders o
      JOIN order_items oi ON o.id = oi.order_id
      JOIN users u ON o.user_id = u.id
      WHERE oi.farmer_id = ?
      GROUP BY o.id
      ORDER BY o.created_at DESC
      LIMIT 5
    `, [farmerId]);

    const lowStockItems = await query(`
      SELECT id, name, quantity, unit, price
      FROM products
      WHERE farmer_id = ? AND quantity <= 10
      ORDER BY quantity ASC
    `, [farmerId]);

    return res.json({
      success: true,
      stats: {
        totalProducts: totalProducts.count,
        activeProducts: activeProducts.count,
        totalOrders: orderStats.total_orders,
        revenue: orderStats.total_revenue
      },
      recentOrders,
      lowStockItems
    });
  } catch (error) {
    console.error('Error fetching farmer dashboard stats:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch dashboard statistics.' });
  }
};
