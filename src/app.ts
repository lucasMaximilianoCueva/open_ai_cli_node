import readline from 'readline';
import OpenAI from 'openai';
import startConversation from './conversationController';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function askQuestion(rl: readline.Interface, question: string): Promise<string> {
  return new Promise(resolve => {
    rl.question(question, answer => {
      resolve(answer);
    });
  });
}

async function main() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  const numeroTelefono = await askQuestion(rl, "Por favor, ingresa tu número de teléfono: ");
  rl.close();

  try {
    await startConversation(openai, numeroTelefono);
    console.log("Conversación finalizada.");
  } catch (err) {
    console.error("Error al iniciar la conversación:", err);
  }
}

main();
