import { Controller, Get } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';
import { AggregateService } from './aggregate/aggregate.service';
import { Aggregate } from './aggregate/entities/aggregate.entity';
import { HealthStatusMessage } from './types';

/** Root API controller */
@Controller()
export class AppController {
  /** Status messages for the API's `health` endpoint */
  static readonly healthStatusMessages: { [key: string]: HealthStatusMessage } = {
    bad: HealthStatusMessage.bad,
    good: HealthStatusMessage.good,
  };

  constructor(private readonly appService: AggregateService) {}

  /** Get aggregated values of the satellite's altitude over the past 5 minutes */
  @Get('stats')
  @ApiResponse({
    status: 200,
    description: "Aggregated values of the satellite's altitude in the last 5 minutes",
    type: Aggregate,
  })
  async getStats(): Promise<Aggregate> {
    return await this.appService.getAggregate(5);
  }

  /** Get a status message indicating whether the satellite's altitude has remained above an average of 160km for the past minute */
  @Get('health')
  @ApiResponse({
    status: 200,
    description: "Whether or not the satellite's average altitude has been high for the past minute",
    type: String,
  })
  async getHealth(): Promise<HealthStatusMessage> {
    const aggregate = await this.appService.getAggregate(1);
    return aggregate.avg < 160 ? AppController.healthStatusMessages.bad : AppController.healthStatusMessages.good;
  }
}
