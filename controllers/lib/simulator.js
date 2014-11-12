module.exports = Simulator;

var Body = require('./body.js');

// TIMING
var timer = new Date();
var frameTime = timer.getTime();            // Instatiate initial timing objects
var deltaTime = 15;
var ping = 15;
var steps = 0;

function Simulator() {
    this.bodies = new Array(2);
    this.bodies[0] = new Body( 400, 250,  0,   0, 1000,0);
    this.bodies[1] = new Body( 300, 210,  0, 0.5, 10,1);
    this.G = 6.673;      // Establish gravitational constant
    this.PI2 = Math.PI * 2;      // Establish this.PI2 constant
    this.outPositions = new Array(this.bodies.length);
    //TODO this.initialState = new State(.....);
}

Simulator.prototype.simulate = function() {
    for (var a = 0; a < this.bodies.length; a++) {
        var bodyA = this.bodies[a];
        //console.log(">" + this.bodies[a].toString());
        bodyA.resetForce()
        for (var b = 0; b < this.bodies.length; b++) {
            var bodyB = this.bodies[b];
            if (bodyA.id != bodyB.id) {
                var r = this.getDistance(bodyA.x, bodyA.y, bodyB.x, bodyB.y);
                var theta = Math.atan((bodyB.y - bodyA.y) / (bodyB.x - bodyA.x));
                if (bodyB.x < bodyA.x) {
                    theta += Math.PI;
                }
                if (theta >= this.PI2) {
                    theta -= this.PI2;
                }
                if (theta < 0) {
                    theta += this.PI2;
                }
                var tF = this.G * (bodyA.m * bodyB.m) / Math.pow(r,2);
                var tFx = Math.cos(theta) * tF;
                var tFy = Math.sin(theta) * tF;
                bodyA.addForce(tFx, tFy);

                //console.log("Add Force: From: " + bodyB.toString() + " r: " + r + " | F: " + tF + " Fx: " + tFx + " Fy: " + tFy + " | Deg: " + (theta * (180 / Math.PI)) + " Rad: " + theta);

            }
        }
        //console.log(bodies[a].toString());
    }

    timer = new Date();
    deltaTime = timer.getTime() - frameTime;
    ping = ping * 0.9 + deltaTime * 0.1;

    var box = { command: 'wait', ping: ping};

    //console.log("deltaTime: " + deltaTime + " Ping: " + ping);
    if (ping < 25) {
        for (var c = 0; c < this.bodies.length; c++) {
            this.bodies[c].applyForce(deltaTime / 1000);
            this.outPositions[c] = this.bodies[c].serializeUpdate();
        }
        box = { command: 'update', positions: this.outPositions, ping: ping};
        // send to all without this client
    }
    //else {box = { command: 'message', message: 'Waiting for ping reduction: ' + ping};}
    frameTime = timer.getTime();
    return box;

}

Simulator.prototype.initialize = function() {
    var initBodies = new Array(this.bodies.length);
    for(var i = 0; i < this.bodies.length; i++) {
        initBodies[i] = this.bodies[i].serializeInitial();
    }
    return initBodies;
}

Simulator.prototype.getDistance = function(x1,y1,x2,y2) {

    return Math.sqrt(Math.pow(x2-x1,2) + Math.pow(y2-y1,2));

}

Simulator.prototype.reset = function() {

    // TODO: should reset current state to this.initialState
    this.bodies[0] = new Body( 400, 250,  0,   0, 1000,0);
    this.bodies[1] = new Body( 300, 210,  0, 0.5, 10,1);
}
