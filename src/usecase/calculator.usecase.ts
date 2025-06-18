// Tipo de entrada para el caso de uso (importado desde el resolver)
export interface CalculatorInput {
  operacion: "suma" | "resta" | "multiplicacion" | "division";
  a: number;
  b: number;
}

// Lógica del caso de uso
export class CalculatorUseCase {
  execute(input: CalculatorInput) {
    const { operacion, a, b } = input;
    
    let resultado: number;
    let simbolo: string;
    let descripcion: string;

    switch (operacion) {
      case "suma":
        resultado = a + b;
        simbolo = "+";
        descripcion = "Suma";
        break;
      case "resta":
        resultado = a - b;
        simbolo = "-";
        descripcion = "Resta";
        break;
      case "multiplicacion":
        resultado = a * b;
        simbolo = "×";
        descripcion = "Multiplicación";
        break;
      case "division":
        resultado = a / b;
        simbolo = "÷";
        descripcion = "División";
        break;
      default:
        throw new Error("Operación no válida");
    }

    // Formatear resultado con precisión apropiada
    const resultadoFormateado = Number.isInteger(resultado) 
      ? resultado.toString() 
      : resultado.toFixed(6).replace(/\.?0+$/, '');

    return {
      content: [
        {
          type: "text" as const,
          text: `${descripcion}: ${a} ${simbolo} ${b} = ${resultadoFormateado}`
        }
      ]
    };
  }
} 