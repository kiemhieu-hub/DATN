import type { NextFunction, Request, Response } from "express";

export const securityHeaders = (_req: Request, res: Response, next: NextFunction): void => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  res.setHeader("Cross-Origin-Resource-Policy", "same-site");
  next();
};

export const createRateLimit = (windowMs: number, maxRequests: number) => {
  const requests = new Map<string, { count: number; resetAt: number }>();
  return (req: Request, res: Response, next: NextFunction): void => {
    const now = Date.now(); const key = req.ip || req.socket.remoteAddress || "unknown"; const current = requests.get(key);
    if (!current || current.resetAt <= now) { requests.set(key, { count: 1, resetAt: now + windowMs }); next(); return; }
    current.count += 1;
    if (current.count > maxRequests) { res.setHeader("Retry-After", String(Math.ceil((current.resetAt - now) / 1000))); res.status(429).json({ success: false, message: "Bạn thao tác quá nhiều lần. Vui lòng thử lại sau." }); return; }
    next();
  };
};
