import { describe, it, expect } from 'vitest';
import { GreetingResolver } from '../../src/resolver/greeting.resolver.js';
import { McpError } from "@modelcontextprotocol/sdk/types.js";

describe('GreetingResolver', () => {
  const greetingResolver = new GreetingResolver();

  describe('Tool Definition', () => {
    it('debería tener la definición correcta de la herramienta', () => {
      const definition = greetingResolver.getToolDefinition();
      
      expect(definition.name).toBe('saludo');
      expect(definition.description).toContain('saludo personalizado');
      expect(definition.inputSchema.type).toBe('object');
      expect(definition.inputSchema.properties.nombre).toBeDefined();
      expect(definition.inputSchema.properties.formal).toBeDefined();
      expect(definition.inputSchema.required).toContain('nombre');
    });

    it('debería incluir ejemplos en la definición', () => {
      const definition = greetingResolver.getToolDefinition();
      
      expect(definition.inputSchema.properties.nombre.examples).toContain('Ana');
      expect(definition.inputSchema.properties.nombre.examples).toContain('Sr. García');
      expect(definition.inputSchema.properties.nombre.examples).toContain('Dra. Martínez');
    });

    it('debería tener restricciones de longitud', () => {
      const definition = greetingResolver.getToolDefinition();
      
      expect(definition.inputSchema.properties.nombre.minLength).toBe(1);
      expect(definition.inputSchema.properties.nombre.maxLength).toBe(100);
    });
  });

  describe('Validación de entrada', () => {
    it('debería validar entrada correcta', () => {
      const input = { nombre: "Juan", formal: false };
      const validated = greetingResolver.validateInput(input);
      
      expect(validated.nombre).toBe("Juan");
      expect(validated.formal).toBe(false);
    });

    it('debería aplicar valor por defecto para formal', () => {
      const input = { nombre: "María" };
      const validated = greetingResolver.validateInput(input);
      
      expect(validated.nombre).toBe("María");
      expect(validated.formal).toBe(false);
    });

    it('debería convertir string "true" a boolean', () => {
      const input = { nombre: "Carlos", formal: "true" };
      const validated = greetingResolver.validateInput(input);
      
      expect(validated.formal).toBe(true);
    });

    it('debería convertir string "false" a boolean', () => {
      const input = { nombre: "Ana", formal: "false" };
      const validated = greetingResolver.validateInput(input);
      
      expect(validated.formal).toBe(false);
    });

    it('debería fallar con nombre vacío', () => {
      expect(() => {
        greetingResolver.validateInput({ nombre: "" });
      }).toThrow('El nombre no puede estar vacío');
    });

    it('debería fallar con nombre muy largo', () => {
      const nombreLargo = "a".repeat(101);
      expect(() => {
        greetingResolver.validateInput({ nombre: nombreLargo });
      }).toThrow('El nombre es demasiado largo');
    });

    it('debería fallar sin nombre', () => {
      expect(() => {
        greetingResolver.validateInput({});
      }).toThrow();
    });

    it('debería fallar con tipo incorrecto de nombre', () => {
      expect(() => {
        greetingResolver.validateInput({ nombre: 123 });
      }).toThrow();
    });
  });

  describe('Ejecución completa (Resolución + Caso de uso)', () => {
    it('debería ejecutar correctamente con entrada válida', async () => {
      const result = await greetingResolver.resolveAndExecute({ 
        nombre: "Test", 
        formal: false 
      });
      
      expect(result.content).toHaveLength(1);
      expect(result.content[0].type).toBe('text');
      expect(result.content[0].text).toContain('Test');
    });

    it('debería ejecutar correctamente modo formal', async () => {
      const result = await greetingResolver.resolveAndExecute({ 
        nombre: "Sr. Pérez", 
        formal: true 
      });
      
      expect(result.content[0].text).toContain('Sr. Pérez');
      expect(result.content[0].text).toContain('Es un placer saludarle');
    });

    it('debería manejar conversión de string a boolean', async () => {
      const result = await greetingResolver.resolveAndExecute({ 
        nombre: "Dra. García", 
        formal: "true" 
      });
      
      expect(result.content[0].text).toContain('Dra. García');
      expect(result.content[0].text).toContain('Es un placer saludarle');
    });
  });

  describe('Manejo de errores', () => {
    it('debería lanzar McpError para validación fallida', async () => {
      await expect(
        greetingResolver.resolveAndExecute({ nombre: "" })
      ).rejects.toThrow(McpError);
    });

    it('debería formatear errores de validación correctamente', async () => {
      try {
        await greetingResolver.resolveAndExecute({ nombre: "" });
      } catch (error) {
        expect(error).toBeInstanceOf(McpError);
        expect(error.message).toContain('Errores de validación en herramienta \'saludo\'');
        expect(error.message).toContain('El nombre no puede estar vacío');
      }
    });

    it('debería manejar múltiples errores de validación', async () => {
      const nombreLargo = "a".repeat(101);
      try {
        await greetingResolver.resolveAndExecute({ nombre: nombreLargo });
      } catch (error) {
        expect(error).toBeInstanceOf(McpError);
        expect(error.message).toContain('El nombre es demasiado largo');
      }
    });

    it('debería manejar entrada completamente inválida', async () => {
      await expect(
        greetingResolver.resolveAndExecute({})
      ).rejects.toThrow(McpError);
    });

    it('debería manejar tipo incorrecto de formal (número)', async () => {
      await expect(
        greetingResolver.resolveAndExecute({ 
          nombre: "Test", 
          formal: 123 
        })
      ).rejects.toThrow(McpError);
    });
  });

  describe('Integración', () => {
    it('debería validar y ejecutar en una sola operación', async () => {
      const input = { nombre: "Usuario Test" };
      const result = await greetingResolver.resolveAndExecute(input);
      
      // Verificar que la validación aplicó defaults
      expect(result.content[0].text).toContain('Usuario Test');
      
      // Verificar que se ejecutó el caso de uso (formato informal por defecto)
      expect(result.content[0].text).toContain('¿Cómo estás?');
    });

    it('debería ser consistente entre validación separada y ejecución', async () => {
      const input = { nombre: "Consistencia", formal: "true" };
      
      // Validar por separado
      const validated = greetingResolver.validateInput(input);
      expect(validated.formal).toBe(true);
      
      // Ejecutar completo
      const result = await greetingResolver.resolveAndExecute(input);
      expect(result.content[0].text).toContain('Es un placer saludarle');
    });
  });
}); 