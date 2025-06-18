import { McpError, ErrorCode } from "@modelcontextprotocol/sdk/types.js";

// Importar resolvers específicos
import { GreetingResolver } from "./greeting.resolver.js";
import { CalculatorResolver } from "./calculator.resolver.js";
import { DateTimeResolver } from "./datetime.resolver.js";

// Instancias de resolvers específicos
const greetingResolver = new GreetingResolver();
const calculatorResolver = new CalculatorResolver();
const dateTimeResolver = new DateTimeResolver();

export class ToolResolver {
  /**
   * Obtiene las definiciones de todas las herramientas disponibles
   */
  static getToolDefinitions() {
    return [
      greetingResolver.getToolDefinition(),
      calculatorResolver.getToolDefinition(),
      dateTimeResolver.getToolDefinition()
    ];
  }

  /**
   * Resuelve y ejecuta una herramienta con validación
   */
  static async resolveAndExecute(toolName: string, args: any) {
    try {
      switch (toolName) {
        case "saludo":
          return await greetingResolver.resolveAndExecute(args);
        
        case "calcular":
          return await calculatorResolver.resolveAndExecute(args);
        
        case "fecha_actual":
          return await dateTimeResolver.resolveAndExecute(args);
        
        default:
          throw new McpError(
            ErrorCode.MethodNotFound,
            `Herramienta desconocida: ${toolName}. Herramientas disponibles: saludo, calcular, fecha_actual`
          );
      }
    } catch (error) {
      if (error instanceof McpError) {
        throw error;
      }

      // Error genérico
      throw new McpError(
        ErrorCode.InternalError,
        `Error interno en herramienta '${toolName}': ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Valida una entrada sin ejecutar
   */
  static validateInput(toolName: string, args: any) {
    switch (toolName) {
      case "saludo":
        return greetingResolver.validateInput(args);
      case "calcular":
        return calculatorResolver.validateInput(args);
      case "fecha_actual":
        return dateTimeResolver.validateInput(args);
      default:
        throw new Error(`Herramienta desconocida: ${toolName}`);
    }
  }

  /**
   * Obtiene información sobre una herramienta específica
   */
  static getToolInfo(toolName: string) {
    switch (toolName) {
      case "saludo":
        return greetingResolver.getToolDefinition();
      case "calcular":
        return calculatorResolver.getToolDefinition();
      case "fecha_actual":
        return dateTimeResolver.getToolDefinition();
      default:
        return null;
    }
  }
} 