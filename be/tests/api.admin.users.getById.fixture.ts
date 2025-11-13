import type { User, UserResponse, ErrorResponse } from '../types';

export const mockUser: User = {
  id: 1,
  name: 'John Doe',
  email: 'john@example.com',
  active: true,
  createdAt: new Date('2024-01-01T00:00:00.000Z'),
  updatedAt: new Date('2024-01-01T00:00:00.000Z'),
};

export const userResponse: UserResponse = {
  user: mockUser,
};

export const userNotFoundError: ErrorResponse = {
  error: 'User not found',
};
