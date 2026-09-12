import { query, get, run } from '../config/database.js';

// Helper to get or create cart for user
const getOrCreateCart = async (userId) => {
  let cart = await get('SELECT * FROM carts WHERE user_id = ?', [userId]);
  if (!cart) {
    const result = await run('INSERT INTO carts (user_id) VALUES (?)', [userId]);
    cart = { id: result.lastID, user_id: userId };
  }
  return cart;
};

export const getCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const cart = await getOrCreateCart(userId);

    const items = await query(`
      SELECT ci.id as cart_item_id, ci.quantity,
             p.id as product_id, p.name as product_name, p.price, p.unit, p.quantity as stock_available, p.location, p.status,
             u.name as farmer_name, fp.farm_name,
             COALESCE((SELECT image_url FROM product_images WHERE product_id = p.id ORDER BY is_primary DESC LIMIT 1), '/placeholder-product.jpg') as primary_image
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.id
      JOIN users u ON p.farmer_id = u.id
      LEFT JOIN farmer_profiles fp ON u.id = fp.user_id
      WHERE ci.cart_id = ?
    `, [cart.id]);

    let subtotal = 0;
    items.forEach(item => {
      subtotal += item.price * item.quantity;
    });

    const shipping_fee = items.length > 0 ? (subtotal > 500 ? 0 : 40) : 0;
    const total = subtotal + shipping_fee;

    return res.json({
      success: true,
      cart: {
        id: cart.id,
        items,
        subtotal,
        shipping_fee,
        total
      }
    });
  } catch (error) {
    console.error('Error fetching cart:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch shopping cart.' });
  }
};

export const addToCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { product_id, quantity = 1 } = req.body;

    if (!product_id) {
      return res.status(400).json({ success: false, message: 'Product ID is required.' });
    }

    const product = await get('SELECT * FROM products WHERE id = ?', [product_id]);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    if (product.quantity < quantity) {
      return res.status(400).json({ success: false, message: `Only ${product.quantity} items available in stock.` });
    }

    const cart = await getOrCreateCart(userId);

    const existingItem = await get('SELECT * FROM cart_items WHERE cart_id = ? AND product_id = ?', [cart.id, product_id]);
    if (existingItem) {
      const newQty = existingItem.quantity + parseInt(quantity);
      if (newQty > product.quantity) {
        return res.status(400).json({ success: false, message: `Cannot add more. Max available stock is ${product.quantity}.` });
      }
      await run('UPDATE cart_items SET quantity = ? WHERE id = ?', [newQty, existingItem.id]);
    } else {
      await run('INSERT INTO cart_items (cart_id, product_id, quantity) VALUES (?, ?, ?)', [cart.id, product_id, parseInt(quantity)]);
    }

    return res.json({ success: true, message: 'Product added to cart successfully!' });
  } catch (error) {
    console.error('Error adding to cart:', error);
    return res.status(500).json({ success: false, message: 'Failed to add item to cart.' });
  }
};

export const updateCartItem = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params; // cart_item_id
    const { quantity } = req.body;

    if (quantity < 1) {
      return res.status(400).json({ success: false, message: 'Quantity must be at least 1.' });
    }

    const item = await get(`
      SELECT ci.*, p.quantity as stock_available 
      FROM cart_items ci 
      JOIN products p ON ci.product_id = p.id
      JOIN carts c ON ci.cart_id = c.id
      WHERE ci.id = ? AND c.user_id = ?
    `, [id, userId]);

    if (!item) {
      return res.status(404).json({ success: false, message: 'Cart item not found.' });
    }

    if (quantity > item.stock_available) {
      return res.status(400).json({ success: false, message: `Only ${item.stock_available} units available.` });
    }

    await run('UPDATE cart_items SET quantity = ? WHERE id = ?', [parseInt(quantity), id]);
    return res.json({ success: true, message: 'Cart updated.' });
  } catch (error) {
    console.error('Error updating cart item:', error);
    return res.status(500).json({ success: false, message: 'Failed to update cart item.' });
  }
};

export const removeFromCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const cart = await getOrCreateCart(userId);
    await run('DELETE FROM cart_items WHERE id = ? AND cart_id = ?', [id, cart.id]);

    return res.json({ success: true, message: 'Item removed from cart.' });
  } catch (error) {
    console.error('Error removing cart item:', error);
    return res.status(500).json({ success: false, message: 'Failed to remove item from cart.' });
  }
};

export const clearCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const cart = await getOrCreateCart(userId);
    await run('DELETE FROM cart_items WHERE cart_id = ?', [cart.id]);

    return res.json({ success: true, message: 'Cart cleared.' });
  } catch (error) {
    console.error('Error clearing cart:', error);
    return res.status(500).json({ success: false, message: 'Failed to clear cart.' });
  }
};
