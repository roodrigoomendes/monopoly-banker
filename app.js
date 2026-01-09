// ==========================================
// MONOPOLY BANQUEIRO DIGITAL - APP v5.0
// ==========================================

class MonopolyBanker {
    constructor() {
        this.players = [];
        this.properties = JSON.parse(JSON.stringify(PROPERTIES));
        this.history = [];
        this.selectedPlayer = null;
        this.selectedColor = null;
        this.selectedPiece = null;
        this.usedColors = [];
        this.usedPieces = [];
        this.chanceCards = this.shuffleArray([...CHANCE_CARDS]);
        this.chestCards = this.shuffleArray([...COMMUNITY_CHEST_CARDS]);
        this.currentCard = null;
        this.diceCount = 1;
        this.lastDiceRoll = [0, 0];
        
        // Game Mode
        this.gameMode = 'classic';
        this.gameModeSettings = GAME_MODES.classic;
        
        // Auction state - Sistema Sequencial
        this.auctionActive = false;
        this.auctionProperty = null;
        this.auctionBid = 0;
        this.auctionBidder = null;
        this.auctionPassed = [];
        this.auctionQueue = [];
        this.auctionCurrentIndex = 0;
        
        // Negotiation state
        this.negotiation = {
            player1: null,
            player2: null,
            offer1: { money: 0, properties: [] },
            offer2: { money: 0, properties: [] }
        };
        
        // Bankruptcy state
        this.bankruptPlayer = null;
        this.bankruptCreditor = null;
        
        this.init();
    }
    
    init() {
        this.loadTheme();
        this.setupEventListeners();
        this.renderPiecePicker();
        this.selectFirstAvailableColor();
        this.selectFirstAvailablePiece();
        setTimeout(() => lucide.createIcons(), 100);
        
        // Verificar se há partida salva
        this.checkSavedGame();
    }
    
    // ==========================================
    // SAVE/LOAD GAME - LocalStorage
    // ==========================================
    
    checkSavedGame() {
        const savedGame = localStorage.getItem('monopoly_game');
        if (savedGame) {
            try {
                const gameData = JSON.parse(savedGame);
                if (gameData.players && gameData.players.length > 0) {
                    this.showLoadGameModal(gameData);
                }
            } catch (e) {
                console.error('Erro ao carregar partida salva:', e);
                localStorage.removeItem('monopoly_game');
            }
        }
    }
    
    showLoadGameModal(gameData) {
        const savedDate = new Date(gameData.savedAt);
        const formattedDate = savedDate.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        const content = `
            <div style="text-align: center; padding: 16px 0;">
                <div style="font-size: 3rem; margin-bottom: 12px;">💾</div>
                <h4 style="margin-bottom: 8px;">Partida Salva Encontrada!</h4>
                <p style="color: var(--text-secondary); margin-bottom: 20px;">
                    Salva em: ${formattedDate}
                </p>
                
                <div style="background: var(--bg-tertiary); border-radius: var(--radius-md); padding: 16px; margin-bottom: 20px;">
                    <p style="font-weight: 600; margin-bottom: 12px;">${gameData.players.length} jogadores:</p>
                    <div style="display: flex; flex-wrap: wrap; gap: 8px; justify-content: center;">
                        ${gameData.players.map(p => `
                            <div style="display: flex; align-items: center; gap: 6px; background: var(--bg-secondary); padding: 6px 12px; border-radius: 20px;">
                                <div style="width: 24px; height: 24px; border-radius: 50%; background: ${p.color}; display: flex; align-items: center; justify-content: center; font-size: 0.75rem; color: white;">
                                    ${p.noPiece ? p.name.charAt(0).toUpperCase() : p.icon}
                                </div>
                                <span style="font-size: 0.875rem;">${p.name}</span>
                            </div>
                        `).join('')}
                    </div>
                    <p style="color: var(--text-muted); font-size: 0.875rem; margin-top: 12px;">
                        Modo: ${gameData.gameMode === 'classic' ? 'Clássico' : gameData.gameMode === 'quick' ? 'Rápido' : 'Turbo'}
                    </p>
                </div>
            </div>
            
            <div style="display: flex; gap: 12px;">
                <button class="btn btn-secondary btn-full" onclick="app.discardSavedGame()">
                    <i data-lucide="trash-2"></i> Nova Partida
                </button>
                <button class="btn btn-primary btn-full" onclick="app.loadSavedGame()">
                    <i data-lucide="play"></i> Continuar
                </button>
            </div>
        `;
        
        this.openModal('💾 Continuar Partida?', content);
        
        if (typeof lucide !== 'undefined') {
            setTimeout(() => lucide.createIcons(), 10);
        }
    }
    
    discardSavedGame() {
        localStorage.removeItem('monopoly_game');
        this.closeModal();
        this.showToast('Partida descartada. Comece uma nova!', 'info');
    }
    
    loadSavedGame() {
        const savedGame = localStorage.getItem('monopoly_game');
        if (!savedGame) return;
        
        try {
            const gameData = JSON.parse(savedGame);
            
            // Restaurar estado do jogo
            this.players = gameData.players || [];
            this.properties = gameData.properties || JSON.parse(JSON.stringify(PROPERTIES));
            this.history = gameData.history || [];
            this.gameMode = gameData.gameMode || 'classic';
            this.gameModeSettings = GAME_MODES[this.gameMode];
            this.usedColors = gameData.usedColors || [];
            this.usedPieces = gameData.usedPieces || [];
            
            // Ir para tela de gerenciamento
            document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
            document.getElementById('game-screen').classList.add('active');
            
            this.closeModal();
            this.renderPlayersCards();
            this.renderProperties();
            this.renderHistory();
            
            // Atualizar ícones Lucide
            if (typeof lucide !== 'undefined') {
                setTimeout(() => lucide.createIcons(), 100);
            }
            
            this.showToast('Partida restaurada!', 'success');
        } catch (e) {
            console.error('Erro ao carregar partida:', e);
            this.showToast('Erro ao carregar partida', 'danger');
        }
    }
    
    saveGame() {
        if (this.players.length === 0) return;
        
        const gameData = {
            players: this.players,
            properties: this.properties,
            history: this.history,
            gameMode: this.gameMode,
            usedColors: this.usedColors,
            usedPieces: this.usedPieces,
            savedAt: new Date().toISOString()
        };
        
        try {
            localStorage.setItem('monopoly_game', JSON.stringify(gameData));
        } catch (e) {
            console.error('Erro ao salvar partida:', e);
        }
    }
    
    autoSave() {
        // Salva automaticamente após cada ação importante
        this.saveGame();
    }
    
    clearSavedGame() {
        localStorage.removeItem('monopoly_game');
    }
    
    // ==========================================
    // PIECE PICKER - Seleção de Peças
    // ==========================================
    
    renderPiecePicker() {
        const container = document.getElementById('piece-picker');
        if (!container) return;
        
        // Opção "Sem peça" primeiro
        let html = `
            <div class="piece-option no-piece ${this.selectedPiece === 'none' ? 'selected' : ''}" 
                 data-piece="none" 
                 title="Sem peça (só cor)">
                <i data-lucide="ban" style="width: 24px; height: 24px;"></i>
            </div>
        `;
        
        // Peças do jogo
        html += GAME_PIECES.map(piece => `
            <div class="piece-option ${this.selectedPiece === piece.id ? 'selected' : ''} ${this.usedPieces.includes(piece.id) ? 'used' : ''}" 
                 data-piece="${piece.id}" 
                 title="${piece.name}">
                ${piece.emoji}
            </div>
        `).join('');
        
        container.innerHTML = html;
        
        container.querySelectorAll('.piece-option').forEach(option => {
            option.addEventListener('click', () => this.selectPiece(option.dataset.piece));
        });
        
        // Inicializar ícones Lucide
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }
    
    selectPiece(pieceId) {
        if (pieceId !== 'none' && this.usedPieces.includes(pieceId)) return;
        this.selectedPiece = pieceId;
        this.renderPiecePicker();
    }
    
    selectFirstAvailablePiece() {
        // Por padrão não seleciona nenhuma peça (usuário escolhe)
        this.selectedPiece = null;
    }
    
    getPieceById(id) {
        return GAME_PIECES.find(p => p.id === id) || GAME_PIECES[0];
    }
    
    getPlayerDisplay(player) {
        // Retorna o ícone ou a inicial do nome quando não tem peça
        if (player.noPiece || !player.icon) {
            return player.name.charAt(0).toUpperCase();
        }
        return player.icon;
    }
    
    // ==========================================
    // THEME MANAGEMENT
    // ==========================================
    
