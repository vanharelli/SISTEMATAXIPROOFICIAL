import { BrainResponse, UserData } from '../BrainFunctions';

export const processCalculadora = async (step: number, text: string, userData: UserData): Promise<BrainResponse> => {
    let nextStep = step;
    let botMessages: any[] = [];
    let suggestions: string[] = [];
    let newData: UserData = { ...userData };

    const cleanNumber = (str: string) => parseFloat(str.replace(/[^0-9.]/g, '').replace(',', '.'));

    // Step 0: Init
    if (step === 0) {
        botMessages = [
            { sender: 'bot', text: "💰 **CALCULADORA DE LUCRO REAL v5.0**" },
            { sender: 'bot', text: "Muitos motoristas faturam alto mas perdem tudo nos custos invisíveis." },
            { sender: 'bot', text: "Vou calcular seu **LUCRO LÍQUIDO MENSAL** agora." },
            { sender: 'bot', text: "Para começar: **Qual é o seu FATURAMENTO MÉDIO DIÁRIO (Bruto)?**\nEx: 400" }
        ];
        nextStep = 1;
    }

    // Step 1: Receives Daily Gross
    else if (step === 1) {
        const dailyGross = cleanNumber(text);
        if (isNaN(dailyGross) || dailyGross <= 0) {
            botMessages = [{ sender: 'bot', text: "Valor inválido. Digite apenas números. Ex: 400" }];
            return { botMessages, nextStep, suggestions };
        }
        newData.calcDailyGross = dailyGross;
        botMessages = [{ sender: 'bot', text: `Certo, R$ ${dailyGross.toFixed(2)} por dia.\n\nAgora: **Quanto você gasta de COMBUSTÍVEL + ALIMENTAÇÃO por dia?**\nEx: 120` }];
        nextStep = 2;
    }

    // Step 2: Receives Daily Cost
    else if (step === 2) {
        const dailyCost = cleanNumber(text);
         if (isNaN(dailyCost) || dailyCost < 0) {
            botMessages = [{ sender: 'bot', text: "Valor inválido. Digite apenas números." }];
            return { botMessages, nextStep, suggestions };
        }
        newData.calcDailyCost = dailyCost;
        botMessages = [{ sender: 'bot', text: "Entendido.\n\nPor fim: **Quantos dias por SEMANA você trabalha?**\nEx: 5 ou 6" }];
        suggestions = ["5", "6", "7"];
        nextStep = 3;
    }

    // Step 3: Receives Days Per Week
    else if (step === 3) {
        const daysPerWeek = cleanNumber(text);
         if (isNaN(daysPerWeek) || daysPerWeek <= 0 || daysPerWeek > 7) {
            botMessages = [{ sender: 'bot', text: "Por favor, digite um número entre 1 e 7." }];
            suggestions = ["5", "6", "7"];
            return { botMessages, nextStep, suggestions };
        }
        newData.calcDaysWeek = daysPerWeek;
        
        // Calculate
        const dailyProfit = (newData.calcDailyGross || 0) - (newData.calcDailyCost || 0);
        const monthlyProfit = dailyProfit * daysPerWeek * 4; // Approx 4 weeks
        const monthlyGross = (newData.calcDailyGross || 0) * daysPerWeek * 4;
        const monthlyCost = (newData.calcDailyCost || 0) * daysPerWeek * 4;

        newData.calcResult = monthlyProfit;

        botMessages = [
            { sender: 'bot', text: "🔄 **PROCESSANDO DADOS FINANCEIROS...**" },
            { sender: 'bot', text: "📊 **RESULTADO DA ANÁLISE:**" },
            { sender: 'bot', text: `Faturamento Mensal: R$ ${monthlyGross.toFixed(2)}` },
            { sender: 'bot', text: `Custo Mensal: R$ ${monthlyCost.toFixed(2)}` },
            { sender: 'bot', text: `✅ **LUCRO LÍQUIDO ESTIMADO: R$ ${monthlyProfit.toFixed(2)}**` },
            { sender: 'bot', text: monthlyProfit > 3000 ? "🚀 **Excelente resultado!** Com o Pilar 3 (Google Ads), podemos escalar isso ainda mais." : "⚠️ **Atenção:** Sua margem está apertada. O Pilar 3 é urgente para você aumentar o valor das corridas." },
            { sender: 'bot', text: "Deseja fazer uma nova simulação?" }
        ];
        suggestions = ["SIMULAR NOVAMENTE", "SAIR"];
        nextStep = 4;
    }

    // Step 4: Restart or Exit
    else if (step === 4) {
        if (text.toUpperCase().includes("SIMULAR")) {
            botMessages = [{ sender: 'bot', text: "Reiniciando calculadora...\n\n**Qual é o seu FATURAMENTO MÉDIO DIÁRIO (Bruto)?**" }];
            nextStep = 1;
        } else {
             botMessages = [{ sender: 'bot', text: "Calculadora encerrada. Foco no lucro!" }];
             nextStep = 5; // End state
        }
    }

    return { botMessages, nextStep, newData, suggestions };
};
