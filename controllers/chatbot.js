const db = require('../config/db');

exports.getConversations = async (req, res) => {
  try {
    const { session_id, customer_id } = req.query;
    let query = 'SELECT id, session_id, customer_id, mobile_number, channel, message_type, message_text, context_data, session_start, session_end, is_session_active, created_at FROM chatbot_conversations';
    const params = [];

    if (session_id) {
      query += ' WHERE session_id = ?';
      params.push(session_id);
    } else if (customer_id) {
      query += ' WHERE customer_id = ?';
      params.push(customer_id);
    }

    query += ' ORDER BY created_at DESC';

    const rows = await db.query(query, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createConversation = async (req, res) => {
  try {
    const { session_id, customer_id, mobile_number, channel, message_type, message_text, context_data, session_start, session_end, is_session_active } = req.body;
    const result = await db.query(
      `INSERT INTO chatbot_conversations (session_id, customer_id, mobile_number, channel, message_type, message_text, context_data, session_start, session_end, is_session_active)
       VALUES (?,?,?,?,?,?,?,?,?,?)`,
      [session_id, customer_id, mobile_number, channel, message_type, message_text, JSON.stringify(context_data), session_start, session_end, is_session_active]
    );
    const [newRow] = await db.query('SELECT * FROM chatbot_conversations WHERE id = ?', [result.insertId]);
    res.status(201).json(newRow);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getChatHistoryByCustomerId = async (req, res) => {
    try {
        const { customerId } = req.params;
        
        // First, try to find the session_id from the customer's loan applications
        // The loan_application stores conversation_id which links to the chatbot session_id
        const appQuery = 'SELECT conversation_id FROM loan_applications WHERE customer_id = ? ORDER BY created_at DESC LIMIT 1';
        const appRows = await db.query(appQuery, [customerId]);
        
        let sessionId = null;
        if (appRows.length > 0 && appRows[0].conversation_id) {
            sessionId = appRows[0].conversation_id;
        }
        
        // If we found a session_id from loan applications, get all messages for that session
        if (sessionId) {
            const sessionQuery = `
                SELECT message_type, message_text, created_at 
                FROM chatbot_conversations 
                WHERE session_id = ? 
                ORDER BY created_at ASC, id ASC
            `;
            const rows = await db.query(sessionQuery, [sessionId]);

            const formattedHistory = rows.map(row => {
                let sender = 'Bot';
                if (row.message_type === 'user_message') {
                    sender = 'Customer';
                }
                return {
                    sender: sender,
                    message: row.message_text,
                    created_at: row.created_at
                };
            });

            return res.json({
                history: formattedHistory,
                count: rows.length
            });
        }
        
        // Fallback: If no loan application found, try to get by customer_id and mobile_number
        // First, get the customer's mobile number
        const customerQuery = 'SELECT mobile_number FROM customers WHERE id = ?';
        const customerRows = await db.query(customerQuery, [customerId]);
        
        let mobileNumber = null;
        if (customerRows.length > 0) {
            mobileNumber = customerRows[0].mobile_number;
        }
        
        // If no customer found, return empty history
        if (!mobileNumber) {
            return res.json({
                history: [],
                count: 0
            });
        }
        
        // Query for conversations where either customer_id matches OR mobile_number matches
        const query = `
            SELECT message_type, message_text, created_at 
            FROM chatbot_conversations 
            WHERE customer_id = ? OR mobile_number = ? 
            ORDER BY created_at ASC, id ASC
        `;
        const rows = await db.query(query, [customerId, mobileNumber]);

        const formattedHistory = rows.map(row => {
            let sender = 'Bot';
            if (row.message_type === 'user_message') {
                sender = 'Customer';
            }
            return {
                sender: sender,
                message: row.message_text,
                created_at: row.created_at
            };
        });

        res.json({
            history: formattedHistory,
            count: rows.length
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
