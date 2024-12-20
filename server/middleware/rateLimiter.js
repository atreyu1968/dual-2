import rateLimit from 'express-rate-limit';

export const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  // Use a fixed key for WebContainer environment
  keyGenerator: () => 'webcontainer',
  // Skip IP validation since we're in WebContainer
  validate: { xForwardedForHeader: false }
});