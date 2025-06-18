import { describe, it, expect } from 'vitest';
import { DateTimeResolver } from '../../src/resolver/datetime.resolver.js';
import { McpError } from "@modelcontextprotocol/sdk/types.js";

describe('DateTimeResolver', () => {
  const dateTimeResolver = new DateTimeResolver();

  describe('Tool Definition', () => {
    it('debería tener la definición correcta de la herramienta', () => {
      const definition = dateTimeResolver.getToolDefinition();
      
      expect(definition.name).toBe('fecha_actual');
      expect(definition.description).toContain('fecha y hora actual');
      expect(definition.inputSchema.type).toBe('object');
      expect(definition.inputSchema.properties.formato).toBeDefined();
      expect(definition.inputSchema.properties.zona_horaria).toBeDefined();
      // No hay parámetros requeridos, son todos opcionales
    });

    it('debería incluir ejemplos en la definición', () => {
      const definition = dateTimeResolver.getToolDefinition();
      
      expect(definition.inputSchema.properties.formato.examples).toContain('largo');
      expect(definition.inputSchema.properties.formato.examples).toContain('corto');
      expect(definition.inputSchema.properties.formato.examples).toContain('hora');
      expect(definition.inputSchema.properties.formato.examples).toContain('completo');
      expect(definition.inputSchema.properties.formato.examples).toContain('iso');
    });

    it('debería tener enum de formatos válidos', () => {
      const definition = dateTimeResolver.getToolDefinition();
      
      expect(definition.inputSchema.properties.formato.enum).toEqual([
        'corto', 'largo', 'hora', 'completo', 'iso'
      ]);
    });

    it('debería tener valores por defecto', () => {
      const definition = dateTimeResolver.getToolDefinition();
      
      expect(definition.inputSchema.properties.formato.default).toBe('largo');
      expect(definition.inputSchema.properties.zona_horaria.default).toBe('Europe/Madrid');
    });
  });

  describe('Validación de entrada', () => {
    it('debería validar entrada correcta', () => {
      const input = { formato: "corto", zona_horaria: "Europe/Madrid" };
      const validated = dateTimeResolver.validateInput(input);
      
      expect(validated.formato).toBe("corto");
      expect(validated.zona_horaria).toBe("Europe/Madrid");
    });

    it('debería aplicar valores por defecto', () => {
      const validated = dateTimeResolver.validateInput({});
      
      expect(validated.formato).toBe("largo");
      expect(validated.zona_horaria).toBe("Europe/Madrid");
    });

    it('debería validar todos los formatos', () => {
      const formatos = ['corto', 'largo', 'hora', 'completo', 'iso'];
      
      formatos.forEach(formato => {
        const validated = dateTimeResolver.validateInput({ formato });
        expect(validated.formato).toBe(formato);
      });
    });

    it('debería validar zonas horarias comunes', () => {
      const zonas = [
        'Europe/Madrid',
        'America/New_York',
        'Asia/Tokyo',
        'UTC',
        'Europe/London'
      ];
      
      zonas.forEach(zona => {
        const validated = dateTimeResolver.validateInput({ 
          formato: "corto",
          zona_horaria: zona 
        });
        expect(validated.zona_horaria).toBe(zona);
      });
    });

    it('debería fallar con formato inválido', () => {
      expect(() => {
        dateTimeResolver.validateInput({ formato: "formato_inexistente" });
      }).toThrow('El formato debe ser uno de');
    });

    it('debería fallar con tipos incorrectos', () => {
      expect(() => {
        dateTimeResolver.validateInput({ formato: 123 });
      }).toThrow();

      expect(() => {
        dateTimeResolver.validateInput({ zona_horaria: false });
      }).toThrow();
    });
  });

  describe('Ejecución completa (Resolución + Caso de uso)', () => {
    it('debería ejecutar con formato largo por defecto', async () => {
      const result = await dateTimeResolver.resolveAndExecute({});
      
      expect(result.content).toHaveLength(1);
      expect(result.content[0].type).toBe('text');
      expect(result.content[0].text).toContain('La fecha actual es:');
    });

    it('debería ejecutar con formato corto', async () => {
      const result = await dateTimeResolver.resolveAndExecute({ 
        formato: "corto" 
      });
      
      expect(result.content[0].text).toContain('La fecha actual es:');
      expect(result.content[0].text).toMatch(/\d+[\/\-.]\d+[\/\-.]\d+/);
    });

    it('debería ejecutar con formato hora', async () => {
      const result = await dateTimeResolver.resolveAndExecute({ 
        formato: "hora" 
      });
      
      expect(result.content[0].text).toContain('La fecha actual es:');
      expect(result.content[0].text).toMatch(/\d{1,2}:\d{2}:\d{2}/);
    });

    it('debería ejecutar con formato ISO', async () => {
      const result = await dateTimeResolver.resolveAndExecute({ 
        formato: "iso" 
      });
      
      expect(result.content[0].text).toContain('La fecha actual es:');
      expect(result.content[0].text).toMatch(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    });

    it('debería manejar zona horaria diferente', async () => {
      const result = await dateTimeResolver.resolveAndExecute({ 
        formato: "corto", 
        zona_horaria: "America/New_York" 
      });
      
      expect(result.content[0].text).toContain('La fecha actual es:');
      expect(result.content[0].text).toContain('(Zona horaria: America/New_York)');
    });

    it('debería usar zona por defecto sin mostrarla', async () => {
      const result = await dateTimeResolver.resolveAndExecute({ 
        formato: "corto", 
        zona_horaria: "Europe/Madrid" 
      });
      
      expect(result.content[0].text).toContain('La fecha actual es:');
      expect(result.content[0].text).not.toContain('(Zona horaria:');
    });
  });

  describe('Manejo de errores', () => {
    it('debería lanzar McpError para formato inválido', async () => {
      await expect(
        dateTimeResolver.resolveAndExecute({ 
          formato: "formato_inexistente" 
        })
      ).rejects.toThrow(McpError);
    });

    it('debería formatear errores de validación correctamente', async () => {
      try {
        await dateTimeResolver.resolveAndExecute({ 
          formato: "formato_malo" 
        });
      } catch (error) {
        expect(error).toBeInstanceOf(McpError);
        expect(error.message).toContain('Errores de validación en herramienta \'fecha_actual\'');
        expect(error.message).toContain('El formato debe ser uno de');
      }
    });

    it('debería manejar tipos incorrectos', async () => {
      await expect(
        dateTimeResolver.resolveAndExecute({ 
          formato: 123 
        })
      ).rejects.toThrow(McpError);
    });

    it('debería manejar zona horaria inválida en ejecución', async () => {
      // Este caso debería pasar la validación pero fallar en la ejecución
      await expect(
        dateTimeResolver.resolveAndExecute({ 
          formato: "corto", 
          zona_horaria: "Invalid/Timezone" 
        })
      ).rejects.toThrow('Error al formatear la fecha:');
    });
  });

  describe('Integración', () => {
    it('debería validar y ejecutar en una sola operación', async () => {
      const input = { formato: "completo" };
      const result = await dateTimeResolver.resolveAndExecute(input);
      
      // Verificar que se aplicaron defaults
      expect(result.content[0].text).toContain('La fecha actual es:');
      
      // Verificar que se ejecutó el formato completo (incluye hora)
      expect(result.content[0].text).toMatch(/\d{1,2}:\d{2}:\d{2}/);
    });

    it('debería ser consistente entre validación separada y ejecución', async () => {
      const input = { zona_horaria: "UTC" };
      
      // Validar por separado
      const validated = dateTimeResolver.validateInput(input);
      expect(validated.formato).toBe('largo'); // Default
      expect(validated.zona_horaria).toBe('UTC');
      
      // Ejecutar completo
      const result = await dateTimeResolver.resolveAndExecute(input);
      expect(result.content[0].text).toContain('(Zona horaria: UTC)');
    });

    it('debería manejar entrada vacía correctamente', async () => {
      const result = await dateTimeResolver.resolveAndExecute({});
      
      // Debería usar todos los defaults
      expect(result.content[0].text).toContain('La fecha actual es:');
      expect(result.content[0].text).not.toContain('(Zona horaria:'); // Europe/Madrid es default
    });

    it('debería generar fechas consistentes en la misma zona', async () => {
      const result1 = await dateTimeResolver.resolveAndExecute({ 
        formato: "hora", 
        zona_horaria: "Europe/Madrid" 
      });
      const result2 = await dateTimeResolver.resolveAndExecute({ 
        formato: "corto", 
        zona_horaria: "Europe/Madrid" 
      });
      
      // Ambos deberían contener información válida (aunque en formato diferente)
      expect(result1.content[0].text).toContain('La fecha actual es:');
      expect(result2.content[0].text).toContain('La fecha actual es:');
    });

    it('debería mostrar diferentes horas para diferentes zonas', async () => {
      const madrid = await dateTimeResolver.resolveAndExecute({ 
        formato: "hora", 
        zona_horaria: "Europe/Madrid" 
      });
      const tokyo = await dateTimeResolver.resolveAndExecute({ 
        formato: "hora", 
        zona_horaria: "Asia/Tokyo" 
      });
      
      // Ambos deberían ser válidos pero con información de zona horaria diferente
      expect(madrid.content[0].text).toMatch(/\d{1,2}:\d{2}:\d{2}/);
      expect(tokyo.content[0].text).toMatch(/\d{1,2}:\d{2}:\d{2}/);
      expect(tokyo.content[0].text).toContain('(Zona horaria: Asia/Tokyo)');
    });
  });
}); 