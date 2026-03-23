function requireAuth(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  return res.status(401).json({ data: null, error: 'Unauthorized' });
}

module.exports = { requireAuth };
