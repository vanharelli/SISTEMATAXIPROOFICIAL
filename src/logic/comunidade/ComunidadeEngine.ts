import { BrainResponse, UserData } from '../BrainFunctions';

const COMUNIDADE_STEPS = {
    0: {
        text: "Bem-vindo ao <span style=\"color: #F97316; font-weight: bold;\">Espaço de Colaboração</span>. A <span style=\"color: #F97316; font-weight: bold;\">Comunidade VIP</span> é o ponto de encontro oficial onde os usuários do <span style=\"color: #F97316; font-weight: bold;\">Sistema Taxi Pro</span> compartilham o que está funcionando na prática.",
        action: { label: "CONTINUAR", url: "#", payload: "NEXT_1" }
    },
    1: {
        text: "Este é um ambiente focado em <span style=\"color: #F97316; font-weight: bold;\">Crescimento</span> e apoio mútuo. Sinta-se à vontade para <span style=\"color: #F97316; font-weight: bold;\">Trocar Ideias</span>, mas lembre-se das regras: respeito total, sem conteúdos impróprios e foco absoluto na evolução da categoria.",
        action: { label: "CONTINUAR", url: "#", payload: "NEXT_2" }
    },
    2: {
        text: "Compartilhe seus <span style=\"color: #F97316; font-weight: bold;\">Resultados</span>, aprenda novas estratégias e fortaleça sua operação ao lado de quem busca o mesmo objetivo. Clique abaixo para acessar o grupo oficial da Comunidade VIP.",
        action: { label: "ACESSAR COMUNIDADE VIP", url: "https://chat.whatsapp.com/EJ2ClSYFuTk12rrVVtQAWa" }
    }
};

export const processComunidade = async (step: number, text: string, _userData: UserData): Promise<BrainResponse> => {
    let nextStep = step;
    let botMessages: any[] = [];
    let suggestions: string[] = [];

    // Step 0: Init logic
    if (step === 0) {
        if (text === '' || text === 'init') {
             const item = COMUNIDADE_STEPS[0];
             botMessages = [{
                sender: 'bot',
                text: item.text,
                action: item.action
            }];
        } 
        else if (text === 'NEXT_1') {
             const item = COMUNIDADE_STEPS[1];
             botMessages = [{
                sender: 'bot',
                text: item.text,
                action: item.action
            }];
        }
        else if (text === 'NEXT_2') {
             const item = COMUNIDADE_STEPS[2];
             botMessages = [{
                sender: 'bot',
                text: item.text,
                action: item.action
            }];
        }
    }

    return { botMessages, nextStep, suggestions };
};
