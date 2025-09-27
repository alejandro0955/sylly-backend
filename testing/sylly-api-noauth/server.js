require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const userRoutes = require('./routes/userRoutes');
const syllabusRoutes = require('./routes/syllabusRoutes');
const plannerRoutes = require('./routes/plannerRoutes');
const chatRoutes = require('./routes/chatRoutes');

const app = express();
app.use(helmet());
app.use(cors({ origin: '*', credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(morgan('dev'));

app.get('/api/health', (req,res)=>res.json({ ok:true }));

app.use('/api/users', userRoutes);
app.use('/api/syllabi', syllabusRoutes);
app.use('/api/planner', plannerRoutes);
app.use('/api/chat', chatRoutes);

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`API on :${port}`));
