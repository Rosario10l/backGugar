import { Test, TestingModule } from '@nestjs/testing';
import { RutasController } from './ruta.controller';
import { RutasService } from './ruta.service';

describe('RutaController', () => {
  let controller: RutasController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RutasController],
      providers: [RutasService],
    }).compile();

    controller = module.get<RutasController>(RutasController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
