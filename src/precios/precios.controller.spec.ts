import { Test, TestingModule } from '@nestjs/testing';
import { PreciosController } from './precios.controller';
import { PreciosService } from './precios.service';

describe('PreciosController', () => {
  let controller: PreciosController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PreciosController],
      providers: [PreciosService],
    }).compile();

    controller = module.get<PreciosController>(PreciosController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
