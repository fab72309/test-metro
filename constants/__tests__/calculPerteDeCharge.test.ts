import { calculerPerteDeCharge } from '../calculPerteDeCharge';
import { Debit, Diametre } from '../pertesDeChargeTable';

describe('calculerPerteDeCharge', () => {
  it('calculates pressure loss for valid input', () => {
    const res = calculerPerteDeCharge(40, 500 as Debit, 70 as Diametre);
    expect(res.perteDeCharge).toBeCloseTo(0.4);
  });

  it('returns message for unsupported debit', () => {
    const res = calculerPerteDeCharge(20, 125 as Debit, 70 as Diametre);
    expect(res.perteDeCharge).toBeNull();
    expect(res.message).toMatch(/Débit non disponible/);
  });

  it('returns message when value is null in table', () => {
    const res = calculerPerteDeCharge(20, 250 as Debit, 110 as Diametre);
    expect(res.perteDeCharge).toBeNull();
    expect(res.message).toMatch(/Calcul non disponible/);
  });
});
