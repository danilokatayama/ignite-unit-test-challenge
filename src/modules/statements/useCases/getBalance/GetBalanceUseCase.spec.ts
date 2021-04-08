import { GetBalanceUseCase } from './GetBalanceUseCase';
import { InMemoryUsersRepository } from '../../../users/repositories/in-memory/InMemoryUsersRepository';
import { InMemoryStatementsRepository } from '../../repositories/in-memory/InMemoryStatementsRepository';
import { GetBalanceError } from './GetBalanceError';

let inMemoryUsersRepository: InMemoryUsersRepository;
let inMemoryStatementsRepository: InMemoryStatementsRepository;
let getBalanceUseCase: GetBalanceUseCase;

describe('Get Balance Use Case', () => {

  beforeAll(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    getBalanceUseCase = new GetBalanceUseCase(
      inMemoryStatementsRepository,
      inMemoryUsersRepository
    );
  });

  it('should be able to show the user balance', async () => {
    const user = await inMemoryUsersRepository.create({
      name: 'User', email: 'example@example.com', password: '123456'
    });

    await inMemoryStatementsRepository.create({
      user_id: user.id!,
      type: 'deposit' as any,
      amount: 3000,
      description: 'Deposit description'
    });

    await inMemoryStatementsRepository.create({
      user_id: user.id!,
      type: 'withdraw' as any,
      amount: 1000,
      description: 'Withdraw description'
    });

    const balance = await getBalanceUseCase.execute({ user_id: user.id! });

    expect(balance.balance).toBe(2000);
  });

  it('should not be able to show the balance of a non-existent user', async () => {
    await expect(
      getBalanceUseCase.execute({ user_id: 'non-existent-user-id' })
    ).rejects.toBeInstanceOf(GetBalanceError)
  });
});