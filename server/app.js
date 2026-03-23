require('dotenv').config();
const express = require('express');
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');

const authRoutes = require('./routes/auth');
const statsRoutes = require('./routes/stats');
const eventsRoutes = require('./routes/events');
const buffsRoutes = require('./routes/buffs');

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json());
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'dev-secret',
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());

app.use('/api/auth', authRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/events', eventsRoutes);
app.use('/api/buffs', buffsRoutes);

module.exports = app;
