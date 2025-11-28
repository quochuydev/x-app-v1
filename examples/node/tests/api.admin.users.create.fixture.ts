import type { CreateUserRequest, User, UserResponse } from '../types';

export const createUserRequest: CreateUserRequest = {
  name: 'John Doe',
  email: 'john@example.com',
};

export const invalidCreateUserRequest: Partial<CreateUserRequest> = {
  name: 'John Doe',
  // Missing email
};

export const createdUser: User = {
  id: 1,
  name: 'John Doe',
  email: 'john@example.com',
  active: true,
  createdAt: new Date('2024-01-01T00:00:00.000Z'),
  updatedAt: new Date('2024-01-01T00:00:00.000Z'),
};

export const createUserResponse: UserResponse = {
  user: createdUser,
};
