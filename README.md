# 🎩 Banqueiro Digital - Monopoly

Um gerenciador digital para partidas de Monopoly! Substitua o banqueiro tradicional por esta aplicação moderna e prática.

![Monopoly Banker](https://img.shields.io/badge/Monopoly-Banker-green?style=for-the-badge)
![Version](https://img.shields.io/badge/version-1.0-blue?style=for-the-badge)

## ✨ Funcionalidades

### 👥 Gerenciamento de Jogadores
- Adicione de 2 a 8 jogadores
- Cores únicas para cada jogador
- Visualização de saldo em tempo real
- Detecção automática de falência

### 💰 Sistema Bancário Completo
- **Transferências** entre jogadores
- **Pagamentos ao banco** (impostos, multas, compras)
- **Recebimentos do banco** (prêmios, bônus)
- **Salário rápido** ($200 ao passar pelo Início)

### 🏠 Propriedades
- Todas as 28 propriedades do tabuleiro brasileiro
- Compra e venda de propriedades
- Construção de casas e hotéis
- Informações de aluguel detalhadas
- Filtros: Todas, Disponíveis, Com Dono

### 🎴 Cartas de Sorte e Cofre
- 16 cartas de Sorte
- 16 cartas de Cofre Comunitário
- Sorteio aleatório
- Aplicação automática de efeitos

### 📜 Histórico
- Log completo de todas as transações
- Horário de cada operação
- Útil para resolver disputas!

## 🚀 Como Usar

### Opção 1: Abrir diretamente
Simplesmente abra o arquivo `index.html` no seu navegador!

### Opção 2: Com servidor local
```bash
# Com Python 3
python -m http.server 8000

# Com Node.js (npx)
npx serve

# Com PHP
php -S localhost:8000
```

Depois acesse: `http://localhost:8000`

## 📱 Dicas de Uso

1. **Abra no celular ou tablet** durante o jogo físico
2. **Selecione um jogador** tocando no card antes de usar ações rápidas
3. **Use o salário rápido** ($200) quando alguém passar pelo Início
4. **Consulte as propriedades** para ver valores de aluguel

## 🎮 Como Jogar

1. **Inicie uma Nova Partida** adicionando os jogadores
2. **Cada jogador começa** com $1.500
3. **Use as ações rápidas** para gerenciar transações
4. **Compre propriedades** na aba Propriedades
5. **Tire cartas** na aba Cartas quando necessário
6. **Consulte o histórico** se precisar verificar transações

## 🛠️ Tecnologias

- HTML5
- CSS3 (com variáveis CSS e animações)
- JavaScript (ES6+, sem frameworks)
- Design responsivo para mobile

## 📁 Estrutura de Arquivos

```
monopoly/
├── index.html    # Estrutura da página
├── styles.css    # Estilos e tema visual
├── data.js       # Dados das propriedades e cartas
├── app.js        # Lógica da aplicação
└── README.md     # Este arquivo
```

## 🎨 Personalização

### Alterar dinheiro inicial
Em `data.js`, modifique:
```javascript
const INITIAL_MONEY = 1500;
```

### Adicionar propriedades
Em `data.js`, adicione ao array `PROPERTIES`:
```javascript
{ id: 29, name: 'Nova Propriedade', group: 'brown', price: 100, rent: [...], houseCost: 50, color: '#8B4513' }
```

### Adicionar cartas
Em `data.js`, adicione aos arrays `CHANCE_CARDS` ou `COMMUNITY_CHEST_CARDS`:
```javascript
{ text: 'Descrição da carta', effect: { type: 'receive', amount: 100 } }
```

## 📄 Licença

Este projeto é livre para uso pessoal. Monopoly é uma marca registrada da Hasbro.

---

Desenvolvido com ❤️ para tornar suas partidas de Monopoly mais divertidas!
