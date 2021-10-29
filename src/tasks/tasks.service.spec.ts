import { HttpModule, HttpService } from '@nestjs/axios';
import { Test, TestingModule } from '@nestjs/testing';
import { AxiosResponse } from 'axios';
import { of } from 'rxjs';
import { TasksService } from './tasks.service';
import { SatelliteAPIReading } from './types';
import { PrismaModule } from '../prisma/prisma.module';
import { PrismaService } from '../prisma/prisma.service';

jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    reading: {
      upsert: jest.fn().mockImplementation(),
    },
  })),
}));

describe('TasksService', () => {
  let service: TasksService;
  let httpService: HttpService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [HttpModule, PrismaModule],
      providers: [TasksService],
    }).compile();

    service = module.get<TasksService>(TasksService);
    httpService = module.get<HttpService>(HttpService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('#handleCron', () => {
    it('should retrieve the latest reading', () => {
      jest.spyOn(service, 'retrieveReading');

      expect(service.retrieveReading).not.toHaveBeenCalled();
      service.handleCron();
      expect(service.retrieveReading).toHaveBeenCalled();
    });

    describe('after retrieving reading', () => {
      beforeEach(() => {
        const mockData: SatelliteAPIReading = {
          last_updated: '2020-01-01T00:00:00.000Z',
          altitude: '100.000',
        };

        jest.spyOn(service, 'retrieveReading').mockReturnValue(of(mockData));
      });

      it('should validate the reading', () => {
        jest.spyOn(service, 'isValidReading');

        expect(service.isValidReading).not.toHaveBeenCalled();
        service.handleCron();
        expect(service.isValidReading).toHaveBeenCalled();
      });

      describe('after validating the reading', () => {
        beforeEach(() => {
          jest.spyOn(service, 'isValidReading').mockReturnValue(true);
        });

        it('should save the reading', () => {
          jest.spyOn(service, 'saveReading');

          expect(service.saveReading).not.toHaveBeenCalled();
          service.handleCron();
          expect(service.saveReading).toHaveBeenCalled();
        });
      });
    });
  });

  describe('#retrieveReading', () => {
    it('should make an HTTP call', () => {
      const mockData: SatelliteAPIReading = {
        last_updated: '2020-01-01T00:00:00.000Z',
        altitude: '100.000',
      };

      const mockResponse: AxiosResponse = {
        data: mockData,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {},
      };

      jest.spyOn(httpService, 'get').mockReturnValue(of(mockResponse));

      expect(httpService.get).not.toHaveBeenCalled();
      service.retrieveReading();
      expect(httpService.get).toHaveBeenCalled();
    });
  });

  describe('#saveReading', () => {
    it('should insert valid records into the database', async () => {
      const time = new Date();
      const altitude = 100.0001;

      expect(prisma.reading.upsert).not.toHaveBeenCalled();
      service.saveReading(time, altitude);
      expect(prisma.reading.upsert).toHaveBeenCalled();
    });

    it('should reject invalid date objects from database entry', async () => {
      const time = new Date().toISOString();
      const altitude = 100.0001;

      expect(prisma.reading.upsert).not.toHaveBeenCalled();
      service.saveReading(time as unknown as Date, altitude);
      expect(prisma.reading.upsert).not.toHaveBeenCalled();
    });

    it('should reject invalid altitude values from database entry', async () => {
      const time = new Date();
      const altitude = '100.0001';

      expect(prisma.reading.upsert).not.toHaveBeenCalled();
      service.saveReading(time, altitude as unknown as number);
      expect(prisma.reading.upsert).not.toHaveBeenCalled();
    });
  });

  describe('#isValidDate', () => {
    test.each(['2020-01-01T00:00:00.000Z', new Date().toISOString()])('should accept a %s as a valid date', (date) =>
      expect(service.isValidDate(date)).toBeTruthy(),
    );

    test.each([['invalid date'], ['1577836800000'], ['0']])('should reject %s as an invalid date', (date) =>
      expect(service.isValidDate(date)).toBeFalsy(),
    );
  });

  describe('#isValidAltitude', () => {
    test.each(['100.000', '1092.2190781', '0.0', '1', '-1'])('should accept %s as a valid altitude', (altitude) =>
      expect(service.isValidAltitude(altitude)).toBeTruthy(),
    );

    test.each(['invalid altitude', 'text', '∞'])('should reject %s as an invalid altitude', (altitude) =>
      expect(service.isValidAltitude(altitude)).toBeFalsy(),
    );
  });

  describe('#isValidReading', () => {
    const normalReading: SatelliteAPIReading = {
      last_updated: '2020-01-01T00:00:00.000Z',
      altitude: '100.000',
    };

    const integerReading: SatelliteAPIReading = {
      last_updated: '2020-01-01T00:00:00.000Z',
      altitude: '100',
    };

    const numberReading: SatelliteAPIReading = {
      last_updated: '2020-01-01T00:00:00.000Z',
      altitude: 100.0001,
    };

    const integerNumberReading: SatelliteAPIReading = {
      last_updated: '2020-01-01T00:00:00.000Z',
      altitude: 100,
    };

    test.each([
      ['normal reading', normalReading],
      ['reading with a simple integer string', integerReading],
      ['reading with a number rather than a string', numberReading],
      ['reading with a integer rather than a string', integerNumberReading],
    ])('should accept a %s as a valid reading', (_, reading) => {
      expect(service.isValidReading(reading)).toBeTruthy();
    });

    const nullReading: SatelliteAPIReading = {
      last_updated: '',
      altitude: '',
    };

    const readingWithInvalidDate: SatelliteAPIReading = {
      last_updated: 'invalid date',
      altitude: '100.00',
    };

    const timestampedReading: SatelliteAPIReading = {
      last_updated: '1577836800000',
      altitude: '100.000',
    };

    const readingWithInvalidAltitude: SatelliteAPIReading = {
      last_updated: '2020-01-01T00:00:00.000Z',
      altitude: 'invalid altitude',
    };

    const readingWithInvalidData: SatelliteAPIReading = {
      last_updated: 'invalid date',
      altitude: 'invalid altitude',
    };

    test.each([
      ['reading with no data', {}],
      ['reading with empty values', nullReading],
      ['reading with an invalid date', readingWithInvalidDate],
      ['reading with a timestamp date', timestampedReading],
      ['reading with an invalid altitude', readingWithInvalidAltitude],
      ['reading with an invalid date and altitude', readingWithInvalidData],
    ])('should reject a %s as an invalid reading', (_, reading) => {
      expect(service.isValidReading(reading)).toBeFalsy();
    });
  });
});
