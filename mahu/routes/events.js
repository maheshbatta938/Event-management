const router = require('express').Router();
const Event = require('../models/Event');
const Registration = require('../models/Registration');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

// Create event (logged users)
router.post('/', authMiddleware, async (req, res) => {
  try {
    const event = new Event({ ...req.body, createdBy: req.user._id, approved: false });
    await event.save();
    res.json(event);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all approved events, with optional filter
router.get('/', async (req, res) => {
  try {
    const { date, location } = req.query;
    let filter = { approved: true };
    if(date) filter.date = new Date(date);
    if(location) filter.location = location;

    const events = await Event.find(filter);
    res.json(events);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Admin: get pending events
router.get('/pending', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const pending = await Event.find({ approved: false });
    res.json(pending);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Admin: approve event
router.put('/approve/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    event.approved = true;
    await event.save();
    res.json({ message: 'Event approved', event });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update event by creator
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if(!event) return res.status(404).json({ message: 'Event not found' });
    if(event.createdBy.toString() !== req.user._id) return res.status(403).json({ message: 'Not authorized' });

    Object.assign(event, req.body);
    event.approved = false; // needs re-approval on update
    await event.save();
    res.json(event);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete event by creator
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if(!event) return res.status(404).json({ message: 'Event not found' });
    if(event.createdBy.toString() !== req.user._id) return res.status(403).json({ message: 'Not authorized' });

    await event.remove();
    // Also remove registrations
    await Registration.deleteMany({ event: event._id });

    res.json({ message: 'Event deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
