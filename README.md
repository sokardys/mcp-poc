# MCP POC - Model Context Protocol Server

Un servidor MCP (Model Context Protocol) desarrollado en Node.js/TypeScript con arquitectura modular que es compatible con Claude Desktop.

## ¿Qué es MCP?

El **Model Context Protocol (MCP)** es un protocolo abierto desarrollado por Anthropic que permite a los modelos de IA interactuar de forma segura con herramientas y fuentes de datos externas. Piensa en MCP como el "USB-C" de las integraciones de IA: un estándar único que conecta muchos servicios.

### Componentes de MCP:

- **Servidores MCP**: Actúan como puentes hacia APIs, bases de datos o código
- **Clientes MCP**: Utilizan el protocolo para interactuar con los servidores  
- **Hosts MCP**: Sistemas que gestionan la comunicación (como Claude Desktop)

## Características

Este servidor MCP incluye tres herramientas de ejemplo:

1. **greeting** - Genera saludos personalizados en español (formal/informal)
2. **calculator** - Realiza operaciones matemáticas básicas (suma, resta, multiplicación, división)
3. **get_current_datetime** - Obtiene la fecha y hora actual en diferentes formatos

## Instalación

### 🚀 Opción 1: Desde NPM (Recomendado)

```bash
# Instalar globalmente
npm install -g @sokardys/mcp-poc

# O usar npx (sin instalación)
npx sokardys-mcp-poc
```

### 💻 Opción 2: Desarrollo local

```bash
git clone <tu-repositorio>
cd mcp-poc
npm install
npm run build
```

### 3. Configurar Claude Desktop

Edita el archivo de configuración de Claude Desktop:

- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

Añade la configuración del servidor:

#### Para instalación NPM:
```json
{
  "mcpServers": {
    "mcp-poc": {
      "command": "npx",
      "args": ["@sokardys/mcp-poc@latest"],
      "env": {
      }
    }
  }
} 
```

#### Para desarrollo local:
```json
{
  "mcpServers": {
    "mcp-poc": {
      "command": "node",
      "args": [
        "/ruta/completa/a/tu/proyecto/mcp-poc/build/index.js"
      ]
    }
  }
}
```

**Importante**: Para desarrollo local, cambia `/ruta/completa/a/tu/proyecto/mcp-poc/` por la ruta real donde clonaste el proyecto.

### 4. Reiniciar Claude Desktop

Cierra y vuelve a abrir Claude Desktop para cargar la nueva configuración.

## Uso

Una vez configurado, puedes usar las herramientas en Claude Desktop:

### Ejemplos de uso:

- **Saludo**: "Saluda a María de forma formal" → Usa `greeting`
- **Cálculo**: "Calcula 15 × 8" → Usa `calculator` 
- **Fecha**: "¿Qué hora es?" → Usa `get_current_datetime`

### Herramientas disponibles:

| Herramienta | Descripción | Parámetros |
|-------------|-------------|------------|
| `greeting` | Saludos personalizados | `name` (string), `formal` (boolean) |
| `calculator` | Operaciones matemáticas | `operation` (add/subtract/multiply/divide), `a` (number), `b` (number) |
| `get_current_datetime` | Fecha y hora actual | `format` (short/long/iso) |

## Scripts disponibles

```bash
# Compilar el proyecto
npm run build

# Modo desarrollo (recompilación automática)
npm run dev

# Ejecutar directamente (después de compilar)
npm start

# Inspeccionar el servidor MCP
npm run inspector

# Testing
npm test                # Ejecutar todos los tests
npm run test:watch      # Tests en modo watch
npm run test:ui         # Interfaz visual de tests
npm run test:coverage   # Tests con cobertura de código
```

## Testing

Este proyecto incluye un suite completo de tests usando **Vitest** y **mcpgod**:

### Ejecutar tests

```bash
# Tests básicos
npm test

# Tests en modo watch (reejecutar al cambiar código)
npm run test:watch

# Interfaz visual para tests
npm run test:ui

# Tests con reporte de cobertura
npm run test:coverage
```

### Qué se testea

Los tests validan:

✅ **Lista de herramientas** - Verifica que todas las herramientas están disponibles
✅ **Herramienta greeting** - Formatos formal e informal, nombres personalizados
✅ **Calculadora** - Suma, resta, multiplicación, división con validación Zod
✅ **Manejo de errores** - División por cero, parámetros faltantes, McpError apropiados
✅ **Fecha y hora** - Diferentes formatos (corto, largo, ISO), zonas horarias
✅ **Validación de entrada** - Schemas Zod, tipos incorrectos, parámetros requeridos
✅ **Arquitectura modular** - Separación resolver/usecase, orquestador central

### Pruebas manuales con mcpgod

```bash
# Listar herramientas disponibles
npx mcpgod tools build/index.js

# Probar herramientas específicas
npx mcpgod tool build/index.js greeting name="Ana" formal=true
npx mcpgod tool build/index.js calculator operation="add" a=15 b=25
npx mcpgod tool build/index.js get_current_datetime format="long"
```



## Recursos adicionales

- [Documentación oficial de MCP](https://modelcontextprotocol.io)
- [Servidor de referencia de Anthropic](https://github.com/modelcontextprotocol/servers)
- [SDK de TypeScript](https://www.npmjs.com/package/@modelcontextprotocol/sdk)
- [Vitest - Framework de testing](https://vitest.dev)
- [mcpgod - CLI para MCP](https://github.com/mcpgod/cli)

## Licencia

MIT - consulta el archivo LICENSE para más detalles.

---

**¡Disfruta construyendo herramientas increíbles con MCP! 🚀** 