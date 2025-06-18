import { describe, it, expect } from 'vitest';
import { ToolResolver } from '../../src/resolver/index.js';
import { McpError } from "@modelcontextprotocol/sdk/types.js";

describe('ToolResolver (Orquestador)', () => {
  describe('Registro de Herramientas', () => {
    it('debería registrar todas las herramientas', () => {
      const tools = ToolResolver.getToolDefinitions();
      
      expect(tools).toHaveLength(3);
      expect(tools.map(t => t.name)).toEqual(['saludo', 'calcular', 'fecha_actual']);
    });

    it('debería obtener información de herramienta específica', () => {
      const saludoInfo = ToolResolver.getToolInfo('saludo');
      expect(saludoInfo?.name).toBe('saludo');

      const calculatorInfo = ToolResolver.getToolInfo('calcular');
      expect(calculatorInfo?.name).toBe('calcular');

      const datetimeInfo = ToolResolver.getToolInfo('fecha_actual');
      expect(datetimeInfo?.name).toBe('fecha_actual');
    });

    it('debería retornar null para herramienta inexistente', () => {
      const info = ToolResolver.getToolInfo('inexistente');
      expect(info).toBeNull();
    });
  });

  describe('Delegación Básica', () => {
    it('debería delegar correctamente al resolver de saludo', async () => {
      const result = await ToolResolver.resolveAndExecute('saludo', { 
        nombre: "Test Delegación" 
      });
      
      expect(result.content[0].text).toContain('Test Delegación');
    });

    it('debería delegar correctamente al resolver de calculadora', async () => {
      const result = await ToolResolver.resolveAndExecute('calcular', { 
        operacion: "suma", 
        a: 2, 
        b: 3 
      });
      
      expect(result.content[0].text).toBe('Suma: 2 + 3 = 5');
    });

    it('debería delegar correctamente al resolver de fecha', async () => {
      const result = await ToolResolver.resolveAndExecute('fecha_actual', { 
        formato: "corto" 
      });
      
      expect(result.content[0].text).toContain('La fecha actual es:');
    });
  });

  describe('Manejo de Errores del Orquestador', () => {
    it('debería fallar con herramienta inexistente', async () => {
      await expect(
        ToolResolver.resolveAndExecute('herramienta_inexistente', {})
      ).rejects.toThrow(McpError);
    });

    it('debería propagar errores de validación', async () => {
      await expect(
        ToolResolver.resolveAndExecute('saludo', { nombre: "" })
      ).rejects.toThrow(McpError);
    });

    it('debería incluir lista de herramientas en error', async () => {
      try {
        await ToolResolver.resolveAndExecute('inexistente', {});
      } catch (error) {
        expect(error.message).toContain('saludo, calcular, fecha_actual');
      }
    });
  });
}); 