import bcrypt from 'bcryptjs';
import { get, run } from '../config/database.js';
import { generateToken } from '../middleware/authMiddleware.js';

export const registerCustomer = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required.' });
    }

    const existingUser = await get('SELECT id FROM users WHERE email = ?', [email]);
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email is already registered.' });
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    const result = await run(
      `INSERT INTO users (name, email, phone, password_hash, role) VALUES (?, ?, ?, ?, 'customer')`,
      [name, email, phone || null, password_hash]
    );

    const user = { id: result.lastID, name, email, role: 'customer' };
    const token = generateToken(user);

    // Create cart for user
    await run(`INSERT INTO carts (user_id) VALUES (?)`, [user.id]);

    return res.status(201).json({
      success: true,
      message: 'Registration successful!',
      token,
      user
    });
  } catch (error) {
    console.error('Customer registration error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error during registration.' });
  }
};

export const registerFarmer = async (req, res) => {
  try {
    const { name, email, phone, password, farm_name, location, description, farming_experience, farming_method } = req.body;
    if (!name || !email || !password || !farm_name || !location) {
      return res.status(400).json({ success: false, message: 'Name, email, password, farm name, and location are required.' });
    }

    const existingUser = await get('SELECT id FROM users WHERE email = ?', [email]);
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email is already registered.' });
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    const userResult = await run(
      `INSERT INTO users (name, email, phone, password_hash, role) VALUES (?, ?, ?, ?, 'farmer')`,
      [name, email, phone || null, password_hash]
    );

    const userId = userResult.lastID;

    await run(
      `INSERT INTO farmer_profiles (user_id, farm_name, location, description, farming_experience, farming_method, verification_status)
       VALUES (?, ?, ?, ?, ?, ?, 'pending')`,
      [userId, farm_name, location, description || '', farming_experience || '', farming_method || 'Organic/Traditional']
    );

    const user = { id: userId, name, email, role: 'farmer', verification_status: 'pending' };
    const token = generateToken(user);

    return res.status(201).json({
      success: true,
      message: 'Farmer registration successful! Account pending admin verification.',
      token,
      user
    });
  } catch (error) {
    console.error('Farmer registration error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error during farmer registration.' });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    const user = await get('SELECT * FROM users WHERE email = ?', [email]);
    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid credentials.' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Invalid credentials.' });
    }

    let farmerProfile = null;
    if (user.role === 'farmer') {
      farmerProfile = await get('SELECT * FROM farmer_profiles WHERE user_id = ?', [user.id]);
    }

    const userPayload = {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      profile_image: user.profile_image,
      farmer_profile: farmerProfile
    };

    const token = generateToken(userPayload);

    return res.json({
      success: true,
      message: 'Login successful!',
      token,
      user: userPayload
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error during login.' });
  }
};

export const getCurrentUser = async (req, res) => {
  try {
    const user = await get('SELECT id, name, email, phone, role, profile_image FROM users WHERE id = ?', [req.user.id]);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    let farmerProfile = null;
    if (user.role === 'farmer') {
      farmerProfile = await get('SELECT * FROM farmer_profiles WHERE user_id = ?', [user.id]);
    }

    return res.json({
      success: true,
      user: {
        ...user,
        farmer_profile: farmerProfile
      }
    });
  } catch (error) {
    console.error('Get current user error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};
