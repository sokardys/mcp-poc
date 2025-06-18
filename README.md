# MCP POC - Model Context Protocol Server

Un servidor MCP (Model Context Protocol) mínimo desarrollado en Node.js/TypeScript que es compatible con Claude Desktop.

## ¿Qué es MCP?

El **Model Context Protocol (MCP)** es un protocolo abierto desarrollado por Anthropic que permite a los modelos de IA interactuar de forma segura con herramientas y fuentes de datos externas. Piensa en MCP como el "USB-C" de las integraciones de IA: un estándar único que conecta muchos servicios.

### Componentes de MCP:

- **Servidores MCP**: Actúan como puentes hacia APIs, bases de datos o código
- **Clientes MCP**: Utilizan el protocolo para interactuar con los servidores  
- **Hosts MCP**: Sistemas que gestionan la comunicación (como Claude Desktop)

## Características

Este servidor MCP incluye tres herramientas de ejemplo:

1. **saludo** - Genera saludos personalizados en español (formal/informal)
2. **calcular** - Realiza operaciones matemáticas básicas (suma, resta, multiplicación, división)
3. **fecha_actual** - Obtiene la fecha y hora actual en diferentes formatos

## Instalación

### 1. Clonar e instalar dependencias

```bash
git clone <tu-repositorio>
cd mcp-poc
npm install
```

### 2. Compilar el proyecto

```bash
npm run build
```

### 3. Configurar Claude Desktop

Edita el archivo de configuración de Claude Desktop:

- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

Añade la configuración del servidor:

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

**Importante**: Cambia `/ruta/completa/a/tu/proyecto/mcp-poc/` por la ruta real donde clonaste el proyecto.

### 4. Reiniciar Claude Desktop

Cierra y vuelve a abrir Claude Desktop para cargar la nueva configuración.

## Uso

Una vez configurado, puedes usar las herramientas en Claude Desktop:

### Ejemplos de uso:

- **Saludo**: "Saluda a María de forma formal"
- **Cálculo**: "Calcula 15 × 8" 
- **Fecha**: "¿Qué hora es?"

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
✅ **Herramienta saludo** - Formatos formal e informal
✅ **Calculadora** - Suma, resta, multiplicación, división
✅ **Manejo de errores** - División por cero, parámetros faltantes
✅ **Fecha y hora** - Diferentes formatos de fecha
✅ **Validación de entrada** - Parámetros incorrectos

### Pruebas manuales con mcpgod

```bash
# Listar herramientas disponibles
npx mcpgod tools build/index.js

# Probar herramientas específicas
npx mcpgod tool build/index.js saludo nombre="Ana" formal=true
npx mcpgod tool build/index.js calcular operacion="suma" a=15 b=25
npx mcpgod tool build/index.js fecha_actual formato="largo"
```

## Desarrollo

### Estructura del proyecto

```
mcp-poc/
├── src/
│   └── index.ts                    # Servidor MCP principal
├── tests/                          # Tests automatizados
│   ├── server.test.ts              # Tests directos del servidor
│   └── mcpgod.test.ts             # Tests usando mcpgod
├── build/                          # Código compilado
├── vitest.config.ts               # Configuración de tests
├── package.json
├── tsconfig.json
└── README.md
```

### Añadir nuevas herramientas

Para añadir una nueva herramienta:

1. Añade la definición en `ListToolsRequestSchema`
2. Añade el caso en `CallToolRequestSchema` 
3. Implementa la función manejadora
4. **Añade tests** para la nueva herramienta
5. Recompila con `npm run build`

### Workflow de desarrollo

```bash
# 1. Desarrollo en paralelo
npm run dev           # Terminal 1: Recompilación automática
npm run test:watch    # Terminal 2: Tests automáticos

# 2. Verificar antes de commit
npm test              # Ejecutar todos los tests
npm run build         # Compilar para producción
```

## Depuración

### Problemas comunes:

1. **Herramientas no aparecen**: Verifica la ruta en el archivo de configuración
2. **Claude no conecta**: Reinicia Claude Desktop después de cambiar la configuración
3. **Errores de ejecución**: Revisa los logs en la consola de Claude Desktop
4. **Tests fallan**: Asegúrate de que el proyecto esté compilado (`npm run build`)

### Logs y debugging

```bash
# Ejecutar servidor con logs de depuración
NODE_ENV=development npm start

# Inspeccionar comunicación MCP (si funciona)
npm run inspector

# Prueba manual rápida
echo '{"jsonrpc": "2.0", "id": 1, "method": "tools/list"}' | node build/index.js
```

## Distribución como paquete

Para distribuir como paquete npm:

1. Actualiza los campos en `package.json` (nombre, autor, etc.)
2. Ejecuta los tests: `npm test`
3. Publica en npm: `npm publish`
4. Instala globalmente: `npm install -g tu-paquete-mcp`

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