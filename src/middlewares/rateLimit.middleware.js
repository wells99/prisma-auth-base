import rateLimit from "express-rate-limit";

// limite global
export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  message: "Muitas requisições. Tente novamente mais tarde.",
});

// limite mais rigoroso para login
export const authLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  message: "Muitas tentativas de login. Tente novamente em 1 minuto.",
});
