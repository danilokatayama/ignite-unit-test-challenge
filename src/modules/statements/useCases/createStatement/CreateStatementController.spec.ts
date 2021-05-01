import { hash } from 'bcryptjs';
import request from 'supertest';
import { Connection, createConnection } from 'typeorm';
import { v4 as uuid } from 'uuid';

import { app } from '../../../../app';

let connection: Connection;
let authToken: string;
const receiver_id = uuid();

describe('Create Statement Controller', () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();

    const password = await hash('1234', 8);

    await connection.query(
      `INSERT INTO users(id, name, email, password, created_at, updated_at)
      VALUES('${uuid()}', 'User Test', 'user@email.com', '${password}', 'now()', 'now()')
      `,
    );

    await connection.query(
      `INSERT INTO users(id, name, email, password, created_at, updated_at)
      VALUES('${receiver_id}', 'Receiver Test', 'receiver@email.com', '${password}', 'now()', 'now()')
      `,
    );

    const responseToken = await request(app).post('/api/v1/sessions').send({
      email: 'user@email.com',
      password: '1234',
    });

    authToken = responseToken.body.token;
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it('should be able to create a deposit statement', async () => {
    const response = await request(app)
      .post('/api/v1/statements/deposit')
      .send({
        amount: 500,
        description: 'Deposit description',
      })
      .set({
        Authorization: `Bearer ${authToken}`,
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');
    expect(response.body.amount).toBe(500);
  });

  it('should be able to create a withdraw statement', async () => {
    const response = await request(app)
      .post('/api/v1/statements/withdraw')
      .send({
        amount: 300,
        description: 'Withdraw description',
      })
      .set({
        Authorization: `Bearer ${authToken}`,
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');
    expect(response.body.amount).toBe(300);
  });

  it('should not be able to create a withdraw statement whitout funds', async () => {
    const response = await request(app)
      .post('/api/v1/statements/withdraw')
      .send({
        amount: 300,
        description: 'Withdraw description',
      })
      .set({
        Authorization: `Bearer ${authToken}`,
      });

    expect(response.status).toBe(400);
  });

  it('should be able to create a transfer statement', async () => {
    const response = await request(app)
      .post(`/api/v1/statements/transfer/${receiver_id}`)
      .send({
        amount: 200,
        description: 'Transfer description',
      })
      .set({
        Authorization: `Bearer ${authToken}`,
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');
    expect(response.body.amount).toBe(200);
  });

  it('should not be able to create a transfer statement to non-existent user', async () => {
    const response = await request(app)
      .post('/api/v1/statements/tranfer/non-existent-user')
      .send({
        amount: 300,
        description: 'Transfer description',
      })
      .set({
        Authorization: `Bearer ${authToken}`,
      });

    expect(response.status).toBe(404);
  });
});
