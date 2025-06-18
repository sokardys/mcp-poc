# 30 - Development Workflow

> **Flujo de desarrollo optimizado para proyectos MCP**

## 🚀 Flujo de Desarrollo Estándar

### 1. **Feature Development Flow**
```bash
# 1. Crear rama para nueva feature
git checkout -b feature/[feature-name]

# 2. Crear use case (lógica de negocio)
touch src/usecase/[feature].usecase.ts
# - Definir interfaz de entrada
# - Implementar lógica de negocio
# - Formatear salida MCP

# 3. Crear resolver (validación + tool definition)
touch src/resolver/[feature].resolver.ts
# - Definir schema Zod
# - Crear tool definition
# - Conectar con use case

# 4. Registrar en orquestador
# Editar src/resolver/index.ts para incluir nuevo resolver

# 5. Crear tests
touch tests/usecase/[feature].usecase.test.ts
touch tests/resolver/[feature].resolver.test.ts

# 6. Validar implementación
npm run test
npm run build
npm run test:e2e

# 7. Commit y merge
git add .
git commit -m "feat: add [feature] functionality"
git push origin feature/[feature-name]
```

## 🛠️ Scripts de Desarrollo

### package.json Scripts Estándar
```json
{
  "scripts": {
    "dev": "npm run build && node build/index.js",
    "build": "npm run prebuild && tsc && npm run postbuild",
    "prebuild": "rm -rf build/",
    "postbuild": "node -e \"require('fs').chmodSync('build/index.js', '755')\"",
    
    "test": "npm run build && vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage",
    "test:unit": "vitest run tests/usecase/",
    "test:integration": "vitest run tests/resolver/",
    "test:e2e": "vitest run tests/e2e.test.ts",
    
    "lint": "npx tsc --noEmit",
    "format": "prettier --write src/ tests/",
    "clean": "rm -rf build/ coverage/ node_modules/.cache",
    
    "mcpgod": "mcpgod test build/index.js",
    "debug": "npm run build && mcpgod debug build/index.js"
  }
}
```

## 🐛 Debugging con mcpgod

### Configuración básica
```bash
# Instalar mcpgod globalmente
npm install -g @modelcontextprotocol/inspector

# Testing básico
npm run build
mcpgod test build/index.js

# Debug interactivo
mcpgod debug build/index.js
```

### Debug de herramienta específica
```bash
# Listar herramientas disponibles
mcpgod test build/index.js --list-tools

# Testear herramienta específica
mcpgod test build/index.js --tool="tool_name" --args='{"param": "value"}'

# Debug con logs detallados
DEBUG=mcp:* mcpgod debug build/index.js
```

## 🔄 Iteración Rápida

### Desarrollo continuo
```bash
# Terminal 1: Watch mode para tests
npm run test:watch

# Terminal 2: Build automático
npx tsc --watch

# Terminal 3: Testing manual
while true; do
  npm run build && mcpgod test build/index.js
  sleep 2
done
```

### Hot reload setup (opcional)
```bash
# Instalar nodemon
npm install -D nodemon

# Agregar script en package.json
{
  "scripts": {
    "dev:watch": "nodemon --exec 'npm run dev' --watch src --ext ts"
  }
}

# Ejecutar
npm run dev:watch
```

## 📋 Checklist Pre-Commit

```bash
#!/bin/bash
# pre-commit-check.sh

echo "🔍 Running pre-commit checks..."

# 1. TypeScript compilation
echo "📝 Checking TypeScript..."
if ! npx tsc --noEmit; then
  echo "❌ TypeScript errors found"
  exit 1
fi

# 2. Build successful
echo "🏗️ Building project..."
if ! npm run build; then
  echo "❌ Build failed"
  exit 1
fi

# 3. Tests passing
echo "🧪 Running tests..."
if ! npm test; then
  echo "❌ Tests failed"
  exit 1
fi

# 4. Coverage threshold
echo "📊 Checking coverage..."
if ! npm run test:coverage; then
  echo "❌ Coverage below threshold"
  exit 1
fi

# 5. E2E with mcpgod
echo "🔗 Running E2E tests..."
if ! npm run mcpgod; then
  echo "❌ mcpgod tests failed"
  exit 1
fi

echo "✅ All checks passed!"
```

