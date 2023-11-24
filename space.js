//Iniciar a Board
let tileSize = 32;
let rows = 16;
let columns = 16;

let board;
let boardWidth = tileSize * columns;
let boardHeight = tileSize * rows;
let context;

//Iniciar o Loading Screen
var fundoLoading = new Image(512, 512);
fundoLoading.src = "recursos/loadingScreen.png";

//Inicia o Game Over Screen
var gameOverScreen = new Image(512, 512);
gameOverScreen.src = "recursos/gameOver.png";

//Iniciar o sprite spaceBar
var spaceBar = new Image();
spaceBar.src = "recursos/spaceBar.png";
var spaceBarX = (boardWidth / 2) - 100; //centrar o frame do sprite (largura 200)
var spaceBarY = boardHeight - 150;
var spaceBarSrcX = 0;
var spaceBarSrcY = 0;
var spaceBarSheetWidth = 2000;
var spaceBarSheetHeight = 75;
var spaceBarCols = 10;
var spaceBarFrameWidth = spaceBarSheetWidth / spaceBarCols;
var spaceBarCurrentFrame = 1;

//Iniciar a Nave
let shipWidth = tileSize * 2;
let shipHeight = tileSize;
let shipX = tileSize * columns / 2 - tileSize;
let shipY = tileSize * rows - tileSize * 2;

let ship = {
    x: shipX,
    y: shipY,
    width: shipWidth,
    height: shipHeight
}

let shipImg;
let shipVelocityX = tileSize;

//Iniciar o Sprite
var spriteAbout;
spriteAbout = new Image();
spriteAbout.src = "recursos/Bt1.png";
var spriteX = tileSize;
var spriteY = tileSize;
var spriteVelocityX = 1; //velocidade do sprite

//Iniciar a animação
var totalFrames = 5;
var currentFrame = 0;

//Atualizar a posição de source
var srcX = 0;
var srcY = 0;

//Iniciar os Tiros
let bulletArray = [];
let bulletVelocityY = -10; //velocidade da bala

//5 sprites numa unica linha
var cols = 5;
var row = 1;
//tamanho de cada Sprite
var spriteWidth = spriteAbout.width / cols;
var spriteHeight = spriteAbout.height;

//Detalhes do Sprite
var sprite = {
    img: spriteAbout,
    width: 134,
    height: 50,
    x: spriteX,
    y: spriteY,
    alive: true
}

//Score
var score = 0;

//Game Over
var gameOver = false;

window.onload = function () {
    //Carregar a Board
    board = document.getElementById("board");
    board.width = boardWidth;
    board.height = boardHeight;
    context = board.getContext("2d"); //Para desenhar na board

    //Carregar a Nave
    shipImg = new Image();
    shipImg.src = "recursos/ship.png";
    shipImg.onload = function () {
        context.drawImage(shipImg, ship.x, ship.y, ship.width, ship.height);
    }

    //Atualizar o Canvas
    requestAnimationFrame(update);

    //Aguardar evento de teclado
    document.addEventListener("keydown", moveShip);
    document.addEventListener("keyup", shoot);
}


