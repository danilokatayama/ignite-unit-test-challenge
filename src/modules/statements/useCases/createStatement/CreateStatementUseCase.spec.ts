import { InMemoryUsersRepository } from '../../../users/repositories/in-memory/InMemoryUsersRepository';
import { InMemoryStatementsRepository } from '../../repositories/in-memory/InMemoryStatementsRepository';
import { CreateStatementError } from './CreateStatementError';
import { CreateStatementUseCase } from './CreateStatementUseCase';

let inMemoryUsersRepository: InMemoryUsersRepository;
let inMemorystatementsRepository: InMemoryStatementsRepository;
let createStatementUseCase: CreateStatementUseCase;

describe('Create Statement Use Case', () => {
  beforeAll(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    inMemorystatementsRepository = new InMemoryStatementsRepository();
    createStatementUseCase = new CreateStatementUseCase(
      inMemoryUsersRepository,
      inMemorystatementsRepository,
    );
  });

  it('should be able to create a new statement', async () => {
    const user = await inMemoryUsersRepository.create({
      name: 'User',
      email: 'example@example.com',
      password: '123456',
    });

    const statement = await createStatementUseCase.execute({
      user_id: user.id!,
      amount: 123,
      type: 'deposit' as any,
      description: 'Deposit description',
    });

    expect(statement).toHaveProperty('id');
  });

  it('should not be able to create a new statement with a non-existent user', async () => {
    await expect(
      createStatementUseCase.execute({
        user_id: 'non-existent-user',
        amount: 123,
        type: 'deposit' as any,
        description: 'Deposit description',
      }),
    ).rejects.toBeInstanceOf(CreateStatementError.UserNotFound);
  });

  it('should not be able to create a new statement (withdraw) with insufficient funds', async () => {
    const user = await inMemoryUsersRepository.create({
      name: 'User',
      email: 'example@example.com',
      password: '123456',
    });

    await expect(
      createStatementUseCase.execute({
        user_id: user.id!,
        amount: 123,
        type: 'withdraw' as any,
        description: 'Withdraw description',
      }),
    ).rejects.toBeInstanceOf(CreateStatementError.InsufficientFunds);
  });
});
