import { z } from 'zod';
import { McpError, ErrorCode } from "@modelcontextprotocol/sdk/types.js";
import { ZodError } from "zod";
import { GreetingUseCase } from "../usecase/greeting.usecase.js";

// Schema de validación
export const GreetingInputSchema = z.object({
  nombre: z.string().min(1, "El nombre no puede estar vacío").max(100, "El nombre es demasiado largo"),
  formal: z.preprocess((val) => {
    // Convertir string "true"/"false" a boolean para compatibilidad con mcpgod
    if (typeof val === "string") {
      return val.toLowerCase() === "true";
    }
    return val;
  }, z.boolean().optional().default(false))
});

// Tipo de entrada
export type GreetingInput = z.output<typeof GreetingInputSchema>;

// Definición de la herramienta (cerca de la validación para mejor cohesión)
export const GREETING_TOOL_DEFINITION = {
  name: "saludo",
  description: "Genera un saludo personalizado y contextual en español. Útil para iniciar conversaciones de manera cordial y apropiada según el contexto.",
  inputSchema: {
    type: "object" as const,
    properties: {
      nombre: {
        type: "string" as const,
        description: "El nombre de la persona a saludar. Puede incluir nombres, apellidos o títulos.",
        minLength: 1,
        maxLength: 100,
        examples: ["Ana", "Sr. García", "Dra. Martínez"]
      },
      formal: {
        type: "boolean" as const,
        description: "Determina el nivel de formalidad del saludo. True para contextos profesionales o formales, false para contextos casuales o informales.",
        default: false
      }
    },
    required: ["nombre"],
    additionalProperties: false
  }
};

// Resolver específico para Greeting
export class GreetingResolver {
  private useCase: GreetingUseCase;

  constructor() {
    this.useCase = new GreetingUseCase();
  }

  /**
   * Obtiene la definición de la herramienta
   */
  getToolDefinition() {
    return GREETING_TOOL_DEFINITION;
  }

  /**
   * Valida la entrada sin ejecutar
   */
  validateInput(args: any): GreetingInput {
    return GreetingInputSchema.parse(args);
  }

  /**
   * Resuelve y ejecuta la herramienta con validación
   */
  async resolveAndExecute(args: any) {
    try {
      // Validar entrada con Zod
      const validatedInput = this.validateInput(args);
      
      // Ejecutar caso de uso
      return this.useCase.execute(validatedInput);
      
    } catch (error) {
      if (error instanceof ZodError) {
        // Formatear errores de validación de Zod
        const formattedErrors = error.errors.map(err => 
          `${err.path.join('.')}: ${err.message}`
        ).join('; ');
        
        throw new McpError(
          ErrorCode.InvalidParams,
          `Errores de validación en herramienta 'saludo': ${formattedErrors}`
        );
      }

      if (error instanceof McpError) {
        throw error;
      }

      // Error genérico
      throw new McpError(
        ErrorCode.InternalError,
        `Error interno en herramienta 'saludo': ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }
} 