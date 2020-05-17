// Barry Day, Trevor Moropoulos, Lucio Espinoza

// config for game
let config = {
    type: Phaser.CANVAS,
    width: 960,
    height: 640,
    scale: {
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    physics: {
        default: 'arcade',
        arcade: {
            debug: true,
        }
    },
    pixelArt: true,

    scene: [Title, Test, Level_1],
};

// define game
let game = new Phaser.Game(config);

// define globals
let centerX = game.config.width / 2;
let centerY = game.config.height / 2;
let isRunning = false;
let bestLevel = 'level1Scene';
let jSight = true; // the first sight initially on
let kSight = false;
let lSight = false;
let isStuck = false;
let canStick = true;
let isJumping = false;

// settings
game.settings = {
    playerSpeed: 200,
}

// reserve keyboard controls
let keyW, keyA, keyS, keyD, keyJ, keyK, keyL;

