import { describe, it, expect } from 'vitest';
import { GreetingUseCase } from '../../src/usecase/greeting.usecase.js';

describe('GreetingUseCase', () => {
  const greetingUseCase = new GreetingUseCase();

  describe('Lógica de saludos por hora', () => {
    it('debería generar saludo de mañana (antes de 12:00)', () => {
      // Mock de la hora para testing
      const originalHours = Date.prototype.getHours;
      Date.prototype.getHours = () => 10; // 10 AM

      const result = greetingUseCase.execute({ nombre: "Juan", formal: false });
      expect(result.content[0].text).toContain("¡Buenos días Juan!");
      expect(result.content[0].text).toContain("¿Cómo estás?");

      Date.prototype.getHours = originalHours;
    });

    it('debería generar saludo de tarde (12:00-17:59)', () => {
      const originalHours = Date.prototype.getHours;
      Date.prototype.getHours = () => 15; // 3 PM

      const result = greetingUseCase.execute({ nombre: "María", formal: false });
      expect(result.content[0].text).toContain("¡Buenas tardes María!");

      Date.prototype.getHours = originalHours;
    });

    it('debería generar saludo de noche (18:00 en adelante)', () => {
      const originalHours = Date.prototype.getHours;
      Date.prototype.getHours = () => 20; // 8 PM

      const result = greetingUseCase.execute({ nombre: "Pedro", formal: false });
      expect(result.content[0].text).toContain("¡Buenas noches Pedro!");

      Date.prototype.getHours = originalHours;
    });
  });

  describe('Niveles de formalidad', () => {
    it('debería generar saludo informal correctamente', () => {
      const result = greetingUseCase.execute({ nombre: "Ana", formal: false });
      expect(result.content[0].text).toContain("Ana");
      expect(result.content[0].text).toContain("¿Cómo estás?");
      expect(result.content[0].text).toContain("¡Espero que tengas un día genial!");
    });

    it('debería generar saludo formal correctamente', () => {
      const result = greetingUseCase.execute({ nombre: "Sr. García", formal: true });
      expect(result.content[0].text).toContain("Sr. García");
      expect(result.content[0].text).toContain("Es un placer saludarle");
      expect(result.content[0].text).toContain("Espero que tenga un excelente día");
    });

    it('debería usar formato formal en horarios formales', () => {
      const originalHours = Date.prototype.getHours;
      Date.prototype.getHours = () => 9; // 9 AM

      const result = greetingUseCase.execute({ nombre: "Dra. López", formal: true });
      expect(result.content[0].text).toContain("Buenos días, Dra. López");
      expect(result.content[0].text).not.toContain("¡");

      Date.prototype.getHours = originalHours;
    });
  });

  describe('Formato de respuesta', () => {
    it('debería retornar estructura MCP correcta', () => {
      const result = greetingUseCase.execute({ nombre: "Test", formal: false });
      
      expect(result).toHaveProperty('content');
      expect(result.content).toBeInstanceOf(Array);
      expect(result.content).toHaveLength(1);
      expect(result.content[0]).toHaveProperty('type', 'text');
      expect(result.content[0]).toHaveProperty('text');
      expect(typeof result.content[0].text).toBe('string');
    });

    it('debería incluir el nombre en todas las variantes', () => {
      const nombres = ["Juan", "María José", "Dr. Smith", "Ana-Belén"];
      
      nombres.forEach(nombre => {
        const result = greetingUseCase.execute({ nombre, formal: false });
        expect(result.content[0].text).toContain(nombre);
      });
    });
  });
}); 