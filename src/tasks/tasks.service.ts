import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import * as Moment from 'moment';
import { Observable, filter, map, tap } from 'rxjs';
import { SatelliteAPIReading } from './types';
import { PrismaService } from '../prisma/prisma.service';

/** Handles cron tasks */
@Injectable()
export class TasksService {
  /** Endpoint from which readings are retrieved */
  private static readonly endpoint = 'http://nestio.space/api/satellite/data';

  /** Debug logger */
  private readonly logger = new Logger(TasksService.name);

  constructor(private readonly httpService: HttpService, private readonly prisma: PrismaService) {}

  /** Every 10 seconds, retrieve another reading from the endpoint */
  @Cron(CronExpression.EVERY_10_SECONDS)
  handleCron(): void {
    this.logger.debug('#handleCron > Cron job fired');

    this.retrieveReading()
      .pipe(
        // Filter out any invalid reading data
        filter<SatelliteAPIReading>((reading) => this.isValidReading(reading)),

        // Save all valid readings to the database
        tap(async (reading) => {
          try {
            await this.saveReading(new Date(reading.last_updated), parseFloat(reading.altitude.toString()));
          } catch (e) {}
        }),
      )
      .subscribe();
  }

  /**
   * Retrieve the reading from the external API
   * @returns API response
   */
  retrieveReading(): Observable<any> {
    return this.httpService.get(TasksService.endpoint).pipe(map((response) => response.data));
  }

  /**
   * Save the reading to the database
   * @param time Date of the reading
   * @param altitude Altitude of the reading
   */
  async saveReading(time: Date, altitude: number): Promise<void> {
    // Ensure that the values being sent are valid
    if (time instanceof Date && typeof altitude === 'number') {
      // Push the reading to the database
      await this.prisma.reading.upsert({
        where: { time }, // Update existing entries if they have the same time
        create: { time, altitude },
        update: { altitude },
      });
    }
  }

  /**
   * Check if a satellite reading from the API is valid
   * @param reading Satellite reading from the API to check
   * @returns Whether or not the satellite reading from the API is valid
   */
  isValidReading(reading: any): reading is SatelliteAPIReading {
    // Validate the date and altitude values from the endpoint
    return !!(
      'last_updated' in reading &&
      'altitude' in reading &&
      this.isValidDate(reading.last_updated) &&
      this.isValidAltitude(reading.altitude)
    );
  }

  /**
   * Check if a date value is valid
   * @param date Date value to check
   * @returns Whether or not the date value is a valid date
   */
  isValidDate(date: string) {
    try {
      // Use moment to verify that the date is properly formatted
      return date && Moment(date, Moment.ISO_8601, true).isValid();
    } catch {
      return false;
    }
  }

  /**
   * Check if an altitude value is valid
   * @param altitude Altitude value to check
   * @returns Whether or not the value is a valid altitude
   */
  isValidAltitude(altitude: string | number) {
    // Make sure the value is numeric
    return altitude && !isNaN(Number(altitude)) && !isNaN(parseFloat((altitude || '').toString()));
  }
}
