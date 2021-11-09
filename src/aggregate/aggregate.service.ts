import { Injectable } from '@nestjs/common';
import * as Moment from 'moment';
import { Aggregate } from './entities/aggregate.entity';
import { PrismaService } from '../prisma/prisma.service';

/** Handles the generation of aggregated values for the satellite's altitude */
@Injectable()
export class AggregateService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get the starting date based on a number of minutes to consider
   * @param minutesAgo Amount of minutes to consider
   * @returns Starting date
   */
  getTimeConstraint(minutesAgo: number): Date {
    // Use moment to subtract X amount of minutes from the current time
    return Moment().subtract(minutesAgo, 'minutes').toDate();
  }

  /**
   * Generate aggregated values of the altitude across the specified amount of passed minutes
   * @param minutesToCheck Amount of minutes to consider
   * @param offset The offset of minutes to consider (eg. 1 means check `minutesToCheck` ago as of one minute ago)
   * @returns Aggregated values of the altitude
   */
  async getAggregate(minutesToCheck: number, offset = 0): Promise<Aggregate> {
    // Use prisma to aggregate the minimum, maximum, and average altitudes over the timespan
    const aggregate = await this.prisma.reading.aggregate({
      _avg: { altitude: true }, // Average
      _max: { altitude: true }, // Maximum
      _min: { altitude: true }, // Minimum
      where: {
        time: {
          gte: this.getTimeConstraint(minutesToCheck + offset), // From X + Y minutes ago
          lte: this.getTimeConstraint(offset), // To Y minutes ago
        },
      },
    });

    // Create the aggregated values object
    const createdAggregate = new Aggregate();

    createdAggregate.min = aggregate?._min?.altitude || 0;
    createdAggregate.max = aggregate?._max?.altitude || 0;
    createdAggregate.avg = aggregate?._avg?.altitude || 0;

    return createdAggregate;
  }
}
