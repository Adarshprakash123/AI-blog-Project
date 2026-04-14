import rateLimit from "express-rate-limit";

const rateLimitHandler = (message) => (req, res) => {
  res.status(429).json({
    success: false,
    message,
  });
};

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler("Too many requests, please try again in a few minutes."),
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler("Too many auth attempts, please wait and try again."),
});

