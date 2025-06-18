# 12 - Testing Strategy

> **Estrategia de testing por capas para proyectos MCP escalables**

## 🎯 Pirámide de Testing

```
    🔗 E2E Tests (13)
   📋 Integration Tests (69)  
  🧠 Unit Tests (41)
```

### Distribución Recomendada
- **Unit Tests** (~35%): Lógica de negocio pura (use cases)
- **Integration Tests** (~55%): Validación y orquestación (resolvers)
- **E2E Tests** (~10%): Flujo completo con mcpgod

## 🧪 Estructura de Tests Espejo

```
tests/
├── e2e.test.ts                     # Tests End-to-End completos
├── resolver/
│   ├── index.test.ts              # Tests del orquestador (básicos)
│   └── [feature].resolver.test.ts # Tests de validación Zod
└── usecase/
    └── [feature].usecase.test.ts  # Tests de lógica de negocio
```

## 🧠 Template Unit Tests (Use Case)

```typescript
// tests/usecase/[feature].usecase.test.ts
import { describe, it, expect } from 'vitest';
import { [Feature]UseCase } from '../../src/usecase/[feature].usecase.js';

describe('[Feature]UseCase', () => {
  const useCase = new [Feature]UseCase();

  describe('Lógica de negocio principal', () => {
    it('debería procesar entrada básica correctamente', () => {
      const input = { /* datos de prueba */ };
      const result = useCase.execute(input);
      
      expect(result.content[0].text).toContain('resultado esperado');
    });

    it('debería manejar casos edge', () => {
      const edgeCase = { /* caso límite */ };
      const result = useCase.execute(edgeCase);
      
      expect(result.content[0].text).toBe('resultado específico');
    });
  });

  describe('Algoritmos específicos', () => {
    it('debería aplicar reglas de negocio correctas', () => {
      // Test de algoritmos sin validación
      // Enfoque en lógica pura
    });
  });

  describe('Formateo de salida', () => {
    it('debería formatear resultado según especificación', () => {
      // Test de presentación de datos
    });

    it('debería retornar estructura MCP correcta', () => {
      const result = useCase.execute({ /* input mínimo */ });
      
      expect(result).toHaveProperty('content');
      expect(result.content).toBeInstanceOf(Array);
      expect(result.content[0]).toHaveProperty('type', 'text');
      expect(result.content[0]).toHaveProperty('text');
    });
  });
});
```

## 📋 Template Integration Tests (Resolver)

```typescript
// tests/resolver/[feature].resolver.test.ts
import { describe, it, expect } from 'vitest';
import { [Feature]Resolver } from '../../src/resolver/[feature].resolver.js';
import { McpError } from "@modelcontextprotocol/sdk/types.js";

describe('[Feature]Resolver', () => {
  const resolver = new [Feature]Resolver();

  describe('Tool Definition', () => {
    it('debería tener la definición correcta', () => {
      const definition = resolver.getToolDefinition();
      
      expect(definition.name).toBe('[tool_name]');
      expect(definition.description).toContain('descripción');
      expect(definition.inputSchema.type).toBe('object');
      expect(definition.inputSchema.properties).toBeDefined();
    });

    it('debería incluir ejemplos y restricciones', () => {
      const definition = resolver.getToolDefinition();
      
      expect(definition.inputSchema.properties.field1.examples).toBeDefined();
      expect(definition.inputSchema.required).toContain('field1');
    });
  });

  describe('Validación Zod', () => {
    it('debería validar entrada correcta', () => {
      const validInput = { field1: "válido", field2: 123 };
      const result = resolver.validateInput(validInput);
      
      expect(result.field1).toBe("válido");
      expect(result.field2).toBe(123);
    });

    it('debería aplicar valores por defecto', () => {
      const minimalInput = { field1: "mínimo" };
      const result = resolver.validateInput(minimalInput);
      
      expect(result.field2).toBe(0); // valor por defecto
    });

    it('debería fallar con entrada inválida', () => {
      expect(() => {
        resolver.validateInput({ field1: "" }); // string vacío
      }).toThrow('Campo requerido');
    });

    it('debería fallar con tipos incorrectos', () => {
      expect(() => {
        resolver.validateInput({ field1: 123 }); // number en lugar de string
      }).toThrow();
    });
  });

  describe('Integración Resolver + UseCase', () => {
    it('debería ejecutar flujo completo correctamente', async () => {
      const validInput = { field1: "test" };
      const result = await resolver.resolveAndExecute(validInput);
      
      expect(result.content[0].text).toContain('test');
    });

    it('debería lanzar McpError para entrada inválida', async () => {
      await expect(
        resolver.resolveAndExecute({ field1: "" })
      ).rejects.toThrow(McpError);
    });

    it('debería formatear errores correctamente', async () => {
      try {
        await resolver.resolveAndExecute({ field1: "" });
      } catch (error) {
        expect(error).toBeInstanceOf(McpError);
        expect(error.message).toContain('Errores de validación en herramienta');
      }
    });
  });
});
```

