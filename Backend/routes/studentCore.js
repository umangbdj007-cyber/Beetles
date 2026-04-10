const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const mongoose = require('mongoose');
const axios = require('axios');
const User = require('../models/User');
const Assignment = require('../models/Assignment');
const Event = require('../models/Event');
const SkillProfile = require('../models/SkillProfile');
const Bounty = require('../models/Bounty');
const Attendance = require('../models/Attendance');
const CrowdStatus = require('../models/CrowdStatus');

// --- SMART DEADLINES & WORKLOAD PREDICTOR ---
// GET /api/core/workload/predict
// Calculates a workload score per day for the next 30 days based on assignments and events
router.get('/workload/predict', auth, async (req, res) => {
  try {
    const today = new Date();
    const nextMonth = new Date();
    nextMonth.setDate(today.getDate() + 30);

    // Get user's assignments
    const assignments = await Assignment.find({
      'submissions.student': { $ne: req.user.id }, // not submitted
      dueDate: { $gte: today, $lte: nextMonth }
    });

    // Get user's events
    const events = await Event.find({
      participants: req.user.id,
      startTime: { $gte: today, $lte: nextMonth }
    });

    const workloadMap = {};
    for (let i = 0; i < 30; i++) {
       const d = new Date();
       d.setDate(today.getDate() + i);
       workloadMap[d.toISOString().split('T')[0]] = 0;
    }

    assignments.forEach(a => {
      const dateStr = a.dueDate.toISOString().split('T')[0];
      if (workloadMap[dateStr] !== undefined) {
         // Base workload = estimated effort + flat factor
         workloadMap[dateStr] += (a.estimatedEffort || 2) * 2; 
      }
    });

    events.forEach(e => {
       const dateStr = e.startTime.toISOString().split('T')[0];
       if (workloadMap[dateStr] !== undefined) {
         workloadMap[dateStr] += 1; // 1 weight per event
       }
    });

    res.json(workloadMap);
  } catch (err) { res.status(500).send('Server error'); }
});

// --- SKILL SWAP & BOUNTIES ---
// POST /api/core/skills/profile
router.post('/skills/profile', auth, async (req, res) => {
  try {
    const { teachSkills, learnSkills } = req.body;
    let profile = await SkillProfile.findOne({ user: req.user.id });
    if (profile) {
      profile.teachSkills = teachSkills;
      profile.learnSkills = learnSkills;
    } else {
      profile = new SkillProfile({ user: req.user.id, teachSkills, learnSkills });
    }
    await profile.save();
    res.json(profile);
  } catch (err) { res.status(500).send('Server error'); }
});

// GET /api/core/skills/match
router.get('/skills/match', auth, async (req, res) => {
  try {
    const myProfile = await SkillProfile.findOne({ user: req.user.id });
    if (!myProfile) return res.json([]);

    // Find profiles that can teach what I want to learn, or want to learn what I teach
    // Tinder-style candidate filtering
    const matches = await SkillProfile.find({
      user: { $ne: req.user.id },
      $or: [
        { teachSkills: { $in: myProfile.learnSkills } },
        { learnSkills: { $in: myProfile.teachSkills } }
      ]
    }).populate('user', 'name reputationScore');
    res.json(matches);
  } catch (err) { res.status(500).send('Server error'); }
});

// GET /api/core/bounties
router.get('/bounties', auth, async (req, res) => {
   try {
     const bounties = await Bounty.find({ status: 'Open' }).populate('poster', 'name reputationScore');
     res.json(bounties);
   } catch(err) { res.status(500).send('Server error'); }
});

// POST /api/core/bounties
router.post('/bounties', auth, async (req, res) => {
  try {
    const b = new Bounty({ ...req.body, poster: req.user.id });
    await b.save();
    res.json(b);
  } catch (err) { res.status(500).send('Server error'); }
});

// POST /api/core/bounties/:id/accept
router.post('/bounties/:id/accept', auth, async (req, res) => {
  try {
    const bounty = await Bounty.findById(req.params.id);
    if (!bounty || bounty.status !== 'Open') return res.status(400).json({msg: 'Bounty not available'});

    if (bounty.sessionTime) {
      // Conflict detection: does user have an event at this time?
      const start = new Date(bounty.sessionTime);
      const end = new Date(start.getTime() + 60*60*1000); // assume 1 hr
      const clash = await Event.findOne({
        participants: req.user.id,
        $or: [
          { startTime: { $lt: end, $gte: start } },
          { endTime: { $gt: start, $lte: end } }
        ]
      });
      if (clash) return res.status(400).json({msg: 'You have a scheduled event during this time!'});
    }

    bounty.acceptor = req.user.id;
    bounty.status = 'Accepted';
    await bounty.save();
    res.json(bounty);
  } catch (err) { res.status(500).send('Server error'); }
});

