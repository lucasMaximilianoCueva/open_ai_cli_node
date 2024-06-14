// Importar readline y OpenAI
import readline from 'readline';
import OpenAI from 'openai';
import { ExampleProfiles, StudentProfile, PaymentQuotaStatus } from './objects/example.profiles';
import { ChatCompletionMessageParam } from 'openai/resources/chat/completions';
import { Prompt_Completion } from './objects/example.prompt';

const CRM = new Map<string, StudentProfile>();
ExampleProfiles.forEach(profile => CRM.set(profile.phone, profile));

async function startConversation(openai: OpenAI, numeroTelefono: string) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  const alumno = CRM.get(numeroTelefono);

  if (!alumno) {
    console.log("Lo siento, no se encontró un perfil de alumno asociado a este número telefónico en nuestra base de datos.");
    rl.close();
    return;
  }

  const contextoInicial = Prompt_Completion
    .replace('{student_name}', alumno.name)
    .replace('{student_career}', alumno.career)
    .replace('{student_status}', alumno.status)
    .replace('{current_date}', new Date().toLocaleDateString())
    .replace('{student_payments}', obtenerPlanDePagos(alumno));

  let consultasRealizadas = 0;
  let historialConversacion: { role: string, content: string }[] = [];

  historialConversacion.push({ role: "assistant", content: contextoInicial });

  while (consultasRealizadas < 2) {
    const user_input = await askQuestion(rl, "\n¿Qué consulta tienes hoy? (Deuda / Descuentos / Salir): ");

    let promptMessages: { role: string, content: string }[] = [];

    if (user_input.toUpperCase() === "DEUDA") {
      const deudaPendiente = alumno.payments.some(p => p.status !== PaymentQuotaStatus.COMPLETE && isCuotaVencida(p.due_date));
      if (deudaPendiente) {
        console.log(`Tienes una cuota pendiente que ha vencido y debes regularizar el pago.`);
        promptMessages.push({ role: "assistant", content: "Tienes una cuota pendiente que ha vencido y debes regularizar el pago." });
      } else {
        console.log(`No tienes cuotas pendientes que hayan vencido.`);
        promptMessages.push({ role: "assistant", content: "No tienes cuotas pendientes que hayan vencido." });
      }
      consultasRealizadas++;
    } else if (user_input.toUpperCase() === "DESCUENTOS") {
      const descuentoAplicable = obtenerDescuento(alumno);
      console.log(`Para tu carrera ${alumno.career}, el descuento aplicable para la cuota actual es del ${descuentoAplicable}%.`);
      promptMessages.push({ role: "assistant", content: `Para tu carrera ${alumno.career}, el descuento aplicable para la cuota actual es del ${descuentoAplicable}%.` });
      consultasRealizadas++;
    } else if (user_input.toUpperCase() === "SALIR") {
      break;
    } else {
      console.log("Por favor, ingresa una consulta válida (Deuda / Descuentos / Salir).");
      continue;
    }

    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          ...historialConversacion,
          ...promptMessages.map((message) => ({
            role: message.role,
            content: message.content,
          })),
        ] as ChatCompletionMessageParam[],
      });

      const completion_text = completion.choices[0].message.content || "";

      console.log("\nAsistente: " + completion_text);

      historialConversacion.push({ role: "student", content: user_input });
      historialConversacion.push({ role: "assistant", content: completion_text });

    } catch (error) {
      console.error("Error al generar respuesta del modelo:", error);
    }
  }

  console.log("Gracias por tu consulta. Si necesitas más ayuda, no dudes en volver.");

  rl.close();
}

function isCuotaVencida(fechaVencimiento: string): boolean {
  const fechaVencimientoCuota = new Date(fechaVencimiento);
  const fechaActual = new Date();
  return fechaActual > fechaVencimientoCuota;
}

function obtenerDescuento(alumno: StudentProfile): number {
  return Math.floor(Math.random() * 10) + 1; // Descuento aleatorio entre 1% y 10%
}

function obtenerPlanDePagos(alumno: StudentProfile): string {
    let planPagos = "Plan de Pagos:\n";
  
    alumno.payments.forEach((p, index) => {
      planPagos += `- Cuota ${index + 1}: Monto ${p.amount} USD, Vencimiento: ${p.due_date}, Estado: ${p.status}\n`;
    });
    
    return planPagos;
}

async function askQuestion(rl: readline.Interface, question: string): Promise<string> {
  return new Promise(resolve => {
    rl.question(question, answer => {
      resolve(answer);
    });
  });
}

export default startConversation;
