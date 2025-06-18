# 🚀 Deployment - Despliegue y Distribución

> **Reglas para despliegue confiable y distribución eficiente de servidores MCP**

## 🎯 Objetivo

Garantizar un proceso de despliegue **automatizado, confiable y reproducible** que facilite la distribución y el mantenimiento en producción.

## 📋 Reglas Obligatorias

### 1. **Build Optimizado**

```json
// package.json - Scripts de build (CONSISTENTE CON 00-project-initialization.md)
{
  "scripts": {
    "prebuild": "rm -rf build/",
    "build": "tsc && node -e \"require('fs').chmodSync('build/index.js', '755')\"",
    "build:prod": "npm run build && npm run minify",
    "clean": "rm -rf build/",
    "minify": "terser build/**/*.js -o build/bundle.min.js",
    "validate": "npm run lint && npm run test && npm run build"
  },
  "main": "build/index.js"
}
```

### 2. **Configuración de Entorno**

```typescript
// src/config/environment.ts
export interface EnvironmentConfig {
  nodeEnv: 'development' | 'production' | 'test';
  logLevel: 'debug' | 'info' | 'warn' | 'error';
  enableCache: boolean;
  cacheSize: number;
  rateLimitRequests: number;
  rateLimitWindow: number;
}

export const config: EnvironmentConfig = {
  nodeEnv: (process.env.NODE_ENV as any) || 'development',
  logLevel: (process.env.LOG_LEVEL as any) || 'info',
  enableCache: process.env.ENABLE_CACHE === 'true',
  cacheSize: parseInt(process.env.CACHE_SIZE || '1000'),
  rateLimitRequests: parseInt(process.env.RATE_LIMIT_REQUESTS || '100'),
  rateLimitWindow: parseInt(process.env.RATE_LIMIT_WINDOW || '60000'),
};
```

### 3. **NPM Distribution**

```json
// package.json - Configuración consistente con 00-project-initialization.md
{
  "name": "@your-org/mcp-server-name",
  "version": "1.0.0",
  "main": "build/index.js",
  "bin": {
    "your-mcp-server": "build/index.js"
  },
  "files": [
    "build/**/*",
    "README.md",
    "LICENSE"
  ],
  "engines": {
    "node": ">=18.0.0"
  }
}
```

### 4. **Claude Desktop Configuration Template**

```json
// config/claude_desktop_config.json (CONSISTENTE CON 02-code-organization.md)
{
  "mcpServers": {
    "your-server-name": {
      "command": "npx",
      "args": ["@your-org/mcp-server-name"],
      "env": {
        "LOG_LEVEL": "info",
        "ENABLE_CACHE": "true"
      }
    }
  }
}
```

## 📊 Checklist de Deployment

### ✅ Build Consistency  
- [ ] Build output en `build/` (consistente con tsconfig.json)
- [ ] Scripts de build usando rutas correctas
- [ ] Main entry point en `build/index.js`
- [ ] Executable permissions configurados

### ✅ Distribution
- [ ] Package.json con rutas build/ correctas
- [ ] Files array incluye solo build/
- [ ] Bin ejecutable apunta a build/index.js
- [ ] Claude desktop config usa snake_case: `claude_desktop_config.json`

---

> **🚀 Principio Clave**: Consistencia entre archivos de configuración es crítica para deployment exitoso. 