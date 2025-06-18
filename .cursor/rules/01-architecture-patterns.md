# 01 - Architecture Patterns

> **Patrones arquitecturales obligatorios para servidores MCP escalables**

## 🎯 Patrón Principal: Resolver → UseCase

```
Tool Request → Resolver (Validación) → UseCase (Lógica) → Response
```

### Responsabilidades Claras

- **Resolver**: Validación Zod + Tool Definition + Orquestación
- **UseCase**: Lógica de negocio pura + Algoritmos + Formateo
- **Orquestador**: Registro + Delegación + Coordinación

## 🏗️ Template UseCase

```typescript
import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";

export interface [Feature]Input {
  // Definir interfaz de entrada (ya validada)
}

export class [Feature]UseCase {
  
  /**
   * Ejecuta la lógica de negocio del caso de uso
   * @param input - Datos ya validados por el resolver
   * @returns Resultado estructurado para MCP
   */
  execute(input: [Feature]Input): CallToolResult {
    try {
      // 1. Lógica de negocio pura
      const result = this.processBusinessLogic(input);
      
      // 2. Formateo del resultado
      const formattedResult = this.formatOutput(result);
      
      // 3. Estructura MCP
      return {
        content: [
          {
            type: "text",
            text: formattedResult
          }
        ]
      };
    } catch (error) {
      throw new Error(`Error en [Feature]: ${error.message}`);
    }
  }

  private processBusinessLogic(input: [Feature]Input): any {
    // Algoritmos y reglas de negocio aquí
    // SIN validación (ya hecha en resolver)
    // SIN manejo de McpError (se hace en resolver)
  }

  private formatOutput(result: any): string {
    // Formateo y presentación del resultado
    // Aquí van las reglas de formato específicas
  }
}
```

## 🔧 Template Resolver

```typescript
import { z } from 'zod';
import { Tool, CallToolResult, McpError, ErrorCode } from "@modelcontextprotocol/sdk/types.js";
import { [Feature]UseCase } from '../usecase/[feature].usecase.js';

// 1. Schema Zod para validación
const [Feature]Schema = z.object({
  // Definir campos con validaciones específicas
  field1: z.string().min(1, "Campo requerido").max(100, "Máximo 100 caracteres"),
  field2: z.number().optional().default(0),
  // Agregar más campos según necesidad
});

type [Feature]Input = z.infer<typeof [Feature]Schema>;

export class [Feature]Resolver {
  private useCase = new [Feature]UseCase();

  /**
   * Definición de la herramienta para MCP
   */
  getToolDefinition(): Tool {
    return {
      name: "[tool_name]",
      description: "Descripción detallada de la funcionalidad",
      inputSchema: {
        type: "object",
        properties: {
          field1: {
            type: "string",
            description: "Descripción del campo",
            examples: ["ejemplo1", "ejemplo2"],
            minLength: 1,
            maxLength: 100
          },
          field2: {
            type: "number",
            description: "Descripción del campo numérico",
            default: 0,
            examples: [1, 2, 3]
          }
        },
        required: ["field1"],
        additionalProperties: false
      }
    };
  }

  /**
   * Validación de entrada con Zod
   */
  validateInput(input: any): [Feature]Input {
    try {
      return [Feature]Schema.parse(input);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const details = error.errors.map(err => 
          `${err.path.join('.')}: ${err.message}`
        ).join(', ');
        throw new Error(`Errores de validación: ${details}`);
      }
      throw error;
    }
  }

  /**
   * Resolución completa: Validación + Ejecución
   */
  async resolveAndExecute(input: any): Promise<CallToolResult> {
    try {
      const validatedInput = this.validateInput(input);
      return this.useCase.execute(validatedInput);
    } catch (error) {
      throw new McpError(
        ErrorCode.InvalidParams,
        `Errores de validación en herramienta '[tool_name]': ${error.message}`
      );
    }
  }
}
```

## 📋 Orquestador Central

```typescript
// src/resolver/index.ts
import { [Feature]Resolver } from './[feature].resolver.js';

export class ToolResolver {
  private static resolvers = new Map([
    ['[tool_name]', new [Feature]Resolver()],
    // Agregar más resolvers aquí
  ]);

  // ... resto de la implementación (ver 00-project-initialization.md)
}

// Registro automático al final del archivo
// (Esto hace que sea plug-and-play)
```

## 🔄 Flujo de Desarrollo

### 1. **Crear Use Case**
```bash
# Archivo: src/usecase/[feature].usecase.ts
# - Define interfaz de entrada
# - Implementa lógica de negocio pura
# - Formatea salida
```

### 2. **Crear Resolver**
```bash
# Archivo: src/resolver/[feature].resolver.ts
# - Define schema Zod
# - Implementa tool definition
# - Conecta con use case
```

### 3. **Registrar en Orquestador**
```typescript
// En src/resolver/index.ts
import { [Feature]Resolver } from './[feature].resolver.js';

private static resolvers = new Map([
  ['[tool_name]', new [Feature]Resolver()],
  // ... otros resolvers
]);
```

### 4. **Crear Tests**
```bash
# tests/usecase/[feature].usecase.test.ts - Lógica de negocio
# tests/resolver/[feature].resolver.test.ts - Validación
```

## ✅ Principios Arquitecturales

### **Separación de Responsabilidades**
- ❌ **NO**: Validación en use case
- ❌ **NO**: Lógica de negocio en resolver
- ❌ **NO**: Tool definition en use case
- ✅ **SÍ**: Cada capa con responsabilidad específica

### **Inversión de Dependencias**
- ✅ Resolver depende de UseCase
- ✅ UseCase NO depende de Resolver
- ✅ UseCase NO depende de MCP SDK

### **Single Responsibility**
- ✅ Un resolver por herramienta
- ✅ Un use case por funcionalidad
- ✅ Un esquema Zod por entrada

### **Open/Closed Principle**
- ✅ Agregar nuevas herramientas sin modificar existentes
- ✅ Orquestador extensible vía registro
- ✅ Use cases reutilizables

## 🚫 Anti-Patrones a Evitar

### ❌ **Monolitos**
```typescript
// MAL: Todo en un archivo
export function handleAllTools(name: string, args: any) {
  if (name === 'tool1') { /* lógica */ }
  if (name === 'tool2') { /* lógica */ }
  // ...
}
```

### ❌ **Validación en Use Case**
```typescript
// MAL: Validación mezclada con lógica
export class BadUseCase {
  execute(input: any) {
    if (!input.name) throw new Error("Name required"); // ❌
    // lógica...
  }
}
```

### ❌ **Lógica en Resolver**
```typescript
// MAL: Lógica de negocio en resolver
export class BadResolver {
  async resolveAndExecute(input: any) {
    const validated = this.validate(input);
    // ❌ Lógica de negocio aquí
    const result = validated.a + validated.b;
    return { content: [{ type: "text", text: result.toString() }] };
  }
}
```

## 📏 Métricas de Calidad

- **Cohesión Alta**: Cada clase con responsabilidad específica
- **Acoplamiento Bajo**: Use cases independientes entre sí
- **Testabilidad**: Cada capa testeable por separado
- **Reutilización**: Use cases reutilizables en diferentes contextos

---

> **🎯 Objetivo**: Esta arquitectura garantiza que el código sea **mantenible**, **testeable** y **escalable** para equipos grandes trabajando en paralelo. 