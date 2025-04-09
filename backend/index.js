require('dotenv').config();
const express = require('express');
const cors = require('cors');
const pool = require('./db');
const { encodeBase62 } = require('./utils');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;
const MAX_URLS_PER_DAY = 100;

// Shorten a URL
app.post('/shorten', async (req, res) => {
    const { original_url } = req.body;
    const user_ip = req.ip;
    const today = new Date().toISOString().split('T')[0];

    try {
        // 1. Check daily limit
        const { rows: countRows } = await pool.query(
            `SELECT COUNT(*) FROM urls WHERE user_ip = $1 AND DATE(created_at) = $2`,
            [user_ip, today]
        );

        if (parseInt(countRows[0].count) >= MAX_URLS_PER_DAY) {
            return res.status(429).json({ error: 'Daily limit (100) reached.' });
        }

        // 2. Insert temp row
        const expiry = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000); // 1 year
        const insertResult = await pool.query(
            `INSERT INTO urls (original_url, short_code, expiry_date, user_ip)
             VALUES ($1, $2, $3, $4) RETURNING id`,
            [original_url, 'temp', expiry, user_ip]
        );

        const id = insertResult.rows[0].id;
        const shortCode = encodeBase62(id);

        // 3. Update with actual short code
        await pool.query(`UPDATE urls SET short_code = $1 WHERE id = $2`, [shortCode, id]);

        res.json({ short_url: `http://localhost:${PORT}/${shortCode}` });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Redirect to original URL + increment click count
app.get('/:code', async (req, res) => {
    const { code } = req.params;

    try {
        const result = await pool.query(
            `SELECT original_url FROM urls WHERE short_code = $1 AND expiry_date > NOW()`,
            [code]
        );

        if (result.rows.length === 0) {
            return res.status(404).send('URL not found or expired.');
        }

        // Increment click count
        await pool.query(
            `UPDATE urls SET click_count = click_count + 1 WHERE short_code = $1`,
            [code]
        );

        res.redirect(result.rows[0].original_url);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

// Get stats for a short URL
app.get('/stats/:code', async (req, res) => {
    const { code } = req.params;

    try {
        const result = await pool.query(
            `SELECT original_url, click_count FROM urls WHERE short_code = $1`,
            [code]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'URL not found.' });
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
});
