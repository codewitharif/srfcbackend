const db = require('../config/db');

exports.getAll = async (req, res) => {
  try {
    const { mobile_number } = req.query;
    let query = 'SELECT * FROM customers';
    const params = [];

    if (mobile_number) {
      query += ' WHERE mobile_number = ?';
      params.push(mobile_number);
    } else {
      query += ' ORDER BY created_at DESC';
    }

    const rows = await db.query(query, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const { id } = req.params;
    const [row] = await db.query('SELECT * FROM customers WHERE id = ?', [id]);
    if (!row) return res.status(404).json({ error: 'Not found' });
    res.json(row);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    // normalize date_of_birth if provided in frontend-friendly formats (e.g., DD-MM-YYYY or DD/MM/YYYY)
    const normalizeDate = (val) => {
      if (!val) return null;
      if (val instanceof Date) return val.toISOString().split('T')[0];
      const s = String(val).trim();
      if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.split('T')[0];
      const m = s.match(/^(\d{1,2})[-\/](\d{1,2})[-\/](\d{4})$/);
      if (m) {
        const dd = m[1].padStart(2, '0');
        const mm = m[2].padStart(2, '0');
        const yyyy = m[3];
        return `${yyyy}-${mm}-${dd}`;
      }
      return s;
    };

    const fields = [
      'customer_code', 'full_name', 'date_of_birth', 'gender', 'mobile_number',
      'alternate_mobile', 'email', 'pan_number', 'aadhaar_number', 'kyc_status',
      'credit_score', 'is_active'
    ];

    const values = fields.map(f => {
      if (f === 'date_of_birth') return normalizeDate(req.body[f]) || null;
      return req.body[f] || null;
    });

    const placeholders = fields.map(() => '?').join(',');
    const result = await db.query(
      `INSERT INTO customers (${fields.join(',')}) VALUES (${placeholders})`,
      values
    );
    const [newRow] = await db.query('SELECT * FROM customers WHERE id = ?', [result.insertId]);
    res.status(201).json(newRow);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const allowed = [
      'full_name', 'date_of_birth', 'gender', 'mobile_number', 'alternate_mobile',
      'email', 'pan_number', 'aadhaar_number', 'kyc_status', 'credit_score', 'is_active'
    ];
    const sets = [];
    const values = [];
    const normalizeDate = (val) => {
      if (!val) return null;
      const s = String(val).trim();
      if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.split('T')[0];
      const m = s.match(/^(\d{1,2})[-\/](\d{1,2})[-\/](\d{4})$/);
      if (m) {
        const dd = m[1].padStart(2, '0');
        const mm = m[2].padStart(2, '0');
        const yyyy = m[3];
        return `${yyyy}-${mm}-${dd}`;
      }
      return s;
    };

    allowed.forEach((k)=>{
      if (k in req.body) {
        sets.push(`${k}=?`);
        if (k === 'date_of_birth') values.push(normalizeDate(req.body[k])); else values.push(req.body[k]);
      }
    });
    if (!sets.length) return res.status(400).json({ error: 'No fields to update' });
    values.push(id);
    await db.query(`UPDATE customers SET ${sets.join(',')}, updated_at=NOW() WHERE id=?`, values);
    
    const [updatedRow] = await db.query('SELECT * FROM customers WHERE id = ?', [id]);
    if (!updatedRow) return res.status(404).json({ error: 'Not found' });
    res.json(updatedRow);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM customers WHERE id = ?', [id]);
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
