// ==========================================
// MONOPOLY DATA - VERSÃO BRASILEIRA
// ==========================================

const INITIAL_MONEY = 1500;

// Cores das propriedades (grupos)
const PROPERTY_COLORS = {
    brown: '#8B4513',
    lightBlue: '#87CEEB',
    pink: '#D81B60',
    orange: '#FF8C00',
    red: '#FF0000',
    yellow: '#FFD700',
    green: '#228B22',
    darkBlue: '#00008B',
    railroad: '#333333',
    utility: '#90EE90'
};

// Todas as propriedades do tabuleiro
const PROPERTIES = [
    // Marrons
    { id: 1, name: 'Leblon', group: 'brown', price: 60, rent: [2, 10, 30, 90, 160, 250], houseCost: 50, color: PROPERTY_COLORS.brown },
    { id: 2, name: 'Av. Presidente Vargas', group: 'brown', price: 60, rent: [4, 20, 60, 180, 320, 450], houseCost: 50, color: PROPERTY_COLORS.brown },
    
    // Azul claro
    { id: 3, name: 'Av. Nossa Sra. de Copacabana', group: 'lightBlue', price: 100, rent: [6, 30, 90, 270, 400, 550], houseCost: 50, color: PROPERTY_COLORS.lightBlue },
    { id: 4, name: 'Av. Brigadeiro Faria Lima', group: 'lightBlue', price: 100, rent: [6, 30, 90, 270, 400, 550], houseCost: 50, color: PROPERTY_COLORS.lightBlue },
    { id: 5, name: 'Av. Rebouças', group: 'lightBlue', price: 120, rent: [8, 40, 100, 300, 450, 600], houseCost: 50, color: PROPERTY_COLORS.lightBlue },
    
    // Rosa
    { id: 6, name: 'Av. Europa', group: 'pink', price: 140, rent: [10, 50, 150, 450, 625, 750], houseCost: 100, color: PROPERTY_COLORS.pink },
    { id: 7, name: 'Rua Oscar Freire', group: 'pink', price: 140, rent: [10, 50, 150, 450, 625, 750], houseCost: 100, color: PROPERTY_COLORS.pink },
    { id: 8, name: 'Rua Augusta', group: 'pink', price: 160, rent: [12, 60, 180, 500, 700, 900], houseCost: 100, color: PROPERTY_COLORS.pink },
    
    // Laranja
    { id: 9, name: 'Av. Morumbi', group: 'orange', price: 180, rent: [14, 70, 200, 550, 750, 950], houseCost: 100, color: PROPERTY_COLORS.orange },
    { id: 10, name: 'Av. Pacaembu', group: 'orange', price: 180, rent: [14, 70, 200, 550, 750, 950], houseCost: 100, color: PROPERTY_COLORS.orange },
    { id: 11, name: 'Rua dos Jardins', group: 'orange', price: 200, rent: [16, 80, 220, 600, 800, 1000], houseCost: 100, color: PROPERTY_COLORS.orange },
    
    // Vermelho
    { id: 12, name: 'Av. Brasil', group: 'red', price: 220, rent: [18, 90, 250, 700, 875, 1050], houseCost: 150, color: PROPERTY_COLORS.red },
    { id: 13, name: 'Av. Paulista', group: 'red', price: 220, rent: [18, 90, 250, 700, 875, 1050], houseCost: 150, color: PROPERTY_COLORS.red },
    { id: 14, name: 'Av. Atlântica', group: 'red', price: 240, rent: [20, 100, 300, 750, 925, 1100], houseCost: 150, color: PROPERTY_COLORS.red },
    
    // Amarelo
    { id: 15, name: 'Av. Vieira Souto', group: 'yellow', price: 260, rent: [22, 110, 330, 800, 975, 1150], houseCost: 150, color: PROPERTY_COLORS.yellow },
    { id: 16, name: 'Av. Niemeyer', group: 'yellow', price: 260, rent: [22, 110, 330, 800, 975, 1150], houseCost: 150, color: PROPERTY_COLORS.yellow },
    { id: 17, name: 'Rua Jardim Botânico', group: 'yellow', price: 280, rent: [24, 120, 360, 850, 1025, 1200], houseCost: 150, color: PROPERTY_COLORS.yellow },
    
    // Verde
    { id: 18, name: 'Av. Rio Branco', group: 'green', price: 300, rent: [26, 130, 390, 900, 1100, 1275], houseCost: 200, color: PROPERTY_COLORS.green },
    { id: 19, name: 'Rua XV de Novembro', group: 'green', price: 300, rent: [26, 130, 390, 900, 1100, 1275], houseCost: 200, color: PROPERTY_COLORS.green },
    { id: 20, name: 'Av. São João', group: 'green', price: 320, rent: [28, 150, 450, 1000, 1200, 1400], houseCost: 200, color: PROPERTY_COLORS.green },
    
    // Azul escuro
    { id: 21, name: 'Av. Ipiranga', group: 'darkBlue', price: 350, rent: [35, 175, 500, 1100, 1300, 1500], houseCost: 200, color: PROPERTY_COLORS.darkBlue },
    { id: 22, name: 'Av. São Luís', group: 'darkBlue', price: 400, rent: [50, 200, 600, 1400, 1700, 2000], houseCost: 200, color: PROPERTY_COLORS.darkBlue },
    
    // Ferrovias
    { id: 23, name: 'Estação da Luz', group: 'railroad', price: 200, rent: [25, 50, 100, 200], houseCost: 0, color: PROPERTY_COLORS.railroad, isRailroad: true },
    { id: 24, name: 'Estação Júlio Prestes', group: 'railroad', price: 200, rent: [25, 50, 100, 200], houseCost: 0, color: PROPERTY_COLORS.railroad, isRailroad: true },
    { id: 25, name: 'Estação Central do Brasil', group: 'railroad', price: 200, rent: [25, 50, 100, 200], houseCost: 0, color: PROPERTY_COLORS.railroad, isRailroad: true },
    { id: 26, name: 'Estação Leopoldina', group: 'railroad', price: 200, rent: [25, 50, 100, 200], houseCost: 0, color: PROPERTY_COLORS.railroad, isRailroad: true },
    
    // Companhias
    { id: 27, name: 'Companhia de Eletricidade', group: 'utility', price: 150, rent: [4, 10], houseCost: 0, color: PROPERTY_COLORS.utility, isUtility: true },
    { id: 28, name: 'Companhia de Água', group: 'utility', price: 150, rent: [4, 10], houseCost: 0, color: PROPERTY_COLORS.utility, isUtility: true },
];

