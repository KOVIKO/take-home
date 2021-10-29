import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AggregateService } from './aggregate/aggregate.service';
import { PrismaModule } from './prisma/prisma.module';
import { AggregateModule } from './aggregate/aggregate.module';
import { PrismaService } from './prisma/prisma.service';
import { Aggregate } from './aggregate/entities/aggregate.entity';

jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn(() => ({
    $connect: jest.fn(() => Promise.resolve()),
    $disconnect: jest.fn(() => Promise.resolve()),
    reading: {
      upsert: jest.fn(() => Promise.resolve()),
      aggregate: jest.fn(() => Promise.resolve()),
    },
  })),
}));

describe('AppController', () => {
  let appController: AppController;
  let appService: AggregateService;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController, PrismaModule, AggregateModule],
      providers: [AggregateService, PrismaService],
    }).compile();

    appController = app.get<AppController>(AppController);
    appService = app.get<AggregateService>(AggregateService);
  });

  describe('/stats', () => {
    it('should call the service for a 5-minute aggregate', () => {
      jest.spyOn(appService, 'getAggregate');

      expect(appService.getAggregate).not.toHaveBeenCalled();
      appController.getStats();
      expect(appService.getAggregate).toHaveBeenCalledWith(5);
    });
  });

  describe('/health', () => {
    it('should call the service for a 1-minute aggregate', () => {
      jest.spyOn(appService, 'getAggregate');

      expect(appService.getAggregate).not.toHaveBeenCalled();
      appController.getHealth();
      expect(appService.getAggregate).toHaveBeenCalledWith(1);
    });

    test.each([-100, 0, 100, 159])('should result in a warning if the average altitude is %i', async (altitude) => {
      const aggregate = new Aggregate();
      aggregate.avg = altitude;

      jest.spyOn(appService, 'getAggregate').mockImplementation(() => Promise.resolve(aggregate));

      expect(await appController.getHealth()).toEqual('WARNING: RAPID ORBITAL DECAY IMMINENT');
    });

    test.each([160, 161, 1800, 9999])('should result in "A-OK" if the average altitude is %i', async (altitude) => {
      const aggregate = new Aggregate();
      aggregate.avg = altitude;

      jest.spyOn(appService, 'getAggregate').mockImplementation(() => Promise.resolve(aggregate));

      expect(await appController.getHealth()).toEqual('Altitude is A-OK');
    });
  });
});
