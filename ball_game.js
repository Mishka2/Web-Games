var myGameArea;
var canvasHeight = 600;
var canvasWidth = 800;
var mouseX = 0;
var mouseY = 0;

var myGamePieceWidth = 20;
var myGamePieceHeight = 20;

// unit: s
var timestep = 1;
// unit: m
var ballRadius = 20;
// unit: kg
var ballMass = 10000000000000;
// unit: m^3 kg^-1 s^-2
var gravConst = 0.0000000000667408;

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
        if (mouseX > key.x-ballRadius*2 && mouseX < key.x+ ballRadius*2){
            if(mouseY > key.y-ballRadius*2 && mouseY < key.y+ ballRadius*2){
                return key;
            }
        }
    }
    return null;
}

function addNode(){
    // var color ="#"+((1<<24)*Math.random()|0).toString(16);
    newNode = new nodeComponent(ballRadius,'pink', mouseX - ballRadius/2, mouseY - ballRadius/2);
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
    this.xVelocity = 0;
    this.yVelocity = 0;

    var innerRad = 6;
    var outerRad = 20;

    this.update = function () {
        

        var gradient_center = ctx.createRadialGradient(this.x, this.y, innerRad, this.x, this.y, outerRad);
        gradient_center.addColorStop(0, 'pink');
        gradient_center.addColorStop(1, 'DeepPink');


        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI, false);
        ctx.fillStyle = gradient_center;
        ctx.fill();  
    }
    this.update_gradient = function () {
        
        var gradient_outer = ctx.createRadialGradient(this.x, this.y, innerRad*10, this.x, this.y, outerRad);
        gradient_outer.addColorStop(0, 'rgba(52, 124, 232, 0.0)');
        gradient_outer.addColorStop(1, 'rgba(52, 124, 232, 0.4)');
    
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius*7, 0, 2 * Math.PI, false);
        ctx.fillStyle = gradient_outer;
        ctx.fill();
        
        
    }
}

function updateGameArea() {
    myGameArea.clear();

    canvas_obj.addEventListener("mousemove", getMousePos, false);

    myGamePiece.x = mouseX - myGamePieceWidth/2;
    myGamePiece.y = mouseY - myGamePieceHeight/2;

    //redraw all nodes on canvas
    for (let key of nodeMap.keys()) {
        key.update();
    }
    for (let key of nodeMap.keys()) {
        key.update_gradient();
    }

    moveBubbles();

    myGamePiece.update();
}

function getMousePos(evt) {
    var rect = canvas_obj.getBoundingClientRect();
    mouseX = evt.clientX - rect.left;
    mouseY = evt.clientY - rect.top;
}

function force_vector(){
    this.x = 0;
    this.y = 0;
}

function touchingAnotherNode(node){
    var touching = false;
    // nodeMap.get(node) = [];
    for (let key of nodeMap.keys()) {
        if (key != node){
            if (Math.abs(node.x - key.x) < ballRadius*2){
                if (Math.abs(node.y - key.y) < ballRadius*2){
                    if (!nodeMap.get(node).includes(key)){
                        nodeMap.get(node).push(key);
                    }
                    touching = true;
                }
            }
        }
    }
    return touching;
}


function canMoveX(node, movement){
    nodeMap.get(node).forEach(connectedNode => {
        var distance_before = Math.sqrt(Math.pow(connectedNode.x - node.x,2) + Math.pow(connectedNode.y-node.y,2));
        var distance_after = Math.sqrt(Math.pow((node.x+movement)-connectedNode.x  ,2) + Math.pow(connectedNode.y-node.y,2));
        

        console.log("Distance before: " + distance_before.toString() + " Distance After: " + distance_after.toString());
        if (distance_before > distance_after){
            
            node.color = 'blue';
            return false;
        } else {
            node.color = 'yellow';
        }
    });
    return true;
}



function moveBubbles(){
    //check each node 
    //if the node is in the gravitational feild of another node
        //move a little bit
    //cycle through nodes until equilibrium
    for (let key1 of nodeMap.keys()) {
        // key1.color = "#"+((1<<24)*Math.random()|0).toString(16);
        var total_force = new force_vector();
        for (let key2 of nodeMap.keys()) {
            if(key1 != key2){

                var y_diff = (key2.y - key1.y);
                var x_diff = (key2.x - key1.x);

                var angle = Math.abs(Math.atan(y_diff/x_diff));
                var total_radius = Math.sqrt(Math.pow(x_diff,2)+Math.pow(y_diff,2));
                // M * (m/s^2) = (m^3 / (M * s^2)) * (M^2 / m^2))     
                var grav_force = gravConst * ((ballMass * ballMass)/Math.pow(total_radius,2));

                total_force.x += Math.sign(x_diff)*grav_force*Math.cos(angle);
                total_force.y += Math.sign(y_diff)*grav_force*Math.sin(angle);
            }
        }
        
        // calculate new velocity
        key1.xVelocity += (total_force.x / ballMass) * timestep;
        key1.yVelocity += (total_force.y / ballMass) * timestep;

        // detect ball collisons
        if (touchingAnotherNode(key1)) {
            key1.color = 'LightCoral'
            //make vector from this node to middle of touching node
            var otherNode = nodeMap.get(key1)[0];
            var vect_y = (otherNode.y - key1.y);
            var vect_x = (otherNode.x - key1.x);
            var vect_total = vect_y + vect_x;
            // So... let's make these collisions perfectly elastic 
            // that allows us to conserve velocity.
            // taking advantage of v1i + v1f = v2i + v2f
            // later we can add unique masses for each ball.
            var x_momentum = ballMass * key1.xVelocity;
            var other_x_momentum = ballMass * otherNode.xVelocity;
            var total_x_momentum = x_momentum + other_x_momentum;
            var total_mass = ballMass + ballMass;
            var x_velocity_diff = otherNode.xVelocity - key1.xVelocity;
            otherNode.xVelocity  = (total_x_momentum 
                                    - (x_velocity_diff * ballMass)) / total_mass;
            key1.xVelocity = otherNode.xVelocity + x_velocity_diff;             

            var y_momentum = ballMass * key1.yVelocity;
            var other_y_momentum = ballMass * otherNode.yVelocity;
            var total_y_momentum = y_momentum + other_y_momentum;
            var total_mass = ballMass + ballMass;
            var y_velocity_diff = otherNode.yVelocity - key1.yVelocity;
            otherNode.yVelocity = (total_y_momentum 
                                    - (y_velocity_diff * ballMass)) / total_mass;
            key1.yVelocity = otherNode.yVelocity + y_velocity_diff;             
        }

        // move to new location
        key1.x += key1.xVelocity * timestep;
        key1.y += key1.yVelocity * timestep;

        key1.update();

    }

}
