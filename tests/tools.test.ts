import { describe, it, expect } from 'vitest';
import { manejarSaludo, manejarCalcular, manejarFechaActual, getToolsDefinition } from '../src/tools.js';

describe('Tools MCP', () => {
  describe('manejarSaludo', () => {
    it('debería generar saludo informal', () => {
      const result = manejarSaludo({ nombre: "Juan", formal: false });
      expect(result.content[0].text).toBe("¡Hola Juan! ¿Cómo estás?");
    });

    it('debería generar saludo formal', () => {
      const result = manejarSaludo({ nombre: "María", formal: true });
      expect(result.content[0].text).toBe("Buenos días, Sr./Sra. María. Es un placer saludarle.");
    });

    it('debería fallar sin nombre', () => {
      expect(() => manejarSaludo({})).toThrow('El nombre es requerido');
    });
  });

  describe('manejarCalcular', () => {
    it('debería sumar', () => {
      const result = manejarCalcular({ operacion: "suma", a: 5, b: 3 });
      expect(result.content[0].text).toBe("5 + 3 = 8");
    });

    it('debería restar', () => {
      const result = manejarCalcular({ operacion: "resta", a: 10, b: 4 });
      expect(result.content[0].text).toBe("10 - 4 = 6");
    });

    it('debería multiplicar', () => {
      const result = manejarCalcular({ operacion: "multiplicacion", a: 6, b: 7 });
      expect(result.content[0].text).toBe("6 × 7 = 42");
    });

    it('debería dividir', () => {
      const result = manejarCalcular({ operacion: "division", a: 15, b: 3 });
      expect(result.content[0].text).toBe("15 ÷ 3 = 5");
    });

    it('debería fallar con división por cero', () => {
      expect(() => manejarCalcular({ operacion: "division", a: 5, b: 0 }))
        .toThrow('No se puede dividir por cero');
    });

    it('debería fallar con operación inválida', () => {
      expect(() => manejarCalcular({ operacion: "potencia", a: 2, b: 3 }))
        .toThrow('Operación no válida');
    });
  });

  describe('manejarFechaActual', () => {
    it('debería obtener fecha en formato corto', () => {
      const result = manejarFechaActual({ formato: "corto" });
      expect(result.content[0].text).toContain("La fecha actual es:");
    });

    it('debería obtener fecha en formato largo', () => {
      const result = manejarFechaActual({ formato: "largo" });
      expect(result.content[0].text).toContain("La fecha actual es:");
    });

    it('debería obtener solo la hora', () => {
      const result = manejarFechaActual({ formato: "hora" });
      expect(result.content[0].text).toContain("La fecha actual es:");
    });
  });

  describe('getToolsDefinition', () => {
    it('debería devolver 3 herramientas', () => {
      const tools = getToolsDefinition();
      expect(tools).toHaveLength(3);
      expect(tools.map(t => t.name)).toEqual(['saludo', 'calcular', 'fecha_actual']);
    });
  });
}); 