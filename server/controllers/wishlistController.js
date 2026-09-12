import { query, get, run } from '../config/database.js';

export const getWishlist = async (req, res) => {
  try {
    const userId = req.user.id;
    const wishlist = await query(`
      SELECT w.id as wishlist_id, w.created_at,
             p.id as product_id, p.name as product_name, p.price, p.unit, p.quantity as stock_available, p.location,
             u.name as farmer_name, fp.farm_name,
             COALESCE((SELECT image_url FROM product_images WHERE product_id = p.id ORDER BY is_primary DESC LIMIT 1), '/placeholder-product.jpg') as primary_image,
             COALESCE((SELECT AVG(rating) FROM reviews WHERE product_id = p.id), 5.0) as avg_rating
      FROM wishlist w
      JOIN products p ON w.product_id = p.id
      JOIN users u ON p.farmer_id = u.id
      LEFT JOIN farmer_profiles fp ON u.id = fp.user_id
      WHERE w.user_id = ?
      ORDER BY w.created_at DESC
    `, [userId]);

    return res.json({ success: true, wishlist });
  } catch (error) {
    console.error('Error fetching wishlist:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch wishlist.' });
  }
};

export const addToWishlist = async (req, res) => {
  try {
    const userId = req.user.id;
    const { product_id } = req.body;

    if (!product_id) {
      return res.status(400).json({ success: false, message: 'Product ID required.' });
    }

    const existing = await get('SELECT id FROM wishlist WHERE user_id = ? AND product_id = ?', [userId, product_id]);
    if (existing) {
      return res.status(400).json({ success: false, message: 'Product is already in your wishlist.' });
    }

    await run('INSERT INTO wishlist (user_id, product_id) VALUES (?, ?)', [userId, product_id]);
    return res.status(201).json({ success: true, message: 'Added to wishlist!' });
  } catch (error) {
    console.error('Error adding to wishlist:', error);
    return res.status(500).json({ success: false, message: 'Failed to add product to wishlist.' });
  }
};

export const removeFromWishlist = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId } = req.params;

    await run('DELETE FROM wishlist WHERE user_id = ? AND product_id = ?', [userId, productId]);
    return res.json({ success: true, message: 'Removed from wishlist.' });
  } catch (error) {
    console.error('Error removing from wishlist:', error);
    return res.status(500).json({ success: false, message: 'Failed to remove from wishlist.' });
  }
};
