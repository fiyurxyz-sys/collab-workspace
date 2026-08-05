import request from 'supertest';
import { app } from '../src/index';
import { prisma } from '../src/db/prisma';

// Clean up test data before each test suite
beforeAll(async () => {
  await prisma.refreshToken.deleteMany();
  await prisma.user.deleteMany({ where: { email: { contains: '@test.com' } } });
});

afterAll(async () => {
  await prisma.refreshToken.deleteMany();
  await prisma.user.deleteMany({ where: { email: { contains: '@test.com' } } });
  await prisma.$disconnect();
});

const testUser = {
  email: 'auth-test@test.com',
  password: 'Password123',
  name: 'Test User',
};

let accessToken: string;
let refreshToken: string;
let cookieHeader: string[];

// ─── REGISTER ────────────────────────────────────────────
describe('POST /api/auth/register', () => {
  it('should register a new user and return tokens', async () => {
    const res = await request(app).post('/api/auth/register').send(testUser);

    expect(res.status).toBe(201);
    expect(res.body.user.email).toBe(testUser.email);
    expect(res.body.user.name).toBe(testUser.name);
    expect(res.body.user).not.toHaveProperty('password_hash');
    expect(res.body.accessToken).toBeDefined();
    expect(res.headers['set-cookie']).toBeDefined();

    accessToken = res.body.accessToken;
    cookieHeader = res.headers['set-cookie'];
  });

  it('should return 409 if email is already registered', async () => {
    const res = await request(app).post('/api/auth/register').send(testUser);
    expect(res.status).toBe(409);
    expect(res.body.error).toMatch(/already exists/i);
  });

  it('should return 400 for invalid email', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ ...testUser, email: 'not-an-email' });
    expect(res.status).toBe(400);
  });

  it('should return 400 for weak password (under 8 chars)', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ ...testUser, email: 'new@test.com', password: 'abc' });
    expect(res.status).toBe(400);
  });

  it('should return 400 for password missing uppercase', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ ...testUser, email: 'new2@test.com', password: 'password123' });
    expect(res.status).toBe(400);
  });
});

// ─── LOGIN ───────────────────────────────────────────────
describe('POST /api/auth/login', () => {
  it('should login and return access token + refresh cookie', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: testUser.email, password: testUser.password });

    expect(res.status).toBe(200);
    expect(res.body.accessToken).toBeDefined();
    expect(res.body.user).not.toHaveProperty('password_hash');
    expect(res.headers['set-cookie']).toBeDefined();

    accessToken = res.body.accessToken;
    cookieHeader = res.headers['set-cookie'];
  });

  it('should return 401 for wrong password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: testUser.email, password: 'WrongPass999' });
    expect(res.status).toBe(401);
    expect(res.body.error).toMatch(/invalid/i);
  });

  it('should return 401 for non-existent email', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'nobody@test.com', password: 'Password123' });
    expect(res.status).toBe(401);
  });

  it('should return 400 for missing credentials', async () => {
    const res = await request(app).post('/api/auth/login').send({});
    expect(res.status).toBe(400);
  });
});

// ─── ME ──────────────────────────────────────────────────
describe('GET /api/auth/me', () => {
  it('should return current user with valid access token', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe(testUser.email);
  });

  it('should return 401 without token', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });

  it('should return 401 with malformed token', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'Bearer this.is.garbage');
    expect(res.status).toBe(401);
  });
});

// ─── REFRESH ─────────────────────────────────────────────
describe('POST /api/auth/refresh', () => {
  it('should issue new tokens with valid refresh cookie', async () => {
    const res = await request(app)
      .post('/api/auth/refresh')
      .set('Cookie', cookieHeader);

    expect(res.status).toBe(200);
    expect(res.body.accessToken).toBeDefined();
    expect(res.headers['set-cookie']).toBeDefined();

    // Update tokens for logout test
    accessToken = res.body.accessToken;
    cookieHeader = res.headers['set-cookie'];
  });

  it('should return 401 with invalid refresh token', async () => {
    const res = await request(app)
      .post('/api/auth/refresh')
      .send({ refreshToken: 'invalid-token' });
    expect(res.status).toBe(401);
  });
});

// ─── LOGOUT ──────────────────────────────────────────────
describe('POST /api/auth/logout', () => {
  it('should logout and clear refresh cookie', async () => {
    const res = await request(app)
      .post('/api/auth/logout')
      .set('Cookie', cookieHeader);

    expect(res.status).toBe(200);
    // Cookie should be cleared
    const setCookie = res.headers['set-cookie']?.[0] ?? '';
    expect(setCookie).toMatch(/refresh_token=;/i);
  });

  it('should reject refresh token after logout (blacklisted)', async () => {
    const res = await request(app)
      .post('/api/auth/refresh')
      .set('Cookie', cookieHeader); // old, now revoked cookie

    expect(res.status).toBe(401);
  });
});
