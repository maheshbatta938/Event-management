const request = require('supertest');
const app = require('../server');
const mongoose = require('mongoose');
const User = require('../models/User');
const Event = require('../models/Event');
const Registration = require('../models/Registration');

describe('Event Management System API', () => {
  let testUser, testAdmin, testEvent, authToken, adminToken;

  beforeAll(async () => {
    // Connect to test database
    await mongoose.connect(process.env.MONGODB_URI_TEST || 'mongodb://localhost:27017/event-management-test');
  });

  beforeEach(async () => {
    // Clear test data
    await User.deleteMany({});
    await Event.deleteMany({});
    await Registration.deleteMany({});

    // Create test user
    testUser = await User.create({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      phone: '+1234567890'
    });

    // Create test admin
    testAdmin = await User.create({
      name: 'Test Admin',
      email: 'admin@example.com',
      password: 'password123',
      role: 'admin',
      phone: '+1234567891'
    });

    // Create test event
    testEvent = await Event.create({
      title: 'Test Event',
      description: 'A test event for testing purposes',
      date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      time: '14:00',
      location: 'Test Location',
      capacity: 100,
      category: 'technology',
      organizer: testUser._id,
      status: 'approved'
    });
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  describe('Authentication', () => {
    test('should register a new user', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'New User',
          email: 'newuser@example.com',
          password: 'password123',
          phone: '+1234567892'
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.email).toBe('newuser@example.com');
      expect(res.body.data.token).toBeDefined();
    });

    test('should login user and return token', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123'
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.token).toBeDefined();
      authToken = res.body.data.token;
    });

    test('should get current user profile', async () => {
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123'
        });

      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${loginRes.body.data.token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.email).toBe('test@example.com');
    });
  });

  describe('Events', () => {
    beforeEach(async () => {
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123'
        });
      authToken = loginRes.body.data.token;
    });

    test('should get all events', async () => {
      const res = await request(app)
        .get('/api/events');

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].title).toBe('Test Event');
    });

    test('should get single event', async () => {
      const res = await request(app)
        .get(`/api/events/${testEvent._id}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.event.title).toBe('Test Event');
    });

    test('should create new event', async () => {
      const res = await request(app)
        .post('/api/events')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'New Test Event',
          description: 'A new test event',
          date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
          time: '15:00',
          location: 'New Test Location',
          capacity: 50,
          category: 'business'
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toBe('New Test Event');
    });

    test('should update event', async () => {
      const res = await request(app)
        .put(`/api/events/${testEvent._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Updated Test Event',
          capacity: 150
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toBe('Updated Test Event');
      expect(res.body.data.capacity).toBe(150);
    });
  });

  describe('Registrations', () => {
    beforeEach(async () => {
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123'
        });
      authToken = loginRes.body.data.token;
    });

    test('should register for event', async () => {
      const res = await request(app)
        .post('/api/registrations')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          eventId: testEvent._id,
          notes: 'Looking forward to attending!'
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('confirmed');
    });

    test('should get user registrations', async () => {
      // First register for event
      await request(app)
        .post('/api/registrations')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          eventId: testEvent._id
        });

      const res = await request(app)
        .get('/api/registrations/my')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].event.title).toBe('Test Event');
    });

    test('should cancel registration', async () => {
      // First register for event
      const registerRes = await request(app)
        .post('/api/registrations')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          eventId: testEvent._id
        });

      const registrationId = registerRes.body.data._id;

      const res = await request(app)
        .put(`/api/registrations/${registrationId}/cancel`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('cancelled');
    });
  });

  describe('Admin Functions', () => {
    beforeEach(async () => {
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'admin@example.com',
          password: 'password123'
        });
      adminToken = loginRes.body.data.token;
    });

    test('should get all users (admin only)', async () => {
      const res = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(2); // testUser and testAdmin
    });

    test('should get system statistics (admin only)', async () => {
      const res = await request(app)
        .get('/api/users/stats/overview')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.users.total).toBe(2);
      expect(res.body.data.events.total).toBe(1);
    });

    test('should approve event (admin only)', async () => {
      // Create a pending event
      const pendingEvent = await Event.create({
        title: 'Pending Event',
        description: 'A pending event',
        date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
        time: '16:00',
        location: 'Pending Location',
        capacity: 75,
        category: 'education',
        organizer: testUser._id,
        status: 'pending'
      });

      const res = await request(app)
        .put(`/api/events/${pendingEvent._id}/approve`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          status: 'approved',
          reason: 'Event meets requirements'
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('approved');
    });
  });

  describe('Error Handling', () => {
    test('should return 404 for non-existent event', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .get(`/api/events/${fakeId}`);

      expect(res.statusCode).toBe(404);
      expect(res.body.success).toBe(false);
    });

    test('should return 401 for unauthorized access', async () => {
      const res = await request(app)
        .get('/api/auth/me');

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
    });

    test('should return 403 for insufficient permissions', async () => {
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123'
        });

      const res = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${loginRes.body.data.token}`);

      expect(res.statusCode).toBe(403);
      expect(res.body.success).toBe(false);
    });
  });
}); 