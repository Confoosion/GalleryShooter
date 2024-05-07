class Mover extends Phaser.Scene {
    constructor() {
        super("movementScene");
        this.my = {sprite: {}};

        this.playerX = 400;
        this.playerY = 575;

        // this.bulletX = this.playerX;
        // this.bulletY = this.playerY;
        this.bulletCD = 5;
        this.bulletCDTimer = 0;
        
        this.keyA = null;
        this.keyD = null;
        this.spaceKey = null;
        this.keyR = null;

        this.health = 3;
        this.highscore = 0;
        this.score = 0;
        this.wave = 1;
        this.waveTimer = 0;

        this.gameOver = false;

        this.my.sprite.enemyFormation1 = [];   
        this.enemyFormation1Size = 20;

        this.my.sprite.enemyFormation2_Left = [];
        this.enemyFormation2_LeftSize = 20;
        this.my.sprite.enemyFormation2_Right = [];
        this.enemyFormation2_RightSize = 20;

        this.my.sprite.enemyFormation3 = [];
        this.enemyFormation3Size = 10;
        this.enemyBulletCD = 40;
        this.enemyBulletCDTimer = 0;
    }

    preload()
    {
        this.load.setPath("./assets/");

        this.load.image("player", "tile_ramp_right.png");

        this.load.image("bullet", "red_hand_peace.png");

        this.load.image("basicEnemy_blue", "blue_body_circle.png");
        
        this.load.image("movingEnemy_green", "green_body_circle.png");

        this.load.image("shootingEnemy_purple", "purple_body_circle.png");

        this.load.image("enemyBullet", "tile_cloud.png");

        this.load.audio("shoot", "tone1.ogg");

        this.load.audio("hitPlayer", "pepSound1.ogg");
        
        this.load.audio("hitEnemy", "phaserUp5.ogg");

        this.load.audio("enemyShoot", "laser6.ogg");

        this.load.audio("nextWave", "threeTone2.ogg");
        
        this.load.audio("winGame", "powerUp9.ogg");

        document.getElementById('description').innerHTML = '<h2>A - move left // D - move right<br>Space - shoot</h2>'
    }

    create()
    {
        let my = this.my;
        
        // PLAYER
        my.sprite.player = this.add.sprite(this.playerX, this.playerY, "player");
        my.sprite.player.scale = 0.4;
        my.sprite.player.angle = 135;

        // BULLETS
        my.sprite.bulletGroup = this.add.group({
            defaultKey: "bullet",
            maxSize: 3
        })
        my.sprite.bulletGroup.createMultiple({
            active: false,
            visible: false,
            key: my.sprite.bulletGroup.defaultKey,
            repeat: my.sprite.bulletGroup.maxSize-1
        });

        // ENEMIES
        this.createFormation(my.sprite.enemyFormation1, this.enemyFormation1Size, "basicEnemy_blue");   // BASIC BLUE CIRCLES
    
        this.createFormation(my.sprite.enemyFormation2_Left, this.enemyFormation2_LeftSize, "movingEnemy_green");   // MOVING GREEN CIRCLES (LEFT SIDE)
        
        this.createFormation(my.sprite.enemyFormation2_Right, this.enemyFormation2_RightSize, "movingEnemy_green"); // MOVING GREEN CIRCLES (RIGHT SIDE)

        this.createFormation(my.sprite.enemyFormation3, this.enemyFormation3Size, "shootingEnemy_purple");  // SHOOTING PURPLE CIRCLES

        // ENEMY BULLETS
        my.sprite.enemyBulletGroup = this.add.group({
            defaultKey: "enemyBullet",
            maxSize: 10
        })
        my.sprite.enemyBulletGroup.createMultiple({
            active: false,
            visible: false,
            key: my.sprite.enemyBulletGroup.defaultKey,
            repeat: my.sprite.enemyBulletGroup.maxSize-1
        });

        // PLAYER INPUT KEYS
        this.keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
        this.keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.keyR = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);

        // TEXT
        this.highscoreText = this.add.text(16, 16, "High Score: 0", { fontSize: '32px', fill: "#FFF"});
        this.scoreText = this.add.text(16, 48, "Score: 0", { fontSize: '32px', fill: '#FFF' });
        this.wavesText = this.add.text(784, 48, "Wave 1", { fontSize: '32px', fill: "#FFF"});
        this.wavesText.setOrigin(1);
        this.livesText = this.add.text(784, 80, "Lives: 3", { fontSize: '32px', fill: "#FFF"});
        this.livesText.setOrigin(1);

        this.gameOverText = this.add.text(400, 200, "GAME OVER", { fontSize: '64px', fill: "#FFF"});
        this.gameOverText.setOrigin(0.5);
        this.gameOverText.visible = false;
        this.winText = this.add.text(400, 250, "You won!", { fontSize: '48px', fill: "#FFF"});
        this.winText.setOrigin(0.5);
        this.winText.visible = false;
        this.loseText = this.add.text(400, 250, "You died!", { fontSize: '48px', fill: "#FFF"});
        this.loseText.setOrigin(0.5);
        this.loseText.visible = false;
        this.highscoreDisplay = this.add.text(400, 325, "!! NEW HIGHSCORE !!", { fontSize: "48px", fill: "#FFF"});
        this.highscoreDisplay.setOrigin(0.5);
        this.highscoreDisplay.visible = false;
        this.restartText = this.add.text(400, 400, "press \"R\" to restart the game", { fontSize: "32px", fill: "#FFF"});
        this.restartText.setOrigin(0.5);
        this.restartText.visible = false;
    }

    update()
    {
        let my = this.my;
        if(!this.gameOver)
        {
            this.bulletCDTimer--;
            this.enemyBulletCDTimer--;
            this.waveTimer++;
        
            if(this.spaceKey.isDown)
            {
                if(this.bulletCDTimer < 0)
                {
                    let bullet = my.sprite.bulletGroup.getFirstDead();
                    if(bullet != null)
                    {
                        this.sound.play("shoot");
                        bullet.active = true;
                        bullet.visible = true;
                        bullet.x = my.sprite.player.x;
                        bullet.y = my.sprite.player.y - 25;
                        bullet.scale = 0.5;
                        this.bulletCDTimer = this.bulletCD;
                    }
                }
            }
            for(let bullet of my.sprite.bulletGroup.getChildren())
            {
                if(bullet.y < -30)
                {
                    bullet.active = false;
                    bullet.visible = false;
                }
                this.checkBulletCollision(my.sprite.enemyFormation1, bullet);
                
                this.checkBulletCollision(my.sprite.enemyFormation2_Left, bullet);
            
                this.checkBulletCollision(my.sprite.enemyFormation2_Right, bullet);
        
                this.checkBulletCollision(my.sprite.enemyFormation3, bullet);
            }
            my.sprite.bulletGroup.incY(-20);

            if(this.wave == 1)
            {
                if(this.waveTimer == 25)
                {
                    this.spawnBasicWave(0, 5);
                }
                else if(this.waveTimer == 75)
                {
                    this.spawnBasicWave(5, 10);
                }
                
                else if(this.waveTimer == 150)
                {
                    this.spawnBasicWave(10, 15);
                }
                else if(this.waveTimer == 275)
                {
                    this.spawnBasicWave(15, 20);
                }
                else if(this.waveTimer == 400)
                {
                    this.spawnBasicWave(0, 5);
                }
                else if(this.waveTimer == 600)
                {
                    this.makeNextWave();
                }
            }
            else if(this.wave == 2)
            {
                if(this.waveTimer == 25)
                {
                    this.spawnMovingWave(my.sprite.enemyFormation2_Left, "Left", 0, 4);
                    this.spawnMovingWave(my.sprite.enemyFormation2_Right, "Right", 0, 4);
                }
                else if(this.waveTimer == 75)
                {
                    this.spawnBasicWave(5, 10);
                }
                else if(this.waveTimer == 100)
                {
                    this.spawnBasicWave(10, 15);
                }
                else if(this.waveTimer == 125)
                {
                    this.spawnBasicWave(15, 20);
                }
                else if(this.waveTimer == 225)
                {
                    this.spawnMovingWave(my.sprite.enemyFormation2_Left, "Left", 8, 12);
                    this.spawnMovingWave(my.sprite.enemyFormation2_Right, "Right", 4, 8);
                }
                else if(this.waveTimer == 425)
                {
                    this.makeNextWave();
                }
            }
            else if(this.wave == 3)
            {
                if(this.waveTimer == 25)
                {
                    this.spawnShootingWave(0, 5);
                }
                if(this.waveTimer == 325)
                {
                    this.makeNextWave();
                }
            }
            else if(this.wave == 4)
            {
                if(this.waveTimer == 25)
                {
                    this.spawnShootingWave(5, 10);
                    this.spawnBasicWave(0, 5);
                }
                else if(this.waveTimer == 125)
                {
                    this.spawnMovingWave(my.sprite.enemyFormation2_Left, "Left", 0, 4);
                    this.spawnMovingWave(my.sprite.enemyFormation2_Right, "Right", 0, 4);
                }
                else if(this.waveTimer == 200)
                {
                    this.spawnMovingWave(my.sprite.enemyFormation2_Left, "Left", 4, 8);
                    this.spawnMovingWave(my.sprite.enemyFormation2_Right, "Right", 4, 8);
                }
                else if(this.waveTimer == 300)
                {
                    this.spawnBasicWave(5, 10);
                    this.spawnBasicWave(10, 15);
                }
                else if(this.waveTimer == 500)
                {
                    this.makeNextWave();
                }
            }
            if(this.wave == 5)
            {
                if(this.waveTimer == 25)
                {
                    this.spawnShootingWave(0, 5);
                    this.spawnBasicWave(15, 20);
                    this.spawnMovingWave(my.sprite.enemyFormation2_Left, "Left", 0, 4);
                    this.spawnMovingWave(my.sprite.enemyFormation2_Right, "Right", 0, 4);
                }
                else if(this.waveTimer == 225)
                {
                    this.spawnShootingWave(5, 10);
                    this.spawnBasicWave(0, 5);
                    this.spawnMovingWave(my.sprite.enemyFormation2_Left, "Left", 4, 8);
                    this.spawnMovingWave(my.sprite.enemyFormation2_Right, "Right", 4, 8);
                }
                else if(this.waveTimer == 425)
                {
                    this.spawnBasicWave(5, 10);
                    this.spawnMovingWave(my.sprite.enemyFormation2_Left, "Left", 8, 12);
                    this.spawnMovingWave(my.sprite.enemyFormation2_Right, "Right", 8, 12);
                }
                else if(this.waveTimer > 800)
                {
                    this.sound.play("winGame");
                    this.score += 1000;
                    this.gameOver = true;
                }
            }

            for(let enemy of my.sprite.enemyFormation1)
            {
                if(enemy.visible)
                {
                    enemy.y += 2;
                }
                if(enemy.y > 650)
                {
                    enemy.visible = false;
                }
                this.checkEnemyCollision(enemy);
            }
            for(let enemy of my.sprite.enemyFormation2_Left)
            {
                if(enemy.visible)
                {
                    enemy.y += 3;
                    if(enemy.y < 250)
                    {
                        enemy.x += 3;
                    }
                    else if (enemy.y < 400)
                    {
                        enemy.x -= 3;
                    }
                    else if(enemy.y > 650)
                    {
                        enemy.visible = false;
                    }
                    else
                    {
                        enemy.x += 3;
                    }
                }
                this.checkEnemyCollision(enemy);
            }
            for(let enemy of my.sprite.enemyFormation2_Right)
            {
                if(enemy.visible)
                {
                    enemy.y += 3;
                    if(enemy.y < 250)
                    {
                        enemy.x -= 3;
                    }
                    else if (enemy.y < 400)
                    {
                        enemy.x += 3;
                    }
                    else if(enemy.y > 650)
                    {
                        enemy.visible = false;
                    }
                    else
                    {
                        enemy.x -= 3;
                    }
                }
                this.checkEnemyCollision(enemy);
            }
            for(let enemy of my.sprite.enemyFormation3)
            {
                if(enemy.visible)
                {
                    var randomMovement = Math.floor(Math.random() * 2); 
                    enemy.y += 1.75;
                    if(randomMovement == 0)
                    {
                        enemy.x += 6;
                    }
                    else if(randomMovement == 1)
                    {
                        enemy.x -= 6;
                    }

                    var willShoot = Math.floor(Math.random() * 5);
                    if(willShoot == 1)
                    {
                        if(this.enemyBulletCDTimer < 0)
                        {
                            this.sound.play("enemyShoot");
                            let enemyBullet = my.sprite.enemyBulletGroup.getFirstDead();
                            if(enemyBullet != null)
                            {
                                enemyBullet.active = true;
                                enemyBullet.visible = true;
                                enemyBullet.x = enemy.x;
                                enemyBullet.y = enemy.y + 20;
                                enemyBullet.scale = 0.3;
                                this.enemyBulletCDTimer = 10 + Math.floor(Math.random() * this.enemyBulletCD);
                            }
                        }
                    }
                    if(enemy.y > 650)
                    {
                        enemy.visible = false;
                    }
                }
                this.checkEnemyCollision(enemy);
            }
            for(let enemyBullet of my.sprite.enemyBulletGroup.getChildren())
            {
                if(enemyBullet.y > 630)
                {
                    enemyBullet.active = false;
                    enemyBullet.visible = false;
                }
                if(this.collides(my.sprite.player, enemyBullet))
                {
                    this.sound.play("hitPlayer");
                    enemyBullet.x = -100;
                    enemyBullet.y = 700;
                    this.health--;
                    this.livesText.setText("Lives: " + this.health);
                    this.checkGameOver();
                }
                
            }
            my.sprite.enemyBulletGroup.incY(10);

            if(this.keyA.isDown)
            {
                if(my.sprite.player.x > 35)
                {
                    my.sprite.player.x -= 12;
                }
            }
            if(this.keyD.isDown)
            {
                if(my.sprite.player.x < 765)
                {
                    my.sprite.player.x += 12;
                }
            }
        }
        else
        {
            this.gameOverText.visible = true;
            this.restartText.visible = true;
            if(this.health <= 0)
            {
                this.loseText.visible = true;
            }
            else
            {
                this.scoreText.setText("Score: " + this.score);
                this.winText.visible = true;
            }

            if(this.score > this.highscore)
            {
                this.highscore = this.score;
                this.highscoreDisplay.visible = true;
            }

            if(this.keyR.isDown)
            {
                this.restartGame();
            }
        }
    }

    collides(a, b) {
        if (Math.abs(a.x - b.x) > (a.displayWidth/2 + b.displayWidth/2)) return false;
        if (Math.abs(a.y - b.y) > (a.displayHeight/2 + b.displayHeight/2)) return false;
        return true;
    }

    createFormation(group, groupSize, sprite)
    {
        for (let i = 0; i < groupSize; i++)
        {
            // create a sprite which is offscreen and invisible
            group.push(this.add.sprite(-100, -100, sprite));
            group[i].visible = false;
            group[i].scale = 0.4;
        }
    }

    checkBulletCollision(object, bullet)
    {
        for(let enemy of object)
        {
            if(this.collides(enemy, bullet))
            {
                this.sound.play("hitEnemy");
                enemy.y = 700;
                enemy.visible = false;
                bullet.x = -300;
                bullet.y = -100;
                if(object == this.my.sprite.enemyFormation1)
                {
                    this.updateScore(10);
                }
                else if(object == this.my.sprite.enemyFormation2_Left || object == this.my.sprite.enemyFormation2_Right)
                {
                    this.updateScore(20);
                }
                else
                {
                    this.updateScore(30);
                }
            }
        }
    }

    checkEnemyCollision(enemy)
    {
        if(this.collides(enemy, this.my.sprite.player))
        {
            this.sound.play("hitPlayer");
            enemy.y = -100;
            enemy.visible = false;
            this.health--;
            this.livesText.setText("Lives: " + this.health);
            this.checkGameOver();
        }
    }

    checkGameOver()
    {
        if(this.health <= 0)
        {
            this.gameOver = true;
        }
    }

    updateScore(points)
    {
        this.score += points
        this.scoreText.setText("Score: " + this.score);
    }

    spawnBasicWave(begin, end)
    {
        let xValue = Math.floor(Math.random() * 400);
        for (let i = begin; i < end; i++) {
            this.my.sprite.enemyFormation1[i].x = i%5 * 100 + xValue;
            this.my.sprite.enemyFormation1[i].y = -100;
            this.my.sprite.enemyFormation1[i].visible = true;
        }
    }

    spawnMovingWave(enemies, path, begin, end)
    {
        for(let i = begin; i < end; i++)
        {
            if(path == "Left")
            {
                enemies[i].x = -(i%4*60) + 50;
                enemies[i].y = -(i%4*60) -50;
            }
            else
            {
                enemies[i].x = (i%4*60) + 750;
                enemies[i].y = -(i%4*60) -50;
            }
            enemies[i].visible = true;
        }
    }

    spawnShootingWave(begin, end)
    {
        for(let i = begin; i < end; i++)
        {
            this.my.sprite.enemyFormation3[i].x = Math.floor(Math.random() * 500) + 50;
            this.my.sprite.enemyFormation3[i].y = -(i%5*120)-50;
            this.my.sprite.enemyFormation3[i].visible = true;
        }
    }

    makeNextWave()
    {
        this.sound.play("nextWave");
        this.wave++;
        this.waveTimer = 0;
        this.wavesText.setText("Wave " + this.wave);
    }

    restartGame()
    {   
        // RESET VARIABLES
        this.playerX = 400;
        this.playerY = 575;

        this.bulletCDTimer = 0;

        this.health = 3;
        this.score = 0;
        this.wave = 1;
        this.waveTimer = 0;

        this.enemyBulletCDTimer = 0;

        // RESET TEXT
        this.highscoreText.setText("High Score: " + this.highscore);
        this.scoreText.setText("Score: 0");
        this.wavesText.setText("Wave 1");
        this.livesText.setText("Lives: 3");

        this.gameOverText.visible = false;
        this.winText.visible = false;
        this.loseText.visible = false;
        this.highscoreDisplay.visible = false;
        this.restartText.visible = false;

        // RESET OBJECTS
        for(let bullet of this.my.sprite.bulletGroup.getChildren())
        {
            bullet.active = false;
            bullet.visible = false;
        }
        this.resetEnemyPosition(this.my.sprite.enemyFormation1);
        this.resetEnemyPosition(this.my.sprite.enemyFormation2_Left);
        this.resetEnemyPosition(this.my.sprite.enemyFormation2_Right);
        this.resetEnemyPosition(this.my.sprite.enemyFormation3);
        for(let enemyBullet of this.my.sprite.enemyBulletGroup.getChildren())
        {
            enemyBullet.active = false;
            enemyBullet.visible = false;
        }

        this.gameOver = false;
    }

    resetEnemyPosition(enemies)
    {
        for(let enemy of enemies)
        {
            enemy.x = -100;
            enemy.y = -100;
            enemy.visible = false;
        }
    }
}