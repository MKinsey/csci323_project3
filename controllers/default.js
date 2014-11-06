exports.install = function(framework) {
    framework.route('/', view_homepage);
    framework.route('/usage/', view_usage);
    framework.websocket('/', socket_homepage, ['json']);
}

var steps = 0;
var Body = require('../verlet-js/lib/body.js');

// TIMING
var timer = new Date();
var frameTime = timer.getTime();            // Instatiate initial timing objects
var deltaTime = 15;
var ping = 15;
var play = false;

var controller;


// PHYSICS BODIES
var bodies = new Array(2);
bodies[0] = new Body(  200,  50,  0,   0, 1000,0);        // Trivial example
bodies[1] = new Body( 100,  10,  0, 0.1, 10,1);

// MESSAGES
var outPositions = new Array(bodies.length);
var out = "";

// CONSTANTS
var G = 0.0006673;      // Establish gravitational constant
var PI2 = Math.PI * 2;      // Establish PI2 constant



function step() {
    if (play) {
        steps += 1;
        console.log("Step: " + steps);
        controller.send(simulate());
        setTimeout(step, 17);
    }

}

function simulate() {
    for (var a = 0; a < bodies.length; a++) {
        var bodyA = bodies[a];
        //console.log(">" + bodies[a].toString());
        bodyA.resetForce()
        for (var b = 0; b < bodies.length; b++) {
            var bodyB = bodies[b];
            if (bodyA.id != bodyB.id) {
                var r = getDistance(bodyA.x, bodyA.y, bodyB.x, bodyB.y);
                var theta = Math.atan((bodyB.y - bodyA.y) / (bodyB.x - bodyA.x));
                if (bodyB.x < bodyA.x) {
                    theta += Math.PI;
                }
                if (theta >= PI2) {
                    theta -= PI2;
                }
                if (theta < 0) {
                    theta += PI2;
                }
                var tF = G * (bodyA.m * bodyB.m) / r ^ 2;
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
    out = "";

    var box;

    //console.log("deltaTime: " + deltaTime + " Ping: " + ping);
    if (ping < 25) {
        for (var c = 0; c < bodies.length; c++) {
            bodies[c].applyForce(deltaTime / 1000);
            outPositions[c] = bodies[c].serializeUpdate();
            out = out + " / " + bodies[c].toString();
        }
        box = { command: 'update', positions: outPositions};
        // send to all without this client
    }
    else {box = { command: 'message', message: 'Waiting for ping reduction: ' + ping};}
    frameTime = timer.getTime();
    return box;

}

function view_usage() {
    var self = this;
    self.plain(self.framework.usage(true));
}

function view_homepage() {
    var self = this;
    self.view('homepage');
}

function socket_homepage() {

    controller = this;

    controller.on('open', function(client) {

        // WHEN USER CONNECTS
        console.log('Connect / Online:', controller.online);
        client.send({command: 'message', message: 'User Connected: {0}'.format(client.id) });
        controller.send({command: 'message',  message: 'Connect new user: {0}\nOnline: {1}'.format(client.id, controller.online) }, [], [client.id]);

        var initBodies = new Array(bodies.length);
        for(var i = 0; i < bodies.length; i++) {
            initBodies[i] = bodies[i].serializeInitial();
        }

        var box = {command: 'initialize', bodies: initBodies};
        client.send(box);

    });

    controller.on('close', function(client) {

        //WHEN USER DISCONNECTS
        console.log('Disconnect / Online:', controller.online);
        client.send({ message: 'User Disconnected: {0}'.format(client.id) });
        controller.send({ message: 'Disconnect user: {0}\nOnline: {1}'.format(client.id, controller.online) });


    });

    controller.on('message', function(client, message) {

        var command = message.command;
        console.log("Command: " + command);

        if (command == 'start') {
            console.log("Starting...");
            play = true;
            step();
        }
        if (command == 'stop') {
            console.log("Stopping...");
            play = false;
        }
        if (command == 'reset') {
            console.log("Resetting...");
            play = false;
            bodies[0] = new Body(  200,  50,  0,   0, 1000,0);        // Trivial example
            bodies[1] = new Body( 100,  10,  0, 0.1, 10,1);
            steps = 0;
            var initBodies = new Array(bodies.length);
            for(var i = 0; i < bodies.length; i++) {
                initBodies[i] = bodies[i].serializeInitial();
            }

            var box = {command: 'initialize', bodies: initBodies};
            controller.send(box);
        }



        if (typeof(message.username) !== 'undefined') {
            //var old = client.id;
            //client.id = message.username;
            //controller.send({ message: 'rename: ' + old + ', new: ' + client.id });
            return;
        }

    });

    controller.on('error', function(error, client) {

        framework.error(error, 'websocket', controller.uri);

    });

    controller.on('start', function(client, message) {
        console.log("You just started this bitch!");
    });


    // how many connections?
    // controller.online;
}

function getDistance(x1,y1,x2,y2) {

    return Math.sqrt(Math.pow(x2-x1,2) + Math.pow(y2-y1,2));

}