## 🔗 Template E2E Tests

```typescript
// tests/e2e.test.ts
import { describe, it, expect } from 'vitest';
import { ToolResolver } from '../src/resolver/index.js';

describe('E2E - MCP Server Integration', () => {
  describe('Tool Registration', () => {
    it('debería registrar todas las herramientas', () => {
      const tools = ToolResolver.getToolDefinitions();
      expect(tools.length).toBeGreaterThan(0);
      expect(tools.map(t => t.name)).toContain('[tool_name]');
    });
  });

  describe('Complete Flow Testing', () => {
    it('debería ejecutar flujo completo [tool_name]', async () => {
      const result = await ToolResolver.resolveAndExecute('[tool_name]', {
        field1: "e2e test"
      });
      
      expect(result.content[0].text).toContain('e2e test');
    });

    it('debería manejar errores de extremo a extremo', async () => {
      await expect(
        ToolResolver.resolveAndExecute('[tool_name]', { invalid: "data" })
      ).rejects.toThrow();
    });
  });

  describe('mcpgod Compatibility', () => {
    it('debería ser compatible con mcpgod format', async () => {
      // Tests específicos para compatibilidad con mcpgod
      // Verificar que el formato de respuesta es correcto
      const result = await ToolResolver.resolveAndExecute('[tool_name]', {
        field1: "mcpgod test"
      });
      
      expect(result).toHaveProperty('content');
      expect(result.content[0]).toHaveProperty('type');
      expect(result.content[0]).toHaveProperty('text');
    });
  });
});
```

## 📊 Configuración Coverage

### vitest.config.ts
```typescript
export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      include: ['src/**/*'],
      exclude: [
        'src/**/*.test.ts',
        'src/**/*.spec.ts',
        'src/index.ts' // Archivo de servidor, testear vía E2E
      ],
      reporter: ['text', 'json', 'html'],
      thresholds: {
        functions: 90,    // Mínimo 90% funciones cubiertas
        branches: 85,     // Mínimo 85% branches cubiertos
        lines: 85,        // Mínimo 85% líneas cubiertas
        statements: 85    // Mínimo 85% statements cubiertos
      }
    }
  }
});
```

## 🎯 Estrategias por Tipo de Test

### **Unit Tests (Use Cases)**
- ✅ **Enfoque**: Lógica de negocio pura
- ✅ **No Mock**: Datos de entrada reales
- ✅ **Casos Edge**: Límites y extremos
- ✅ **Performance**: Algoritmos complejos
- ❌ **Evitar**: Validación (es responsabilidad del resolver)

### **Integration Tests (Resolvers)**
- ✅ **Enfoque**: Validación Zod + integración con use case
- ✅ **Mock**: No necesario (use case es dependency injection)
- ✅ **Error Handling**: McpError y ZodError
- ✅ **Tool Definition**: Estructura y metadatos
- ❌ **Evitar**: Lógica de negocio (es responsabilidad del use case)

### **E2E Tests**
- ✅ **Enfoque**: Flujo completo del servidor
- ✅ **mcpgod Compatible**: Formato de respuesta
- ✅ **Real Integration**: ToolResolver coordination
- ✅ **Error Propagation**: Manejo de errores end-to-end
- ❌ **Evitar**: Tests detallados (ya cubiertos en unit/integration)

## 📋 Scripts de Testing

### package.json
```json
{
  "scripts": {
    "test": "npm run build && vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage",
    "test:unit": "vitest run tests/usecase/",
    "test:integration": "vitest run tests/resolver/",
    "test:e2e": "vitest run tests/e2e.test.ts && mcpgod test build/index.js"
  }
}
```

## 🏆 Checklist de Testing Completo

### ✅ **Cobertura Mínima**
- [ ] >90% functions coverage
- [ ] >85% branches coverage  
- [ ] >85% lines coverage
- [ ] Todos los use cases testeados
- [ ] Todos los resolvers testeados

### ✅ **Casos Obligatorios**
- [ ] Happy path (casos normales)
- [ ] Edge cases (límites)
- [ ] Error cases (entradas inválidas)
- [ ] Default values (valores por defecto)
- [ ] Type conversion (conversión de tipos)

### ✅ **Estructura**
- [ ] Tests espejo de src/
- [ ] Naming conventions consistentes
- [ ] Tests independientes (no dependen entre sí)
- [ ] Setup y teardown apropiados

### ✅ **Calidad**
- [ ] Tests descriptivos y claros
- [ ] Assertions específicas
- [ ] No false positives
- [ ] Fast execution (<10s total)

---

> **💡 Principio**: Cada capa tiene su enfoque de testing específico. No duplicar responsabilidades entre tipos de test. 