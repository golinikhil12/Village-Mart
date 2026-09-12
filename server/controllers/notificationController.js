import { query, run } from '../config/database.js';

export const getNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const notifications = await query(`
      SELECT * FROM notifications 
      WHERE user_id = ? 
      ORDER BY created_at DESC 
      LIMIT 20
    `, [userId]);

    return res.json({ success: true, notifications });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch notifications.' });
  }
};

export const markNotificationRead = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    if (id === 'all') {
      await run('UPDATE notifications SET is_read = 1 WHERE user_id = ?', [userId]);
    } else {
      await run('UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?', [id, userId]);
    }

    return res.json({ success: true, message: 'Notification(s) marked as read.' });
  } catch (error) {
    console.error('Error marking notification read:', error);
    return res.status(500).json({ success: false, message: 'Failed to update notification.' });
  }
};
