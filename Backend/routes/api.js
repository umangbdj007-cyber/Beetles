const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const role = require('../middleware/role');
const Announcement = require('../models/Announcement');
const Complaint = require('../models/Complaint');
const Event = require('../models/Event');
const Assignment = require('../models/Assignment');
const MarketplaceItem = require('../models/MarketplaceItem');
const ClassLog = require('../models/ClassLog');
const User = require('../models/User');

// --- ADMIN USERS CRUD ---
router.get('/users', auth, role(['Admin']), async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) { res.status(500).send('Server error'); }
});

router.delete('/users/:id', auth, role(['Admin']), async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ msg: 'User removed' });
  } catch (err) { res.status(500).send('Server error'); }
});

router.put('/users/:id', auth, role(['Admin']), async (req, res) => {
  try {
    const { name, email, role } = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, { name, email, role }, { new: true }).select('-password');
    res.json(user);
  } catch (err) { res.status(500).send('Server error'); }
});

// --- ANNOUNCEMENTS ---
router.get('/announcements', auth, async (req, res) => {
  try {
    const announcements = await Announcement.find().sort({ createdAt: -1 }).populate('author', 'name');
    res.json(announcements);
  } catch (err) { res.status(500).send('Server error'); }
});

router.post('/announcements', auth, role(['Teacher', 'Admin']), async (req, res) => {
  try {
    const newAnnouncement = new Announcement({
      title: req.body.title,
      content: req.body.content,
      author: req.user.id
    });
    const announcement = await newAnnouncement.save();
    
    // Emit real time event
    const io = req.app.get('socketio');
    const populated = await announcement.populate('author', 'name');
    io.emit('new_announcement', populated);
    
    res.json(announcement);
  } catch (err) { res.status(500).send('Server error'); }
});

// --- COMPLAINTS ---
router.post('/complaints', auth, role(['Student']), async (req, res) => {
  try {
    const complaint = new Complaint({
      title: req.body.title,
      description: req.body.description,
      student: req.user.id
    });
    await complaint.save();
    res.json(complaint);
  } catch (err) { res.status(500).send('Server error'); }
});

router.get('/complaints', auth, async (req, res) => {
  try {
    let complaints;
    if (req.user.role === 'Student') {
      complaints = await Complaint.find({ student: req.user.id });
    } else {
      complaints = await Complaint.find().populate('student', 'name email');
    }
    res.json(complaints);
  } catch (err) { res.status(500).send('Server error'); }
});

router.put('/complaints/:id/status', auth, role(['Admin']), async (req, res) => {
  try {
    const complaint = await Complaint.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
    res.json(complaint);
  } catch (err) { res.status(500).send('Server error'); }
});

// --- EVENTS (with conflict detection) ---
router.get('/events', auth, async (req, res) => {
  try {
    const events = await Event.find().sort({ startTime: 1 });
    res.json(events);
  } catch (err) { res.status(500).send('Server error'); }
});

router.get('/events/nearest', auth, async (req, res) => {
  try {
    const now = new Date();
    const event = await Event.findOne({ startTime: { $gt: now }, approvalStatus: 'Approved' }).sort({ startTime: 1 });
    res.json(event || {});
  } catch (err) { res.status(500).send('Server error'); }
});

router.post('/events', auth, role(['Admin', 'Teacher', 'Student']), async (req, res) => {
  try {
    const { name, description, startTime, endTime, location } = req.body;
    
    // Check global location/time clash for approved events
    const clash = await Event.findOne({
      location,
      approvalStatus: 'Approved',
      $or: [
        { startTime: { $lt: endTime, $gte: startTime } },
        { endTime: { $gt: startTime, $lte: endTime } }
      ]
    });

    if (clash) {
      return res.status(400).json({ msg: 'Venue is already booked for an approved event at this time.' });
    }

    const event = new Event({ 
      name, description, startTime, endTime, location, 
      approvalStatus: req.user.role === 'Admin' ? 'Approved' : 'Pending',
      createdBy: req.user.id
    });
    await event.save();
    
    const io = req.app.get('socketio');
    if (io) io.emit('event:update', event);

    res.json(event);
  } catch (err) { res.status(500).send('Server error'); }
});

router.put('/events/:id/status', auth, role(['Admin']), async (req, res) => {
  try {
    const event = await Event.findByIdAndUpdate(req.params.id, { approvalStatus: req.body.status }, { new: true });
    
    const io = req.app.get('socketio');
    if (io) io.emit('event:update', event);
    
    res.json(event);
  } catch (err) { res.status(500).send('Server error'); }
});

router.post('/events/:id/register', auth, role(['Student']), async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (event.participants.includes(req.user.id)) {
      return res.status(400).json({ msg: 'Already registered' });
    }
    
    // Check personal schedule conflict
    const userEvents = await Event.find({ participants: req.user.id });
    for (let uEvent of userEvents) {
      if ((event.startTime >= uEvent.startTime && event.startTime < uEvent.endTime) ||
          (event.endTime > uEvent.startTime && event.endTime <= uEvent.endTime)) {
        return res.status(400).json({ msg: 'Time clash with another registered event.' });
      }
    }

    event.participants.push(req.user.id);
    await event.save();
    res.json(event);
  } catch (err) { res.status(500).send('Server error'); }
});

// --- ACADEMICS (Assignments & Class Logs) ---
router.get('/assignments', auth, async (req, res) => {
  try {
    const assignments = await Assignment.find().populate('teacher', 'name');
    res.json(assignments);
  } catch (err) { res.status(500).send('Server error'); }
});

router.post('/assignments', auth, role(['Teacher']), async (req, res) => {
  try {
    const assign = new Assignment({
      title: req.body.title,
      description: req.body.description,
      dueDate: req.body.dueDate,
      teacher: req.user.id
    });
    await assign.save();
    res.json(assign);
  } catch (err) { res.status(500).send('Server error'); }
});

router.post('/assignments/:id/submit', auth, role(['Student']), async (req, res) => {
  try {
    const assign = await Assignment.findById(req.params.id);
    const existing = assign.submissions.find(s => s.student.toString() === req.user.id);
    if (existing) {
      existing.content = req.body.content;
    } else {
      assign.submissions.push({ student: req.user.id, content: req.body.content });
    }
    await assign.save();
    res.json(assign);
  } catch (err) { res.status(500).send('Server error'); }
});

router.get('/classes', auth, async (req, res) => {
  try {
    const classes = await ClassLog.find().sort({ date: -1 }).populate('teacher', 'name');
    res.json(classes);
  } catch (err) { res.status(500).send('Server error'); }
});

router.post('/classes', auth, role(['Teacher']), async (req, res) => {
  try {
    const log = new ClassLog({
      topic: req.body.topic,
      date: req.body.date,
      duration: req.body.duration,
      attendanceCount: req.body.attendanceCount,
      notes: req.body.notes,
      teacher: req.user.id
    });
    await log.save();
    res.json(log);
  } catch (err) { res.status(500).send('Server error'); }
});

// --- MARKETPLACE ---
router.get('/marketplace', auth, async (req, res) => {
  try {
    const items = await MarketplaceItem.find({ status: 'Available' }).populate('seller', 'name');
    res.json(items);
  } catch (err) { res.status(500).send('Server error'); }
});

router.post('/marketplace', auth, async (req, res) => {
  try {
    const item = new MarketplaceItem({
      itemName: req.body.itemName,
      description: req.body.description,
      price: req.body.price,
      type: req.body.type,
      seller: req.user.id
    });
    await item.save();
    res.json(item);
  } catch (err) { res.status(500).send('Server error'); }
});

module.exports = router;
