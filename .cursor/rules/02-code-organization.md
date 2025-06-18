# 02 - Code Organization

> **Organización de código y estructura de archivos para proyectos MCP escalables**

## 📁 Estructura de Archivos Obligatoria

```
project-root/
├── src/
│   ├── index.ts                    # 🚀 Servidor MCP (solo configuración)
│   ├── resolver/
│   │   ├── index.ts               # 🎯 Orquestador central
│   │   ├── [feature].resolver.ts  # 🔧 Validación + Tool Definition
│   │   └── shared/                # 🔄 Utilidades compartidas
│   │       ├── schemas.ts         # Esquemas Zod reutilizables
│   │       └── validators.ts      # Validadores comunes
│   ├── usecase/
│   │   ├── [feature].usecase.ts   # 🧠 Lógica de negocio pura
│   │   └── shared/                # 🔄 Utilidades de negocio
│   │       ├── formatters.ts      # Formateadores de salida
│   │       └── calculators.ts     # Algoritmos compartidos
│   └── types/
│       ├── index.ts               # 📝 Tipos principales exportados
│       ├── common.ts              # Tipos comunes del dominio
│       └── mcp.ts                 # Extensiones de tipos MCP
├── tests/
│   ├── e2e.test.ts                # 🔗 Tests End-to-End
│   ├── resolver/
│   │   ├── index.test.ts          # Tests del orquestador
│   │   └── [feature].resolver.test.ts
│   ├── usecase/
│   │   └── [feature].usecase.test.ts
│   └── fixtures/                  # 📦 Datos de test reutilizables
│       ├── inputs.ts              # Inputs de test comunes
│       └── outputs.ts             # Outputs esperados
├── docs/                          # 📚 Documentación técnica
│   ├── ARCHITECTURE.md            
│   ├── API.md                     
│   └── DEVELOPMENT.md             
├── config/                        # ⚙️ Configuraciones
│   └── claude_desktop_config.json # Configuración Claude Desktop
├── vitest.config.ts               # Configuración de tests
└── scripts/                       # 🛠️ Scripts de automatización
    ├── build.sh                   
    ├── test-all.sh                
    └── deploy.sh                  
```

## 📝 Convenciones de Naming

### Archivos y Directorios
```bash
# Archivos TypeScript - camelCase
src/usecase/dateTimeFormatter.usecase.ts
src/resolver/calculatorAdvanced.resolver.ts

# Tests - mismo nombre + .test.ts
tests/usecase/dateTimeFormatter.usecase.test.ts
tests/resolver/calculatorAdvanced.resolver.test.ts

# Directorios - kebab-case
src/shared/error-handlers/
tests/integration-helpers/
docs/api-documentation/

# Configuración - snake_case para consistencia
config/claude_desktop_config.json
config/vitest_coverage.config.ts
```

### Clases y Interfaces
```typescript
// Clases - PascalCase + sufijo descriptivo
export class DateTimeFormatterUseCase { }
export class CalculatorResolver { }
export class ValidationHelper { }

// Interfaces - PascalCase + prefijo I (opcional)
export interface CalculatorInput { }
export interface IDateTimeFormatter { }
export interface ToolConfiguration { }

// Types - PascalCase + sufijo Type
export type ValidationResultType = { };
export type McpResponseType = { };
```

### Variables y Funciones
```typescript
// Variables - camelCase descriptivo
const userInputData = validateInput(rawInput);
const formattedResult = formatter.process(data);
const toolDefinitions = resolver.getDefinitions();

// Funciones - verbo + sustantivo camelCase
function validateUserInput(input: any): ValidationResult { }
function formatCalculationResult(result: number): string { }
function registerToolResolver(name: string, resolver: any): void { }

// Constantes - UPPER_SNAKE_CASE
const MAX_CALCULATION_PRECISION = 10;
const DEFAULT_TIMEZONE = 'UTC';
const ERROR_MESSAGES = {
  INVALID_INPUT: 'Input validation failed',
  DIVISION_BY_ZERO: 'Cannot divide by zero'
};
```

### Registro Automático
```typescript
// src/index.ts
import { registerFeatures } from './shared/registry.js';

// Auto-importar todas las features
const features = [
  () => import('./calculator/calculator.resolver.js'),
  () => import('./datetime/datetime.resolver.js'),
  // Agregar nuevas features aquí
];

await registerFeatures(features);
```

## 📦 Módulos y Exports

### Barrel Exports Pattern
```typescript
// src/usecase/index.ts
export { CalculatorUseCase } from './calculator.usecase.js';
export { DateTimeUseCase } from './datetime.usecase.js';
export { GreetingUseCase } from './greeting.usecase.js';

// src/resolver/index.ts  
export { ToolResolver } from './tool.resolver.js';
export { CalculatorResolver } from './calculator.resolver.js';
export { DateTimeResolver } from './datetime.resolver.js';

// src/types/index.ts
export type * from './common.js';
export type * from './mcp.js';
export type { CalculatorInput } from '../calculator/calculator.types.js';
```

