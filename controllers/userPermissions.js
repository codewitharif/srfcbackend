const db = require('../config/db');

exports.getByUser = async (req, res) => { 
  try { 
    const { user_id } = req.params; 
    const rows = await db.query('SELECT * FROM user_permissions WHERE user_id = ?', [user_id]); 
    res.json(rows); 
  } catch (err) { 
    res.status(500).json({ error: err.message }); 
  } 
};

exports.setPermissions = async (req, res) => { 
  try { 
    const { user_id, permissions } = req.body; // permissions: array of permission objects
    // Simple approach: delete existing and insert provided
    await db.query('DELETE FROM user_permissions WHERE user_id = ?', [user_id]);
    for (const p of permissions) { 
      const cols = ['user_id', 'permission_name', 'resource_type', 'can_create', 'can_read', 'can_update', 'can_delete']; 
      const vals = [user_id, p.permission_name, p.resource_type, !!p.can_create, !!p.can_read, !!p.can_update, !!p.can_delete]; 
      await db.query(`INSERT INTO user_permissions (${cols.join(',')}) VALUES (?, ?, ?, ?, ?, ?, ?)`, vals); 
    }
    res.status(200).json({ success: true }); 
  } catch(err) { 
    res.status(500).json({ error: err.message }); 
  } 
};
