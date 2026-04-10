const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const CurriculumProgress = require('../models/CurriculumProgress');
const Timetable = require('../models/Timetable');
const Result = require('../models/Result');
const Resource = require('../models/Resource');
const CalendarEvent = require('../models/CalendarEvent');

// === CURRICULUM (SKILL TREE) ===
router.get('/curriculum', auth, async (req, res) => {
  try {
    let cur = await CurriculumProgress.findOne({ student: req.user.id });
    if (!cur) {
      // Seed initial dummy tree
      cur = await CurriculumProgress.create({
        student: req.user.id,
        subject: 'B.Tech Computer Science',
        topics: [
          { id: 'cs101', title: 'Intro to Programming', status: 'Completed', prerequisites: [] },
          { id: 'cs201', title: 'Data Structures', status: 'Completed', prerequisites: ['cs101'] },
          { id: 'cs202', title: 'Algorithms', status: 'In Progress', prerequisites: ['cs201'] },
          { id: 'cs301', title: 'Operating Systems', status: 'Locked', prerequisites: ['cs202'] },
          { id: 'cs401', title: 'Machine Learning', status: 'Locked', prerequisites: ['cs202'] }
        ]
      });
    }
    res.json(cur);
  } catch (err) { res.status(500).send('Server Error'); }
});

router.post('/curriculum/unlock/:topicId', auth, async (req, res) => {
   try {
     const cur = await CurriculumProgress.findOne({ student: req.user.id });
     if(cur) {
        const topic = cur.topics.find(t => t.id === req.params.topicId);
        if(topic) {
           topic.status = 'Completed';
           await cur.save();
        }
     }
     res.json(cur);
   } catch(e) { res.status(500).send('Server Error'); }
});

// === TIMETABLE ===
router.get('/timetable', async (req, res) => {
  try {
    const timetable = await Timetable.find();
    res.json(timetable);
  } catch (err) { res.status(500).send('Server Error'); }
});

router.post('/timetable', async (req, res) => {
  try {
    const entry = await Timetable.create(req.body);
    res.json(entry);
  } catch (err) { res.status(500).send('Server Error'); }
});

// === RESULTS (CGPA Tracker) ===
router.get('/results', auth, async (req, res) => {
  try {
    const results = await Result.find({ student: req.user.id });
    res.json(results);
  } catch (err) { res.status(500).send('Server Error'); }
});

router.post('/results', auth, async (req, res) => {
  try {
    const entry = await Result.create({ ...req.body, student: req.user.id });
    res.json(entry);
  } catch (err) { res.status(500).send('Server Error'); }
});

// === RESOURCE ARCHIVE ===
router.get('/resources', async (req, res) => {
  try {
    const resources = await Resource.find().populate('uploader', 'name');
    res.json(resources);
  } catch (err) { res.status(500).send('Server Error'); }
});

router.post('/resources', auth, async (req, res) => {
  try {
    const entry = await Resource.create({ ...req.body, uploader: req.user.id });
    res.json(entry);
  } catch (err) { res.status(500).send('Server Error'); }
});

router.post('/resources/:id/upvote', auth, async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);
    if (!resource) return res.status(404).json({msg: 'Not found'});
    
    if (!resource.upvotes.includes(req.user.id)) {
      resource.upvotes.push(req.user.id);
      resource.downvotes = resource.downvotes.filter(id => id.toString() !== req.user.id.toString());
      await resource.save();
    }
    res.json(resource);
  } catch (err) { res.status(500).send('Server Error'); }
});

// === ACADEMIC CALENDAR ===
router.get('/calendar', async (req, res) => {
  try {
    const events = await CalendarEvent.find().sort({ date: 1 });
    res.json(events);
  } catch (err) { res.status(500).send('Server Error'); }
});

router.post('/calendar', async (req, res) => {
  try {
    const event = await CalendarEvent.create(req.body);
    res.json(event);
  } catch (err) { res.status(500).send('Server Error'); }
});

module.exports = router;
