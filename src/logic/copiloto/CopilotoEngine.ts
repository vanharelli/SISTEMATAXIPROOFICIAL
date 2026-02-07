export const processCopiloto = async (step: number, text: string, userData: any = {}) => {
    let botMessages: any[] = [];
    let nextStep = step;
    let newData = { ...userData };
    let finished = false;
    let suggestions: string[] = [];
    let error = false;

    // --- BRIDGE: START SIMULATION ---
    // If the user clicked "INICIAR SIMULAÇÃO", we force the transition to Step 1 immediately.
    if (text === 'START_SIMULATION') {
        step = 1; 
    }

    // --- RESET LOGIC (USER REQUEST) ---
    // 1. Reset State: Clear all variables
    // 2. Jump to Start: Force Step 1
    // 3. Bypass Intro: Skip Step 0
    if (text === 'RESET' || text === 'REINICIAR SIMULAÇÃO' || text === 'reset') {
        step = 1;
        newData = {
            ...userData,
            copilotoStage: null,
            copilotoPath: null,
            copilotoName: "",
            copilotoPickup: "",
            copilotoDate: "",
            copilotoTime: "",
            copilotoDuration: "",
            copilotoDateTime: "",
            copilotoPeople: "",
            copilotoDestination: "",
            copilotoReturn: false,
            copilotoReturnTime: "",
            copilotoReturnPickup: "",
            copilotoReturnSameDest: "",
            lastQuestion: ""
        };
    }

    // --- STEP 0: INTRO FLOW (RESTORED - ORIGINAL LOGIC) ---
    if (step === 0) {
        // 1. Initial Load
        if (text === '' || text === 'init') {
            botMessages = [{
                sender: 'bot',
                text: "Sistemas Online. Este é o seu <span style=\"color: #3B82F6; font-weight: bold;\">Copiloto 6.0</span>, a ferramenta que você instalou para <span style=\"color: #3B82F6; font-weight: bold;\">profissionalizar seu atendimento</span> e <span style=\"color: #3B82F6; font-weight: bold;\">rodar no automático</span>.",
                action: { label: "CONTINUAR", url: "#", payload: "NEXT_INTRO_1" }
            }];
            return { botMessages, nextStep: 0, newData, finished, suggestions, error };
        }

        // 2. Value Proposition
        if (text === 'NEXT_INTRO_1') {
            botMessages = [{
                sender: 'bot',
                text: "Minha função é simples: eu fico de <span style=\"color: #3B82F6; font-weight: bold;\">plantão no seu WhatsApp</span> enquanto você dirige. Eu <span style=\"color: #3B82F6; font-weight: bold;\">atendo o passageiro</span>, pego as informações mais importantes do destino e localização e já deixo a <span style=\"color: #3B82F6; font-weight: bold;\">corrida fechada</span> pra você, <span style=\"color: #3B82F6; font-weight: bold;\">24 horas por dia</span>.",
                action: { label: "CONTINUAR", url: "#", payload: "NEXT_INTRO_2" }
            }];
            return { botMessages, nextStep: 0, newData, finished, suggestions, error };
        }

        // 3. Efficiency
        if (text === 'NEXT_INTRO_2') {
            botMessages = [{
                sender: 'bot',
                text: "Você <span style=\"color: #3B82F6; font-weight: bold;\">não vai mais precisar tirar a mão do volante</span> ou <span style=\"color: #3B82F6; font-weight: bold;\">arriscar multa</span> para não perder serviço. <span style=\"color: #3B82F6; font-weight: bold;\">O sistema cuida da conversa</span> e <span style=\"color: #3B82F6; font-weight: bold;\">você cuida da viagem</span>. É tecnologia para quem não tem tempo a perder.",
                action: { label: "CONTINUAR", url: "#", payload: "NEXT_INTRO_3" }
            }];
            return { botMessages, nextStep: 0, newData, finished, suggestions, error };
        }

        // 4. Instruction & Bridge
        if (text === 'NEXT_INTRO_3') {
            botMessages = [{
                sender: 'bot',
                text: "Agora vamos <span style=\"color: #3B82F6; font-weight: bold;\">validar a sua máquina</span>. Faça de conta que você é o passageiro agora: aperte o botão abaixo e vamos <span style=\"color: #3B82F6; font-weight: bold;\">iniciar nossa simulação</span>.",
                action: { label: "INICIAR SIMULAÇÃO", url: "#", payload: "START_SIMULATION" }
            }];
            return { botMessages, nextStep: 0, newData, finished, suggestions, error };
        }
    }

    // --- STATE MACHINE FOR SIMULATION ---
    
    // Helper to format text
    const cleanText = text ? text.trim() : '';
    const upperText = cleanText.toUpperCase();

    // STEP 1: START SIMULATION -> ASK PATH
    if (step === 1) {
        // Initialize State
        newData.copilotoStage = 'WAITING_PATH';
        newData.lastQuestion = "Olá! O motorista está ao volante agora e, por segurança, eu vou adiantar seu atendimento.\n\nPara começarmos, você precisa do carro para AGORA, deseja AGENDAR ou gostaria de informações sobre CITYTOUR? 🕒🏙️";
        
        botMessages = [{
            sender: 'bot',
            text: newData.lastQuestion,
            suggestions: ["QUERO AGORA", "AGENDAR", "CITYTOUR"]
        }];
        nextStep = 2; // Move to step 2 to process the answer
        return { botMessages, nextStep, newData, finished, suggestions: ["QUERO AGORA", "AGENDAR", "CITYTOUR"], error };
    }

    // GENERAL STATE MACHINE HANDLER (STEP >= 2)
    if (step >= 2) {
        const stage = userData.copilotoStage || 'WAITING_PATH';
        
        // --- 1. HANDLE INPUT (PROCESS PREVIOUS ANSWER) ---
        
        // STAGE: WAITING_PATH
        if (stage === 'WAITING_PATH') {
            if (upperText.includes('AGORA')) {
                newData.copilotoPath = 'AGORA';
            } else if (upperText.includes('AGENDAR')) {
                newData.copilotoPath = 'AGENDAR';
            } else if (upperText.includes('CITYTOUR') || upperText.includes('CITY TOUR')) {
                newData.copilotoPath = 'CITYTOUR';
            } else {
                // FALLBACK
                return returnFallback(newData.lastQuestion, nextStep, newData);
            }
            
            // TRANSITION TO NAME (ALWAYS)
            newData.copilotoStage = 'WAITING_NAME';
            const question = "Perfeito! Para eu abrir sua ficha aqui no sistema do motorista, qual o seu Nome e Sobrenome? 👤";
            newData.lastQuestion = question;
            
            botMessages = [{ sender: 'bot', text: question }];
            nextStep = step + 1;
            return { botMessages, nextStep, newData, finished, suggestions: [], error };
        }

        // STAGE: WAITING_NAME
        if (stage === 'WAITING_NAME') {
            if (cleanText.length < 2) return returnFallback(newData.lastQuestion, nextStep, newData);
            newData.copilotoName = cleanText;

            // BRANCH BASED ON PATH
            let question = "";
            if (newData.copilotoPath === 'AGORA') {
                newData.copilotoStage = 'WAITING_PICKUP';
                question = "Onde devo te buscar? (Rua e número ou ponto de referência) 📍";
            } else if (newData.copilotoPath === 'AGENDAR') {
                newData.copilotoStage = 'WAITING_DATE';
                question = "Para qual DATA seria o agendamento? (Dia/Mês) 📅";
            } else if (newData.copilotoPath === 'CITYTOUR') {
                newData.copilotoStage = 'WAITING_DURATION';
                question = "Quantas horas de passeio você gostaria de fazer, aproximadamente? ⏱️";
            }
            
            newData.lastQuestion = question;
            botMessages = [{ sender: 'bot', text: question }];
            nextStep = step + 1;
            return { botMessages, nextStep, newData, finished, suggestions: [], error };
        }

        // STAGE: WAITING_PICKUP (AGORA / AGENDAR)
        if (stage === 'WAITING_PICKUP') {
            newData.copilotoPickup = cleanText;
            
            newData.copilotoStage = 'WAITING_DESTINATION';
            const question = "Qual o destino da viagem? 🏁";
            newData.lastQuestion = question;
            
            botMessages = [{ sender: 'bot', text: question }];
            nextStep = step + 1;
            return { botMessages, nextStep, newData, finished, suggestions: [], error };
        }

        // STAGE: WAITING_DATE (AGENDAR)
        if (stage === 'WAITING_DATE') {
            newData.copilotoDate = cleanText;
            
            newData.copilotoStage = 'WAITING_TIME';
            const question = "Qual o HORÁRIO que o motorista deve chegar? 🕒";
            newData.lastQuestion = question;
            
            botMessages = [{ sender: 'bot', text: question }];
            nextStep = step + 1;
            return { botMessages, nextStep, newData, finished, suggestions: [], error };
        }

        // STAGE: WAITING_TIME (AGENDAR)
        if (stage === 'WAITING_TIME') {
            newData.copilotoTime = cleanText;
            
            // Go to Pickup (Same as AGORA flow logic, but explicitly handled here to ensure flow)
            newData.copilotoStage = 'WAITING_PICKUP';
            const question = "Onde devo te buscar? (Rua e número ou ponto de referência) 📍";
            newData.lastQuestion = question;
            
            botMessages = [{ sender: 'bot', text: question }];
            nextStep = step + 1;
            return { botMessages, nextStep, newData, finished, suggestions: [], error };
        }

        // STAGE: WAITING_DURATION (CITYTOUR)
        if (stage === 'WAITING_DURATION') {
            newData.copilotoDuration = cleanText;
            
            newData.copilotoStage = 'WAITING_DATETIME_CITYTOUR';
            const question = "Qual a Data e Horário de preferência para o início? 📅🕒";
            newData.lastQuestion = question;
            
            botMessages = [{ sender: 'bot', text: question }];
            nextStep = step + 1;
            return { botMessages, nextStep, newData, finished, suggestions: [], error };
        }

        // STAGE: WAITING_DATETIME_CITYTOUR (CITYTOUR)
        if (stage === 'WAITING_DATETIME_CITYTOUR') {
            newData.copilotoDateTime = cleanText;
            
            newData.copilotoStage = 'WAITING_PEOPLE_CITYTOUR'; // Specific for CityTour (just People)
            const question = "Quantas pessoas irão no passeio? 👥";
            newData.lastQuestion = question;
            
            botMessages = [{ sender: 'bot', text: question }];
            nextStep = step + 1;
            return { botMessages, nextStep, newData, finished, suggestions: [], error };
        }

        // STAGE: WAITING_PEOPLE_CITYTOUR (CITYTOUR)
        if (stage === 'WAITING_PEOPLE_CITYTOUR') {
            newData.copilotoPeople = cleanText;
            
            newData.copilotoStage = 'WAITING_PICKUP_POINT_CITYTOUR';
            const question = "Em qual local devo buscar vocês? 📍";
            newData.lastQuestion = question;
            
            botMessages = [{ sender: 'bot', text: question }];
            nextStep = step + 1;
            return { botMessages, nextStep, newData, finished, suggestions: [], error };
        }

        // STAGE: WAITING_PICKUP_POINT_CITYTOUR (CITYTOUR - FINAL STEP)
        if (stage === 'WAITING_PICKUP_POINT_CITYTOUR') {
            newData.copilotoPickup = cleanText;
            
            // END OF CITYTOUR FLOW
            return finishSimulation(nextStep, newData);
        }

        // STAGE: WAITING_DESTINATION (AGORA / AGENDAR)
        if (stage === 'WAITING_DESTINATION') {
            newData.copilotoDestination = cleanText;
            
            newData.copilotoStage = 'WAITING_PEOPLE_BAGS';
            const question = "Quantos passageiros e malas? 🎒👥";
            newData.lastQuestion = question;
            
            botMessages = [{ sender: 'bot', text: question }];
            nextStep = step + 1;
            return { botMessages, nextStep, newData, finished, suggestions: [], error };
        }

        // STAGE: WAITING_PEOPLE_BAGS (AGORA / AGENDAR)
        if (stage === 'WAITING_PEOPLE_BAGS') {
            newData.copilotoPeople = cleanText;
            
            newData.copilotoStage = 'WAITING_RETURN_BOOL';
            const question = "Precisa de retorno? (Sim/Não) 🔄";
            newData.lastQuestion = question;
            
            botMessages = [{ 
                sender: 'bot', 
                text: question,
                suggestions: ["Sim", "Não"]
            }];
            nextStep = step + 1;
            return { botMessages, nextStep, newData, finished, suggestions: ["Sim", "Não"], error };
        }

        // STAGE: WAITING_RETURN_BOOL
        if (stage === 'WAITING_RETURN_BOOL') {
            if (upperText === 'NÃO' || upperText === 'NAO' || upperText === 'NO') {
                newData.copilotoReturn = false;
                // END OF FLOW
                return finishSimulation(nextStep, newData);
            } else if (upperText === 'SIM' || upperText === 'YES') {
                newData.copilotoReturn = true;
                
                newData.copilotoStage = 'WAITING_RETURN_TIME';
                const question = "Qual o horário do retorno? 🕒";
                newData.lastQuestion = question;
                
                botMessages = [{ sender: 'bot', text: question }];
                nextStep = step + 1;
                return { botMessages, nextStep, newData, finished, suggestions: [], error };
            } else {
                 return returnFallback(newData.lastQuestion, nextStep, newData);
            }
        }

        // STAGE: WAITING_RETURN_TIME
        if (stage === 'WAITING_RETURN_TIME') {
            newData.copilotoReturnTime = cleanText;
            
            newData.copilotoStage = 'WAITING_RETURN_LOCATION';
            const question = "Qual o local de busca do retorno? 📍";
            newData.lastQuestion = question;
            
            botMessages = [{ sender: 'bot', text: question }];
            nextStep = step + 1;
            return { botMessages, nextStep, newData, finished, suggestions: [], error };
        }

        // STAGE: WAITING_RETURN_LOCATION
        if (stage === 'WAITING_RETURN_LOCATION') {
            newData.copilotoReturnPickup = cleanText;
            
            newData.copilotoStage = 'WAITING_RETURN_SAME_DEST';
            const question = "O destino final é o mesmo da ida? 🏁";
            newData.lastQuestion = question;
            
            botMessages = [{ 
                sender: 'bot', 
                text: question,
                suggestions: ["Sim", "Não"]
             }];
            nextStep = step + 1;
            return { botMessages, nextStep, newData, finished, suggestions: ["Sim", "Não"], error };
        }

        // STAGE: WAITING_RETURN_SAME_DEST
        if (stage === 'WAITING_RETURN_SAME_DEST') {
            newData.copilotoReturnSameDest = cleanText; // Just save whatever they type
            
            // END OF FLOW
            return finishSimulation(nextStep, newData);
        }
        
    }

    return { botMessages, nextStep, newData, finished, suggestions, error };
};

