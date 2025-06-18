// Funciones de herramientas MCP exportables para testing

export function manejarSaludo(args: any) {
  const { nombre, formal = false } = args;
  
  if (!nombre || typeof nombre !== 'string') {
    throw new Error("El nombre es requerido y debe ser una cadena");
  }

  const saludo = formal 
    ? `Buenos días, Sr./Sra. ${nombre}. Es un placer saludarle.`
    : `¡Hola ${nombre}! ¿Cómo estás?`;

  return {
    content: [
      {
        type: "text",
        text: saludo
      }
    ]
  };
}

export function manejarCalcular(args: any) {
  const { operacion, a, b } = args;
  
  if (typeof a !== 'number' || typeof b !== 'number') {
    throw new Error("Los números deben ser valores numéricos");
  }

  let resultado: number;
  let simbolo: string;

  switch (operacion) {
    case "suma":
      resultado = a + b;
      simbolo = "+";
      break;
    case "resta":
      resultado = a - b;
      simbolo = "-";
      break;
    case "multiplicacion":
      resultado = a * b;
      simbolo = "×";
      break;
    case "division":
      if (b === 0) {
        throw new Error("No se puede dividir por cero");
      }
      resultado = a / b;
      simbolo = "÷";
      break;
    default:
      throw new Error("Operación no válida");
  }

  return {
    content: [
      {
        type: "text",
        text: `${a} ${simbolo} ${b} = ${resultado}`
      }
    ]
  };
}

export function manejarFechaActual(args: any) {
  const { formato = "largo" } = args;
  const ahora = new Date();
  
  let fechaFormateada: string;

  switch (formato) {
    case "corto":
      fechaFormateada = ahora.toLocaleDateString('es-ES');
      break;
    case "hora":
      fechaFormateada = ahora.toLocaleTimeString('es-ES');
      break;
    case "largo":
    default:
      fechaFormateada = ahora.toLocaleDateString('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      break;
  }

  return {
    content: [
      {
        type: "text",
        text: `La fecha actual es: ${fechaFormateada}`
      }
    ]
  };
}

export function getToolsDefinition() {
  return [
    {
      name: "saludo",
      description: "Genera un saludo personalizado en español",
      inputSchema: {
        type: "object",
        properties: {
          nombre: {
            type: "string",
            description: "El nombre de la persona a saludar"
          },
          formal: {
            type: "boolean",
            description: "Si el saludo debe ser formal o informal",
            default: false
          }
        },
        required: ["nombre"]
      }
    },
    {
      name: "calcular",
      description: "Realiza operaciones matemáticas básicas",
      inputSchema: {
        type: "object",
        properties: {
          operacion: {
            type: "string",
            enum: ["suma", "resta", "multiplicacion", "division"],
            description: "Tipo de operación a realizar"
          },
          a: {
            type: "number",
            description: "Primer número"
          },
          b: {
            type: "number",
            description: "Segundo número"
          }
        },
        required: ["operacion", "a", "b"]
      }
    },
    {
      name: "fecha_actual",
      description: "Obtiene la fecha y hora actual en español",
      inputSchema: {
        type: "object",
        properties: {
          formato: {
            type: "string",
            enum: ["corto", "largo", "hora"],
            description: "Formato de la fecha",
            default: "largo"
          }
        }
      }
    }
  ];
} 