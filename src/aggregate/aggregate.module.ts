import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { AggregateService } from './aggregate.service';

/** Module responsible for exporting the aggregated altitude values service */
@Module({
  imports: [PrismaModule],
  providers: [AggregateService],
  exports: [AggregateService],
})
export class AggregateModule {}
