/**
 * Strategy pattern: LibrarySystem is injected with one of these instead of
 * hardcoding a fine formula, so the calculation can be swapped (and faked
 * in tests) without touching LibrarySystem itself.
 */
export class FineStrategy {
  calculate(_daysLate) {
    throw new Error('calculate() must be implemented by subclass');
  }
}

export class DailyFineStrategy extends FineStrategy {
  constructor(ratePerDay = 1) {
    super();
    this.ratePerDay = ratePerDay;
  }

  calculate(daysLate) {
    return daysLate > 0 ? daysLate * this.ratePerDay : 0;
  }
}

export class FlatFineStrategy extends FineStrategy {
  constructor(flatAmount = 5) {
    super();
    this.flatAmount = flatAmount;
  }

  calculate(daysLate) {
    return daysLate > 0 ? this.flatAmount : 0;
  }
}