// Cartas de Sorte
const CHANCE_CARDS = [
    { text: 'Avance até a casa "Início" (Receba $200)', effect: { type: 'receive', amount: 200 } },
    { text: 'Vá para a Av. Paulista', effect: { type: 'move', property: 13 } },
    { text: 'Vá para a Av. São Luís. Se passar pelo Início, receba $200', effect: { type: 'move', property: 22 } },
    { text: 'O banco paga dividendos de $50', effect: { type: 'receive', amount: 50 } },
    { text: 'Receba $150', effect: { type: 'receive', amount: 150 } },
    { text: 'Pague taxa escolar de $150', effect: { type: 'pay', amount: 150 } },
    { text: 'Multa por excesso de velocidade: $15', effect: { type: 'pay', amount: 15 } },
    { text: 'Empréstimo vence. Receba $150', effect: { type: 'receive', amount: 150 } },
    { text: 'Você foi eleito presidente do conselho. Pague $50 a cada jogador', effect: { type: 'payEach', amount: 50 } },
    { text: 'Suas propriedades estão valorizando! Receba $100', effect: { type: 'receive', amount: 100 } },
    { text: 'Vá direto para a cadeia. Não passe pelo Início', effect: { type: 'jail' } },
    { text: 'Faça reparos em suas casas. Pague $25 por casa e $100 por hotel', effect: { type: 'repairs', houseCost: 25, hotelCost: 100 } },
    { text: 'Sua apólice de seguro vence. Receba $100', effect: { type: 'receive', amount: 100 } },
    { text: 'Você ganhou um concurso! Receba $200', effect: { type: 'receive', amount: 200 } },
    { text: 'Imposto de renda: pague $200', effect: { type: 'pay', amount: 200 } },
    { text: 'Saia livre da prisão (guarde esta carta)', effect: { type: 'getOutOfJail' } },
];

