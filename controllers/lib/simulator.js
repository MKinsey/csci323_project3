module.exports = Simulator;

var Body = require('./body.js');
var State = require('./state.js');

// TIMING
var timer = new Date();
var frameTime = timer.getTime();            // Instatiate initial timing objects
var deltaTime = 15;
var ping = 15;
var steps = 0;

function Simulator() {
    this.bodies = new Array(5);
    this.bodies[0] = new Body( 400, 250,  0,   0, 1000,0);
    this.bodies[1] = new Body( 300, 210,  0, 80, 10,1);
    this.bodies[2] = new Body( 500, 290,  0, 80, 10,2);
    this.bodies[3] = new Body( 300, 290,  0, 80, 10,3);
    this.bodies[4] = new Body( 500, 210,  0, 80, 10,4);
    this.G = 667.3;      // Establish gravitational constant
    this.PI2 = Math.PI * 2;      // Establish this.PI2 constant
    this.outPositions = new Array(this.bodies.length);
    this.bodyCount = this.bodies.length;
    this.initialState = new State(this.bodies);
}

Simulator.prototype.simulate = function() {

    bodiesRemoved = 0;

    for (var a = 0; a < this.bodies.length; a++) {
        var bodyA = this.bodies[a];
        if (bodyA != null) {
            bodyA.resetForce();
            for (var b = 0; b < this.bodies.length; b++) {
                var bodyB = this.bodies[b];
                if (bodyB != null && bodyA != null) {
                    if (bodyA.id != bodyB.id) {
                        var r = this.getDistance(bodyA.x, bodyA.y, bodyB.x, bodyB.y);
                        if (r*2 < (bodyA.r + bodyB.r)) {
                            // COLLISION
                            console.log("Collision between " + bodyA.id + " and " + bodyB.id);
                            bodiesRemoved += 1;
                            if (bodyA.m < bodyB.m) {
                                this.bodies[b].setMass(this.bodies[b].m+this.bodies[a].m);
                                this.bodies[a] = null;
                            }
                            else {
                                this.bodies[a].setMass(this.bodies[b].m+this.bodies[a].m);
                                this.bodies[b] = null;
                            }
                        }
                        else {
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
                            var tF = this.G * (bodyA.m * bodyB.m) / Math.pow(r, 2);
                            var tFx = Math.cos(theta) * tF;
                            var tFy = Math.sin(theta) * tF;
                            bodyA.addForce(tFx, tFy);
                        }
                    }
                }
            }
        }
    }

    timer = new Date();
    deltaTime = timer.getTime() - frameTime;
    ping = ping * 0.9 + deltaTime * 0.1;

    var box = { command: 'wait', ping: ping};
    if (ping < 25) {
        if (bodiesRemoved > 0) {
            this.bodyCount -= bodiesRemoved;
            this.optimize();
            this.printState();
            box = {command: 'initialize', bodies: this.initialize(), running: true};
        }
        else {
            for (var c = 0; c < this.bodies.length; c++) {
                if (this.bodies[c] != null) {
                    this.bodies[c].applyForce(deltaTime / 1000);
                    this.outPositions[c] = this.bodies[c].serializeUpdate();
                }
                else {
                    break;
                }
            }
            box = { command: 'update', positions: this.outPositions, ping: ping};
        }

        // send to all without this client
    }
    //else {box = { command: 'message', message: 'Waiting for ping reduction: ' + ping};}
    frameTime = timer.getTime();

    return box;

};

Simulator.prototype.initialize = function() {
    var initBodies = new Array(this.bodyCount);
    console.log("initialize > bodycount: " + this.bodyCount);
    for(var i = 0; i < this.bodies.length; i++) {
        if (this.bodies[i] != null) {
            console.log("initialize > added");
            initBodies[i] = this.bodies[i].serializeInitial();
        }
        else {
            break;
        }
    }
    return initBodies;
};

Simulator.prototype.getDistance = function(x1,y1,x2,y2) {

    return Math.sqrt(Math.pow(x2-x1,2) + Math.pow(y2-y1,2));

};

Simulator.prototype.optimize = function() {
    newArray = new Array(this.bodyCount);
    slot = 0;
    for(var i = 0; i < this.bodies.length; i++) {
        if (this.bodies[i] != null) {
            newArray[slot] = this.bodies[i];
            slot += 1;
        }
    }
    this.bodies = newArray;
    this.outPositions = new Array(this.bodies.length);
    console.log("outPositions length: " + this.outPositions.length);
};

Simulator.prototype.reset = function() {

    this.bodies = this.initialState.load();

};

Simulator.prototype.removeBody = function(id) {
    this.bodies[id] = null;
};

Simulator.prototype.addBody = function() {

};

Simulator.prototype.printState = function() {
    console.log("SIMULATION STATE: ");
    for(var i = 0; i < this.bodies.length; i++) {
        console.log(this.bodies[i].toString());
    }
    console.log("-----");
};