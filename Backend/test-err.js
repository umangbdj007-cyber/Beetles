const mongoose = require('mongoose');
const Assignment = require('./models/Assignment');

mongoose.connect('mongodb://127.0.0.1:27017/campusconnect').then(async () => {
    try {
        const assignment = new Assignment({
            title: "Test",
            subject: "CS",
            description: "Desc",
            deadline: "2026-04-12T14:30",
            difficultyLevel: "Medium",
            assignedBy: new mongoose.Types.ObjectId(),
            assignedTo: [new mongoose.Types.ObjectId()]
        });
        await assignment.save();
        console.log('Saved successfully');
    } catch (e) {
        console.error('MONGOOSE ERROR:', e);
    }
    process.exit();
});
