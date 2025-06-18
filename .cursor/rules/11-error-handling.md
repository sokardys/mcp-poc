# 🚨 Error Handling - Manejo Robusto de Errores MCP

> **Reglas para manejo consistente y robusto de errores en servidores MCP**

## 🎯 Objetivo

Establecer un sistema de manejo de errores **predecible, informativo y consistente** que facilite la depuración y mejore la experiencia del usuario.

## 📋 Reglas Obligatorias

### 1. **Uso de McpError para Todos los Errores**

```typescript
import { McpError, ErrorCode } from '@modelcontextprotocol/sdk/types.js';

// ✅ CORRECTO - Usar McpError apropiados
throw new McpError(
  ErrorCode.InvalidParams,
  "El parámetro 'age' debe ser un número positivo"
);

// ❌ INCORRECTO - Error genérico
throw new Error("Invalid age");
```

### 2. **Mapeo de ErrorCode Apropiado**

```typescript
// Validación de entrada
if (!input.required) {
  throw new McpError(ErrorCode.InvalidParams, "Campo requerido faltante");
}

// Recurso no encontrado
if (!user) {
  throw new McpError(ErrorCode.InvalidRequest, "Usuario no encontrado");
}

// Errores de operación
catch (error) {
  throw new McpError(ErrorCode.InternalError, `Operación fallida: ${error.message}`);
}
```

### 3. **Estructura de Error Handling por Capas**

#### **Use Case Layer**
```typescript
export class CalculatorUseCase {
  divide(a: number, b: number): number {
    if (b === 0) {
      throw new McpError(
        ErrorCode.InvalidParams,
        "División por cero no permitida"
      );
    }
    return a / b;
  }
}
```

#### **Resolver Layer**
```typescript
export function createCalculatorResolver(): ToolDefinition {
  return {
    name: "calculator",
    handler: async (request) => {
      try {
        // Validación ya maneja errores
        const input = calculatorSchema.parse(request.params.arguments);
        
        // Use case maneja su propia lógica de errores
        const result = calculatorUseCase.calculate(input);
        
        return { content: [{ type: "text", text: result.toString() }] };
      } catch (error) {
        // Re-throw McpError, wrap otros errores
        if (error instanceof McpError) {
          throw error;
        }
        throw new McpError(
          ErrorCode.InternalError,
          `Error en calculadora: ${error.message}`
        );
      }
    }
  };
}
```

### 4. **Validación con Zod + Error Mapping**

```typescript
import { ZodError } from 'zod';

function validateInput<T>(schema: ZodSchema<T>, data: unknown): T {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof ZodError) {
      const fieldErrors = error.errors.map(e => 
        `${e.path.join('.')}: ${e.message}`
      ).join(', ');
      
      throw new McpError(
        ErrorCode.InvalidParams,
        `Validación fallida: ${fieldErrors}`
      );
    }
    throw new McpError(
      ErrorCode.InternalError,
      `Error de validación: ${error.message}`
    );
  }
}
```

### 5. **Mensajes de Error Informativos**

```typescript
// ✅ CORRECTO - Específico y accionable
throw new McpError(
  ErrorCode.InvalidParams,
  "El campo 'email' debe ser una dirección de correo válida. Recibido: 'invalid-email'"
);

// ❌ INCORRECTO - Vago
throw new McpError(ErrorCode.InvalidParams, "Invalid input");

// ✅ CORRECTO - Con contexto
throw new McpError(
  ErrorCode.InternalError,
  `Error conectando a la base de datos: ${dbError.message}. Reintente en unos momentos.`
);
```

## 🧪 Testing de Error Handling

### 1. **Tests de Casos de Error**

```typescript
// tests/usecase/calculator.usecase.test.ts
describe('CalculatorUseCase Error Handling', () => {
  it('should throw McpError for division by zero', () => {
    expect(() => calculatorUseCase.divide(10, 0))
      .toThrow(new McpError(ErrorCode.InvalidParams, "División por cero no permitida"));
  });

  it('should throw McpError for invalid operations', () => {
    expect(() => calculatorUseCase.calculate({ operation: 'invalid', a: 1, b: 2 }))
      .toThrow(McpError);
  });
});
```

