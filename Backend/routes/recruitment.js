const express = require('express');
const router = express.Router();
const Recruitment = require('../models/Recruitment');
const Club = require('../models/Club');
const User = require('../models/User');
const auth = require('../middleware/auth');
const role = require('../middleware/role');

// GET /api/recruitment/:clubId
router.get('/:clubId', auth, async (req, res) => {
  try {
    const applications = await Recruitment.find({ club: req.params.clubId }).populate('student', 'name email societyVerified');
    res.json(applications);
  } catch(err) {
    res.status(500).send('Server Error');
  }
});

// POST /api/recruitment
router.post('/', auth, async (req, res) => {
  try {
    const { club, roleAppliedFor } = req.body;
    let application = await Recruitment.findOne({ student: req.user.id, club });
    if(application) {
      return res.status(400).json({ msg: 'You have already applied for this club.' });
    }
    application = new Recruitment({ student: req.user.id, club, roleAppliedFor });
    await application.save();
    res.json(application);
  } catch(err) {
    res.status(500).send('Server Error');
  }
});

// PUT /api/recruitment/:id/status
// Handles Kanban Drag-and-Drop state shifts. Must be Admin or a Society Verified core tracker? 
// Prompt specifically says "id's of student with the verification would be added by the admin"
// Let's protect this to Admin role only for now, per prompt "add verification badge for students added by admin"
router.put('/:id/status', auth, role(['Admin']), async (req, res) => {
  try {
    const application = await Recruitment.findById(req.params.id);
    if (!application) return res.status(404).json({ msg: 'Application not found' });

    application.status = req.body.status;
    await application.save();

    // Workflows for Selected Students
    if (application.status === 'Selected') {
      // 1. Grant special verification badge
      await User.findByIdAndUpdate(application.student, { societyVerified: true });
      
      // 2. Add as a member to the overarching Club payload
      await Club.findByIdAndUpdate(application.club, {
         $addToSet: { members: { user: application.student, role: 'Junior Executive' } }
      });
    }

    res.json(application);
  } catch(err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