### Import Organization
```typescript
// 1. Node modules primero
import { z } from 'zod';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';

// 2. Tipos e interfaces
import type { Tool, CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import type { CalculatorInput } from '../types/calculator.js';

// 3. Imports relativos - ordenados por distancia
import { CalculatorUseCase } from '../usecase/calculator.usecase.js';
import { ValidationHelper } from './shared/validators.js';
import { ERROR_MESSAGES } from './constants.js';
```

## 🗂️ Separación de Responsabilidades

### Resolver (Capa de Presentación)
```typescript
// src/resolver/calculator.resolver.ts
export class CalculatorResolver {
  // ✅ Validación de entrada
  // ✅ Definición de herramienta MCP
  // ✅ Manejo de errores MCP
  // ❌ Lógica de negocio
  // ❌ Formateo complejo de datos
}
```

### UseCase (Capa de Lógica de Negocio)
```typescript
// src/usecase/calculator.usecase.ts
export class CalculatorUseCase {
  // ✅ Algoritmos y cálculos
  // ✅ Reglas de negocio
  // ✅ Formateo de resultados
  // ❌ Validación de entrada
  // ❌ Manejo de MCP errors
}
```

### Shared (Utilidades Compartidas)
```typescript
// src/shared/formatters.ts
export class NumberFormatter {
  // ✅ Formateo de números
  // ✅ Conversiones de unidades
  // ✅ Utilidades puras
  // ❌ Lógica de negocio específica
  // ❌ Validación de MCP
}
```

## 🔄 Patrones de Reutilización

### Composición sobre Herencia
```typescript
// ✅ BIEN: Composición
export class AdvancedCalculatorUseCase {
  constructor(
    private basicCalculator: BasicCalculatorUseCase,
    private formatter: NumberFormatter
  ) {}
}

// ❌ MAL: Herencia compleja
export class AdvancedCalculatorUseCase extends BasicCalculatorUseCase {
  // Jerarquías complejas difíciles de mantener
}
```

### Dependency Injection Simple
```typescript
// src/resolver/calculator.resolver.ts
export class CalculatorResolver {
  constructor(
    private useCase = new CalculatorUseCase(),
    private formatter = new NumberFormatter()
  ) {}
  
  // Permite inyección para testing
  static create(dependencies?: Partial<CalculatorDependencies>) {
    return new CalculatorResolver(
      dependencies?.useCase,
      dependencies?.formatter
    );
  }
}
```

## 📋 File Templates

### UseCase Template
```typescript
// src/usecase/[feature].usecase.ts
import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import type { [Feature]Input } from "../types/[feature].js";

export class [Feature]UseCase {
  execute(input: [Feature]Input): CallToolResult {
    const result = this.processBusinessLogic(input);
    return this.formatResponse(result);
  }

  private processBusinessLogic(input: [Feature]Input): any {
    // Lógica específica del dominio
  }

  private formatResponse(result: any): CallToolResult {
    return {
      content: [{ type: "text", text: this.formatOutput(result) }]
    };
  }

  private formatOutput(result: any): string {
    // Formateo específico del resultado
  }
}
```

### Resolver Template
```typescript
// src/resolver/[feature].resolver.ts
import { z } from 'zod';
import type { Tool, CallToolResult, McpError } from "@modelcontextprotocol/sdk/types.js";
import { [Feature]UseCase } from '../usecase/[feature].usecase.js';

const [Feature]Schema = z.object({
  // Definir schema Zod
});

export class [Feature]Resolver {
  constructor(private useCase = new [Feature]UseCase()) {}

  getToolDefinition(): Tool {
    return {
      name: "[tool_name]",
      description: "Descripción detallada",
      inputSchema: {
        // JSON Schema derivado de Zod
      }
    };
  }

  validateInput(input: any) {
    return [Feature]Schema.parse(input);
  }

  async resolveAndExecute(input: any): Promise<CallToolResult> {
    const validated = this.validateInput(input);
    return this.useCase.execute(validated);
  }
}
```

## ✅ Best Practices

### **Estructura**
- ✅ Un archivo por responsabilidad
- ✅ Máximo 200 líneas por archivo
- ✅ Imports organizados y claros
- ✅ Barrel exports para módulos

### **Naming**
- ✅ Nombres descriptivos y consistentes
- ✅ Verbos para funciones, sustantivos para clases
- ✅ Sufijos clarificadores (.usecase, .resolver, .test)
- ✅ Prefijos para tipos e interfaces

### **Separación**
- ✅ Una responsabilidad por clase
- ✅ Composición sobre herencia
- ✅ Dependency injection simple
- ✅ Shared utilities reutilizables

### **Escalabilidad**
- ✅ Feature-first organization
- ✅ Auto-registro de nuevas features
- ✅ Configuración externa
- ✅ Patrones repetibles

---

> **🎯 Objetivo**: Código organizado, predecible y fácil de navegar para cualquier desarrollador del equipo, independientemente de su experiencia con el proyecto. 