import { Request, Response, NextFunction } from 'express';
import logger from '../config/logger';
import { AuditLog } from '../models';
import { AuthRequest } from './auth';

export const auditLogger = (action: string, resource: string) => {
  return async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.id;
      const ipAddress = req.ip || req.connection.remoteAddress;
      const userAgent = req.headers['user-agent'];

      // Create audit log entry
      await AuditLog.create({
        userId,
        action,
        resource,
        resourceId: req.params.id ? parseInt(req.params.id) : undefined,
        details: {
          method: req.method,
          path: req.path,
          body: req.body,
          query: req.query,
        },
        ipAddress,
        userAgent,
      });

      logger.info(`Audit: ${action} on ${resource}`, {
        userId,
        ipAddress,
        action,
        resource,
      });

      next();
    } catch (error) {
      logger.error('Audit logging failed:', error);
      next(); // Continue even if audit logging fails
    }
  };
};