## 🧪 Testing Workflow

### TDD Approach (Recomendado)
```bash
# 1. Crear test que falle
touch tests/usecase/[feature].usecase.test.ts
# Escribir test para funcionalidad deseada

# 2. Ejecutar test (debe fallar)
npm run test:unit

# 3. Implementar mínimo para que pase
touch src/usecase/[feature].usecase.ts
# Implementar lógica mínima

# 4. Refactorizar
# Mejorar implementación manteniendo tests verdes

# 5. Crear resolver test
touch tests/resolver/[feature].resolver.test.ts

# 6. Implementar resolver
touch src/resolver/[feature].resolver.ts

# 7. Integrar y testear E2E
npm run test:e2e
```

### BDD Approach (Alternativo)
```bash
# 1. Definir comportamiento en test E2E
# Describir qué debe hacer la herramienta

# 2. Implementar use case para satisfacer comportamiento
# 3. Implementar resolver para validación
# 4. Crear tests unitarios para casos edge
```

## 🚀 Comandos Frecuentes

### Desarrollo diario
```bash
# Inicio de día
git pull origin master
npm install  # Si hay cambios en package.json
npm run clean && npm run build

# Durante desarrollo
npm run test:watch  # En una terminal
npm run dev         # Probar servidor

# Antes de commit
npm run lint
npm run test
npm run mcpgod

# Fin de día
git add .
git commit -m "descriptive message"
git push origin feature-branch
```

### Troubleshooting
```bash
# Error de build
npm run clean
npm install
npm run build

# Error de tests
npm run test:coverage  # Ver qué no está cubierto
npm run test -- --reporter=verbose  # Tests detallados

# Error de mcpgod
DEBUG=mcp:* npm run mcpgod  # Logs detallados
mcpgod debug build/index.js  # Modo interactivo
```

## 📈 Performance Monitoring

### Build times
```bash
# Medir tiempo de build
time npm run build

# Profile TypeScript compilation
npx tsc --extendedDiagnostics
```

### Test performance
```bash
# Tests con timing
npm run test -- --reporter=verbose

# Coverage con timing
npm run test:coverage -- --reporter=verbose
```

## 🔧 IDE Configuration

### VSCode settings.json
```json
{
  "typescript.preferences.importModuleSpecifier": "relative",
  "editor.codeActionsOnSave": {
    "source.fixAll": true,
    "source.organizeImports": true
  },
  "files.associations": {
    "*.test.ts": "typescript"
  },
  "search.exclude": {
    "**/build": true,
    "**/coverage": true
  }
}
```

### VSCode tasks.json
```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "build-and-test",
      "type": "shell",
      "command": "npm",
      "args": ["run", "build", "&&", "npm", "test"],
      "group": {
        "kind": "build",
        "isDefault": true
      }
    },
    {
      "label": "mcpgod-debug",
      "type": "shell",
      "command": "npm",
      "args": ["run", "build", "&&", "mcpgod", "debug", "build/index.js"],
      "group": "test"
    }
  ]
}
```

## 📋 Git Workflow

### Commit Messages
```bash
# Formato estándar
feat: add [feature] functionality
fix: resolve [bug] in [component]
docs: update [section] documentation
test: add tests for [feature]
refactor: improve [component] structure
chore: update dependencies

# Ejemplos específicos MCP
feat: add calculator resolver with validation
fix: resolve division by zero in calculator use case
test: add edge cases for datetime resolver
docs: update architecture documentation
refactor: separate validation from business logic
```

### Branch Strategy
```bash
# Feature branches
feature/calculator-tool
feature/datetime-formatting
feature/error-handling-improvement

# Bug fixes
fix/division-by-zero
fix/timezone-parsing

# Documentation
docs/architecture-update
docs/api-documentation
```

---

> **🎯 Objetivo**: Desarrollo eficiente y consistente con feedback rápido y calidad garantizada en cada commit. 