const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Event = require('../models/Event');
const Complaint = require('../models/Complaint');
const Club = require('../models/Club');
const auth = require('../middleware/auth');
const role = require('../middleware/role');

// GET /api/admin/analytics - Aggregate Statistics
router.get('/analytics', auth, role(['Admin']), async (req, res) => {
  try {
     const totalUsers = await User.countDocuments();
     const pendingEvents = await Event.countDocuments({ approvalStatus: 'Pending' });
     const openComplaints = await Complaint.countDocuments({ status: { $ne: 'Resolved' } });
     const totalClubs = await Club.countDocuments();
     res.json({ totalUsers, pendingEvents, openComplaints, totalClubs });
  } catch (err) {
     res.status(500).send('Server Error');
  }
});

// GET /api/admin/users
router.get('/users', auth, role(['Admin']), async (req, res) => {
  try {
     const users = await User.find().select('-password');
     res.json(users);
  } catch (err) { res.status(500).send('Server Error'); }
});

// PUT /api/admin/users/:id/role
router.put('/users/:id/role', auth, role(['Admin']), async (req, res) => {
  try {
     const { roleType } = req.body;
     const user = await User.findByIdAndUpdate(req.params.id, { role: roleType }, { new: true }).select('-password');
     res.json(user);
  } catch (err) { res.status(500).send('Server Error'); }
});

// DELETE /api/admin/users/:id
router.delete('/users/:id', auth, role(['Admin']), async (req, res) => {
  try {
     await User.findByIdAndDelete(req.params.id);
     res.json({ msg: 'User deleted' });
  } catch (err) { res.status(500).send('Server Error'); }
});

module.exports = router;
