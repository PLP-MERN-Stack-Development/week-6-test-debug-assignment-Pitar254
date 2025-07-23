import { logger } from '../utils/logger.js';

describe('Logger Utility', () => {
  let consoleSpy;

  beforeEach(() => {
    consoleSpy = jest.spyOn(console, 'log').mockImplementation();
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  it('should log info messages', () => {
    logger.info('Test message');
    expect(consoleSpy).toHaveBeenCalled();
  });

  it('should format messages correctly', () => {
    const message = logger.formatMessage('INFO', 'Test message', { key: 'value' });
    const parsed = JSON.parse(message);
    
    expect(parsed).toHaveProperty('timestamp');
    expect(parsed).toHaveProperty('level', 'INFO');
    expect(parsed).toHaveProperty('message', 'Test message');
    expect(parsed).toHaveProperty('key', 'value');
  });
});