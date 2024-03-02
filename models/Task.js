
const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
    board: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Board'
    },
    title: {
        type: String,
        required: true
    },
    description: String,
    category: {
        type: String,
        enum: ["Unassigned", "In Development", "Pending Review", "Done"],
        default: "Unassigned"
    },
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    deadline: Date,
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Task', TaskSchema);