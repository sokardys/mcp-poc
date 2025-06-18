# 📚 Documentation - Documentación y JSDoc

> **Reglas para documentación clara, completa y mantenible en servidores MCP**

## 🎯 Objetivo

Crear documentación **auto-explicativa, actualizada y útil** que facilite el mantenimiento, la integración y el uso del servidor MCP.

## 📋 Reglas Obligatorias

### 1. **JSDoc en Todas las Funciones Públicas**

```typescript
/**
 * Realiza cálculos aritméticos básicos.
 * 
 * @param operation - Tipo de operación a realizar (add, subtract, multiply, divide)
 * @param a - Primer operando numérico
 * @param b - Segundo operando numérico
 * @returns Resultado de la operación aritmética
 * @throws {McpError} Cuando la operación es inválida o hay división por cero
 * 
 * @example
 * ```typescript
 * const result = calculate('add', 5, 3); // Returns 8
 * const division = calculate('divide', 10, 2); // Returns 5
 * ```
 */
export function calculate(operation: string, a: number, b: number): number {
  // Implementation
}
```

### 2. **Documentación de Schemas Zod**

```typescript
/**
 * Schema de validación para operaciones de calculadora.
 * 
 * @property operation - Tipo de operación: 'add' | 'subtract' | 'multiply' | 'divide'
 * @property a - Primer número (requerido)
 * @property b - Segundo número (requerido)
 */
export const calculatorSchema = z.object({
  /** Operación aritmética a realizar */
  operation: z.enum(['add', 'subtract', 'multiply', 'divide'])
    .describe('Tipo de operación aritmética'),
  
  /** Primer operando numérico */
  a: z.number()
    .describe('Primer número para la operación'),
  
  /** Segundo operando numérico */
  b: z.number()
    .describe('Segundo número para la operación'),
});
```

### 3. **Documentación de Use Cases**

```typescript
/**
 * Use case para operaciones de calculadora.
 * 
 * Encapsula la lógica de negocio para realizar cálculos aritméticos básicos
 * con validación de entrada y manejo de casos especiales.
 * 
 * @example
 * ```typescript
 * const calculator = new CalculatorUseCase();
 * const result = calculator.calculate({
 *   operation: 'add',
 *   a: 10,
 *   b: 5
 * });
 * console.log(result); // 15
 * ```
 */
export class CalculatorUseCase {
  /**
   * Ejecuta una operación aritmética.
   * 
   * @param input - Parámetros validados de la operación
   * @returns Resultado numérico de la operación
   * @throws {McpError} Para operaciones inválidas o división por cero
   */
  calculate(input: CalculatorInput): number {
    // Implementation
  }
}
```

### 4. **Documentación de Tool Definitions**

```typescript
/**
 * Crea el resolver de herramientas para operaciones de calculadora.
 * 
 * Este resolver expone una herramienta MCP que permite realizar cálculos
 * aritméticos básicos a través del protocolo Model Context Protocol.
 * 
 * @returns Definición de herramienta MCP configurada
 * 
 * @example
 * Uso desde Claude:
 * ```
 * Puedes usar la calculadora así:
 * - Sumar: calculator({operation: "add", a: 5, b: 3})
 * - Restar: calculator({operation: "subtract", a: 10, b: 4})
 * - Multiplicar: calculator({operation: "multiply", a: 6, b: 7})
 * - Dividir: calculator({operation: "divide", a: 15, b: 3})
 * ```
 */
export function createCalculatorResolver(): ToolDefinition {
  return {
    name: "calculator",
    description: "Realiza operaciones aritméticas básicas (suma, resta, multiplicación, división)",
    inputSchema: zodToJsonSchema(calculatorSchema),
    handler: async (request) => {
      // Implementation
    }
  };
}
```

## 📄 Documentación de Archivos

### 1. **README.md Principal**

```markdown
# 🧮 Calculator MCP Server

> Servidor MCP para operaciones aritméticas básicas con validación robusta

## 🚀 Características

- ✅ Operaciones básicas: suma, resta, multiplicación, división
- ✅ Validación Zod con tipos seguros
- ✅ Manejo robusto de errores
- ✅ Arquitectura modular por capas
- ✅ Testing completo (Unit + Integration + E2E)

## 📦 Instalación

```bash
# Instalar dependencias
npm install

# Ejecutar en modo desarrollo
npm run dev

# Ejecutar tests
npm test

# Build para producción
npm run build
```

## 🔧 Configuración

### Claude Desktop
```json
{
  "mcpServers": {
    "calculator": {
      "command": "node",
      "args": ["dist/index.js"]
    }
  }
}
```

## 📖 Uso

### Desde Claude
```
¿Puedes calcular 15 + 27?
¿Cuánto es 144 dividido entre 12?
```

### Programáticamente
```typescript
import { createCalculatorResolver } from './resolver/calculator.resolver.js';

