import request from 'supertest';
import app from '../index.js';

describe('Bug Routes', () => {
  let authToken;
  let createdBugId;

  beforeAll(async () => {
    // Register a test user and get token
    const userResponse = await request(app)
      .post('/api/users/register')
      .send({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      });
    
    authToken = userResponse.body.token;
  });

  describe('GET /api/bugs', () => {
    it('should get all bugs', async () => {
      const response = await request(app)
        .get('/api/bugs')
        .expect(200);

      expect(response.body).toHaveProperty('bugs');
      expect(response.body).toHaveProperty('pagination');
      expect(Array.isArray(response.body.bugs)).toBe(true);
    });

    it('should filter bugs by status', async () => {
      const response = await request(app)
        .get('/api/bugs?status=open')
        .expect(200);

      expect(response.body.bugs.every(bug => bug.status === 'open')).toBe(true);
    });
  });

  describe('POST /api/bugs', () => {
    it('should create a new bug', async () => {
      const bugData = {
        title: 'Test Bug',
        description: 'This is a test bug description',
        priority: 'medium',
      };

      const response = await request(app)
        .post('/api/bugs')
        .set('Authorization', `Bearer ${authToken}`)
        .send(bugData)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.title).toBe(bugData.title);
      expect(response.body.description).toBe(bugData.description);
      createdBugId = response.body.id;
    });

    it('should return 401 without auth token', async () => {
      const bugData = {
        title: 'Test Bug',
        description: 'This is a test bug description',
        priority: 'medium',
      };

      await request(app)
        .post('/api/bugs')
        .send(bugData)
        .expect(401);
    });

    it('should validate required fields', async () => {
      const invalidBugData = {
        title: 'AB', // Too short
        description: 'Short', // Too short
        priority: 'invalid', // Invalid priority
      };

      await request(app)
        .post('/api/bugs')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidBugData)
        .expect(400);
    });
  });

  describe('GET /api/bugs/:id', () => {
    it('should get a specific bug', async () => {
      if (createdBugId) {
        const response = await request(app)
          .get(`/api/bugs/${createdBugId}`)
          .expect(200);

        expect(response.body.id).toBe(createdBugId);
      }
    });

    it('should return 404 for non-existent bug', async () => {
      await request(app)
        .get('/api/bugs/99999')
        .expect(404);
    });
  });

  describe('PUT /api/bugs/:id', () => {
    it('should update a bug', async () => {
      if (createdBugId) {
        const updateData = {
          title: 'Updated Test Bug',
          description: 'Updated description',
          priority: 'high',
          status: 'in-progress',
        };

        const response = await request(app)
          .put(`/api/bugs/${createdBugId}`)
          .set('Authorization', `Bearer ${authToken}`)
          .send(updateData)
          .expect(200);

        expect(response.body.title).toBe(updateData.title);
        expect(response.body.status).toBe(updateData.status);
      }
    });
  });

  describe('GET /api/bugs/stats', () => {
    it('should get bug statistics', async () => {
      const response = await request(app)
        .get('/api/bugs/stats')
        .expect(200);

      expect(response.body).toHaveProperty('total');
      expect(response.body).toHaveProperty('statusBreakdown');
      expect(response.body).toHaveProperty('priorityBreakdown');
    });
  });

  describe('DELETE /api/bugs/:id', () => {
    it('should delete a bug', async () => {
      if (createdBugId) {
        await request(app)
          .delete(`/api/bugs/${createdBugId}`)
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);
      }
    });
  });
});