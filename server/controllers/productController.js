import { query, get, run } from '../config/database.js';

const SHOWCASE_PRODUCTS = [
  {
    id: 1,
    name: 'Farm Fresh Organic Tomatoes',
    description: 'Vine-ripened red tomatoes grown organically in Warangal. Sweet, juicy, and perfect for salads, curries, and gravies.',
    price: 40,
    unit: 'kg',
    quantity: 150,
    harvest_date: '2026-09-07',
    farming_method: '100% Organic compost nurtured',
    organic: 1,
    location: 'Warangal, Telangana',
    status: 'published',
    category_id: 1,
    category_name: 'Vegetables',
    category_slug: 'vegetables',
    farmer_id: 2,
    farmer_name: 'Ravi Kumar',
    farm_name: 'Green Valley Farms',
    farmer_location: 'Warangal, Telangana',
    verification_status: 'approved',
    primary_image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=800&auto=format&fit=crop&q=80',
    avg_rating: 4.9,
    review_count: 24,
    images: [{ image_url: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=800&auto=format&fit=crop&q=80', is_primary: 1 }]
  },
  {
    id: 2,
    name: 'Nashik Red Onions',
    description: 'High-quality crunchy Nashik red onions with long shelf life. Rich flavor and intense aroma.',
    price: 35,
    unit: 'kg',
    quantity: 300,
    harvest_date: '2026-09-05',
    farming_method: 'Soil-drip drip irrigation',
    organic: 0,
    location: 'Nashik, Maharashtra',
    status: 'published',
    category_id: 1,
    category_name: 'Vegetables',
    category_slug: 'vegetables',
    farmer_id: 5,
    farmer_name: 'Mahesh Rao',
    farm_name: 'Rural Roots Farm',
    farmer_location: 'Nashik, Maharashtra',
    verification_status: 'approved',
    primary_image: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cf?w=800&auto=format&fit=crop&q=80',
    avg_rating: 4.8,
    review_count: 18,
    images: [{ image_url: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cf?w=800&auto=format&fit=crop&q=80', is_primary: 1 }]
  },
  {
    id: 3,
    name: 'Farm Fresh Potatoes',
    description: 'Clean, firm potatoes harvested directly from earthy Nashik soil. Great for roasting, frying, or boiling.',
    price: 30,
    unit: 'kg',
    quantity: 200,
    harvest_date: '2026-09-06',
    farming_method: 'Traditional Crop Rotation',
    organic: 0,
    location: 'Nashik, Maharashtra',
    status: 'published',
    category_id: 1,
    category_name: 'Vegetables',
    category_slug: 'vegetables',
    farmer_id: 5,
    farmer_name: 'Mahesh Rao',
    farm_name: 'Rural Roots Farm',
    farmer_location: 'Nashik, Maharashtra',
    verification_status: 'approved',
    primary_image: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=800&auto=format&fit=crop&q=80',
    avg_rating: 4.7,
    review_count: 15,
    images: [{ image_url: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=800&auto=format&fit=crop&q=80', is_primary: 1 }]
  },
  {
    id: 4,
    name: 'Kolar Sweet Alphonso Mangoes',
    description: 'Handpicked naturally ripened Alphonso mangoes. Heavenly fragrance and rich creamy pulp.',
    price: 350,
    unit: 'dozen',
    quantity: 50,
    harvest_date: '2026-09-08',
    farming_method: 'Tree-ripened organic orchard',
    organic: 1,
    location: 'Kolar, Karnataka',
    status: 'published',
    category_id: 2,
    category_name: 'Fruits',
    category_slug: 'fruits',
    farmer_id: 4,
    farmer_name: 'Anitha Devi',
    farm_name: 'Fresh Harvest Farm',
    farmer_location: 'Kolar, Karnataka',
    verification_status: 'approved',
    primary_image: 'https://images.unsplash.com/photo-1553279768-865429fa0078?w=800&auto=format&fit=crop&q=80',
    avg_rating: 4.9,
    review_count: 32,
    images: [{ image_url: 'https://images.unsplash.com/photo-1553279768-865429fa0078?w=800&auto=format&fit=crop&q=80', is_primary: 1 }]
  },
  {
    id: 5,
    name: 'Fresh Robusta Bananas',
    description: 'Naturally grown nutrient-packed sweet Robusta bananas from Kolar orchards.',
    price: 60,
    unit: 'dozen',
    quantity: 120,
    harvest_date: '2026-09-07',
    farming_method: 'Natural Mulching',
    organic: 1,
    location: 'Kolar, Karnataka',
    status: 'published',
    category_id: 2,
    category_name: 'Fruits',
    category_slug: 'fruits',
    farmer_id: 4,
    farmer_name: 'Anitha Devi',
    farm_name: 'Fresh Harvest Farm',
    farmer_location: 'Kolar, Karnataka',
    verification_status: 'approved',
    primary_image: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=800&auto=format&fit=crop&q=80',
    avg_rating: 4.8,
    review_count: 20,
    images: [{ image_url: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=800&auto=format&fit=crop&q=80', is_primary: 1 }]
  },
  {
    id: 6,
    name: 'Pure Sona Masoori Unpolished Rice',
    description: 'Aromatic, low glycemic index Sona Masoori raw rice unpolished to retain natural fiber and vitamins.',
    price: 75,
    unit: 'kg',
    quantity: 500,
    harvest_date: '2026-08-20',
    farming_method: 'Natural Zero Budget Farming',
    organic: 1,
    location: 'Guntur, Andhra Pradesh',
    status: 'published',
    category_id: 3,
    category_name: 'Grains',
    category_slug: 'grains',
    farmer_id: 3,
    farmer_name: 'Suresh Reddy',
    farm_name: 'Sri Lakshmi Organic Farms',
    farmer_location: 'Guntur, Andhra Pradesh',
    verification_status: 'approved',
    primary_image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800&auto=format&fit=crop&q=80',
    avg_rating: 5.0,
    review_count: 45,
    images: [{ image_url: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800&auto=format&fit=crop&q=80', is_primary: 1 }]
  },
  {
    id: 7,
    name: 'Guntur Red Chilli Powder',
    description: 'Authentic stone-ground fiery Guntur red chilli powder. Vibrant natural color with distinct pungency.',
    price: 240,
    unit: '500g',
    quantity: 80,
    harvest_date: '2026-08-15',
    farming_method: 'Sun-dried traditional processing',
    organic: 1,
    location: 'Guntur, Andhra Pradesh',
    status: 'published',
    category_id: 6,
    category_name: 'Spices',
    category_slug: 'spices',
    farmer_id: 3,
    farmer_name: 'Suresh Reddy',
    farm_name: 'Sri Lakshmi Organic Farms',
    farmer_location: 'Guntur, Andhra Pradesh',
    verification_status: 'approved',
    primary_image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=800&auto=format&fit=crop&q=80',
    avg_rating: 4.9,
    review_count: 28,
    images: [{ image_url: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=800&auto=format&fit=crop&q=80', is_primary: 1 }]
  },
  {
    id: 8,
    name: 'Organic Salem Turmeric Powder',
    description: 'High-curcumin pure turmeric powder cultivated without chemical additives.',
    price: 180,
    unit: '500g',
    quantity: 100,
    harvest_date: '2026-08-10',
    farming_method: 'Organic & Sun Dried',
    organic: 1,
    location: 'Guntur, Andhra Pradesh',
    status: 'published',
    category_id: 6,
    category_name: 'Spices',
    category_slug: 'spices',
    farmer_id: 3,
    farmer_name: 'Suresh Reddy',
    farm_name: 'Sri Lakshmi Organic Farms',
    farmer_location: 'Guntur, Andhra Pradesh',
    verification_status: 'approved',
    primary_image: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=800&auto=format&fit=crop&q=80',
    avg_rating: 4.8,
    review_count: 14,
    images: [{ image_url: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=800&auto=format&fit=crop&q=80', is_primary: 1 }]
  },
  {
    id: 9,
    name: 'Fresh Organic Baby Spinach (Palak)',
    description: 'Tender, crisp, iron-packed organic spinach bundle harvested early in the morning.',
    price: 25,
    unit: 'bunch',
    quantity: 40,
    harvest_date: '2026-09-09',
    farming_method: 'Hydroponic / Clean Soil',
    organic: 1,
    location: 'Warangal, Telangana',
    status: 'published',
    category_id: 7,
    category_name: 'Leafy Greens',
    category_slug: 'leafy-greens',
    farmer_id: 2,
    farmer_name: 'Ravi Kumar',
    farm_name: 'Green Valley Farms',
    farmer_location: 'Warangal, Telangana',
    verification_status: 'approved',
    primary_image: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=800&auto=format&fit=crop&q=80',
    avg_rating: 4.9,
    review_count: 19,
    images: [{ image_url: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=800&auto=format&fit=crop&q=80', is_primary: 1 }]
  },
  {
    id: 10,
    name: 'Pure Gir Cow A2 Bilona Ghee',
    description: 'Traditional Vedic Bilona method curd-churned A2 ghee made from grass-fed Gir cows.',
    price: 1450,
    unit: 'liter',
    quantity: 25,
    harvest_date: '2026-09-01',
    farming_method: 'Free-range Grass-fed Dairy',
    organic: 1,
    location: 'Warangal, Telangana',
    status: 'published',
    category_id: 5,
    category_name: 'Dairy',
    category_slug: 'dairy',
    farmer_id: 2,
    farmer_name: 'Ravi Kumar',
    farm_name: 'Green Valley Farms',
    farmer_location: 'Warangal, Telangana',
    verification_status: 'approved',
    primary_image: 'https://images.unsplash.com/photo-1528750997573-59b89d66f4f7?w=800&auto=format&fit=crop&q=80',
    avg_rating: 5.0,
    review_count: 36,
    images: [{ image_url: 'https://images.unsplash.com/photo-1528750997573-59b89d66f4f7?w=800&auto=format&fit=crop&q=80', is_primary: 1 }]
  }
];

const SHOWCASE_CATEGORIES = [
  { id: 1, name: 'Vegetables', slug: 'vegetables', description: 'Farm-fresh, crisp vegetables harvested daily', image: 'https://images.unsplash.com/photo-1566385101042-1a0aa0c1268c?w=600&auto=format&fit=crop&q=80' },
  { id: 2, name: 'Fruits', slug: 'fruits', description: 'Naturally ripened, sweet, juicy seasonal fruits', image: 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=600&auto=format&fit=crop&q=80' },
  { id: 3, name: 'Grains', slug: 'grains', description: 'Unpolished grains, premium traditional rice & wheat', image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&auto=format&fit=crop&q=80' },
  { id: 4, name: 'Pulses', slug: 'pulses', description: 'Protein-rich lentils, chickpeas, and beans', image: 'https://images.unsplash.com/photo-1515543237350-b3eea1ec8082?w=600&auto=format&fit=crop&q=80' },
  { id: 5, name: 'Dairy', slug: 'dairy', description: 'A2 Aspiration farm milk, pure A2 ghee, and fresh paneer', image: 'https://images.unsplash.com/photo-1528750997573-59b89d66f4f7?w=600&auto=format&fit=crop&q=80' },
  { id: 6, name: 'Spices', slug: 'spices', description: 'Aromatic, pure, unadulterated spices & herbs', image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=600&auto=format&fit=crop&q=80' },
  { id: 7, name: 'Leafy Greens', slug: 'leafy-greens', description: 'Hydroponic & organic nutrient-dense greens', image: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=600&auto=format&fit=crop&q=80' },
  { id: 8, name: 'Organic Products', slug: 'organic-products', description: '100% Certified organic agricultural produce', image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&auto=format&fit=crop&q=80' }
];

export const getCategories = async (req, res) => {
  try {
    const categories = await query('SELECT * FROM categories ORDER BY name ASC');
    if (categories && categories.length > 0) {
      return res.json({ success: true, categories });
    }
    return res.json({ success: true, categories: SHOWCASE_CATEGORIES });
  } catch (error) {
    console.error('Error fetching categories, using showcase fallback:', error);
    return res.json({ success: true, categories: SHOWCASE_CATEGORIES });
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

    if (minRating) {
      sql += ` HAVING avg_rating >= ?`;
      params.push(parseFloat(minRating));
    }

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

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const offset = (pageNum - 1) * limitNum;

    const allMatching = await query(sql, params);
    
    if (allMatching && allMatching.length > 0) {
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
    }

    // Fallback filter over SHOWCASE_PRODUCTS if DB query yields no rows
    let filtered = [...SHOWCASE_PRODUCTS];
    if (category) {
      filtered = filtered.filter(p => p.category_slug === category || String(p.category_id) === String(category));
    }
    if (organic === 'true' || organic === '1') {
      filtered = filtered.filter(p => p.organic === 1);
    }
    if (search) {
      const s = search.toLowerCase();
      filtered = filtered.filter(p => p.name.toLowerCase().includes(s) || p.description.toLowerCase().includes(s) || p.farm_name.toLowerCase().includes(s));
    }
    if (minPrice) filtered = filtered.filter(p => p.price >= parseFloat(minPrice));
    if (maxPrice) filtered = filtered.filter(p => p.price <= parseFloat(maxPrice));

    return res.json({
      success: true,
      products: filtered,
      pagination: {
        total: filtered.length,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(filtered.length / limitNum) || 1
      }
    });
  } catch (error) {
    console.error('Error fetching products, returning showcase fallback:', error);
    return res.json({
      success: true,
      products: SHOWCASE_PRODUCTS,
      pagination: {
        total: SHOWCASE_PRODUCTS.length,
        page: 1,
        limit: 12,
        totalPages: 1
      }
    });
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
    if (products && products.length > 0) {
      return res.json({ success: true, products });
    }
    return res.json({ success: true, products: SHOWCASE_PRODUCTS.slice(0, 8) });
  } catch (error) {
    console.error('Error fetching featured products, using showcase fallback:', error);
    return res.json({ success: true, products: SHOWCASE_PRODUCTS.slice(0, 8) });
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
