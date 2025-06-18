#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
  CallToolRequest,
} from "@modelcontextprotocol/sdk/types.js";

import { ToolResolver } from "./resolver/index.js";

// Configuración del servidor MCP
const server = new Server({
  name: "mcp-poc",
  version: "0.1.5",
}, {
  capabilities: {
    tools: {},
  },
});

// Lista de herramientas disponibles
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: ToolResolver.getToolDefinitions(),
  };
});

// Manejador de ejecución de herramientas
server.setRequestHandler(CallToolRequestSchema, async (request: CallToolRequest) => {
  const { name, arguments: args } = request.params;

  try {
    return await ToolResolver.resolveAndExecute(name, args);
  } catch (error) {
    if (error instanceof McpError) {
      throw error;
    }
    throw new McpError(
      ErrorCode.InvalidParams,
      `MCP error -32602: ${error instanceof Error ? error.message : String(error)}`
    );
  }
});

// Función principal
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  
  // Mensaje de depuración (solo se ve cuando se ejecuta directamente)
  if (process.env.NODE_ENV === 'development') {
    console.error('Servidor MCP POC iniciado - Versión 0.1.5');
  }
}

// Iniciar el servidor automáticamente
main().catch((error) => {
  console.error("Error fatal:", error);
  process.exit(1);
}); 