import app from '../server/app.js';
import { initDB } from '../server/config/database.js';

let dbInitialized = false;

export default async function handler(req, res) {
  if (!dbInitialized) {
    try {
      await initDB();
      dbInitialized = true;
    } catch (e) {
      console.error('Failed to initialize database in Vercel function:', e);
    }
  }
  return app(req, res);
}
