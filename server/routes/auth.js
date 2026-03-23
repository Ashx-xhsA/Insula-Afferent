const express = require('express');

const router = express.Router();

router.get('/google', (req, res) => {
  res.json({ data: null, error: null });
});

router.get('/google/callback', (req, res) => {
  res.json({ data: null, error: null });
});

router.get('/me', (req, res) => {
  res.json({ data: null, error: null });
});

router.post('/logout', (req, res) => {
  res.json({ data: null, error: null });
});

module.exports = router;