### 2. **Tests de Validación**

```typescript
// tests/resolver/calculator.resolver.test.ts
describe('Calculator Resolver Error Handling', () => {
  it('should handle Zod validation errors', async () => {
    const invalidRequest = {
      params: { arguments: { operation: 'add', a: 'invalid', b: 2 } }
    };

    await expect(resolver.handler(invalidRequest))
      .rejects.toThrow(new McpError(ErrorCode.InvalidParams, /Validación fallida/));
  });

  it('should wrap unexpected errors', async () => {
    // Mock use case to throw unexpected error
    jest.spyOn(calculatorUseCase, 'calculate').mockImplementation(() => {
      throw new Error('Unexpected error');
    });

    await expect(resolver.handler(validRequest))
      .rejects.toThrow(new McpError(ErrorCode.InternalError, /Error en calculadora/));
  });
});
```

## 🏗️ Patrones de Error Handling

### 1. **Error Boundary en Use Cases**

```typescript
export abstract class BaseUseCase {
  protected handleError(error: unknown, context: string): never {
    if (error instanceof McpError) {
      throw error;
    }
    
    console.error(`Error in ${context}:`, error);
    throw new McpError(
      ErrorCode.InternalError,
      `Error en ${context}: ${error instanceof Error ? error.message : 'Error desconocido'}`
    );
  }
}
```

### 2. **Validation Helper**

```typescript
export class ValidationHelper {
  static validateAndParse<T>(schema: ZodSchema<T>, data: unknown, context: string): T {
    try {
      return schema.parse(data);
    } catch (error) {
      if (error instanceof ZodError) {
        const details = error.errors.map(e => 
          `${e.path.join('.')}: ${e.message}`
        ).join(', ');
        
        throw new McpError(
          ErrorCode.InvalidParams,
          `Validación fallida en ${context}: ${details}`
        );
      }
      
      throw new McpError(
        ErrorCode.InternalError,
        `Error de validación en ${context}: ${error.message}`
      );
    }
  }
}
```

### 3. **Async Error Handling**

```typescript
export class AsyncOperationHelper {
  static async safeExecute<T>(
    operation: () => Promise<T>,
    context: string,
    timeout: number = 5000
  ): Promise<T> {
    try {
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Timeout')), timeout);
      });
      
      return await Promise.race([operation(), timeoutPromise]);
    } catch (error) {
      if (error instanceof McpError) {
        throw error;
      }
      
      throw new McpError(
        ErrorCode.InternalError,
        `Error en operación asíncrona ${context}: ${error.message}`
      );
    }
  }
}
```

## 📊 Checklist de Error Handling

### ✅ Estructura
- [ ] Todos los errores usan `McpError` con `ErrorCode` apropiado
- [ ] Mensajes de error son específicos y accionables
- [ ] Validación Zod convierte errores a `McpError`
- [ ] Use cases manejan errores de negocio
- [ ] Resolvers wrappean errores inesperados

### ✅ Testing
- [ ] Tests para cada caso de error conocido
- [ ] Tests de validación de entrada
- [ ] Tests de manejo de errores inesperados
- [ ] Coverage de branches de error >85%

### ✅ Mensajes
- [ ] Errores incluyen contexto útil
- [ ] No exponen información sensible
- [ ] Sugieren acciones correctivas cuando sea posible
- [ ] Consistentes en formato y estilo

### ✅ Logging
- [ ] Errores internos se loggean para debugging
- [ ] Errores de validación no se loggean (spam)
- [ ] Contexto suficiente para troubleshooting
- [ ] No se loggea información sensible

---

> **💡 Principio Clave**: Un buen error handling hace que los problemas sean **fáciles de diagnosticar** y **fáciles de resolver**. Los errores deben ser tus aliados, no obstáculos. 