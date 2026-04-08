jest.mock('pino-roll', () => ({
  default: jest.fn().mockResolvedValue({
    write: jest.fn(),
    on: jest.fn().mockReturnThis(),
    end: jest.fn(),
  }),
}));
