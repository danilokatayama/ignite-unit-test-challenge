import { hash } from 'bcryptjs';
import request from 'supertest';
import { Connection, createConnection } from 'typeorm';
import { v4 as uuid } from 'uuid';

import { app } from '../../../../app';

let connection: Connection;

describe('Authenticate User Controller', () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();

    const password = await hash('1234', 8);

    await connection.query(
      `INSERT INTO users(id, name, email, password, created_at, updated_at)
      VALUES('${uuid()}', 'User Test', 'user@email.com', '${password}', 'now()', 'now()')
      `,
    );
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it('should be able to authenticate', async () => {
    const response = await request(app).post('/api/v1/sessions').send({
      email: 'user@email.com',
      password: '1234',
    });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('token');
  });

  it('should not be able to authenticate with a non-existent user', async () => {
    const response = await request(app).post('/api/v1/sessions').send({
      email: 'non-existent@email.com',
      password: '1234',
    });

    expect(response.status).toBe(401);
  });

  it('should not be able to authenticate with an incorrect password', async () => {
    const response = await request(app).post('/api/v1/sessions').send({
      email: 'user@email.com',
      password: 'incorrect-password',
    });

    expect(response.status).toBe(401);
  });
});
