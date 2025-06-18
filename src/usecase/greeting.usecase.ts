// Tipo de entrada para el caso de uso (con defaults aplicados por Zod en el resolver)
export interface GreetingInput {
  nombre: string;
  formal: boolean;
}

// Lógica del caso de uso
export class GreetingUseCase {
  execute(input: GreetingInput) {
    const { nombre, formal } = input;
    
    // Lógica mejorada con más contexto
    const tiempoActual = new Date().getHours();
    let saludoTiempo = "";
    
    if (tiempoActual < 12) {
      saludoTiempo = formal ? "Buenos días" : "¡Buenos días";
    } else if (tiempoActual < 18) {
      saludoTiempo = formal ? "Buenas tardes" : "¡Buenas tardes";
    } else {
      saludoTiempo = formal ? "Buenas noches" : "¡Buenas noches";
    }

    const saludo = formal 
      ? `${saludoTiempo}, ${nombre}. Es un placer saludarle. Espero que tenga un excelente día.`
      : `${saludoTiempo} ${nombre}! ¿Cómo estás? ¡Espero que tengas un día genial!`;

    return {
      content: [
        {
          type: "text" as const,
          text: saludo
        }
      ]
    };
  }
} 