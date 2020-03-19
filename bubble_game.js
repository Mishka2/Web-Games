var myGameArea;
var canvasHeight = 600;
var canvasWidth = 800;
var mouseX = 0;
var mouseY = 0;

var myGamePieceWidth = 20;
var myGamePieceHeight = 20;

var nodeRadius = 10;

var canvas_obj = document.getElementById("canvas");
var context_obj = canvas_obj.getContext("2d");

//Node object, node position/information
let nodeMap = new Map();
var mouseNode;

var myCircle;

function startGame() {
    myGameArea.start();
    myGamePiece = new component( myGamePieceWidth, myGamePieceHeight,'red', 10, 30);

    mouseNode = new nodeComponent(0, 'black', mouseX, mouseY);

    document.addEventListener("mousedown", function (event) {
        if(isInCanvas()){
            var clickedNodeObj = clickedNode();
            if (clickedNodeObj == null){
                //TODO: make sure that you don't add and make connection
                addNode();
            } else {
                //you clicked a node!
                addConnection(clickedNodeObj);
            } 
        }
    })
}

function isInCanvas(){
    var rect = canvas_obj.getBoundingClientRect();
    if (mouseX < rect.right && mouseX > 0 &&  
        mouseY < rect.bottom && mouseY > rect.top){
        
            return true;
            
        }
    return false;
}

function addConnection(node){

    document.addEventListener("mouseup", function (event) {
        var clickedNodeObj = clickedNode();
        //if you don't land on another node
        if(clickedNodeObj == null){
            document.removeEventListener('mouseup', arguments.callee );
        } else { //if you land on another node
            
            if(clickedNodeObj != node && !containsObject(clickedNodeObj,nodeMap.get(node))){
                nodeMap.get(node).push(clickedNodeObj);
            }
            document.removeEventListener("mouseup", arguments.callee );
            } 

    })
    
    
}

function containsObject(obj, list) {
    var i;
    for (i = 0; i < list.length; i++) {
        if (list[i] === obj) {
            return true;
        }
    }

    return false;
}

function clickedNode(){
    for (let key of nodeMap.keys()) {
        if (mouseX > key.x-5 && mouseX < key.x+ nodeRadius+5){
            if(mouseY > key.y-5 && mouseY < key.y+ nodeRadius+5){
                return key;
            }
        }
    }
    return null;
}

function addNode(){
    newNode = new nodeComponent(nodeRadius,'blue', mouseX - nodeRadius/2, mouseY - nodeRadius/2);
    nodeMap.set(newNode, []);

}

var myGameArea = {
    canvas: document.getElementById("canvas"),
    start: function () {
        this.canvas.width = canvasWidth;
        this.canvas.height = canvasHeight;

        this.context = this.canvas.getContext("2d");
        document.body.insertBefore(this.canvas, document.body.childNodes[0]);

        

        this.interval = setInterval(updateGameArea, 5);
    },
    clear: function () {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

    }
}

function component(width, height, color, x, y) {
    this.width = width;
    this.height = height;
    this.x = x;
    this.y = y;
    this.color = color;
    this.update = function () {
        ctx = myGameArea.context;
    }
}

function nodeComponent(radius, color, x, y) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    this.update = function () {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI, false);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.lineWidth = 3;
        ctx.strokeStyle = this.color;
        ctx.stroke();
    }
}

function updateGameArea() {
    myGameArea.clear();

    canvas_obj.addEventListener("mousemove", getMousePos, false);

    myGamePiece.x = mouseX - myGamePieceWidth/2;
    myGamePiece.y = mouseY - myGamePieceHeight/2;

    for (let key of nodeMap.keys()) {
        key.update();
    }

    nodeMap.set(mouseNode, []);

    updateConnections();

    myGamePiece.update();
}

function updateConnections(){
    for (let [key, value] of nodeMap) {
        if(value != []){
            for (index = 0; index < value.length; index++){
                context_obj.beginPath();
                context_obj.moveTo(key.x , key.y);
                context_obj.lineTo(value[index].x, value[index].y );
                context_obj.stroke(); 
            }
        }
      }
}

function getMousePos(evt) {
    var rect = canvas_obj.getBoundingClientRect();
    mouseX = evt.clientX - rect.left;
    mouseY = evt.clientY - rect.top;
}

function moveBubbles(){
    for (let [key, value] of nodeMap) {
        key.color = 'red';
    }
}
