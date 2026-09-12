import app from './app.js';
import { initDB } from './config/database.js';

const PORT = process.env.PORT || 5000;

// Initialize Database and Start Listening
initDB().then(() => {
  app.listen(PORT, () => {
    console.log(`==================================================`);
    console.log(`🌾 Village Mart Server running on http://localhost:${PORT}`);
    console.log(`==================================================`);
  });
});
