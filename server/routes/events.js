const express = require('express');

const router = express.Router();

router.get('/', (req, res) => {
  res.json({ data: null, error: null });
});

router.post('/:id/trigger', (req, res) => {
  res.json({ data: null, error: null });
});

router.post('/', (req, res) => {
  res.json({ data: null, error: null });
});

router.put('/:id', (req, res) => {
  res.json({ data: null, error: null });
});

router.delete('/:id', (req, res) => {
  res.json({ data: null, error: null });
});

module.exports = router;
