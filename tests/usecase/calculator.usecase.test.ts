import { describe, it, expect } from 'vitest';
import { CalculatorUseCase } from '../../src/usecase/calculator.usecase.js';

describe('CalculatorUseCase', () => {
  const calculatorUseCase = new CalculatorUseCase();

  describe('Operaciones básicas', () => {
    it('debería realizar suma correctamente', () => {
      const result = calculatorUseCase.execute({ operacion: "suma", a: 5, b: 3 });
      expect(result.content[0].text).toBe("Suma: 5 + 3 = 8");
    });

    it('debería realizar resta correctamente', () => {
      const result = calculatorUseCase.execute({ operacion: "resta", a: 10, b: 4 });
      expect(result.content[0].text).toBe("Resta: 10 - 4 = 6");
    });

    it('debería realizar multiplicación correctamente', () => {
      const result = calculatorUseCase.execute({ operacion: "multiplicacion", a: 6, b: 7 });
      expect(result.content[0].text).toBe("Multiplicación: 6 × 7 = 42");
    });

    it('debería realizar división correctamente', () => {
      const result = calculatorUseCase.execute({ operacion: "division", a: 15, b: 3 });
      expect(result.content[0].text).toBe("División: 15 ÷ 3 = 5");
    });
  });

  describe('Manejo de números decimales', () => {
    it('debería manejar decimales en suma', () => {
      const result = calculatorUseCase.execute({ operacion: "suma", a: 1.5, b: 2.3 });
      expect(result.content[0].text).toBe("Suma: 1.5 + 2.3 = 3.8");
    });

    it('debería formatear decimales largos correctamente', () => {
      const result = calculatorUseCase.execute({ operacion: "division", a: 10, b: 3 });
      expect(result.content[0].text).toBe("División: 10 ÷ 3 = 3.333333");
    });

    it('debería mostrar enteros sin decimales', () => {
      const result = calculatorUseCase.execute({ operacion: "division", a: 8, b: 2 });
      expect(result.content[0].text).toBe("División: 8 ÷ 2 = 4");
    });

    it('debería remover ceros innecesarios', () => {
      const result = calculatorUseCase.execute({ operacion: "multiplicacion", a: 2.5, b: 4 });
      expect(result.content[0].text).toBe("Multiplicación: 2.5 × 4 = 10");
    });
  });

  describe('Números negativos', () => {
    it('debería manejar números negativos en suma', () => {
      const result = calculatorUseCase.execute({ operacion: "suma", a: -5, b: 3 });
      expect(result.content[0].text).toBe("Suma: -5 + 3 = -2");
    });

    it('debería manejar números negativos en resta', () => {
      const result = calculatorUseCase.execute({ operacion: "resta", a: 5, b: -3 });
      expect(result.content[0].text).toBe("Resta: 5 - -3 = 8");
    });

    it('debería manejar multiplicación con negativos', () => {
      const result = calculatorUseCase.execute({ operacion: "multiplicacion", a: -4, b: -3 });
      expect(result.content[0].text).toBe("Multiplicación: -4 × -3 = 12");
    });

    it('debería manejar división con negativos', () => {
      const result = calculatorUseCase.execute({ operacion: "division", a: -12, b: 3 });
      expect(result.content[0].text).toBe("División: -12 ÷ 3 = -4");
    });
  });

  describe('Casos extremos', () => {
    it('debería manejar operaciones con cero', () => {
      const result = calculatorUseCase.execute({ operacion: "multiplicacion", a: 100, b: 0 });
      expect(result.content[0].text).toBe("Multiplicación: 100 × 0 = 0");
    });

    it('debería manejar suma con cero', () => {
      const result = calculatorUseCase.execute({ operacion: "suma", a: 42, b: 0 });
      expect(result.content[0].text).toBe("Suma: 42 + 0 = 42");
    });

    it('debería manejar números muy grandes', () => {
      const result = calculatorUseCase.execute({ operacion: "multiplicacion", a: 999999, b: 1000000 });
      expect(result.content[0].text).toBe("Multiplicación: 999999 × 1000000 = 999999000000");
    });

    it('debería manejar números muy pequeños', () => {
      const result = calculatorUseCase.execute({ operacion: "division", a: 1, b: 1000000 });
      expect(result.content[0].text).toBe("División: 1 ÷ 1000000 = 0.000001");
    });
  });

  describe('Formato de respuesta', () => {
    it('debería retornar estructura MCP correcta', () => {
      const result = calculatorUseCase.execute({ operacion: "suma", a: 1, b: 1 });
      
      expect(result).toHaveProperty('content');
      expect(result.content).toBeInstanceOf(Array);
      expect(result.content).toHaveLength(1);
      expect(result.content[0]).toHaveProperty('type', 'text');
      expect(result.content[0]).toHaveProperty('text');
      expect(typeof result.content[0].text).toBe('string');
    });

    it('debería incluir descripción de la operación', () => {
      const operaciones = [
        { op: "suma", desc: "Suma:" },
        { op: "resta", desc: "Resta:" },
        { op: "multiplicacion", desc: "Multiplicación:" },
        { op: "division", desc: "División:" }
      ];
      
      operaciones.forEach(({ op, desc }) => {
        const result = calculatorUseCase.execute({ 
          operacion: op as any, 
          a: 6, 
          b: 2 
        });
        expect(result.content[0].text).toContain(desc);
      });
    });
  });
}); 