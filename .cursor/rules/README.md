# 🚀 MCP Server Development Rules

> **Reglas generalizables para desarrollo de servidores MCP con TypeScript, arquitectura modular y testing completo**

## 📋 Estructura de Reglas

### Reglas Fundamentales
- [**00-project-initialization**](./00-project-initialization.md) - Inicialización y configuración base
- [**01-architecture-patterns**](./01-architecture-patterns.md) - Patrones arquitecturales obligatorios
- [**02-code-organization**](./02-code-organization.md) - Organización de código y estructura de archivos

### Reglas de Desarrollo
- [**10-validation-and-types**](./10-validation-and-types.md) - Validación Zod y tipos TypeScript
- [**11-error-handling**](./11-error-handling.md) - Manejo robusto de errores MCP
- [**12-testing-strategy**](./12-testing-strategy.md) - Estrategia de testing por capas

### Reglas de Calidad
- [**20-documentation**](./20-documentation.md) - Documentación y JSDoc
- [**21-security**](./21-security.md) - Seguridad y validación de entrada
- [**22-performance**](./22-performance.md) - Optimización y rendimiento

### Reglas de Workflow
- [**30-development-workflow**](./30-development-workflow.md) - Flujo de desarrollo y herramientas
- [**31-git-conventions**](./31-git-conventions.md) - Convenciones Git y commits
- [**32-deployment**](./32-deployment.md) - Despliegue y distribución

## 🎯 Objetivo

Crear servidores MCP **robustos, escalables y mantenibles** siguiendo una arquitectura modular con:

✅ **Separación por capas**: Resolver → UseCase → Tool Definition  
✅ **Validación completa**: Zod schemas con tipos seguros  
✅ **Testing exhaustivo**: Unit + Integration + E2E  
✅ **Documentación clara**: JSDoc + README + Architecture  
✅ **Flujo ágil**: Scripts automatizados + CI/CD ready  

## 🚦 Quick Start

```bash
# 1. Inicializar proyecto
npm init -y
npm install @modelcontextprotocol/sdk zod
npm install -D typescript vitest @types/node

# 2. Crear estructura base
mkdir -p src/{resolver,usecase} tests/{resolver,usecase}

# 3. Configurar archivos base
# (Ver 00-project-initialization.md)

# 4. Desarrollar siguiendo el patrón:
# - Crear use case (lógica de negocio)
# - Crear resolver (validación + tool definition)
# - Crear tests por capas
# - Integrar en orquestador central
```

## 📊 Métricas de Calidad

### ✅ Cobertura de Tests
- **Unit Tests**: >90% functions, >85% branches
- **Integration Tests**: Todos los resolvers
- **E2E Tests**: Flujo completo con mcpgod

### ✅ Arquitectura
- **Separación de responsabilidades**: Resolver ≠ UseCase ≠ Tool
- **Validación Zod**: Todos los inputs validados
- **Error handling**: McpError apropiados

### ✅ Mantenibilidad
- **Estructura espejo**: `src/` ↔ `tests/`
- **Documentación**: JSDoc en funciones públicas
- **Consistencia**: Patrones repetibles

## 🔄 Aplicación Automática

Cursor aplicará estas reglas automáticamente cuando:

- 🔍 **Detecte MCP**: Presencia de `@modelcontextprotocol/sdk`
- 📝 **Edites código**: Archivos TypeScript en `src/`
- 🧪 **Escribas tests**: Archivos en `tests/`
- 📚 **Documentes**: README.md o JSDoc

## 🏆 Checklist de Proyecto Completo

### 🏗️ Arquitectura
- [ ] Estructura `src/{resolver,usecase}` + `tests/{resolver,usecase}`
- [ ] Orquestador central en `src/resolver/index.ts`
- [ ] Use cases con lógica de negocio pura
- [ ] Resolvers con validación + tool definition

### 🧪 Testing
- [ ] Tests unitarios por use case
- [ ] Tests de validación por resolver
- [ ] Tests E2E de integración completa
- [ ] Coverage >85% en todas las capas

### ⚙️ Configuración
- [ ] TypeScript configurado correctamente
- [ ] Vitest con coverage de `src/` únicamente
- [ ] Scripts de build, test, dev funcionando
- [ ] mcpgod configurado para E2E testing

### 📚 Documentación
- [ ] README.md con arquitectura y uso
- [ ] JSDoc en funciones públicas
- [ ] ARCHITECTURE.md explicando patrones
- [ ] Ejemplos de configuración

### 🔒 Seguridad
- [ ] Validación Zod de todas las entradas
- [ ] Manejo de errores con McpError
- [ ] Sanitización de strings de usuario
- [ ] Tests de casos edge y seguridad

---

> **💡 Tip**: Estas reglas están diseñadas para ser **reutilizables** en cualquier proyecto MCP. Copia la carpeta `.cursor/rules/` a tu nuevo proyecto y tendrás toda la configuración lista. 