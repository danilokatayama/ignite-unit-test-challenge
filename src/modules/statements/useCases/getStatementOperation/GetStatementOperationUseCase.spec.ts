import { GetStatementOperationUseCase } from './GetStatementOperationUseCase';
import { InMemoryUsersRepository } from '../../../users/repositories/in-memory/InMemoryUsersRepository';
import { InMemoryStatementsRepository } from '../../repositories/in-memory/InMemoryStatementsRepository';
import { GetStatementOperationError } from './GetStatementOperationError';

let inMemoryUsersRepository: InMemoryUsersRepository;
let inMemoryStatementsRepository: InMemoryStatementsRepository;
let getStatementOperationUseCase: GetStatementOperationUseCase;

describe('Get Statement Operation Use Case', () => {

  beforeAll(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    getStatementOperationUseCase = new GetStatementOperationUseCase(
      inMemoryUsersRepository,
      inMemoryStatementsRepository
    );
  });

  it('should be able to show the user statement', async () => {
    const user = await inMemoryUsersRepository.create({
      name: 'User', email: 'example@example.com', password: '123456'
    });

    const statement = await inMemoryStatementsRepository.create({
      user_id: user.id!,
      type: 'deposit' as any,
      amount: 3000,
      description: 'Deposit description'
    });

    const response = await getStatementOperationUseCase.execute({
      user_id: user.id!,
      statement_id: statement.id!
    });

    expect(response).toHaveProperty('id');
    expect(response.amount).toBe(3000);
  })

  it('should not be able to show a statement from a non-existent user', async () => {
    await expect(
      getStatementOperationUseCase.execute({
        user_id: 'non-existent-user-id',
        statement_id: 'statement-id'
      })
    ).rejects.toBeInstanceOf(GetStatementOperationError.UserNotFound);
  });

  it('should not be able to show a non-existent statement', async () => {
    const user = await inMemoryUsersRepository.create({
      name: 'User', email: 'example@example.com', password: '123456'
    });

    await expect(
      getStatementOperationUseCase.execute({
        user_id: user.id!,
        statement_id: 'non-existent-statement-id'
      })
    ).rejects.toBeInstanceOf(GetStatementOperationError.StatementNotFound);
  });
});