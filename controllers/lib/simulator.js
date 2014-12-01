module.exports = Simulator;

var Body = require('./body.js');

// TIMING
var timer = new Date();
var frameTime = timer.getTime();            // Instatiate initial timing objects
var deltaTime = 15;
var ping = 15;
var steps = 0;
var n = 20;

function Simulator() {

    this.bodies = new Array(3);
    this.bodies[0] = new Body( 100, 300,  0,   0, 800,0); // SUN
    this.bodies[1] = new Body( 400, 300,  0,  42.75, 10,1);   // EARTH
    this.bodies[2] = new Body( 430, 300,  0,  55,  1,2);   // MOON

    this.G = 667.3;                 // Establish gravitational constant
    this.PI2 = Math.PI * 2;         // Establish this.PI2 constant

    this.initialState = new Array(this.bodies.length);
    this.setInitialState();

    this.outPositions = new Array(this.bodies.length);

}

Simulator.prototype.simulate = function() {
    bodyDeleted = false;
    for (var a = 0; a < this.bodies.length; a++) {

        // FOR EACH NON-NULL BODY AS TARGET
        if (this.bodies[a] != null) {
            var bodyA = this.bodies[a];
            bodyA.resetForce();

            // FOR EACH NON-NULL BODY AS EFFECTOR
            for (var b = 0; b < this.bodies.length; b++) {
                if (this.bodies[b] != null) {
                    var bodyB = this.bodies[b];

                    // IF TARGET AND EFFECTOR ARE NOT THE SAME
                    if (a != b) {
                        var r = this.getDistance(bodyA.x, bodyA.y, bodyB.x, bodyB.y);
                        var rA = Math.sqrt(bodyA.m * 0.5) + 5;
                        var rB = Math.sqrt(bodyB.m * 0.5) + 5;

                        // IF COLLISION
                        if (r < Math.max(rA, rB)*0.8) {

                            // TODO:
                            // For absorption, the mass should technically not be added until after
                            // every body's net force has been calculated. However, the resulting
                            // inaccuracy that results from this is negligible enough that we
                            // don't need to worry about it right now.

                            bodyDeleted = true;
                            if (bodyA.m > bodyB.m) {
                                this.bodies[a].addMass(this.bodies[b].m);
                                this.bodies[b] = null;
                            }
                            else {
                                this.bodies[b].addMass(this.bodies[a].m);
                                this.bodies[a] = null;
                            }
                        }

                        // IF NO COLLISION
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

    if (bodyDeleted) {this.removeNulls();} // REMOVE ALL NULLIFIED (via collision) BODIES

    timer = new Date();
    deltaTime = timer.getTime() - frameTime; // TIME KEEPING STUFF
    ping = ping * 0.9 + deltaTime * 0.1;

    var box = null;

    if (ping < 25) { // ONLY APPLY FORCE AND SEND UPDATE IF PING IS LOW ENOUGH TO MAINTAIN SUFFICIENT ACCURACY
        this.outPositions = new Array(this.bodies.length);
        for (var c = 0; c < this.bodies.length; c++) {
            this.bodies[c].applyForce(deltaTime / 1000);
            this.outPositions[c] = this.bodies[c].serializeUpdate();
        }
        if (bodyDeleted) { // IF A BODY HAS BEEN DELETED, WE NEED TO INITIALIZE ALL CLIENTS WITH NEW BODY INFO
            box = { command: 'initialize', bodies: this.initialize(), running: true};
        }
        else { // IF NOT, ONLY SEND POSITIONS
            box = { command: 'update', positions: this.outPositions, ping: ping};
        }
    }
    else {
        box = { command: 'wait', ping: ping};
    }

    frameTime = timer.getTime();
    return box;

};

Simulator.prototype.initialize = function() {
    var initBodies = new Array(this.bodies.length);
    for(var i = 0; i < this.bodies.length; i++) {
        initBodies[i] = this.bodies[i].serializeInitial();
    }
    return initBodies;
};

Simulator.prototype.getDistance = function(x1,y1,x2,y2) {

    return Math.sqrt(Math.pow(x2-x1,2) + Math.pow(y2-y1,2));

};

Simulator.prototype.addBody = function(x,y,xx,yy,m,userID) {

    var newList = new Array(this.bodies.length+1);
    for(var i = 0; i < this.bodies.length; i++) {
        newList[i] = this.bodies[i];
        newList[i].bodyID = i;
    }
    newList[newList.length-1] = new Body(x,y,xx,yy,m,newList.length-1,userID);

    this.bodies = newList;

};

Simulator.prototype.destroyBody = function(bodyID) {

    var newList = new Array(this.bodies.length-1);
    var counter = 0;
    for(var i = 0; i < this.bodies.length; i++) {
        if (this.bodies[i].bodyID != bodyID) {
            newList[counter] = this.bodies[i];
            newList[counter].bodyID = counter;
            counter += 1;
        }
    }

    this.bodies = newList;


};

Simulator.prototype.removeNulls = function() {

    console.log("BEFORE");
    this.printState();

    var nullCount = 0;
    for(var a = 0; a < this.bodies.length; a++) {
        if (this.bodies[a] == null) {nullCount += 1;}
    }

    var newList = new Array(this.bodies.length-1-nullCount);
    var counter = 0;
    for(var i = 0; i < this.bodies.length; i++) {
        if (this.bodies[i] != null) {
            newList[counter] = this.bodies[i];
            newList[counter].bodyID = counter;
            counter += 1;
        }
    }

    this.bodies = newList;

    console.log("AFTER");
    this.printState();

    // pip install fabric
    // fab branch: [branch name]

};
Simulator.prototype.printState = function() {

    console.log("-- CURRENT STATE --");
    for(var i = 0; i < this.bodies.length; i++) {
        if (this.bodies[i] != null) {
            this.bodies[i].print();
        }
        else {
            console.log("ID: " + i + "\t (null)");
        }
    }
    console.log("");

};

Simulator.prototype.reset = function() {

    this.bodies = new Array(this.initialState.length);
    for(var i = 0; i < this.bodies.length; i++) {
        this.bodies[i] = this.initialState[i].cloneBody();
    }

};

Simulator.prototype.setInitialState = function() {
    this.initialState = new Array(this.bodies.length);
    for(var i = 0; i < this.bodies.length; i++) {
        this.initialState[i] = this.bodies[i].cloneBody();
    }

};
