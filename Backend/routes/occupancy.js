const express = require('express');
const router = express.Router();
const CrowdStatus = require('../models/CrowdStatus');
const auth = require('../middleware/auth'); // Optional if we allow anonymous, but let's assume auth is optional for occupancy. But wait, we can just use a mild auth or manual IP extraction.

// Helper to calculate occupancy percentage
const calculateOccupancy = async (locationId) => {
  // Get records from last 15 mins (TTL deletes them automatically, but we can filter just in case)
  const fifteenMinsAgo = new Date(Date.now() - 15 * 60 * 1000);
  const records = await CrowdStatus.find({ locationId, createdAt: { $gte: fifteenMinsAgo } });

  if (records.length === 0) return { occupancyPercentage: 0, crowdLabel: 'Empty', totalResponses: 0 };

  let totalWeight = 0;
  records.forEach(r => {
    if (r.status === 'EMPTY') totalWeight += 20;
    else if (r.status === 'MODERATE') totalWeight += 50;
    else if (r.status === 'CROWDED') totalWeight += 90;
  });

  const avg = Math.round(totalWeight / records.length);
  
  let label = 'Low';
  if (avg >= 40 && avg <= 70) label = 'Medium';
  if (avg > 70) label = 'High';

  return { occupancyPercentage: avg, crowdLabel: label, totalResponses: records.length };
};

// GET /api/occupancy/:locationId
router.get('/:locationId', async (req, res) => {
  try {
    const data = await calculateOccupancy(req.params.locationId);
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error fetching occupancy' });
  }
});

// POST /api/occupancy/update
// Expects: locationId, status
router.post('/update', async (req, res) => {
  try {
    const { locationId, status } = req.body;
    
    // Extract user ID (if using auth middleware) or IP address
    const userId = req.user ? req.user.id : null;
    const ipAddress = req.ip || req.connection.remoteAddress;

    // Rate limiting: 1 submission per 5 mins per location per user/IP
    const fiveMinsAgo = new Date(Date.now() - 5 * 60 * 1000);
    const query = { locationId, createdAt: { $gte: fiveMinsAgo } };
    if (userId) query.reportedBy = userId;
    else query.ipAddress = ipAddress;

    const recent = await CrowdStatus.findOne(query);
    if (recent) {
      return res.status(429).json({ msg: 'Please wait 5 minutes before submitting another update for this location.' });
    }

    // Save new status
    const newStatus = new CrowdStatus({
      locationId,
      status: status.toUpperCase(),
      reportedBy: userId,
      ipAddress
    });
    await newStatus.save();

    // Recalculate
    const updatedData = await calculateOccupancy(locationId);

    // Emit Real-Time Socket Update
    const io = req.app.get('socketio');
    if (io) {
      io.emit('occupancy:update', { locationId, ...updatedData });
    }

    res.json({ msg: 'Occupancy updated successfully', data: updatedData });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error updating occupancy' });
  }
});

module.exports = router;