    loadTheme() {
        const savedTheme = localStorage.getItem('monopoly-theme') || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);
    }
    
    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('monopoly-theme', newTheme);
    }
    
    // ==========================================
    // EVENT LISTENERS
    // ==========================================
    
    setupEventListeners() {
        // Theme toggle
        document.getElementById('theme-toggle').addEventListener('click', () => this.toggleTheme());
        
        // Game mode selection
        document.querySelectorAll('.game-mode-option').forEach(option => {
            option.addEventListener('click', () => this.selectGameMode(option.dataset.mode));
        });
        
        // Add player
        document.getElementById('add-player-btn').addEventListener('click', () => this.addPlayer());
        document.getElementById('player-name').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addPlayer();
        });
        
        // Color selection
        document.querySelectorAll('.color-option').forEach(option => {
            option.addEventListener('click', () => this.selectColor(option));
        });
        
        // Start game
        document.getElementById('start-game-btn').addEventListener('click', () => this.startGame());
        
        // Side menu
        document.getElementById('menu-btn').addEventListener('click', () => this.toggleSideMenu());
        document.getElementById('new-game-btn').addEventListener('click', () => this.newGame());
        document.getElementById('add-player-game-btn').addEventListener('click', () => this.showAddPlayerModal());
        document.getElementById('reset-money-btn').addEventListener('click', () => this.resetMoney());
        document.getElementById('rules-btn').addEventListener('click', () => this.showRules());
        document.getElementById('save-game-btn').addEventListener('click', () => {
            this.saveGame();
            this.toggleSideMenu();
            this.showToast('Partida salva!', 'success');
        });
        document.getElementById('auction-menu-btn').addEventListener('click', () => {
            this.toggleSideMenu();
            this.showAuctionStartModal();
        });
        document.getElementById('declare-bankruptcy-btn').addEventListener('click', () => {
            this.toggleSideMenu();
            this.showDeclareBankruptcyModal();
        });
        document.getElementById('player-order-menu-btn').addEventListener('click', () => {
            this.toggleSideMenu();
            this.showPlayerOrderModal();
        });
        // Navigation
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', () => this.switchTab(btn.dataset.tab));
        });
        
        // Quick actions (chips)
        document.querySelectorAll('.quick-action-chip').forEach(btn => {
            btn.addEventListener('click', () => this.handleQuickAction(btn.dataset.action));
        });
        
        // FABs
        document.querySelectorAll('.fab').forEach(btn => {
            btn.addEventListener('click', () => this.handleQuickAction(btn.dataset.action));
        });
        
        // Back buttons
        document.querySelectorAll('.back-btn').forEach(btn => {
            btn.addEventListener('click', () => this.goBack());
        });
        
        // Auction button in properties header
        document.querySelector('[data-action="auction"]')?.addEventListener('click', () => this.showAuctionStartModal());
        
        // Modal
        document.querySelector('.modal-close').addEventListener('click', () => this.closeModal());
        document.getElementById('modal-overlay').addEventListener('click', (e) => {
            if (e.target.id === 'modal-overlay') this.closeModal();
        });
        
        // Property filters
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', () => this.filterProperties(btn.dataset.filter));
        });
        
        // Cards
        document.querySelector('#chance-deck .btn').addEventListener('click', () => this.drawCard('chance'));
        document.querySelector('#chest-deck .btn').addEventListener('click', () => this.drawCard('chest'));
        document.querySelector('#chance-deck .deck-cover').addEventListener('click', () => this.drawCard('chance'));
        document.querySelector('#chest-deck .deck-cover').addEventListener('click', () => this.drawCard('chest'));
        
        // Dice
        document.querySelectorAll('.dice-option-btn').forEach(btn => {
            btn.addEventListener('click', () => this.setDiceCount(parseInt(btn.dataset.dice)));
        });
        document.getElementById('roll-dice-btn').addEventListener('click', () => this.rollDice());
        document.querySelectorAll('.dice').forEach(dice => {
            dice.addEventListener('click', () => this.rollDice());
        });
        
        // Close menu on outside click
        document.addEventListener('click', (e) => {
            const sideMenu = document.getElementById('side-menu');
            const menuBtn = document.getElementById('menu-btn');
            if (!sideMenu.contains(e.target) && !menuBtn.contains(e.target) && sideMenu.classList.contains('active')) {
                this.toggleSideMenu();
            }
        });
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeModal();
                if (document.getElementById('side-menu').classList.contains('active')) {
                    this.toggleSideMenu();
                }
            }
        });
    }
    
    selectFirstAvailableColor() {
        const firstAvailable = document.querySelector('.color-option:not(.used)');
        if (firstAvailable) this.selectColor(firstAvailable);
    }
    
    selectColor(option) {
        document.querySelectorAll('.color-option').forEach(opt => opt.classList.remove('selected'));
        option.classList.add('selected');
        this.selectedColor = option.dataset.color;
    }
    
    // ==========================================
    // GAME MODE
    // ==========================================
    
    selectGameMode(mode) {
        this.gameMode = mode;
        this.gameModeSettings = GAME_MODES[mode];
        
        document.querySelectorAll('.game-mode-option').forEach(opt => {
            opt.classList.toggle('selected', opt.dataset.mode === mode);
        });
        
        lucide.createIcons();
    }
    
    // ==========================================
    // PLAYER MANAGEMENT
    // ==========================================
    
    addPlayer() {
        const nameInput = document.getElementById('player-name');
        const name = nameInput.value.trim();
        
        if (!name) {
            this.shake(nameInput);
            return;
        }
        
        if (this.players.length >= 8) {
            this.showToast('Máximo de 8 jogadores!', 'warning');
            return;
        }
        
        if (!this.selectedColor) {
            this.showToast('Selecione uma cor!', 'warning');
            return;
        }
        
        if (!this.selectedPiece) {
            this.showToast('Selecione uma peça ou "Sem peça"!', 'warning');
            return;
        }
        
        // Verificar se é "sem peça" ou uma peça específica
        const isNoPiece = this.selectedPiece === 'none';
        const piece = isNoPiece ? null : this.getPieceById(this.selectedPiece);
        
        const player = {
            id: Date.now(),
            name: name,
            color: this.selectedColor,
            balance: this.gameModeSettings.initialMoney,
            properties: [],
            isBankrupt: false,
            piece: piece,
            icon: isNoPiece ? '' : piece.emoji,
            noPiece: isNoPiece,
            order: this.players.length + 1,
            jailFreeCards: 0
        };
        
        this.players.push(player);
        this.usedColors.push(this.selectedColor);
        if (!isNoPiece) {
            this.usedPieces.push(this.selectedPiece);
        }
        
        this.renderPlayersSetup();
        this.updateStartButton();
        
        nameInput.value = '';
        this.updateColorPicker();
        this.renderPiecePicker();
        this.selectFirstAvailableColor();
        this.selectFirstAvailablePiece();
        nameInput.focus();
        
        lucide.createIcons();
    }
    
    removePlayer(playerId) {
        const player = this.players.find(p => p.id === playerId);
        if (player) {
            this.usedColors = this.usedColors.filter(c => c !== player.color);
            if (player.piece) {
                this.usedPieces = this.usedPieces.filter(p => p !== player.piece.id);
            }
        }
        this.players = this.players.filter(p => p.id !== playerId);
        // Reordenar
        this.players.forEach((p, i) => p.order = i + 1);
        this.renderPlayersSetup();
        this.updateStartButton();
        this.updateColorPicker();
        this.renderPiecePicker();
    }
    
    renderPlayersSetup() {
        const container = document.getElementById('players-list');
        container.innerHTML = this.players.map(player => `
            <div class="player-setup-item">
                <div class="player-piece-display" style="background: ${player.color}">
                    ${this.getPlayerDisplay(player)}
                </div>
                <span class="player-setup-name">${player.name}</span>
                <button class="player-remove-btn" onclick="app.removePlayer(${player.id})">×</button>
            </div>
        `).join('');
    }
    
    updateColorPicker() {
        document.querySelectorAll('.color-option').forEach(option => {
            option.classList.toggle('used', this.usedColors.includes(option.dataset.color));
        });
    }
    
    updateStartButton() {
        document.getElementById('start-game-btn').disabled = this.players.length < 2;
    }
    
    // ==========================================
    // PLAYER ORDER MANAGEMENT
    // ==========================================
    
    showPlayerOrderModal() {
        const sortedPlayers = [...this.players].sort((a, b) => a.order - b.order);
        
        const content = `
            <p class="order-modal-subtitle">
                Use as setas para reorganizar a ordem de jogo
            </p>
            
            <div class="player-order-list" id="player-order-list">
                ${sortedPlayers.map((player, index) => `
                    <div class="player-order-item" data-player-id="${player.id}">
                        <div class="order-position">${index + 1}º</div>
                        <div class="player-avatar" style="background: ${player.color}">
                            ${this.getPlayerDisplay(player)}
                        </div>
                        <div class="order-player-name">${player.name}</div>
                        <div class="order-controls">
                            <button class="order-arrow-btn" onclick="app.movePlayerOrder(${player.id}, -1)" ${index === 0 ? 'disabled' : ''}>
                                <i data-lucide="chevron-up"></i>
                            </button>
                            <button class="order-arrow-btn" onclick="app.movePlayerOrder(${player.id}, 1)" ${index === sortedPlayers.length - 1 ? 'disabled' : ''}>
                                <i data-lucide="chevron-down"></i>
                            </button>
                        </div>
                    </div>
                `).join('')}
            </div>
            
            <div class="order-modal-buttons">
                <button class="btn btn-secondary btn-full" onclick="app.randomizePlayerOrder()">
                    <i data-lucide="shuffle"></i> Embaralhar
                </button>
                <button class="btn btn-gold btn-full" onclick="app.startDiceOrderRollInline()">
                    <i data-lucide="dices"></i> Sortear com Dados
                </button>
            </div>
            
            <button class="btn btn-primary btn-full btn-lg" onclick="app.closeModal()" style="margin-top: 12px;">
                <i data-lucide="check"></i> Confirmar Ordem
            </button>
        `;
        
        this.openModal('📋 Ordem dos Jogadores', content);
        
        if (typeof lucide !== 'undefined') {
            setTimeout(() => lucide.createIcons(), 10);
        }
    }
    
    randomizePlayerOrder() {
        // Embaralhar ordem aleatoriamente
        const shuffled = [...this.players].sort(() => Math.random() - 0.5);
        shuffled.forEach((player, index) => {
            player.order = index + 1;
        });
        this.showPlayerOrderModal();
        this.renderPlayersCards();
        this.showToast('Ordem embaralhada!', 'info');
    }
    
    startDiceOrderRollInline() {
        const activePlayers = this.players.filter(p => !p.isBankrupt);
        
        // Rolar dados para todos
        const results = activePlayers.map(player => ({
            player,
            roll: Math.floor(Math.random() * 6) + 1 + Math.floor(Math.random() * 6) + 1
        }));
        
        // Ordenar por resultado (maior primeiro)
        results.sort((a, b) => b.roll - a.roll);
        
        // Atribuir nova ordem
        results.forEach((result, index) => {
            result.player.order = index + 1;
        });
        
        // Mostrar resultados no modal
        const content = `
            <p class="order-modal-subtitle">
                🎲 Resultados do sorteio com dados
            </p>
            
            <div class="player-order-list" id="player-order-list">
                ${results.map((result, index) => `
                    <div class="player-order-item ${index === 0 ? 'winner' : ''}">
                        <div class="order-position">${index + 1}º</div>
                        <div class="player-avatar" style="background: ${result.player.color}">
                            ${this.getPlayerDisplay(result.player)}
                        </div>
                        <div class="order-player-name">${result.player.name}</div>
                        <div class="dice-roll-result">
                            <span class="dice-value">${result.roll}</span>
                            <i data-lucide="dices"></i>
                        </div>
                    </div>
                `).join('')}
            </div>
            
            <div class="order-modal-buttons" style="margin-top: 20px;">
                <button class="btn btn-secondary btn-full" onclick="app.showPlayerOrderModal()">
                    <i data-lucide="arrow-left"></i> Voltar
                </button>
                <button class="btn btn-primary btn-full" onclick="app.closeModal()">
                    <i data-lucide="check"></i> Confirmar
                </button>
            </div>
        `;
        
        this.openModal('🎲 Ordem por Dados', content);
        this.renderPlayersCards();
        
        if (typeof lucide !== 'undefined') {
            setTimeout(() => lucide.createIcons(), 10);
        }
    }
    
    movePlayerOrder(playerId, direction) {
        const player = this.players.find(p => p.id === playerId);
        const currentOrder = player.order;
        const newOrder = currentOrder + direction;
        
        if (newOrder < 1 || newOrder > this.players.length) return;
        
        // Encontrar jogador na posição de destino
        const otherPlayer = this.players.find(p => p.order === newOrder);
        if (otherPlayer) {
            otherPlayer.order = currentOrder;
        }
        player.order = newOrder;
        
        this.showPlayerOrderModal(); // Re-render
        this.renderPlayersCards();
    }
    
    startDiceOrderRoll() {
        const activePlayers = this.players.filter(p => !p.isBankrupt);
        
        const content = `
            <div style="text-align: center;">
                <p style="color: var(--text-secondary); margin-bottom: var(--space-5);">
                    Cada jogador vai rolar os dados.<br>Quem tirar mais começa primeiro!
                </p>
                
                <div id="dice-order-results" style="margin-bottom: var(--space-5);">
                    ${activePlayers.map(player => `
                        <div id="dice-roll-${player.id}" style="
                            display: flex;
                            align-items: center;
                            justify-content: space-between;
                            padding: var(--space-4);
                            background: var(--bg-tertiary);
                            border-radius: var(--radius-md);
                            margin-bottom: var(--space-3);
                        ">
                            <div style="display: flex; align-items: center; gap: var(--space-3);">
                                <div class="player-avatar" style="background: ${player.color}; width: 40px; height: 40px;">${this.getPlayerDisplay(player)}</div>
                                <span style="font-weight: 600;">${player.name}</span>
                            </div>
                            <div id="dice-result-${player.id}" style="font-size: 1.5rem; font-weight: 800; color: var(--text-muted);">
                                —
                            </div>
                        </div>
                    `).join('')}
                </div>
                
                <button class="btn btn-primary btn-lg btn-full" id="roll-all-dice-btn" onclick="app.rollAllDiceForOrder()">
                    🎲 Rolar para Todos
                </button>
                
                <div id="dice-order-confirm" class="hidden" style="margin-top: var(--space-5);">
                    <button class="btn btn-primary btn-full" onclick="app.closeModal()">
                        ✅ Confirmar Nova Ordem
                    </button>
                </div>
            </div>
        `;
        
        this.openModal('🎲 Sorteio de Ordem', content);
    }
    
    rollAllDiceForOrder() {
        const activePlayers = this.players.filter(p => !p.isBankrupt);
        const results = [];
        
        // Rolar dados para cada jogador com delay para animação
        activePlayers.forEach((player, index) => {
            setTimeout(() => {
                const roll1 = Math.floor(Math.random() * 6) + 1;
                const roll2 = Math.floor(Math.random() * 6) + 1;
                const total = roll1 + roll2;
                
                results.push({ player, total, roll1, roll2 });
                
                const resultEl = document.getElementById(`dice-result-${player.id}`);
                if (resultEl) {
                    resultEl.innerHTML = `
                        <span style="font-size: 1.25rem;">${this.getDiceFace(roll1)}${this.getDiceFace(roll2)}</span>
                        <span style="margin-left: 8px; color: var(--primary);">${total}</span>
                    `;
                    resultEl.style.color = 'var(--text-primary)';
                }
                
                // Quando todos terminarem
                if (results.length === activePlayers.length) {
                    this.finalizeDiceOrder(results);
                }
            }, index * 400);
        });
        
        // Desabilitar botão
        const btn = document.getElementById('roll-all-dice-btn');
        if (btn) {
            btn.disabled = true;
            btn.textContent = 'Rolando...';
        }
    }
    
    finalizeDiceOrder(results) {
        // Ordenar por resultado (maior primeiro), com desempate aleatório
        results.sort((a, b) => {
            if (b.total !== a.total) return b.total - a.total;
            return Math.random() - 0.5;
        });
        
        // Aplicar nova ordem
        results.forEach((result, index) => {
            result.player.order = index + 1;
            
            // Destacar visualmente
            const rowEl = document.getElementById(`dice-roll-${result.player.id}`);
            if (rowEl) {
                rowEl.style.background = index === 0 ? 'var(--gold-bg)' : 'var(--bg-tertiary)';
                rowEl.style.borderLeft = `4px solid ${index === 0 ? 'var(--gold)' : 'transparent'}`;
                
                // Adicionar posição
                const resultEl = document.getElementById(`dice-result-${result.player.id}`);
                if (resultEl) {
                    resultEl.innerHTML += `<span style="margin-left: 12px; font-size: 0.875rem; color: var(--text-muted);">${index + 1}º</span>`;
                }
            }
        });
        
        // Mostrar botão de confirmar
        document.getElementById('dice-order-confirm')?.classList.remove('hidden');
        
        // Esconder botão de rolar
        const rollBtn = document.getElementById('roll-all-dice-btn');
        if (rollBtn) rollBtn.classList.add('hidden');
        
        this.addToHistory('🎲', 'Ordem sorteada com dados', null);
        this.renderPlayersCards();
        
        this.showToast(`${results[0].player.name} começa primeiro!`, 'success');
    }
    
    // ==========================================
    // GAME CONTROL
    // ==========================================
    
    startGame() {
        if (this.players.length < 2) return;
        
        // Aplicar configurações do modo de jogo
        this.players.forEach(p => {
            p.balance = this.gameModeSettings.initialMoney;
        });
        
        // Modo Turbo: distribuir propriedades iniciais
        if (this.gameModeSettings.startWithProperties) {
            this.distributeInitialProperties();
        }
        
        document.getElementById('setup-screen').classList.remove('active');
        document.getElementById('game-screen').classList.add('active');
        
        // Atualizar badge do modo
        const modeBadge = document.getElementById('current-mode-badge');
        if (modeBadge) {
            modeBadge.innerHTML = `Modo: <strong>${this.gameModeSettings.name}</strong>`;
        }
        
        this.renderPlayersCards();
        this.renderProperties();
        this.addToHistory('🎮', `Partida iniciada - Modo ${this.gameModeSettings.name}!`, null);
        
        lucide.createIcons();
        
        // Salvar partida
        this.autoSave();
    }
    
    distributeInitialProperties() {
        // Embaralhar propriedades disponíveis (exceto ferrovias e utilities)
        const availableProps = this.properties.filter(p => !p.isRailroad && !p.isUtility);
        const shuffled = this.shuffleArray([...availableProps]);
        
        // Dar 2 propriedades para cada jogador
        this.players.forEach((player, index) => {
            for (let i = 0; i < 2; i++) {
                const propIndex = index * 2 + i;
                if (shuffled[propIndex]) {
                    player.properties.push(shuffled[propIndex].id);
                }
            }
        });
    }
    
    newGame() {
        if (confirm('Tem certeza que deseja iniciar uma nova partida?')) {
            // Limpar partida salva
            this.clearSavedGame();
            
            this.players = [];
            this.properties = JSON.parse(JSON.stringify(PROPERTIES));
            this.history = [];
            this.selectedPlayer = null;
            this.usedColors = [];
            this.usedPieces = [];
            this.selectedPiece = null;
            this.selectedColor = null;
            this.gameMode = 'classic';
            this.gameModeSettings = GAME_MODES.classic;
            this.chanceCards = this.shuffleArray([...CHANCE_CARDS]);
            this.chestCards = this.shuffleArray([...COMMUNITY_CHEST_CARDS]);
            
            document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
            document.getElementById('setup-screen').classList.add('active');
            
            this.renderPlayersSetup();
            this.updateColorPicker();
            this.renderPiecePicker();
            this.renderGameModeSelection();
            this.selectFirstAvailableColor();
            this.toggleSideMenu();
        }
    }
    
    resetMoney() {
        if (confirm('Resetar dinheiro de todos para $1.500?')) {
            this.players.forEach(player => {
                player.balance = INITIAL_MONEY;
                player.isBankrupt = false;
            });
            this.renderPlayersCards();
            this.addToHistory('💵', 'Dinheiro resetado', null);
            this.toggleSideMenu();
        }
    }
    
    // ==========================================
    // RENDER PLAYER CARDS
    // ==========================================
    
    renderPlayersCards() {
        const container = document.getElementById('players-cards');
        const sortedPlayers = [...this.players].sort((a, b) => a.order - b.order);
        
        container.innerHTML = sortedPlayers.map(player => {
            const playerProps = this.properties.filter(p => player.properties.includes(p.id));
            const groups = this.getPlayerGroups(player);
            const railroads = playerProps.filter(p => p.isRailroad);
            const utilities = playerProps.filter(p => p.isUtility);
            
            return `
                <div class="player-card ${player.isBankrupt ? 'bankrupt' : ''} ${this.selectedPlayer?.id === player.id ? 'selected' : ''}" 
                     style="--player-color: ${player.color}"
                     data-player-id="${player.id}"
                     onclick="app.selectPlayerCard(${player.id})">
                    
                    <div class="player-card-header">
                        <div class="player-avatar" style="background: ${player.color}">${this.getPlayerDisplay(player)}</div>
                        <div class="player-info">
                            <div class="player-name">${player.name}</div>
                            <div class="player-order">${player.order}º jogador</div>
                        </div>
                        <div class="player-balance ${player.balance < 0 ? 'negative' : ''}" id="balance-${player.id}">
                            $${this.formatMoney(player.balance)}
                        </div>
                    </div>
                    
                    <div class="player-card-body">
                        <div class="player-stats">
                            <div class="stat-item">
                                <span class="stat-icon">🏠</span>
                                <span>${playerProps.length} propriedade${playerProps.length !== 1 ? 's' : ''}</span>
                            </div>
                            ${railroads.length > 0 ? `
                                <div class="stat-item">
                                    <span class="stat-icon">🚂</span>
                                    <span>${railroads.length}/4</span>
                                </div>
                            ` : ''}
                            ${utilities.length > 0 ? `
                                <div class="stat-item">
                                    <span class="stat-icon">💡</span>
                                    <span>${utilities.length}/2</span>
                                </div>
                            ` : ''}
                        </div>
                        
                        ${groups.complete.length > 0 ? `
                            <div class="player-badges">
                                ${groups.complete.map(g => `
                                    <div class="badge badge-monopoly">
                                        <span class="badge-dot" style="background: ${g.color}"></span>
                                        Monopólio
                                    </div>
                                `).join('')}
                            </div>
                        ` : ''}
                        
                        ${playerProps.length > 0 ? `
                            <div class="properties-mini-list">
                                ${playerProps.slice(0, 5).map(prop => `
                                    <div class="prop-mini-item" style="--prop-color: ${prop.color}" 
                                         onclick="event.stopPropagation(); app.showPropertyManageModal(${prop.id})">
                                        <span class="prop-mini-name">${prop.name}</span>
                                        ${!prop.isRailroad && !prop.isUtility && (prop.houses || 0) > 0 ? `
                                            <div class="prop-mini-houses">
                                                ${prop.houses === 5 ? '<div class="mini-hotel"></div>' : 
                                                  Array(prop.houses).fill('<div class="mini-house"></div>').join('')}
                                            </div>
                                        ` : ''}
                                        <span class="prop-mini-rent">$${this.calculateRent(prop, player)}</span>
                                    </div>
                                `).join('')}
                                ${playerProps.length > 5 ? `
                                    <div class="prop-mini-item" style="background: transparent; border: none; justify-content: center; cursor: default;">
                                        <span style="color: var(--text-muted); font-size: 0.75rem;">+${playerProps.length - 5} mais</span>
                                    </div>
                                ` : ''}
                            </div>
                        ` : ''}
                    </div>
                </div>
            `;
        }).join('');
    }
    
    // Calcular grupos de propriedades do jogador
    getPlayerGroups(player) {
        const playerProps = this.properties.filter(p => player.properties.includes(p.id));
        const groups = {};
        
        playerProps.forEach(prop => {
            if (prop.isRailroad || prop.isUtility) return;
            if (!groups[prop.group]) {
                groups[prop.group] = { 
                    color: prop.color, 
                    owned: 0, 
                    total: this.properties.filter(p => p.group === prop.group).length 
                };
            }
            groups[prop.group].owned++;
        });
        
        return {
            all: groups,
            complete: Object.entries(groups)
                .filter(([_, g]) => g.owned === g.total)
                .map(([name, g]) => ({ name, ...g })),
            partial: Object.entries(groups)
                .filter(([_, g]) => g.owned < g.total)
                .map(([name, g]) => ({ name, ...g }))
        };
    }
    
    // Calcular aluguel baseado em casas, monopólio, ferrovias, etc.
    calculateRent(property, owner) {
        if (property.isRailroad) {
            const railroadCount = this.properties
                .filter(p => p.isRailroad && owner.properties.includes(p.id)).length;
            return property.rent[railroadCount - 1] || 25;
        }
        
        if (property.isUtility) {
            const utilityCount = this.properties
                .filter(p => p.isUtility && owner.properties.includes(p.id)).length;
            // Retorna multiplicador (4x ou 10x dado)
            return utilityCount === 2 ? '10×🎲' : '4×🎲';
        }
        
        // Propriedade normal
        const houses = property.houses || 0;
        let rent = property.rent[houses];
        
        // Verificar monopólio (dobra aluguel se não tiver casas)
        if (houses === 0) {
            const groupProps = this.properties.filter(p => p.group === property.group);
            const ownsAll = groupProps.every(p => owner.properties.includes(p.id));
            if (ownsAll) {
                rent = rent * 2;
            }
        }
        
        return rent;
    }
    
    // Modal de gerenciamento de propriedade
    showPropertyManageModal(propertyId) {
        const prop = this.properties.find(p => p.id === propertyId);
        const owner = this.players.find(p => p.properties.includes(propertyId));
        
        if (!owner) {
            this.showPropertyModal(propertyId);
            return;
        }
        
        const currentRent = this.calculateRent(prop, owner);
        const groups = this.getPlayerGroups(owner);
        const hasMonopoly = groups.complete.some(g => g.name === prop.group);
        
        // Para ferrovias
        if (prop.isRailroad) {
            const railroadCount = this.properties
                .filter(p => p.isRailroad && owner.properties.includes(p.id)).length;
            
            const content = `
                <div class="property-manage-header" style="background: var(--bg-tertiary); --prop-color: ${prop.color}">
                    <h4>🚂 ${prop.name}</h4>
                    <p style="color: var(--text-secondary); font-size: 0.875rem;">Dono: ${owner.icon} ${owner.name}</p>
                    <div class="owner-balance-display">
                        Saldo: <strong class="${owner.balance < 0 ? 'negative' : ''}">$${this.formatMoney(owner.balance)}</strong>
                    </div>
                </div>
                
                <p class="rent-table-title">Tabela de Aluguéis:</p>
                <div class="rent-table">
                    <div class="rent-row ${railroadCount === 1 ? 'active' : ''}">
                        <span class="rent-label">1 ferrovia</span>
                        <span class="rent-value">$${prop.rent[0]}</span>
                    </div>
                    <div class="rent-row ${railroadCount === 2 ? 'active' : ''}">
                        <span class="rent-label">2 ferrovias</span>
                        <span class="rent-value">$${prop.rent[1]}</span>
                    </div>
                    <div class="rent-row ${railroadCount === 3 ? 'active' : ''}">
                        <span class="rent-label">3 ferrovias</span>
                        <span class="rent-value">$${prop.rent[2]}</span>
                    </div>
                    <div class="rent-row ${railroadCount === 4 ? 'active' : ''}">
                        <span class="rent-label">4 ferrovias</span>
                        <span class="rent-value">$${prop.rent[3]}</span>
                    </div>
                </div>
                
                <button class="btn btn-danger btn-full mt-4" onclick="app.sellProperty(${prop.id})">
                    Vender por $${Math.floor(prop.price / 2)}
                </button>
            `;
            
            this.openModal('Ferrovia', content);
            return;
        }
        
        // Para utilities
        if (prop.isUtility) {
            const utilityCount = this.properties
                .filter(p => p.isUtility && owner.properties.includes(p.id)).length;
            
            const content = `
                <div class="property-manage-header" style="background: var(--bg-tertiary); --prop-color: ${prop.color}">
                    <h4>💡 ${prop.name}</h4>
                    <p style="color: var(--text-secondary); font-size: 0.875rem;">Dono: ${owner.icon} ${owner.name}</p>
                    <div class="owner-balance-display">
                        Saldo: <strong class="${owner.balance < 0 ? 'negative' : ''}">$${this.formatMoney(owner.balance)}</strong>
                    </div>
                </div>
                
                <p class="rent-table-title">Tabela de Aluguéis:</p>
                <div class="rent-table">
                    <div class="rent-row ${utilityCount === 1 ? 'active' : ''}">
                        <span class="rent-label">1 companhia</span>
                        <span class="rent-value">4× dado</span>
                    </div>
                    <div class="rent-row ${utilityCount === 2 ? 'active' : ''}">
                        <span class="rent-label">2 companhias</span>
                        <span class="rent-value">10× dado</span>
                    </div>
                </div>
                
                <button class="btn btn-danger btn-full mt-4" onclick="app.sellProperty(${prop.id})">
                    Vender por $${Math.floor(prop.price / 2)}
                </button>
            `;
            
            this.openModal('Companhia', content);
            return;
        }
        
        // Propriedade normal - ESTILO DA IMAGEM
        const houses = prop.houses || 0;
        
        const content = `
            <div class="property-manage-header" style="background: var(--bg-tertiary); --prop-color: ${prop.color}">
                <h4>${prop.name}</h4>
                <p style="color: var(--text-secondary); font-size: 0.875rem;">Dono: ${owner.icon} ${owner.name}</p>
                <div class="owner-balance-display">
                    Saldo: <strong class="${owner.balance < 0 ? 'negative' : ''}">$${this.formatMoney(owner.balance)}</strong>
                </div>
            </div>
            
            ${hasMonopoly ? `
                <div class="monopoly-notice">
                    ✨ Você tem o monopólio deste grupo!
                </div>
            ` : ''}
            
            <!-- Visualização de casas -->
            <div class="houses-visual">
                ${houses === 5 ? `
                    <div class="house-slot hotel">🏨</div>
                ` : `
                    ${[0,1,2,3].map(i => `
                        <div class="house-slot ${i < houses ? 'filled' : ''}">
                            ${i < houses ? '🏠' : ''}
                        </div>
                    `).join('')}
                `}
            </div>
            
            <!-- Tabela de aluguéis - ESTILO LIMPO COMO A IMAGEM -->
            <p class="rent-table-title">Tabela de Aluguéis:</p>
            <div class="rent-table">
                <div class="rent-row ${houses === 0 && !hasMonopoly ? 'active' : ''}">
                    <span class="rent-label">Sem casas</span>
                    <span class="rent-value">$${prop.rent[0]}</span>
                </div>
                <div class="rent-row ${houses === 0 && hasMonopoly ? 'active' : ''}">
                    <span class="rent-label">Monopólio (sem casas)</span>
                    <span class="rent-value">$${prop.rent[0] * 2}</span>
                </div>
                <div class="rent-row ${houses === 1 ? 'active' : ''}">
                    <span class="rent-label">1 casa</span>
                    <span class="rent-value">$${prop.rent[1]}</span>
                </div>
                <div class="rent-row ${houses === 2 ? 'active' : ''}">
                    <span class="rent-label">2 casas</span>
                    <span class="rent-value">$${prop.rent[2]}</span>
                </div>
                <div class="rent-row ${houses === 3 ? 'active' : ''}">
                    <span class="rent-label">3 casas</span>
                    <span class="rent-value">$${prop.rent[3]}</span>
                </div>
                <div class="rent-row ${houses === 4 ? 'active' : ''}">
                    <span class="rent-label">4 casas</span>
                    <span class="rent-value">$${prop.rent[4]}</span>
                </div>
                <div class="rent-row hotel-row ${houses === 5 ? 'active' : ''}">
                    <span class="rent-label">🏨 Hotel</span>
                    <span class="rent-value">$${prop.rent[5]}</span>
                </div>
            </div>
            
            <!-- Ações -->
            <div style="display: flex; flex-direction: column; gap: 10px; margin-top: 16px;">
                ${hasMonopoly ? `
                    ${houses < 5 ? `
                        <button class="btn btn-primary btn-full" onclick="app.buildHouse(${prop.id})">
                            🏠 Construir ${houses === 4 ? 'Hotel' : 'Casa'} ($${prop.houseCost})
                        </button>
                    ` : ''}
                    ${houses > 0 ? `
                        <button class="btn btn-secondary btn-full" onclick="app.sellHouse(${prop.id})">
                            💰 Vender ${houses === 5 ? 'Hotel' : 'Casa'} (+$${Math.floor(prop.houseCost / 2)})
                        </button>
                    ` : ''}
                ` : `
                    <div class="monopoly-notice" style="background: var(--warning-bg); color: var(--warning);">
                        ⚠️ Complete o monopólio para construir casas!
                    </div>
                `}
                <button class="btn btn-danger btn-full" onclick="app.sellProperty(${prop.id})">
                    Vender Propriedade ($${Math.floor(prop.price / 2) + (houses * Math.floor(prop.houseCost / 2))})
                </button>
            </div>
        `;
        
        this.openModal('Gerenciar Propriedade', content);
    }
    
    selectPlayerCard(playerId) {
        const player = this.players.find(p => p.id === playerId);
        if (player.isBankrupt) return;
        
        this.selectedPlayer = this.selectedPlayer?.id === playerId ? null : player;
        this.renderPlayersCards();
    }
    
    // ==========================================
    // QUICK ACTIONS
    // ==========================================
    
    handleQuickAction(action) {
        switch (action) {
            case 'transfer': this.showTransferModal(); break;
            case 'pay-bank': this.showPayBankModal(); break;
            case 'receive-bank': this.showReceiveFromBankModal(); break;
            case 'salary': this.paySalary(); break;
            case 'dice': this.showDiceScreen(); break;
            case 'negotiate': this.showNegotiationModal(); break;
            case 'auction': this.showAuctionStartModal(); break;
            case 'player-order': this.showPlayerOrderModal(); break;
        }
    }
    
    // ==========================================
    // DICE FUNCTIONALITY
    // ==========================================
    
    showDiceScreen() {
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        document.getElementById('dice-screen').classList.add('active');
        this.updateDiceDisplay();
    }
    
    setDiceCount(count) {
        this.diceCount = count;
        document.querySelectorAll('.dice-option-btn').forEach(btn => {
            btn.classList.toggle('active', parseInt(btn.dataset.dice) === count);
        });
        this.updateDiceDisplay();
    }
    
    updateDiceDisplay() {
        document.getElementById('dice-2').classList.toggle('hidden', this.diceCount !== 2);
    }
    
    rollDice() {
        const dice1 = document.getElementById('dice-1');
        const dice2 = document.getElementById('dice-2');
        const total = document.getElementById('dice-total');
        const doubles = document.getElementById('doubles-indicator');
        
        dice1.classList.add('rolling');
        if (this.diceCount === 2) dice2.classList.add('rolling');
        
        setTimeout(() => {
            const roll1 = Math.floor(Math.random() * 6) + 1;
            const roll2 = this.diceCount === 2 ? Math.floor(Math.random() * 6) + 1 : 0;
            
            this.lastDiceRoll = [roll1, roll2];
            
            dice1.textContent = this.getDiceFace(roll1);
            if (this.diceCount === 2) dice2.textContent = this.getDiceFace(roll2);
            
            dice1.classList.remove('rolling');
            dice2.classList.remove('rolling');
            
            const sum = roll1 + roll2;
            total.innerHTML = `${sum}<span>Total</span>`;
            
            doubles.classList.toggle('hidden', !(this.diceCount === 2 && roll1 === roll2));
            
            const historyMsg = this.diceCount === 2 
                ? `Dados: ${roll1} + ${roll2} = ${sum}${roll1 === roll2 ? ' (DUPLA!)' : ''}`
                : `Dado: ${roll1}`;
            this.addToHistory('🎲', historyMsg, null);
        }, 600);
    }
    
    getDiceFace(number) {
        return ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'][number - 1] || '?';
    }
    
    // ==========================================
    // TRANSFER
    // ==========================================
    
    showTransferModal() {
        const activePlayers = this.players.filter(p => !p.isBankrupt);
        if (activePlayers.length < 2) {
            this.showToast('Precisa de pelo menos 2 jogadores!', 'warning');
            return;
        }
        
        const content = `
            <div class="modal-form-group">
                <label>De quem:</label>
                <div class="player-select-grid" id="from-player-select">
                    ${activePlayers.map(p => `
                        <div class="player-select-option" data-player-id="${p.id}" onclick="app.selectFromPlayer(${p.id})">
                            <div class="player-avatar" style="background: ${p.color}">${p.icon}</div>
                            <div>${p.name}</div>
                            <small style="color: var(--text-muted)">$${this.formatMoney(p.balance)}</small>
                        </div>
                    `).join('')}
                </div>
            </div>
            <div class="modal-form-group">
                <label>Para quem:</label>
                <div class="player-select-grid" id="to-player-select">
                    ${activePlayers.map(p => `
                        <div class="player-select-option" data-player-id="${p.id}" onclick="app.selectToPlayer(${p.id})">
                            <div class="player-avatar" style="background: ${p.color}">${p.icon}</div>
                            <div>${p.name}</div>
                            <small style="color: var(--text-muted)">$${this.formatMoney(p.balance)}</small>
                        </div>
                    `).join('')}
                </div>
            </div>
            <div class="modal-form-group">
                <label>Valor ($):</label>
                <input type="number" id="transfer-amount" min="0" value="0" />
                <div class="quick-amounts">
                    ${QUICK_AMOUNTS.map(a => `<button class="quick-amount-btn" onclick="app.addToAmount('transfer-amount', ${a})">+$${a}</button>`).join('')}
                    <button class="quick-amount-btn clear-btn" onclick="app.clearAmount('transfer-amount')">
                        <i data-lucide="rotate-ccw"></i> Zerar
                    </button>
                </div>
            </div>
            <button class="btn btn-primary btn-full btn-lg" onclick="app.executeTransfer()">
                <i data-lucide="send"></i> Transferir
            </button>
        `;
        
        this.openModal('💸 Transferência', content);
        this.transferFrom = null;
        this.transferTo = null;
    }
    
    selectFromPlayer(id) {
        this.transferFrom = id;
        document.querySelectorAll('#from-player-select .player-select-option').forEach(opt => {
            opt.classList.toggle('selected', parseInt(opt.dataset.playerId) === id);
        });
    }
    
    selectToPlayer(id) {
        this.transferTo = id;
        document.querySelectorAll('#to-player-select .player-select-option').forEach(opt => {
            opt.classList.toggle('selected', parseInt(opt.dataset.playerId) === id);
        });
    }
    
    executeTransfer() {
        const amount = parseInt(document.getElementById('transfer-amount').value);
        
        if (!this.transferFrom || !this.transferTo) return this.showToast('Selecione os jogadores!', 'warning');
        if (this.transferFrom === this.transferTo) return this.showToast('Selecione jogadores diferentes!', 'warning');
        if (!amount || amount <= 0) return this.showToast('Digite um valor válido!', 'warning');
        
        const from = this.players.find(p => p.id === this.transferFrom);
        const to = this.players.find(p => p.id === this.transferTo);
        
        from.balance -= amount;
        to.balance += amount;
        
        this.checkBankruptcy(from);
        this.addToHistory('💸', `${from.name} → ${to.name}`, -amount, from);
        this.addToHistory('💰', `${from.name} → ${to.name}`, amount, to);
        
        this.renderPlayersCards();
        this.closeModal();
        this.showToast(`$${amount} transferidos!`, 'success');
    }
    
    // ==========================================
    // PAY/RECEIVE BANK
    // ==========================================
    
    showPayBankModal() {
        const activePlayers = this.players.filter(p => !p.isBankrupt);
        
        const content = `
            <div class="modal-form-group">
                <label>Jogador:</label>
                <div class="player-select-grid" id="pay-player-select">
                    ${activePlayers.map(p => `
                        <div class="player-select-option ${this.selectedPlayer?.id === p.id ? 'selected' : ''}" 
                             data-player-id="${p.id}" onclick="app.selectPayPlayer(${p.id})">
                            <div class="player-avatar" style="background: ${p.color}">${p.icon}</div>
                            <div>${p.name}</div>
                            <small style="color: var(--text-muted)">$${this.formatMoney(p.balance)}</small>
                        </div>
                    `).join('')}
                </div>
            </div>
            <div class="modal-form-group">
                <label>Valor ($):</label>
                <input type="number" id="pay-amount" min="0" value="0" />
                <div class="quick-amounts">
                    ${QUICK_AMOUNTS.map(a => `<button class="quick-amount-btn" onclick="app.addToAmount('pay-amount', ${a})">+$${a}</button>`).join('')}
                    <button class="quick-amount-btn clear-btn" onclick="app.clearAmount('pay-amount')">
                        <i data-lucide="rotate-ccw"></i> Zerar
                    </button>
                </div>
            </div>
            <div class="modal-form-group">
                <label>Motivo (opcional):</label>
                <input type="text" id="pay-reason" placeholder="Ex: Imposto, Aluguel..." />
            </div>
            <button class="btn btn-primary btn-full mt-5" onclick="app.executePayBank()">🏦 Pagar ao Banco</button>
        `;
        
        this.openModal('🏦 Pagar ao Banco', content);
        this.payPlayer = this.selectedPlayer?.id || null;
    }
    
    selectPayPlayer(id) {
        this.payPlayer = id;
        document.querySelectorAll('#pay-player-select .player-select-option').forEach(opt => {
            opt.classList.toggle('selected', parseInt(opt.dataset.playerId) === id);
        });
    }
    
    executePayBank() {
        const amount = parseInt(document.getElementById('pay-amount').value);
        const reason = document.getElementById('pay-reason').value || 'Pagamento';
        
        if (!this.payPlayer) return this.showToast('Selecione um jogador!', 'warning');
        if (!amount || amount <= 0) return this.showToast('Digite um valor válido!', 'warning');
        
        const player = this.players.find(p => p.id === this.payPlayer);
        player.balance -= amount;
        
        this.checkBankruptcy(player);
        this.addToHistory('🏦', `${player.name}: ${reason}`, -amount, player);
        this.renderPlayersCards();
        this.closeModal();
        this.showToast(`${player.name} pagou $${amount}`, 'success');
    }
    
    showReceiveFromBankModal() {
        const activePlayers = this.players.filter(p => !p.isBankrupt);
        
        const content = `
            <div class="modal-form-group">
                <label>Jogador:</label>
                <div class="player-select-grid" id="receive-player-select">
                    ${activePlayers.map(p => `
                        <div class="player-select-option ${this.selectedPlayer?.id === p.id ? 'selected' : ''}" 
                             data-player-id="${p.id}" onclick="app.selectReceivePlayer(${p.id})">
                            <div class="player-avatar" style="background: ${p.color}">${p.icon}</div>
                            <div>${p.name}</div>
                            <small style="color: var(--text-muted)">$${this.formatMoney(p.balance)}</small>
                        </div>
                    `).join('')}
                </div>
            </div>
            <div class="modal-form-group">
                <label>Valor ($):</label>
                <input type="number" id="receive-amount" min="0" value="0" />
                <div class="quick-amounts">
                    ${QUICK_AMOUNTS.map(a => `<button class="quick-amount-btn" onclick="app.addToAmount('receive-amount', ${a})">+$${a}</button>`).join('')}
                    <button class="quick-amount-btn clear-btn" onclick="app.clearAmount('receive-amount')">
                        <i data-lucide="rotate-ccw"></i> Zerar
                    </button>
                </div>
            </div>
            <div class="modal-form-group">
                <label>Motivo (opcional):</label>
                <input type="text" id="receive-reason" placeholder="Ex: Prêmio, Bônus..." />
            </div>
            <button class="btn btn-primary btn-full mt-5" onclick="app.executeReceiveBank()">💰 Receber</button>
        `;
        
        this.openModal('💰 Receber do Banco', content);
        this.receivePlayer = this.selectedPlayer?.id || null;
    }
    
    selectReceivePlayer(id) {
        this.receivePlayer = id;
        document.querySelectorAll('#receive-player-select .player-select-option').forEach(opt => {
            opt.classList.toggle('selected', parseInt(opt.dataset.playerId) === id);
        });
    }
    
    executeReceiveBank() {
        const amount = parseInt(document.getElementById('receive-amount').value);
        const reason = document.getElementById('receive-reason').value || 'Recebimento';
        
        if (!this.receivePlayer) return this.showToast('Selecione um jogador!', 'warning');
        if (!amount || amount <= 0) return this.showToast('Digite um valor válido!', 'warning');
        
        const player = this.players.find(p => p.id === this.receivePlayer);
        player.balance += amount;
        if (player.isBankrupt && player.balance > 0) player.isBankrupt = false;
        
        this.addToHistory('💰', `${player.name}: ${reason}`, amount, player);
        this.renderPlayersCards();
        this.closeModal();
        this.showToast(`${player.name} recebeu $${amount}`, 'success');
    }
    
    paySalary() {
        if (!this.selectedPlayer) return this.showToast('Selecione um jogador!', 'warning');
        
        const salary = this.gameModeSettings.salary;
        this.selectedPlayer.balance += salary;
        this.addToHistory('🚀', `${this.selectedPlayer.name}: Salário`, salary, this.selectedPlayer);
        this.renderPlayersCards();
        this.showToast(`${this.selectedPlayer.name} recebeu $${salary}!`, 'success');
    }
    
    // ==========================================
    // NEGOTIATION
    // ==========================================
    
    showNegotiationModal() {
        const activePlayers = this.players.filter(p => !p.isBankrupt);
        if (activePlayers.length < 2) return this.showToast('Precisa de 2+ jogadores!', 'warning');
        
        const content = `
            <p style="text-align: center; color: var(--text-secondary); margin-bottom: var(--space-5);">
                Selecione os dois jogadores que vão negociar
            </p>
            <div class="modal-form-group">
                <label>Jogador 1:</label>
                <div class="player-select-grid" id="neg-player1-select">
                    ${activePlayers.map(p => `
                        <div class="player-select-option" data-player-id="${p.id}" onclick="app.selectNegPlayer1(${p.id})">
                            <div class="player-avatar" style="background: ${p.color}">${p.icon}</div>
                            <div>${p.name}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
            <div class="modal-form-group">
                <label>Jogador 2:</label>
                <div class="player-select-grid" id="neg-player2-select">
                    ${activePlayers.map(p => `
                        <div class="player-select-option" data-player-id="${p.id}" onclick="app.selectNegPlayer2(${p.id})">
                            <div class="player-avatar" style="background: ${p.color}">${p.icon}</div>
                            <div>${p.name}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
            <button class="btn btn-primary btn-full mt-5" onclick="app.startNegotiation()">🤝 Iniciar Negociação</button>
        `;
        
        this.openModal('🤝 Nova Negociação', content);
        this.negotiation.player1 = null;
        this.negotiation.player2 = null;
    }
    
    selectNegPlayer1(id) {
        this.negotiation.player1 = id;
        document.querySelectorAll('#neg-player1-select .player-select-option').forEach(opt => {
            opt.classList.toggle('selected', parseInt(opt.dataset.playerId) === id);
        });
    }
    
    selectNegPlayer2(id) {
        this.negotiation.player2 = id;
        document.querySelectorAll('#neg-player2-select .player-select-option').forEach(opt => {
            opt.classList.toggle('selected', parseInt(opt.dataset.playerId) === id);
        });
    }
    
    startNegotiation() {
        if (!this.negotiation.player1 || !this.negotiation.player2) 
            return this.showToast('Selecione os dois jogadores!', 'warning');
        if (this.negotiation.player1 === this.negotiation.player2) 
            return this.showToast('Selecione jogadores diferentes!', 'warning');
        
        this.negotiation.offer1 = { money: 0, properties: [] };
        this.negotiation.offer2 = { money: 0, properties: [] };
        this.renderNegotiationScreen();
    }
    
    renderNegotiationScreen() {
        const p1 = this.players.find(p => p.id === this.negotiation.player1);
        const p2 = this.players.find(p => p.id === this.negotiation.player2);
        const p1Props = this.properties.filter(prop => p1.properties.includes(prop.id));
        const p2Props = this.properties.filter(prop => p2.properties.includes(prop.id));
        
        const renderProp = (prop, num) => `
            <div style="
                display: flex; align-items: center; gap: 12px;
                padding: 12px 14px; margin-bottom: 8px;
                background: var(--bg-card); border-radius: 10px;
                border-left: 5px solid ${prop.color};
            ">
                <input type="checkbox" id="prop-${num}-${prop.id}"
                       ${this.negotiation[`offer${num}`].properties.includes(prop.id) ? 'checked' : ''} 
                       onchange="app.toggleNegProperty(${num}, ${prop.id})"
                       style="width: 20px; height: 20px; cursor: pointer;">
                <label for="prop-${num}-${prop.id}" style="flex: 1; cursor: pointer; font-weight: 500;">
                    ${prop.name}
                </label>
                <span style="color: var(--text-muted); font-size: 0.875rem;">$${prop.price}</span>
                <button onclick="event.stopPropagation(); app.showPropertyInfoPopup(${prop.id})" 
                        style="background: var(--bg-tertiary); border: none; width: 28px; height: 28px;
                               border-radius: 50%; cursor: pointer; font-size: 14px;">ℹ️</button>
            </div>
        `;
        
        const content = `
            <div class="negotiation-container">
                <div class="negotiation-side">
                    <h4 style="color: ${p1.color}; margin-bottom: 8px;">${p1.icon} ${p1.name}</h4>
                    <p style="font-size: 0.9375rem; color: var(--text-muted); margin-bottom: 16px;">
                        Saldo: $${this.formatMoney(p1.balance)}
                    </p>
                    <div class="modal-form-group">
                        <label>Oferece ($):</label>
                        <input type="number" id="neg-money-1" min="0" value="${this.negotiation.offer1.money}" 
                               onchange="app.updateNegMoney(1, this.value)">
                    </div>
                    ${p1Props.length > 0 ? `
                        <label style="font-size: 0.9375rem; color: var(--text-secondary); margin-bottom: 10px; display: block;">
                            Propriedades (${p1Props.length}):
                        </label>
                        <div style="max-height: 200px; overflow-y: auto;">
                            ${p1Props.map(prop => renderProp(prop, 1)).join('')}
                        </div>
                    ` : '<p style="color: var(--text-muted);">Sem propriedades</p>'}
                </div>
                
                <div class="negotiation-arrow">⇄</div>
                
                <div class="negotiation-side">
                    <h4 style="color: ${p2.color}; margin-bottom: 8px;">${p2.icon} ${p2.name}</h4>
                    <p style="font-size: 0.9375rem; color: var(--text-muted); margin-bottom: 16px;">
                        Saldo: $${this.formatMoney(p2.balance)}
                    </p>
                    <div class="modal-form-group">
                        <label>Oferece ($):</label>
                        <input type="number" id="neg-money-2" min="0" value="${this.negotiation.offer2.money}"
                               onchange="app.updateNegMoney(2, this.value)">
                    </div>
                    ${p2Props.length > 0 ? `
                        <label style="font-size: 0.9375rem; color: var(--text-secondary); margin-bottom: 10px; display: block;">
                            Propriedades (${p2Props.length}):
                        </label>
                        <div style="max-height: 200px; overflow-y: auto;">
                            ${p2Props.map(prop => renderProp(prop, 2)).join('')}
                        </div>
                    ` : '<p style="color: var(--text-muted);">Sem propriedades</p>'}
                </div>
            </div>
            
            <div style="display: flex; gap: 16px; margin-top: 28px;">
                <button class="btn btn-secondary btn-full" onclick="app.closeModal()">❌ Cancelar</button>
                <button class="btn btn-primary btn-full" onclick="app.executeNegotiation()">✅ Confirmar</button>
            </div>
        `;
        
        this.openModal('🤝 Negociação', content);
    }
    
    updateNegMoney(num, value) {
        this.negotiation[`offer${num}`].money = parseInt(value) || 0;
    }
    
    toggleNegProperty(num, propId) {
        const offer = this.negotiation[`offer${num}`];
        const idx = offer.properties.indexOf(propId);
        idx > -1 ? offer.properties.splice(idx, 1) : offer.properties.push(propId);
    }
    
    executeNegotiation() {
        const p1 = this.players.find(p => p.id === this.negotiation.player1);
        const p2 = this.players.find(p => p.id === this.negotiation.player2);
        const o1 = this.negotiation.offer1;
        const o2 = this.negotiation.offer2;
        
        if (o1.money > p1.balance) return this.showToast(`${p1.name} não tem dinheiro!`, 'danger');
        if (o2.money > p2.balance) return this.showToast(`${p2.name} não tem dinheiro!`, 'danger');
        if (!o1.money && !o1.properties.length && !o2.money && !o2.properties.length) 
            return this.showToast('Nada para trocar!', 'warning');
        
        p1.balance = p1.balance - o1.money + o2.money;
        p2.balance = p2.balance - o2.money + o1.money;
        
        o1.properties.forEach(id => {
            p1.properties = p1.properties.filter(pid => pid !== id);
            p2.properties.push(id);
        });
        o2.properties.forEach(id => {
            p2.properties = p2.properties.filter(pid => pid !== id);
            p1.properties.push(id);
        });
        
        this.addToHistory('🤝', `${p1.name} ⇄ ${p2.name}`, null);
        this.renderPlayersCards();
        this.renderProperties();
        this.closeModal();
        this.showToast('Negociação concluída!', 'success');
    }
    
    // ==========================================
    // AUCTION - SISTEMA SEQUENCIAL
    // ==========================================
    
    showAuctionStartModal() {
        const availableProps = this.properties.filter(prop => 
            !this.players.some(p => p.properties.includes(prop.id))
        );
        
        if (!availableProps.length) return this.showToast('Não há propriedades disponíveis!', 'warning');
        
        const content = `
            <div class="modal-form-group">
                <label>Propriedade para leilão:</label>
                <select id="auction-property-select">
                    <option value="">Escolha...</option>
                    ${availableProps.map(p => `<option value="${p.id}">${p.name} - $${p.price}</option>`).join('')}
                </select>
            </div>
            <div class="modal-form-group">
                <label>Lance mínimo ($):</label>
                <input type="number" id="auction-start-bid" min="1" value="10" />
            </div>
            <button class="btn btn-gold btn-full btn-lg mt-5" onclick="app.startAuction()">🔨 Iniciar Leilão</button>
        `;
        
        this.openModal('🔨 Novo Leilão', content);
    }
    
    startAuction() {
        const propId = parseInt(document.getElementById('auction-property-select').value);
        const startBid = parseInt(document.getElementById('auction-start-bid').value) || 10;
        
        if (!propId) return this.showToast('Selecione uma propriedade!', 'warning');
        
        this.auctionProperty = this.properties.find(p => p.id === propId);
        this.auctionBid = startBid;
        this.auctionBidder = null;
        this.auctionPassed = [];
        this.auctionActive = true;
        
        // Criar fila na ordem dos jogadores
        this.auctionQueue = [...this.players]
            .filter(p => !p.isBankrupt)
            .sort((a, b) => a.order - b.order)
            .map(p => p.id);
        this.auctionCurrentIndex = 0;
        
        this.renderAuctionScreen();
    }
    
    renderAuctionScreen() {
        const currentPlayerId = this.auctionQueue[this.auctionCurrentIndex];
        const currentPlayer = this.players.find(p => p.id === currentPlayerId);
        const activeBidders = this.auctionQueue.filter(id => !this.auctionPassed.includes(id));
        
        // Se só resta um e ele já deu lance, finaliza
        if (activeBidders.length === 1 && this.auctionBidder === activeBidders[0]) {
            this.endAuction();
            return;
        }
        
        // Se todos passaram
        if (activeBidders.length === 0) {
            this.endAuction();
            return;
        }
        
        const leader = this.auctionBidder ? this.players.find(p => p.id === this.auctionBidder) : null;
        
        const content = `
            <div class="auction-container">
                <!-- Propriedade em leilão -->
                <div class="auction-property" style="--prop-color: ${this.auctionProperty.color || '#6B7280'}">
                    <div class="auction-property-stripe"></div>
                    <div class="auction-property-body">
                        <div class="auction-property-icon">
                            ${this.auctionProperty.isRailroad ? '🚂' : this.auctionProperty.isUtility ? '💡' : '🏠'}
                        </div>
                        <div class="auction-property-info">
                            <div class="auction-property-name">${this.auctionProperty.name}</div>
                            <div class="auction-property-value">Valor de mercado: <strong>$${this.formatMoney(this.auctionProperty.price)}</strong></div>
                        </div>
                    </div>
                </div>
                
                <!-- Lance atual -->
                <div class="auction-bid-box">
                    <div class="auction-bid-current">
                        <span class="auction-bid-label">Lance Atual</span>
                        <span class="auction-bid-value">$${this.formatMoney(this.auctionBid)}</span>
                    </div>
                    ${leader ? `
                        <div class="auction-bid-leader">
                            <div class="leader-avatar" style="background: ${leader.color}">${this.getPlayerDisplay(leader)}</div>
                            <span class="leader-name">${leader.name}</span>
                            <span class="leader-badge">🏆 Líder</span>
                        </div>
                    ` : `
                        <div class="auction-no-bids">Aguardando primeiro lance...</div>
                    `}
                </div>
                
                <!-- Vez do jogador -->
                <div class="auction-turn">
                    <div class="auction-turn-header">
                        <i data-lucide="user" class="turn-icon"></i>
                        <span>Vez de jogar</span>
                    </div>
                    <div class="auction-turn-player">
                        <div class="turn-avatar" style="background: ${currentPlayer.color}">${this.getPlayerDisplay(currentPlayer)}</div>
                        <div class="turn-info">
                            <div class="turn-name">${currentPlayer.name}</div>
                            <div class="turn-balance">Saldo: <strong>$${this.formatMoney(currentPlayer.balance)}</strong></div>
                        </div>
                    </div>
                </div>
                
                <!-- Input de lance -->
                <div class="auction-input-section">
                    <label class="auction-input-label">Seu lance:</label>
                    <div class="auction-input-wrapper">
                        <span class="auction-input-prefix">$</span>
                        <input type="number" id="auction-bid-amount" 
                               min="${this.auctionBid + 1}" 
                               value="${Math.min(this.auctionBid + 10, currentPlayer.balance)}" 
                               max="${currentPlayer.balance}" 
                               class="auction-input" />
                    </div>
                    <div class="auction-quick-bids">
                        <button class="quick-bid-btn" onclick="document.getElementById('auction-bid-amount').value=${this.auctionBid + 10}">+$10</button>
                        <button class="quick-bid-btn" onclick="document.getElementById('auction-bid-amount').value=${this.auctionBid + 25}">+$25</button>
                        <button class="quick-bid-btn" onclick="document.getElementById('auction-bid-amount').value=${this.auctionBid + 50}">+$50</button>
                        <button class="quick-bid-btn" onclick="document.getElementById('auction-bid-amount').value=${this.auctionBid + 100}">+$100</button>
                    </div>
                </div>
                
                <!-- Botões de ação -->
                <div class="auction-action-buttons">
                    <button class="btn btn-gold btn-lg auction-bid-btn" onclick="app.placeBid()">
                        <i data-lucide="gavel"></i> Dar Lance
                    </button>
                    <button class="btn btn-secondary btn-lg auction-pass-btn" onclick="app.passBid()">
                        <i data-lucide="x"></i> Passar
                    </button>
                </div>
                
                <!-- Fila de jogadores -->
                <div class="auction-queue-section">
                    <div class="auction-queue-header">
                        <i data-lucide="users"></i>
                        <span>Participantes</span>
                    </div>
                    <div class="auction-queue-list">
                        ${this.auctionQueue.map((id, idx) => {
                            const player = this.players.find(p => p.id === id);
                            const passed = this.auctionPassed.includes(id);
                            const current = idx === this.auctionCurrentIndex;
                            const isLeader = this.auctionBidder === id;
                            return `
                                <div class="queue-item ${passed ? 'passed' : ''} ${current ? 'current' : ''} ${isLeader ? 'leader' : ''}">
                                    <div class="queue-avatar" style="background: ${player.color}">${this.getPlayerDisplay(player)}</div>
                                    <span class="queue-name">${player.name}</span>
                                    ${isLeader ? '<span class="queue-badge">🏆</span>' : ''}
                                    ${passed ? '<span class="queue-status">Passou</span>' : ''}
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
                
                <!-- Cancelar -->
                <button class="btn btn-outline btn-full auction-cancel-btn" onclick="app.cancelAuction()">
                    <i data-lucide="x-circle"></i> Cancelar Leilão
                </button>
            </div>
        `;
        
        if (typeof lucide !== 'undefined') {
            setTimeout(() => lucide.createIcons(), 10);
        }
        
        this.openModal('🔨 Leilão', content);
    }
    
    placeBid() {
        const amount = parseInt(document.getElementById('auction-bid-amount').value);
        const currentPlayerId = this.auctionQueue[this.auctionCurrentIndex];
        const player = this.players.find(p => p.id === currentPlayerId);
        
        if (amount <= this.auctionBid) return this.showToast('Lance deve ser maior!', 'warning');
        if (amount > player.balance) return this.showToast('Sem saldo suficiente!', 'danger');
        
        this.auctionBid = amount;
        this.auctionBidder = currentPlayerId;
        
        this.addToHistory('🔨', `${player.name}: lance $${amount}`, null, player);
        
        this.moveToNextBidder();
    }
    
    passBid() {
        const currentPlayerId = this.auctionQueue[this.auctionCurrentIndex];
        const player = this.players.find(p => p.id === currentPlayerId);
        
        this.auctionPassed.push(currentPlayerId);
        this.addToHistory('🔨', `${player.name} passou`, null, player);
        
        this.moveToNextBidder();
    }
    
    moveToNextBidder() {
        const activeBidders = this.auctionQueue.filter(id => !this.auctionPassed.includes(id));
        
        // Se só resta um jogador
        if (activeBidders.length <= 1) {
            if (this.auctionBidder) {
                this.endAuction();
            } else {
                this.showToast('Ninguém quis! Leilão cancelado.', 'warning');
                this.auctionActive = false;
                this.closeModal();
            }
            return;
        }
        
        // Próximo jogador que não passou
        do {
            this.auctionCurrentIndex = (this.auctionCurrentIndex + 1) % this.auctionQueue.length;
        } while (this.auctionPassed.includes(this.auctionQueue[this.auctionCurrentIndex]));
        
        this.renderAuctionScreen();
    }
    
    endAuction() {
        if (!this.auctionBidder) {
            this.showToast('Nenhum lance! Cancelado.', 'warning');
            this.auctionActive = false;
            this.closeModal();
            return;
        }
        
        const winner = this.players.find(p => p.id === this.auctionBidder);
        winner.balance -= this.auctionBid;
        winner.properties.push(this.auctionProperty.id);
        
        this.addToHistory('🏆', `${winner.name} ganhou ${this.auctionProperty.name}`, -this.auctionBid, winner);
        
        this.auctionActive = false;
        this.renderPlayersCards();
        this.renderProperties();
        this.closeModal();
        
        this.showToast(`🏆 ${winner.name} ganhou por $${this.auctionBid}!`, 'success');
    }
    
    cancelAuction() {
        if (confirm('Cancelar o leilão?')) {
            this.auctionActive = false;
            this.closeModal();
        }
    }
    
    // ==========================================
    // PROPERTIES
    // ==========================================
    
    renderProperties() {
        const container = document.getElementById('properties-list');
        container.innerHTML = this.properties.map(prop => {
            const owner = this.players.find(p => p.properties.includes(prop.id));
            return `
                <div class="property-item ${owner ? 'owned' : ''}" 
                     style="--property-color: ${prop.color}"
                     onclick="app.showPropertyModal(${prop.id})">
                    <div class="property-info">
                        <div class="property-name">${prop.name}</div>
                        <div class="property-price">
                            ${prop.isRailroad ? '🚂' : prop.isUtility ? '💡' : ''} $${prop.price}
                            ${owner ? ` • ${owner.name}` : ''}
                        </div>
                    </div>
                    ${owner ? `<div style="width: 16px; height: 16px; background: ${owner.color}; border-radius: 50%;"></div>` : ''}
                </div>
            `;
        }).join('');
    }
    
    filterProperties(filter) {
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.filter === filter);
        });
        
        document.querySelectorAll('.property-item').forEach(item => {
            const owned = item.classList.contains('owned');
            item.style.display = filter === 'all' ? '' : 
                                 filter === 'available' ? (owned ? 'none' : '') : 
                                 (owned ? '' : 'none');
        });
    }
    
    showPropertyModal(propertyId) {
        const prop = this.properties.find(p => p.id === propertyId);
        const owner = this.players.find(p => p.properties.includes(propertyId));
        const activePlayers = this.players.filter(p => !p.isBankrupt);
        
        // Gerar tabela de aluguéis bonita
        let rentTable = '';
        if (prop.isRailroad) {
            rentTable = `
                <p class="rent-table-title">Tabela de Aluguéis:</p>
                <div class="rent-table">
                    <div class="rent-row"><span class="rent-label">1 ferrovia</span><span class="rent-value">$25</span></div>
                    <div class="rent-row"><span class="rent-label">2 ferrovias</span><span class="rent-value">$50</span></div>
                    <div class="rent-row"><span class="rent-label">3 ferrovias</span><span class="rent-value">$100</span></div>
                    <div class="rent-row"><span class="rent-label">4 ferrovias</span><span class="rent-value">$200</span></div>
                </div>
            `;
        } else if (prop.isUtility) {
            rentTable = `
                <p class="rent-table-title">Tabela de Aluguéis:</p>
                <div class="rent-table">
                    <div class="rent-row"><span class="rent-label">1 companhia</span><span class="rent-value">4× dado</span></div>
                    <div class="rent-row"><span class="rent-label">2 companhias</span><span class="rent-value">10× dado</span></div>
                </div>
            `;
        } else {
            rentTable = `
                <p class="rent-table-title">Tabela de Aluguéis:</p>
                <div class="rent-table">
                    <div class="rent-row"><span class="rent-label">Sem casas</span><span class="rent-value">$${prop.rent[0]}</span></div>
                    <div class="rent-row"><span class="rent-label">Monopólio (sem casas)</span><span class="rent-value">$${prop.rent[0] * 2}</span></div>
                    <div class="rent-row"><span class="rent-label">1 casa</span><span class="rent-value">$${prop.rent[1]}</span></div>
                    <div class="rent-row"><span class="rent-label">2 casas</span><span class="rent-value">$${prop.rent[2]}</span></div>
                    <div class="rent-row"><span class="rent-label">3 casas</span><span class="rent-value">$${prop.rent[3]}</span></div>
                    <div class="rent-row"><span class="rent-label">4 casas</span><span class="rent-value">$${prop.rent[4]}</span></div>
                    <div class="rent-row hotel-row"><span class="rent-label">🏨 Hotel</span><span class="rent-value">$${prop.rent[5]}</span></div>
                </div>
                <p style="color: var(--text-muted); font-size: 0.875rem; text-align: center; margin-top: 12px;">
                    Custo de construção: <strong>$${prop.houseCost}</strong>
                </p>
            `;
        }
        
        const content = `
            <!-- Header da propriedade -->
            <div class="property-manage-header" style="background: var(--bg-tertiary); --prop-color: ${prop.color}">
                <h4>${prop.name}</h4>
                <p style="color: var(--text-secondary); font-size: 0.9375rem; margin-top: 4px;">
                    Preço: <strong>$${prop.price}</strong>
                </p>
                ${owner 
                    ? `<p style="margin-top: 8px;">Dono: <span style="color: ${owner.color}; font-weight: 600;">${owner.icon} ${owner.name}</span></p>` 
                    : '<p style="color: var(--success); margin-top: 8px; font-weight: 600;">✅ Disponível para compra</p>'
                }
            </div>
            
            <!-- Tabela de aluguéis -->
            ${rentTable}
            
            ${!owner ? `
                <!-- Seleção de jogador para compra -->
                <div style="margin-top: 20px;">
                    <p class="rent-table-title">Comprar para:</p>
                    <div class="player-select-grid" id="buy-player-select">
                        ${activePlayers.map(p => `
                            <div class="player-select-option" data-player-id="${p.id}" onclick="app.selectBuyPlayer(${p.id})">
                                <div class="player-avatar" style="background: ${p.color}">${p.icon}</div>
                                <div style="font-weight: 600;">${p.name}</div>
                                <small style="color: var(--text-muted)">$${this.formatMoney(p.balance)}</small>
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                <!-- Botões de ação -->
                <div style="display: flex; gap: 12px; margin-top: 20px;">
                    <button class="btn btn-primary btn-full btn-lg" onclick="app.buyProperty(${prop.id})">
                        Comprar $${prop.price}
                    </button>
                    <button class="btn btn-gold" style="padding: 16px 20px;" onclick="app.startQuickAuction(${prop.id})" title="Leiloar">
                        🔨
                    </button>
                </div>
            ` : `
                <!-- Ações para propriedade com dono -->
                <div style="display: flex; flex-direction: column; gap: 10px; margin-top: 20px;">
                    ${!prop.isRailroad && !prop.isUtility && prop.houses < 5 ? `
                        <button class="btn btn-primary btn-full" onclick="app.buildHouse(${prop.id})">
                            🏠 Construir Casa ($${prop.houseCost})
                        </button>
                    ` : ''}
                    ${prop.houses > 0 ? `
                        <button class="btn btn-secondary btn-full" onclick="app.sellHouse(${prop.id})">
                            💰 Vender Casa
                        </button>
                    ` : ''}
                    <button class="btn btn-danger btn-full" onclick="app.sellProperty(${prop.id})">
                        Vender Propriedade
                    </button>
                </div>
            `}
        `;
        
        this.openModal('Detalhes da Propriedade', content);
        this.buyPlayer = null;
    }
    
    startQuickAuction(propertyId) {
        this.closeModal();
        this.auctionProperty = this.properties.find(p => p.id === propertyId);
        this.auctionBid = 10;
        this.auctionBidder = null;
        this.auctionPassed = [];
        this.auctionActive = true;
        this.auctionQueue = [...this.players]
            .filter(p => !p.isBankrupt)
            .sort((a, b) => a.order - b.order)
            .map(p => p.id);
        this.auctionCurrentIndex = 0;
        this.renderAuctionScreen();
    }
    
    selectBuyPlayer(id) {
        this.buyPlayer = id;
        document.querySelectorAll('#buy-player-select .player-select-option').forEach(opt => {
            opt.classList.toggle('selected', parseInt(opt.dataset.playerId) === id);
        });
    }
    
    buyProperty(propertyId) {
        if (!this.buyPlayer) return this.showToast('Selecione um jogador!', 'warning');
        
        const prop = this.properties.find(p => p.id === propertyId);
        const player = this.players.find(p => p.id === this.buyPlayer);
        
        player.balance -= prop.price;
        player.properties.push(propertyId);
        prop.houses = 0;
        
        this.checkBankruptcy(player);
        this.addToHistory('🏠', `${player.name} comprou ${prop.name}`, -prop.price, player);
        this.renderPlayersCards();
        this.renderProperties();
        this.closeModal();
        this.showToast(`${player.name} comprou ${prop.name}!`, 'success');
    }
    
    buildHouse(propertyId) {
        const prop = this.properties.find(p => p.id === propertyId);
        const owner = this.players.find(p => p.properties.includes(propertyId));
        
        if (prop.houses >= 5) return this.showToast('Máximo atingido!', 'warning');
        
        // Verificar monopólio
        const groups = this.getPlayerGroups(owner);
        const hasMonopoly = groups.complete.some(g => g.name === prop.group);
        
        if (!hasMonopoly) {
            return this.showToast('Precisa do monopólio para construir!', 'warning');
        }
        
        if (owner.balance < prop.houseCost) {
            return this.showToast('Saldo insuficiente!', 'danger');
        }
        
        owner.balance -= prop.houseCost;
        prop.houses = (prop.houses || 0) + 1;
        
        const type = prop.houses === 5 ? 'hotel' : 'casa';
        this.checkBankruptcy(owner);
        this.addToHistory('🏗️', `${owner.name}: ${type} em ${prop.name}`, -prop.houseCost, owner);
        this.renderPlayersCards();
        this.renderProperties();
        
        // Reabrir modal para continuar gerenciando
        this.showPropertyManageModal(propertyId);
        this.showToast(`${type} construída!`, 'success');
    }
    
    sellHouse(propertyId) {
        const prop = this.properties.find(p => p.id === propertyId);
        const owner = this.players.find(p => p.properties.includes(propertyId));
        const price = Math.floor(prop.houseCost / 2);
        
        if (!prop.houses || prop.houses <= 0) {
            return this.showToast('Não há casas para vender!', 'warning');
        }
        
        owner.balance += price;
        prop.houses--;
        if (owner.isBankrupt && owner.balance > 0) owner.isBankrupt = false;
        
        const type = prop.houses === 4 ? 'hotel' : 'casa';
        this.addToHistory('💰', `${owner.name}: vendeu ${type} de ${prop.name}`, price, owner);
        this.renderPlayersCards();
        this.renderProperties();
        
        // Reabrir modal para continuar gerenciando
        this.showPropertyManageModal(propertyId);
        this.showToast(`Vendida por $${price}!`, 'success');
    }
    
    sellProperty(propertyId) {
        const prop = this.properties.find(p => p.id === propertyId);
        const owner = this.players.find(p => p.properties.includes(propertyId));
        const houses = prop.houses || 0;
        const price = Math.floor(prop.price / 2) + (houses * Math.floor(prop.houseCost / 2));
        
        if (confirm(`Vender ${prop.name} por $${price}?`)) {
            owner.balance += price;
            owner.properties = owner.properties.filter(id => id !== propertyId);
            prop.houses = 0;
            if (owner.isBankrupt && owner.balance > 0) owner.isBankrupt = false;
            
            this.addToHistory('🔄', `${owner.name} vendeu ${prop.name}`, price, owner);
            this.renderPlayersCards();
            this.renderProperties();
            this.closeModal();
            this.showToast(`${prop.name} vendida por $${price}!`, 'success');
        }
    }
    
    showPropertyInfoPopup(propertyId) {
        const prop = this.properties.find(p => p.id === propertyId);
        const owner = this.players.find(p => p.properties.includes(propertyId));
        
        // Gerar tabela de aluguéis bonita
        let rentRows = '';
        if (prop.isRailroad) {
            rentRows = `
                <div class="popup-rent-row"><span>1 ferrovia</span><span>$25</span></div>
                <div class="popup-rent-row"><span>2 ferrovias</span><span>$50</span></div>
                <div class="popup-rent-row"><span>3 ferrovias</span><span>$100</span></div>
                <div class="popup-rent-row"><span>4 ferrovias</span><span>$200</span></div>
            `;
        } else if (prop.isUtility) {
            rentRows = `
                <div class="popup-rent-row"><span>1 companhia</span><span>4× dado</span></div>
                <div class="popup-rent-row"><span>2 companhias</span><span>10× dado</span></div>
            `;
        } else {
            rentRows = `
                <div class="popup-rent-row"><span>Sem casas</span><span>$${prop.rent[0]}</span></div>
                <div class="popup-rent-row"><span>1 casa</span><span>$${prop.rent[1]}</span></div>
                <div class="popup-rent-row"><span>2 casas</span><span>$${prop.rent[2]}</span></div>
                <div class="popup-rent-row"><span>3 casas</span><span>$${prop.rent[3]}</span></div>
                <div class="popup-rent-row"><span>4 casas</span><span>$${prop.rent[4]}</span></div>
                <div class="popup-rent-row popup-hotel"><span>🏨 Hotel</span><span>$${prop.rent[5]}</span></div>
            `;
        }
        
        const popup = document.createElement('div');
        popup.id = 'property-info-popup';
        popup.innerHTML = `
            <div style="position: fixed; inset: 0; background: rgba(0,0,0,0.6); z-index: 2000;
                        display: flex; align-items: center; justify-content: center; padding: 20px;"
                 onclick="this.parentElement.remove()">
                <div style="background: var(--bg-card); border-radius: 16px; max-width: 340px; width: 100%;
                            box-shadow: 0 20px 40px rgba(0,0,0,0.3); overflow: hidden;"
                     onclick="event.stopPropagation()">
                    
                    <!-- Header com cor da propriedade -->
                    <div style="background: ${prop.color}; padding: 20px; color: white;">
                        <h3 style="font-size: 1.25rem; font-weight: 700; margin-bottom: 4px;">${prop.name}</h3>
                        <p style="opacity: 0.9; font-size: 1rem;">Preço: $${prop.price}</p>
                    </div>
                    
                    <!-- Conteúdo -->
                    <div style="padding: 16px 20px;">
                        ${owner ? `
                            <p style="margin-bottom: 16px; font-size: 0.9375rem;">
                                <strong>Dono:</strong> 
                                <span style="color: ${owner.color};">${owner.icon} ${owner.name}</span>
                            </p>
                        ` : ''}
                        
                        <p style="color: var(--text-secondary); font-size: 0.875rem; font-weight: 600; margin-bottom: 10px;">
                            Tabela de Aluguéis:
                        </p>
                        
                        <div style="background: var(--bg-tertiary); border-radius: 10px; overflow: hidden;">
                            ${rentRows}
                        </div>
                        
                        ${!prop.isRailroad && !prop.isUtility ? `
                            <p style="text-align: center; color: var(--text-muted); font-size: 0.8125rem; margin-top: 12px;">
                                Custo de construção: <strong>$${prop.houseCost}</strong>
                            </p>
                        ` : ''}
                    </div>
                    
                    <!-- Botão fechar -->
                    <div style="padding: 12px 20px 20px;">
                        <button onclick="document.getElementById('property-info-popup').remove()" 
                                style="width: 100%; padding: 14px; background: var(--bg-tertiary);
                                       border: none; border-radius: 10px; cursor: pointer; font-weight: 600;
                                       font-size: 0.9375rem; color: var(--text-primary); font-family: inherit;">
                            Fechar
                        </button>
                    </div>
                </div>
            </div>
            
            <style>
                .popup-rent-row {
                    display: flex;
                    justify-content: space-between;
                    padding: 12px 14px;
                    border-bottom: 1px solid var(--border-light);
                    font-size: 0.875rem;
                }
                .popup-rent-row:last-child {
                    border-bottom: none;
                }
                .popup-rent-row span:first-child {
                    color: var(--text-secondary);
                }
                .popup-rent-row span:last-child {
                    font-weight: 700;
                    color: var(--text-primary);
                }
                .popup-rent-row.popup-hotel {
                    background: rgba(16, 185, 129, 0.1);
                }
                .popup-rent-row.popup-hotel span:first-child,
                .popup-rent-row.popup-hotel span:last-child {
                    color: var(--success);
                    font-weight: 600;
                }
            </style>
        `;
        document.body.appendChild(popup);
    }
    
    // ==========================================
    // CARDS
    // ==========================================
    
    drawCard(type) {
        const deck = type === 'chance' ? this.chanceCards : this.chestCards;
        const name = type === 'chance' ? 'SORTE' : 'COFRE';
        
        if (!deck.length) {
            if (type === 'chance') this.chanceCards = this.shuffleArray([...CHANCE_CARDS]);
            else this.chestCards = this.shuffleArray([...COMMUNITY_CHEST_CARDS]);
            this.showToast('Baralho embaralhado!', 'info');
        }
        
        this.currentCard = deck.shift();
        this.currentCardType = type;
        
        const el = document.getElementById('drawn-card');
        el.classList.remove('hidden');
        el.innerHTML = `
            <div class="card-content">
                <div class="card-type">${name}</div>
                <div class="card-text">${this.currentCard.text}</div>
                ${this.getCardEffectDisplay()}
            </div>
            <button class="btn btn-primary btn-full mt-5" onclick="app.showApplyCardModal()">✨ Aplicar</button>
        `;
        el.style.animation = 'none';
        el.offsetHeight;
        el.style.animation = null;
    }
    
    getCardEffectDisplay() {
        const e = this.currentCard.effect;
        switch (e.type) {
            case 'receive': return `<div class="card-effect text-success">+$${e.amount}</div>`;
            case 'pay': return `<div class="card-effect text-danger">-$${e.amount}</div>`;
            case 'payEach': return `<div class="card-effect text-danger">-$${e.amount} × jogadores</div>`;
            case 'receiveEach': return `<div class="card-effect text-success">+$${e.amount} × jogadores</div>`;
            case 'jail': return `<div class="card-effect">🔒 Cadeia</div>`;
            case 'getOutOfJail': return `<div class="card-effect text-success">🔓 Livre!</div>`;
            case 'repairs': return `<div class="card-effect text-warning">🔧 Reparos</div>`;
            default: return '';
        }
    }
    
    showApplyCardModal() {
        const players = this.players.filter(p => !p.isBankrupt);
        
        const content = `
            <div style="text-align: center; margin-bottom: 24px;">
                <p style="color: var(--text-secondary);">${this.currentCard.text}</p>
                ${this.getCardEffectDisplay()}
            </div>
            <div class="modal-form-group">
                <label>Aplicar para:</label>
                <div class="player-select-grid" id="card-player-select">
                    ${players.map(p => `
                        <div class="player-select-option" data-player-id="${p.id}" onclick="app.selectCardPlayer(${p.id})">
                            <div class="player-avatar" style="background: ${p.color}">${p.icon}</div>
                            <div>${p.name}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
            <button class="btn btn-primary btn-full" onclick="app.applyCardEffect()">✅ Confirmar</button>
        `;
        
        this.openModal('🎴 Aplicar Carta', content);
        this.cardPlayer = null;
    }
    
    selectCardPlayer(id) {
        this.cardPlayer = id;
        document.querySelectorAll('#card-player-select .player-select-option').forEach(opt => {
            opt.classList.toggle('selected', parseInt(opt.dataset.playerId) === id);
        });
    }
    
    applyCardEffect() {
        if (!this.cardPlayer) return this.showToast('Selecione um jogador!', 'warning');
        
        const player = this.players.find(p => p.id === this.cardPlayer);
        const e = this.currentCard.effect;
        
        switch (e.type) {
            case 'receive':
                player.balance += e.amount;
                this.addToHistory('🎴', `${player.name}: ${this.currentCard.text}`, e.amount, player);
                break;
            case 'pay':
                player.balance -= e.amount;
                this.addToHistory('🎴', `${player.name}: ${this.currentCard.text}`, -e.amount, player);
                this.checkBankruptcy(player);
                break;
            case 'payEach':
                const others = this.players.filter(p => p.id !== player.id && !p.isBankrupt);
                const total = e.amount * others.length;
                player.balance -= total;
                others.forEach(p => p.balance += e.amount);
                this.addToHistory('🎴', `${player.name} pagou a cada`, -total, player);
                this.checkBankruptcy(player);
                break;
            case 'receiveEach':
                const payers = this.players.filter(p => p.id !== player.id && !p.isBankrupt);
                const totalR = e.amount * payers.length;
                payers.forEach(p => { p.balance -= e.amount; this.checkBankruptcy(p); });
                player.balance += totalR;
                this.addToHistory('🎴', `${player.name} recebeu de cada`, totalR, player);
                break;
            case 'repairs':
                let cost = 0;
                this.properties.filter(prop => player.properties.includes(prop.id)).forEach(prop => {
                    cost += prop.houses === 5 ? e.hotelCost : prop.houses * e.houseCost;
                });
                player.balance -= cost;
                this.addToHistory('🔧', `${player.name}: Reparos`, -cost, player);
                this.checkBankruptcy(player);
                break;
            default:
                this.addToHistory('🎴', `${player.name}: ${this.currentCard.text}`, null, player);
        }
        
        this.renderPlayersCards();
        this.closeModal();
        document.getElementById('drawn-card').classList.add('hidden');
        this.currentCard = null;
        this.showToast('Efeito aplicado!', 'success');
    }
    
    // ==========================================
    // NAVIGATION
    // ==========================================
    
    switchTab(tab) {
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tab);
        });
        
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        
        switch (tab) {
            case 'players': document.getElementById('game-screen').classList.add('active'); break;
            case 'properties': 
                document.getElementById('properties-screen').classList.add('active'); 
                this.renderProperties();
                break;
            case 'cards': document.getElementById('cards-screen').classList.add('active'); break;
            case 'history': 
                document.getElementById('history-screen').classList.add('active'); 
                this.renderHistory();
                break;
        }
    }
    
    goBack() {
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        document.getElementById('game-screen').classList.add('active');
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === 'players');
        });
    }
    
    toggleSideMenu() {
        const menu = document.getElementById('side-menu');
        menu.classList.toggle('active');
        menu.classList.toggle('hidden');
    }
    
    // ==========================================
    // HISTORY
    // ==========================================
    
    addToHistory(icon, text, amount, player = null) {
        this.history.unshift({ icon, text, amount, playerColor: player?.color, time: new Date() });
        if (this.history.length > 100) this.history.pop();
        
        // Auto-save após cada ação
        this.autoSave();
    }
    
    renderHistory() {
        const container = document.getElementById('history-list');
        
        if (!this.history.length) {
            container.innerHTML = `
                <div class="history-empty">
                    <svg viewBox="0 0 300 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <ellipse cx="150" cy="180" rx="100" ry="12" fill="var(--primary-bg)"/>
                        <rect x="80" y="40" width="140" height="130" rx="10" fill="var(--bg-card)" stroke="var(--border-light)" stroke-width="2"/>
                        <rect x="95" y="55" width="110" height="12" rx="4" fill="var(--bg-tertiary)"/>
                        <rect x="95" y="75" width="80" height="12" rx="4" fill="var(--bg-tertiary)"/>
                        <rect x="95" y="95" width="95" height="12" rx="4" fill="var(--bg-tertiary)"/>
                        <rect x="95" y="115" width="60" height="12" rx="4" fill="var(--bg-tertiary)"/>
                        <circle cx="220" cy="60" r="30" fill="var(--primary)" opacity="0.2"/>
                        <path d="M210 60 L220 70 L235 55" stroke="var(--primary)" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
                        <circle cx="70" cy="140" r="20" fill="var(--gold)" opacity="0.3"/>
                        <text x="70" y="146" text-anchor="middle" fill="var(--gold)" font-weight="700" font-size="16">$</text>
                    </svg>
                    <p>Nenhuma transação ainda</p>
                    <p style="font-size: 0.875rem; margin-top: 8px;">As movimentações aparecerão aqui</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = this.history.map(item => `
            <div class="history-item">
                <div class="history-icon" ${item.playerColor ? `style="background: ${item.playerColor}"` : ''}>
                    ${item.icon}
                </div>
                <div class="history-info">
                    <div class="history-text">${item.text}</div>
                    <div class="history-time">${this.formatTime(item.time)}</div>
                </div>
                ${item.amount !== null ? `
                    <div class="history-amount ${item.amount >= 0 ? 'positive' : 'negative'}">
                        ${item.amount >= 0 ? '+' : ''}$${Math.abs(item.amount)}
                    </div>
                ` : ''}
            </div>
        `).join('');
    }
    
    // ==========================================
    // MODALS & UI
    // ==========================================
    
    openModal(title, content) {
        document.getElementById('modal-title').textContent = title;
        document.getElementById('modal-content').innerHTML = content;
        document.getElementById('modal-overlay').classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    }
    
    closeModal() {
        document.getElementById('modal-overlay').classList.add('hidden');
        document.body.style.overflow = '';
    }
    
    showToast(message, type = 'info') {
        document.querySelector('.toast')?.remove();
        
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.style.animation = 'toastOut 0.3s ease forwards';
            setTimeout(() => toast.remove(), 300);
        }, 2500);
    }
    
    showRules() {
        this.openModal('📖 Regras', `
            <div style="font-size: 1rem; line-height: 1.8;">
                <p><b>💰 Início:</b> $1.500 por jogador</p>
                <p><b>🚀 Salário:</b> $200 ao passar pelo GO</p>
                <p><b>🏠 Casas:</b> Só com grupo completo</p>
                <p><b>🏨 Hotel:</b> Máximo 1 por propriedade</p>
                <p><b>🔨 Leilão:</b> Se não comprar, vai a leilão</p>
                <p><b>🚂 Ferrovias:</b> Aluguel aumenta com quantidade</p>
            </div>
        `);
        this.toggleSideMenu();
    }
    
    showAddPlayerModal() {
        if (this.players.length >= 8) return this.showToast('Máximo 8 jogadores!', 'warning');
        
        const colors = ['#DC2626', '#2563EB', '#16A34A', '#D97706', '#9333EA', '#0891B2', '#DB2777', '#475569']
            .filter(c => !this.usedColors.includes(c));
        
        // Resetar seleções
        this.newPlayerColor = colors[0];
        this.newPlayerPiece = null;
        
        const content = `
            <div class="modal-form-group">
                <label>Nome:</label>
                <input type="text" id="new-player-name" placeholder="Nome" maxlength="15" />
            </div>
            
            <div class="modal-form-group">
                <label>Escolha sua peça:</label>
                <div class="piece-picker-modal" id="new-piece-picker">
                    <div class="piece-option no-piece" data-piece="none" onclick="app.selectNewPiece('none')">
                        <i data-lucide="ban" style="width: 20px; height: 20px;"></i>
                    </div>
                    ${GAME_PIECES.map(piece => `
                        <div class="piece-option ${this.usedPieces.includes(piece.id) ? 'used' : ''}" 
                             data-piece="${piece.id}" 
                             onclick="app.selectNewPiece('${piece.id}')"
                             title="${piece.name}">
                            ${piece.emoji}
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <div class="modal-form-group">
                <label>Cor:</label>
                <div class="color-picker" id="new-color-picker">
                    ${colors.map((c, i) => `
                        <div class="color-option ${i === 0 ? 'selected' : ''}" 
                             data-color="${c}" 
                             style="background: ${c}" 
                             onclick="app.selectNewColor('${c}')">
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <button class="btn btn-primary btn-full btn-lg" onclick="app.addNewPlayerInGame()">
                <i data-lucide="user-plus"></i> Adicionar Jogador
            </button>
        `;
        
        this.openModal('➕ Novo Jogador', content);
        this.toggleSideMenu();
        
        if (typeof lucide !== 'undefined') {
            setTimeout(() => lucide.createIcons(), 10);
        }
    }
    
    selectNewPiece(pieceId) {
        if (pieceId !== 'none' && this.usedPieces.includes(pieceId)) return;
        this.newPlayerPiece = pieceId;
        document.querySelectorAll('#new-piece-picker .piece-option').forEach(opt => {
            opt.classList.toggle('selected', opt.dataset.piece === pieceId);
        });
    }
    
    selectNewColor(color) {
        this.newPlayerColor = color;
        document.querySelectorAll('#new-color-picker .color-option').forEach(opt => {
            opt.classList.toggle('selected', opt.dataset.color === color);
        });
    }
    
    addNewPlayerInGame() {
        const name = document.getElementById('new-player-name').value.trim();
        if (!name) return this.showToast('Digite um nome!', 'warning');
        if (!this.newPlayerPiece) return this.showToast('Selecione uma peça!', 'warning');
        
        const isNoPiece = this.newPlayerPiece === 'none';
        const piece = isNoPiece ? null : this.getPieceById(this.newPlayerPiece);
        
        const player = {
            id: Date.now(),
            name,
            color: this.newPlayerColor,
            balance: this.gameModeSettings.initialMoney,
            properties: [],
            isBankrupt: false,
            piece: piece,
            icon: isNoPiece ? '' : piece.emoji,
            noPiece: isNoPiece,
            order: this.players.length + 1,
            jailFreeCards: 0
        };
        
        this.players.push(player);
        this.usedColors.push(this.newPlayerColor);
        if (!isNoPiece) {
            this.usedPieces.push(this.newPlayerPiece);
        }
        
        this.addToHistory('👋', `${name} entrou`, null);
        this.renderPlayersCards();
        this.closeModal();
        this.showToast(`${name} adicionado!`, 'success');
    }
    
    // ==========================================
    // UTILITIES
    // ==========================================
    
    formatMoney(n) { return Math.abs(n).toLocaleString('pt-BR'); }
    formatTime(d) { 
        // Converter string para Date se necessário (ao carregar do localStorage)
        const date = d instanceof Date ? d : new Date(d);
        return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }); 
    }
    
    addToAmount(inputId, value) {
        const input = document.getElementById(inputId);
        const current = parseInt(input.value) || 0;
        input.value = current + value;
    }
    
    clearAmount(inputId) {
        document.getElementById(inputId).value = 0;
    }
    shuffleArray(arr) {
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    }
    shake(el) { el.classList.add('shake'); setTimeout(() => el.classList.remove('shake'), 400); }
    animateMoney(id) {
        const el = document.getElementById(`balance-${id}`);
        if (el) { el.classList.add('money-changed'); setTimeout(() => el.classList.remove('money-changed'), 300); }
    }
    
    // ==========================================
    // BANKRUPTCY - SISTEMA COMPLETO DE FALÊNCIA
    // ==========================================
    
    checkBankruptcy(player, creditor = null) {
        if (player.balance >= 0) return false;
        
        // Calcular valor total de ativos
        const assets = this.calculatePlayerAssets(player);
        
        if (player.balance + assets.total < 0) {
            // Falência inevitável - não tem como pagar
            this.triggerBankruptcy(player, creditor);
            return true;
        } else {
            // Pode se salvar vendendo propriedades
            this.showDebtWarning(player, creditor);
            return false;
        }
    }
    
    calculatePlayerAssets(player) {
        const playerProps = this.properties.filter(p => player.properties.includes(p.id));
        let propertiesValue = 0;
        let housesValue = 0;
        
        playerProps.forEach(prop => {
            propertiesValue += Math.floor(prop.price / 2);
            if (prop.houses) {
                housesValue += prop.houses * Math.floor(prop.houseCost / 2);
            }
        });
        
        return {
            properties: propertiesValue,
            houses: housesValue,
            total: propertiesValue + housesValue
        };
    }
    
    showDebtWarning(player, creditor) {
        const assets = this.calculatePlayerAssets(player);
        const debt = Math.abs(player.balance);
        
        const content = `
            <div style="text-align: center; padding: 20px 0;">
                <div style="font-size: 3rem; margin-bottom: 16px;">⚠️</div>
                <h4 style="color: var(--danger); margin-bottom: 12px;">Saldo Negativo!</h4>
                <p style="color: var(--text-secondary); margin-bottom: 20px;">
                    ${player.name} está devendo <strong style="color: var(--danger);">$${debt}</strong>
                </p>
                
                <div style="background: var(--bg-tertiary); border-radius: 12px; padding: 16px; margin-bottom: 20px; text-align: left;">
                    <p style="margin-bottom: 8px;"><strong>Ativos disponíveis:</strong></p>
                    <p>Propriedades: $${assets.properties}</p>
                    <p>Casas/Hotéis: $${assets.houses}</p>
                    <p style="margin-top: 8px; font-weight: 700; color: var(--primary);">
                        Total: $${assets.total}
                    </p>
                </div>
                
                <p style="font-size: 0.875rem; color: var(--text-muted);">
                    Venda propriedades ou casas para cobrir a dívida!
                </p>
            </div>
            
            <button class="btn btn-primary btn-full" onclick="app.closeModal()">
                Gerenciar Ativos
            </button>
        `;
        
        this.openModal('💸 Dívida', content);
    }
    
    triggerBankruptcy(player, creditor = null) {
        this.bankruptPlayer = player;
        this.bankruptCreditor = creditor;
        
        const playerProps = this.properties.filter(p => player.properties.includes(p.id));
        
        // Mostrar modal de falência
        const overlay = document.getElementById('bankruptcy-overlay');
        const message = document.getElementById('bankruptcy-message');
        const assets = document.getElementById('bankruptcy-assets');
        
        message.innerHTML = `
            <strong style="color: var(--player-color); --player-color: ${player.color}">${this.getPlayerDisplay(player)} ${player.name}</strong> 
            não consegue pagar suas dívidas!
        `;
        
        if (creditor) {
            assets.innerHTML = `
                <p style="margin-bottom: 12px;">Todos os ativos serão transferidos para:</p>
                <div style="display: flex; align-items: center; gap: 10px; justify-content: center;">
                    <div class="player-avatar" style="background: ${creditor.color}; width: 36px; height: 36px;">${creditor.icon}</div>
                    <strong>${creditor.name}</strong>
                </div>
                <p style="margin-top: 16px; font-size: 0.875rem; color: var(--text-muted);">
                    ${playerProps.length} propriedade(s) serão transferidas
                </p>
            `;
        } else {
            assets.innerHTML = `
                <p style="margin-bottom: 12px;">Dívida com o banco</p>
                <p style="font-size: 0.875rem; color: var(--text-muted);">
                    ${playerProps.length} propriedade(s) voltarão ao banco e serão leiloadas
                </p>
            `;
        }
        
        overlay.classList.remove('hidden');
        
        // Inicializar ícones Lucide
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }
    
    cancelBankruptcy() {
        // Fechar modal de falência e voltar
        document.getElementById('bankruptcy-overlay').classList.add('hidden');
        this.bankruptPlayer = null;
        this.bankruptCreditor = null;
        this.showToast('Falência cancelada', 'info');
    }
    
    confirmBankruptcy() {
        const player = this.bankruptPlayer;
        const creditor = this.bankruptCreditor;
        
        if (!player) return;
        
        const playerProps = this.properties.filter(p => player.properties.includes(p.id));
        
        if (creditor) {
            // Transferir propriedades para o credor
            playerProps.forEach(prop => {
                creditor.properties.push(prop.id);
            });
            // Transferir dinheiro positivo restante se houver
            if (player.balance > 0) {
                creditor.balance += player.balance;
            }
        } else {
            // Devolver casas ao banco e liberar propriedades
            playerProps.forEach(prop => {
                prop.houses = 0;
            });
        }
        
        // Limpar jogador
        player.properties = [];
        player.balance = 0;
        player.isBankrupt = true;
        
        // Fechar modal
        document.getElementById('bankruptcy-overlay').classList.add('hidden');
        
        this.bankruptPlayer = null;
        this.bankruptCreditor = null;
        
        this.addToHistory('💀', `${player.name} faliu!`, null, player);
        this.showToast(`${player.name} declarou falência!`, 'danger');
        
        this.renderPlayersCards();
        this.renderProperties();
        
        // Verificar se jogo acabou
        this.checkGameEnd();
    }
    
    checkGameEnd() {
        const activePlayers = this.players.filter(p => !p.isBankrupt);
        
        if (activePlayers.length === 1) {
            const winner = activePlayers[0];
            this.showGameEndModal(winner);
        }
    }
    
    showGameEndModal(winner) {
        const content = `
            <div style="text-align: center; padding: 24px 0;">
                <div style="font-size: 4rem; margin-bottom: 16px;">🏆</div>
                <h2 style="color: var(--gold); margin-bottom: 12px;">Temos um Vencedor!</h2>
                <div style="display: flex; align-items: center; justify-content: center; gap: 12px; margin-bottom: 20px;">
                    <div class="player-avatar" style="background: ${winner.color}; width: 60px; height: 60px; font-size: 2rem;">${winner.icon}</div>
                </div>
                <h3 style="margin-bottom: 20px;">${winner.name}</h3>
                <p style="color: var(--text-secondary);">
                    Patrimônio final: <strong style="color: var(--success);">$${this.formatMoney(winner.balance)}</strong>
                </p>
                <p style="color: var(--text-secondary);">
                    ${winner.properties.length} propriedades
                </p>
            </div>
            
            <button class="btn btn-gold btn-full btn-lg" onclick="app.newGame()">
                🎲 Nova Partida
            </button>
        `;
        
        this.openModal('🏆 Fim de Jogo!', content);
    }
    
    // ==========================================
    // DECLARAR FALÊNCIA VOLUNTÁRIA
    // ==========================================
    
    showDeclareBankruptcyModal() {
        const activePlayers = this.players.filter(p => !p.isBankrupt);
        
        if (activePlayers.length <= 2) {
            this.showToast('Precisa de mais de 2 jogadores para declarar falência!', 'warning');
            return;
        }
        
        const content = `
            <div style="text-align: center; padding: 16px 0;">
                <div style="font-size: 3rem; margin-bottom: 12px;">💀</div>
                <h4 style="color: var(--danger); margin-bottom: 16px;">Declarar Falência</h4>
                <p style="color: var(--text-secondary); margin-bottom: 20px; font-size: 0.9375rem;">
                    Selecione o jogador que deseja declarar falência.<br>
                    <strong>Esta ação é irreversível!</strong>
                </p>
            </div>
            
            <div class="modal-form-group">
                <label>Jogador que vai falir:</label>
                <div class="player-select-grid" id="bankruptcy-player-select">
                    ${activePlayers.map(p => {
                        const assets = this.calculatePlayerAssets(p);
                        return `
                            <div class="player-select-option" data-player-id="${p.id}" onclick="app.selectBankruptPlayer(${p.id})">
                                <div class="player-avatar" style="background: ${p.color}">${p.icon}</div>
                                <div style="font-weight: 600;">${p.name}</div>
                                <small style="color: var(--text-muted)">$${this.formatMoney(p.balance)}</small>
                                <small style="color: var(--text-muted)">${p.properties.length} prop.</small>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
            
            <div style="background: var(--danger-bg); padding: 14px; border-radius: 10px; margin-bottom: 16px;">
                <p style="color: var(--danger); font-size: 0.875rem; text-align: center;">
                    ⚠️ Ao declarar falência, todas as propriedades voltarão ao banco!
                </p>
            </div>
            
            <div style="display: flex; gap: 12px;">
                <button class="btn btn-secondary btn-full" onclick="app.closeModal()">
                    Cancelar
                </button>
                <button class="btn btn-danger btn-full" onclick="app.executeVoluntaryBankruptcy()">
                    💀 Declarar Falência
                </button>
            </div>
        `;
        
        this.openModal('💀 Declarar Falência', content);
        this.voluntaryBankruptPlayer = null;
    }
    
    selectBankruptPlayer(playerId) {
        this.voluntaryBankruptPlayer = playerId;
        document.querySelectorAll('#bankruptcy-player-select .player-select-option').forEach(opt => {
            opt.classList.toggle('selected', parseInt(opt.dataset.playerId) === playerId);
        });
    }
    
    executeVoluntaryBankruptcy() {
        if (!this.voluntaryBankruptPlayer) {
            this.showToast('Selecione um jogador!', 'warning');
            return;
        }
        
        const player = this.players.find(p => p.id === this.voluntaryBankruptPlayer);
        
        if (confirm(`Tem certeza que deseja declarar falência para ${player.name}? Esta ação é IRREVERSÍVEL!`)) {
            // Devolver casas ao banco e liberar propriedades
            const playerProps = this.properties.filter(p => player.properties.includes(p.id));
            playerProps.forEach(prop => {
                prop.houses = 0;
            });
            
            // Limpar jogador
            player.properties = [];
            player.balance = 0;
            player.isBankrupt = true;
            
            this.closeModal();
            
            this.addToHistory('💀', `${player.name} declarou falência voluntária!`, null, player);
            this.showToast(`${player.name} declarou falência!`, 'danger');
            
            this.renderPlayersCards();
            this.renderProperties();
            
            // Verificar se jogo acabou
            this.checkGameEnd();
        }
    }
    
    // ==========================================
    // PAGAMENTO COM VERIFICAÇÃO DE SALDO
    // ==========================================
    
    // Função auxiliar para tentar fazer um pagamento
    tryPayment(player, amount, creditor = null, description = '') {
        if (player.balance >= amount) {
            // Pagamento normal
            player.balance -= amount;
            if (creditor) {
                creditor.balance += amount;
            }
            return true;
        }
        
        // Não tem saldo suficiente
        const assets = this.calculatePlayerAssets(player);
        const totalPossible = player.balance + assets.total;
        
        if (totalPossible >= amount) {
            // Pode pagar vendendo propriedades
            this.showPaymentWarning(player, amount, creditor, description, assets);
            return false;
        } else {
            // Não consegue pagar nem vendendo tudo - falência
            player.balance -= amount; // Deixa saldo negativo para mostrar a dívida
            if (creditor) {
                this.triggerBankruptcy(player, creditor);
            } else {
                this.triggerBankruptcy(player, null);
            }
            return false;
        }
    }
    
    showPaymentWarning(player, amount, creditor, description, assets) {
        const shortfall = amount - player.balance;
        
        const content = `
            <div style="text-align: center; padding: 16px 0;">
                <div style="font-size: 3rem; margin-bottom: 12px;">💸</div>
                <h4 style="color: var(--warning); margin-bottom: 8px;">Saldo Insuficiente!</h4>
                <p style="color: var(--text-secondary); margin-bottom: 4px;">
                    ${player.name} precisa pagar
                </p>
                <p style="font-size: 1.5rem; font-weight: 800; color: var(--danger); margin-bottom: 16px;">
                    $${this.formatMoney(amount)}
                </p>
                ${description ? `<p style="color: var(--text-muted); font-size: 0.875rem; margin-bottom: 16px;">${description}</p>` : ''}
            </div>
            
            <div style="background: var(--bg-tertiary); border-radius: 12px; padding: 16px; margin-bottom: 16px;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                    <span>Saldo atual:</span>
                    <strong style="color: ${player.balance >= 0 ? 'var(--success)' : 'var(--danger)'}">$${this.formatMoney(player.balance)}</strong>
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                    <span>Falta:</span>
                    <strong style="color: var(--danger)">$${this.formatMoney(shortfall)}</strong>
                </div>
                <div style="border-top: 1px solid var(--border-light); margin-top: 12px; padding-top: 12px;">
                    <p style="font-size: 0.875rem; color: var(--text-muted); margin-bottom: 8px;">Ativos que podem ser vendidos:</p>
                    <div style="display: flex; justify-content: space-between;">
                        <span>Propriedades:</span>
                        <span>$${this.formatMoney(assets.properties)}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between;">
                        <span>Casas/Hotéis:</span>
                        <span>$${this.formatMoney(assets.houses)}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin-top: 8px; font-weight: 700; color: var(--primary);">
                        <span>Total:</span>
                        <span>$${this.formatMoney(assets.total)}</span>
                    </div>
                </div>
            </div>
            
            <p style="text-align: center; font-size: 0.875rem; color: var(--text-muted); margin-bottom: 16px;">
                Venda propriedades ou casas para conseguir o dinheiro necessário!
            </p>
            
            <div style="display: flex; gap: 12px;">
                <button class="btn btn-primary btn-full" onclick="app.closeModal()">
                    Gerenciar Ativos
                </button>
                <button class="btn btn-danger" onclick="app.forcePlayerBankruptcy(${player.id}, ${creditor ? creditor.id : 'null'})" title="Declarar Falência">
                    💀
                </button>
            </div>
        `;
        
        this.openModal('💸 Pagamento Necessário', content);
    }
    
    forcePlayerBankruptcy(playerId, creditorId) {
        const player = this.players.find(p => p.id === playerId);
        const creditor = creditorId ? this.players.find(p => p.id === creditorId) : null;
        
        if (confirm(`${player.name} vai declarar falência. Continuar?`)) {
            this.closeModal();
            this.triggerBankruptcy(player, creditor);
        }
    }
}

const app = new MonopolyBanker();
