/* === 🧠 BRAIN FUNCTIONS 5.0 - HYBRID SKYNET ENGINE === */

// --- 0. CONFIGURAÇÃO SKYNET ---
const API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

// --- TYPES ---
export interface UserData { serviceType?: string; dateTime?: string; name?: string; pickup?: string; destination?: string; details?: string; return?: string; [key: string]: any; }

interface Action { label: string; url: string; isUnlockAction?: boolean; isP3Redirect?: boolean; payload?: string; }

// Adicionei 'audioUrl' para suportar o áudio gerado pela IA
export interface BotMessage { sender?: 'bot' | 'user'; hasAudio?: boolean; audioUrl?: string; text: string; action?: Action; isUnlockAction?: boolean; }

export interface BrainResponse { botMessages: (string | BotMessage)[]; nextStep: number; newData?: UserData; finished?: boolean; suggestions?: string[]; error?: boolean; }

// --- 🧠 NÚCLEO DE INTELIGÊNCIA ARTIFICIAL (O CÉREBRO) ---
export async function consultarSkyNet(contextoFase: string, mensagemUsuario: string, personaTipo: 'analista1' | 'analista2' | 'analista3' | 'padrao' | 'copiloto'): Promise<{ texto: string; audioUrl: string; botoes: string[] }> {
    
    // DEFINIÇÃO DE PERSONALIDADES (MODO ELITE)
    const personas = {
        analista1: "Você é o Mentor Master do Sistema Taxi Pro. Seu tom é calmo, extremamente paciente, didático e motivador. Você acredita no potencial do aluno. Ensine o passo a passo com clareza absoluta, explicando não só o que fazer, mas por que isso é importante para o lucro dele. Evite termos militares secos.",
        analista2: "Você é o Analista Especialista em Automação e IA (WhatsAuto). Você domina a configuração técnica. Seja preciso, técnico e exija atenção aos detalhes.",
        analista3: "Você é o Analista Growth Hacker de Escala. Seu foco é tráfego e resultados. Você é agressivo nos objetivos e focado em lucro e métricas.",
        padrao: "Você é o Analista de Implementação do Sistema Táxi Pro. Autoridade técnica suprema.",
        copiloto: "Você é o Copiloto 6.0."
    };

    // --- 🚨 COPILOTO 6.0 SPECIALIZED LOGIC REMOVED (LOCAL ONLY) ---


    const personaContent = personas[personaTipo] || personas.padrao;

    try {
        // 1. Gera o Texto Inteligente
        const responseTexto = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${API_KEY}` },
            body: JSON.stringify({
                model: "gpt-4o-mini",
                messages: [
                    { 
                        role: "system", 
                        content: `ATUE COMO: ${personaContent}
                        CONTEXTO ATUAL DO OPERADOR: ${contextoFase}.
                        
                        MISSÃO: O Operador está em fase de implementação técnica. Sua função é garantir a ativação da infraestrutura sem erros.
                        1. Responda dúvidas técnicas de forma curta e autoritária.
                        2. Foque em solução, não em teoria.
                        3. Ordene a conclusão da fase atual.
                        4. Seja direto e profissional.
                        
                        INSTRUÇÃO ESPECIAL: Se o usuário estiver iniciando o Pilar 1 (detectado pelo gatilho Iniciar Pilar 1), comece sua resposta obrigatoriamente com uma frase curta de impacto sobre persistência ou conhecimento de um grande líder (Ex: Jobs, Einstein, Napoleon Hill).

                        RETORNO OBRIGATÓRIO (JSON PURO):
                        {
                            "resposta": "Texto da resposta...",
                            "botoes": ["Botão 1", "Botão 2"]
                        }` 
                    },
                    { role: "user", content: mensagemUsuario }
                ],
                temperature: 0.7
            })
        });
        
        const dataTexto = await responseTexto.json();
        const conteudo = JSON.parse(dataTexto.choices[0].message.content);

        return { texto: conteudo.resposta, audioUrl: "", botoes: conteudo.botoes };

    } catch (error) {
        console.error("Erro na SkyNet:", error);
     return { 
            texto: "Interferência no sinal. Repita o comando, Operador.", 
            audioUrl: "",
            botoes: ["Tentar Novamente"] 
        };}
}

// --- 🤖 COPILOTO 6.0 (LÓGICA ORIGINAL) ---
// Mantive síncrono pois é simulação rápida, mas pode virar async se quiser IA aqui também
export const getCopilotResponse = (currentStep: number, text: string, userData: UserData): BrainResponse => {
  const lowerText = text.toLowerCase();
  let nextStep = currentStep;
  let botMessages: (string | BotMessage)[] = [];
  let suggestions: string[] = [];
  let newData = { ...userData };
  let finished = false;

  if (currentStep === 0) { 
    botMessages = [
      { sender: 'bot', text: "Olá! Sou o **Copiloto Virtual**." },
      { sender: 'bot', text: "O motorista está no volante agora, então eu vou agilizar seu atendimento." },
      { sender: 'bot', text: "Você precisa do carro pra **AGORA** ou quer **AGENDAR** um horário?" }
    ];
    suggestions = [];
    nextStep = 1;
    return { botMessages, nextStep, newData, finished, suggestions };
  }

  switch (currentStep) {
    case 1:
      if (lowerText.includes('agendar') || lowerText.includes('marcar')) {
        newData.serviceType = 'Agendado';
        botMessages = ["Perfeito. **Para qual DIA e HORÁRIO você precisa do carro?**"];
        suggestions = [];
        nextStep = 2;
      } else {
        newData.serviceType = 'Agora';
        newData.dateTime = 'IMEDIATO';
        botMessages = ["Beleza! Pra eu montar sua ficha, qual é o seu **Nome Completo**?"];
        nextStep = 3;
      }
      break;
    case 2:
      newData.dateTime = text;
      botMessages = ["Beleza! Pra eu montar sua ficha, qual é o seu **Nome Completo**?"];
      suggestions = [];
      nextStep = 3;
      break;
    case 3:
      newData.name = text;
      botMessages = [
        "Obrigado!",
        "**Onde o motorista deve te buscar?**"
      ];
      suggestions = [];
      nextStep = 4;
      break;
    case 4:
      newData.pickup = text;
      botMessages = ["Certinho. E qual é o seu **Destino**?"];
      suggestions = [];
      nextStep = 5;
      break;
    case 5:
      newData.destination = text;
      botMessages = ["Anotado. **Quantas pessoas vão e tem alguma mala ou pet?**"];
      suggestions = [];
      nextStep = 6;
      break;
    case 6:
      newData.details = text;
      botMessages = ["Deseja já **agendar o seu retorno** pra garantir o carro na volta?"];
      suggestions = [];
      nextStep = 7;
      break;
    case 7:
      newData.return = text;
      botMessages = [
        "**TUDO REGISTRADO!**",
        "Já mandei os detalhes pro motorista aqui.",
        `**RESUMO DA VIAGEM:**\n**Passageiro:** ${newData.name}\n**Serviço:** ${newData.serviceType}\n**Data/Hora:** ${newData.dateTime}\n**Busca:** ${newData.pickup}\n**Destino:** ${newData.destination}\n**Obs:** ${newData.details}`,
        "**SERVIÇOS EXECUTIVOS:**\nTambém realizamos **Turismo, City Tour e Viagens Interestaduais**.\nPara estes serviços, o motorista enviará um orçamento detalhado em instantes.",
        "**O motorista vai confirmar tudo com você em instantes. Fica atento aí no celular!**"
      ];
      suggestions = ["Reiniciar"];
      nextStep = 8;
      break;
    case 8:
      botMessages = ["O atendimento foi finalizado. Se precisar corrigir, clique no botão de reiniciar lá em cima!"];
      finished = true;
      suggestions = ["Reiniciar"];
      break;
  }
  return { botMessages, nextStep, newData, finished, suggestions };
};

export const getInstrutorResponse = async (instrutorStep: number, _text: string): Promise<BrainResponse> => {
    return { botMessages: [], nextStep: instrutorStep, finished: true };
};

// --- 🎨 ANALISTA DE INTERFACE (ANTIGO WEB DESIGNER) ---
export const getWebDesignerResponse = async (webDesignerStep: number, _text: string): Promise<BrainResponse> => {
    return { botMessages: [], nextStep: webDesignerStep, finished: true };
};

// --- 🕵️ CHEFE DE OPERAÇÕES ---
export const getChefeResponse = async (_chefeStep: number, _text: string): Promise<BrainResponse> => {
    return { botMessages: [], nextStep: 1, error: false, suggestions: [] };
};
