import { InMemoryUsersRepository } from '../../../users/repositories/in-memory/InMemoryUsersRepository';
import { OperationType } from '../../entities/Statement';
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
      type: OperationType.DEPOSIT,
      description: 'Deposit description',
    });

    expect(statement).toHaveProperty('id');
  });

  it('should not be able to create a new statement with a non-existent user', async () => {
    await expect(
      createStatementUseCase.execute({
        user_id: 'non-existent-user',
        amount: 123,
        type: OperationType.DEPOSIT,
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
        type: OperationType.WITHDRAW,
        description: 'Withdraw description',
      }),
    ).rejects.toBeInstanceOf(CreateStatementError.InsufficientFunds);
  });

  it('should not be able to create a new statement (transfer) to a non-existent user', async () => {
    const user = await inMemoryUsersRepository.create({
      name: 'User',
      email: 'example@example.com',
      password: '123456',
    });

    await expect(
      createStatementUseCase.execute({
        user_id: user.id!,
        receiver_id: 'unexistent user',
        amount: 123,
        type: OperationType.TRANSFER,
        description: 'Withdraw description',
      }),
    ).rejects.toBeInstanceOf(CreateStatementError.UserNotFound);
  });

  it('should not be able to create a new statement (transfer) with insufficient funds', async () => {
    const sender = await inMemoryUsersRepository.create({
      name: 'Sender',
      email: 'sender@example.com',
      password: '123456',
    });

    const receiver = await inMemoryUsersRepository.create({
      name: 'Receiver',
      email: 'receiver@example.com',
      password: '123456',
    });

    await expect(
      createStatementUseCase.execute({
        user_id: sender.id!,
        receiver_id: receiver.id!,
        amount: 123,
        type: OperationType.TRANSFER,
        description: 'Withdraw description',
      }),
    ).rejects.toBeInstanceOf(CreateStatementError.InsufficientFunds);
  });
});
