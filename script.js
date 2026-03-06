window.addEventListener('load', function() {

});

playerState = 'idle';

const canvas = document.getElementById('canvas1');
const ctx = canvas.getContext('2d');
const canvasWidth = canvas.width = 800;
const canvasHeight = canvas.height = 700;


// Creating a Playersprite based on the sprite Image
const playerImage = new Image();
playerImage.src = './Enchantress/Enchantress_spritelist.png';
const spriteWidth = 128;
const spriteHeight = 128;

// This variable controls the speed of the animation. The higher the number, the slower the animation.
let gameFrame = 0;
const staggerFrames = 15;

// This array holds the different animation states and the number of frames for each state. The forEach loop populates the spriteAnimations array with the location of each frame for each animation state.
const spriteAnimations = [];
const animationStates = [
    {
        name: 'idle',
        frames: 5,
    },
    {
        name: 'walking',
        frames: 8,
    },
    {
        name: 'running',
        frames: 8,
    },
    {
        name: 'attack1',
        frames: 6,
    },
    {
        name: 'attack2',
        frames: 3,
    },
    {
        name: 'attack3',
        frames: 2,
    },
    {
        name: 'attack4',
        frames: 10,
    },
    {
        name: 'jumping',
        frames: 8,
    }
];
animationStates.forEach((state, index) => {
    let frames = {
        loc: [],
    }
    for (let j = 0; j < state.frames; j++) {
        let positionX = j * spriteWidth;
        let positionY = index * spriteHeight;
        frames.loc.push({x: positionX, y: positionY});
    }
    spriteAnimations[state.name] = frames;
});


// This function is called every frame to update the canvas. It clears the canvas, calculates the current frame of the animation, and draws the appropriate sprite on the canvas. It then increments the gameFrame variable and requests the next animation frame.
function animate() {
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    // The position variable calculates which frame of the animation to display based on the gameFrame and staggerFrames variables. It uses the modulus operator to loop back to the beginning of the animation after it reaches the end.
    let position = Math.floor(gameFrame / staggerFrames) % spriteAnimations[playerState].loc.length;
    let frameX = spriteWidth * position;
    let frameY = spriteAnimations[playerState].loc[position].y;
    // ctx.fillRect(100, 50, 100, 100);
    // ctx.drawImage(Image, sx, sy, sw, sh, dx, dy, dw, dh);
    ctx.drawImage(playerImage, frameX, frameY, spriteWidth, spriteHeight, 
        0, 0, spriteWidth, spriteHeight);
    
    

    gameFrame++;
    requestAnimationFrame(animate);
};


// Event listener for the dropdown menu to change the playerState variable based on the selected animation state. This will cause the animate function to draw the appropriate animation on the canvas.
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
        this.x = 0;
        this.y = 0
    }
    draw(context) {
        context.fillStyle = 'white';
        context.fillRect(this.x, this.y, this.width, this.height);
    }
}

const input = new InputHandler();
const player = new Player(canvas.Width, canvas.Height);
player.draw(ctx);



animate();