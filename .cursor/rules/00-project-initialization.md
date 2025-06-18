# 00 - Project Initialization

> **Configuración base y inicialización para cualquier proyecto MCP**

## 🎯 Objetivo
Establecer la base para un proyecto MCP con TypeScript, arquitectura modular y testing completo.

## 📦 Dependencias Requeridas

### Core Dependencies
```bash
npm install @modelcontextprotocol/sdk zod
```

### Development Dependencies
```bash
npm install -D typescript vitest @vitest/coverage-v8 @types/node
```

## 📁 Estructura de Archivos Obligatoria

```
project-root/
├── src/
│   ├── index.ts                    # Servidor MCP principal
│   ├── resolver/
│   │   ├── index.ts               # Orquestador central
│   │   └── [feature].resolver.ts  # Resolvers específicos
│   └── usecase/
│       └── [feature].usecase.ts   # Casos de uso (lógica de negocio)
├── tests/
│   ├── e2e.test.ts                # Tests End-to-End
│   ├── resolver/
│   │   ├── index.test.ts          # Tests del orquestador
│   │   └── [feature].resolver.test.ts
│   └── usecase/
│       └── [feature].usecase.test.ts
├── package.json
├── tsconfig.json
├── vitest.config.ts
├── README.md
└── ARCHITECTURE.md
```

## ⚙️ Configuración de Archivos

### package.json
```json
{
  "name": "your-mcp-server",
  "version": "1.0.0",
  "type": "module",
  "main": "build/index.js",
  "bin": {
    "your-mcp-server": "build/index.js"
  },
  "scripts": {
    "prebuild": "rm -rf build/",
    "build": "tsc && node -e \"require('fs').chmodSync('build/index.js', '755')\"",
    "dev": "npm run build && node build/index.js",
    "test": "npm run build && vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage",
    "test:e2e": "mcpgod test build/index.js"
  },
  "dependencies": {
    "@modelcontextprotocol/sdk": "^1.0.0",
    "zod": "^3.23.0"
  },
  "devDependencies": {
    "@types/node": "^22.0.0",
    "@vitest/coverage-v8": "^2.1.0",
    "typescript": "^5.6.0",
    "vitest": "^2.1.0"
  }
}
```

### tsconfig.json
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "Node",
    "outDir": "build",
    "rootDir": "src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "allowSyntheticDefaultImports": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "build", "tests"]
}
```

### vitest.config.ts
```typescript
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      include: ['src/**/*'],
      exclude: ['src/**/*.test.ts', 'src/**/*.spec.ts'],
      reporter: ['text', 'json', 'html'],
      thresholds: {
        functions: 90,
        branches: 85,
        lines: 85,
        statements: 85
      }
    }
  }
});
```

## 🚀 Template Base src/index.ts

```typescript
#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { ToolResolver } from "./resolver/index.js";

// Configuración del servidor MCP
const server = new Server(
  {
    name: "your-mcp-server",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Handler para listar herramientas
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: ToolResolver.getToolDefinitions(),
  };
});

// Handler para ejecutar herramientas
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  
  try {
    const result = await ToolResolver.resolveAndExecute(name, args || {});
    return result;
  } catch (error) {
    throw error; // Los McpError se propagan automáticamente
  }
});

// Iniciar servidor
async function runServer() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

runServer().catch((error) => {
  console.error("Error running server:", error);
  process.exit(1);
});
```

## 🏗️ Template Base src/resolver/index.ts

```typescript
import { Tool, McpError, ErrorCode } from "@modelcontextprotocol/sdk/types.js";

export class ToolResolver {
  private static resolvers: Map<string, any> = new Map();

  // Registrar resolver específico
  static registerResolver(name: string, resolver: any) {
    this.resolvers.set(name, resolver);
  }

  // Obtener todas las definiciones de herramientas
  static getToolDefinitions(): Tool[] {
    return Array.from(this.resolvers.values()).map(resolver => 
      resolver.getToolDefinition()
    );
  }

  // Obtener información de herramienta específica
  static getToolInfo(name: string): Tool | null {
    const resolver = this.resolvers.get(name);
    return resolver ? resolver.getToolDefinition() : null;
  }

  // Validar entrada
  static validateInput(toolName: string, input: any): any {
    const resolver = this.resolvers.get(toolName);
    if (!resolver) {
      throw new McpError(
        ErrorCode.MethodNotFound,
        `Herramienta desconocida: ${toolName}. Herramientas disponibles: ${Array.from(this.resolvers.keys()).join(", ")}`
      );
    }
    return resolver.validateInput(input);
  }

  // Resolver y ejecutar herramienta
  static async resolveAndExecute(toolName: string, input: any): Promise<any> {
    const resolver = this.resolvers.get(toolName);
    if (!resolver) {
      throw new McpError(
        ErrorCode.MethodNotFound,
        `Herramienta desconocida: ${toolName}. Herramientas disponibles: ${Array.from(this.resolvers.keys()).join(", ")}`
      );
    }
    return await resolver.resolveAndExecute(input);
  }
}
```

## 📝 Scripts de Inicialización

### init-mcp-project.sh (Opcional)
```bash
#!/bin/bash
# Script para inicializar proyecto MCP desde cero

# Crear estructura de directorios
mkdir -p src/{resolver,usecase} tests/{resolver,usecase}

# Crear archivos base
touch src/index.ts
touch src/resolver/index.ts
touch tests/e2e.test.ts
touch README.md
touch ARCHITECTURE.md

# Instalar dependencias
npm install @modelcontextprotocol/sdk zod
npm install -D typescript vitest @vitest/coverage-v8 @types/node

echo "✅ Proyecto MCP inicializado. Revisa .cursor/rules/ para el desarrollo."
```

## ✅ Validación de Inicialización

**Comandos para verificar que todo está bien configurado:**

```bash
# 1. Build debe funcionar sin errores
npm run build

# 2. Tests básicos deben pasar
npm test

# 3. Estructura de archivos correcta
ls -la src/ tests/

# 4. TypeScript compilation check
npx tsc --noEmit
```

## 🔄 Próximos Pasos

Después de completar la inicialización:

1. **Definir primer use case** (ver `01-architecture-patterns.md`)
2. **Crear resolver correspondiente** (ver `10-validation-and-types.md`)
3. **Implementar tests** (ver `12-testing-strategy.md`)
4. **Documentar la funcionalidad** (ver `20-documentation.md`)

---

> **⚠️ Crítico**: Esta estructura es **obligatoria** para que las demás reglas funcionen correctamente. No modificar sin revisar el impacto en todas las reglas dependientes. 