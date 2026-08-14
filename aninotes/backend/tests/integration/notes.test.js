import { expect } from 'chai';
import request from 'supertest';
import app from '../../src/app.js';

describe('Integration: /api/notes', () => {
  const userA = { username: 'alice', email: 'alice@example.com', password: 'secret123' };
  const userB = { username: 'bob', email: 'bob@example.com', password: 'secret123' };

  let tokenA;
  let tokenB;

  beforeEach(async () => {
    await request(app).post('/api/auth/register').send(userA);
    await request(app).post('/api/auth/register').send(userB);

    const loginA = await request(app).post('/api/auth/login').send({ email: userA.email, password: userA.password });
    const loginB = await request(app).post('/api/auth/login').send({ email: userB.email, password: userB.password });

    tokenA = loginA.body.token;
    tokenB = loginB.body.token;
  });

  describe('POST /api/notes', () => {
    it('should create a note for the authenticated user', async () => {
      const res = await request(app)
        .post('/api/notes')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({ title: 'My Note', content: 'Some content' });

      expect(res.status).to.equal(201);
      expect(res.body.data.title).to.equal('My Note');
    });

    it('should reject a request with no token with 401', async () => {
      const res = await request(app).post('/api/notes').send({ title: 'X', content: 'Y' });
      expect(res.status).to.equal(401);
    });

    it('should reject a missing title with 400', async () => {
      const res = await request(app)
        .post('/api/notes')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({ content: 'No title here' });
      expect(res.status).to.equal(400);
    });
  });

  describe('GET /api/notes', () => {
    it("should return only the authenticated user's notes", async () => {
      await request(app).post('/api/notes').set('Authorization', `Bearer ${tokenA}`).send({ title: 'Alice Note', content: 'A' });
      await request(app).post('/api/notes').set('Authorization', `Bearer ${tokenB}`).send({ title: 'Bob Note', content: 'B' });

      const res = await request(app).get('/api/notes').set('Authorization', `Bearer ${tokenA}`);

      expect(res.status).to.equal(200);
      expect(res.body.count).to.equal(1);
      expect(res.body.data[0].title).to.equal('Alice Note');
    });
  });

  describe('GET /api/notes/:id', () => {
    let noteId;

    beforeEach(async () => {
      const res = await request(app).post('/api/notes').set('Authorization', `Bearer ${tokenA}`).send({ title: 'Alice Note', content: 'A' });
      noteId = res.body.data._id;
    });

    it('should return the note when it belongs to the requester', async () => {
      const res = await request(app).get(`/api/notes/${noteId}`).set('Authorization', `Bearer ${tokenA}`);
      expect(res.status).to.equal(200);
    });

    it('should return 404 when another user requests it (ownership enforced)', async () => {
      const res = await request(app).get(`/api/notes/${noteId}`).set('Authorization', `Bearer ${tokenB}`);
      expect(res.status).to.equal(404);
    });

    it('should return 400 for a malformed note id', async () => {
      const res = await request(app).get('/api/notes/not-a-real-id').set('Authorization', `Bearer ${tokenA}`);
      expect(res.status).to.equal(400);
    });

    it('should return 404 for a well-formed but nonexistent note id', async () => {
      const fakeId = '64f000000000000000000000';
      const res = await request(app).get(`/api/notes/${fakeId}`).set('Authorization', `Bearer ${tokenA}`);
      expect(res.status).to.equal(404);
    });
  });

  describe('PUT /api/notes/:id', () => {
    let noteId;

    beforeEach(async () => {
      const res = await request(app).post('/api/notes').set('Authorization', `Bearer ${tokenA}`).send({ title: 'Original', content: 'Original content' });
      noteId = res.body.data._id;
    });

    it('should update the note when the requester owns it', async () => {
      const res = await request(app).put(`/api/notes/${noteId}`).set('Authorization', `Bearer ${tokenA}`).send({ title: 'Updated' });
      expect(res.status).to.equal(200);
      expect(res.body.data.title).to.equal('Updated');
      expect(res.body.data.content).to.equal('Original content');
    });

    it('should return 404 when another user tries to update it (ownership enforced)', async () => {
      const res = await request(app).put(`/api/notes/${noteId}`).set('Authorization', `Bearer ${tokenB}`).send({ title: 'Hacked' });
      expect(res.status).to.equal(404);
    });
  });

  describe('DELETE /api/notes/:id', () => {
    let noteId;

    beforeEach(async () => {
      const res = await request(app).post('/api/notes').set('Authorization', `Bearer ${tokenA}`).send({ title: 'To delete', content: 'Bye' });
      noteId = res.body.data._id;
    });

    it('should return 404 when another user tries to delete it (ownership enforced)', async () => {
      const res = await request(app).delete(`/api/notes/${noteId}`).set('Authorization', `Bearer ${tokenB}`);
      expect(res.status).to.equal(404);
    });

    it('should delete the note when the requester owns it', async () => {
      const res = await request(app).delete(`/api/notes/${noteId}`).set('Authorization', `Bearer ${tokenA}`);
      expect(res.status).to.equal(200);

      const getRes = await request(app).get(`/api/notes/${noteId}`).set('Authorization', `Bearer ${tokenA}`);
      expect(getRes.status).to.equal(404);
    });
  });
});

describe('Integration: unknown routes', () => {
  it('should return a clean 404 JSON for an unmatched route', async () => {
    const res = await request(app).get('/api/doesnotexist');
    expect(res.status).to.equal(404);
    expect(res.body.success).to.equal(false);
  });
});
