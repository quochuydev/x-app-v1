import type { User, UsersListResponse } from '../types';

export const mockUser1: User = {
  id: 1,
  name: 'John Doe',
  email: 'john@example.com',
  active: true,
  createdAt: new Date('2024-01-01T00:00:00.000Z'),
  updatedAt: new Date('2024-01-01T00:00:00.000Z'),
};

export const mockUser2: User = {
  id: 2,
  name: 'Jane Smith',
  email: 'jane@example.com',
  active: true,
  createdAt: new Date('2024-01-02T00:00:00.000Z'),
  updatedAt: new Date('2024-01-02T00:00:00.000Z'),
};

export const mockUsersList: UsersListResponse = {
  users: [mockUser1, mockUser2],
};

export const emptyUsersList: UsersListResponse = {
  users: [],
};
