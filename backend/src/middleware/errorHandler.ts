import type { Request, Response, NextFunction } from 'express';

export function notFoundHandler(req: Request, res: Response) {
  res.status(404).json({
    success: false,
    status: 'notFound',
    message: `Route not found: ${req.method} ${req.path}`,
  });
}

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  console.error('[HostelBird API Error]', err.message);
  res.status(500).json({
    success: false,
    status: 'error',
    message: 'Internal server error',
  });
}