// --- HELPER FUNCTIONS ---

const returnFallback = (lastQuestion: string, step: number, newData: any) => {
    const fallbackText = `Como sou um assistente digital, não consigo processar essa informação agora. O motorista falará com você em instantes, mas para eu adiantar sua ficha, preciso saber:\n\n${lastQuestion}`;
    return {
        botMessages: [{ sender: 'bot', text: fallbackText }],
        // nextStep: step, // Removed duplicate key
        // Actually, if we keep 'nextStep' same as input 'step', the chat won't advance?
        // We need to return the message. The step index in 'history' increases.
        // So nextStep = step + 1 is correct for the chat history to record the fallback and wait for new input.
        nextStep: step + 1,
        newData,
        finished: false,
        suggestions: [],
        error: false
    };
};

const finishSimulation = (step: number, userData: any) => {
    let summary = "";
    const path = userData.copilotoPath;

    if (path === 'CITYTOUR') {
        summary = `📋 *RESUMO DO PEDIDO*\n\n` +
                  `👤 Nome: ${userData.copilotoName}\n` +
                  `🏙️ Tipo: CITY TOUR\n` +
                  `⏱️ Duração: ${userData.copilotoDuration}\n` +
                  `📅 Data/Hora: ${userData.copilotoDateTime}\n` +
                  `👥 Pessoas: ${userData.copilotoPeople}\n` +
                  `📍 Busca: ${userData.copilotoPickup}`;
    } else {
        // AGORA or AGENDAR
        summary = `📋 *RESUMO DO PEDIDO*\n\n` +
                  `👤 Nome: ${userData.copilotoName}\n` +
                  `🚗 Tipo: ${path}\n`;
        
        if (path === 'AGENDAR') {
            summary += `📅 Data: ${userData.copilotoDate}\n` +
                       `🕒 Hora: ${userData.copilotoTime}\n`;
        }
        
        summary += `📍 Busca: ${userData.copilotoPickup}\n` +
                   `🏁 Destino: ${userData.copilotoDestination}\n` +
                   `🎒 Passageiros/Malas: ${userData.copilotoPeople}\n`;
                   
        if (userData.copilotoReturn) {
             summary += `\n🔄 *RETORNO*\n` +
                        `🕒 Hora: ${userData.copilotoReturnTime}\n` +
                        `📍 Busca: ${userData.copilotoReturnPickup}\n` +
                        `🏁 Mesmo Destino: ${userData.copilotoReturnSameDest}`;
        }
    }

    let closure = "";
    if (path === 'AGORA') {
        closure = "O motorista já entrará em contato para confirmar a disponibilidade e te passar o valor detalhado. Por favor, fique atento ao seu celular! 🤝";
    } else {
        closure = "O motorista já entrará em contato para confirmar a disponibilidade na agenda e te passar o valor detalhado. Por favor, fique atento ao seu celular! 🤝";
    }

    const finalMessage = `${summary}\n\n${closure}`;

    return {
        botMessages: [{ 
            sender: 'bot', 
            text: finalMessage,
            action: { label: "REINICIAR SIMULAÇÃO", url: "#" } 
        }],
        nextStep: step + 1,
        newData: userData,
        finished: true,
        suggestions: [],
        error: false
    };
};
