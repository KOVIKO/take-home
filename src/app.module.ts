import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { TasksModule } from './tasks/tasks.module';
import { AggregateModule } from './aggregate/aggregate.module';

/** App */
@Module({
  imports: [ScheduleModule.forRoot(), TasksModule, AggregateModule],
  controllers: [AppController],
})
export class AppModule {}
