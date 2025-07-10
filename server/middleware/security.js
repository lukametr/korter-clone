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
  // Security middleware with CSP configuration
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: [
            "'self'",
            "data:",
            "https://images.unsplash.com",
            "https://res.cloudinary.com",
            "https://*.cloudinary.com",
          ],
          connectSrc: ["'self'"],
          fontSrc: ["'self'"],
          objectSrc: ["'none'"],
          mediaSrc: ["'self'"],
          frameSrc: ["'none'"],
        },
      },
    })
  );
  app.use(sanitize()); // Data sanitization against NoSQL query injection
  app.use(xss()); // Data sanitization against XSS
  app.use("/api", limiter); // Apply rate limiting to all API routes
};
