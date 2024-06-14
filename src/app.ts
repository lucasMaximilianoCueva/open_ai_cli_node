 
import OpenAI from 'openai'; // Asegúrate de importar OpenAI correctamente
  import startConversation from './conversationController';
  
  // Inicialización de OpenAI (sustituye por tu configuración real)
  const openai = new OpenAI({
    apiKey: 'sk-proj-qIWIV9u9ocq0KTTWKJiWT3BlbkFJutQ59E7uh7ohRQsmJoP9',
  });
  
  // Número telefónico del alumno (ejemplo)
  const numeroTelefonoAlumno = "+549351223344";
  
  // Iniciar conversación
  startConversation(openai, numeroTelefonoAlumno)
    .then(() => console.log("Conversación finalizada."))
    .catch(err => console.error("Error al iniciar la conversación:", err));




//    import OpenAI from 'openai'; // Asegúrate de importar OpenAI correctamente
// import startConversation from './conversationController';

// // Inicialización de OpenAI (sustituye por tu configuración real)
// const openai = new OpenAI({
//   apiKey: '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' // process.env.OPENAI_API_KEY,
// });

// // Iniciar conversación
// startConversation(openai, 'text')
//   .then(() => console.log("Conversación finalizada."))
//   .catch(err => console.error("Error al iniciar la conversación:", err));
  
