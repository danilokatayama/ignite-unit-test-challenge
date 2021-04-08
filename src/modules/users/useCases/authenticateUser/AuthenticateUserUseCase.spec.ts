import { hash } from 'bcryptjs';
import { InMemoryUsersRepository } from '../../repositories/in-memory/InMemoryUsersRepository';
import { AuthenticateUserUseCase } from './AuthenticateUserUseCase';
import { IncorrectEmailOrPasswordError } from './IncorrectEmailOrPasswordError';

let authenticateUserUseCase: AuthenticateUserUseCase;
let inMemoryUsersRepository: InMemoryUsersRepository;

describe('AuthenticateUser useCase', () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository()
    authenticateUserUseCase = new AuthenticateUserUseCase(inMemoryUsersRepository)
  });

  it('should be able to authenticate', async () => {
    const passwordHash = await hash('123456', 8);

    await inMemoryUsersRepository.create({
      name: 'User',
      email: 'example@example.com',
      password: passwordHash,
    });

    const authInfo = await authenticateUserUseCase.execute({
      email: 'example@example.com',
      password: '123456'
    });

    expect(authInfo).toHaveProperty('token');
  });

  it('should not be able to authenticate with a non-existent user', async () => {
    await expect(
      authenticateUserUseCase.execute({
        email: 'non-existent@email.com',
        password: '123456'
      })
    ).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError);
  });

  it('should not be able to authenticate with an incorrect password', async () => {
    const passwordHash = await hash('123456', 8);

    await inMemoryUsersRepository.create({
      name: 'User',
      email: 'example@example.com',
      password: passwordHash,
    });

    await expect(
      authenticateUserUseCase.execute({
        email: 'example@example.com',
        password: 'incorrect-password'
      })
    ).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError)
  });
});