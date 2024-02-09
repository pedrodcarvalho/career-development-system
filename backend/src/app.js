// Express
const express = require('express');
const app = express();

const path = require('path');

// Dotenv
require('dotenv').config();
const HOST = process.env.HOST || '127.0.0.1';
const PORT = process.env.PORT || '3000';

// Static Files
app.use(express.static(path.join(__dirname, '../../frontend/public')));

// Parse JSON
app.use(express.json());

// Body Parser
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));

// View Engine
app.set('views', path.join(__dirname, '../../frontend/public/views'));
app.set('view engine', 'ejs');

// Session
const session = require('express-session');
app.use(session({
    secret: `${process.env.SESSION_SECRET}`,
    resave: false,
    saveUninitialized: false
}));

// Routes
const home = require('./routes/home.js');
app.use('/home', home);
const trainings = require('./api/trainings.js');
app.use('/api/trainings', trainings);
const adminTrainings = require('./api/admin-trainings.js');
app.use('/api/admin-trainings', adminTrainings);
const quiz = require('./api/quiz.js');
app.use('/api/quiz', quiz);
const jobs = require('./api/jobs.js');
app.use('/api/jobs', jobs);
const course = require('./api/course.js');
app.use('/api/course', course);
const mentorActivities = require('./api/mentor-activities.js');
app.use('/api/mentor-activities', mentorActivities);
const companyActivities = require('./api/company-activities.js');
app.use('/api/company-activities', companyActivities);
const createTrack = require('./api/create-track.js');
app.use('/api/create-track', createTrack);

app.listen(PORT, HOST, () => {
    console.log(`Server running at http://${HOST}:${PORT}/`);
});