function update() {
    //Atualizar o Canvas
    requestAnimationFrame(update);
    //Limpar o Canvas
    context.clearRect(0, 0, board.width, board.height);

    //Desenha a nave várias vezes
    context.drawImage(shipImg, ship.x, ship.y, ship.width, ship.height);

    //Definir o frame do Sprite
    currentFrame = currentFrame % totalFrames;
    srcX = currentFrame * sprite.width;

    //Desenha o Score
    context.fillStyle = "white";
    context.font = "18px courier";
    context.fillText(score, 10, 30);

    //Mudar de página
    if (currentFrame == 4) {
        sprite.alive = false;
    }
    if (sprite.alive == false) {
        context.clearRect(0, 0, board.width, board.height);
        context.drawImage(fundoLoading, 0, 0, 512, 512);
        window.location.assign("aboutme.html");
    }

    //Desenha as balas
    for (let i = 0; i < bulletArray.length; i++) {
        let bullet = bulletArray[i];
        bullet.y += bulletVelocityY;
        context.fillStyle = "white";
        context.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);

        //Colisao de balas com Sprites
        if (!bullet.used && detectCollision(bullet, sprite)) {
            bullet.used = true;
            currentFrame++;
            score += 100;
        }
    }

    //Limpa as balas
    while (bulletArray.length > 0 && (bulletArray[0].used || bulletArray[0].y < 0)) {
        bulletArray.shift(); // remove o primeiro elemento do array
    }

    //Mover o Sprite
    if (sprite.alive) {
        sprite.x += spriteVelocityX;

        if (sprite.x + sprite.width >= board.width || sprite.x <= 0) {
            spriteVelocityX *= -1;

            //Mudar o sprite de linha
            sprite.y += sprite.height;
        }
        context.drawImage(spriteAbout, srcX, srcY, sprite.width, sprite.height, sprite.x, sprite.y, sprite.width, sprite.height);

        if (sprite.y >= ship.y) {
            gameOver = true;
        }
    }

    //Quando se perde o jogo (O sprite atinge a nave)
    if (gameOver == true) {
        //Desenha o escrã de Game Over
        context.clearRect(0, 0, board.width, board.height);
        context.drawImage(gameOverScreen, 0, 0, 512, 512);
        context.fillStyle = "white";
        context.font = "bold 25px courier";
        //Desenha a pontuação final
        context.fillText("--------------- " + score, 160, board.height / 2 - 33);

        //Desenha o sprite spaceBar
        //Tentei várias formas diferentes de reduzir a velocidade deste sprite mas não consegui :(
        spaceBarCurrentFrame = ++spaceBarCurrentFrame % spaceBarCols;
        spaceBarSrcX = spaceBarCurrentFrame * spaceBarFrameWidth;
        context.drawImage(spaceBar, spaceBarSrcX, spaceBarSrcY, spaceBarFrameWidth, spaceBarSheetHeight, spaceBarX, spaceBarY, spaceBarFrameWidth, spaceBarSheetHeight);

        //Ao pressionar a tecla espaço, a página dá refresh e o jogo reinicia
        document.body.onkeyup = function (e) {
            if (e.code == "Space") {
                context.clearRect(0, 0, board.width, board.height);
                window.location.assign("index.html");
            }
        }
    }
}

//Função para mover a nave
function moveShip(e) {
    if (e.keyCode == 65 && ship.x - shipVelocityX >= 0 || e.code == "ArrowLeft" && ship.x - shipVelocityX >= 0) {
        ship.x -= shipVelocityX;
    }
    else if (e.keyCode == 68 && ship.x + shipVelocityX + ship.width <= board.width || e.code == "ArrowRight" && ship.x + shipVelocityX + ship.width <= board.width) {
        ship.x += shipVelocityX;
    }
}

//Função de disparar
function shoot(e) {
    if (e.code == "Space") {
        //dispara
        let bullet = {
            x: ship.x + shipWidth * 15 / 32,
            y: ship.y,
            width: tileSize / 8,
            height: tileSize / 2,
            used: false //A bala desaparece quando atinge os alvos
        }
        bulletArray.push(bullet);
    }
}

//Função que deteta colisões
function detectCollision(a, b) {
    return a.x < b.x + b.width &&   //Canto superior esquerdo do a não chega ao canto superior direito de b
        a.x + a.width > b.x &&      //Canto superior esquerdo do a ultrapassa o canto superior esquerdo de b
        a.y < b.y + b.height &&     //Canto superior esquerdo do a não chega ao canto inferior esquerdo de b
        a.y + a.height > b.y;       //Canto inferior esquerdo de a ultrapassa o canto superior esquerdo de b

}