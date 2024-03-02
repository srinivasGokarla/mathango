
const { ensureAuth, ensureGuest } = require('../middleware/auth')
const Board = require('../models/Board');
const Task = require('../models/Task');
const axios = require('axios');
const User = require('../models/User');
const verifyToken = require("../middleware/verifyToken")
const router = require('express').Router()


router.get('/', ensureGuest ,(req, res) => {
  res.render('login')
})

router.get("/log",ensureAuth, async(req,res)=>{
  res.render('index',{userinfo:req.user})
})

router.get('/home', verifyToken,
 (req, res) => {
  
    res.send("Welcome to the Home Page")
  })


// Profile route
router.get('/profile/:userId', 
verifyToken,
async (req, res) => {
  try {
    const userId = req.params.userId;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});




  // Route to fetch randomly assigned avatar picture
router.get('/avatar', 
verifyToken, 
async (req, res) => {
    try {
      const response = await axios.get('https://avatars.dicebear.com/api/male/example.svg');
      res.set('Content-Type', 'image/svg+xml');
      res.send(response.data);
      res.send("Avatar Created");
    } catch (err) {
      console.error(err);
      res.status(500).send('Internal Server Error');
    }
  });



  
// POST tasks - Create a new task
router.post('/task', verifyToken, async (req, res) => {
  try {
    const { title, description, category, assignedTo, deadline } = req.body;
    const existingTask = await Task.findOne({ title });
    if (existingTask) {
      return res.status(400).json({ message: 'Task already exists' });
    }
    const newTask = new Task({
      title,
      description,
      category,
      assignedTo,
      deadline
    });
    await newTask.save();
    res.status(201).json(newTask);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

// GET tasks - Fetch all tasks
router.get('/tasks',verifyToken, async (req, res) => {
  try {
    const tasks = await Task.find();
    res.status(200).json(tasks);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

//Get task by boardId
router.get('task/:boardId', verifyToken,  async (req, res) => {
  try {
    const tasks = await Task.find({ board: req.params.boardId });
    res.json(tasks);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: error.message });
  }
});

// Update a task
router.put('/task/:taskId', 
verifyToken,  
async (req, res) => {
  try {
    const taskId = req.params.taskId;
    const updatedTask = await Task.findByIdAndUpdate(taskId, req.body, { new: true });
    res.json(updatedTask);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Delete a task
router.delete('/task/:taskId', 
verifyToken, 
 async (req, res) => {
  try {
    const taskId = req.params.taskId;
    await Task.findByIdAndDelete(taskId);
    res.status(204).end("deleted the task");
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});


// Route to update task category
router.post('/update-task', 
verifyToken,  
async (req, res) => {
    try {
      const { taskId, categoryId } = req.body;
      await Task.findByIdAndUpdate(taskId, { category: categoryId });
  
      res.json({ message: 'Task category updated successfully' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  });


module.exports=router;