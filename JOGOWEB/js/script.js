const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
canvas.width = 800;
canvas.height = 600;

let playerName = "";
let isMultiplayer = false;
let gameRunning = false;

let ball = {
    x: 0,  
    y: 0,  
    radius: 10,
    dx: 0, 
    dy: 0
};

let playerPaddle = {
    width: 100,
    height: 10,
    x: (canvas.width - 100) / 2,
    y: canvas.height - 20,
    speed: 6,
    dx: 0
};

let computerPaddle = {
    width: 100,
    height: 10,
    x: (canvas.width - 100) / 2,
    y: 10,
    speed: 3 
};

let bricks = [];
const brickRowCount = 3;
const brickColumnCount = 8;
const brickWidth = 75;
const brickHeight = 20;
const brickPadding = 10;
const brickOffsetTop = canvas.height / 2 - 50;
const brickOffsetLeft = 30;
let playerScore = 0;
let computerScore = 0;

function resetBricks() {
    bricks = [];
    for (let row = 0; row < brickRowCount; row++) {
        bricks[row] = [];
        for (let col = 0; col < brickColumnCount; col++) {
            bricks[row][col] = { x: 0, y: 0, status: 1 };
        }
    }
}

function startGame() {
    playerName = prompt("Digite seu nome:");
    if (!playerName) playerName = "Jogador";
    document.getElementById("playerNameDisplay").innerText = `Jogador: ${playerName}`;

    resetBricks();
    playerScore = 0;
    computerScore = 0;

    ball.x = playerPaddle.x + playerPaddle.width / 2;
    ball.y = playerPaddle.y - ball.radius - 5;
    ball.dx = 3;
    ball.dy = -3;

    gameRunning = true;
    gameLoop();
}

function drawBall() {
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fillStyle = "red";
    ctx.fill();
    ctx.closePath();
}

function drawPaddle(paddle, color) {
    ctx.fillStyle = color;
    ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
}

function drawBricks() {
    for (let row = 0; row < brickRowCount; row++) {
        for (let col = 0; col < brickColumnCount; col++) {
            if (bricks[row][col].status === 1) {
                let brickX = col * (brickWidth + brickPadding) + brickOffsetLeft;
                let brickY = row * (brickHeight + brickPadding) + brickOffsetTop;
                bricks[row][col].x = brickX;
                bricks[row][col].y = brickY;
                ctx.fillStyle = "green";
                ctx.fillRect(brickX, brickY, brickWidth, brickHeight);
            }
        }
    }
}

function moveBall() {
    ball.x += ball.dx;
    ball.y += ball.dy;

    if (ball.x - ball.radius < 0 || ball.x + ball.radius > canvas.width) {
        ball.dx *= -1;
    }

    if (ball.y - ball.radius < 0) {
        ball.dy *= -1;
    }

    if (
        ball.y + ball.radius > playerPaddle.y &&
        ball.x > playerPaddle.x &&
        ball.x < playerPaddle.x + playerPaddle.width
    ) {
        ball.dy *= -1;
    }

    if (
        isMultiplayer &&
        ball.y - ball.radius < computerPaddle.y + computerPaddle.height &&
        ball.x > computerPaddle.x &&
        ball.x < computerPaddle.x + computerPaddle.width
    ) {
        ball.dy *= -1;
    }

    if (ball.y + ball.radius > canvas.height) {
        gameRunning = false;
        alert(`${playerName} perdeu!`);
        document.location.reload();
    }
}

function movePaddle() {
    playerPaddle.x += playerPaddle.dx;
    if (playerPaddle.x < 0) playerPaddle.x = 0;
    if (playerPaddle.x + playerPaddle.width > canvas.width) playerPaddle.x = canvas.width - playerPaddle.width;
}

function moveComputerPaddle() {
    if (Math.abs(computerPaddle.x + computerPaddle.width / 2 - ball.x) > 10) {
        if (computerPaddle.x + computerPaddle.width / 2 < ball.x) {
            computerPaddle.x += computerPaddle.speed;
        } else {
            computerPaddle.x -= computerPaddle.speed;
        }
    }
}

function drawScore() {
    document.getElementById("playerScore").innerText = `${playerName}: ${playerScore}`;
    if (isMultiplayer) {
        document.getElementById("computerScore").style.display = "inline";
        document.getElementById("computerScore").innerText = `Computador: ${computerScore}`;
    }
}

function detectCollision() {
    for (let row = 0; row < brickRowCount; row++) {
        for (let col = 0; col < brickColumnCount; col++) {
            let brick = bricks[row][col];
            if (brick.status === 1) {
                if (
                    ball.x > brick.x &&
                    ball.x < brick.x + brickWidth &&
                    ball.y > brick.y &&
                    ball.y < brick.y + brickHeight
                ) {
                    ball.dy *= -1;
                    brick.status = 0;
                    if (ball.dy > 0) {
                        playerScore++;
                    } else {
                        computerScore++;
                    }
                }
            }
        }
    }

    let remainingBricks = bricks.flat().filter(brick => brick.status === 1).length;
    if (remainingBricks === 0) {
        gameRunning = false;
        alert(`${playerScore > computerScore ? playerName : "Computador"} venceu!`);
        document.location.reload();
    }
}

function update() {
    if (!gameRunning) return;
    moveBall();
    movePaddle();
    if (isMultiplayer) moveComputerPaddle();
    detectCollision();
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBricks();
    drawBall();
    drawPaddle(playerPaddle, "blue");
    if (isMultiplayer) drawPaddle(computerPaddle, "red");
    drawScore();
}

function gameLoop() {
    if (!gameRunning) return;
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

document.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") playerPaddle.dx = -playerPaddle.speed;
    if (e.key === "ArrowRight") playerPaddle.dx = playerPaddle.speed;
});

document.addEventListener("keyup", () => {
    playerPaddle.dx = 0;
});

document.getElementById("startBtn").addEventListener("click", () => {
    isMultiplayer = false;
    startGame();
});

document.getElementById("multiBtn").addEventListener("click", () => {
    isMultiplayer = true;
    startGame();
});
