# 🔀 Git Conventions - Convenciones Git y Commits

> **Reglas para un historial de Git limpio, informativo y mantenible**

## 🎯 Objetivo

Mantener un historial de commits **claro, rastreable y útil** que facilite el trabajo en equipo, el debugging y el mantenimiento del código.

## 📋 Reglas Obligatorias

### 1. **Formato de Commits (Conventional Commits)**

```bash
# Formato base
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]

# Ejemplos correctos ✅
feat(calculator): add division operation support
fix(validation): handle edge case for zero division
docs(readme): update installation instructions
test(resolver): add integration tests for error handling
refactor(usecase): extract common validation logic
perf(cache): implement LRU cache for calculations
chore(deps): update dependencies to latest versions

# Ejemplos incorrectos ❌
Fixed bug
Update code
New feature
WIP
```

### 2. **Types de Commits Permitidos**

```bash
# 🆕 NUEVAS CARACTERÍSTICAS
feat:     Nueva funcionalidad para el usuario
feat!:    Breaking change en nueva funcionalidad

# 🐛 FIXES
fix:      Arreglo de bug
fix!:     Breaking change en fix

# 📚 DOCUMENTACIÓN
docs:     Solo cambios en documentación

# 🎨 REFACTORING
refactor: Cambio de código que no agrega features ni arregla bugs
style:    Cambios de formato (espacios, comas, etc.)

# 🧪 TESTING
test:     Agregar tests o corregir tests existentes

# ⚡ PERFORMANCE
perf:     Cambio de código que mejora performance

# 🔧 CHORES
chore:    Cambios en build process, dependencias, etc.
ci:       Cambios en CI/CD configuration
build:    Cambios en build system o dependencias externas

# 🔄 REVERTS
revert:   Revert de commit anterior
```

### 3. **Scopes por Módulo**

```bash
# Scopes basados en arquitectura del proyecto
feat(resolver):    Cambios en capa de resolvers
feat(usecase):     Cambios en capa de use cases
feat(validation):  Cambios en validación Zod
feat(types):       Cambios en tipos TypeScript
feat(config):      Cambios en configuración
feat(server):      Cambios en servidor MCP principal

# Scopes por funcionalidad
feat(calculator):  Funcionalidad de calculadora
feat(datetime):    Funcionalidad de fecha/hora
feat(greeting):    Funcionalidad de saludo
feat(security):    Aspectos de seguridad
feat(performance): Optimizaciones de rendimiento

# Scopes por tooling
chore(deps):       Dependencias
chore(build):      Sistema de build
chore(ci):         CI/CD
chore(lint):       Linting y formatting
```

### 4. **Mensajes Descriptivos**

```bash
# ✅ CORRECTO - Específico y accionable
feat(calculator): add support for complex number operations

The calculator now supports addition, subtraction, multiplication,
and division of complex numbers in the format "a+bi".

Resolves: #123
Breaking change: Calculator input schema now accepts complex strings

# ✅ CORRECTO - Fix con contexto
fix(validation): prevent division by zero in calculator

Added validation to throw McpError with InvalidParams when
denominator is zero, preventing runtime crashes.

Fixes: #456

# ✅ CORRECTO - Refactor con justificación
refactor(usecase): extract common error handling pattern

Extracted BaseUseCase class with shared error handling methods
to reduce code duplication across all use cases.

- Reduces bundle size by ~2KB
- Improves consistency in error messages
- Makes adding new use cases easier

# ❌ INCORRECTO - Muy vago
fix: bug fixes
update: changed some stuff
feat: new things added
```

### 5. **Branching Strategy**

```bash
# Estructura de branches
main                    # Producción - solo merges
├── develop            # Desarrollo principal
├── feature/calc-v2    # Nueva funcionalidad
├── fix/division-zero  # Bug fixes
├── hotfix/security    # Fixes críticos para producción
└── release/v1.2.0     # Preparación de release

# Naming conventions
feature/[scope]-[description]     # feature/calculator-complex-numbers
fix/[scope]-[issue]              # fix/validation-zero-division
hotfix/[critical-issue]          # hotfix/security-vulnerability
release/v[version]               # release/v1.2.0
chore/[task]                     # chore/update-dependencies

# Workflow
1. Branch desde develop
2. Desarrollo en feature branch
3. PR hacia develop
4. Merge después de review + tests
5. Release branch desde develop
6. Hotfixes directos a main + backport
```

## 🔧 Herramientas y Automatización

### 1. **Commitizen Setup**

```json
// package.json
{
  "scripts": {
    "commit": "cz",
    "commit:retry": "cz --retry"
  },
  "devDependencies": {
    "commitizen": "^4.3.0",
    "cz-conventional-changelog": "^3.3.0",
    "@commitlint/cli": "^17.0.0",
    "@commitlint/config-conventional": "^17.0.0"
  },
  "config": {
    "commitizen": {
      "path": "./node_modules/cz-conventional-changelog"
    }
  }
}
```

### 2. **Commit Linting**

