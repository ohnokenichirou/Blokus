document.addEventListener('DOMContentLoaded', () => {
    const BOARD_SIZE = 20;
    const PLAYERS_CONFIG = [
        { id: 1, name: '青', color: 'blue', corner: { r: 0, c: 0 } },
        { id: 2, name: '黄', color: 'yellow', corner: { r: 0, c: 19 } },
        { id: 3, name: '赤', color: 'red', corner: { r: 19, c: 19 } },
        { id: 4, name: '緑', color: 'green', corner: { r: 19, c: 0 } }
    ];
    const PIECE_DEFINITIONS = {
        'I1':[{r:0,c:0}], 'I2':[{r:0,c:0},{r:0,c:1}], 'I3':[{r:0,c:0},{r:0,c:1},{r:0,c:2}], 'V3':[{r:0,c:0},{r:0,c:1},{r:1,c:0}], 'I4':[{r:0,c:0},{r:0,c:1},{r:0,c:2},{r:0,c:3}], 'L4':[{r:0,c:0},{r:1,c:0},{r:2,c:0},{r:2,c:1}], 'O4':[{r:0,c:0},{r:0,c:1},{r:1,c:0},{r:1,c:1}], 'T4':[{r:0,c:0},{r:1,c:0},{r:2,c:0},{r:1,c:1}], 'Z4':[{r:0,c:0},{r:1,c:0},{r:1,c:1},{r:2,c:1}], 'F':[{r:1,c:0},{r:2,c:0},{r:0,c:1},{r:1,c:1},{r:1,c:2}], 'I5':[{r:0,c:0},{r:0,c:1},{r:0,c:2},{r:0,c:3},{r:0,c:4}], 'L5':[{r:0,c:0},{r:0,c:1},{r:0,c:2},{r:0,c:3},{r:1,c:3}], 'N':[{r:1,c:0},{r:2,c:0},{r:0,c:1},{r:1,c:1},{r:0,c:2}], 'P':[{r:0,c:0},{r:1,c:0},{r:0,c:1},{r:1,c:1},{r:0,c:2}], 'T5':[{r:0,c:0},{r:1,c:0},{r:2,c:0},{r:1,c:1},{r:1,c:2}], 'U':[{r:0,c:0},{r:2,c:0},{r:0,c:1},{r:1,c:1},{r:2,c:1}], 'V5':[{r:0,c:0},{r:0,c:1},{r:0,c:2},{r:1,c:2},{r:2,c:2}], 'W':[{r:0,c:0},{r:0,c:1},{r:1,c:1},{r:1,c:2},{r:2,c:2}], 'X':[{r:1,c:0},{r:0,c:1},{r:1,c:1},{r:2,c:1},{r:1,c:2}], 'Y':[{r:0,c:1},{r:1,c:0},{r:1,c:1},{r:1,c:2},{r:1,c:3}], 'Z5':[{r:0,c:0},{r:1,c:0},{r:1,c:1},{r:1,c:2},{r:2,c:2}]
    };
    const CPU_LEVEL_NAMES = {
        'cpu_weak': 'CPU (弱)',
        'cpu_medium': 'CPU (中)',
        'cpu_strong': 'CPU (強)',
        'cpu_god': 'CPU (最強)'
    };

    let board, playerPieces, players, currentPlayerIndex, selectedPiece, lastHoverCell;

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
    };

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

    function initializeGame() {
        dom.settingsModal.style.display = 'none';
        dom.gameContainer.style.display = 'flex';

        board = Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(0));
        players = JSON.parse(JSON.stringify(PLAYERS_CONFIG));
        players.forEach(p => {
            p.type = document.getElementById(`player-type-${p.id}`).value;
            p.status = 'active'; // active, finished
            p.score = 0;
            p.hasPassed = false;
        });

        playerPieces = {};
        players.forEach(p => {
            playerPieces[p.id] = JSON.parse(JSON.stringify(Object.entries(PIECE_DEFINITIONS).map(([name, shape]) => ({ name, shape, used: false, id: name }))));
        });
        
        currentPlayerIndex = -1; // Start at -1 so the first call to updateTurn goes to player 0
        selectedPiece = null;
        lastHoverCell = null;

        dom.boardContainer.innerHTML = '';
        for (let r = 0; r < BOARD_SIZE; r++) {
            for (let c = 0; c < BOARD_SIZE; c++) {
                const cell = document.createElement('div');
                cell.classList.add('cell');
                cell.dataset.r = r; cell.dataset.c = c;
                dom.boardContainer.appendChild(cell);
            }
        }
        dom.gameOverModal.style.display = 'none';
        updateTurn();
    }

    async function updateTurn() {
        // Deadlock check
        let canAnyoneMove = false;
        for (const player of players) {
            if (player.status === 'active' && hasAnyValidMoves(player)) {
                canAnyoneMove = true;
                break;
            }
        }

        if (!canAnyoneMove) {
            endGame();
            return;
        }

        // Find next active player
        let nextPlayerFound = false;
        for (let i = 1; i <= players.length; i++) {
            let nextIndex = (currentPlayerIndex + i) % players.length;
            if (players[nextIndex].status === 'active') {
                currentPlayerIndex = nextIndex;
                nextPlayerFound = true;
                break;
            }
        }
        
        if (!nextPlayerFound) { // Should be unreachable due to deadlock check above, but as a safeguard.
            endGame();
            return;
        }

        const currentPlayer = players[currentPlayerIndex];
        currentPlayer.hasPassed = false; // Reset pass status for their turn
        dom.currentPlayerDisplay.textContent = `${currentPlayer.name} (${currentPlayer.type.startsWith('cpu') ? CPU_LEVEL_NAMES[currentPlayer.type] : '人間'})`;
        dom.currentPlayerDisplay.style.color = currentPlayer.color;
        selectedPiece = null;
        dom.rotateBtn.disabled = true;
        dom.flipBtn.disabled = true;
        dom.passBtn.disabled = currentPlayer.type.startsWith('cpu');
        
        renderPlayerPieces();
        updateScores();

        if (currentPlayer.type.startsWith('cpu')) {
            dom.piecesList.style.pointerEvents = 'none';
            dom.controls.style.pointerEvents = 'none';
            await new Promise(resolve => setTimeout(resolve, 500));
            makeCpuMove();
        } else { // Human player's turn
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

    function makeCpuMove() {
        const player = players[currentPlayerIndex];
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
                move = findFirstValidMove(player); // Fallback
        }

        if (move) {
            placePiece(move.r, move.c, move.piece, player);
        } else {
            handlePass();
        }
    }

    function getCandidateMoves(player, limit = 30) {
        const allMoves = getAllValidMoves(player);
        if (allMoves.length <= limit) {
            return allMoves;
        }
        // Fisher-Yates shuffle to get random moves
        for (let i = allMoves.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [allMoves[i], allMoves[j]] = [allMoves[j], allMoves[i]];
        }
        return allMoves.slice(0, limit);
    }

    function findBestMove_Medium(player) {
        const candidates = getCandidateMoves(player, 30);
        if (candidates.length === 0) {
            return null;
        }
        // From the candidates, pick the one with the largest piece.
        candidates.sort((a, b) => b.piece.shape.length - a.piece.shape.length);
        return candidates[0];
    }

    function findBestMove_Strong(player) {
        const candidates = getCandidateMoves(player, 30);
        if (candidates.length === 0) {
            return null;
        }

        const scoredMoves = candidates.map(move => {
            const tempBoard = board.map(row => [...row]);
            const score = calculateMoveScore(move, player, tempBoard);
            // Tie-break with piece size
            return { move, score: score * 100 + move.piece.shape.length };
        });

        scoredMoves.sort((a, b) => b.score - a.score);

        return scoredMoves[0].move;
    }

    function findBestMove_God(player) {
        const candidates = getCandidateMoves(player, 50);
        if (candidates.length === 0) {
            return null;
        }

        const scoredMoves = candidates.map(move => {
            const score = calculateMoveScore_God(move, player);
            return { move, score };
        });

        scoredMoves.sort((a, b) => b.score - a.score);

        return scoredMoves[0].move;
    }

    function calculateMoveScore_God(move, player) {
        const tempBoard = board.map(row => [...row]);
        const opponents = players.filter(p => p.id !== player.id && p.status === 'active');

        let defensiveScore = 0;
        if (opponents.length > 0) {
            // Pick one random opponent to evaluate against for performance
            const randomOpponent = opponents[Math.floor(Math.random() * opponents.length)];
            const opponentCornersBefore = countTotalAvailableCorners(randomOpponent, tempBoard);
            
            // Place the move temporarily to calculate the opponent's loss
            move.piece.shape.forEach(part => {
                const r = move.r + part.r;
                const c = move.c + part.c;
                if (isWithinBoard(r, c)) {
                    tempBoard[r][c] = player.id;
                }
            });

            const opponentCornersAfter = countTotalAvailableCorners(randomOpponent, tempBoard);
            defensiveScore = opponentCornersBefore - opponentCornersAfter;

            // Revert the board for the next calculation
            move.piece.shape.forEach(part => {
                const r = move.r + part.r;
                const c = move.c + part.c;
                if (isWithinBoard(r, c)) {
                    tempBoard[r][c] = 0;
                }
            });
        }

        // Place the move again to calculate self-gain
        move.piece.shape.forEach(part => {
            const r = move.r + part.r;
            const c = move.c + part.c;
            if (isWithinBoard(r, c)) {
                tempBoard[r][c] = player.id;
            }
        });
        const offensiveScore = countTotalAvailableCorners(player, tempBoard);

        const W_OFFENSE = 1.0;
        const W_DEFENSE = 1.5;
        const W_PIECE_SIZE = 0.5;

        return (offensiveScore * W_OFFENSE) + (defensiveScore * W_DEFENSE) + (move.piece.shape.length * W_PIECE_SIZE);
    }

    function getAllValidMoves(player) {
        const validMoves = [];
        const availablePieces = playerPieces[player.id].filter(p => !p.used);
        
        for (const piece of availablePieces) {
            const originalShape = piece.shape.map(s => ({...s}));
            let currentShape = originalShape;
            for (let i = 0; i < 8; i++) {
                if (i === 4) currentShape = originalShape.map(p => ({ r: p.r, c: -p.c }));
                currentShape = currentShape.map(p => ({ r: p.c, c: -p.r }));
                const pieceToTry = { ...piece, shape: currentShape };

                for (let r = -4; r < BOARD_SIZE; r++) {
                    for (let c = -4; c < BOARD_SIZE; c++) {
                        if (isValidPlacement(r, c, pieceToTry, player)) {
                            validMoves.push({ r, c, piece: { ...pieceToTry, shape: pieceToTry.shape.map(s => ({...s})) } });
                        }
                    }
                }
            }
        }
        return validMoves;
    }

    function calculateMoveScore(move, player, tempBoard) {
        // Temporarily place the piece on the board
        move.piece.shape.forEach(part => {
            const r = move.r + part.r;
            const c = move.c + part.c;
            if (isWithinBoard(r, c)) {
                tempBoard[r][c] = player.id;
            }
        });

        let newCorners = 0;
        const cornerNeighbors = [{dr:-1,dc:-1},{dr:-1,dc:1},{dr:1,dc:-1},{dr:1,dc:1}];
        const sideNeighbors = [{dr:0,dc:1},{dr:0,dc:-1},{dr:1,dc:0},{dr:-1,dc:0}];
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
                    if (!isBlocked) {
                        newCorners++;
                    }
                }
            }
        }

        // Revert the temporary placement
        move.piece.shape.forEach(part => {
            const r = move.r + part.r;
            const c = move.c + part.c;
            if (isWithinBoard(r, c)) {
                tempBoard[r][c] = 0;
            }
        });

        return newCorners;
    }

    function countTotalAvailableCorners(player, currentBoard) {
        const availableCorners = new Set();
        const cornerNeighbors = [{dr:-1,dc:-1},{dr:-1,dc:1},{dr:1,dc:-1},{dr:1,dc:1}];
        const sideNeighbors = [{dr:0,dc:1},{dr:0,dc:-1},{dr:1,dc:0},{dr:-1,dc:0}];

        // First move corner
        if (playerPieces[player.id].every(p => !p.used)) {
            const r = player.corner.r;
            const c = player.corner.c;
            if (currentBoard[r][c] === 0) {
                 availableCorners.add(`${r},${c}`);
            }
            return availableCorners.size;
        }

        for (let r = 0; r < BOARD_SIZE; r++) {
            for (let c = 0; c < BOARD_SIZE; c++) {
                if (currentBoard[r][c] === player.id) {
                    // Check corners of this piece's blocks
                    for (const corner of cornerNeighbors) {
                        const cornerR = r + corner.dr;
                        const cornerC = c + corner.dc;
                        const cornerKey = `${cornerR},${cornerC}`;

                        if (isWithinBoard(cornerR, cornerC) && currentBoard[cornerR][cornerC] === 0 && !availableCorners.has(cornerKey)) {
                            // Check if the corner is valid (not blocked by a side of the same color)
                            let isBlocked = false;
                            for (const side of sideNeighbors) {
                                const sideR = cornerR + side.dr;
                                const sideC = cornerC + side.dc;
                                if (isWithinBoard(sideR, sideC) && currentBoard[sideR][sideC] === player.id) {
                                    isBlocked = true;
                                    break;
                                }
                            }
                            if (!isBlocked) {
                                availableCorners.add(cornerKey);
                            }
                        }
                    }
                }
            }
        }
        return availableCorners.size;
    }

    function placePiece(r, c, pieceToPlace, player) {
        pieceToPlace.shape.forEach(part => {
            const newR = r + part.r; const newC = c + part.c;
            board[newR][newC] = player.id;
            const cell = dom.boardContainer.querySelector(`.cell[data-r='${newR}'][data-c='${newC}']`);
            cell.className = `cell ${player.color}`;
        });
        const originalPiece = playerPieces[player.id].find(p => p.id === pieceToPlace.id);
        originalPiece.used = true;
        selectedPiece = null;

        const allPiecesUsed = playerPieces[player.id].every(p => p.used);
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
        players[currentPlayerIndex].hasPassed = true;
        updateTurn();
    }

    function hasAnyValidMoves(player) {
        if (player.status !== 'active') return false;
        return findFirstValidMove(player) !== null;
    }

    function findFirstValidMove(player) {
        const availablePieces = playerPieces[player.id].filter(p => !p.used);
        for (const piece of availablePieces) {
            const originalShape = piece.shape.map(s => ({...s}));
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

    function isWithinBoard(r, c) {
        return r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE;
    }

    function isValidPlacement(r, c, piece, player) {
        for (const part of piece.shape) {
            const newR = r + part.r; const newC = c + part.c;
            if (!isWithinBoard(newR, newC) || board[newR][newC] !== 0) return false;
        }

        for (const part of piece.shape) {
            const newR = r + part.r; const newC = c + part.c;
            const neighbors = [{dr:0,dc:1},{dr:0,dc:-1},{dr:1,dc:0},{dr:-1,dc:0}];
            for (const n of neighbors) {
                const checkR = newR + n.dr; const checkC = newC + n.dc;
                if (isWithinBoard(checkR, checkC) && board[checkR][checkC] === player.id) return false;
            }
        }

        const isFirstMove = playerPieces[player.id].every(p => !p.used);
        if (isFirstMove) {
            return piece.shape.some(part => r + part.r === player.corner.r && c + part.c === player.corner.c);
        } else {
            for (const part of piece.shape) {
                const newR = r + part.r; const newC = c + part.c;
                const cornerNeighbors = [{dr:-1,dc:-1},{dr:-1,dc:1},{dr:1,dc:-1},{dr:1,dc:1}];
                for (const n of cornerNeighbors) {
                    const checkR = newR + n.dr; const checkC = newC + n.dc;
                    if (isWithinBoard(checkR, checkC) && board[checkR][checkC] === player.id) return true;
                }
            }
            return false;
        }
    }

    function renderPlayerPieces() {
        dom.piecesList.innerHTML = '';
        const currentPlayer = players[currentPlayerIndex];
        if (currentPlayer.status !== 'active') {
            dom.piecesList.innerHTML = `<p>${currentPlayer.status === 'finished' ? '全てのピースを配置しました！' : 'パスしました'}</p>`;
            return;
        }
        const pieces = playerPieces[currentPlayer.id];
        pieces.forEach((piece) => {
            if (piece.used) return;
            const pieceEl = document.createElement('div');
            pieceEl.classList.add('piece');
            pieceEl.dataset.pieceId = piece.id;
            const pieceGrid = document.createElement('div');
            pieceGrid.classList.add('piece-grid');
            const shape = piece.shape;
            const minR = Math.min(...shape.map(p => p.r)); const minC = Math.min(...shape.map(p => p.c));
            const normalized = shape.map(p => ({r: p.r - minR, c: p.c - minC}));
            const grid = Array(5).fill(null).map(() => Array(5).fill(false));
            normalized.forEach(p => { if(p.r < 5 && p.c < 5) grid[p.r][p.c] = true; });
            for(let r = 0; r < 5; r++) {
                for(let c = 0; c < 5; c++) {
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
    
    function handlePieceSelection(piece, element) {
        document.querySelectorAll('.piece.selected').forEach(el => el.classList.remove('selected'));
        selectedPiece = { ...piece, shape: piece.shape.map(s => ({...s})) };
        element.classList.add('selected');
        dom.rotateBtn.disabled = false;
        dom.flipBtn.disabled = false;
    }

    function updatePreview(show) {
        if (!lastHoverCell || !selectedPiece) return;
        const { r, c } = lastHoverCell;
        const player = players[currentPlayerIndex];
        const isValid = isValidPlacement(r, c, selectedPiece, player);
        selectedPiece.shape.forEach(part => {
            const newR = r + part.r; const newC = c + part.c;
            const cell = dom.boardContainer.querySelector(`.cell[data-r='${newR}'][data-c='${newC}']`);
            if (cell) {
                cell.classList.remove('preview-valid', 'preview-invalid');
                if (show) cell.classList.add(isValid ? 'preview-valid' : 'preview-invalid');
            }
        });
    }

    function rotatePiece() { if (!selectedPiece) return; selectedPiece.shape = selectedPiece.shape.map(p => ({ r: p.c, c: -p.r })); updatePreview(true); }
    function flipPiece() { if (!selectedPiece) return; selectedPiece.shape = selectedPiece.shape.map(p => ({ r: p.r, c: -p.c })); updatePreview(true); }

    function updateScores() {
        dom.scoreList.innerHTML = '';
        players.forEach(player => {
            const remaining = playerPieces[player.id].filter(p => !p.used).reduce((acc, p) => acc + p.shape.length, 0);
            const li = document.createElement('li');
            li.innerHTML = `<span>${player.name} (${player.type.startsWith('cpu') ? CPU_LEVEL_NAMES[player.type] : '人間'})</span> <span>${player.score - remaining}</span>`;
            li.style.color = player.color;
            dom.scoreList.appendChild(li);
        });
    }

    function endGame() {
        const scores = players.map(player => {
            const remaining = playerPieces[player.id].filter(p => !p.used).reduce((acc, p) => acc + p.shape.length, 0);
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

    function triggerInvalidMoveAnimation() { dom.boardContainer.classList.add('shake'); setTimeout(() => dom.boardContainer.classList.remove('shake'), 500); }

    // Event Listeners
    dom.startGameBtn.addEventListener('click', initializeGame);
    dom.restartBtn.addEventListener('click', showSettingsModal);
    dom.rotateBtn.addEventListener('click', rotatePiece);
    dom.flipBtn.addEventListener('click', flipPiece);
    dom.passBtn.addEventListener('click', () => { 
        const currentPlayer = players[currentPlayerIndex];
        if (currentPlayer && currentPlayer.type === 'human') {
            handlePass();
        }
    });

    dom.boardContainer.addEventListener('mouseover', e => {
        const currentPlayer = players[currentPlayerIndex];
        if (!currentPlayer || currentPlayer.type !== 'human' || !selectedPiece || !e.target.classList.contains('cell')) return;
        updatePreview(false);
        lastHoverCell = { r: parseInt(e.target.dataset.r), c: parseInt(e.target.dataset.c) };
        updatePreview(true);
    });

    dom.boardContainer.addEventListener('mouseout', () => {
        const currentPlayer = players[currentPlayerIndex];
        if (!currentPlayer || currentPlayer.type !== 'human' || !selectedPiece) return;
        updatePreview(false);
        lastHoverCell = null;
    });

    dom.boardContainer.addEventListener('click', e => {
        const currentPlayer = players[currentPlayerIndex];
        if (!currentPlayer || currentPlayer.type !== 'human' || !selectedPiece || !e.target.classList.contains('cell')) return;
        const r = parseInt(e.target.dataset.r); const c = parseInt(e.target.dataset.c);
        if (isValidPlacement(r, c, selectedPiece, currentPlayer)) {
            placePiece(r, c, selectedPiece, currentPlayer);
        } else {
            triggerInvalidMoveAnimation();
        }
    });

    // Rules Modal Listeners
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

    showSettingsModal();
});
