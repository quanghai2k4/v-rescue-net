const express = require('express');
const router = express.Router();
const db = require('../db');

router.post('/requests', async (req, res) => {
  try {
    const { phone, requestType, description, latitude, longitude, address } = req.body;

    if (!phone || !requestType || !latitude || !longitude) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const query = `
      INSERT INTO rescue_requests 
      (phone, request_type, description, latitude, longitude, location, address, status, priority)
      VALUES ($1, $2, $3, $4::numeric, $5::numeric, ST_SetSRID(ST_MakePoint($5::numeric, $4::numeric), 4326)::geography, $6, 'pending', $7)
      RETURNING *
    `;

    const priority = requestType === 'evacuation' ? 'high' : requestType === 'medical' ? 'high' : 'medium';
    const values = [phone, requestType, description, latitude, longitude, address, priority];

    const result = await db.query(query, values);
    const newRequest = result.rows[0];

    const io = req.app.get('io');
    io.to('rescue-teams').emit('new-rescue-request', newRequest);

    res.status(201).json({
      success: true,
      message: 'Rescue request created successfully',
      data: newRequest,
    });
  } catch (error) {
    console.error('Error creating rescue request:', error);
    res.status(500).json({ error: 'Failed to create rescue request' });
  }
});

router.get('/requests', async (req, res) => {
  try {
    const { status, priority, limit = 100 } = req.query;

    let query = 'SELECT * FROM rescue_requests WHERE 1=1';
    const values = [];
    let paramCount = 1;

    if (status) {
      query += ` AND status = $${paramCount}`;
      values.push(status);
      paramCount++;
    }

    if (priority) {
      query += ` AND priority = $${paramCount}`;
      values.push(priority);
      paramCount++;
    }

    query += ' ORDER BY created_at DESC';
    query += ` LIMIT $${paramCount}`;
    values.push(limit);

    const result = await db.query(query, values);

    res.json({
      success: true,
      count: result.rows.length,
      data: result.rows,
    });
  } catch (error) {
    console.error('Error fetching rescue requests:', error);
    res.status(500).json({ error: 'Failed to fetch rescue requests' });
  }
});

router.get('/requests/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query('SELECT * FROM rescue_requests WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Rescue request not found' });
    }

    res.json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Error fetching rescue request:', error);
    res.status(500).json({ error: 'Failed to fetch rescue request' });
  }
});

router.put('/requests/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, assignedTo, priority } = req.body;

    const updates = [];
    const values = [];
    let paramCount = 1;

    if (status) {
      updates.push(`status = $${paramCount}`);
      values.push(status);
      paramCount++;
    }

    if (assignedTo) {
      updates.push(`assigned_to = $${paramCount}`);
      values.push(assignedTo);
      paramCount++;
    }

    if (priority) {
      updates.push(`priority = $${paramCount}`);
      values.push(priority);
      paramCount++;
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`);

    if (updates.length === 1) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    values.push(id);
    const query = `
      UPDATE rescue_requests 
      SET ${updates.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await db.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Rescue request not found' });
    }

    const updatedRequest = result.rows[0];

    const io = req.app.get('io');
    io.to('rescue-teams').emit('rescue-request-updated', updatedRequest);

    res.json({
      success: true,
      message: 'Rescue request updated successfully',
      data: updatedRequest,
    });
  } catch (error) {
    console.error('Error updating rescue request:', error);
    res.status(500).json({ error: 'Failed to update rescue request' });
  }
});

router.get('/requests/nearby/:latitude/:longitude', async (req, res) => {
  try {
    const { latitude, longitude } = req.params;
    const { radius = 10000, status } = req.query;

    let query = `
      SELECT *, 
        ST_Distance(
          location, 
          ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography
        ) as distance
      FROM rescue_requests
      WHERE ST_DWithin(
        location,
        ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography,
        $3
      )
    `;

    const values = [longitude, latitude, radius];
    let paramCount = 4;

    if (status) {
      query += ` AND status = $${paramCount}`;
      values.push(status);
      paramCount++;
    }

    query += ' ORDER BY distance ASC';

    const result = await db.query(query, values);

    res.json({
      success: true,
      count: result.rows.length,
      data: result.rows,
    });
  } catch (error) {
    console.error('Error fetching nearby requests:', error);
    res.status(500).json({ error: 'Failed to fetch nearby requests' });
  }
});

module.exports = router;
