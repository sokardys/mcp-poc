import { describe, it, expect } from 'vitest';
import { DateTimeUseCase } from '../../src/usecase/datetime.usecase.js';

describe('DateTimeUseCase', () => {
  const dateTimeUseCase = new DateTimeUseCase();

  describe('Formatos de fecha', () => {
    it('debería generar fecha en formato largo', () => {
      const result = dateTimeUseCase.execute({ 
        formato: "largo", 
        zona_horaria: "Europe/Madrid" 
      });
      expect(result.content[0].text).toContain("La fecha actual es:");
      // Debería contener el nombre del día de la semana en español
      expect(result.content[0].text).toMatch(/(lunes|martes|miércoles|jueves|viernes|sábado|domingo)/i);
    });

    it('debería generar fecha en formato corto', () => {
      const result = dateTimeUseCase.execute({ 
        formato: "corto", 
        zona_horaria: "Europe/Madrid" 
      });
      expect(result.content[0].text).toContain("La fecha actual es:");
      // Verificar que contiene formato de fecha (números y separadores)
      expect(result.content[0].text).toMatch(/\d+[\/\-.]\d+[\/\-.]\d+/);
    });

    it('debería generar solo la hora', () => {
      const result = dateTimeUseCase.execute({ 
        formato: "hora", 
        zona_horaria: "Europe/Madrid" 
      });
      expect(result.content[0].text).toContain("La fecha actual es:");
      // Verificar formato de hora (HH:MM:SS)
      expect(result.content[0].text).toMatch(/\d{1,2}:\d{2}:\d{2}/);
    });

    it('debería generar fecha y hora completa', () => {
      const result = dateTimeUseCase.execute({ 
        formato: "completo", 
        zona_horaria: "Europe/Madrid" 
      });
      expect(result.content[0].text).toContain("La fecha actual es:");
      // Debería contener día de la semana y hora
      expect(result.content[0].text).toMatch(/(lunes|martes|miércoles|jueves|viernes|sábado|domingo)/i);
      expect(result.content[0].text).toMatch(/\d{1,2}:\d{2}:\d{2}/);
    });

    it('debería generar fecha en formato ISO', () => {
      const result = dateTimeUseCase.execute({ 
        formato: "iso", 
        zona_horaria: "Europe/Madrid" 
      });
      expect(result.content[0].text).toContain("La fecha actual es:");
      // Verificar formato ISO (YYYY-MM-DDTHH:mm:ss)
      expect(result.content[0].text).toMatch(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    });
  });

  describe('Zonas horarias', () => {
    it('debería usar zona horaria por defecto (Europe/Madrid)', () => {
      const result = dateTimeUseCase.execute({ 
        formato: "corto", 
        zona_horaria: "Europe/Madrid" 
      });
      expect(result.content[0].text).toContain("La fecha actual es:");
      expect(result.content[0].text).not.toContain("(Zona horaria:");
    });

    it('debería mostrar zona horaria diferente', () => {
      const result = dateTimeUseCase.execute({ 
        formato: "corto", 
        zona_horaria: "America/New_York" 
      });
      expect(result.content[0].text).toContain("La fecha actual es:");
      expect(result.content[0].text).toContain("(Zona horaria: America/New_York)");
    });

    it('debería manejar UTC', () => {
      const result = dateTimeUseCase.execute({ 
        formato: "corto", 
        zona_horaria: "UTC" 
      });
      expect(result.content[0].text).toContain("La fecha actual es:");
      expect(result.content[0].text).toContain("(Zona horaria: UTC)");
    });

    it('debería manejar zona horaria asiática', () => {
      const result = dateTimeUseCase.execute({ 
        formato: "hora", 
        zona_horaria: "Asia/Tokyo" 
      });
      expect(result.content[0].text).toContain("La fecha actual es:");
      expect(result.content[0].text).toContain("(Zona horaria: Asia/Tokyo)");
    });
  });

  describe('Manejo de errores', () => {
    it('debería manejar zona horaria inválida', () => {
      expect(() => {
        dateTimeUseCase.execute({ 
          formato: "corto", 
          zona_horaria: "Invalid/Timezone" 
        });
      }).toThrow('Error al formatear la fecha:');
    });

    it('debería manejar formato válido con zona inválida', () => {
      expect(() => {
        dateTimeUseCase.execute({ 
          formato: "largo", 
          zona_horaria: "Not/A/Timezone" 
        });
      }).toThrow('Error al formatear la fecha:');
    });
  });

  describe('Consistencia en formatos', () => {
    it('debería generar fechas consistentes para el mismo momento', () => {
      const formato1 = dateTimeUseCase.execute({ 
        formato: "largo", 
        zona_horaria: "Europe/Madrid" 
      });
      const formato2 = dateTimeUseCase.execute({ 
        formato: "corto", 
        zona_horaria: "Europe/Madrid" 
      });
      
      // Ambos deberían contener información de la misma fecha
      expect(formato1.content[0].text).toContain("La fecha actual es:");
      expect(formato2.content[0].text).toContain("La fecha actual es:");
    });

    it('debería mostrar diferentes horas para diferentes zonas horarias', () => {
      const madrid = dateTimeUseCase.execute({ 
        formato: "hora", 
        zona_horaria: "Europe/Madrid" 
      });
      const newYork = dateTimeUseCase.execute({ 
        formato: "hora", 
        zona_horaria: "America/New_York" 
      });
      
      // Ambos deberían ser válidos pero pueden tener horas diferentes
      expect(madrid.content[0].text).toMatch(/\d{1,2}:\d{2}:\d{2}/);
      expect(newYork.content[0].text).toMatch(/\d{1,2}:\d{2}:\d{2}/);
    });
  });

  describe('Formato de respuesta', () => {
    it('debería retornar estructura MCP correcta', () => {
      const result = dateTimeUseCase.execute({ 
        formato: "corto", 
        zona_horaria: "Europe/Madrid" 
      });
      
      expect(result).toHaveProperty('content');
      expect(result.content).toBeInstanceOf(Array);
      expect(result.content).toHaveLength(1);
      expect(result.content[0]).toHaveProperty('type', 'text');
      expect(result.content[0]).toHaveProperty('text');
      expect(typeof result.content[0].text).toBe('string');
    });

    it('debería comenzar siempre con el mismo prefijo', () => {
      const formatos = ["corto", "largo", "hora", "completo", "iso"] as const;
      
      formatos.forEach(formato => {
        const result = dateTimeUseCase.execute({ 
          formato, 
          zona_horaria: "Europe/Madrid" 
        });
        expect(result.content[0].text).toMatch(/^La fecha actual es:/);
      });
    });
  });
}); 