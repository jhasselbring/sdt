/**
 * Frontend logging utility for Discord integration
 * Sends logs to the main process via IPC for Discord webhook delivery
 */

class FrontendLogger {
  constructor() {
    this.process = 'renderer';
  }

  /**
   * Send a log message to Discord via IPC
   * @param {string} message - The message to send
   * @param {string} level - Log level (info, warn, error, debug)
   * @param {Object} metadata - Additional metadata to include
   */
  async log(message, level = 'info', metadata = {}) {
    try {
      if (window.electronAPI?.discord?.log) {
        await window.electronAPI.discord.log(message, level, {
          ...metadata,
          process: this.process,
          timestamp: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error('Failed to send frontend log to Discord:', error);
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
   * Log error with stack trace
   */
  async logError(error, context = {}) {
    try {
      if (window.electronAPI?.discord?.logError) {
        await window.electronAPI.discord.logError(error, {
          ...context,
          process: this.process
        });
      }
    } catch (logError) {
      console.error('Failed to send frontend error to Discord:', logError);
    }
  }
}

// Create singleton instance
const frontendLogger = new FrontendLogger();

export default frontendLogger; 