const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const ResourceItem = require('../models/ResourceItem');
const BorrowRecord = require('../models/BorrowRecord');
const SkillProfile = require('../models/SkillProfile');
const MentorshipRequest = require('../models/MentorshipRequest');
const User = require('../models/User');

// --- PHYSICAL INVENTORY ---

// GET /api/inventory/resources
router.get('/resources', auth, async (req, res) => {
  try {
    const items = await ResourceItem.find({ status: 'AVAILABLE' }).populate('ownerId', 'name email');
    res.json(items);
  } catch (err) { res.status(500).send('Server Error'); }
});

// POST /api/inventory/resources
router.post('/resources', auth, async (req, res) => {
  try {
    const { title, category, description } = req.body;
    const item = new ResourceItem({ title, category, description, ownerId: req.user.id });
    await item.save();
    res.json(item);
  } catch (err) { res.status(500).send('Server Error'); }
});

// POST /api/inventory/resources/:id/borrow
router.post('/resources/:id/borrow', auth, async (req, res) => {
  try {
    const item = await ResourceItem.findById(req.params.id);
    if (!item) return res.status(404).json({ msg: 'Item not found' });
    if (item.status !== 'AVAILABLE') return res.status(400).json({ msg: 'Item is currently unavailable' });
    if (item.ownerId.toString() === req.user.id) return res.status(400).json({ msg: 'Cannot borrow your own item' });

    item.status = 'LENT';
    await item.save();

    const record = new BorrowRecord({
      itemId: item._id,
      borrowerId: req.user.id,
      ownerId: item.ownerId
    });
    await record.save();

    res.json({ msg: 'Borrow transaction successful', record });
  } catch (err) { res.status(500).send('Server Error'); }
});

// GET /api/inventory/borrowed
router.get('/borrowed', auth, async (req, res) => {
  try {
    const records = await BorrowRecord.find({ 
      $or: [{ borrowerId: req.user.id }, { ownerId: req.user.id }],
      status: 'ACTIVE'
    }).populate('itemId borrowerId ownerId');
    res.json(records);
  } catch(err) { res.status(500).send('Server Error'); }
});

// POST /api/inventory/resources/return/:recordId
router.post('/resources/return/:recordId', auth, async (req, res) => {
  try {
    const record = await BorrowRecord.findById(req.params.recordId);
    if (!record || record.status === 'RETURNED') return res.status(400).json({ msg: 'Invalid record' });

    // Only owner or borrower can mark returned
    if (req.user.id !== record.ownerId.toString() && req.user.id !== record.borrowerId.toString()) {
       return res.status(403).json({ msg: 'Unauthorized' });
    }

    record.status = 'RETURNED';
    record.returnDate = new Date();
    await record.save();

    const item = await ResourceItem.findById(record.itemId);
    item.status = 'AVAILABLE';
    await item.save();

    res.json({ msg: 'Item safely returned' });
  } catch (err) { res.status(500).send('Server Error'); }
});


// --- SKILL HUB & MENTORSHIP ---

// GET /api/inventory/skills
router.get('/skills', auth, async (req, res) => {
  try {
    const str = req.query.search || '';
    let query = { availabilityStatus: 'AVAILABLE' };
    
    // Optional filtering
    if (str) {
      query['skills.name'] = { $regex: str, $options: 'i' };
    }

    const profiles = await SkillProfile.find(query).populate('user', 'name');
    res.json(profiles);
  } catch (err) { res.status(500).send('Server Error'); }
});

// GET /api/inventory/skills/me
router.get('/skills/me', auth, async (req, res) => {
  try {
    const up = await SkillProfile.findOne({ user: req.user.id });
    res.json(up || { skills: [], availabilityStatus: 'AVAILABLE' });
  } catch(err) { res.status(500).send('Server Error'); }
});

// POST /api/inventory/skills (Upsert profile)
router.post('/skills', auth, async (req, res) => {
  try {
    const { skills, availabilityStatus } = req.body;
    let up = await SkillProfile.findOne({ user: req.user.id });
    if (up) {
       up.skills = skills;
       up.availabilityStatus = availabilityStatus;
    } else {
       up = new SkillProfile({ user: req.user.id, skills, availabilityStatus });
    }
    await up.save();
    res.json(up);
  } catch (err) { res.status(500).send('Server Error'); }
});

// POST /api/inventory/mentorship/request
router.post('/mentorship/request', auth, async (req, res) => {
  try {
     const { skillRequired, duration, preferredTime, targetMentorId } = req.body;
     const mReq = new MentorshipRequest({
         requesterId: req.user.id,
         skillRequired, duration, preferredTime,
         mentorId: targetMentorId || null
     });
     await mReq.save();

     // Socket emit for matchmaking
     const io = req.app.get('socketio');
     if (io) {
       io.emit('mentorship:new_request', await mReq.populate('requesterId', 'name'));
     }

     res.json(mReq);
  } catch(err) { res.status(500).send('Server Error'); }
});

// GET /api/inventory/mentorship/active
router.get('/mentorship/active', auth, async (req, res) => {
  try {
    const requests = await MentorshipRequest.find({
       $or: [{ requesterId: req.user.id }, { mentorId: req.user.id }]
    }).populate('requesterId mentorId', 'name email');
    res.json(requests);
  } catch(err) { res.status(500).send('Server Error'); }
});

// POST /api/inventory/mentorship/:id/accept
router.post('/mentorship/:id/accept', auth, async (req, res) => {
  try {
     const mReq = await MentorshipRequest.findById(req.params.id);
     if (!mReq || mReq.status !== 'PENDING') return res.status(400).json({ msg: 'Cannot accept request' });
     
     // Cannot accept own request
     if (mReq.requesterId.toString() === req.user.id) return res.status(400).json({ msg: 'Invalid operation' });

     mReq.status = 'ACCEPTED';
     mReq.mentorId = req.user.id;
     await mReq.save();

     const io = req.app.get('socketio');
     if (io) io.emit('mentorship:accepted', await mReq.populate('requesterId mentorId', 'name'));

     res.json(mReq);
  } catch(err) { res.status(500).send('Server Error'); }
});

// POST /api/inventory/mentorship/:id/complete
router.post('/mentorship/:id/complete', auth, async (req, res) => {
  try {
     const mReq = await MentorshipRequest.findById(req.params.id);
     if (!mReq || mReq.status !== 'ACCEPTED') return res.status(400).json({ msg: 'Invalid state' });
     mReq.status = 'COMPLETED';
     await mReq.save();
     res.json(mReq);
  } catch(err) { res.status(500).send('Server Error'); }
});

module.exports = router;
