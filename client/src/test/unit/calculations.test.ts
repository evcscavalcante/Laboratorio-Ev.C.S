/**
 * Testes Unitários - Funções de Cálculo Geotécnico
 * Validação das funções críticas de cálculo conforme normas NBR
 */

import { describe, test, expect } from '@jest/globals';

// Mock das funções de cálculo baseadas nas normas NBR
const calculations = {
  // NBR 9813:2021 - Densidade In-Situ
  calculateDensityInSitu: (soilMass: number, volume: number) => {
    if (volume <= 0) throw new Error('Volume deve ser maior que zero');
    return soilMass / volume;
  },

  calculateMoisture: (wetTare: number, dryTare: number, tare: number) => {
    const wetSoil = wetTare - tare;
    const drySoil = dryTare - tare;
    if (drySoil <= 0) throw new Error('Massa de solo seco deve ser positiva');
    return ((wetSoil - drySoil) / drySoil) * 100;
  },

  // NBR 17212:2025 - Densidade Real dos Sólidos
  calculateRealDensity: (soilMass: number, picMass: number, picSoilWaterMass: number, picWaterMass: number, temperature: number) => {
    const waterVolume = picWaterMass - picMass;
    const displacedVolume = (picSoilWaterMass - picMass) - soilMass;
    const soilVolume = waterVolume - displacedVolume;
    
    if (soilVolume <= 0) throw new Error('Volume de solo deve ser positivo');
    
    const tempCorrection = 1 + (temperature - 20) * 0.0002;
    return (soilMass / soilVolume) * tempCorrection;
  },

  // NBR 12004/12051:2021 - Índices de Vazios Máximo e Mínimo
  calculateVoidRatio: (totalVolume: number, soilVolume: number) => {
    if (soilVolume <= 0) throw new Error('Volume de sólidos deve ser positivo');
    const voidVolume = totalVolume - soilVolume;
    return voidVolume / soilVolume;
  },

  calculateRelativeCompactness: (voidRatio: number, maxVoidRatio: number, minVoidRatio: number) => {
    if (maxVoidRatio <= minVoidRatio) throw new Error('Índice de vazios máximo deve ser maior que o mínimo');
    return ((maxVoidRatio - voidRatio) / (maxVoidRatio - minVoidRatio)) * 100;
  }
};

describe('Cálculos Geotécnicos - NBR 9813:2021', () => {
  describe('calculateDensityInSitu', () => {
    test('calcula densidade corretamente com valores válidos', () => {
      const result = calculations.calculateDensityInSitu(1850, 1000);
      expect(result).toBe(1.85);
    });

    test('calcula densidade para solo denso', () => {
      const result = calculations.calculateDensityInSitu(2100, 1000);
      expect(result).toBe(2.1);
    });

    test('rejeita volume zero', () => {
      expect(() => {
        calculations.calculateDensityInSitu(1850, 0);
      }).toThrow('Volume deve ser maior que zero');
    });

    test('mantém precisão com decimais', () => {
      const result = calculations.calculateDensityInSitu(1847.5, 997.2);
      expect(result).toBeCloseTo(1.8527, 3);
    });
  });

  describe('calculateMoisture', () => {
    test('calcula umidade corretamente', () => {
      const result = calculations.calculateMoisture(150, 125, 50);
      expect(result).toBeCloseTo(33.33, 2);
    });

    test('rejeita solo seco zero', () => {
      expect(() => {
        calculations.calculateMoisture(100, 50, 50);
      }).toThrow('Massa de solo seco deve ser positiva');
    });
  });
});

describe('Cálculos Geotécnicos - NBR 17212:2025', () => {
  describe('calculateRealDensity', () => {
    test('calcula densidade real corretamente', () => {
      const result = calculations.calculateRealDensity(50, 150, 620, 600, 22);
      expect(result).toBeGreaterThan(1.5);
      expect(result).toBeLessThan(2.5);
    });

    test('aplica correção de temperatura', () => {
      const result20C = calculations.calculateRealDensity(50, 150, 620, 600, 20);
      const result25C = calculations.calculateRealDensity(50, 150, 620, 600, 25);
      expect(result25C).toBeGreaterThan(result20C);
    });
  });
});

describe('Validação de Ranges', () => {
  test('densidade deve estar em range válido para solos', () => {
    const densities = [
      calculations.calculateDensityInSitu(1400, 1000),
      calculations.calculateDensityInSitu(1800, 1000),
      calculations.calculateDensityInSitu(2200, 1000)
    ];

    densities.forEach(density => {
      expect(density).toBeGreaterThan(1.0);
      expect(density).toBeLessThan(3.0);
    });
  });
});