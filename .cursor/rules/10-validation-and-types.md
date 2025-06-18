# 10 - Validation and Types

> **Validación robusta con Zod y tipos seguros con TypeScript**

## 🎯 Principios de Validación

- **Validación en la entrada**: Todo input debe validarse con Zod
- **Tipos seguros**: Inferir tipos desde esquemas Zod
- **Mensajes claros**: Errores descriptivos para el usuario
- **Conversión automática**: String-to-number, string-to-boolean

## 🔧 Template Zod Schema

```typescript
import { z } from 'zod';

// Schema base con validaciones comunes
const [Feature]Schema = z.object({
  // String con restricciones
  name: z.string()
    .min(1, "Nombre es requerido")
    .max(100, "Nombre no puede exceder 100 caracteres")
    .regex(/^[a-zA-Z0-9\s]+$/, "Solo letras, números y espacios"),

  // Number con rango
  value: z.number()
    .min(0, "Valor debe ser positivo")
    .max(1000, "Valor máximo es 1000")
    .optional()
    .default(0),

  // Boolean con preprocessing
  enabled: z.preprocess(
    (val) => {
      if (typeof val === 'string') {
        return val.toLowerCase() === 'true';
      }
      return val;
    },
    z.boolean().optional().default(true)
  ),

  // Enum con valores específicos
  type: z.enum(['basic', 'advanced', 'expert'])
    .optional()
    .default('basic'),

  // Array con validación de elementos
  tags: z.array(z.string().min(1))
    .optional()
    .default([]),

  // Object anidado
  config: z.object({
    precision: z.number().min(0).max(10).default(2),
    format: z.string().optional()
  }).optional()
});

// Inferir tipo TypeScript
type [Feature]Input = z.infer<typeof [Feature]Schema>;
```

## 🛡️ Validaciones Comunes MCP

### Strings
```typescript
// Texto básico
text: z.string().min(1, "Texto requerido"),

// URL válida
url: z.string().url("URL inválida"),

// Email válido
email: z.string().email("Email inválido"),

// Fecha ISO string
date: z.string().datetime("Fecha debe ser ISO string"),

// Path de archivo
path: z.string().regex(/^[^\0]+$/, "Path inválido"),

// Código (sin espacios)
code: z.string().regex(/^[A-Z0-9_]+$/, "Solo mayúsculas, números y guiones bajos")
```

### Numbers
```typescript
// Entero positivo
count: z.number().int().positive("Debe ser entero positivo"),

// Decimal con precisión
price: z.number().multipleOf(0.01, "Máximo 2 decimales"),

// Rango específico
percentage: z.number().min(0).max(100),

// Conversión desde string
age: z.preprocess(
  (val) => typeof val === 'string' ? parseInt(val) : val,
  z.number().int().min(0).max(120)
)
```

### Arrays
```typescript
// Array no vacío
items: z.array(z.string()).min(1, "Al menos un elemento requerido"),

// Array con límite
options: z.array(z.string()).max(10, "Máximo 10 opciones"),

// Array único (sin duplicados)
unique: z.array(z.string()).refine(
  (arr) => new Set(arr).size === arr.length,
  "No se permiten duplicados"
)
```

## 🎨 Tool Schema Definition

```typescript
/**
 * Convierte Zod schema a JSON Schema para MCP
 */
function zodToJsonSchema(zodSchema: z.ZodObject<any>): any {
  const shape = zodSchema.shape;
  const properties: any = {};
  const required: string[] = [];

  for (const [key, zodType] of Object.entries(shape)) {
    const field = zodType as z.ZodTypeAny;
    
    // Determinar tipo JSON Schema
    if (field instanceof z.ZodString) {
      properties[key] = {
        type: "string",
        description: `Campo ${key}`,
        ...getStringConstraints(field)
      };
    } else if (field instanceof z.ZodNumber) {
      properties[key] = {
        type: "number",
        description: `Campo ${key}`,
        ...getNumberConstraints(field)
      };
    } else if (field instanceof z.ZodBoolean) {
      properties[key] = {
        type: "boolean",
        description: `Campo ${key}`,
        default: field._def.defaultValue?.()
      };
    }
    
    // Determinar si es requerido
    if (!field.isOptional()) {
      required.push(key);
    }
  }

  return {
    type: "object",
    properties,
    required,
    additionalProperties: false
  };
}

// Ejemplo de uso en resolver
getToolDefinition(): Tool {
  return {
    name: "tool_name",
    description: "Descripción de la herramienta",
    inputSchema: zodToJsonSchema([Feature]Schema)
  };
}
```