const resolver = createCalculatorResolver();
const result = await resolver.handler({
  params: {
    arguments: { operation: 'add', a: 10, b: 5 }
  }
});
```

## 🏗️ Arquitectura

```
src/
├── resolver/           # Tool definitions + validación
│   ├── calculator.resolver.ts
│   └── index.ts
├── usecase/           # Lógica de negocio
│   └── calculator.usecase.ts
└── index.ts           # Servidor MCP principal
```

## 🧪 Testing

- **Unit Tests**: Lógica de use cases
- **Integration Tests**: Resolvers + validación
- **E2E Tests**: Flujo completo con mcpgod

Coverage objetivo: >90% functions, >85% branches

## 📋 API Reference

### Calculator Tool

**Name**: `calculator`
**Description**: Realiza operaciones aritméticas básicas

**Parameters**:
- `operation` (string): `'add' | 'subtract' | 'multiply' | 'divide'`
- `a` (number): Primer operando
- `b` (number): Segundo operando

**Returns**: Resultado numérico de la operación

**Errors**:
- `InvalidParams`: Parámetros inválidos o división por cero
- `InternalError`: Error interno del servidor
```

### 2. **ARCHITECTURE.md**

```markdown
# 🏗️ Arquitectura del Servidor MCP

## 📐 Principios de Diseño

### Separación por Capas
- **Resolver Layer**: Validación + Tool Definition + Error Handling
- **Use Case Layer**: Lógica de negocio pura + Reglas de dominio
- **Infrastructure**: Configuración MCP + Servidor

### Flujo de Datos
```
Claude Request → Resolver → Use Case → Business Logic → Response
     ↓              ↓           ↓              ↓            ↓
  MCP Tool    Validation  Domain Logic   Computation   MCP Response
```

## 🔄 Patrones Implementados

### 1. **Dependency Injection**
```typescript
// Use cases son inyectados en resolvers
export function createCalculatorResolver(
  useCase: CalculatorUseCase = new CalculatorUseCase()
): ToolDefinition {
  // Implementation
}
```

### 2. **Error Boundary**
```typescript
// Cada capa maneja sus propios errores
try {
  const result = useCase.calculate(input);
  return formatResponse(result);
} catch (error) {
  return handleError(error);
}
```

### 3. **Schema-Driven Development**
```typescript
// Schema define la interfaz
export const calculatorSchema = z.object({...});
export type CalculatorInput = z.infer<typeof calculatorSchema>;

// Type safety en toda la aplicación
export class CalculatorUseCase {
  calculate(input: CalculatorInput): number { ... }
}
```

## 🧪 Testing Strategy

### Test Pyramid
```
       /\
      /  \ E2E Tests (mcpgod)
     /____\
    /      \ Integration Tests (resolver)
   /________\
  /          \ Unit Tests (use case)
 /____________\
```

### Cobertura por Capa
- **Use Case**: >95% - Lógica crítica
- **Resolver**: >90% - Integración + validación
- **E2E**: >80% - Flujos principales
```

## 📊 Checklist de Documentación

### ✅ JSDoc
- [ ] Todas las funciones públicas documentadas
- [ ] Parámetros y returns descritos
- [ ] Ejemplos de uso incluidos
- [ ] Errores posibles documentados
- [ ] Types complejos explicados

### ✅ README.md
- [ ] Descripción clara del propósito
- [ ] Instrucciones de instalación
- [ ] Ejemplos de configuración
- [ ] Guía de uso básico
- [ ] Información de arquitectura
- [ ] API reference completa

### ✅ ARCHITECTURE.md
- [ ] Patrones de diseño explicados
- [ ] Flujo de datos documentado
- [ ] Decisiones arquitecturales justificadas
- [ ] Diagramas de estructura
- [ ] Estrategia de testing

### ✅ Comentarios en Código
- [ ] Lógica compleja explicada
- [ ] Decisiones no obvias justificadas
- [ ] TODOs y FIXMEs documentados
- [ ] Referencias externas incluidas
- [ ] Assumptions claramente declaradas

## 🎨 Estilo de Documentación

### Formato JSDoc
```typescript
/**
 * Descripción breve de una línea.
 * 
 * Descripción detallada opcional con contexto adicional
 * y casos de uso específicos.
 * 
 * @param paramName - Descripción del parámetro
 * @returns Descripción del valor de retorno
 * @throws {ErrorType} Descripción de cuándo se lanza
 * 
 * @example
 * ```typescript
 * const result = functionName(param);
 * console.log(result); // Expected output
 * ```
 * 
 * @since 1.0.0
 * @see {@link RelatedFunction} for similar functionality
 */
```

### Markdown Guidelines
- **Headers**: Usar emojis para mejor navegación
- **Code blocks**: Especificar lenguaje siempre
- **Links**: Preferir enlaces relativos para archivos internos
- **Lists**: Usar checkboxes para checklists
- **Emphasis**: **Bold** para conceptos importantes, *italic* para énfasis

---

> **💡 Principio Clave**: La documentación debe ser tan **mantenible** como el código. Si cambias el código, actualiza la documentación en el mismo commit. 