// Cartas do Cofre Comunitário
const COMMUNITY_CHEST_CARDS = [
    { text: 'Avance até a casa "Início" (Receba $200)', effect: { type: 'receive', amount: 200 } },
    { text: 'Erro do banco a seu favor. Receba $200', effect: { type: 'receive', amount: 200 } },
    { text: 'Pague ao hospital $100', effect: { type: 'pay', amount: 100 } },
    { text: 'Venda de ações. Receba $50', effect: { type: 'receive', amount: 50 } },
    { text: 'Saia livre da prisão (guarde esta carta)', effect: { type: 'getOutOfJail' } },
    { text: 'Vá para a cadeia. Não passe pelo Início', effect: { type: 'jail' } },
    { text: 'Férias! Receba $100', effect: { type: 'receive', amount: 100 } },
    { text: 'Restituição do imposto de renda. Receba $20', effect: { type: 'receive', amount: 20 } },
    { text: 'É seu aniversário! Receba $10 de cada jogador', effect: { type: 'receiveEach', amount: 10 } },
    { text: 'Seguro de vida vence. Receba $100', effect: { type: 'receive', amount: 100 } },
    { text: 'Pague a conta do médico: $50', effect: { type: 'pay', amount: 50 } },
    { text: 'Herança! Receba $100', effect: { type: 'receive', amount: 100 } },
    { text: 'Prêmio de beleza. Receba $10', effect: { type: 'receive', amount: 10 } },
    { text: 'Você é promovido! Receba $100', effect: { type: 'receive', amount: 100 } },
    { text: 'Faça reparos em suas casas. Pague $40 por casa e $115 por hotel', effect: { type: 'repairs', houseCost: 40, hotelCost: 115 } },
    { text: 'Pague mensalidade escolar: $150', effect: { type: 'pay', amount: 150 } },
];

// Valores rápidos para transações
const QUICK_AMOUNTS = [1, 5, 10, 20, 50, 100, 500];

// Peças clássicas do Monopoly (usando Lucide icons + emojis fallback)
const GAME_PIECES = [
    { id: 'hat', name: 'Cartola', icon: 'crown', emoji: '🎩', color: '#1F2937' },
    { id: 'car', name: 'Carro', icon: 'car', emoji: '🚗', color: '#DC2626' },
    { id: 'dog', name: 'Cachorro', icon: 'dog', emoji: '🐕', color: '#92400E' },
    { id: 'boot', name: 'Bota', icon: 'footprints', emoji: '👢', color: '#7C3AED' },
    { id: 'ship', name: 'Navio', icon: 'ship', emoji: '🚢', color: '#0369A1' },
    { id: 'iron', name: 'Ferro', icon: 'shirt', emoji: '👔', color: '#6B7280' },
    { id: 'thimble', name: 'Dedal', icon: 'shield', emoji: '🛡️', color: '#CA8A04' },
    { id: 'wheelbarrow', name: 'Carrinho', icon: 'shopping-cart', emoji: '🛒', color: '#059669' },
    { id: 'cat', name: 'Gato', icon: 'cat', emoji: '🐱', color: '#F97316' },
    { id: 'plane', name: 'Avião', icon: 'plane', emoji: '✈️', color: '#2563EB' },
    { id: 'penguin', name: 'Pinguim', icon: 'bird', emoji: '🐧', color: '#1E293B' },
    { id: 'dinosaur', name: 'T-Rex', icon: 'bone', emoji: '🦖', color: '#16A34A' },
];

// Modos de jogo
const GAME_MODES = {
    classic: {
        name: 'Clássico',
        description: 'Regras originais do Monopoly',
        initialMoney: 1500,
        salary: 200,
        houseBuildRule: 'even', // Construção deve ser uniforme
        auctionRequired: true,
        doubleRentWithMonopoly: true,
        maxHouses: 32,
        maxHotels: 12,
    },
    quick: {
        name: 'Rápido',
        description: 'Partida mais curta',
        initialMoney: 1000,
        salary: 150,
        houseBuildRule: 'any', // Construção livre
        auctionRequired: false,
        doubleRentWithMonopoly: true,
        maxHouses: 32,
        maxHotels: 12,
        timer: 60, // Limite de 60 minutos
    },
    turbo: {
        name: 'Turbo',
        description: 'Ação máxima!',
        initialMoney: 500,
        salary: 100,
        houseBuildRule: 'any',
        auctionRequired: false,
        doubleRentWithMonopoly: true,
        maxHouses: 32,
        maxHotels: 12,
        startWithProperties: true, // Cada jogador começa com 2 propriedades
        timer: 30,
    },
};

// Ícones para jogadores (legado - agora usa GAME_PIECES)
const PLAYER_ICONS = ['🎩', '🚗', '🐕', '👟', '🚢', '🎸', '✈️', '💎'];
