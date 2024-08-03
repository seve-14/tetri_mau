const canvas = document.getElementById('tetris');
const ctx = canvas.getContext('2d');

const ROWS = 20;
const COLS = 10;
const BLOCK_SIZE = 30;
const UPDATE_INTERVAL = 500; // Tiempo en ms entre actualizaciones

const colors = [
    'cyan', 'blue', 'orange', 'yellow', 'green', 'purple', 'red'
];

const tetrominoes = [
    // I
    [[1, 1, 1, 1]],
    // J
    [[0, 0, 1],
     [1, 1, 1]],
    // L
    [[1, 0, 0],
     [1, 1, 1]],
    // O
    [[1, 1],
     [1, 1]],
    // S
    [[0, 1, 1],
     [1, 1, 0]],
    // T
    [[0, 1, 0],
     [1, 1, 1]],
    // Z
    [[1, 1, 0],
     [0, 1, 1]]
];

let board = Array.from({ length: ROWS }, () => Array(COLS).fill(null));
let currentTetromino, currentPos;
let gameInterval;
let isPaused = false;

function drawBlock(x, y, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
    ctx.strokeRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
}

function drawBoard() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let y = 0; y < ROWS; y++) {
        for (let x = 0; x < COLS; x++) {
            if (board[y][x]) {
                drawBlock(x, y, board[y][x]);
            }
        }
    }
}

function drawTetromino() {
    currentTetromino.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value) {
                drawBlock(currentPos.x + x, currentPos.y + y, colors[0]);
            }
        });
    });
}

function collide(xOffset, yOffset) {
    return currentTetromino.some((row, y) => {
        return row.some((value, x) => {
            if (value) {
                const newX = currentPos.x + x + xOffset;
                const newY = currentPos.y + y + yOffset;
                return (
                    newX < 0 || newX >= COLS ||
                    newY >= ROWS ||
                    (newY >= 0 && board[newY][newX])
                );
            }
            return false;
        });
    });
}

function merge() {
    currentTetromino.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value) {
                board[currentPos.y + y][currentPos.x + x] = colors[0];
            }
        });
    });
}

function removeFullRows() {
    for (let y = ROWS - 1; y >= 0; y--) {
        if (board[y].every(cell => cell)) {
            board.splice(y, 1);
            board.unshift(Array(COLS).fill(null));
        }
    }
}

function rotate() {
    const tempTetromino = currentTetromino[0].map((_, i) =>
        currentTetromino.map(row => row[i]).reverse()
    );
    const tempPos = { ...currentPos };

    if (!collide(0, 0)) {
        currentTetromino = tempTetromino;
    }
}

function move(dx, dy) {
    if (!collide(dx, dy)) {
        currentPos.x += dx;
        currentPos.y += dy;
    } else if (dy > 0) {
        merge();
        removeFullRows();
        newTetromino();
    }
    drawBoard();
    drawTetromino();
}

function newTetromino() {
    currentTetromino = tetrominoes[Math.floor(Math.random() * tetrominoes.length)];
    currentPos = { x: Math.floor(COLS / 2) - 1, y: 0 };

    if (collide(0, 0)) {
        clearInterval(gameInterval);
        document.getElementById('gameOver').style.display = 'block';
    }
}

function update() {
    if (!isPaused) {
        move(0, 1);
    }
}

function startGame() {
    board = Array.from({ length: ROWS }, () => Array(COLS).fill(null));
    newTetromino();
    drawBoard();
    drawTetromino();
    document.getElementById('gameOver').style.display = 'none';
    isPaused = false;
    gameInterval = setInterval(update, UPDATE_INTERVAL);
}

function pauseGame() {
    isPaused = !isPaused;
    const pauseButton = document.getElementById('pauseGame');
    pauseButton.querySelector('span').textContent = isPaused ? 'REANUDAR JUEGO' : 'PAUSAR JUEGO';
}

function restartGame() {
    startGame();
}

document.getElementById('startGame').addEventListener('click', startGame);
document.getElementById('pauseGame').addEventListener('click', pauseGame);
document.getElementById('restartGame').addEventListener('click', restartGame);

document.addEventListener('keydown', (event) => {
    switch (event.key) {
        case 'ArrowLeft':
            move(-1, 0);
            break;
        case 'ArrowRight':
            move(1, 0);
            break;
        case 'ArrowDown':
            move(0, 1);
            break;
        case 'ArrowUp':
            rotate();
            break;
    }
});
