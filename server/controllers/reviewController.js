import { query, get, run } from '../config/database.js';

export const createReview = async (req, res) => {
  try {
    const userId = req.user.id;
    const { product_id, rating, comment } = req.body;

    if (!product_id || !rating) {
      return res.status(400).json({ success: false, message: 'Product ID and rating are required.' });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: 'Rating must be between 1 and 5.' });
    }

    // Verify if customer has purchased the product
    const purchased = await get(`
      SELECT oi.id 
      FROM order_items oi
      JOIN orders o ON oi.order_id = o.id
      WHERE o.user_id = ? AND oi.product_id = ? AND o.order_status = 'delivered'
    `, [userId, product_id]);

    // We allow reviews if purchased OR for demo flexibility
    const existing = await get('SELECT id FROM reviews WHERE user_id = ? AND product_id = ?', [userId, product_id]);
    if (existing) {
      await run('UPDATE reviews SET rating = ?, comment = ?, created_at = CURRENT_TIMESTAMP WHERE id = ?', [rating, comment || '', existing.id]);
      return res.json({ success: true, message: 'Review updated successfully!' });
    } else {
      await run('INSERT INTO reviews (user_id, product_id, rating, comment) VALUES (?, ?, ?, ?)', [userId, product_id, rating, comment || '']);
      return res.status(201).json({ success: true, message: 'Review submitted successfully!' });
    }
  } catch (error) {
    console.error('Error submitting review:', error);
    return res.status(500).json({ success: false, message: 'Failed to submit review.' });
  }
};

export const deleteReview = async (req, res) => {
  try {
    const { id } = req.params;
    const review = await get('SELECT * FROM reviews WHERE id = ?', [id]);
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found.' });
    }

    if (review.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized to delete this review.' });
    }

    await run('DELETE FROM reviews WHERE id = ?', [id]);
    return res.json({ success: true, message: 'Review deleted successfully.' });
  } catch (error) {
    console.error('Error deleting review:', error);
    return res.status(500).json({ success: false, message: 'Failed to delete review.' });
  }
};
