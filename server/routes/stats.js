const express = require('express');

const router = express.Router();

router.get('/', (req, res) => {
  res.json({ data: null, error: null });
});

router.post('/:id/restore', (req, res) => {
  res.json({ data: null, error: null });
});

router.patch('/:id', (req, res) => {
  res.json({ data: null, error: null });
});

module.exports = router;
