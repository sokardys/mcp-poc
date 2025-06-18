import { describe, it, expect } from 'vitest';
import { execSync } from 'child_process';
import { resolve } from 'path';

describe('MCP Server E2E Tests with mcpgod', () => {
  const serverPath = resolve(process.cwd(), 'build', 'index.js');

  it('debería listar las herramientas disponibles', () => {
    const output = execSync(`npx mcpgod tools ${serverPath}`, { 
      encoding: 'utf8',
      timeout: 10000 
    });
    
    expect(output).toContain('saludo');
    expect(output).toContain('calcular');
    expect(output).toContain('fecha_actual');
  });

  it('debería ejecutar la herramienta saludo informal', () => {
    const output = execSync(`npx mcpgod tool ${serverPath} saludo nombre="Mundo"`, { 
      encoding: 'utf8',
      timeout: 10000 
    });
    
    expect(output).toContain('Mundo');
    expect(output).toContain('¿Cómo estás?');
  });

  it('debería ejecutar la herramienta saludo formal', () => {
    const output = execSync(`npx mcpgod tool ${serverPath} saludo nombre="Sr. Test" formal="true"`, { 
      encoding: 'utf8',
      timeout: 10000 
    });
    
    expect(output).toContain('Sr. Test');
    expect(output).toContain('Es un placer saludarle');
  });

  it('debería ejecutar suma correctamente', () => {
    const output = execSync(`npx mcpgod tool ${serverPath} calcular operacion="suma" a=25 b=17`, { 
      encoding: 'utf8',
      timeout: 10000 
    });
    
    expect(output).toContain('Suma: 25 + 17 = 42');
  });

  it('debería ejecutar resta correctamente', () => {
    const output = execSync(`npx mcpgod tool ${serverPath} calcular operacion="resta" a=100 b=23`, { 
      encoding: 'utf8',
      timeout: 10000 
    });
    
    expect(output).toContain('Resta: 100 - 23 = 77');
  });

  it('debería ejecutar multiplicación correctamente', () => {
    const output = execSync(`npx mcpgod tool ${serverPath} calcular operacion="multiplicacion" a=8 b=9`, { 
      encoding: 'utf8',
      timeout: 10000 
    });
    
    expect(output).toContain('Multiplicación: 8 × 9 = 72');
  });

  it('debería ejecutar división correctamente', () => {
    const output = execSync(`npx mcpgod tool ${serverPath} calcular operacion="division" a=84 b=12`, { 
      encoding: 'utf8',
      timeout: 10000 
    });
    
    expect(output).toContain('División: 84 ÷ 12 = 7');
  });

  it('debería obtener la fecha en formato corto', () => {
    const output = execSync(`npx mcpgod tool ${serverPath} fecha_actual formato="corto"`, { 
      encoding: 'utf8',
      timeout: 10000 
    });
    
    expect(output).toContain('La fecha actual es:');
    // Verificar que contiene formato de fecha (números y barras/puntos)
    expect(output).toMatch(/\d+[\/\-.]\d+[\/\-.]\d+/);
  });

  it('debería obtener la fecha en formato largo', () => {
    const output = execSync(`npx mcpgod tool ${serverPath} fecha_actual formato="largo"`, { 
      encoding: 'utf8',
      timeout: 10000 
    });
    
    expect(output).toContain('La fecha actual es:');
    // Debería contener el nombre del día de la semana en español
    expect(output).toMatch(/(lunes|martes|miércoles|jueves|viernes|sábado|domingo)/i);
  });

  it('debería obtener la hora actual', () => {
    const output = execSync(`npx mcpgod tool ${serverPath} fecha_actual formato="hora"`, { 
      encoding: 'utf8',
      timeout: 10000 
    });
    
    expect(output).toContain('La fecha actual es:');
    // Verificar formato de hora (HH:MM)
    expect(output).toMatch(/\d{1,2}:\d{2}/);
  });

  it('debería manejar errores de división por cero', () => {
    expect(() => {
      execSync(`npx mcpgod tool ${serverPath} calcular operacion="division" a=10 b=0`, { 
        encoding: 'utf8',
        timeout: 10000 
      });
    }).toThrow();
  });

  it('debería manejar parámetros faltantes en saludo', () => {
    expect(() => {
      execSync(`npx mcpgod tool ${serverPath} saludo`, { 
        encoding: 'utf8',
        timeout: 10000 
      });
    }).toThrow();
  });

  it('debería manejar operación matemática inválida', () => {
    expect(() => {
      execSync(`npx mcpgod tool ${serverPath} calcular operacion="potencia" a=2 b=3`, { 
        encoding: 'utf8',
        timeout: 10000 
      });
    }).toThrow();
  });
}); 