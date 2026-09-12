import { query, get, run } from '../config/database.js';

export const getCategories = async (req, res) => {
  try {
    const categories = await query('SELECT * FROM categories ORDER BY name ASC');
    return res.json({ success: true, categories });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch categories.' });
  }
};

export const getProducts = async (req, res) => {
  try {
    const {
      search,
      category,
      minPrice,
      maxPrice,
      minRating,
      farmerId,
      location,
      organic,
      status = 'published',
      sortBy = 'newest',
      page = 1,
      limit = 12
    } = req.query;

    let sql = `
      SELECT p.*, 
             c.name as category_name, c.slug as category_slug,
             u.name as farmer_name, fp.farm_name, fp.location as farmer_location, fp.verification_status,
             COALESCE((SELECT image_url FROM product_images WHERE product_id = p.id ORDER BY is_primary DESC, id ASC LIMIT 1), '/placeholder-product.jpg') as primary_image,
             COALESCE((SELECT AVG(rating) FROM reviews WHERE product_id = p.id), 0.0) as avg_rating,
             COALESCE((SELECT COUNT(*) FROM reviews WHERE product_id = p.id), 0) as review_count
      FROM products p
      JOIN categories c ON p.category_id = c.id
      JOIN users u ON p.farmer_id = u.id
      LEFT JOIN farmer_profiles fp ON u.id = fp.user_id
      WHERE 1=1
    `;

    const params = [];

    if (status && status !== 'all') {
      sql += ` AND p.status = ?`;
      params.push(status);
    }

    if (search) {
      sql += ` AND (p.name LIKE ? OR p.description LIKE ? OR fp.farm_name LIKE ? OR u.name LIKE ? OR p.location LIKE ?)`;
      const searchParam = `%${search}%`;
      params.push(searchParam, searchParam, searchParam, searchParam, searchParam);
    }

    if (category) {
      if (isNaN(category)) {
        sql += ` AND c.slug = ?`;
        params.push(category);
      } else {
        sql += ` AND p.category_id = ?`;
        params.push(category);
      }
    }

    if (minPrice) {
      sql += ` AND p.price >= ?`;
      params.push(parseFloat(minPrice));
    }

    if (maxPrice) {
      sql += ` AND p.price <= ?`;
      params.push(parseFloat(maxPrice));
    }

    if (farmerId) {
      sql += ` AND p.farmer_id = ?`;
      params.push(farmerId);
    }

    if (location) {
      sql += ` AND (p.location LIKE ? OR fp.location LIKE ?)`;
      params.push(`%${location}%`, `%${location}%`);
    }

    if (organic === 'true' || organic === '1') {
      sql += ` AND p.organic = 1`;
    }

    sql += ` GROUP BY p.id`;

    // HAVING for minRating if filter applied
    if (minRating) {
      sql += ` HAVING avg_rating >= ?`;
      params.push(parseFloat(minRating));
    }

    // Sort order
    switch (sortBy) {
      case 'price_asc':
        sql += ` ORDER BY p.price ASC`;
        break;
      case 'price_desc':
        sql += ` ORDER BY p.price DESC`;
        break;
      case 'rating':
        sql += ` ORDER BY avg_rating DESC, review_count DESC`;
        break;
      case 'popular':
        sql += ` ORDER BY review_count DESC, avg_rating DESC`;
        break;
      case 'newest':
      default:
        sql += ` ORDER BY p.created_at DESC`;
        break;
    }

    // Pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const offset = (pageNum - 1) * limitNum;

    // Fetch total count before pagination limit
    const allMatching = await query(sql, params);
    const total = allMatching.length;

    const paginatedSql = sql + ` LIMIT ? OFFSET ?`;
    const paginatedParams = [...params, limitNum, offset];

    const products = await query(paginatedSql, paginatedParams);

    return res.json({
      success: true,
      products,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch products.' });
  }
};

export const getFeaturedProducts = async (req, res) => {
  try {
    const sql = `
      SELECT p.*, 
             c.name as category_name, c.slug as category_slug,
             u.name as farmer_name, fp.farm_name, fp.location as farmer_location, fp.verification_status,
             COALESCE((SELECT image_url FROM product_images WHERE product_id = p.id ORDER BY is_primary DESC, id ASC LIMIT 1), '/placeholder-product.jpg') as primary_image,
             COALESCE((SELECT AVG(rating) FROM reviews WHERE product_id = p.id), 5.0) as avg_rating,
             COALESCE((SELECT COUNT(*) FROM reviews WHERE product_id = p.id), 0) as review_count
      FROM products p
      JOIN categories c ON p.category_id = c.id
      JOIN users u ON p.farmer_id = u.id
      LEFT JOIN farmer_profiles fp ON u.id = fp.user_id
      WHERE p.status = 'published'
      ORDER BY p.created_at DESC
      LIMIT 8
    `;
    const products = await query(sql);
    return res.json({ success: true, products });
  } catch (error) {
    console.error('Error fetching featured products:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch featured products.' });
  }
};

export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const sql = `
      SELECT p.*, 
             c.name as category_name, c.slug as category_slug,
             u.name as farmer_name, u.email as farmer_email, u.phone as farmer_phone,
             fp.farm_name, fp.location as farmer_location, fp.description as farmer_bio, 
             fp.farming_experience, fp.farming_method as farmer_method, fp.verification_status, fp.rating as farmer_rating,
             COALESCE((SELECT AVG(rating) FROM reviews WHERE product_id = p.id), 0.0) as avg_rating,
             COALESCE((SELECT COUNT(*) FROM reviews WHERE product_id = p.id), 0) as review_count
      FROM products p
      JOIN categories c ON p.category_id = c.id
      JOIN users u ON p.farmer_id = u.id
      LEFT JOIN farmer_profiles fp ON u.id = fp.user_id
      WHERE p.id = ?
    `;
    const product = await get(sql, [id]);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    // Get images
    const images = await query('SELECT * FROM product_images WHERE product_id = ? ORDER BY is_primary DESC, id ASC', [id]);

    // Get reviews
    const reviews = await query(`
      SELECT r.*, u.name as user_name, u.profile_image as user_avatar
      FROM reviews r
      JOIN users u ON r.user_id = u.id
      WHERE r.product_id = ?
      ORDER BY r.created_at DESC
    `, [id]);

    // Related products (same category)
    const relatedProducts = await query(`
      SELECT p.*, c.name as category_name,
             COALESCE((SELECT image_url FROM product_images WHERE product_id = p.id ORDER BY is_primary DESC LIMIT 1), '/placeholder-product.jpg') as primary_image,
             COALESCE((SELECT AVG(rating) FROM reviews WHERE product_id = p.id), 5.0) as avg_rating
      FROM products p
      JOIN categories c ON p.category_id = c.id
      WHERE p.category_id = ? AND p.id != ? AND p.status = 'published'
      LIMIT 4
    `, [product.category_id, id]);

    return res.json({
      success: true,
      product: {
        ...product,
        images: images.length > 0 ? images : [{ image_url: '/placeholder-product.jpg', is_primary: 1 }],
        reviews,
        relatedProducts
      }
    });
  } catch (error) {
    console.error('Error fetching product details:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch product details.' });
  }
};

