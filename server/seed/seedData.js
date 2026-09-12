import bcrypt from 'bcryptjs';
import { run, get, initDB } from '../config/database.js';

const seedDatabase = async () => {
  console.log('--- Starting Village Mart Database Seeding ---');
  await initDB();

  // Check if users table already seeded
  const userCheck = await get('SELECT COUNT(*) as count FROM users');
  if (userCheck && userCheck.count > 0) {
    console.log('Database already contains records. Resetting DB tables for fresh seed...');
    await run('DELETE FROM notifications');
    await run('DELETE FROM wishlist');
    await run('DELETE FROM reviews');
    await run('DELETE FROM order_items');
    await run('DELETE FROM orders');
    await run('DELETE FROM addresses');
    await run('DELETE FROM cart_items');
    await run('DELETE FROM carts');
    await run('DELETE FROM product_images');
    await run('DELETE FROM products');
    await run('DELETE FROM categories');
    await run('DELETE FROM farmer_profiles');
    await run('DELETE FROM users');
    try {
      await run('DELETE FROM sqlite_sequence');
    } catch (e) {
      // sqlite_sequence might not exist if no autoincrement yet
    }
  }

  // 1. Password Hashes
  const adminHash = await bcrypt.hash('admin123', 10);
  const farmerHash = await bcrypt.hash('farmer123', 10);
  const customerHash = await bcrypt.hash('customer123', 10);

  // 2. Users
  const adminRes = await run(
    `INSERT INTO users (name, email, phone, password_hash, role, profile_image) VALUES (?, ?, ?, ?, 'admin', ?)`,
    ['Village Mart Admin', 'admin@villagemart.com', '+91 98765 00000', adminHash, 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80']
  );

  const farmer1Res = await run(
    `INSERT INTO users (name, email, phone, password_hash, role, profile_image) VALUES (?, ?, ?, ?, 'farmer', ?)`,
    ['Ravi Kumar', 'farmer@villagemart.com', '+91 98480 12345', farmerHash, 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80']
  );

  const farmer2Res = await run(
    `INSERT INTO users (name, email, phone, password_hash, role, profile_image) VALUES (?, ?, ?, ?, 'farmer', ?)`,
    ['Suresh Reddy', 'suresh@villagemart.com', '+91 98480 67890', farmerHash, 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80']
  );

  const farmer3Res = await run(
    `INSERT INTO users (name, email, phone, password_hash, role, profile_image) VALUES (?, ?, ?, ?, 'farmer', ?)`,
    ['Anitha Devi', 'anitha@villagemart.com', '+91 98480 11223', farmerHash, 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80']
  );

  const farmer4Res = await run(
    `INSERT INTO users (name, email, phone, password_hash, role, profile_image) VALUES (?, ?, ?, ?, 'farmer', ?)`,
    ['Mahesh Rao', 'mahesh@villagemart.com', '+91 98480 44556', farmerHash, 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&auto=format&fit=crop&q=80']
  );

  const customerRes = await run(
    `INSERT INTO users (name, email, phone, password_hash, role, profile_image) VALUES (?, ?, ?, ?, 'customer', ?)`,
    ['Rahul Sharma', 'customer@villagemart.com', '+91 98765 43210', customerHash, 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&auto=format&fit=crop&q=80']
  );

  const f1Id = farmer1Res.lastID;
  const f2Id = farmer2Res.lastID;
  const f3Id = farmer3Res.lastID;
  const f4Id = farmer4Res.lastID;
  const customerId = customerRes.lastID;

  // 3. Farmer Profiles
  await run(`
    INSERT INTO farmer_profiles (user_id, farm_name, location, description, farming_experience, farming_method, verification_status, rating)
    VALUES (?, 'Green Valley Farms', 'Warangal, Telangana', 'Generational farm cultivating fresh, organic heirloom vegetables without synthetic pesticides.', '15 Years', 'Organic & Natural Farming', 'approved', 4.9)
  `, [f1Id]);

  await run(`
    INSERT INTO farmer_profiles (user_id, farm_name, location, description, farming_experience, farming_method, verification_status, rating)
    VALUES (?, 'Sri Lakshmi Organic Farms', 'Guntur, Andhra Pradesh', 'Specializing in sun-dried chillies, pure turmeric, and premium pulses grown using zero-budget natural farming.', '12 Years', 'Subhash Palekar Natural Farming', 'approved', 4.8)
  `, [f2Id]);

  await run(`
    INSERT INTO farmer_profiles (user_id, farm_name, location, description, farming_experience, farming_method, verification_status, rating)
    VALUES (?, 'Fresh Harvest Farm', 'Kolar, Karnataka', 'Boutique fruit orchard producing delicious, pesticide-free mangoes, bananas, and papaya.', '8 Years', 'Drip-irrigated Eco Farming', 'pending', 4.7)
  `, [f3Id]);

  await run(`
    INSERT INTO farmer_profiles (user_id, farm_name, location, description, farming_experience, farming_method, verification_status, rating)
    VALUES (?, 'Rural Roots Farm', 'Nashik, Maharashtra', 'Pioneering regenerative agriculture with high-grade onions, potatoes, and leafy greens.', '20 Years', 'Regenerative Agriculture', 'approved', 4.9)
  `, [f4Id]);

  // 4. Categories
  const categoriesData = [
    { name: 'Vegetables', slug: 'vegetables', description: 'Farm-fresh, crisp vegetables harvested daily', image: 'https://images.unsplash.com/photo-1566385101042-1a0aa0c1268c?w=600&auto=format&fit=crop&q=80' },
    { name: 'Fruits', slug: 'fruits', description: 'Naturally ripened, sweet, juicy seasonal fruits', image: 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=600&auto=format&fit=crop&q=80' },
    { name: 'Grains', slug: 'grains', description: 'Unpolished grains, premium traditional rice & wheat', image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&auto=format&fit=crop&q=80' },
    { name: 'Pulses', slug: 'pulses', description: 'Protein-rich lentils, chickpeas, and beans', image: 'https://images.unsplash.com/photo-1515543237350-b3eea1ec8082?w=600&auto=format&fit=crop&q=80' },
    { name: 'Dairy', slug: 'dairy', description: 'A2 Aspiration farm milk, pure A2 ghee, and fresh paneer', image: 'https://images.unsplash.com/photo-1528750997573-59b89d66f4f7?w=600&auto=format&fit=crop&q=80' },
    { name: 'Spices', slug: 'spices', description: 'Aromatic, pure, unadulterated spices & herbs', image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=600&auto=format&fit=crop&q=80' },
    { name: 'Leafy Greens', slug: 'leafy-greens', description: 'Hydroponic & organic nutrient-dense greens', image: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=600&auto=format&fit=crop&q=80' },
    { name: 'Organic Products', slug: 'organic-products', description: '100% Certified organic agricultural produce', image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&auto=format&fit=crop&q=80' }
  ];

  const catIdMap = {};
  for (const c of categoriesData) {
    const res = await run(`INSERT INTO categories (name, slug, description, image) VALUES (?, ?, ?, ?)`, [c.name, c.slug, c.description, c.image]);
    catIdMap[c.slug] = res.lastID;
  }

  // 5. Products
  const productsData = [
    {
      farmer_id: f1Id,
      category_id: catIdMap['vegetables'],
      name: 'Farm Fresh Organic Tomatoes',
      description: 'Vine-ripened red tomatoes grown organically in Warangal. Sweet, juicy, and perfect for salads, curries, and gravies.',
      price: 40,
      unit: 'kg',
      quantity: 150,
      harvest_date: '2026-09-07',
      farming_method: '100% Organic compost nurtured',
      organic: 1,
      location: 'Warangal, Telangana',
      images: [
        'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=800&auto=format&fit=crop&q=80'
      ]
    },
    {
      farmer_id: f4Id,
      category_id: catIdMap['vegetables'],
      name: 'Nashik Red Onions',
      description: 'High-quality crunchy Nashik red onions with long shelf life. Rich flavor and intense aroma.',
      price: 35,
      unit: 'kg',
      quantity: 300,
      harvest_date: '2026-09-05',
      farming_method: 'Soil-drip drip irrigation',
      organic: 0,
      location: 'Nashik, Maharashtra',
      images: [
        'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cf?w=800&auto=format&fit=crop&q=80'
      ]
    },
    {
      farmer_id: f4Id,
      category_id: catIdMap['vegetables'],
      name: 'Farm Fresh Potatoes',
      description: 'Clean, firm potatoes harvested directly from earthy Nashik soil. Great for roasting, frying, or boiling.',
      price: 30,
      unit: 'kg',
      quantity: 200,
      harvest_date: '2026-09-06',
      farming_method: 'Traditional Crop Rotation',
      organic: 0,
      location: 'Nashik, Maharashtra',
      images: [
        'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=800&auto=format&fit=crop&q=80'
      ]
    },
    {
      farmer_id: f3Id,
      category_id: catIdMap['fruits'],
      name: 'Kolar Sweet Alphonso Mangoes',
      description: 'Handpicked naturally ripened Alphonso mangoes. Heavenly fragrance and rich creamy pulp.',
      price: 350,
      unit: 'dozen',
      quantity: 50,
      harvest_date: '2026-09-08',
      farming_method: 'Tree-ripened organic orchard',
      organic: 1,
      location: 'Kolar, Karnataka',
      images: [
        'https://images.unsplash.com/photo-1553279768-865429fa0078?w=800&auto=format&fit=crop&q=80'
      ]
    },
    {
      farmer_id: f3Id,
      category_id: catIdMap['fruits'],
      name: 'Fresh Robusta Bananas',
      description: 'Naturally grown nutrient-packed sweet Robusta bananas from Kolar orchards.',
      price: 60,
      unit: 'dozen',
      quantity: 120,
      harvest_date: '2026-09-07',
      farming_method: 'Natural Mulching',
      organic: 1,
      location: 'Kolar, Karnataka',
      images: [
        'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=800&auto=format&fit=crop&q=80'
      ]
    },
    {
      farmer_id: f2Id,
      category_id: catIdMap['grains'],
      name: 'Pure Sona Masoori Unpolished Rice',
      description: 'Aromatic, light weight, low glycemic index Sona Masoori raw rice unpolished to retain natural fiber and vitamins.',
      price: 75,
      unit: 'kg',
      quantity: 500,
      harvest_date: '2026-08-20',
      farming_method: 'Natural Zero Budget Farming',
      organic: 1,
      location: 'Guntur, Andhra Pradesh',
      images: [
        'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800&auto=format&fit=crop&q=80'
      ]
    },
    {
      farmer_id: f2Id,
      category_id: catIdMap['spices'],
      name: 'Guntur Red Chilli Powder',
      description: 'Authentic stone-ground fiery Guntur red chilli powder. Vibrant natural color with distinct pungency.',
      price: 240,
      unit: '500g',
      quantity: 80,
      harvest_date: '2026-08-15',
      farming_method: 'Sun-dried traditional processing',
      organic: 1,
      location: 'Guntur, Andhra Pradesh',
      images: [
        'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=800&auto=format&fit=crop&q=80'
      ]
    },
    {
      farmer_id: f2Id,
      category_id: catIdMap['spices'],
      name: 'Organic Salem Turmeric Powder',
      description: 'High-curcumin (5.5%+) pure turmeric powder cultivated without chemical additives.',
      price: 180,
      unit: '500g',
      quantity: 100,
      harvest_date: '2026-08-10',
      farming_method: 'Organic & Sun Dried',
      organic: 1,
      location: 'Guntur, Andhra Pradesh',
      images: [
        'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=800&auto=format&fit=crop&q=80'
      ]
    },
    {
      farmer_id: f1Id,
      category_id: catIdMap['leafy-greens'],
      name: 'Fresh Organic Baby Spinach (Palak)',
      description: 'Tender, crisp, iron-packed organic spinach bundle harvested early in the morning.',
      price: 25,
      unit: 'bunch',
      quantity: 40,
      harvest_date: '2026-09-09',
      farming_method: 'Hydroponic / Clean Soil',
      organic: 1,
      location: 'Warangal, Telangana',
      images: [
        'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=800&auto=format&fit=crop&q=80'
      ]
    },
    {
      farmer_id: f1Id,
      category_id: catIdMap['dairy'],
      name: 'Pure Gir Cow A2 Bilona Ghee',
      description: 'Traditional Vedic Bilona method curd-churned A2 ghee made from grass-fed Gir cows.',
      price: 1450,
      unit: 'liter',
      quantity: 25,
      harvest_date: '2026-09-01',
      farming_method: 'Free-range Grass-fed Dairy',
      organic: 1,
      location: 'Warangal, Telangana',
      images: [
        'https://images.unsplash.com/photo-1528750997573-59b89d66f4f7?w=800&auto=format&fit=crop&q=80'
      ]
    }
  ];

  const insertedProductIds = [];
  for (const p of productsData) {
    const res = await run(`
      INSERT INTO products (farmer_id, category_id, name, description, price, unit, quantity, harvest_date, farming_method, organic, location, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'published')
    `, [p.farmer_id, p.category_id, p.name, p.description, p.price, p.unit, p.quantity, p.harvest_date, p.farming_method, p.organic, p.location]);

    const prodId = res.lastID;
    insertedProductIds.push(prodId);
    for (let i = 0; i < p.images.length; i++) {
      await run(`INSERT INTO product_images (product_id, image_url, is_primary) VALUES (?, ?, ?)`, [prodId, p.images[i], i === 0 ? 1 : 0]);
    }
  }

  // 6. Cart & Address for Customer
  const cartRes = await run(`INSERT INTO carts (user_id) VALUES (?)`, [customerId]);
  const cartId = cartRes.lastID;

  await run(`
    INSERT INTO cart_items (cart_id, product_id, quantity) VALUES (?, ?, 2)
  `, [cartId, insertedProductIds[0] || 1]);

  const addrRes = await run(`
    INSERT INTO addresses (user_id, full_name, phone, address_line, city, state, pincode, landmark, is_default)
    VALUES (?, 'Rahul Sharma', '+91 98765 43210', 'Plot No 42, Jubilee Hills, Road No 36', 'Hyderabad', 'Telangana', '500033', 'Near Metro Station', 1)
  `, [customerId]);

  // 7. Orders
  const orderRes = await run(`
    INSERT INTO orders (user_id, address_id, subtotal, shipping_fee, discount, total, payment_status, order_status)
    VALUES (?, ?, 380, 0, 0, 380, 'paid', 'delivered')
  `, [customerId, addrRes.lastID]);

  await run(`
    INSERT INTO order_items (order_id, product_id, farmer_id, quantity, price)
    VALUES (?, ?, ?, 2, 40)
  `, [orderRes.lastID, insertedProductIds[0] || 1, f1Id]);

  await run(`
    INSERT INTO order_items (order_id, product_id, farmer_id, quantity, price)
    VALUES (?, ?, ?, 4, 75)
  `, [orderRes.lastID, insertedProductIds[5] || 6, f2Id]);

  // 8. Reviews
  await run(`
    INSERT INTO reviews (user_id, product_id, rating, comment)
    VALUES (?, ?, 5, 'Exceptional fresh tomatoes! Juiciest tomatoes I have purchased in years. Directly from Ravi Farms!')
  `, [customerId, insertedProductIds[0] || 1]);

  await run(`
    INSERT INTO reviews (user_id, product_id, rating, comment)
    VALUES (?, ?, 5, 'Superb quality unpolished rice. Highly fragrant and authentic taste!')
  `, [customerId, insertedProductIds[5] || 6]);

  // 9. Wishlist
  if (insertedProductIds[3]) {
    await run(`INSERT INTO wishlist (user_id, product_id) VALUES (?, ?)`, [customerId, insertedProductIds[3]]);
  }
  if (insertedProductIds[6]) {
    await run(`INSERT INTO wishlist (user_id, product_id) VALUES (?, ?)`, [customerId, insertedProductIds[6]]);
  }

  // 10. Notifications
  await run(`
    INSERT INTO notifications (user_id, title, message, type)
    VALUES (?, 'Welcome to Village Mart!', 'Explore fresh produce delivered directly from local verified farmers.', 'info')
  `, [customerId]);

  await run(`
    INSERT INTO notifications (user_id, title, message, type)
    VALUES (?, 'New Farmer Application', 'Anitha Devi (Fresh Harvest Farm) has applied for farmer verification.', 'system')
  `, [adminRes.lastID]);

  console.log('--- Village Mart Database Seeded Successfully! ---');
  console.log('Demo Credentials:');
  console.log('Admin: admin@villagemart.com / admin123');
  console.log('Farmer: farmer@villagemart.com / farmer123');
  console.log('Customer: customer@villagemart.com / customer123');
};

seedDatabase().catch(err => console.error('Seeding failed:', err));
