# Discord Logging Integration

This application includes external logging/monitoring via Discord webhooks, allowing you to receive real-time logs and error notifications in a Discord channel.

## Features

- **Real-time logging**: Send logs directly to Discord channels
- **Multiple log levels**: Info, Warning, Error, and Debug levels with color coding
- **Rate limiting**: Built-in rate limiting to avoid Discord API limits
- **Queue management**: Automatic queue management with configurable size limits
- **Error handling**: Robust error handling with fallback mechanisms
- **Metadata support**: Include additional context and metadata with each log
- **Cross-process logging**: Log from both main and renderer processes

## Configuration

The Discord logging is configured in `src/main/config/discordConfig.js`:

```javascript
export const DISCORD_CONFIG = {
  webhookUrl: 'your-discord-webhook-url',
  rateLimitDelay: 1000,        // 1 second between messages
  maxQueueSize: 100,           // Maximum queue size
  enabled: true,               // Enable/disable logging
  allowedLevels: ['info', 'warn', 'error', 'debug'], // Filter log levels
  appName: 'SDT Dataset Preparer',
  environment: 'development'
};
```

## Usage

### From Main Process

```javascript
import discordLogger from './services/discordLoggerService.js';

// Basic logging
await discordLogger.info('Application started');
await discordLogger.warn('Low disk space detected');
await discordLogger.error('Database connection failed');

// Logging with metadata
await discordLogger.info('User action completed', {
  userId: '12345',
  action: 'file_upload',
  fileSize: '2.5MB'
});

// Logging errors with stack traces
try {
  // Some operation
} catch (error) {
  await discordLogger.logError(error, {
    context: 'database_operation',
    userId: '12345'
  });
}
```

### From Renderer Process

```javascript
// Basic logging
await window.electronAPI.discord.log('User clicked button', 'info');

// Logging with metadata
await window.electronAPI.discord.log('Form submitted', 'info', {
  formType: 'project_creation',
  fields: ['name', 'description']
});

// Logging errors
try {
  // Some operation
} catch (error) {
  await window.electronAPI.discord.logError(error, {
    component: 'ProjectForm',
    action: 'submit'
  });
}
```

## Log Levels

- **Info** (Blue): General information and status updates
- **Warning** (Orange): Potential issues that don't break functionality
- **Error** (Red): Errors that affect functionality
- **Debug** (Gray): Detailed debugging information

## Discord Message Format

Each log message is sent as a Discord embed with:

- **Title**: Log level and process type (e.g., "[INFO] main")
- **Description**: The log message
- **Color**: Based on log level
- **Timestamp**: When the log was created
- **Fields**: Additional metadata as key-value pairs

## Testing

You can test the Discord logging functionality by calling the logging methods directly from your application code or by using the browser console to call `window.electronAPI.discord.log()` methods.

## Security Considerations

- The webhook URL is embedded in the application code
- Consider using environment variables for production deployments
- Webhook URLs should be kept private and not shared publicly
- Consider implementing log filtering to avoid sending sensitive data

## Troubleshooting

### Logs not appearing in Discord
1. Check if Discord logging is enabled in the config
2. Verify the webhook URL is correct
3. Check the browser console for error messages
4. Ensure the Discord channel has proper permissions

### Rate limiting issues
- The service includes built-in rate limiting (1 second between messages)
- If you're still hitting limits, increase the `rateLimitDelay` in the config

### Queue full errors
- Increase `maxQueueSize` in the config if you're seeing queue full warnings
- Consider implementing log level filtering to reduce log volume

## Integration Points

The Discord logger is integrated into:

- **Application lifecycle**: Startup and shutdown logging
- **Error handling**: Automatic error logging in main process
- **Window management**: Window state save/load error logging
- **IPC handlers**: Renderer process logging capabilities
- **Test interface**: Console window test component 