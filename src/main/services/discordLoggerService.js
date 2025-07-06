import https from 'node:https';
import { URL } from 'node:url';
import { DISCORD_CONFIG, shouldLogLevel, getAppInfo } from '../config/discordConfig.js';

class DiscordLoggerService {
  constructor() {
    this.webhookUrl = DISCORD_CONFIG.webhookUrl;
    this.queue = [];
    this.isProcessing = false;
    this.rateLimitDelay = DISCORD_CONFIG.rateLimitDelay;
  }

  /**
   * Send a log message to Discord
   * @param {string} message - The message to send
   * @param {string} level - Log level (info, warn, error, debug)
   * @param {Object} metadata - Additional metadata to include
   */
  async log(message, level = 'info', metadata = {}) {
    // Check if logging is enabled and level is allowed
    if (!shouldLogLevel(level)) {
      return;
    }

    const logEntry = {
      message,
      level,
      metadata,
      timestamp: new Date().toISOString(),
      process: process.type || 'main'
    };

    // Add to queue and process
    if (this.queue.length < DISCORD_CONFIG.maxQueueSize) {
      this.queue.push(logEntry);
      this.processQueue();
    } else {
      console.warn('Discord logger queue full, dropping log entry');
    }
  }

  /**
   * Convenience methods for different log levels
   */
  async info(message, metadata = {}) {
    return this.log(message, 'info', metadata);
  }

  async warn(message, metadata = {}) {
    return this.log(message, 'warn', metadata);
  }

  async error(message, metadata = {}) {
    return this.log(message, 'error', metadata);
  }

  async debug(message, metadata = {}) {
    return this.log(message, 'debug', metadata);
  }

  /**
   * Process the message queue with rate limiting
   */
  async processQueue() {
    if (this.isProcessing || this.queue.length === 0) {
      return;
    }

    this.isProcessing = true;

    while (this.queue.length > 0) {
      const logEntry = this.queue.shift();
      
      try {
        await this.sendToDiscord(logEntry);
        
        // Rate limiting delay
        if (this.queue.length > 0) {
          await new Promise(resolve => setTimeout(resolve, this.rateLimitDelay));
        }
      } catch (error) {
        console.error('Failed to send log to Discord:', error);
        // Re-queue the message if it's an error level log
        if (logEntry.level === 'error') {
          this.queue.unshift(logEntry);
        }
      }
    }

    this.isProcessing = false;
  }

  /**
   * Send a single log entry to Discord
   */
  async sendToDiscord(logEntry) {
    return new Promise((resolve, reject) => {
      if (!this.webhookUrl) {
        reject(new Error('Discord webhook URL not configured'));
        return;
      }

      const url = new URL(this.webhookUrl);
      
      // Create Discord embed
      const embed = {
        title: `[${logEntry.level.toUpperCase()}] ${logEntry.process}`,
        description: logEntry.message,
        color: this.getColorForLevel(logEntry.level),
        timestamp: logEntry.timestamp,
        fields: []
      };

      // Add metadata as fields if present
      if (Object.keys(logEntry.metadata).length > 0) {
        for (const [key, value] of Object.entries(logEntry.metadata)) {
          embed.fields.push({
            name: key,
            value: typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value),
            inline: true
          });
        }
      }

      const payload = {
        embeds: [embed]
      };

      const postData = JSON.stringify(payload);

      const options = {
        hostname: url.hostname,
        port: url.port || 443,
        path: url.pathname + url.search,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData)
        }
      };

      const req = https.request(options, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve();
          } else {
            reject(new Error(`Discord API returned status ${res.statusCode}: ${data}`));
          }
        });
      });

      req.on('error', (error) => {
        reject(error);
      });

      req.write(postData);
      req.end();
    });
  }

  /**
   * Get Discord embed color for log level
   */
  getColorForLevel(level) {
    const colors = {
      info: 0x3498db,    // Blue
      warn: 0xf39c12,    // Orange
      error: 0xe74c3c,   // Red
      debug: 0x95a5a6    // Gray
    };
    return colors[level] || colors.info;
  }

  /**
   * Log application startup
   */
  async logStartup() {
    await this.info('Application started', getAppInfo());
  }

  /**
   * Log application shutdown
   */
  async logShutdown() {
    await this.info('Application shutting down');
  }

  /**
   * Log error with stack trace
   */
  async logError(error, context = {}) {
    await this.error(error.message, {
      ...context,
      stack: error.stack,
      name: error.name
    });
  }
}

// Create singleton instance
const discordLogger = new DiscordLoggerService();

export default discordLogger; 