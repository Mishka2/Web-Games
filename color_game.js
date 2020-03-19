// alert( 'Hello, world!' );
var myGamePiece;
var platform;
var bouncingUp = false;
var g = 0.08;
var yVec = 1;
var xMove = 2;

var colors = ['blue','yellow','red','green','purple', 'cyan', 'pink','orange'];

var numPlatforms = 50;
var platformArray = []
var platformMoveX = 1;
var platformMoveY = 1;
var platformWidth = 100;
var platformHeight = 5;

var canvasHeight = 650;
var canvasWidth = 600;

function startGame() {
    myGameArea.start();
    
    for (i = 0; i < numPlatforms; i++){
        platform = new component(platformWidth, platformHeight, 0, (canvasWidth-platformWidth)*Math.random(), -(canvasHeight/numPlatforms)*i);
        platformArray.push(platform);
    }
    myGamePiece = new component(20, 20, 1, 10, 30);
    
    document.addEventListener("keypress", function(event) {
        if (event.keyCode == 32) {
            yVec -= 5;
        }
    })
  }
  
  var myGameArea = {
    canvas : document.getElementById("canvas"),
    start : function() {
      this.canvas.width = canvasWidth;
      this.canvas.height = canvasHeight;
      this.context = this.canvas.getContext("2d");
      document.body.insertBefore(this.canvas, document.body.childNodes[0]);
      this.interval = setInterval(updateGameArea, 5);
    },
    clear : function() {
      this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
      
    }
  }

  function component(width, height, color, x, y) {
    this.width = width;
    this.height = height;
    this.x = x;
    this.y = y;
    this.color_index = 0;
    this.update = function(){
        ctx = myGameArea.context;
        if(color == 0){
          ctx.fillStyle = colors[this.color_index];
        } else {
          ctx.fillStyle = 'red';
        }
        ctx.fillRect(this.x, this.y, this.width, this.height);
      }
  }

  function updateGameArea() {
    myGameArea.clear();
    
    movePlayer(myGamePiece);
    checkPlayerCollision(myGamePiece);
        
    myGamePiece.update();
    for (i = 0; i < numPlatforms; i++){ 
        platform = platformArray[i]; 
        movePlatform(platform);
        platform.update();
    }
  }

  function movePlatform(platform){
    platform.y += platformMoveY;
    
    if (platform.y> canvasHeight){
        platform.x = (canvasWidth-platformWidth)*Math.random();
        platform.y = -100;
    }

  }

  function movePlayer(player){
    player.y += yVec;
    player.x += xMove;
    yVec += g;

  }

  function checkPlayerCollision( player ){
    //collision with wall
    if (player.y > canvasHeight-15 ) {
        yVec *= -1;
        yVec *= 0.8;
    }
    if (player.x > canvasWidth-10 || player.x < 10){
        xMove *= -1;
    }

    //collision with platform
    for (i = 0; i < numPlatforms; i++){
        platform = platformArray[i];
        if(player.y > platform.y-10 && player.y < platform.y + 5 && 
            player.x < platform.x + platformWidth && 
            player.x > platform.x-15 &&
            yVec > 0){

            yVec *= -1;
            yVec *= 0.7;
            platform.color_index = (platform.color_index + 1) % colors.length;
        }
    }
  }
