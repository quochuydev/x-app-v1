export const loginRequest = {
  email: 'admin@example.com',
  password: 'password123',
};

export const invalidLoginRequest = {
  email: 'wrong@example.com',
  password: 'wrongpassword',
};

export const missingEmailRequest = {
  password: 'password123',
};

export const missingPasswordRequest = {
  email: 'admin@example.com',
};

export const loginResponse = {
  token: 'mock-jwt-token-1-1234567890',
  user: {
    id: 1,
    name: 'Admin User',
    email: 'admin@example.com',
  },
};

export const unauthorizedError = {
  error: 'Invalid credentials',
};

export const badRequestError = {
  error: 'Email and password are required',
};

export const logoutResponse = {
  message: 'Logged out successfully',
};

export const meResponse = {
  user: {
    id: 1,
    name: 'Admin User',
    email: 'admin@example.com',
  },
};
