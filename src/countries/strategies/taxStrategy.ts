import { Room } from '../../rooms/entities/room.entity';
import { CountryName } from '../entities/country.entity';

interface TaxStrategy {
  calculateTax: (
    room: Room,
    stayDays: number,
  ) => { percent: number; amount: number };
}

export const taxStrategies: Record<CountryName, TaxStrategy> = {
  SouthKorea: {
    calculateTax: (_room, _stayDays) => ({ percent: 10, amount: 0 }),
  },
  Japan: {
    calculateTax: (_room, _stayDays) => ({ percent: 5, amount: 0 }),
  },
  Bermuda: {
    calculateTax: (_room, _stayDays) => ({ percent: 5, amount: 0 }),
  },
  Brazil: {
    calculateTax: (_room, _stayDays) => ({ percent: 5, amount: 0 }),
  },
  BritishVirginIslands: {
    calculateTax: (_room, _stayDays) => ({ percent: 5, amount: 0 }),
  },
  Canada: {
    calculateTax: (_room, _stayDays) => ({ percent: 5, amount: 0 }),
  },
  France: {
    calculateTax: (_room, _stayDays) => ({ percent: 5, amount: 0 }),
  },
  Germany: {
    calculateTax: (_room, _stayDays) => ({ percent: 5, amount: 0 }),
  },
  India: {
    calculateTax: (_room, _stayDays) => ({ percent: 5, amount: 0 }),
  },
  Italy: {
    calculateTax: (_room, _stayDays) => ({ percent: 5, amount: 0 }),
  },
  Lithuania: {
    calculateTax: (_room, _stayDays) => ({ percent: 5, amount: 0 }),
  },
  Mexico: {
    calculateTax: (_room, _stayDays) => ({ percent: 5, amount: 0 }),
  },
  Netherlands: {
    calculateTax: (_room, _stayDays) => ({ percent: 5, amount: 0 }),
  },
  Portugal: {
    calculateTax: (_room, _stayDays) => ({ percent: 5, amount: 0 }),
  },
  Switzerland: {
    calculateTax: (_room, _stayDays) => ({ percent: 5, amount: 0 }),
  },
};
