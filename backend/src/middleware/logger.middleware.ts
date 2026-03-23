import morgan from "morgan";

/**
 * HTTP request logger
 * Shows method, path, status, response time
 */

export const requestLogger = morgan(
  ":method :url :status :res[content-length] - :response-time ms"
);
