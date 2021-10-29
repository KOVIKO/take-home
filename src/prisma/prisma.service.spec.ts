import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from './prisma.service';

describe('PrismaService', () => {
  let service: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PrismaService],
    }).compile();

    service = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('#onModuleInit', () => {
    it('should explicitly connect Prisma to the database', () => {
      jest.spyOn(service, '$connect').mockImplementation();

      expect(service.$connect).not.toHaveBeenCalled();
      service.onModuleInit();
      expect(service.$connect).toHaveBeenCalled();
    });
  });

  describe('#onModuleDestroy', () => {
    it('should explicitly disconnect Prisma from the database', () => {
      jest.spyOn(service, '$disconnect').mockImplementation();

      expect(service.$disconnect).not.toHaveBeenCalled();
      service.onModuleDestroy();
      expect(service.$disconnect).toHaveBeenCalled();
    });
  });
});
