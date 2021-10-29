import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { TasksService } from './tasks.service';

/** Module responsible for exporting the cron tasks service */
@Module({
  imports: [HttpModule, PrismaModule],
  providers: [TasksService],
})
export class TasksModule {}
