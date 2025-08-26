document.addEventListener('DOMContentLoaded', () => {
    // =================================================================================
    // CONSTANTS & CONFIGURATION
    // =================================================================================

    const BOARD_SIZE = 20;
    const PLAYERS_CONFIG = [
        { id: 1, name: '青', color: 'blue', corner: { r: 0, c: 0 } },
        { id: 2, name: '黄', color: 'yellow', corner: { r: 0, c: 19 } },
        { id: 3, name: '赤', color: 'red', corner: { r: 19, c: 19 } },
        { id: 4, name: '緑', color: 'green', corner: { r: 19, c: 0 } }
    ];
    const PIECE_DEFINITIONS = {
        'I1': [{ r: 0, c: 0 }], 'I2': [{ r: 0, c: 0 }, { r: 0, c: 1 }], 'I3': [{ r: 0, c: 0 }, { r: 0, c: 1 }, { r: 0, c: 2 }], 'V3': [{ r: 0, c: 0 }, { r: 0, c: 1 }, { r: 1, c: 0 }], 'I4': [{ r: 0, c: 0 }, { r: 0, c: 1 }, { r: 0, c: 2 }, { r: 0, c: 3 }], 'L4': [{ r: 0, c: 0 }, { r: 1, c: 0 }, { r: 2, c: 0 }, { r: 2, c: 1 }], 'O4': [{ r: 0, c: 0 }, { r: 0, c: 1 }, { r: 1, c: 0 }, { r: 1, c: 1 }], 'T4': [{ r: 0, c: 0 }, { r: 1, c: 0 }, { r: 2, c: 0 }, { r: 1, c: 1 }], 'Z4': [{ r: 0, c: 0 }, { r: 1, c: 0 }, { r: 1, c: 1 }, { r: 2, c: 1 }], 'F': [{ r: 1, c: 0 }, { r: 2, c: 0 }, { r: 0, c: 1 }, { r: 1, c: 1 }, { r: 1, c: 2 }], 'I5': [{ r: 0, c: 0 }, { r: 0, c: 1 }, { r: 0, c: 2 }, { r: 0, c: 3 }, { r: 0, c: 4 }], 'L5': [{ r: 0, c: 0 }, { r: 0, c: 1 }, { r: 0, c: 2 }, { r: 0, c: 3 }, { r: 1, c: 3 }], 'N': [{ r: 1, c: 0 }, { r: 2, c: 0 }, { r: 0, c: 1 }, { r: 1, c: 1 }, { r: 0, c: 2 }], 'P': [{ r: 0, c: 0 }, { r: 1, c: 0 }, { r: 0, c: 1 }, { r: 1, c: 1 }, { r: 0, c: 2 }], 'T5': [{ r: 0, c: 0 }, { r: 1, c: 0 }, { r: 2, c: 0 }, { r: 1, c: 1 }, { r: 1, c: 2 }], 'U': [{ r: 0, c: 0 }, { r: 2, c: 0 }, { r: 0, c: 1 }, { r: 1, c: 1 }, { r: 2, c: 1 }], 'V5': [{ r: 0, c: 0 }, { r: 0, c: 1 }, { r: 0, c: 2 }, { r: 1, c: 2 }, { r: 2, c: 2 }], 'W': [{ r: 0, c: 0 }, { r: 0, c: 1 }, { r: 1, c: 1 }, { r: 1, c: 2 }, { r: 2, c: 2 }], 'X': [{ r: 1, c: 0 }, { r: 0, c: 1 }, { r: 1, c: 1 }, { r: 2, c: 1 }, { r: 1, c: 2 }], 'Y': [{ r: 0, c: 1 }, { r: 1, c: 0 }, { r: 1, c: 1 }, { r: 1, c: 2 }, { r: 1, c: 3 }], 'Z5': [{ r: 0, c: 0 }, { r: 1, c: 0 }, { r: 1, c: 1 }, { r: 1, c: 2 }, { r: 2, c: 2 }]
    };
    const CPU_LEVEL_NAMES = {
        'cpu_weak': 'CPU (弱)',
        'cpu_medium': 'CPU (中)',
        'cpu_strong': 'CPU (強)',
        'cpu_god': 'CPU (最強)'
    };

    // =================================================================================
    // DOM ELEMENTS
    // =================================================================================

    const dom = {
        settingsModal: document.getElementById('settings-modal'),
        playerSettings: document.getElementById('player-settings'),
        startGameBtn: document.getElementById('start-game-btn'),
        gameOverModal: document.getElementById('game-over-modal'),
        winnerMessage: document.getElementById('winner-message'),
        finalScores: document.getElementById('final-scores'),
        restartBtn: document.getElementById('restart-btn'),
        gameContainer: document.getElementById('game-container'),
        boardContainer: document.getElementById('board-container'),
        currentPlayerDisplay: document.getElementById('current-player-display'),
        controls: document.getElementById('controls'),
        rotateBtn: document.getElementById('rotate-btn'),
        flipBtn: document.getElementById('flip-btn'),
        passBtn: document.getElementById('pass-btn'),
        scoreList: document.getElementById('score-list'),
        piecesList: document.getElementById('pieces-list'),
        rulesModal: document.getElementById('rules-modal'),
        rulesBtn: document.getElementById('rules-button'),
        closeBtn: document.querySelector('#rules-modal .close-button'),
        piecePreviewContainer: document.getElementById('piece-preview-container'),
    };

    // =================================================================================
    // GAME STATE
    // =================================================================================

    let state = {};

    function initializeState() {
        state = {
            board: Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(0)),
            players: JSON.parse(JSON.stringify(PLAYERS_CONFIG)),
            playerPieces: {},
            currentPlayerIndex: -1,
            selectedPiece: null,
            lastHoverCell: null,
        };

        state.players.forEach(p => {
            p.type = document.getElementById(`player-type-${p.id}`).value;
            p.status = 'active';
            p.score = 0;
            p.hasPassed = false;
        });

        state.players.forEach(p => {
            state.playerPieces[p.id] = JSON.parse(JSON.stringify(Object.entries(PIECE_DEFINITIONS).map(([name, shape]) => ({ name, shape, used: false, id: name }))));
        });
    }

    // =================================================================================
    // CORE GAME LOGIC
    // =================================================================================

    function initializeGame() {
        dom.settingsModal.style.display = 'none';
        dom.gameContainer.style.display = 'flex';
        dom.gameOverModal.style.display = 'none';

        initializeState();
        renderBoard();
        updateTurn();
    }

    async function updateTurn() {
        clearBoardPreview();

        let canAnyoneMove = false;
        for (const player of state.players) {
            if (player.status === 'active' && hasAnyValidMoves(player)) {
                canAnyoneMove = true;
                break;
            }
        }

        if (!canAnyoneMove) {
            endGame();
            return;
        }

        let nextPlayerFound = false;
        for (let i = 1; i <= state.players.length; i++) {
            let nextIndex = (state.currentPlayerIndex + i) % state.players.length;
            if (state.players[nextIndex].status === 'active') {
                state.currentPlayerIndex = nextIndex;
                nextPlayerFound = true;
                break;
            }
        }

        if (!nextPlayerFound) {
            endGame();
            return;
        }

        const currentPlayer = state.players[state.currentPlayerIndex];
        currentPlayer.hasPassed = false;
        state.selectedPiece = null;

        updatePlayerInfoUI(currentPlayer);
        renderPlayerPieces();
        updateScores();

        if (currentPlayer.type.startsWith('cpu')) {
            dom.piecesList.style.pointerEvents = 'none';
            dom.controls.style.pointerEvents = 'none';
            await new Promise(resolve => setTimeout(resolve, 500));
            makeCpuMove();
        } else {
            if (!hasAnyValidMoves(currentPlayer)) {
                await new Promise(resolve => setTimeout(resolve, 200));
                alert(`${currentPlayer.name}さんには配置できるピースがありません。自動的にパスします。`);
                handlePass();
            } else {
                dom.piecesList.style.pointerEvents = 'auto';
                dom.controls.style.pointerEvents = 'auto';
            }
        }
    }

    function placePiece(r, c, pieceToPlace, player) {
        pieceToPlace.shape.forEach(part => {
            const newR = r + part.r; const newC = c + part.c;
            state.board[newR][newC] = player.id;
            const cell = dom.boardContainer.querySelector(`.cell[data-r='${newR}'][data-c='${newC}']`);
            cell.className = `cell ${player.color}`;
        });
        const originalPiece = state.playerPieces[player.id].find(p => p.id === pieceToPlace.id);
        originalPiece.used = true;
        state.selectedPiece = null;

        const allPiecesUsed = state.playerPieces[player.id].every(p => p.used);
        if (allPiecesUsed) {
            player.status = 'finished';
            player.score += 15;
            if (pieceToPlace.shape.length === 1) {
                player.score += 5;
            }
        }
        updateTurn();
    }

    function handlePass() {
        state.players[state.currentPlayerIndex].hasPassed = true;
        updateTurn();
    }

    function isWithinBoard(r, c) {
        return r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE;
    }

    function isValidPlacement(r, c, piece, player) {
        for (const part of piece.shape) {
            const newR = r + part.r; const newC = c + part.c;
            if (!isWithinBoard(newR, newC) || state.board[newR][newC] !== 0) return false;
        }

        for (const part of piece.shape) {
            const newR = r + part.r; const newC = c + part.c;
            const neighbors = [{ dr: 0, dc: 1 }, { dr: 0, dc: -1 }, { dr: 1, dc: 0 }, { dr: -1, dc: 0 }];
            for (const n of neighbors) {
                const checkR = newR + n.dr; const checkC = newC + n.dc;
                if (isWithinBoard(checkR, checkC) && state.board[checkR][checkC] === player.id) return false;
            }
        }

        const isFirstMove = state.playerPieces[player.id].every(p => !p.used);
        if (isFirstMove) {
            return piece.shape.some(part => r + part.r === player.corner.r && c + part.c === player.corner.c);
        } else {
            for (const part of piece.shape) {
                const newR = r + part.r; const newC = c + part.c;
                const cornerNeighbors = [{ dr: -1, dc: -1 }, { dr: -1, dc: 1 }, { dr: 1, dc: -1 }, { dr: 1, dc: 1 }];
                for (const n of cornerNeighbors) {
                    const checkR = newR + n.dr; const checkC = newC + n.dc;
                    if (isWithinBoard(checkR, checkC) && state.board[checkR][checkC] === player.id) return true;
                }
            }
            return false;
        }
    }

    function hasAnyValidMoves(player) {
        if (player.status !== 'active') return false;
        return findFirstValidMove(player) !== null;
    }

    function endGame() {
        const scores = state.players.map(player => {
            const remaining = state.playerPieces[player.id].filter(p => !p.used).reduce((acc, p) => acc + p.shape.length, 0);
            return { name: player.name, score: player.score - remaining, color: player.color, type: player.type };
        });
        scores.sort((a, b) => b.score - a.score);
        const winner = scores[0];

        let winnerText;
        if (scores.length > 1 && scores[0].score === scores[1].score) {
            winnerText = '引き分け!';
            dom.winnerMessage.style.color = '';
        } else {
            winnerText = `${winner.name} の勝利!`;
            dom.winnerMessage.style.color = winner.color;
        }
        dom.winnerMessage.textContent = winnerText;

        dom.finalScores.innerHTML = scores.map(s => {
            const playerTypeDisplay = s.type.startsWith('cpu') ? CPU_LEVEL_NAMES[s.type] : '人間';
            return `<li style="color: ${s.color};">${s.name} (${playerTypeDisplay}): ${s.score}</li>`
        }).join('');
        dom.gameOverModal.style.display = 'flex';
    }

    // =================================================================================
    // CPU LOGIC
    // =================================================================================

    function makeCpuMove() {
        const player = state.players[state.currentPlayerIndex];
        let move;
        switch (player.type) {
            case 'cpu_weak':
                move = findFirstValidMove(player);
                break;
            case 'cpu_medium':
                move = findBestMove_Medium(player);
                break;
            case 'cpu_strong':
                move = findBestMove_Strong(player);
                break;
            case 'cpu_god':
                move = findBestMove_God(player);
                break;
            default:
                move = findFirstValidMove(player);
        }

        if (move) {
            placePiece(move.r, move.c, move.piece, player);
        } else {
            handlePass();
        }
    }

    function findFirstValidMove(player) {
        const availablePieces = state.playerPieces[player.id].filter(p => !p.used);
        for (const piece of availablePieces) {
            const originalShape = piece.shape.map(s => ({ ...s }));
            let currentShape = originalShape;
            for (let i = 0; i < 8; i++) {
                if (i === 4) currentShape = originalShape.map(p => ({ r: p.r, c: -p.c }));
                currentShape = currentShape.map(p => ({ r: p.c, c: -p.r }));
                const pieceToTry = { ...piece, shape: currentShape };
                for (let r = -4; r < BOARD_SIZE; r++) {
                    for (let c = -4; c < BOARD_SIZE; c++) {
                        if (isValidPlacement(r, c, pieceToTry, player)) {
                            return { r, c, piece: pieceToTry };
                        }
                    }
                }
            }
        }
        return null;
    }
    
    function getAllValidMoves(player) {
        const validMoves = [];
        const availablePieces = state.playerPieces[player.id].filter(p => !p.used);

        for (const piece of availablePieces) {
            const originalShape = piece.shape.map(s => ({ ...s }));
            let currentShape = originalShape;
            for (let i = 0; i < 8; i++) {
                if (i === 4) currentShape = originalShape.map(p => ({ r: p.r, c: -p.c }));
                currentShape = currentShape.map(p => ({ r: p.c, c: -p.r }));
                const pieceToTry = { ...piece, shape: currentShape };

                for (let r = -4; r < BOARD_SIZE; r++) {
                    for (let c = -4; c < BOARD_SIZE; c++) {
                        if (isValidPlacement(r, c, pieceToTry, player)) {
                            validMoves.push({ r, c, piece: { ...pieceToTry, shape: pieceToTry.shape.map(s => ({ ...s })) } });
                        }
                    }
                }
            }
        }
        return validMoves;
    }

    function getCandidateMoves(player, limit = 30) {
        const allMoves = getAllValidMoves(player);
        if (allMoves.length <= limit) {
            return allMoves;
        }
        for (let i = allMoves.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [allMoves[i], allMoves[j]] = [allMoves[j], allMoves[i]];
        }
        return allMoves.slice(0, limit);
    }

    function findBestMove_Medium(player) {
        const candidates = getCandidateMoves(player, 30);
        if (candidates.length === 0) return null;
        candidates.sort((a, b) => b.piece.shape.length - a.piece.shape.length);
        return candidates[0];
    }

    function findBestMove_Strong(player) {
        const candidates = getCandidateMoves(player, 30);
        if (candidates.length === 0) return null;

        const scoredMoves = candidates.map(move => {
            const tempBoard = state.board.map(row => [...row]);
            const score = calculateMoveScore(move, player, tempBoard);
            return { move, score: score * 100 + move.piece.shape.length };
        });

        scoredMoves.sort((a, b) => b.score - a.score);
        return scoredMoves[0].move;
    }

    function findBestMove_God(player) {
        const candidates = getCandidateMoves(player, 50);
        if (candidates.length === 0) return null;

        const scoredMoves = candidates.map(move => {
            const score = calculateMoveScore_God(move, player);
            return { move, score };
        });

        scoredMoves.sort((a, b) => b.score - a.score);
        return scoredMoves[0].move;
    }

    function calculateMoveScore(move, player, tempBoard) {
        move.piece.shape.forEach(part => {
            const r = move.r + part.r;
            const c = move.c + part.c;
            if (isWithinBoard(r, c)) tempBoard[r][c] = player.id;
        });

        let newCorners = 0;
        const cornerNeighbors = [{ dr: -1, dc: -1 }, { dr: -1, dc: 1 }, { dr: 1, dc: -1 }, { dr: 1, dc: 1 }];
        const sideNeighbors = [{ dr: 0, dc: 1 }, { dr: 0, dc: -1 }, { dr: 1, dc: 0 }, { dr: -1, dc: 0 }];
        const checkedCorners = new Set();

        for (const part of move.piece.shape) {
            const r = move.r + part.r;
            const c = move.c + part.c;
            for (const corner of cornerNeighbors) {
                const cornerR = r + corner.dr;
                const cornerC = c + corner.dc;
                const cornerKey = `${cornerR},${cornerC}`;

                if (isWithinBoard(cornerR, cornerC) && tempBoard[cornerR][cornerC] === 0 && !checkedCorners.has(cornerKey)) {
                    checkedCorners.add(cornerKey);
                    let isBlocked = false;
                    for (const side of sideNeighbors) {
                        const sideR = cornerR + side.dr;
                        const sideC = cornerC + side.dc;
                        if (isWithinBoard(sideR, sideC) && tempBoard[sideR][sideC] === player.id) {
                            isBlocked = true;
                            break;
                        }
                    }
                    if (!isBlocked) newCorners++;
                }
            }
        }

        move.piece.shape.forEach(part => {
            const r = move.r + part.r;
            const c = move.c + part.c;
            if (isWithinBoard(r, c)) tempBoard[r][c] = 0;
        });

        return newCorners;
    }

    function calculateMoveScore_God(move, player) {
        const tempBoard = state.board.map(row => [...row]);
        const opponents = state.players.filter(p => p.id !== player.id && p.status === 'active');
        let defensiveScore = 0;

        if (opponents.length > 0) {
            const randomOpponent = opponents[Math.floor(Math.random() * opponents.length)];
            const opponentCornersBefore = countTotalAvailableCorners(randomOpponent, tempBoard);

            move.piece.shape.forEach(part => {
                const r = move.r + part.r;
                const c = move.c + part.c;
                if (isWithinBoard(r, c)) tempBoard[r][c] = player.id;
            });

            const opponentCornersAfter = countTotalAvailableCorners(randomOpponent, tempBoard);
            defensiveScore = opponentCornersBefore - opponentCornersAfter;

            move.piece.shape.forEach(part => {
                const r = move.r + part.r;
                const c = move.c + part.c;
                if (isWithinBoard(r, c)) tempBoard[r][c] = 0;
            });
        }

        move.piece.shape.forEach(part => {
            const r = move.r + part.r;
            const c = move.c + part.c;
            if (isWithinBoard(r, c)) tempBoard[r][c] = player.id;
        });
        const offensiveScore = countTotalAvailableCorners(player, tempBoard);

        const W_OFFENSE = 1.0, W_DEFENSE = 1.5, W_PIECE_SIZE = 0.5;
        return (offensiveScore * W_OFFENSE) + (defensiveScore * W_DEFENSE) + (move.piece.shape.length * W_PIECE_SIZE);
    }

    function countTotalAvailableCorners(player, currentBoard) {
        const availableCorners = new Set();
        const cornerNeighbors = [{ dr: -1, dc: -1 }, { dr: -1, dc: 1 }, { dr: 1, dc: -1 }, { dr: 1, dc: 1 }];
        const sideNeighbors = [{ dr: 0, dc: 1 }, { dr: 0, dc: -1 }, { dr: 1, dc: 0 }, { dr: -1, dc: 0 }];

        if (state.playerPieces[player.id].every(p => !p.used)) {
            const r = player.corner.r, c = player.corner.c;
            if (currentBoard[r][c] === 0) availableCorners.add(`${r},${c}`);
            return availableCorners.size;
        }

        for (let r = 0; r < BOARD_SIZE; r++) {
            for (let c = 0; c < BOARD_SIZE; c++) {
                if (currentBoard[r][c] === player.id) {
                    for (const corner of cornerNeighbors) {
                        const cornerR = r + corner.dr, cornerC = c + corner.dc;
                        const cornerKey = `${cornerR},${cornerC}`;
                        if (isWithinBoard(cornerR, cornerC) && currentBoard[cornerR][cornerC] === 0 && !availableCorners.has(cornerKey)) {
                            let isBlocked = false;
                            for (const side of sideNeighbors) {
                                const sideR = cornerR + side.dr, sideC = cornerC + side.dc;
                                if (isWithinBoard(sideR, sideC) && currentBoard[sideR][sideC] === player.id) {
                                    isBlocked = true;
                                    break;
                                }
                            }
                            if (!isBlocked) availableCorners.add(cornerKey);
                        }
                    }
                }
            }
        }
        return availableCorners.size;
    }

    // =================================================================================
    // UI & RENDERING
    // =================================================================================

    function renderBoard() {
        dom.boardContainer.innerHTML = '';
        for (let r = 0; r < BOARD_SIZE; r++) {
            for (let c = 0; c < BOARD_SIZE; c++) {
                const cell = document.createElement('div');
                cell.classList.add('cell');
                cell.dataset.r = r; cell.dataset.c = c;

                if (r === 0 && c === 0) cell.classList.add('corner-blue');
                if (r === 0 && c === 19) cell.classList.add('corner-yellow');
                if (r === 19 && c === 19) cell.classList.add('corner-red');
                if (r === 19 && c === 0) cell.classList.add('corner-green');

                dom.boardContainer.appendChild(cell);
            }
        }
    }

    function renderPlayerPieces() {
        dom.piecesList.innerHTML = '';
        const currentPlayer = state.players[state.currentPlayerIndex];
        if (currentPlayer.status !== 'active') {
            dom.piecesList.innerHTML = `<p>${currentPlayer.status === 'finished' ? '全てのピースを配置しました！' : 'パスしました'}</p>`;
            return;
        }
        const pieces = state.playerPieces[currentPlayer.id];
        pieces.forEach((piece) => {
            if (piece.used) return;
            const pieceEl = document.createElement('div');
            pieceEl.classList.add('piece');
            pieceEl.dataset.pieceId = piece.id;
            const pieceGrid = document.createElement('div');
            pieceGrid.classList.add('piece-grid');
            const shape = piece.shape;
            const minR = Math.min(...shape.map(p => p.r)); const minC = Math.min(...shape.map(p => p.c));
            const normalized = shape.map(p => ({ r: p.r - minR, c: p.c - minC }));
            const grid = Array(5).fill(null).map(() => Array(5).fill(false));
            normalized.forEach(p => { if (p.r < 5 && p.c < 5) grid[p.r][p.c] = true; });
            for (let r = 0; r < 5; r++) {
                for (let c = 0; c < 5; c++) {
                    const cell = document.createElement('div');
                    cell.classList.add('piece-cell');
                    if (grid[r][c]) cell.style.backgroundColor = currentPlayer.color;
                    pieceGrid.appendChild(cell);
                }
            }
            pieceEl.appendChild(pieceGrid);
            pieceEl.addEventListener('click', () => handlePieceSelection(piece, pieceEl));
            dom.piecesList.appendChild(pieceEl);
        });
    }

    function renderPiecePreview(piece, color) {
        const container = dom.piecePreviewContainer;
        container.innerHTML = '';
        if (!piece) return;

        const pieceGrid = document.createElement('div');
        pieceGrid.classList.add('preview-piece-grid');

        const shape = piece.shape;
        const minR = Math.min(...shape.map(p => p.r));
        const maxR = Math.max(...shape.map(p => p.r));
        const minC = Math.min(...shape.map(p => p.c));
        const maxC = Math.max(...shape.map(p => p.c));

        const normalized = shape.map(p => ({ r: p.r - minR, c: p.c - minC }));
        const grid = Array(maxR - minR + 1).fill(null).map(() => Array(maxC - minC + 1).fill(false));
        normalized.forEach(p => { grid[p.r][p.c] = true; });

        const displayGrid = Array(5).fill(null).map(() => Array(5).fill(false));
        const rOffset = Math.floor((5 - grid.length) / 2);
        const cOffset = Math.floor((5 - (grid[0] || []).length) / 2);

        normalized.forEach(p => {
            if ((p.r + rOffset < 5) && (p.c + cOffset < 5)) {
                displayGrid[p.r + rOffset][p.c + cOffset] = true;
            }
        });

        for (let r = 0; r < 5; r++) {
            for (let c = 0; c < 5; c++) {
                const cell = document.createElement('div');
                cell.classList.add('preview-piece-cell');
                if (displayGrid[r][c]) cell.style.backgroundColor = color;
                pieceGrid.appendChild(cell);
            }
        }
        container.appendChild(pieceGrid);
    }

    function updatePreview(show) {
        if (!state.lastHoverCell || !state.selectedPiece) return;
        const { r, c } = state.lastHoverCell;
        const player = state.players[state.currentPlayerIndex];
        const isValid = isValidPlacement(r, c, state.selectedPiece, player);
        state.selectedPiece.shape.forEach(part => {
            const newR = r + part.r; const newC = c + part.c;
            const cell = dom.boardContainer.querySelector(`.cell[data-r='${newR}'][data-c='${newC}']`);
            if (cell) {
                cell.classList.remove('preview-valid', 'preview-invalid');
                if (show) cell.classList.add(isValid ? 'preview-valid' : 'preview-invalid');
            }
        });
    }

    function clearBoardPreview() {
        dom.boardContainer.querySelectorAll('.preview-valid, .preview-invalid').forEach(cell => {
            cell.classList.remove('preview-valid', 'preview-invalid');
        });
    }

    function updateScores() {
        dom.scoreList.innerHTML = '';
        state.players.forEach(player => {
            const remaining = state.playerPieces[player.id].filter(p => !p.used).reduce((acc, p) => acc + p.shape.length, 0);
            const li = document.createElement('li');
            li.innerHTML = `<span>${player.name} (${player.type.startsWith('cpu') ? CPU_LEVEL_NAMES[player.type] : '人間'})</span> <span>${player.score - remaining}</span>`;
            li.style.color = player.color;
            dom.scoreList.appendChild(li);
        });
    }

    function updatePlayerInfoUI(currentPlayer) {
        dom.currentPlayerDisplay.textContent = `${currentPlayer.name} (${currentPlayer.type.startsWith('cpu') ? CPU_LEVEL_NAMES[currentPlayer.type] : '人間'})`;
        dom.currentPlayerDisplay.style.color = currentPlayer.color;
        renderPiecePreview(null);
        dom.rotateBtn.disabled = true;
        dom.flipBtn.disabled = true;
        dom.passBtn.disabled = currentPlayer.type.startsWith('cpu');
    }

    function showSettingsModal() {
        dom.gameOverModal.style.display = 'none';
        dom.gameContainer.style.display = 'none';
        dom.playerSettings.innerHTML = '';
        PLAYERS_CONFIG.forEach(player => {
            const settingEl = document.createElement('div');
            settingEl.classList.add('player-setting');
            settingEl.innerHTML = `
                <label style="color:${player.color}; font-weight: bold;">${player.name}</label>
                <select id="player-type-${player.id}">
                    <option value="human" selected>人間</option>
                    <option value="cpu_weak">CPU (弱)</option>
                    <option value="cpu_medium">CPU (中)</option>
                    <option value="cpu_strong">CPU (強)</option>
                    <option value="cpu_god">CPU (最強)</option>
                </select>
            `;
            dom.playerSettings.appendChild(settingEl);
        });
        dom.settingsModal.style.display = 'flex';
    }

    function triggerInvalidMoveAnimation() {
        dom.boardContainer.classList.add('shake');
        setTimeout(() => dom.boardContainer.classList.remove('shake'), 500);
    }

    // =================================================================================
    // PIECE MANIPULATION
    // =================================================================================

    function rotatePiece() {
        if (!state.selectedPiece) return;
        updatePreview(false);
        state.selectedPiece.shape = state.selectedPiece.shape.map(p => ({ r: p.c, c: -p.r }));
        renderPiecePreview(state.selectedPiece, state.players[state.currentPlayerIndex].color);
        updatePreview(true);
    }

    function flipPiece() {
        if (!state.selectedPiece) return;
        updatePreview(false);
        state.selectedPiece.shape = state.selectedPiece.shape.map(p => ({ r: p.r, c: -p.c }));
        renderPiecePreview(state.selectedPiece, state.players[state.currentPlayerIndex].color);
        updatePreview(true);
    }

    // =================================================================================
    // EVENT HANDLERS & INITIALIZATION
    // =================================================================================

    function handlePieceSelection(piece, element) {
        clearBoardPreview();
        document.querySelectorAll('.piece.selected').forEach(el => el.classList.remove('selected'));
        state.selectedPiece = { ...piece, shape: piece.shape.map(s => ({ ...s })) };
        element.classList.add('selected');
        dom.rotateBtn.disabled = false;
        dom.flipBtn.disabled = false;
        renderPiecePreview(state.selectedPiece, state.players[state.currentPlayerIndex].color);
    }

    function addEventListeners() {
        dom.startGameBtn.addEventListener('click', initializeGame);
        dom.restartBtn.addEventListener('click', showSettingsModal);
        dom.rotateBtn.addEventListener('click', rotatePiece);
        dom.flipBtn.addEventListener('click', flipPiece);
        dom.passBtn.addEventListener('click', () => {
            const currentPlayer = state.players[state.currentPlayerIndex];
            if (currentPlayer && currentPlayer.type === 'human') {
                handlePass();
            }
        });

        dom.boardContainer.addEventListener('mouseover', e => {
            const currentPlayer = state.players[state.currentPlayerIndex];
            if (!currentPlayer || currentPlayer.type !== 'human' || !state.selectedPiece || !e.target.classList.contains('cell')) return;
            updatePreview(false);
            state.lastHoverCell = { r: parseInt(e.target.dataset.r), c: parseInt(e.target.dataset.c) };
            updatePreview(true);
        });

        dom.boardContainer.addEventListener('mouseout', () => {
            const currentPlayer = state.players[state.currentPlayerIndex];
            if (!currentPlayer || currentPlayer.type !== 'human' || !state.selectedPiece) return;
            updatePreview(false);
            state.lastHoverCell = null;
        });

        dom.boardContainer.addEventListener('click', e => {
            const currentPlayer = state.players[state.currentPlayerIndex];
            if (!currentPlayer || currentPlayer.type !== 'human' || !state.selectedPiece || !e.target.classList.contains('cell')) return;
            const r = parseInt(e.target.dataset.r); const c = parseInt(e.target.dataset.c);
            if (isValidPlacement(r, c, state.selectedPiece, currentPlayer)) {
                placePiece(r, c, state.selectedPiece, currentPlayer);
            } else {
                triggerInvalidMoveAnimation();
            }
        });

        dom.rulesBtn.addEventListener('click', () => {
            dom.rulesModal.style.display = 'flex';
        });

        dom.closeBtn.addEventListener('click', () => {
            dom.rulesModal.style.display = 'none';
        });

        window.addEventListener('click', (event) => {
            if (event.target == dom.rulesModal) {
                dom.rulesModal.style.display = 'none';
            }
        });

        dom.rotateBtn.addEventListener('mouseenter', () => {
            if (!state.selectedPiece) return;
            const tempPiece = { ...state.selectedPiece, shape: state.selectedPiece.shape.map(p => ({ r: p.c, c: -p.r })) };
            renderPiecePreview(tempPiece, state.players[state.currentPlayerIndex].color);
        });

        dom.rotateBtn.addEventListener('mouseleave', () => {
            if (!state.selectedPiece) return;
            renderPiecePreview(state.selectedPiece, state.players[state.currentPlayerIndex].color);
        });

        dom.flipBtn.addEventListener('mouseenter', () => {
            if (!state.selectedPiece) return;
            const tempPiece = { ...state.selectedPiece, shape: state.selectedPiece.shape.map(p => ({ r: p.r, c: -p.c })) };
            renderPiecePreview(tempPiece, state.players[state.currentPlayerIndex].color);
        });

        dom.flipBtn.addEventListener('mouseleave', () => {
            if (!state.selectedPiece) return;
            renderPiecePreview(state.selectedPiece, state.players[state.currentPlayerIndex].color);
        });
    }

    // --- INITIAL KICK-OFF ---
    showSettingsModal();
    addEventListeners();
});