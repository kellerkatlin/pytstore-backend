import { Test, TestingModule } from '@nestjs/testing';
import { IncomeStatementController } from './income-statement.controller';

describe('IncomeStatementController', () => {
  let controller: IncomeStatementController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [IncomeStatementController],
    }).compile();

    controller = module.get<IncomeStatementController>(IncomeStatementController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
