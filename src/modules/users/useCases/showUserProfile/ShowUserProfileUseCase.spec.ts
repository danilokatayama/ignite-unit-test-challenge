import { hash } from 'bcryptjs';

import { InMemoryUsersRepository } from '../../repositories/in-memory/InMemoryUsersRepository';
import { ShowUserProfileError } from './ShowUserProfileError';
import { ShowUserProfileUseCase } from './ShowUserProfileUseCase';

let showUserProfileUseCase: ShowUserProfileUseCase;
let usersRepository: InMemoryUsersRepository;

describe('AuthenticateUser useCase', () => {
  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository();
    showUserProfileUseCase = new ShowUserProfileUseCase(usersRepository);
  });

  it('should be able to show an user profile', async () => {
    const passwordHash = await hash('123456', 8);

    const user = await usersRepository.create({
      name: 'User',
      email: 'example@example.com',
      password: passwordHash,
    });

    const profile = await showUserProfileUseCase.execute(user.id!);

    expect(profile).toHaveProperty('id');
  });

  it('should not be able to show profile from a non-existent user', async () => {
    await expect(
      showUserProfileUseCase.execute('unexistent-user'),
    ).rejects.toBeInstanceOf(ShowUserProfileError);
  });
});
