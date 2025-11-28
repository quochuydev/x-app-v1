import type { UpdateUserRequest, User, UserResponse, ErrorResponse } from '../types';

export const updateUserRequest: UpdateUserRequest = {
  name: 'John Updated',
  email: 'john.updated@example.com',
};

export const partialUpdateUserRequest: UpdateUserRequest = {
  name: 'John Partial',
};

export const updatedUser: User = {
  id: 1,
  name: 'John Updated',
  email: 'john.updated@example.com',
  active: true,
  createdAt: new Date('2024-01-01T00:00:00.000Z'),
  updatedAt: new Date('2024-01-02T00:00:00.000Z'),
};

export const updateUserResponse: UserResponse = {
  user: updatedUser,
};

export const userNotFoundError: ErrorResponse = {
  error: 'User not found',
};
