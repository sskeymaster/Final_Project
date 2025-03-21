let enemies_count = 0;
var background_music = new Audio("background_music.mp3");
var damage_effect = new Audio("damaged.mp3");
let clouds = [];
let moon = [];
let church = [];
let trees = [];
let sounds_on = true;
let gameState = 'playing';

let soundSlider;

function generateClouds(x, y, weight, speed, x_limit, distance){
        clouds.push({
        color: color(132, 32, 32),
        x: x,
        y: y,
        weight: weight,
        speed: speed,
        x_limit: x_limit,
        distance: distance,
        drawCloud: function(){
            stroke(this.color); //cloud 1
            strokeWeight(this.weight - 200);
            point(this.x - 340, this.y + 90);
            strokeWeight(this.weight - 150);
            point(this.x - 280, this.y + 70);
            strokeWeight(this.weight - 100);
            point(this.x - 200, this.y + 40);
            strokeWeight(this.weight - 50);
            point(this.x - 100, this.y + 20);
            strokeWeight(this.weight);
            point(this.x, this.y);
            strokeWeight(this.weight - 50);
            point(this.x + 100, this.y + 20);
            strokeWeight(this.weight - 100);
            point(this.x + 200, this.y + 40);
            strokeWeight(this.weight - 150);
            point(this.x + 280, this.y + 70);
            strokeWeight(this.weight - 200);
            point(this.x + 340, this.y + 90);
        },
        cloudMove: function(){
            if (this.x < this.x_limit)
                this.x += this.speed;
            else
                this.x = -this.distance;
        }
        });
}

function generateMoon(x, y, weight){
    moon.push({
        color: color(225, 104, 104),
        color_bright: color(245, 124, 124),
        x: x,
        y: y,
        weight: weight,
        drawMoon: function(){
            stroke(this.color); //moon
            strokeWeight(this.weight);
            point(this.x, this.y);
            stroke(this.color_bright);
            strokeWeight(this.weight - 20);
            point(this.x, this.y);
            stroke(this.color); //moon
            strokeWeight(this.weight - 80);
            point(this.x - 30, this.y);
        }
    });
}

function generateChurch(x, y){
    church.push({
        color: color(40, 20, 20),
        x: x,
        y: y,
        drawChurch: function(){
            noStroke();
            fill(this.color);
            rect(this.x, this.y, 300, this.y - 238);
            rect(this.x, this.y - 60, 30, this.y - 250);
            rect(this.x + 270, this.y - 60, 30, this.y - 250);
            triangle(this.x - 10, this.y - 60, this.x + 40, this.y - 60, this.x + 15, this.y - 90);
            triangle(this.x + 260, this.y - 60, this.x + 310, this.y - 60, this.x + 285, this.y - 90);
            triangle(this.x + 60, this.y + 90, this.x + 240, this.y + 70, this.x + 150, this.y - 230);
        }
    });
}

function generateTree(x, y){
    trees.push({
        color: color(24, 22, 21),
        x: x,
        y: y,
        drawTree: function() {
            fill(this.color);
            triangle(this.x, this.y + 23, this.x + 40, this.y + 23, this.x + 20, this.y - 300);
            triangle(this.x + 10, this.y, this.x - 10, this.y - 90, this.x + 10, this.y - 30);
            triangle(this.x + 20, this.y - 120, this.x + 40, this.y - 200, this.x + 20, this.y - 140);
        }
    });
}


