import { Request, Response, NextFunction } from 'express';
import { db } from '../db';
import { userActionLogs } from '@shared/schema';

export function actionLogger(req: Request, res: Response, next: NextFunction) {
  res.on('finish', async () => {
    try {
      const user = (req as any).user;
      await db.insert(userActionLogs).values({
        userId: user?.id || null,
        action: `${req.method} ${req.path}`,
        actionDetails: JSON.stringify({ query: req.query }),
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'] || null
      });
    } catch (error) {
      console.error('Failed to log user action:', error);
    }
  });
  next();
}
