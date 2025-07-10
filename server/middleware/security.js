const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const sanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});

module.exports = (app) => {
  // Security middleware
  app.use(helmet()); // Set security HTTP headers
  app.use(sanitize()); // Data sanitization against NoSQL query injection
  app.use(xss()); // Data sanitization against XSS
  app.use("/api", limiter); // Apply rate limiting to all API routes
};
