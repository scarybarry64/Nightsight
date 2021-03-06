class Test extends Phaser.Scene {
    constructor() {
        super('testScene');
    }

    preload() {
        // load the necessary images and tile 
        this.load.spritesheet('arrow_left', 'assets/sprites/arrow_left.png', {
            frameWidth: 32, frameHeight: 32, endFrame: 2
        });
        this.load.atlas('Glitch', './assets/sprites/Glitch.png', './assets/sprites/Glitch.json'); //placeholder
        this.load.image('bounds', './assets/sprites/bounds.png'); //placeholder
        this.load.image('bounds_terminal', './assets/sprites/bounds_terminal.png'); //placeholder terminal
        this.load.image('obstacle', './assets/sprites/obstacle.png'); //placeholder


        this.load.image('obstacle_red', './assets/sprites/obstacle_red.png'); // red obstacle
        this.load.image('obstacle_green', './assets/sprites/obstacle_green.png'); // green obstacle
        this.load.image('obstacle_blue', './assets/sprites/obstacle_blue.png'); // blue obstacle
   
       
        this.load.image('eye_closed', './assets/sprites/eye_closed.png');
        this.load.image('eye_open', './assets/sprites/eye_open.png');
        this.load.image('eye_disabled', './assets/sprites/eye_disabled.png');

        // load audio
        this.load.audio('sfx_jump', './assets/audio/Jump19.wav');
        this.load.audio('sfx_stuck', './assets/audio/Hit_Hurt7.wav');
        this.load.audio('sfx_unstuck', './assets/audio/Powerup22.wav');
        this.load.audio('sfx_view', './assets/audio/Pickup_Coin27.wav');
        this.load.audio('sfx_viewOff', './assets/audio/Hit_Hurt29.wav');
        this.load.audio('sfx_slam', './assets/audio/Hit_Hurt39.wav');


    }

    create() {

        // setup movement controls
        this.keyW = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
        this.keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
        this.keyS = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
        this.keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);

        // setup sight controls
        this.keyJ = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.J);
        this.keyK = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.K);
        this.keyL = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.L);

        // create the obstacle particles
        this.particles = this.add.particles('obstacle_red');
        this.particles = this.add.particles('obstacle_green');
        this.particles = this.add.particles('obstacle_blue');

        //Timer variable for vision
        this.timer = 100;
        this.visible = false;

        // spawn player and set its gravity
        this.player = this.physics.add.sprite(game.config.width / 3, 525, 'Glitch', 'Glitch_Running_01');
        this.player.setVelocityY(-500); // initial jump off title screen platform
        this.player.setGravityY(1000); // default gravity

        // player running animation config
        let playerRunAnimConfig = {
            key: 'running',
            frames: this.anims.generateFrameNames('Glitch', {
                prefix: 'Glitch_Running_',
                start: 1,
                end: 8,
                suffix: '',
                zeroPad: 2
            }),
            frameRate: 10,
            repeat: -1
        };

        // player jumping animation config
        let playerJumpAnimConfig = {
            key: 'jumping',
            defaultTextureKey: 'Glitch',
            frames: [
                { frame: 'Glitch_Jumping' }
            ],
            repeat: -1
        };

        // spawn the floor and set it immovable
        let floor = this.physics.add.sprite(game.config.width / 2, game.config.width / 2 + 110, 'bounds_terminal').
            setScale(4, 0.5);
        floor.setImmovable();

        // spawn the roof and set it immovable
        let roof = this.physics.add.sprite(game.config.width / 2, 40, 'bounds_terminal').
            setScale(4, 0.5);
        roof.setImmovable();

        // spawn red floor obstacle
        this.Obstacle1 = new Obstacle(this, game.config.width / 1.5, 542, 'obstacle_red').
            setScale(1, 4).setOrigin(0.5, 1); //Origin currently set at base of sprite
        this.add.existing(this.Obstacle1); //add to display list

        // spawn green floor obstacle
        this.Obstacle2 = new Obstacle(this, game.config.width / 4, 542, 'obstacle_green').
            setScale(2, 2).setOrigin(0.5, 1); //Origin currently set at base of sprite
        this.add.existing(this.Obstacle2); //add to display list

        // spawn blue floor obstacle
        this.Obstacle3 = new Obstacle(this, game.config.width / 2, 542, 'obstacle_blue').
            setScale(Phaser.Math.Between(1.0, 3), Phaser.Math.Between(1.0, 6.5)).setOrigin(0.5, 1); //Origin currently set at base of sprite
        this.add.existing(this.Obstacle3); //add to display list

        // set the collision property of player on objects
        this.physics.add.collider(this.player, floor);
        this.physics.add.collider(this.player, roof);

        // floor obstacles collision 
        this.physics.add.collider(this.player, this.Obstacle1);
        this.physics.add.collider(this.player, this.Obstacle2);
        this.physics.add.collider(this.player, this.Obstacle3);

        // TIME DISPLAY
        this.timeDisplay = this.add.text(game.config.width - 60, 20, 0, {
            fontFamily: 'Consolas',
            fontSize: '48px',
            color: primaryColor,
        });

        //ANIMATION 
        this.anims.create(playerRunAnimConfig);
        this.anims.create(playerJumpAnimConfig);

        // add the left arrow key sprite and set invisible
        this.blink_left = this.add.sprite(centerX - 50, 45, 'blink').setScale(2, 2);
        this.blink_left.alpha = 0;

        // BOOLEAN VARIABLES
        this.isSlamming = false; // keeps track of if player is ground slamming
        this.isGameOver = false; // keeps track of if game should go to game over scene'
        this.canHoldJump = false; // keeps track of if player can continue to gain height in their jump
        game.settings.isStuck = false; //reset the global isStuck variable
        this.allowedToLeft = true;
        this.allowedToRight = true;

        // INTEGER VARIABLES
        this.jumpStartHeight = 0; // used to calculate relative max jump height
        game.settings.scrollSpeed = -200; // global game scroll speed, this is how we imitate time dilation
        this.lefts = 0;
        this.rights = 0;

        // EYE DISPLAY
        this.eyeDisplay = this.add.sprite(30, 44, 'eye_closed');

        // Power variable and display bar
        this.power = maxPower;
        this.powerBar = this.add.rectangle(60, 35, 200, 20, 0x03C04A).setOrigin(0, 0);

        // Camera follow player
        this.cameras.main.startFollow(this.player, false, 0.05, 0.05, 1, 150);


    }

    // Initial Jump made from object, -300 is the smallest possible jump height
    startJump() {
        this.player.setVelocityY(-300);
    }

    // This makes it possible to hold your jump to increase height
    holdJump() {
        // only allow the player to jump 100 units above the 
        // height at which the jump was made
        if (this.player.y > this.jumpStartHeight - 65) {
            this.player.setGravityY(-1500); //negative gravity simulates extending a jump
        } else {
            // else reset the gravity to pull the player to the ground
            this.player.setGravityY(1000);
            this.canHoldJump = false; // disables double jump
        }
    }

    // Ground slam function
    groundSlam() {
        this.player.setVelocityY(850);
    }

    // Spawn the particles after roof obstacle destroyed, param is x and y coord
    spawnParticlesStuck(x, y) {
        this.particles.createEmitter({
            alpha: { start: game.settings.visionEnabled, end: !game.settings.visionEnabled },
            scale: { start: game.settings.collidedRoof.scale, end: 0 },
            //tint: { start: 0xff945e, end: 0xff945e },
            speed: 10,
            accelerationY: 300,
            accelerationX: -300,
            angle: { min: 0, max: 0 },
            rotate: { min: -180, max: 180 },
            lifespan: { min: 1000, max: 1100 },
            blendMode: 'ADD',
            frequency: 110,
            maxParticles: 1,
            x: x,
            y: y,
        });
    }

    // Spawn the particles for each passing obstacle, param is x and y coord
    spawnParticles(x, y) {
        this.particles.createEmitter({
            alpha: { start: game.settings.visionEnabled, end: !game.settings.visionEnabled },
            scale: { start: game.settings.obstacleToDestroy.scale, end: 0 },
            //tint: { start: 0xff945e, end: 0xff945e },
            speed: 10,
            accelerationY: -300,
            accelerationX: -300,
            angle: { min: 0, max: 0 },
            rotate: { min: -180, max: 180 },
            lifespan: { min: 1000, max: 1100 },
            blendMode: 'ADD',
            frequency: 110,
            maxParticles: 1,
            x: x,
            y: y,
        });
    }

    // ** UPDATE FUNCTION **
    update() {

        // Play running animation for player sprite when running
        if (isRunning) {
            this.player.anims.play('running', true);
        }

        // Update timer display
        let timer = Math.floor((this.time.now - initialTime) / 1000);
        this.timeDisplay.text = timer;
        if (timer == 10 && !timerFlag) { // aligns timer to right when 2 digits
            this.timeDisplay.x -= this.timeDisplay.width / 2;
            timerFlag = true;
        }
        else if (timer == 99 && timerFlag) { // aligns when 3 digits
            this.timeDisplay.x -= this.timeDisplay.width / 3;
            timerFlag = false;
        }

        if (timer == 45) {
            game.settings.scrollSpeed == 250;
        }

        // Update floor obstacles
        this.Obstacle1.update();
        this.Obstacle2.update();
        this.Obstacle3.update();

        // Keep the player from flying off the screen when coming
        // in contact with an obstacle while in the air
        if (this.player.body.velocity.x != 0) {
            this.player.setVelocityX(0);
        }

        //JUMP ---
        if (!game.settings.isStuck) {
            // Jump functionality, single jump only
            if (Phaser.Input.Keyboard.JustDown(this.keyW) &&
                this.player.body.touching.down) {
                isRunning = false;
                this.player.anims.play('jumping', true);
                this.jumpStartHeight = this.player.y;
                this.canHoldJump = true;
                this.sound.play('sfx_jump');
                this.startJump();
            }

            // this causes the players jump to be longer if held down
            if (this.keyW.isDown && this.canHoldJump) {
                isRunning = false;
                this.player.anims.play('jumping', true);
                this.holdJump();
            }

            // Let go of jump key and gravity returns to normal
            if (Phaser.Input.Keyboard.JustUp(this.keyW)) {
                this.canHoldJump = false;
                this.currGravity = 1000;
                this.player.setGravityY(1000);
            }

            //END JUMP ---

            // MOVE RIGHT
            if (this.keyD.isDown){
                this.player.flipX = false;
                this.player.x += 1;
            }

            // MOVE LEFT
            if (this.keyA.isDown){
                this.player.flipX = true;
                this.player.x -= 1;
            }

            // ground slam functionality
            if (Phaser.Input.Keyboard.JustDown(this.keyS) &&
                !this.player.body.touching.down) {
                this.isSlamming = true;
                isRunning = false;
                this.player.anims.play('jumping', true);
                this.player.angle = 0;
                this.groundSlam();
            }

            // Spin the player whilst in the air
            if (!this.player.body.touching.down && !this.isSlamming) {
                if(!this.player.flipX) {
                    this.player.angle += 30;
                } else {
                    this.player.angle -= 30;
                }
            }

            // reset the player sprite and angle when back on the ground
            if (this.player.body.touching.down) {
                this.player.anims.play('running', true);
                isRunning = true;
                this.player.angle = 0;
                this.player.setVelocityX(0);
                if (this.isSlamming) {
                    // shake the camera (duration, intensity)
                    this.cameras.main.shake(50, 0.005);
                    this.isSlamming = false;
                    this.sound.play('sfx_slam');
                }
            }
        }

        // Game ends if player is out of bounds or runs out of power
        if ((this.player.x < -10 && !this.isGameOver)) { //} || (this.power <= 0)) {
            // this.music.pause();
            this.isGameOver = true;
            var locScore = JSON.parse(localStorage.getItem('highscore')); //parse the string
            if (timer > game.settings.highScore) {
                game.settings.highScore = timer;
            }
            if (!locScore) {
                localStorage.setItem('highscore', game.settings.highScore);
            }
            this.scene.start('gameOver');
        }

        if (game.settings.spawnParticles) {
            this.spawnParticles(100, game.settings.obstacleToDestroy.y - 10);
            game.settings.spawnParticles = false;
        }

        // Enable use of vision bar after regening to 25% following full depletion
        if (this.power > 25) {
            game.settings.regenDone = true;
            this.eyeDisplay.setTexture('eye_closed');
        }

        // Disable the vision bar if fully depleted
        if (this.power < 1) {
            game.settings.regenDone = false;
            this.eyeDisplay.setTexture('eye_disabled');
        }

        // VISION MECHANIC
        if ((this.keyJ.isDown || this.keyK.isDown || this.keyL.isDown) && this.power > 0 && game.settings.regenDone) {

            if (!game.settings.shownEye) {
                this.sound.play('sfx_view');
                game.settings.shownEye = true;
            }

            // Display obstacles
            this.Obstacle1.makeVisible();
            this.Obstacle2.makeVisible();
            this.Obstacle3.makeVisible();

            // Display open eye
            this.eyeDisplay.setTexture('eye_open');

            // Drain power and decrease power bar
            this.power -= (drainRate / 60);
            if (this.power > 0) {
                this.powerBar.width -= (((200 / maxPower) * drainRate) / 60);
            }
            else {
                this.powerBar.width = 0;
            }
            // console.log("Power is draining: " + this.power);
        }
        else {

            if (game.settings.shownEye) {
                this.sound.play('sfx_viewOff'); //turn off eye
                game.settings.shownEye = false;
            }

            // Hide obstacles
            this.Obstacle1.makeInvisible();
            this.Obstacle2.makeInvisible();
            this.Obstacle3.makeInvisible();

            // Regen power and increase power bar
            if (this.power < maxPower) {
                this.power += (regenRate / 60);
                if (this.power > maxPower) {
                    this.power = maxPower;
                }
                // console.log("Power is regenerating: " + this.power);
            }
            if (this.powerBar.width < 200) {
                this.powerBar.width += (((200 / maxPower) * regenRate) / 60);
                if (this.powerBar.width > 200) {
                    this.powerBar.width = 200;
                }
            }
        }
    }
}