const startBtn = document.getElementById('startButton');
const topCurtain = document.getElementById('top-curtain');
const curtain = document.getElementById('curtain-down');
const resetBtn = document.getElementById('resetButton');

resetBtn.addEventListener('click', () => {
    window.location.reload();
});

startBtn.addEventListener('click', () => {

    const canvas = document.getElementById('canvas1');
    const ctx = canvas.getContext('2d');
    const canvasWidth = canvas.width = 1400;
    const canvasHeight = canvas.height = 700;

    curtain.style.top = '-110%';
    topCurtain.style.top = '-110%';
    startBtn.style.display = 'none';

    class InputHandler {
        constructor() {
            this.keys = [];
            window.addEventListener('keydown', (e) => {
            if ((
                    e.key === 'ArrowDown' ||
                    e.key === 'ArrowUp' ||
                    e.key === 'ArrowLeft' ||
                    e.key === 'ArrowRight')
                    && this.keys.indexOf(e.key) === -1) {
                this.keys.push(e.key);
            }
            });
            window. addEventListener('keyup', (e) => {
                if (    e.key === 'ArrowDown' ||
                        e.key === 'ArrowUp' ||
                        e.key === 'ArrowLeft' ||
                        e.key === 'ArrowRight') {
                    this.keys.splice(this.keys.indexOf(e.key), 1);
                }
            });
        }
    }

    class Player {
        constructor(gameWidth, gameHeight) {
            this.gameWidth = gameWidth;
            this.gameHeight = gameHeight;
            this.width = 128;
            this.height = 128;
            this.x = 10;
            this.y = this.gameHeight - this.height - 100;
            this.image = document.getElementById('playerImage');
            this.frameX = 0;
            this.frameY = 0;
            this.speed = 0;
            this.vy = 0;
            this.weight = 1;
            this.prevX = this.x;
            this.prevY = this.y;
            this.jumpCooldown = 800; // ms
            this.lastJumpTime = 0;
            // --- HITBOX SETTINGS ---
            this.hitboxWidth = 40;
            this.hitboxHeight = this.height - 50;
            this.hitboxOffsetX = (this.width - this.hitboxWidth) / 2;

            this.hitboxOffsetY = 50;

            this.grounded = false;
        }
        draw(context) {
            // DEBUG HITBOX
            context.strokeStyle = 'transparent';
            context.strokeRect(
                this.x + this.hitboxOffsetX,
                this.y + this.hitboxOffsetY,
                this.hitboxWidth,
                this.hitboxHeight
            );
            context.drawImage(this.image, this.frameX * this.width, this.frameY * this.height, this.width, this.height, this.x, this.y, this.width, this.height);
        }
        update(input, platforms, background) {
        
            this.prevX = this.x;
            this.prevY = this.y;
        
            // --------------------
            // INPUT - React to key presses (Arrow keys)
            // --------------------
            // move right if right arrow held
            if (input.keys.indexOf('ArrowRight') > -1 || window.tmState.className === "forward") {
                this.speed = 5;
                this.frameY = 1;
            } else if (input.keys.indexOf('ArrowLeft') > -1 || window.tmState.className === "backward") {
                // move left if left arrow held
                this.speed = -5;
                this.frameY = 4;
            } else {
                // no horizontal movement
                this.speed = 0;
                this.frameY = 0;
            }

            // Jump when up arrow pressed and grounded
            if (input.keys.indexOf('ArrowUp') > -1 && this.grounded || window.tmState.className === "jump" && this.grounded) {
                // immediate jump, no cooldown
                this.vy = -20;
                this.grounded = false;
            }

            // Show jump image when in the air
            if (!this.grounded && window.tmState.className === "forward") {
                this.frameY = 3;
            } else if (!this.grounded && window.tmState.className === "backward" || input.keys.indexOf('ArrowLeft') > -1 && !this.grounded) {
                this.frameY = 6;
            } else if (!this.grounded) {
                this.frameY = 3;
            }
        
            
        
            // --------------------
            // MOVE X
            // --------------------
            this.x += this.speed;
            this.resolveCollisions(platforms, background, 'x');
        
            // --------------------
            // APPLY GRAVITY
            // --------------------
            this.vy += this.weight;
        
            // --------------------
            // MOVE Y
            // --------------------
            this.y += this.vy;
            this.grounded = false;
            this.resolveCollisions(platforms, background, 'y');
        
            // Floor fallback
            if (this.y > this.gameHeight - this.height - 100) {
                this.y = this.gameHeight - this.height - 100;
                this.vy = 0;
                this.grounded = true;
            }
        }
        onGround () {
            return this.y >= this.gameHeight - this.height -100;
        }
        resolveCollisions(platforms, background, axis) {

            const hbX = this.x + this.hitboxOffsetX;
            const hbY = this.y + this.hitboxOffsetY;
            const hbW = this.hitboxWidth;
            const hbH = this.hitboxHeight;

            for (const b of platforms.boxes) {
            
                const sx = b.x + (background ? background.x : 0);
            
                if (
                    hbX < sx + b.w &&
                    hbX + hbW > sx &&
                    hbY < b.y + b.h &&
                    hbY + hbH > b.y
                ) {
                
                    if (axis === 'x') {
                    
                        if (this.speed > 0) {
                            this.x = sx - hbW - this.hitboxOffsetX;
                        } else if (this.speed < 0) {
                            this.x = sx + b.w - this.hitboxOffsetX;
                        }
                    
                        this.speed = 0;
                    }
                
                    if (axis === 'y') {
                    
                        if (this.vy > 0) { // Falling
                            this.y = b.y - hbH - this.hitboxOffsetY;
                            this.vy = 0;
                            this.grounded = true;
                        }
                    
                        else if (this.vy < 0) { // Jumping up
                            this.y = b.y + b.h - this.hitboxOffsetY;
                            this.vy = 0;
                        }
                    }
                }
            }
        }
    }

    class Background {
        constructor(gameWidth, gameHeight) {
            this.gameWidth = gameWidth;
            this.gameHeight = gameHeight;
            this.image = document.getElementById('backgroundImage');
            this.image2 = document.getElementById('backgroundImage2');
            this.image3 = document.getElementById('backgroundImage3');
            this.image4 = document.getElementById('backgroundImage4');
            this.x = 0;
            this.y = 0;
            this.width = 2400;
            this.height = 700;
        }
        draw(context) {
            context.drawImage(this.image, this.x, this.y, this.width, this.height);
            context.drawImage(this.image2, this.x + this.width, this.y, this.width, this.height);
            context.drawImage(this.image3, this.x + (this.width * 2), this.y, this.width, this.height);
            context.drawImage(this.image4, this.x + (this.width * 3), this.y, this.width, this.height);
        }
        update(input, player) {
            let speed = 0;
            if ((input && player && input.keys.indexOf('ArrowRight') > -1 && player.x >= player.gameWidth - player.width - 500) 
                || (window.tmState.className === "forward" && player.x >= player.gameWidth - player.width - 500)) 
            {
                speed = 5;
                player.x = player.gameWidth - player.width - 500;
            } else if ((input && player && input.keys.indexOf('ArrowLeft') > -1 && player.x <= 0) 
                || (window.tmState.className === "backward" && player.x <= 0)) 
                {
                speed = -5;
                player.x = 0;
            }
            this.x -= speed;
        }
    }

    class Platforms {

        constructor() {
            this.x = 0;
            this.y = 0;
            this.boxes = [];

            // position: left, top, width, height
            this.addBox(this.x -50, 100, 100, 600);
            this.addBox(this.x + 240, 435, 250, 200);
            this.addBox(this.x + 426, 370, 225, 50);
            this.addBox(this.x + 655, 283, 339, 350);
            this.addBox(this.x + 655, 238, 59, 40);
            this.addBox(this.x + 955, 140, 40, 140);
            this.addBox(this.x + 1108, 369, 220, 40);
            this.addBox(this.x + 1420, 452, 210, 150);
            this.addBox(this.x + 1625, 283, 47, 200);
            this.addBox(this.x + 1674, 369, 200, 50);
            this.addBox(this.x + 1781, 207, 47, 100);
            this.addBox(this.x + 1781, 292, 343, 300);
            this.addBox(this.x + 1942, 120, 54, 173);

            //background 2
            this.addBox(this.x + 3905, 510, 200, 100);
            this.addBox(this.x + 3940, 121, 530, 17);
            this.addBox(this.x + 3923, 444, 140, 17);
            this.addBox(this.x + 4057, 436, 7, 17);
            this.addBox(this.x + 3800, 289, 147, 17);
            this.addBox(this.x + 3793, 282, 7, 17);
            this.addBox(this.x + 4470, 142, 420, 18);

            //background 3
            this.addBox(this.x + 4850, 160, 40, 500);
            this.addBox(this.x + 5145, 468, 260, 130);
            this.addBox(this.x + 5396, 352, 291, 130);
            this.addBox(this.x + 5682, 474, 65, 130);
            this.addBox(this.x + 5792, 369, 147, 10);
            this.addBox(this.x + 6043, 369, 147, 10);
            this.addBox(this.x + 6297, 369, 147, 10);
            this.addBox(this.x + 6545, 369, 147, 10);
            this.addBox(this.x + 6802, 369, 147, 10);

            //background 4
            this.addBox(this.x + 7011, 299, 462, 300);
            this.addBox(this.x + 7473, 467, 250, 300);
            this.addBox(this.x + 8995, 0, 100, 600);


        }

        addBox(x, y, w, h) {
            this.boxes.push({ x: x, y: y, w: w, h: h });
        }

        draw(context, background) {
            // Debug draw: semi-transparent boxes positioned relative to background.x
            context.save();
            context.fillStyle = 'transparent';
            for (const b of this.boxes) {
                const sx = b.x + (background ? background.x : 0);
                context.fillRect(sx, b.y, b.w, b.h);
            }
            context.restore();
        }

        // Resolves collisions between player and platform boxes (AABB)
        // background is optional; when provided boxes are treated as world positions and scrolled by background.x
        checkCollisions(player, background) {

    const hbX = player.x + player.hitboxOffsetX;
    const hbY = player.y + player.hitboxOffsetY;
    const hbW = player.hitboxWidth;
    const hbH = player.hitboxHeight;

    const prevHbX = player.prevX + player.hitboxOffsetX;
    const prevHbY = player.prevY + player.hitboxOffsetY;

    for (const b of this.boxes) {

        const sx = b.x + (background ? background.x : 0);

        if (
            hbX < sx + b.w &&
            hbX + hbW > sx &&
            hbY < b.y + b.h &&
            hbY + hbH > b.y
        ) {

            const prevBottom = prevHbY + hbH;
            const prevTop = prevHbY;
            const prevRight = prevHbX + hbW;
            const prevLeft = prevHbX;

            // Top collision
            if (prevBottom <= b.y) {
                player.y = b.y - hbH - player.hitboxOffsetY;
                player.vy = 0;
            }

            // Bottom collision
            else if (prevTop >= b.y + b.h) {
                player.y = b.y + b.h - player.hitboxOffsetY;
                player.vy = 0;
            }

            // Left collision
            else if (prevRight <= sx) {
                player.x = sx - hbW - player.hitboxOffsetX;
                player.speed = 0;
            }

            // Right collision
            else if (prevLeft >= sx + b.w) {
                player.x = sx + b.w - player.hitboxOffsetX;
                player.speed = 0;
            }
        }
    }}}

    const input = new InputHandler();
    const player = new Player(canvas.width, canvas.height);
    const background = new Background(canvas.width, canvas.height);
    const platforms = new Platforms();


    function animate() {

        ctx.clearRect(0, 0, canvasWidth, canvasHeight);
        player.update(input, platforms, background);

        background.update(input, player);
        background.draw(ctx);
        platforms.draw(ctx, background);
        platforms.checkCollisions(player, background);
        player.draw(ctx);

        // Show curtains when background scrolls to end point
        if (background.x <= -8100) {
            curtain.style.top = '0';
            topCurtain.style.top = '0';
            resetBtn.style.display = 'block';
        }

        requestAnimationFrame(animate);
    }

    animate();


});