## 🚨 Manejo de Errores de Validación

```typescript
export class [Feature]Resolver {
  validateInput(input: any): [Feature]Input {
    try {
      return [Feature]Schema.parse(input);
    } catch (error) {
      if (error instanceof z.ZodError) {
        // Formatear errores Zod de manera legible
        const details = error.errors.map(err => {
          const path = err.path.length > 0 ? `${err.path.join('.')}: ` : '';
          return `${path}${err.message}`;
        }).join(', ');
        
        throw new Error(`Errores de validación: ${details}`);
      }
      throw error;
    }
  }

  async resolveAndExecute(input: any): Promise<CallToolResult> {
    try {
      const validatedInput = this.validateInput(input);
      return this.useCase.execute(validatedInput);
    } catch (error) {
      // Convertir a McpError apropiado
      throw new McpError(
        ErrorCode.InvalidParams,
        `Error en herramienta '${this.getToolDefinition().name}': ${error.message}`
      );
    }
  }
}
```

## 🔄 Preprocessing Patterns

### String-to-Number
```typescript
const numberField = z.preprocess(
  (val) => {
    if (typeof val === 'string') {
      const num = parseFloat(val);
      return isNaN(num) ? val : num; // Devolver original si no es número
    }
    return val;
  },
  z.number().min(0)
);
```

### String-to-Boolean
```typescript
const booleanField = z.preprocess(
  (val) => {
    if (typeof val === 'string') {
      const lower = val.toLowerCase();
      if (['true', '1', 'yes', 'on'].includes(lower)) return true;
      if (['false', '0', 'no', 'off'].includes(lower)) return false;
    }
    return val;
  },
  z.boolean()
);
```

### Array-from-String
```typescript
const arrayField = z.preprocess(
  (val) => {
    if (typeof val === 'string') {
      return val.split(',').map(s => s.trim()).filter(s => s.length > 0);
    }
    return val;
  },
  z.array(z.string())
);
```

## 📝 TypeScript Integration

```typescript
// Interfaz derivada de Zod
export interface [Feature]Input extends z.infer<typeof [Feature]Schema> {}

// Tipo para el resultado
export interface [Feature]Result {
  success: boolean;
  data?: any;
  message: string;
}

// UseCase con tipos seguros
export class [Feature]UseCase {
  execute(input: [Feature]Input): CallToolResult {
    // input ya está tipado y validado
    const result = this.processData(input);
    
    return {
      content: [{
        type: "text",
        text: this.formatResult(result)
      }]
    };
  }

  private processData(input: [Feature]Input): [Feature]Result {
    // Lógica con tipos seguros
  }
}
```

## ✅ Best Practices

### **Definición de Schemas**
- ✅ **Descriptivos**: Mensajes de error claros
- ✅ **Restrictivos**: Validar tanto como sea posible
- ✅ **Defaults**: Valores por defecto sensatos
- ✅ **Preprocessing**: Conversión automática de tipos

### **Manejo de Errores**
- ✅ **Específicos**: Indicar qué campo falló
- ✅ **Informativos**: Explicar qué se esperaba
- ✅ **Consistentes**: Mismo formato de error siempre
- ✅ **McpError**: Usar códigos de error MCP apropiados

### **Tipos TypeScript**
- ✅ **Inferir**: Usar `z.infer<>` siempre
- ✅ **Exportar**: Interfaces disponibles para use cases
- ✅ **Strict**: TypeScript strict mode habilitado
- ✅ **Documentar**: JSDoc en tipos complejos

## 🚫 Anti-Patrones

### ❌ **Validación Manual**
```typescript
// MAL: Validación manual propensa a errores
if (!input.name || typeof input.name !== 'string') {
  throw new Error("Name is required");
}
```

### ❌ **Any Types**
```typescript
// MAL: Perder seguridad de tipos
function process(input: any): any {
  return input.someProperty; // Sin verificación
}
```

### ❌ **Validación en UseCase**
```typescript
// MAL: Validación en la capa incorrecta
export class BadUseCase {
  execute(input: any) {
    if (!input.value) throw new Error("Value required"); // ❌
  }
}
```

---

> **🎯 Objetivo**: Zero runtime errors por datos mal formados. La validación debe ser exhaustiva y los tipos deben ser seguros en toda la aplicación. 