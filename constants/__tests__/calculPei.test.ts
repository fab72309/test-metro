import { evaluatePeiCapacity } from '../calculPei';

describe('evaluatePeiCapacity', () => {
  it('qualifie un PEI suffisant à partir du débit mesuré à 1 bar', () => {
    expect(evaluatePeiCapacity(1200, 1000)).toEqual({
      measuredAtOneBarLpm: 1200,
      requiredFlowLpm: 1000,
      marginLpm: 200,
      measuredAtOneBarM3h: 72,
      requiredFlowM3h: 60,
      coveragePercent: 120,
      status: 'sufficient',
    });
  });

  it('conserve un déficit négatif pour alerter sur l’insuffisance', () => {
    const result = evaluatePeiCapacity(500, 750);
    expect(result.status).toBe('insufficient');
    expect(result.marginLpm).toBe(-250);
    expect(result.coveragePercent).toBeCloseTo(66.67, 2);
  });

  it('refuse les valeurs nulles ou non numériques', () => {
    expect(() => evaluatePeiCapacity(0, 500)).toThrow();
    expect(() => evaluatePeiCapacity(500, Number.NaN)).toThrow();
  });
});
