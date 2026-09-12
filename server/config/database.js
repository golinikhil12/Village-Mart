import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// On Vercel serverless environment, filesystem is read-only except /tmp
const isVercel = process.env.VERCEL === '1' || process.env.VERCEL === 'true' || Boolean(process.env.VERCEL);
let dbPath = path.resolve(__dirname, '../villagemart.db');

if (isVercel) {
  const tmpDbPath = '/tmp/villagemart.db';
  if (!fs.existsSync(tmpDbPath)) {
    if (fs.existsSync(dbPath)) {
      try {
        fs.copyFileSync(dbPath, tmpDbPath);
        console.log('Copied existing SQLite db to /tmp/villagemart.db');
      } catch (err) {
        console.error('Failed to copy db to /tmp:', err);
      }
    }
  }
  dbPath = tmpDbPath;
}

// Ensure database directory exists
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

sqlite3.verbose();
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening SQLite database:', err.message);
  } else {
    console.log('Connected to SQLite database at:', dbPath);
  }
});

// Enable Foreign Keys
db.run('PRAGMA foreign_keys = ON');

// Promisified DB helpers
export const query = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

export const get = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

export const run = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
};

// Initialize Table Schemas
export const initDB = async () => {
  try {
    await run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        phone TEXT,
        password_hash TEXT NOT NULL,
        role TEXT NOT NULL CHECK(role IN ('customer', 'farmer', 'admin')),
        profile_image TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await run(`
      CREATE TABLE IF NOT EXISTS farmer_profiles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER UNIQUE NOT NULL,
        farm_name TEXT NOT NULL,
        location TEXT NOT NULL,
        description TEXT,
        farming_experience TEXT,
        farming_method TEXT,
        verification_status TEXT DEFAULT 'pending' CHECK(verification_status IN ('pending', 'approved', 'rejected')),
        rating REAL DEFAULT 0.0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    await run(`
      CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE NOT NULL,
        slug TEXT UNIQUE NOT NULL,
        description TEXT,
        image TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await run(`
      CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        farmer_id INTEGER NOT NULL,
        category_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        description TEXT,
        price REAL NOT NULL,
        unit TEXT NOT NULL,
        quantity INTEGER NOT NULL DEFAULT 0,
        harvest_date TEXT,
        farming_method TEXT,
        organic INTEGER DEFAULT 0,
        location TEXT NOT NULL,
        status TEXT DEFAULT 'published' CHECK(status IN ('draft', 'published', 'out_of_stock')),
        min_order_qty INTEGER DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (farmer_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
      )
    `);

    await run(`
      CREATE TABLE IF NOT EXISTS product_images (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        product_id INTEGER NOT NULL,
        image_url TEXT NOT NULL,
        is_primary INTEGER DEFAULT 0,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
      )
    `);

    await run(`
      CREATE TABLE IF NOT EXISTS carts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER UNIQUE NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    await run(`
      CREATE TABLE IF NOT EXISTS cart_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        cart_id INTEGER NOT NULL,
        product_id INTEGER NOT NULL,
        quantity INTEGER NOT NULL DEFAULT 1,
        FOREIGN KEY (cart_id) REFERENCES carts(id) ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
      )
    `);

    await run(`
      CREATE TABLE IF NOT EXISTS addresses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        full_name TEXT NOT NULL,
        phone TEXT NOT NULL,
        address_line TEXT NOT NULL,
        city TEXT NOT NULL,
        state TEXT NOT NULL,
        pincode TEXT NOT NULL,
        landmark TEXT,
        is_default INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    await run(`
      CREATE TABLE IF NOT EXISTS orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        address_id INTEGER NOT NULL,
        subtotal REAL NOT NULL,
        shipping_fee REAL DEFAULT 0,
        discount REAL DEFAULT 0,
        total REAL NOT NULL,
        payment_status TEXT DEFAULT 'pending' CHECK(payment_status IN ('pending', 'paid')),
        order_status TEXT DEFAULT 'pending' CHECK(order_status IN ('pending', 'confirmed', 'preparing', 'shipped', 'out_for_delivery', 'delivered', 'cancelled')),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (address_id) REFERENCES addresses(id) ON DELETE CASCADE
      )
    `);

    await run(`
      CREATE TABLE IF NOT EXISTS order_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_id INTEGER NOT NULL,
        product_id INTEGER NOT NULL,
        farmer_id INTEGER NOT NULL,
        quantity INTEGER NOT NULL,
        price REAL NOT NULL,
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
        FOREIGN KEY (farmer_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    await run(`
      CREATE TABLE IF NOT EXISTS reviews (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        product_id INTEGER NOT NULL,
        rating INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 5),
        comment TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
      )
    `);

    await run(`
      CREATE TABLE IF NOT EXISTS wishlist (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        product_id INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
        UNIQUE(user_id, product_id)
      )
    `);

    await run(`
      CREATE TABLE IF NOT EXISTS notifications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        message TEXT NOT NULL,
        type TEXT DEFAULT 'info',
        is_read INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    console.log('Database tables initialized successfully.');

    // Auto-seed default accounts if empty
    await autoSeedIfEmpty();
  } catch (error) {
    console.error('Failed to initialize database tables:', error);
  }
};

const autoSeedIfEmpty = async () => {
  try {
    const userCount = await get('SELECT COUNT(*) as count FROM users');
    if (!userCount || userCount.count === 0) {
      console.log('Seeding initial demo accounts and categories...');
      const adminHash = await bcrypt.hash('admin123', 10);
      const farmerHash = await bcrypt.hash('farmer123', 10);
      const customerHash = await bcrypt.hash('customer123', 10);

      const adminRes = await run(
        `INSERT INTO users (name, email, phone, password_hash, role) VALUES (?, ?, ?, ?, 'admin')`,
        ['Village Mart Admin', 'admin@villagemart.com', '+91 98765 00000', adminHash]
      );

      const farmerRes = await run(
        `INSERT INTO users (name, email, phone, password_hash, role) VALUES (?, ?, ?, ?, 'farmer')`,
        ['Ravi Kumar', 'farmer@villagemart.com', '+91 98480 12345', farmerHash]
      );

      const customerRes = await run(
        `INSERT INTO users (name, email, phone, password_hash, role) VALUES (?, ?, ?, ?, 'customer')`,
        ['Rahul Sharma', 'customer@villagemart.com', '+91 98765 43210', customerHash]
      );

      await run(`
        INSERT INTO farmer_profiles (user_id, farm_name, location, description, farming_experience, farming_method, verification_status, rating)
        VALUES (?, 'Green Valley Farms', 'Warangal, Telangana', 'Generational farm cultivating fresh organic vegetables.', '15 Years', 'Organic & Natural Farming', 'approved', 4.9)
      `, [farmerRes.lastID]);

      await run(`INSERT INTO carts (user_id) VALUES (?)`, [customerRes.lastID]);

      const categoriesData = [
        { name: 'Vegetables', slug: 'vegetables', description: 'Farm-fresh, crisp vegetables harvested daily', image: 'https://images.unsplash.com/photo-1566385101042-1a0aa0c1268c?w=600&auto=format&fit=crop&q=80' },
        { name: 'Fruits', slug: 'fruits', description: 'Naturally ripened, sweet, juicy seasonal fruits', image: 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=600&auto=format&fit=crop&q=80' },
        { name: 'Grains', slug: 'grains', description: 'Unpolished grains, premium traditional rice & wheat', image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&auto=format&fit=crop&q=80' },
        { name: 'Pulses', slug: 'pulses', description: 'Protein-rich lentils, chickpeas, and beans', image: 'https://images.unsplash.com/photo-1515543237350-b3eea1ec8082?w=600&auto=format&fit=crop&q=80' }
      ];

      const catIdMap = {};
      for (const c of categoriesData) {
        const catRes = await run(`INSERT OR IGNORE INTO categories (name, slug, description, image) VALUES (?, ?, ?, ?)`, [c.name, c.slug, c.description, c.image]);
        const existingCat = await get('SELECT id FROM categories WHERE slug = ?', [c.slug]);
        if (existingCat) catIdMap[c.slug] = existingCat.id;
      }

      // Seed initial products if products table is empty
      const prodCount = await get('SELECT COUNT(*) as count FROM products');
      if (!prodCount || prodCount.count === 0) {
        const defaultProducts = [
          {
            farmer_id: farmerRes.lastID,
            category_id: catIdMap['vegetables'] || 1,
            name: 'Farm Fresh Organic Tomatoes',
            description: 'Vine-ripened red tomatoes grown organically in Warangal. Sweet, juicy, and perfect for salads, curries, and gravies.',
            price: 40,
            unit: 'kg',
            quantity: 150,
            harvest_date: '2026-09-07',
            farming_method: '100% Organic compost nurtured',
            organic: 1,
            location: 'Warangal, Telangana',
            image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=800&auto=format&fit=crop&q=80'
          },
          {
            farmer_id: farmerRes.lastID,
            category_id: catIdMap['fruits'] || 2,
            name: 'Fresh Robusta Bananas',
            description: 'Naturally grown nutrient-packed sweet Robusta bananas.',
            price: 60,
            unit: 'dozen',
            quantity: 120,
            harvest_date: '2026-09-07',
            farming_method: 'Natural Mulching',
            organic: 1,
            location: 'Warangal, Telangana',
            image: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=800&auto=format&fit=crop&q=80'
          },
          {
            farmer_id: farmerRes.lastID,
            category_id: catIdMap['grains'] || 3,
            name: 'Pure Sona Masoori Unpolished Rice',
            description: 'Aromatic, low glycemic index Sona Masoori raw rice unpolished to retain natural vitamins.',
            price: 75,
            unit: 'kg',
            quantity: 500,
            harvest_date: '2026-08-20',
            farming_method: 'Natural Zero Budget Farming',
            organic: 1,
            location: 'Warangal, Telangana',
            image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800&auto=format&fit=crop&q=80'
          }
        ];

        for (const p of defaultProducts) {
          const res = await run(`
            INSERT INTO products (farmer_id, category_id, name, description, price, unit, quantity, harvest_date, farming_method, organic, location, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'published')
          `, [p.farmer_id, p.category_id, p.name, p.description, p.price, p.unit, p.quantity, p.harvest_date, p.farming_method, p.organic, p.location]);
          await run(`INSERT INTO product_images (product_id, image_url, is_primary) VALUES (?, ?, 1)`, [res.lastID, p.image]);
        }
      }

      console.log('Auto-seeding complete.');
    }
  } catch (err) {
    console.error('Auto seed failed:', err.message);
  }
};

export default db;