export const createProduct = async (req, res) => {
  try {
    const farmer_id = req.user.id;
    const {
      name,
      category_id,
      description,
      price,
      unit,
      quantity,
      harvest_date,
      farming_method,
      organic,
      location,
      status = 'published',
      min_order_qty = 1,
      image_urls
    } = req.body;

    if (!name || !category_id || !price || !unit || quantity === undefined || !location) {
      return res.status(400).json({ success: false, message: 'Required product fields missing.' });
    }

    const result = await run(`
      INSERT INTO products (farmer_id, category_id, name, description, price, unit, quantity, harvest_date, farming_method, organic, location, status, min_order_qty)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      farmer_id,
      category_id,
      name,
      description || '',
      parseFloat(price),
      unit,
      parseInt(quantity),
      harvest_date || null,
      farming_method || '',
      organic ? 1 : 0,
      location,
      status,
      parseInt(min_order_qty)
    ]);

    const productId = result.lastID;

    // Handle uploaded file images from multer if any
    if (req.files && req.files.length > 0) {
      for (let i = 0; i < req.files.length; i++) {
        const file = req.files[i];
        const imageUrl = `/uploads/${file.filename}`;
        await run(`INSERT INTO product_images (product_id, image_url, is_primary) VALUES (?, ?, ?)`, [productId, imageUrl, i === 0 ? 1 : 0]);
      }
    } else if (image_urls && Array.isArray(image_urls)) {
      for (let i = 0; i < image_urls.length; i++) {
        await run(`INSERT INTO product_images (product_id, image_url, is_primary) VALUES (?, ?, ?)`, [productId, image_urls[i], i === 0 ? 1 : 0]);
      }
    } else if (typeof image_urls === 'string' && image_urls.trim()) {
      await run(`INSERT INTO product_images (product_id, image_url, is_primary) VALUES (?, ?, 1)`, [productId, image_urls.trim()]);
    } else {
      // Default placeholder image
      await run(`INSERT INTO product_images (product_id, image_url, is_primary) VALUES (?, ?, 1)`, [productId, 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=800&auto=format&fit=crop&q=80']);
    }

    return res.status(201).json({
      success: true,
      message: 'Product created successfully!',
      productId
    });
  } catch (error) {
    console.error('Error creating product:', error);
    return res.status(500).json({ success: false, message: 'Failed to create product.' });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const farmer_id = req.user.id;

    // Verify ownership or admin role
    const product = await get('SELECT * FROM products WHERE id = ?', [id]);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    if (product.farmer_id !== farmer_id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized to update this product.' });
    }

    const {
      name,
      category_id,
      description,
      price,
      unit,
      quantity,
      harvest_date,
      farming_method,
      organic,
      location,
      status,
      min_order_qty
    } = req.body;

    await run(`
      UPDATE products 
      SET name = COALESCE(?, name),
          category_id = COALESCE(?, category_id),
          description = COALESCE(?, description),
          price = COALESCE(?, price),
          unit = COALESCE(?, unit),
          quantity = COALESCE(?, quantity),
          harvest_date = COALESCE(?, harvest_date),
          farming_method = COALESCE(?, farming_method),
          organic = COALESCE(?, organic),
          location = COALESCE(?, location),
          status = COALESCE(?, status),
          min_order_qty = COALESCE(?, min_order_qty),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [
      name, category_id, description, price, unit, quantity,
      harvest_date, farming_method, organic !== undefined ? (organic ? 1 : 0) : undefined,
      location, status, min_order_qty, id
    ]);

    // Add new file uploads if present
    if (req.files && req.files.length > 0) {
      for (let i = 0; i < req.files.length; i++) {
        const file = req.files[i];
        const imageUrl = `/uploads/${file.filename}`;
        await run(`INSERT INTO product_images (product_id, image_url, is_primary) VALUES (?, ?, 0)`, [id, imageUrl]);
      }
    }

    return res.json({ success: true, message: 'Product updated successfully.' });
  } catch (error) {
    console.error('Error updating product:', error);
    return res.status(500).json({ success: false, message: 'Failed to update product.' });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await get('SELECT * FROM products WHERE id = ?', [id]);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    if (product.farmer_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized to delete this product.' });
    }

    await run('DELETE FROM products WHERE id = ?', [id]);
    return res.json({ success: true, message: 'Product deleted successfully.' });
  } catch (error) {
    console.error('Error deleting product:', error);
    return res.status(500).json({ success: false, message: 'Failed to delete product.' });
  }
};
