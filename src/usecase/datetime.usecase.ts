// Tipo de entrada para el caso de uso (importado desde el resolver)
export interface DateTimeInput {
  formato: "corto" | "largo" | "hora" | "completo" | "iso";
  zona_horaria: string;
}

// Lógica del caso de uso
export class DateTimeUseCase {
  execute(input: DateTimeInput) {
    const { formato, zona_horaria } = input;
    
    try {
      const ahora = new Date();
      let fechaFormateada: string;
      
      // Configuración de opciones de formato
      const opcionesLocale = {
        timeZone: zona_horaria,
        locale: 'es-ES'
      };

      switch (formato) {
        case "corto":
          fechaFormateada = ahora.toLocaleDateString('es-ES', {
            timeZone: zona_horaria
          });
          break;
        case "hora":
          fechaFormateada = ahora.toLocaleTimeString('es-ES', {
            timeZone: zona_horaria,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
          });
          break;
        case "completo":
          fechaFormateada = ahora.toLocaleString('es-ES', {
            timeZone: zona_horaria,
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
          });
          break;
        case "iso":
          fechaFormateada = ahora.toISOString();
          break;
        case "largo":
        default:
          fechaFormateada = ahora.toLocaleDateString('es-ES', {
            timeZone: zona_horaria,
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          });
          break;
      }

      const zonaInfo = zona_horaria !== "Europe/Madrid" 
        ? ` (Zona horaria: ${zona_horaria})`
        : "";

      return {
        content: [
          {
            type: "text" as const,
            text: `La fecha actual es: ${fechaFormateada}${zonaInfo}`
          }
        ]
      };
    } catch (error) {
      throw new Error(`Error al formatear la fecha: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
} 