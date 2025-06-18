import { describe, it, expect } from 'vitest';
import { CalculatorResolver } from '../../src/resolver/calculator.resolver.js';
import { McpError } from "@modelcontextprotocol/sdk/types.js";

describe('CalculatorResolver', () => {
  const calculatorResolver = new CalculatorResolver();

  describe('Tool Definition', () => {
    it('debería tener la definición correcta de la herramienta', () => {
      const definition = calculatorResolver.getToolDefinition();
      
      expect(definition.name).toBe('calcular');
      expect(definition.description).toContain('operaciones matemáticas');
      expect(definition.inputSchema.type).toBe('object');
      expect(definition.inputSchema.properties.operacion).toBeDefined();
      expect(definition.inputSchema.properties.a).toBeDefined();
      expect(definition.inputSchema.properties.b).toBeDefined();
      expect(definition.inputSchema.required).toEqual(['operacion', 'a', 'b']);
    });

    it('debería incluir ejemplos en la definición', () => {
      const definition = calculatorResolver.getToolDefinition();
      
      expect(definition.inputSchema.properties.operacion.examples).toContain('suma');
      expect(definition.inputSchema.properties.operacion.examples).toContain('resta');
      expect(definition.inputSchema.properties.operacion.examples).toContain('multiplicacion');
      expect(definition.inputSchema.properties.operacion.examples).toContain('division');
    });

    it('debería tener enum de operaciones válidas', () => {
      const definition = calculatorResolver.getToolDefinition();
      
      expect(definition.inputSchema.properties.operacion.enum).toEqual([
        'suma', 'resta', 'multiplicacion', 'division'
      ]);
    });
  });

  describe('Validación de entrada', () => {
    it('debería validar entrada correcta', () => {
      const input = { operacion: "suma", a: 5, b: 3 };
      const validated = calculatorResolver.validateInput(input);
      
      expect(validated.operacion).toBe("suma");
      expect(validated.a).toBe(5);
      expect(validated.b).toBe(3);
    });

    it('debería validar todas las operaciones', () => {
      const operaciones = ['suma', 'resta', 'multiplicacion', 'division'];
      
      operaciones.forEach(op => {
        const validated = calculatorResolver.validateInput({ 
          operacion: op, 
          a: 10, 
          b: 2 
        });
        expect(validated.operacion).toBe(op);
      });
    });

    it('debería fallar con operación inválida', () => {
      expect(() => {
        calculatorResolver.validateInput({ 
          operacion: "potencia", 
          a: 5, 
          b: 3 
        });
      }).toThrow('La operación debe ser una de');
    });

    it('debería fallar con división por cero', () => {
      expect(() => {
        calculatorResolver.validateInput({ 
          operacion: "division", 
          a: 5, 
          b: 0 
        });
      }).toThrow('No se puede dividir por cero');
    });

    it('debería fallar sin parámetros requeridos', () => {
      expect(() => {
        calculatorResolver.validateInput({ operacion: "suma" });
      }).toThrow();
      
      expect(() => {
        calculatorResolver.validateInput({ a: 5, b: 3 });
      }).toThrow();
    });

    it('debería fallar con tipos incorrectos', () => {
      expect(() => {
        calculatorResolver.validateInput({ 
          operacion: "suma", 
          a: "cinco", 
          b: 3 
        });
      }).toThrow();

      expect(() => {
        calculatorResolver.validateInput({ 
          operacion: "suma", 
          a: 5, 
          b: "tres" 
        });
      }).toThrow();
    });
  });

  describe('Ejecución completa (Resolución + Caso de uso)', () => {
    it('debería ejecutar suma correctamente', async () => {
      const result = await calculatorResolver.resolveAndExecute({ 
        operacion: "suma", 
        a: 15, 
        b: 25 
      });
      
      expect(result.content).toHaveLength(1);
      expect(result.content[0].type).toBe('text');
      expect(result.content[0].text).toBe('Suma: 15 + 25 = 40');
    });

    it('debería ejecutar resta correctamente', async () => {
      const result = await calculatorResolver.resolveAndExecute({ 
        operacion: "resta", 
        a: 100, 
        b: 30 
      });
      
      expect(result.content[0].text).toBe('Resta: 100 - 30 = 70');
    });

    it('debería ejecutar multiplicación correctamente', async () => {
      const result = await calculatorResolver.resolveAndExecute({ 
        operacion: "multiplicacion", 
        a: 12, 
        b: 8 
      });
      
      expect(result.content[0].text).toBe('Multiplicación: 12 × 8 = 96');
    });

    it('debería ejecutar división correctamente', async () => {
      const result = await calculatorResolver.resolveAndExecute({ 
        operacion: "division", 
        a: 50, 
        b: 5 
      });
      
      expect(result.content[0].text).toBe('División: 50 ÷ 5 = 10');
    });

    it('debería manejar decimales correctamente', async () => {
      const result = await calculatorResolver.resolveAndExecute({ 
        operacion: "division", 
        a: 7, 
        b: 3 
      });
      
      expect(result.content[0].text).toBe('División: 7 ÷ 3 = 2.333333');
    });
  });

  describe('Manejo de errores', () => {
    it('debería lanzar McpError para operación inválida', async () => {
      await expect(
        calculatorResolver.resolveAndExecute({ 
          operacion: "modulo", 
          a: 5, 
          b: 3 
        })
      ).rejects.toThrow(McpError);
    });

    it('debería lanzar McpError para división por cero', async () => {
      await expect(
        calculatorResolver.resolveAndExecute({ 
          operacion: "division", 
          a: 10, 
          b: 0 
        })
      ).rejects.toThrow(McpError);
    });

    it('debería formatear errores de validación correctamente', async () => {
      try {
        await calculatorResolver.resolveAndExecute({ 
          operacion: "potencia", 
          a: 5, 
          b: 3 
        });
      } catch (error) {
        expect(error).toBeInstanceOf(McpError);
        expect(error.message).toContain('Errores de validación en herramienta \'calcular\'');
        expect(error.message).toContain('La operación debe ser una de');
      }
    });

    it('debería manejar entrada completamente inválida', async () => {
      await expect(
        calculatorResolver.resolveAndExecute({})
      ).rejects.toThrow(McpError);
    });

    it('debería manejar tipos incorrectos', async () => {
      await expect(
        calculatorResolver.resolveAndExecute({ 
          operacion: "suma", 
          a: "no_es_numero", 
          b: 3 
        })
      ).rejects.toThrow(McpError);
    });
  });

  describe('Integración', () => {
    it('debería validar y ejecutar en una sola operación', async () => {
      const input = { operacion: "multiplicacion", a: 6, b: 9 };
      const result = await calculatorResolver.resolveAndExecute(input);
      
      expect(result.content[0].text).toBe('Multiplicación: 6 × 9 = 54');
    });

    it('debería ser consistente entre validación separada y ejecución', async () => {
      const input = { operacion: "suma", a: 25, b: 17 };
      
      // Validar por separado
      const validated = calculatorResolver.validateInput(input);
      expect(validated.operacion).toBe('suma');
      expect(validated.a).toBe(25);
      expect(validated.b).toBe(17);
      
      // Ejecutar completo
      const result = await calculatorResolver.resolveAndExecute(input);
      expect(result.content[0].text).toBe('Suma: 25 + 17 = 42');
    });

    it('debería manejar números negativos correctamente', async () => {
      const result = await calculatorResolver.resolveAndExecute({ 
        operacion: "suma", 
        a: -10, 
        b: 15 
      });
      
      expect(result.content[0].text).toBe('Suma: -10 + 15 = 5');
    });

    it('debería manejar números decimales en entrada', async () => {
      const result = await calculatorResolver.resolveAndExecute({ 
        operacion: "multiplicacion", 
        a: 2.5, 
        b: 4 
      });
      
      expect(result.content[0].text).toBe('Multiplicación: 2.5 × 4 = 10');
    });
  });
}); 