```javascript
// commitlint.config.js
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2, 'always',
      [
        'feat', 'fix', 'docs', 'style', 'refactor',
        'test', 'perf', 'build', 'ci', 'chore', 'revert'
      ]
    ],
    'scope-enum': [
      2, 'always',
      [
        'resolver', 'usecase', 'validation', 'types',
        'calculator', 'datetime', 'greeting', 'security',
        'performance', 'config', 'server', 'deps', 'ci'
      ]
    ],
    'subject-max-length': [2, 'always', 72],
    'body-max-line-length': [2, 'always', 100]
  }
};
```

### 3. **Git Hooks**

```bash
#!/bin/sh
# .husky/commit-msg
. "$(dirname "$0")/_/husky.sh"

npx --no-install commitlint --edit "$1"

#!/bin/sh
# .husky/pre-commit
. "$(dirname "$0")/_/husky.sh"

# Run linting and formatting
npm run lint
npm run format

# Run tests
npm test

# Check for large files
find . -size +5M -not -path "./node_modules/*" -not -path "./.git/*" | head -10
```

### 4. **Release Automation**

```json
// package.json scripts
{
  "scripts": {
    "version:patch": "npm version patch && git push && git push --tags",
    "version:minor": "npm version minor && git push && git push --tags",
    "version:major": "npm version major && git push && git push --tags",
    "changelog": "conventional-changelog -p angular -i CHANGELOG.md -s",
    "release": "npm run build && npm run test && npm run changelog"
  }
}
```

## 📝 Templates

### 1. **PR Template**

```markdown
<!-- .github/pull_request_template.md -->
## 📋 Descripción

Describe los cambios realizados en este PR.

## 🔄 Tipo de cambio

- [ ] 🐛 Bug fix (cambio que arregla un issue)
- [ ] ✨ Nueva funcionalidad (cambio que agrega funcionalidad)
- [ ] 💥 Breaking change (fix o feature que causa cambios incompatibles)
- [ ] 📚 Documentación (solo cambios en docs)
- [ ] 🎨 Refactoring (cambio que no es fix ni feature)
- [ ] ⚡ Performance (cambio que mejora rendimiento)
- [ ] 🧪 Tests (agregar o corregir tests)

## 🧪 Testing

- [ ] Tests unitarios agregados/actualizados
- [ ] Tests de integración agregados/actualizados
- [ ] Tests E2E agregados/actualizados
- [ ] Tests manuales realizados

## 📊 Métricas

- [ ] Performance validado (si aplica)
- [ ] Bundle size validado (si aplica)
- [ ] Memory usage validado (si aplica)

## 📚 Documentación

- [ ] README actualizado (si aplica)
- [ ] JSDoc actualizado (si aplica)
- [ ] ARCHITECTURE.md actualizado (si aplica)

## ✅ Checklist

- [ ] Código sigue las convenciones del proyecto
- [ ] Tests pasan localmente
- [ ] Linting pasa sin errores
- [ ] Commits siguen conventional commits
- [ ] PR está enfocado en un solo cambio

## 🔗 Referencias

Fixes #(issue number)
Closes #(issue number)
Related to #(issue number)
```

### 2. **Issue Template**

```markdown
<!-- .github/ISSUE_TEMPLATE/bug_report.md -->
---
name: 🐛 Bug Report
about: Reportar un bug o problema
title: '[BUG] '
labels: bug
assignees: ''
---

## 🐛 Descripción del Bug

Descripción clara del problema.

## 🔄 Reproducir

1. Ejecutar '...'
2. Usar parámetros '...'
3. Ver error

## ✅ Comportamiento Esperado

Describe qué debería pasar.

## 📸 Screenshots

Si aplica, agrega screenshots.

## 🔍 Información Adicional

- OS: [e.g. macOS 12.0]
- Node Version: [e.g. 18.17.0]
- Package Version: [e.g. 1.2.0]

## 📋 Contexto Adicional

Cualquier otra información relevante.
```

## 📊 Checklist de Git Conventions

### ✅ Setup
- [ ] Commitizen configurado
- [ ] Commitlint configurado con reglas custom
- [ ] Git hooks configurados (pre-commit, commit-msg)
- [ ] Branch protection rules en GitHub/GitLab

### ✅ Commits
- [ ] Todos los commits siguen conventional commits
- [ ] Scopes apropiados para el proyecto
- [ ] Mensajes descriptivos y accionables
- [ ] Body explica el "por qué", no el "qué"
- [ ] Referencias a issues cuando aplica

### ✅ Branches
- [ ] Naming convention consistente
- [ ] Branch strategy definida y documentada
- [ ] PRs requeridos para merge a main/develop
- [ ] Code review obligatorio

### ✅ Releases
- [ ] Versionado semántico (semver)
- [ ] CHANGELOG.md generado automáticamente
- [ ] Tags de git para releases
- [ ] Release notes detalladas

### ✅ Documentación
- [ ] PR templates configurados
- [ ] Issue templates para bugs/features
- [ ] Contributing guidelines
- [ ] Git workflow documentado en README

---

> **💡 Principio Clave**: Un buen historial de Git es como una **biografía del código** - debe contar la historia de por qué cada cambio fue necesario, no solo qué cambió. 