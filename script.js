document.addEventListener('DOMContentLoaded', () => {
    // =================================================================================
    // CONSTANTS & CONFIGURATION
    // =================================================================================

    const BOARD_SIZE = 20;


    // === Helper: determine if it's this player's first move by scanning the board ===
    function isPlayersFirstMoveOnBoard(player, board) {
        for (let r = 0; r < BOARD_SIZE; r++) {
            for (let c = 0; c < BOARD_SIZE; c++) {
                if (board[r][c] === player.id) return false;
            }
        }
        return true;
    }
    const PLAYERS_CONFIG = [
        { id: 1, name: '青', color: 'blue', hex: '#007bff', corner: { r: 0, c: 0 } },
        { id: 2, name: '黄', color: 'yellow', hex: '#FFBF00', corner: { r: 0, c: 19 } },
        { id: 3, name: '赤', color: 'red', hex: '#dc3545', corner: { r: 19, c: 19 } },
        { id: 4, name: '緑', color: 'green', hex: '#28a745', corner: { r: 19, c: 0 } }
    ];
    const PIECE_DEFINITIONS = {
        'I1': [{ r: 0, c: 0 }], 'I2': [{ r: 0, c: 0 }, { r: 0, c: 1 }], 'I3': [{ r: 0, c: 0 }, { r: 0, c: 1 }, { r: 0, c: 2 }], 'V3': [{ r: 0, c: 0 }, { r: 0, c: 1 }, { r: 1, c: 0 }], 'I4': [{ r: 0, c: 0 }, { r: 0, c: 1 }, { r: 0, c: 2 }, { r: 0, c: 3 }], 'L4': [{ r: 0, c: 0 }, { r: 1, c: 0 }, { r: 2, c: 0 }, { r: 2, c: 1 }], 'O4': [{ r: 0, c: 0 }, { r: 0, c: 1 }, { r: 1, c: 0 }, { r: 1, c: 1 }], 'T4': [{ r: 0, c: 0 }, { r: 1, c: 0 }, { r: 2, c: 0 }, { r: 1, c: 1 }], 'Z4': [{ r: 0, c: 0 }, { r: 1, c: 0 }, { r: 1, c: 1 }, { r: 2, c: 1 }], 'F': [{ r: 1, c: 0 }, { r: 2, c: 0 }, { r: 0, c: 1 }, { r: 1, c: 1 }, { r: 1, c: 2 }], 'I5': [{ r: 0, c: 0 }, { r: 0, c: 1 }, { r: 0, c: 2 }, { r: 0, c: 3 }, { r: 0, c: 4 }], 'L5': [{ r: 0, c: 0 }, { r: 0, c: 1 }, { r: 0, c: 2 }, { r: 0, c: 3 }, { r: 1, c: 3 }], 'N': [{ r: 1, c: 0 }, { r: 2, c: 0 }, { r: 0, c: 1 }, { r: 1, c: 1 }, { r: 0, c: 2 }], 'P': [{ r: 0, c: 0 }, { r: 1, c: 0 }, { r: 0, c: 1 }, { r: 1, c: 1 }, { r: 0, c: 2 }], 'T5': [{ r: 0, c: 0 }, { r: 1, c: 0 }, { r: 2, c: 0 }, { r: 1, c: 1 }, { r: 1, c: 2 }], 'U': [{ r: 0, c: 0 }, { r: 2, c: 0 }, { r: 0, c: 1 }, { r: 1, c: 1 }, { r: 2, c: 1 }], 'V5': [{ r: 0, c: 0 }, { r: 0, c: 1 }, { r: 0, c: 2 }, { r: 1, c: 2 }, { r: 2, c: 2 }], 'W': [{ r: 0, c: 0 }, { r: 0, c: 1 }, { r: 1, c: 1 }, { r: 1, c: 2 }, { r: 2, c: 2 }], 'X': [{ r: 1, c: 0 }, { r: 0, c: 1 }, { r: 1, c: 1 }, { r: 2, c: 1 }, { r: 1, c: 2 }], 'Y': [{ r: 0, c: 1 }, { r: 1, c: 0 }, { r: 1, c: 1 }, { r: 1, c: 2 }, { r: 1, c: 3 }], 'Z5': [{ r: 0, c: 0 }, { r: 1, c: 0 }, { r: 1, c: 1 }, { r: 1, c: 2 }, { r: 2, c: 2 }]
    };
    const CPU_LEVEL_NAMES = {
        'cpu_weak': 'CPU (弱)',
        'cpu_medium': 'CPU (中)',
        'cpu_strong': 'CPU (強)',
        'cpu_god': 'CPU (最強)',
        'cpu_random': 'CPU (ランダム)'
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
    // AI LOGIC & HELPERS
    // =================================================================================

    const THINK_TIME_MS = 2000;
    const MIN_DEPTH = 1;
    const MAX_DEPTH = 6;
    const BEAM_WIDTH = [24, 16, 10, 8, 6, 4];
    const PIECE_ORIENTATIONS = new Map();

    function buildPieceOrientations() {
        if (PIECE_ORIENTATIONS.size > 0) return;
        for (const [name, base] of Object.entries(PIECE_DEFINITIONS)) {
            const seen = new Set();
            const list = [];
            const variants = [];
            let s = base.map(p => ({ ...p }));
            for (let i = 0; i < 4; i++) { variants.push(s.map(p => ({ ...p }))); s = rotate90(s); }
            s = flipX(base);
            for (let i = 0; i < 4; i++) { variants.push(s.map(p => ({ ...p }))); s = rotate90(s); }
            for (const v of variants) {
                const key = shapeKey(v);
                if (seen.has(key)) continue;
                seen.add(key);
                const n = normalizeShape(v);
                const maxR = Math.max(...n.map(p => p.r)), maxC = Math.max(...n.map(p => p.c));
                list.push({ shape: n, key, bbox: { h: maxR + 1, w: maxC + 1 } });
            }
            PIECE_ORIENTATIONS.set(name, list);
        }
    }
    function normalizeShape(shape) {
        const minR = Math.min(...shape.map(p => p.r)), minC = Math.min(...shape.map(p => p.c));
        const norm = shape.map(p => ({ r: p.r - minR, c: p.c - minC }));
        norm.sort((a, b) => a.r === b.r ? a.c - b.c : a.r - b.r);
        return norm;
    }
    function rotate90(shape) { return shape.map(p => ({ r: p.c, c: -p.r })); }
    function flipX(shape) { return shape.map(p => ({ r: p.r, c: -p.c })); }
    function shapeKey(shape) {
        const n = normalizeShape(shape);
        return n.map(p => `${p.r},${p.c}`).join('|');
    }

    function findNextActivePlayer(currentPlayerId) {
        const currentIndex = state.players.findIndex(p => p.id === currentPlayerId);
        for (let i = 1; i <= state.players.length; i++) {
            const nextIndex = (currentIndex + i) % state.players.length;
            if (state.players[nextIndex].status === 'active') {
                return state.players[nextIndex];
            }
        }
        return null; // No other active players
    }

    function getCornerAnchors(player, board) {
        const anchors = new Set();
        const cornerN = [{ dr: -1, dc: -1 }, { dr: -1, dc: 1 }, { dr: 1, dc: -1 }, { dr: 1, dc: 1 }];
        const sideN = [{ dr: 0, dc: 1 }, { dr: 0, dc: -1 }, { dr: 1, dc: 0 }, { dr: -1, dc: 0 }];
        const isFirst = isPlayersFirstMoveOnBoard(player, board);
        if (isFirst) {
            const { r, c } = player.corner;
            if (board[r][c] === 0) anchors.add(`${r},${c}`);
            return anchors;
        }
        for (let r = 0; r < BOARD_SIZE; r++) {
            for (let c = 0; c < BOARD_SIZE; c++) {
                if (board[r][c] !== player.id) continue;
                for (const cn of cornerN) {
                    const rr = r + cn.dr, cc = c + cn.dc;
                    if (!isWithinBoard(rr, cc) || board[rr][cc] !== 0) continue;
                    let blocked = false;
                    for (const sn of sideN) {
                        const sr = rr + sn.dr, sc = cc + sn.dc;
                        if (isWithinBoard(sr, sc) && board[sr][sc] === player.id) { blocked = true; break; }
                    }
                    if (!blocked) anchors.add(`${rr},${cc}`);
                }
            }
        }
        return anchors;
    }
    function getAllValidMoves(player, board) {
        const valid = [];
        const seenMoves = new Set();
        if (player.status !== 'active') return valid;
        const anchors = getCornerAnchors(player, board);
        if (anchors.size === 0) return valid;
        const pieces = state.playerPieces[player.id].filter(p => !p.used);
        for (const piece of pieces) {
            const orients = PIECE_ORIENTATIONS.get(piece.name);
            for (const o of orients) {
                for (const cell of o.shape) {
                    for (const a of anchors) {
                        const [ar, ac] = a.split(',').map(Number);
                        const baseR = ar - cell.r, baseC = ac - cell.c;
                        const moveKey = `${o.key}|${baseR},${baseC}`;
                        if (seenMoves.has(moveKey)) {
                            continue;
                        }
                        const pieceToTry = { id: piece.id, name: piece.name, shape: o.shape };
                        if (isValidPlacement(baseR, baseC, pieceToTry, player, board)) {
                            valid.push({ r: baseR, c: baseC, piece: { ...pieceToTry, shape: pieceToTry.shape.map(s => ({ ...s })) } });
                            seenMoves.add(moveKey);
                        }
                    }
                }
            }
        }
        return valid;
    }
    function evaluateMoveFast(move, player, board) {
        const temp = board.map(r => r.slice());
        move.piece.shape.forEach(part => {
            const r = move.r + part.r, c = move.c + part.c;
            temp[r][c] = player.id;
        });
        const myMob = countTotalAvailableCorners(player, temp);
        const opps = state.players.filter(p => p.id !== player.id && p.status === 'active');
        let oppBlock = 0;
        if (opps.length) {
            let before = 0, after = 0;
            for (const o of opps) { before += countTotalAvailableCorners(o, board); after += countTotalAvailableCorners(o, temp); }
            oppBlock = (before - after) / opps.length;
        }
        const center = (BOARD_SIZE - 1) / 2;
        let centerBonus = 0;
        for (const part of move.piece.shape) {
            const r = move.r + part.r, c = move.c + part.c;
            centerBonus += 1 - (Math.abs(r - center) + Math.abs(c - center)) / BOARD_SIZE;
        }
        centerBonus /= move.piece.shape.length;
        const used = state.playerPieces[player.id].filter(p => p.used).length;
        const phase = used / Object.keys(PIECE_DEFINITIONS).length;
        let W_OFF = 1.1, W_DEF = 2.0, W_SZ = (1 - phase) - 0.5 * phase, W_C = 0.5;
        if (player.personality === "aggressive") {
            W_OFF = 1.0; W_DEF = 3.0; W_SZ = (1 - phase) - 0.4 * phase; W_C = 0.3;
        }
        if (player.personality === "defensive") {
            W_OFF = 2.0; W_DEF = 1.0; W_SZ = (1 - phase) - 0.6 * phase; W_C = 0.4;
        }
        return myMob * W_OFF + oppBlock * W_DEF + move.piece.shape.length * W_SZ + centerBonus * W_C;
    }
    function shouldInjectNoise() {
        const totalUsed = state.players.flatMap(p => state.playerPieces[p.id]).filter(p => p.used).length;
        return totalUsed < 10;
    }
    function pickMoveWithNoise(moves, bestMove) {
        const topK = moves.slice(0, 4);
        const temperature = 0.5;
        const maxS = topK[0].orderScore;
        const weights = topK.map(m => Math.exp((m.orderScore - maxS) / temperature));
        const sum = weights.reduce((a, b) => a + b, 0);
        let r = Math.random() * sum;
        for (let i = 0; i < topK.length; i++) { r -= weights[i]; if (r <= 0) return topK[i]; }
        return bestMove;
    }
    function findBestMove_Weak(player, board) {
        const moves = getAllValidMoves(player, board);
        if (moves.length === 0) return null;
        return moves[Math.floor(Math.random() * moves.length)];
    }
    function findBestMove_Medium(player, board) {
        const moves = getAllValidMoves(player, board);
        if (moves.length === 0) return null;
        moves.forEach(m => m.orderScore = evaluateMoveFast(m, player, board));
        moves.sort((a, b) => b.orderScore - a.orderScore);
        const top = moves.slice(0, 3);
        return top[Math.floor(Math.random() * top.length)];
    }
    function findBestMove_Strong(player, board) {
        const moves = getAllValidMoves(player, board);
        if (moves.length === 0) return null;
        moves.forEach(m => m.orderScore = evaluateMoveFast(m, player, board));
        moves.sort((a, b) => b.orderScore - a.orderScore);
        const top = moves.slice(0, 2);
        return top[Math.floor(Math.random() * top.length)];
    }
    function findBestMove_God(player, board) {
        const start = performance.now(), deadline = start + THINK_TIME_MS;
        let moves = getAllValidMoves(player, board);
        if (moves.length === 0) return null;
        moves.forEach(m => { m.orderScore = evaluateMoveFast(m, player, board); });
        moves.sort((a, b) => b.orderScore - a.orderScore);
        let bestMove = moves[0], bestScore = -Infinity, searchedAtLeastOnce = false;
        const ttLocal = new Map();
        for (let depth = MIN_DEPTH; depth <= MAX_DEPTH; depth++) {
            const width = BEAM_WIDTH[Math.min(depth - 1, BEAM_WIDTH.length - 1)];
            const beam = moves.slice(0, Math.max(4, Math.min(width, moves.length)));
            let alpha = -1e9, beta = 1e9, updatedBest = false;
            for (const mv of beam) {
                if (performance.now() > deadline) break;
                const temp = board.map(r => r.slice());
                mv.piece.shape.forEach(p => { temp[mv.r + p.r][mv.c + p.c] = player.id; });
                const nextPlayer = findNextActivePlayer(player.id);
                let score = 0;
                if (nextPlayer) {
                    score = -negamax(nextPlayer, temp, depth - 1, -beta, -alpha, deadline, ttLocal);
                }
                if (score > bestScore) { bestScore = score; bestMove = mv; updatedBest = true; }
                if (score > alpha) alpha = score;
                searchedAtLeastOnce = true;
                if (alpha >= beta || performance.now() > deadline) break;
            }
            if (!updatedBest && performance.now() > deadline) break;
            if (performance.now() > deadline) break;
            moves.sort((a, b) => (a === bestMove ? 1 : 0) - (b === bestMove ? 1 : 0) || (b.orderScore - a.orderScore));
        }
        if (!searchedAtLeastOnce) return moves[0];
        if (shouldInjectNoise()) return pickMoveWithNoise(moves, bestMove);
        return bestMove;
    }
    function negamax(player, board, depth, alpha, beta, deadline, tt) {
        if (performance.now() > deadline) return 0;
        if (depth === 0) return quiesce(player, board, alpha, beta);
        const key = computeBoardHash(board) ^ player.id;
        const ttE = transpositionTable.get(key) || tt.get(key);
        if (ttE && ttE.depth >= depth) {
            if (ttE.flag === 'EXACT') return ttE.score;
            if (ttE.flag === 'LOWER' && ttE.score > alpha) alpha = ttE.score;
            else if (ttE.flag === 'UPPER' && ttE.score < beta) beta = ttE.score;
            if (alpha >= beta) return ttE.score;
        }
        const moves = getAllValidMoves(player, board);
        if (moves.length === 0) {
            const anyone = state.players.some(p => p.status === 'active' && hasAnyValidMoves(p));
            if (!anyone) return 0;
            const nextPlayer = findNextActivePlayer(player.id);
            if (!nextPlayer) return 0; // All other players are inactive
            return -negamax(nextPlayer, board, depth - 1, -beta, -alpha, deadline, tt);
        }
        for (const m of moves) { m.orderScore = evaluateMoveFast(m, player, board); }
        moves.sort((a, b) => b.orderScore - a.orderScore);
        const width = BEAM_WIDTH[Math.min(depth - 1, BEAM_WIDTH.length - 1)];
        const beam = moves.slice(0, Math.max(4, Math.min(width, moves.length)));
        let best = -1e9, flag = 'UPPER';
        for (const mv of beam) {
            if (performance.now() > deadline) break;
            mv.piece.shape.forEach(p => { board[mv.r + p.r][mv.c + p.c] = player.id; });
            const nextPlayer = findNextActivePlayer(player.id);
            let score = 0;
            if (nextPlayer) {
                score = -negamax(nextPlayer, board, depth - 1, -beta, -alpha, deadline, tt);
            }
            mv.piece.shape.forEach(p => { board[mv.r + p.r][mv.c + p.c] = 0; });
            if (score > best) { best = score; }
            if (score > alpha) { alpha = score; flag = 'EXACT'; }
            if (alpha >= beta) { flag = 'LOWER'; break; }
        }
        const entry = { score: best, depth, flag };
        transpositionTable.set(key, entry); tt.set(key, entry);
        return best;
    }
    function quiesce(player, board, alpha, beta) {
        const myMob = getAllValidMoves(player, board).length;
        const nextIdx = (state.players.findIndex(p => p.id === player.id) + 1) % state.players.length;
        const opp = state.players[nextIdx];
        const oppMob = getAllValidMoves(opp, board).length;
        const score = (myMob - oppMob) * 0.5;
        if (score >= beta) return beta;
        if (score > alpha) alpha = score;
        return alpha;
    }

    const ZOBRIST_TABLE = Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(null).map(() => Array(5).fill(null).map(() => Math.floor(Math.random() * Number.MAX_SAFE_INTEGER)))); // 5 for 4 players + 1 empty
    let transpositionTable = new Map();

    function computeBoardHash(board) {
        let hash = 0;
        for (let r = 0; r < BOARD_SIZE; r++) {
            for (let c = 0; c < BOARD_SIZE; c++) {
                if (board[r][c] !== 0) { // 0 is empty
                    hash ^= ZOBRIST_TABLE[r][c][board[r][c]];
                }
            }
        }
        return hash;
    }

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

            if (p.type === 'cpu_random') {
                const cpuLevels = ['cpu_weak', 'cpu_medium', 'cpu_strong', 'cpu_god'];
                const randomIndex = Math.floor(Math.random() * cpuLevels.length);
                p.actualType = cpuLevels[randomIndex];
            } else {
                p.actualType = p.type;
            }
        });

        state.players.forEach(p => {
            state.playerPieces[p.id] = JSON.parse(JSON.stringify(Object.entries(PIECE_DEFINITIONS).map(([name, shape]) => ({ name, shape, used: false, id: name }))));
        });

        const personalities = ["aggressive", "defensive", "balanced"];
        state.players.forEach(p => {
            p.personality = personalities[Math.floor(Math.random() * personalities.length)];
        });
    }

    // =================================================================================
    // CORE GAME LOGIC
    // =================================================================================

    function initializeGame() {
        dom.settingsModal.style.display = 'none';
        dom.gameContainer.style.display = 'flex';
        dom.gameOverModal.style.display = 'none';

        transpositionTable.clear();
        initializeState();
        renderBoard();
        updateTurn();
    }

    async function updateTurn() {
        clearBoardPreview();

        const activePlayers = state.players.filter(p => p.status === 'active');
        const allPassed = activePlayers.length > 0 && activePlayers.every(p => p.hasPassed);
        if (allPassed) {
            endGame();
            return;
        }

        let canAnyoneMove = false;
        for (const player of activePlayers) {
            if (hasAnyValidMoves(player)) {
                canAnyoneMove = true;
                break;
            }
        }

        if (!canAnyoneMove) {
            endGame();
            return;
        }

        let nextPlayerIndex = state.currentPlayerIndex;
        do {
            nextPlayerIndex = (nextPlayerIndex + 1) % state.players.length;
        } while (state.players[nextPlayerIndex].status !== 'active');
        state.currentPlayerIndex = nextPlayerIndex;

        const currentPlayer = state.players[state.currentPlayerIndex];
        state.selectedPiece = null;

        updatePlayerInfoUI(currentPlayer);
        renderPlayerPieces();
        updateScores();

        if (currentPlayer.hasPassed) {
            updateTurn();
            return;
        }

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

        // A piece was placed, so reset pass status for everyone
        state.players.forEach(p => p.hasPassed = false);

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

    function isValidPlacement(r, c, piece, player, board) {
        // Check if the piece is within the board and doesn't overlap with existing pieces
        for (const part of piece.shape) {
            const newR = r + part.r;
            const newC = c + part.c;
            if (!isWithinBoard(newR, newC) || board[newR][newC] !== 0) return false;
        }

        // Check for adjacent pieces of the same color (not allowed)
        for (const part of piece.shape) {
            const newR = r + part.r;
            const newC = c + part.c;
            const neighbors = [{ dr: 0, dc: 1 }, { dr: 0, dc: -1 }, { dr: 1, dc: 0 }, { dr: -1, dc: 0 }];
            for (const n of neighbors) {
                const checkR = newR + n.dr;
                const checkC = newC + n.dc;
                if (isWithinBoard(checkR, checkC) && board[checkR][checkC] === player.id) return false;
            }
        }

        // For the first move, it must touch the player's corner
        const isFirstMove = isPlayersFirstMoveOnBoard(player, board);
        if (isFirstMove) {
            return piece.shape.some(part => r + part.r === player.corner.r && c + part.c === player.corner.c);
        } else {
            // For subsequent moves, it must touch a corner of an existing piece of the same color
            for (const part of piece.shape) {
                const newR = r + part.r;
                const newC = c + part.c;
                const cornerNeighbors = [{ dr: -1, dc: -1 }, { dr: -1, dc: 1 }, { dr: 1, dc: -1 }, { dr: 1, dc: 1 }];
                for (const n of cornerNeighbors) {
                    const checkR = newR + n.dr;
                    const checkC = newC + n.dc;
                    if (isWithinBoard(checkR, checkC) && board[checkR][checkC] === player.id) return true;
                }
            }
            return false;
        }
    }

    function hasAnyValidMoves(player) {
        if (player.status !== 'active') return false;
        return findFirstValidMove(player, state.board) !== null;
    }

    function endGame() {
        const scores = state.players.map(player => {
            const remaining = state.playerPieces[player.id].filter(p => !p.used).reduce((acc, p) => acc + p.shape.length, 0);
            return { name: player.name, score: player.score - remaining, color: player.hex, type: player.type };
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
        const cpuType = player.actualType;
        let move;
        switch (cpuType) {
            case 'cpu_weak':
                move = findFirstValidMove(player, state.board);
                break;
            case 'cpu_medium':
                move = findBestMove_Medium(player, state.board);
                break;
            case 'cpu_strong':
                move = findBestMove_Strong(player, state.board);
                break;
            case 'cpu_god':
                move = findBestMove_God(player, state.board);
                break;
            default:
                move = findFirstValidMove(player, state.board);
        }

        if (move) {
            placePiece(move.r, move.c, move.piece, player);
        } else {
            handlePass();
        }
    }

    function findFirstValidMove(player, board) {
        const allMoves = getAllValidMoves(player, board);
        if (allMoves.length === 0) return null;

        const movesMade = state.playerPieces[player.id].filter(p => p.used).length;
        if (player.type.startsWith('cpu') && movesMade < 3) {
            // For weak CPU, "best" is not well-defined. Let's use piece size as a simple heuristic.
            allMoves.sort((a, b) => {
                const sizeDiff = b.piece.shape.length - a.piece.shape.length;
                if (sizeDiff !== 0) return sizeDiff;
                return Math.random() - 0.5;
            });
            const topMoves = allMoves.slice(0, 4);
            if (topMoves.length > 0) {
                return topMoves[Math.floor(Math.random() * topMoves.length)];
            }
        }

        // Outside of early game, just pick a random move from all possible moves.
        return allMoves[Math.floor(Math.random() * allMoves.length)];
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
        if (!currentPlayer || currentPlayer.status !== 'active') {
            dom.piecesList.innerHTML = `<p>${!currentPlayer ? '' : (currentPlayer.status === 'finished' ? '全てのピースを配置しました！' : 'パスしました')}</p>`;
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
                    if (grid[r][c]) cell.style.backgroundColor = currentPlayer.hex;
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
        const isValid = isValidPlacement(r, c, state.selectedPiece, player, state.board);
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
            li.style.color = player.hex;
            dom.scoreList.appendChild(li);
        });
    }

    function updatePlayerInfoUI(currentPlayer) {
        dom.currentPlayerDisplay.textContent = `${currentPlayer.name} (${currentPlayer.type.startsWith('cpu') ? CPU_LEVEL_NAMES[currentPlayer.type] : '人間'})`;
        dom.currentPlayerDisplay.style.color = currentPlayer.hex;
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
                <label style="color:${player.hex}; font-weight: bold;">${player.name}</label>
                <select id="player-type-${player.id}">
                    <option value="human" selected>人間</option>
                    <option value="cpu_weak">CPU (弱)</option>
                    <option value="cpu_medium">CPU (中)</option>
                    <option value="cpu_strong">CPU (強)</option>
                    <option value="cpu_god">CPU (最強)</option>
                    <option value="cpu_random">CPU (ランダム)</option>
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
        renderPiecePreview(state.selectedPiece, state.players[state.currentPlayerIndex].hex);
        updatePreview(true);
    }

    function flipPiece() {
        if (!state.selectedPiece) return;
        updatePreview(false);
        state.selectedPiece.shape = state.selectedPiece.shape.map(p => ({ r: p.r, c: -p.c }));
        renderPiecePreview(state.selectedPiece, state.players[state.currentPlayerIndex].hex);
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
        renderPiecePreview(state.selectedPiece, state.players[state.currentPlayerIndex].hex);
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
            if (isValidPlacement(r, c, state.selectedPiece, currentPlayer, state.board)) {
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
    }

    // --- INITIAL KICK-OFF ---
    buildPieceOrientations();
    showSettingsModal();
    addEventListeners();
});
