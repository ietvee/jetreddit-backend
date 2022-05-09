// import { EntityManager, IDatabaseDriver, Connection } from "@mikro-orm/core";
// import { RedisClient } from "redis";
import { Request, Response } from "express";
import { Session } from "express-session";
import { Redis } from "ioredis";
import { createUpdootLoader } from "./utils/createUpdootLoader";
import { createUserLoader } from "./utils/createUserLoader";

export type MyContext = {
  // em: EntityManager<any> & EntityManager<IDatabaseDriver<Connection>>;
  req: Request & { session?: Session & { userId?: number } };
  redis: Redis;
  res: Response;
  userLoader: ReturnType<typeof createUserLoader>;
  updootLoader: ReturnType<typeof createUpdootLoader>;
};
