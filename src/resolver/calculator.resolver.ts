import { z } from 'zod';
import { McpError, ErrorCode } from "@modelcontextprotocol/sdk/types.js";
import { ZodError } from "zod";
import { CalculatorUseCase } from "../usecase/calculator.usecase.js";

// Schema de validación
export const CalculatorInputSchema = z.object({
  operacion: z.enum(["suma", "resta", "multiplicacion", "division"], {
    errorMap: () => ({ message: "La operación debe ser una de: suma, resta, multiplicacion, division" })
  }),
  a: z.number().finite("El primer número debe ser un número válido"),
  b: z.number().finite("El segundo número debe ser un número válido")
}).refine((data) => {
  if (data.operacion === "division" && data.b === 0) {
    return false;
  }
  return true;
}, {
  message: "No se puede dividir por cero",
  path: ["b"]
});

// Tipo de entrada
export type CalculatorInput = z.output<typeof CalculatorInputSchema>;

// Definición de la herramienta (cerca de la validación para mejor cohesión)
export const CALCULATOR_TOOL_DEFINITION = {
  name: "calcular",
  description: "Realiza operaciones matemáticas básicas con alta precisión. Soporta suma, resta, multiplicación y división con manejo seguro de errores.",
  inputSchema: {
    type: "object" as const,
    properties: {
      operacion: {
        type: "string" as const,
        enum: ["suma", "resta", "multiplicacion", "division"],
        description: "Tipo de operación matemática a realizar. Cada operación está optimizada para precisión numérica.",
        examples: ["suma", "resta", "multiplicacion", "division"]
      },
      a: {
        type: "number" as const,
        description: "Primer operando numérico. Soporta enteros, decimales y notación científica.",
        examples: [10, 3.14, -5, 1.5e2]
      },
      b: {
        type: "number" as const,
        description: "Segundo operando numérico. Para división, no puede ser cero.",
        examples: [5, 2.5, -3, 0.1]
      }
    },
    required: ["operacion", "a", "b"],
    additionalProperties: false
  }
};

// Resolver específico para Calculator
export class CalculatorResolver {
  private useCase: CalculatorUseCase;

  constructor() {
    this.useCase = new CalculatorUseCase();
  }

  /**
   * Obtiene la definición de la herramienta
   */
  getToolDefinition() {
    return CALCULATOR_TOOL_DEFINITION;
  }

  /**
   * Valida la entrada sin ejecutar
   */
  validateInput(args: any): CalculatorInput {
    return CalculatorInputSchema.parse(args);
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
          `Errores de validación en herramienta 'calcular': ${formattedErrors}`
        );
      }

      if (error instanceof McpError) {
        throw error;
      }

      // Error genérico
      throw new McpError(
        ErrorCode.InternalError,
        `Error interno en herramienta 'calcular': ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }
} 