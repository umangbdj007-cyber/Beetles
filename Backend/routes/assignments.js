const express = require('express');
const router = express.Router();
const Assignment = require('../models/Assignment');
const User = require('../models/User');
const auth = require('../middleware/auth');
const role = require('../middleware/role');

// GET /api/assignments
// Returns assignments targeted to the user, or all assignments if teacher
router.get('/', auth, async (req, res) => {
  try {
    let assignments = [];
    if (req.user.role === 'Teacher' || req.user.role === 'Admin') {
      assignments = await Assignment.find().populate('assignedBy', 'name');
    } else {
      assignments = await Assignment.find({ assignedTo: req.user.id }).populate('assignedBy', 'name');
    }
    res.json(assignments);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// GET /api/assignments/students (Helper for teacher dropdowns)
router.get('/students', auth, role(['Teacher', 'Admin']), async (req, res) => {
  try {
    const students = await User.find({ role: 'Student' }).select('name email');
    res.json(students);
  } catch(err) { res.status(500).send('Server Error'); }
});

// POST /api/assignments (Teacher Only)
router.post('/', auth, role(['Teacher', 'Admin']), async (req, res) => {
  try {
    const { title, subject, description, deadline, difficultyLevel, assignedTo } = req.body;
    
    const assignment = new Assignment({
      title, subject, description, deadline, difficultyLevel,
      assignedBy: req.user.id,
      assignedTo // array of student ObjectIds
    });
    
    await assignment.save();
    
    // Broadcast real-time update
    const io = req.app.get('socketio');
    if (io) io.emit('assignment:new', assignment);

    res.json(assignment);
  } catch(err) {
    res.status(500).json({ msg: err.message, stack: err.stack });
  }
});

// SUBMIT /api/assignments/:id/submit
router.post('/:id/submit', auth, async (req, res) => {
  try {
    const { content } = req.body;
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) return res.status(404).json({ msg: 'Assignment not found' });
    
    // Check if already submitted
    const existing = assignment.submissions.find(sub => sub.student.toString() === req.user.id);
    if (existing) return res.status(400).json({ msg: 'Already submitted' });

    assignment.submissions.push({ student: req.user.id, content });
    await assignment.save();
    res.json(assignment);
  } catch(err) {
    res.status(500).send('Server Error');
  }
});

// GET /api/assignments/heatmap (Workload Calculation)
router.get('/workload/heatmap', auth, async (req, res) => {
  try {
    // 1. Fetch targeted assignments for this student
    const assignments = await Assignment.find({ assignedTo: req.user.id });
    
    const heatmap = {}; // { 'YYYY-MM-DD': { score: 0, count: 0, items: [] } }

    assignments.forEach(a => {
      // Ignore if student already submitted it
      const hasSubmitted = a.submissions?.some(sub => sub.student.toString() === req.user.id);
      if (hasSubmitted) return;

      const baseDate = new Date(a.deadline).toISOString().split('T')[0];
      if (!heatmap[baseDate]) {
        heatmap[baseDate] = { workloadScore: 0, count: 0, items: [] };
      }

      let weight = 2; // Default Medium
      if (a.difficultyLevel === 'Low') weight = 1;
      if (a.difficultyLevel === 'High') weight = 3;

      heatmap[baseDate].workloadScore += weight;
      heatmap[baseDate].count += 1;
      heatmap[baseDate].items.push(a.title);
    });

    // 2. Format map into visual colors
    const heatmapArray = Object.keys(heatmap).map(date => {
      const entry = heatmap[date];
      let colorCode = 'Green';
      if (entry.workloadScore >= 3 && entry.workloadScore <= 5) colorCode = 'Yellow';
      if (entry.workloadScore > 5) colorCode = 'Red';

      return {
        date,
        workloadScore: entry.workloadScore,
        count: entry.count,
        colorCode,
        items: entry.items
      };
    });

    res.json(heatmapArray);
  } catch(err) {
    res.status(500).send('Server Error');
  }
});

module.exports = router;