// POST /api/core/bounties/:id/complete
router.post('/bounties/:id/complete', auth, async (req, res) => {
  try {
    const bounty = await Bounty.findById(req.params.id);
    if (!bounty || bounty.status !== 'Accepted') return res.status(400).json({msg: 'Bounty cannot be completed'});
    
    // Only poster or acceptor can complete
    if (req.user.id !== bounty.poster.toString() && req.user.id !== bounty.acceptor.toString()) {
       return res.status(403).json({msg: 'Not authorized'});
    }

    bounty.status = 'Completed';
    await bounty.save();

    // Reward points
    await User.findByIdAndUpdate(bounty.acceptor, { $inc: { reputationScore: bounty.reward }});
    res.json(bounty);
  } catch (err) { res.status(500).send('Server error'); }
});

// --- CONTRIBUTION TRACKER ---
router.get('/contributions/:id', auth, async (req, res) => {
  try {
     const u = await User.findById(req.params.id);
     if(!u) return res.status(404).json({msg: 'User not found'});
     
     let ghStats = null;
     if (u.githubUsername) {
       try {
         const resp = await axios.get(`https://api.github.com/users/${u.githubUsername}`);
         ghStats = { repos: resp.data.public_repos, followers: resp.data.followers };
       } catch (e) { console.error('Github api error'); }
     }
     
     let lcStats = null;
     if (u.leetcodeUsername) {
       try {
         const resp = await axios.get(`https://leetcode-stats-api.herokuapp.com/${u.leetcodeUsername}`);
         lcStats = { solved: resp.data.totalSolved, easy: resp.data.easySolved, medium: resp.data.mediumSolved, hard: resp.data.hardSolved };
       } catch (e) { console.error('Leetcode api error'); }
     }
     
     res.json({ github: ghStats, leetcode: lcStats, reputation: u.reputationScore });
  } catch (err) { res.status(500).send('Server error'); }
});

router.post('/profile/usernames', auth, async (req, res) => {
   try {
     const { githubUsername, leetcodeUsername } = req.body;
     const u = await User.findById(req.user.id);
     if (githubUsername) u.githubUsername = githubUsername;
     if (leetcodeUsername) u.leetcodeUsername = leetcodeUsername;
     await u.save();
     res.json({msg: 'Updated'});
   } catch(e) { res.status(500).send('Server error'); }
});

// --- INTELLIGENT ATTENDANCE ---
router.get('/attendance', auth, async (req, res) => {
  try {
     const attendance = await Attendance.find({ student: req.user.id });
     res.json(attendance);
  } catch (err) { res.status(500).send('Server error'); }
});

router.post('/attendance', auth, async (req, res) => {
  try {
     let att = await Attendance.findOne({ student: req.user.id, subject: req.body.subject });
     if (att) {
        att.totalClasses = req.body.totalClasses;
        att.attendedClasses = req.body.attendedClasses;
     } else {
        att = new Attendance({ ...req.body, student: req.user.id });
     }
     await att.save();
     res.json(att);
  } catch (err) { res.status(500).send('Server error'); }
});

// --- CANTEEN CROWD METER ---
router.get('/canteen/status', auth, async (req, res) => {
  try {
     const statuses = await CrowdStatus.find().sort({ createdAt: -1 }).limit(10);
     if(statuses.length === 0) return res.json({ aggregate: 'Empty', latest: [] });
     
     // aggregate
     const counts = { Empty: 0, Moderate: 0, Crowded: 0 };
     statuses.forEach(s => counts[s.status]++);
     const aggregate = Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b);
     
     res.json({ aggregate, latest: statuses });
  } catch (err) { res.status(500).send('Server error'); }
});

router.post('/canteen/status', auth, async (req, res) => {
  try {
     const s = new CrowdStatus({ status: req.body.status, reportedBy: req.user.id });
     await s.save();
     
     const io = req.app.get('socketio');
     io.emit('canteen_update', s);

     res.json(s);
  } catch (err) { res.status(500).send('Server error'); }
});

module.exports = router;
