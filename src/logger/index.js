// Logger Module
// In a real app, this would wrap Winston or Pino and output to files/services.

const info = (msg) => console.log(`[INFO] ${new Date().toISOString()} - ${msg}`);
const warn = (msg) => console.warn(`[WARN] ${new Date().toISOString()} - ${msg}`);
const error = (msg, err) => console.error(`[ERROR] ${new Date().toISOString()} - ${msg}`, err || '');

module.exports = { info, warn, error };
