const express = require('express');
const router = express.Router();
const Club = require('../models/Club');
const auth = require('../middleware/auth');

const preloadClubs = [
  { name: 'Algorithmus', category: 'Technical', description: 'Competitive Programming and Algorithms.' },
  { name: 'ARC Robotics', category: 'Technical', description: 'Robotics, IoT, and embedded systems.' },
  { name: 'CodeBase', category: 'Technical', description: 'Open source software and full stack development.' },
  { name: 'CYPH3R', category: 'Technical', description: 'Network security and ethical hacking.' },
  { name: 'GDG', category: 'Technical', description: 'Google Developer Group representing cross platform systems.' },
  { name: 'IIIT Kernel', category: 'Technical', description: 'Systems programming and OS architecture.' },
  { name: 'GFG', category: 'Technical', description: 'GeeksforGeeks technical hub.' },
  { name: 'Odyssey', category: 'Cultural', description: 'Literary and poetry society.' },
  { name: 'Incognito', category: 'Cultural', description: 'Dramatics and theater group.' },
  { name: 'NEON', category: 'Cultural', description: 'Photography and visual media.' },
  { name: 'Q\'n\'S', category: 'Cultural', description: 'Quizzing and debate society.' },
  { name: 'Artive', category: 'Cultural', description: 'Fine arts, painting, and digital artwork.' },
  { name: 'Fit India', category: 'Lifestyle', description: 'Sports, fitness, and physical well-being.' },
  { name: 'Green Campus', category: 'Lifestyle', description: 'Environmental awareness and sustainability.' },
  { name: 'Paryavaran Shakti', category: 'Lifestyle', description: 'Conservation initiatives and ecology drives.' }
];

// GET /api/clubs
router.get('/', auth, async (req, res) => {
  try {
    let clubs = await Club.find();
    if (clubs.length === 0) {
      await Club.insertMany(preloadClubs);
      clubs = await Club.find();
    }
    res.json(clubs);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// GET /api/clubs/:id
router.get('/:id', auth, async (req, res) => {
  try {
    const club = await Club.findById(req.params.id).populate('members.user', 'name email societyVerified');
    if (!club) return res.status(404).json({ msg: 'Club not found' });
    res.json(club);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

module.exports = router;
