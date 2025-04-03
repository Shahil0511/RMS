import { PrismaClient } from "@prisma/client";
import { createClient } from "redis";
import logger from "../utils/logger";

export interface HealthCheckResult {
  status: "UP" | "DOWN";
  details?: any;
}

export interface SystemHealth {
  status: "UP" | "DOWN";
  checks: {
    database: HealthCheckResult;
    redis: HealthCheckResult;
    memoryUsage: HealthCheckResult;
    diskSpace: HealthCheckResult;
  };
  uptime: number;
  timestamp: number;
}

export class HealthService {
  private redisClient: ReturnType<typeof createClient>;

  constructor(
    private prisma: PrismaClient,
    redisClient: ReturnType<typeof createClient>
  ) {
    this.redisClient = redisClient;
  }

  async checkDatabase(): Promise<HealthCheckResult> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return { status: "UP" };
    } catch (error) {
      logger.error("Database health check failed", error);
      return {
        status: "DOWN",
        details: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  async checkRedis(): Promise<HealthCheckResult> {
    try {
      await this.redisClient.ping();
      return { status: "UP" };
    } catch (error) {
      logger.error("Redis health check failed", error);
      return {
        status: "DOWN",
        details: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  checkMemoryUsage(): HealthCheckResult {
    try {
      const used = process.memoryUsage().heapUsed / 1024 / 1024;
      const max = Number(process.env.MAX_MEMORY_USAGE_MB) || 1024;
      const status = used < max * 0.9 ? "UP" : "DOWN";

      return {
        status,
        details: {
          used: `${Math.round(used * 100) / 100}MB`,
          max: `${max}MB`,
          percentage: `${Math.round((used / max) * 100)}%`,
        },
      };
    } catch (error) {
      logger.error("Memory check failed", error);
      return {
        status: "DOWN",
        details: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  checkDiskSpace(): HealthCheckResult {
    try {
      // In a real implementation, you would use the 'check-disk-space' package
      return { status: "UP" };
    } catch (error) {
      logger.error("Disk space check failed", error);
      return {
        status: "DOWN",
        details: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  async getHealthStatus(): Promise<SystemHealth> {
    const [database, redis, memoryUsage, diskSpace] = await Promise.all([
      this.checkDatabase(),
      this.checkRedis(),
      Promise.resolve(this.checkMemoryUsage()),
      Promise.resolve(this.checkDiskSpace()),
    ]);

    const overallStatus =
      database.status === "UP" &&
      redis.status === "UP" &&
      memoryUsage.status === "UP" &&
      diskSpace.status === "UP"
        ? "UP"
        : "DOWN";

    return {
      status: overallStatus,
      checks: {
        database,
        redis,
        memoryUsage,
        diskSpace,
      },
      uptime: process.uptime(),
      timestamp: Date.now(),
    };
  }
}

// Standalone redis health check function
export const createRedisHealthCheck = (
  redisClient: ReturnType<typeof createClient>
) => {
  return async () => {
    try {
      await redisClient.ping();
      return true;
    } catch (error) {
      logger.error("Redis health check failed", error);
      return false;
    }
  };
};