function setup() {
    createCanvas(1024, 576);
    background_music.volume = 0.05;
    damage_effect.volume = 0.2;  
    //character
    floor = {
        height: 154,
        color: color(88,10,10),
        drawFloor: function(){
            noStroke();
            fill(this.color);
            rect(0, height - this.height, width, this.height);
        }
    };
    
    gameChar = {
        gameChar_x: 512,
        gameChar_y: 362,
        width: 60,
        height: 60,
        grounded: false,
        speedGravity: -5,
        color: color(255, 250, 250),
        color_dark: color(169, 169, 169),
        dead: false,
        damageSoundPlayed: false,
        windowOpen: false,
        drawCharacter: function(){ //Character - FRONT
            noStroke();
            fill(this.color);
            rect(this.gameChar_x, this.gameChar_y, this.width, this.height);
        },
        gravity: function(){
            if (this.speedGravity > -5)
                this.speedGravity--;
            if (this.gameChar_y + this.height < height - floor.height)
                this.gameChar_y -= this.speedGravity;
            else {
                this.grounded = true;
            }
        },
        jump: function(){
            this.speedGravity = 15;
            this.gameChar_y -= this.speedGravity;
            this.grounded = false;
        },
        moveLeft: function(){
            this.gameChar_x -= 4;
        },
        moveRight: function(){
            this.gameChar_x += 4;
        },
        movement: function(){
            if (!this.dead && !this.windowOpen){
                if (this.grounded && keyIsDown(32))
                    this.jump();
                if (keyIsDown(68))
                    this.moveRight();
                if (gameChar.gameChar_x > 965)
                    gameChar.gameChar_x -= 5;
                if (keyIsDown(65))
                    this.moveLeft();
                if (gameChar.gameChar_x < 0)
                    gameChar.gameChar_x += 5;
            }
        },
        canyonCheck: function(){
            if ((this.gameChar_y + this.height == height - floor.height) && canyon.danger.includes(gameChar.gameChar_x))
                this.dead = true;
        },
        deadSound: function(){
            if (!this.damageSoundPlayed){
                damage_effect.play();
                this.damageSoundPlayed = true;
                if (shadows.game_start){
                   health.health -= 1;
                }
            }
        },
        deadAnimation: function(){
            if (this.dead){
                this.deadSound();
                if (this.gameChar_y <= height)
                    this.gameChar_y -= this.speedGravity;
                else {
                    this.gameChar_y = height - floor.height - this.width;
                    if (this.gameChar_x < 150) {
                        this.gameChar_x = 50;
                    } else {
                        this.gameChar_x = 250;
                    }
                    this.grounded = true;
                    this.dead = false;
                    this.damageSoundPlayed = false;
                    gameState = 'gameOver';
                }
            }
        },
        light: function(){
            if (gameItem.picked_up == true && !window_object.game_over) {
                if (keyIsDown(16) && gameItem.charge > 0) {
                    stroke(gameItem.light_color);
                    strokeWeight(200);
                    point(this.gameChar_x + 27, this.gameChar_y + 30);
                    if ((shadows.enemy_x <= this.gameChar_x + 112) && (shadows.enemy_x >= this.gameChar_x - 112)) {
                        shadows.enemy_dead = true;
                        enemies_count += 1;
                    }
                    gameItem.charge -= 1;
                } 
                else if (gameItem.charge < 100 && keyIsDown(69)) {
                    gameItem.charge += 1;
                }
            }
        }
    };

    generateMoon(150, 100, 300);

    gameItem = {
        item_x: 400,
        item_y: 400,
        light_color: color(245, 222, 179, 50),
        picked_up: false,
        charge: 100,
        drawItem: function(){
            if (this.picked_up == true){
                this.item_x = 800;
                this.item_y = 530;
                textSize(20);
                fill(255, 255, 255);
                text("Press SHIFT to use", this.item_x + 40, this.item_y - 5);
                text("Press E to recharge", this.item_x + 40, this.item_y + 25);
                text(this.charge, 970, 35);
            }
            stroke(0, 0, 0);
            strokeWeight(7);
            fill(212, 166, 55);
            rect(gameItem.item_x, gameItem.item_y, 25, 22);
            fill(0, 0, 0);
            triangle(gameItem.item_x - 2, gameItem.item_y, gameItem.item_x + 27, gameItem.item_y, gameItem.item_x + 12, gameItem.item_y - 20);
            strokeWeight(10);
            point(gameItem.item_x + 12, gameItem.item_y - 25);
        },
        noLight: function(){
            if (this.picked_up == false){
                stroke(this.light_color);
                strokeWeight(150);
                point(this.item_x + 10, this.item_y);
                if (gameChar.gameChar_x >= 350 && gameChar.gameChar_x <= 420 && gameChar.gameChar_y >= 340) {
                    this.picked_up = true;
                }
            }
        }
    };

    generateChurch(400, 330);
    generateTree(830, 400);
    generateClouds(50, 300, 300, 0.8, 1504, 800);
    generateClouds(400, 100, 250, 1.5, 1504, 400);
    
    canyon = {
        color_outside: color(56,5,5),
        color_inside: color(0, 0, 0, 100),
        x: 100,
        y: 422,
        danger: [],
        numbers: function(){
            for (var i = this.x; i <= this.x + 80; i++){
                this.danger.push(i);
            }
        },
        drawCanyon: function(){
            fill(this.color_outside);
            rect(this.x, this.y, this.x + 50, this.y - 268);
            fill(this.color_inside);
            rect(this.x + 10, this.y, this.x + 30, this.y - 100);
        }
    };

    darkness = {
        color_dark: color(0, 0, 0, 200),
        color_light: color(0, 0, 0, 150),
        draw_darkness: function(){
            noStroke();
            if (gameItem.picked_up == false){
                fill(this.color_dark);
            } 
            else {
                fill(this.color_light);
            }
            rect(0, 0, 1024, 576);
        }
    };

    shadows = {
        color: color(0, 0, 0),
        x: 520,
        y: 250,
        width: 50,
        height: 167,
        for_window: false,
        wasCreated: false,
        game_start: false,
        enemy_width: random(10, 50),
        enemy_height: random(40, 167),
        random_list: [],
        enemy_x: random(800, 1024),
        enemy_direction: "left",
        enemy_dead: false,
        numbers: function(){
            for (var i = 0; i <= gameChar.gameChar_x - 250; i++){
                this.random_list.push(i);
            }
            for (var h = gameChar.gameChar_x + 250; h <= 1024; h++) {
                this.random_list.push(h);
            }
        },
        drawShadow: function() {
            if (gameItem.picked_up && !this.wasCreated){
                fill(this.color);
                rect(this.x, this.y, this.width, this.height);
                if (gameChar.gameChar_x > this.x - 65) {
                    this.for_window = true;
                }
            }
            if (this.game_start && !this.enemy_dead && !window_object.game_over){
                noStroke();
                fill(this.color);
                rect(this.enemy_x, height - (this.enemy_height + floor.height), this.enemy_width, this.enemy_height);
                if ((gameChar.gameChar_x < this.enemy_x + this.enemy_width && gameChar.gameChar_x + gameChar.width > this.enemy_x && gameChar.gameChar_y + gameChar.height > height - (this.enemy_height + floor.height))) {
                    gameChar.deadSound();
                    this.enemy_dead = true;
                } else if (this.enemy_direction == "right"){
                    this.enemy_x += 5;
                } else {
                    this.enemy_x -= 5;
                }
                if (this.enemy_x > 1024 || this.enemy_x < 0){
                    this.enemy_dead = true;
                }
            }
        },
        enemySpawn: function(){
            if (this.enemy_dead){
                gameChar.damageSoundPlayed = false;
                this.numbers();
                this.enemy_width = random(10, 50);
                this.enemy_height = random(40, 167);
                this.enemy_x = random(this.random_list);
                if (gameChar.gameChar_x > this.enemy_x){
                    this.enemy_direction = "right";
                } else {
                    this.enemy_direction = "left";
                }
                this.enemy_dead = false;
            }
        }
    };

    health = {
        health: 3,
        color: color(255, 250, 250),
        xy1: 5,
        x23: 20,
        y2: 10,
        y3: 30,
        drawHealth: function(){
            if (shadows.game_start){
                if (this.health >= 1){
                    noStroke();
                    fill(this.color);
                    triangle(this.xy1, this.xy1, this.x23, this.y2, this.x23, this.y3);
                    triangle(this.xy1 + 30, this.xy1, this.x23, this.y2, this.x23, this.y3);
                }
                if (this.health >= 2){
                    noStroke();
                    fill(this.color);
                    triangle(this.xy1 + 40, this.xy1, this.x23 + 40, this.y2, this.x23 + 40, this.y3);
                    triangle(this.xy1 + 70, this.xy1, this.x23 + 40, this.y2, this.x23 + 40, this.y3);
                }
                if (this.health >= 3){
                    noStroke();
                    fill(this.color);
                    triangle(this.xy1 + 80, this.xy1, this.x23 + 80, this.y2, this.x23 + 80, this.y3);
                    triangle(this.xy1 + 110, this.xy1, this.x23 + 80, this.y2, this.x23 + 80, this.y3);
                }
                textSize(20);
                fill(150, 145, 145);
                text("defeated enemies: " + enemies_count, this.xy1, this.xy1 + 50);
            }
        }
    };

    window_object = {
        window_color: color(255, 255, 255, 100),
        window_x: 300,
        window_y: 100,
        game_over: false,
        buttonCreated: false,
        drawWindow: function(){
            if (shadows.for_window){
                gameChar.windowOpen = true;
                fill(this.window_color);
                rect(this.window_x, this.window_y, this.window_x + 200, this.window_y + 20);
                textSize(28);
                fill(255, 255, 255);
                text("Use your light to fight the darkness.", this.window_x + 30, this.window_y + 40);
                text("Press E to start.", this.window_x + 150, this.window_y + 80);
                if (keyIsDown(69)){
                    gameChar.windowOpen = false;
                    shadows.wasCreated = true;
                    shadows.for_window = false;
                    shadows.game_start = true;
                }
            }
            if (health.health <= 0){
                this.game_over = true;
                gameChar.windowOpen = true;
                fill(this.window_color);
                rect(this.window_x, this.window_y, this.window_x + 200, this.window_y + 20);
                textSize(50);
                fill(255, 255, 255);
                text("GAME OVER", this.window_x + 90, this.window_y + 80);
                restartButton.show(); // Показываем кнопку рестарта
                noLoop(); // Останавливаем цикл отрисовки
            }
        }
    };
    
    soundSlider = createSlider(0, 255, 125);
    soundSlider.position(420, 5);
    
    restartButton = createButton('Try again');
    restartButton.size(150, 50);
    restartButton.position(width / 2 - 50, height / 2 + 50); // Позиция по центру
    restartButton.mousePressed(resetGame); // Функция, которая будет вызываться при нажатии
    restartButton.hide(); // Сначала прячем кнопку
}

