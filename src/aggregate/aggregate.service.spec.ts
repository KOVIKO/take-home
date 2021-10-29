import { Test, TestingModule } from '@nestjs/testing';
import { AggregateService } from './aggregate.service';
import { Aggregate } from './entities/aggregate.entity';
import { PrismaModule } from '../prisma/prisma.module';
import { PrismaService } from '../prisma/prisma.service';

jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn(() => ({
    $connect: jest.fn(() => Promise.resolve()),
    $disconnect: jest.fn(() => Promise.resolve()),
    reading: {
      aggregate: jest.fn(() => Promise.resolve()),
    },
  })),
}));

// Manually set a date
Date.now = jest.fn().mockReturnValue(new Date('2020-01-01T01:00:00.000Z')); // 1/1/2020 @ 1:00AM
const fiveMinutesAgo = '2020-01-01T00:55:00.000Z';
const oneMinuteAgo = '2020-01-01T00:59:00.000Z';

describe('AggregateService', () => {
  let service: AggregateService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [PrismaModule],
      providers: [AggregateService],
    }).compile();

    service = module.get<AggregateService>(AggregateService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('#getTimeConstraint', () => {
    it('should select a time 5 minutes ago', () => {
      expect(service.getTimeConstraint(5).toISOString()).toEqual(fiveMinutesAgo);
    });

    it('should select a time 1 minute ago', () => {
      expect(service.getTimeConstraint(1).toISOString()).toEqual(oneMinuteAgo);
    });
  });

  describe('#getAggregate', () => {
    it('should retrieve an aggregate', async () => {
      expect(prisma.reading.aggregate).not.toHaveBeenCalled();
      expect(await service.getAggregate(5)).toBeInstanceOf(Aggregate);
      expect(prisma.reading.aggregate).toHaveBeenCalledWith(
        expect.objectContaining({
          _avg: expect.objectContaining({ altitude: true }),
          _max: expect.objectContaining({ altitude: true }),
          _min: expect.objectContaining({ altitude: true }),
          where: expect.objectContaining({ time: expect.objectContaining({ gte: new Date(fiveMinutesAgo) }) }),
        }),
      );
    });
  });
});
