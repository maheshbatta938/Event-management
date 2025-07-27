const router = require('express').Router();
const Registration = require('../models/Registration');
const Event = require('../models/Event');
const { authMiddleware } = require('../middleware/auth');

// Register for event (checks capacity)
router.post('/:eventId', authMiddleware, async (req, res) => {
  try {
    const event = await Event.findById(req.params.eventId);
    if(!event) return res.status(404).json({ message: 'Event not found' });
    if(!event.approved) return res.status(400).json({ message: 'Event not approved yet' });

    const regCount = await Registration.countDocuments({ event: event._id });
    if(regCount >= event.capacity) return res.status(400).json({ message: 'Event capacity full' });

    // Check if already registered
    const existing = await Registration.findOne({ event: event._id, user: req.user._id });
    if(existing) return res.status(400).json({ message: 'Already registered' });

    const registration = new Registration({ event: event._id, user: req.user._id });
    await registration.save();

    res.json({ message: 'Registered successfully', registration });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get user's registrations
router.get('/', authMiddleware, async (req, res) => {
  try {
    const registrations = await Registration.find({ user: req.user._id }).populate('event');
    res.json(registrations);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Cancel registration
router.delete('/:registrationId', authMiddleware, async (req, res) => {
  try {
    const registration = await Registration.findById(req.params.registrationId);
    if(!registration) return res.status(404).json({ message: 'Registration not found' });
    if(registration.user.toString() !== req.user._id) return res.status(403).json({ message: 'Not authorized' });

    await registration.remove();
    res.json({ message: 'Registration cancelled' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
