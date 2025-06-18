import { z } from 'zod';
import { McpError, ErrorCode } from "@modelcontextprotocol/sdk/types.js";
import { ZodError } from "zod";
import { DateTimeUseCase } from "../usecase/datetime.usecase.js";

// Schema de validación
export const DateTimeInputSchema = z.object({
  formato: z.enum(["corto", "largo", "hora", "completo", "iso"], {
    errorMap: () => ({ message: "El formato debe ser uno de: corto, largo, hora, completo, iso" })
  }).optional().default("largo"),
  zona_horaria: z.string().optional().default("Europe/Madrid")
});

// Tipo de entrada
export type DateTimeInput = z.output<typeof DateTimeInputSchema>;

// Definición de la herramienta (cerca de la validación para mejor cohesión)
export const DATETIME_TOOL_DEFINITION = {
  name: "fecha_actual",
  description: "Obtiene la fecha y hora actual en diferentes formatos y zonas horarias. Ideal para referencias temporales precisas en documentos y comunicaciones.",
  inputSchema: {
    type: "object" as const,
    properties: {
      formato: {
        type: "string" as const,
        enum: ["corto", "largo", "hora", "completo", "iso"],
        description: "Formato de presentación de la fecha y hora. 'corto' para fecha simple, 'largo' para fecha completa con día de la semana, 'hora' solo para la hora, 'completo' para fecha y hora, 'iso' para formato ISO estándar.",
        default: "largo",
        examples: ["largo", "corto", "hora", "completo", "iso"]
      },
      zona_horaria: {
        type: "string" as const,
        description: "Zona horaria en formato IANA. Por defecto utiliza la zona horaria de España.",
        default: "Europe/Madrid",
        examples: ["Europe/Madrid", "America/New_York", "Asia/Tokyo", "UTC"]
      }
    },
    additionalProperties: false
  }
};

// Resolver específico para DateTime
export class DateTimeResolver {
  private useCase: DateTimeUseCase;

  constructor() {
    this.useCase = new DateTimeUseCase();
  }

  /**
   * Obtiene la definición de la herramienta
   */
  getToolDefinition() {
    return DATETIME_TOOL_DEFINITION;
  }

  /**
   * Valida la entrada sin ejecutar
   */
  validateInput(args: any): DateTimeInput {
    return DateTimeInputSchema.parse(args);
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
          `Errores de validación en herramienta 'fecha_actual': ${formattedErrors}`
        );
      }

      if (error instanceof McpError) {
        throw error;
      }

      // Error genérico
      throw new McpError(
        ErrorCode.InternalError,
        `Error interno en herramienta 'fecha_actual': ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }
} 