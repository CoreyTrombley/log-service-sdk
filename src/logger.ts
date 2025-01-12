import axios from 'axios';
import winston from 'winston';
import Transport from 'winston-transport';

export class LoggingServiceTransport extends Transport {
  private apiToken: string;
  private endpoint: string;
  private applicationId: string;

  constructor(options: { apiToken: string; endpoint?: string, applicationId: string }) {
    super();
    this.applicationId = options.applicationId
    this.apiToken = options.apiToken;
    this.endpoint = options.endpoint || 'http://localhost:5000/logs';
  }

  log(info: any, callback: () => void) {
    const logPayload = {
      applicationId: info.applicationId || this.applicationId,
      level: info.level,
      message: info.message,
      metadata: info.metadata || {},
    };

    axios
      .post(this.endpoint, logPayload, {
        headers: {
          Authorization: `Bearer ${this.apiToken}`,
          'Content-Type': 'application/json',
        },
      })
      .then(() => callback())
      .catch((err) => {
        console.error('Failed to send log:', err.message);
        callback();
      });
  }
}

export function initializeLogger(applicationId: string, apiToken: string, endpoint?: string): winston.Logger {
  if (!apiToken) {
    throw new Error('API token is required to initialize the logger.');
  }

  return winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    transports: [
      new LoggingServiceTransport({
        apiToken,
        endpoint,
        applicationId
      }),
    ],
  });
}