function resetGame() {
    gameState = 'playing';
    gameChar.dead = false;
    gameChar.windowOpen = false;
    gameChar.gameChar_x = 512;
    gameChar.gameChar_y = 362;
    gameChar.speedGravity = -5;
    gameChar.width = 60;
    gameChar.height = 60;
    gameItem.item_x = 400;
    gameItem.item_y = 400;
    gameItem.charge = 100;
    shadows.wasCreated = false;
    shadows.game_start = false;
    enemies_count = 0;
    gameItem.picked_up = false;
    health.health = 3;
    window_object.game_over = false;
    background_music.play();
    restartButton.hide(); // Скрываем кнопку рестарта
    loop(); // Возобновляем цикл отрисовки (draw)
}

function draw() {
    background_music.play();
    background(179, 57, 57);
    //fill the sky blue
    for (let object of moon){
        object.drawMoon();
    }
    for (let object of clouds){
        object.drawCloud();
        object.cloudMove();
    }
    floor.drawFloor();
    //2. a mountain in the distance
    for (let object of church){
        object.drawChurch();
    } //church
    //3. a tree
    for (let object of trees){
        object.drawTree();
    }
    //4. a canyon 
    //NB. the canyon should go from ground-level to the bottom of the screen
    canyon.drawCanyon();
    canyon.numbers(); //считает опасные x
    //5. a collectable item
    //lantern
    gameItem.drawItem();
    shadows.enemySpawn();
    shadows.drawShadow();
    gameChar.drawCharacter();
    gameItem.noLight();
    darkness.draw_darkness();
    window_object.drawWindow();
    health.drawHealth();
    gameChar.gravity();
    gameChar.movement();
    gameChar.light();
    gameChar.canyonCheck();
    gameChar.deadAnimation();
    
    
    background_music.volume = soundSlider.value() / 255;
    damage_effect.volume = soundSlider.value() / 255;
    console.log("Громкость:", background_music.volume);
}
