import axios from 'axios';
import winston from 'winston';
import { LoggingServiceTransport, initializeLogger } from '../src/logger';

// Mock Axios to prevent real HTTP requests
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('LoggingServiceTransport', () => {
  it('should initialize with provided options', () => {
    const transport = new LoggingServiceTransport({
      apiToken: 'test-token',
      endpoint: 'http://example.com/logs',
      applicationId: 'test-app',
    });
    expect(transport).toBeDefined();
    expect((transport as any).apiToken).toBe('test-token');
    expect((transport as any).endpoint).toBe('http://example.com/logs');
    expect((transport as any).applicationId).toBe('test-app');
  });

  it('should default to localhost endpoint if none is provided', () => {
    const transport = new LoggingServiceTransport({
      apiToken: 'test-token',
      applicationId: 'test-app',
    });
    expect((transport as any).endpoint).toBe('http://localhost:5000/logs');
  });

  it('should use applicationId from options when logging', async () => {
    mockedAxios.post.mockResolvedValueOnce({ status: 200 });
    const transport = new LoggingServiceTransport({
      apiToken: 'test-token',
      applicationId: 'test-app',
    });

    const callback = jest.fn();
    transport.log(
      { level: 'info', message: 'Test log', metadata: { key: 'value' } },
      callback,
    );

    await new Promise(process.nextTick); // Wait for async callback
    expect(mockedAxios.post).toHaveBeenCalledWith(
      'http://localhost:5000/logs',
      {
        applicationId: 'test-app',
        level: 'info',
        message: 'Test log',
        metadata: { key: 'value' },
      },
      {
        headers: {
          Authorization: 'Bearer test-token',
          'Content-Type': 'application/json',
        },
      },
    );
    expect(callback).toHaveBeenCalled();
  });

  it('should allow overriding applicationId during logging', async () => {
    mockedAxios.post.mockResolvedValueOnce({ status: 200 });
    const transport = new LoggingServiceTransport({
      apiToken: 'test-token',
      applicationId: 'default-app',
    });

    const callback = jest.fn();
    transport.log(
      { level: 'info', message: 'Overridden app log', applicationId: 'override-app' },
      callback,
    );

    await new Promise(process.nextTick); // Wait for async callback
    expect(mockedAxios.post).toHaveBeenCalledWith(
      'http://localhost:5000/logs',
      {
        applicationId: 'override-app',
        level: 'info',
        message: 'Overridden app log',
        metadata: {},
      },
      {
        headers: {
          Authorization: 'Bearer test-token',
          'Content-Type': 'application/json',
        },
      },
    );
    expect(callback).toHaveBeenCalled();
  });

  it('should handle log sending failure gracefully', async () => {
    // Mock Axios to reject the request
    mockedAxios.post.mockRejectedValueOnce(new Error('Network error'));
  
    // Mock console.error
    const consoleErrorMock = jest.spyOn(console, 'error').mockImplementation(() => {});
  
    const transport = new LoggingServiceTransport({
      apiToken: 'test-token',
      applicationId: 'test-app',
    });
  
    const callback = jest.fn();
    transport.log({ level: 'error', message: 'Failed log' }, callback);
  
    await new Promise(process.nextTick); // Wait for async callback
  
    // Verify the callback was called
    expect(callback).toHaveBeenCalled();
  
    // Verify console.error was called with the correct message
    expect(consoleErrorMock).toHaveBeenCalledWith('Failed to send log:', 'Network error');
  
    // Restore the mocked console.error
    consoleErrorMock.mockRestore();
  });
});

describe('initializeLogger', () => {
  it('should throw an error if API token is not provided', () => {
    expect(() => initializeLogger('test-app', '')).toThrow('API token is required to initialize the logger.');
  });

  it('should create a Winston logger instance', () => {
    const logger = initializeLogger('test-app', 'test-token', 'http://example.com/logs');
    expect(logger).toBeInstanceOf(winston.Logger);
  });

  it('should log messages using the Winston logger with applicationId from initialization', () => {
    const logger = initializeLogger('test-app', 'test-token');
    mockedAxios.post.mockResolvedValueOnce({ status: 200 });

    logger.info('Test log', { metadata: { key: 'value' } });
    expect(mockedAxios.post).toHaveBeenCalledWith(
      'http://localhost:5000/logs',
      expect.objectContaining({
        applicationId: 'test-app',
        level: 'info',
        message: 'Test log',
        metadata: { key: 'value' },
      }),
      expect.anything(),
    );
  });

  it('should allow overriding applicationId during logging', () => {
    const logger = initializeLogger('default-app', 'test-token');
    mockedAxios.post.mockResolvedValueOnce({ status: 200 });

    logger.info('Overridden log', { applicationId: 'override-app' });
    expect(mockedAxios.post).toHaveBeenCalledWith(
      'http://localhost:5000/logs',
      expect.objectContaining({
        applicationId: 'override-app',
        level: 'info',
        message: 'Overridden log',
        metadata: {},
      }),
      expect.anything(),
    );
  });
});
