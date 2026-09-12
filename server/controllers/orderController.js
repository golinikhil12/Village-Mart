import { query, get, run } from '../config/database.js';

export const getAddresses = async (req, res) => {
  try {
    const userId = req.user.id;
    const addresses = await query('SELECT * FROM addresses WHERE user_id = ? ORDER BY is_default DESC, id DESC', [userId]);
    return res.json({ success: true, addresses });
  } catch (error) {
    console.error('Error fetching addresses:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch addresses.' });
  }
};

export const addAddress = async (req, res) => {
  try {
    const userId = req.user.id;
    const { full_name, phone, address_line, city, state, pincode, landmark, is_default } = req.body;

    if (!full_name || !phone || !address_line || !city || !state || !pincode) {
      return res.status(400).json({ success: false, message: 'All required address fields must be provided.' });
    }

    if (is_default) {
      await run('UPDATE addresses SET is_default = 0 WHERE user_id = ?', [userId]);
    }

    const result = await run(`
      INSERT INTO addresses (user_id, full_name, phone, address_line, city, state, pincode, landmark, is_default)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [userId, full_name, phone, address_line, city, state, pincode, landmark || '', is_default ? 1 : 0]);

    return res.status(201).json({
      success: true,
      message: 'Address added successfully!',
      addressId: result.lastID
    });
  } catch (error) {
    console.error('Error adding address:', error);
    return res.status(500).json({ success: false, message: 'Failed to add address.' });
  }
};

export const createOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    const { address_id, new_address, payment_method = 'COD' } = req.body;

    let targetAddressId = address_id;

    // Handle inline new address creation
    if (!targetAddressId && new_address) {
      const { full_name, phone, address_line, city, state, pincode, landmark } = new_address;
      if (!full_name || !phone || !address_line || !city || !state || !pincode) {
        return res.status(400).json({ success: false, message: 'Incomplete delivery address details.' });
      }
      const addrResult = await run(`
        INSERT INTO addresses (user_id, full_name, phone, address_line, city, state, pincode, landmark, is_default)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)
      `, [userId, full_name, phone, address_line, city, state, pincode, landmark || '']);
      targetAddressId = addrResult.lastID;
    }

    if (!targetAddressId) {
      return res.status(400).json({ success: false, message: 'Delivery address is required.' });
    }

    // Get cart items
    const cart = await get('SELECT id FROM carts WHERE user_id = ?', [userId]);
    if (!cart) {
      return res.status(400).json({ success: false, message: 'Cart is empty.' });
    }

    const cartItems = await query(`
      SELECT ci.id as cart_item_id, ci.quantity, p.id as product_id, p.name, p.price, p.quantity as stock_available, p.farmer_id
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.id
      WHERE ci.cart_id = ?
    `, [cart.id]);

    if (!cartItems || cartItems.length === 0) {
      return res.status(400).json({ success: false, message: 'Your cart is empty.' });
    }

    // Stock validation
    for (const item of cartItems) {
      if (item.quantity > item.stock_available) {
        return res.status(400).json({
          success: false,
          message: `Insufficient inventory for product "${item.name}". Only ${item.stock_available} units available.`
        });
      }
    }

    // Subtotal calculation
    let subtotal = 0;
    cartItems.forEach(item => {
      subtotal += item.price * item.quantity;
    });

    const shipping_fee = subtotal > 500 ? 0 : 40;
    const total = subtotal + shipping_fee;

    // Create Order Record
    const orderResult = await run(`
      INSERT INTO orders (user_id, address_id, subtotal, shipping_fee, discount, total, payment_status, order_status)
      VALUES (?, ?, ?, ?, 0, ?, 'paid', 'confirmed')
    `, [userId, targetAddressId, subtotal, shipping_fee, total]);

    const orderId = orderResult.lastID;

    // Insert Order Items & Decrement Inventory Stock & Notify Farmers
    for (const item of cartItems) {
      await run(`
        INSERT INTO order_items (order_id, product_id, farmer_id, quantity, price)
        VALUES (?, ?, ?, ?, ?)
      `, [orderId, item.product_id, item.farmer_id, item.quantity, item.price]);

      // Decrement product stock quantity
      await run(`
        UPDATE products 
        SET quantity = quantity - ?,
            status = CASE WHEN (quantity - ?) <= 0 THEN 'out_of_stock' ELSE status END,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `, [item.quantity, item.quantity, item.product_id]);

      // Notify farmer of new order
      await run(`
        INSERT INTO notifications (user_id, title, message, type)
        VALUES (?, 'New Order Received!', 'Order #' || ? || ' includes ' || ? || ' unit(s) of ' || ?, 'order')
      `, [item.farmer_id, orderId, item.quantity, item.name]);
    }

    // Notify customer
    await run(`
      INSERT INTO notifications (user_id, title, message, type)
      VALUES (?, 'Order Placed Successfully!', 'Your Order #' || ? || ' of ₹' || ? || ' has been confirmed.', 'order')
    `, [userId, orderId, total]);

    // Clear cart items
    await run('DELETE FROM cart_items WHERE cart_id = ?', [cart.id]);

    return res.status(201).json({
      success: true,
      message: 'Order placed successfully!',
      orderId
    });
  } catch (error) {
    console.error('Error placing order:', error);
    return res.status(500).json({ success: false, message: 'Failed to place order.' });
  }
};

export const getCustomerOrders = async (req, res) => {
  try {
    const userId = req.user.id;
    const orders = await query(`
      SELECT o.*, a.full_name as recipient_name, a.city, a.state,
             (SELECT COUNT(*) FROM order_items WHERE order_id = o.id) as item_count
      FROM orders o
      JOIN addresses a ON o.address_id = a.id
      WHERE o.user_id = ?
      ORDER BY o.created_at DESC
    `, [userId]);

    for (let order of orders) {
      order.items = await query(`
        SELECT oi.*, p.name as product_name, u.name as farmer_name, fp.farm_name,
               COALESCE((SELECT image_url FROM product_images WHERE product_id = p.id ORDER BY is_primary DESC LIMIT 1), '/placeholder-product.jpg') as primary_image
        FROM order_items oi
        JOIN products p ON oi.product_id = p.id
        JOIN users u ON oi.farmer_id = u.id
        LEFT JOIN farmer_profiles fp ON u.id = fp.user_id
        WHERE oi.order_id = ?
      `, [order.id]);
    }

    return res.json({ success: true, orders });
  } catch (error) {
    console.error('Error fetching customer orders:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch order history.' });
  }
};

export const getFarmerOrders = async (req, res) => {
  try {
    const farmerId = req.user.id;
    const orders = await query(`
      SELECT DISTINCT o.id, o.order_status, o.payment_status, o.created_at, o.total,
             u.name as customer_name, u.email as customer_email, u.phone as customer_phone,
             a.full_name as address_name, a.address_line, a.city, a.state, a.pincode
      FROM orders o
      JOIN order_items oi ON o.id = oi.order_id
      JOIN users u ON o.user_id = u.id
      JOIN addresses a ON o.address_id = a.id
      WHERE oi.farmer_id = ?
      ORDER BY o.created_at DESC
    `, [farmerId]);

    for (let order of orders) {
      order.items = await query(`
        SELECT oi.*, p.name as product_name, p.unit,
               COALESCE((SELECT image_url FROM product_images WHERE product_id = p.id ORDER BY is_primary DESC LIMIT 1), '/placeholder-product.jpg') as primary_image
        FROM order_items oi
        JOIN products p ON oi.product_id = p.id
        WHERE oi.order_id = ? AND oi.farmer_id = ?
      `, [order.id, farmerId]);

      // Calculate farmer specific total
      order.farmer_subtotal = order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    }

    return res.json({ success: true, orders });
  } catch (error) {
    console.error('Error fetching farmer orders:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch farmer orders.' });
  }
};

export const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const role = req.user.role;

    const order = await get(`
      SELECT o.*, u.name as customer_name, u.email as customer_email, u.phone as customer_phone,
             a.full_name as recipient_name, a.phone as recipient_phone, a.address_line, a.city, a.state, a.pincode, a.landmark
      FROM orders o
      JOIN users u ON o.user_id = u.id
      JOIN addresses a ON o.address_id = a.id
      WHERE o.id = ?
    `, [id]);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    // Access control
    if (role === 'customer' && order.user_id !== userId) {
      return res.status(403).json({ success: false, message: 'Unauthorized to view this order.' });
    }

    const items = await query(`
      SELECT oi.*, p.name as product_name, p.unit, p.location,
             u.name as farmer_name, fp.farm_name, fp.location as farmer_location,
             COALESCE((SELECT image_url FROM product_images WHERE product_id = p.id ORDER BY is_primary DESC LIMIT 1), '/placeholder-product.jpg') as primary_image
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      JOIN users u ON oi.farmer_id = u.id
      LEFT JOIN farmer_profiles fp ON u.id = fp.user_id
      WHERE oi.order_id = ?
    `, [id]);

    return res.json({
      success: true,
      order: {
        ...order,
        items
      }
    });
  } catch (error) {
    console.error('Error fetching order details:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch order details.' });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['pending', 'confirmed', 'preparing', 'shipped', 'out_for_delivery', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status state transition.' });
    }

    const order = await get('SELECT * FROM orders WHERE id = ?', [id]);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    await run('UPDATE orders SET order_status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [status, id]);

    // Send notification to customer
    const readableStatus = status.replace('_', ' ').toUpperCase();
    await run(`
      INSERT INTO notifications (user_id, title, message, type)
      VALUES (?, 'Order Status Update', 'Your Order #' || ? || ' status is now ' || ?, 'order')
    `, [order.user_id, id, readableStatus]);

    return res.json({ success: true, message: `Order status updated to ${readableStatus}.` });
  } catch (error) {
    console.error('Error updating order status:', error);
    return res.status(500).json({ success: false, message: 'Failed to update order status.' });
  }
};

export const cancelOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const role = req.user.role;

    const order = await get('SELECT * FROM orders WHERE id = ?', [id]);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    if (role === 'customer' && order.user_id !== userId) {
      return res.status(403).json({ success: false, message: 'Unauthorized to cancel this order.' });
    }

    if (order.order_status === 'shipped' || order.order_status === 'delivered') {
      return res.status(400).json({ success: false, message: 'Cannot cancel an order that is already shipped or delivered.' });
    }

    await run("UPDATE orders SET order_status = 'cancelled', updated_at = CURRENT_TIMESTAMP WHERE id = ?", [id]);

    // Restore stock inventory
    const items = await query('SELECT * FROM order_items WHERE order_id = ?', [id]);
    for (const item of items) {
      await run('UPDATE products SET quantity = quantity + ?, status = "published" WHERE id = ?', [item.quantity, item.product_id]);
    }

    return res.json({ success: true, message: 'Order cancelled successfully and stock restored.' });
  } catch (error) {
    console.error('Error cancelling order:', error);
    return res.status(500).json({ success: false, message: 'Failed to cancel order.' });
  }
};
