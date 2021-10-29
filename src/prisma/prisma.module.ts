import { Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

/** Module responsible for exporting the prisma client */
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
