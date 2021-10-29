import { PrismaClient } from '@prisma/client';
import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';

/** Exposes the generated prisma client as an injectable service */
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    super();
  }

  /** Explicitly connect to the database */
  async onModuleInit(): Promise<void> {
    await this.$connect();
  }

  /** Explicitly disconnect from the database */
  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }
}
