exports.install = function(framework) {
    framework.route('/', view_homepage);
    framework.route('/usage/', view_usage);
    framework.websocket('/', socket_homepage, ['json']);
}

var Body = require('../verlet-js/lib/body.js');
var User = require('../user.js');

// TIMING
var timer = new Date();
var frameTime = timer.getTime();            // Instatiate initial timing objects
var deltaTime = 15;
var ping = 15;
var play = false;
var steps = 0;

// PHYSICS BODIES
var bodies = new Array(9);
bodies[0] = new Body( 300,  300, 0.0, 0.0, 1000,0);        // Trivial example
bodies[1] = new Body( 150,  350,-0.1, 0.2, 10,1);
bodies[2] = new Body( 200,  200, 0.2,-0.2, 10,2);
bodies[3] = new Body( 300,  100,-0.2, 0.1, 10,3);
bodies[4] = new Body( 400,  600, 0.3, 0.2, 10,4);
bodies[5] = new Body( 500,  500,-0.3,-0.2, 10,5);
bodies[6] = new Body( 600,  400, 0.1, 0.1, 10,6);
bodies[7] = new Body( 100,  300,-0.2, 0.2, 10,7);
bodies[8] = new Body( 250,  250, 0.2,-0.2, 10,8);
//bodies[9] = new Body( 300,  100,-0.1, 0.1, 10,9);

// USER SYSTEM
var users = {};
var adminKey = 'starpeople';
idCounter = 0;


// MESSAGES
var outPositions = new Array(bodies.length);
var out = "";

// CONSTANTS
var G = 6.673;      // Establish gravitational constant
var PI2 = Math.PI * 2;      // Establish PI2 constant

// OTHER
var controller;



function step() {
    if (play) {
        steps += 1;
        //console.log("Step: " + steps);
        controller.send(simulate());
        setTimeout(step, 1);
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
                var tF = G * (bodyA.m * bodyB.m) / Math.pow(r,2);
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
    else {box = { command: 'message', text: 'Waiting for ping reduction: ' + ping};}
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


        // WHEN USER OPENS PAGE

        console.log('User opened page: ', client.id);

        //controller.send({command: 'message',  text: client.id + " connected."}, [], [client.id]);

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


    });

    controller.on('message', function(client, message) {


        var command = message.command;
        console.log("Command received by " + client.id + ": " + command);

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
        if (command == 'login') {

            //console.log("\tname: " + message.name);

            var userCheck = checkUser(client,message.name);

            if (userCheck === 'new') {
                //console.log("Creating new user...");
                client.id = message.name;
                newUser(client.id,client.ip,1);
                messageAll("Welcome, " + client.id + "!");
                client.send({command: 'updateuser', name: client.id, type: 1});
            }
            else if (userCheck === 'length') {
                messageClient(client,"That name is too short!");
                client.send({command: 'logout'});
            }
            else if (userCheck === 'match') {
                messageClient(client,"That name is already taken!");
                client.send({command: 'logout'});
            }
            else { // UPDATED USER
                client.id = userCheck.name;
                messageClient(client,"User info updated!");
                client.send({command: 'updateuser', name: client.id, type: userCheck.type});
            }
        }
        if (command == 'setadmin') {
            //console.log("\tname: " + message.name);
            if (message.key == adminKey) {
                var setAdminResult = setAdmin(message.name);
                if (setAdminResult) {
                    client.send({command: 'updateuser', name: client.id, type: 2});
                    messageClient(client,"With great power comes great responsiblity...");
                }
            }
            else {
                messageClient(client,"Invalid key");
            }
        }
        if (command == 'chat') {
            var text = message.text;

            if (checkAdmin(client.id)) {
                if (text.charAt(0) === '/') {
                    text = text.replace('/','');
                    adminCommand(text);
                }
                else{chatAll(client.id, message.text);}
            }

            chatAll(client.id, message.text);

        }

    });

    controller.on('error', function(error, client) {

        framework.error(error, 'websocket', controller.uri);

    });

    controller.on('start', function(client, message) {

    });


    // how many connections?
    // controller.online;
}

function adminCommand(text) {
    console.log("Admin Command: " + text);
    switch(text) {
        case 'help':
            // Print commands here (send message to admin)
            break;
        default:
            console.log("Command not found.");
            break;
    }
}

function checkAdmin(name) {
    for(var i = 0; i < idCounter; i++) {
        if (users[i].info.name == name) {
            if (users[i].info.type == 2) {return true;}
            else {return false;}
        }
    }
    return false;
}

function setAdmin(name) {
    //console.log(">>> Attemping to set admin");
    //var pass = false;
    for(var i = 0; i < idCounter; i++) {
        //console.log("\tComparing " + users[i].info.name + " and " + name);
        if (users[i].info.name == name) {
            //console.log("\tMatch!");
            users[i].info.type = 2;
            return true
        }
    }
   return false;
}

function checkUser(client,name) {
    ///
    /// Returns length if name is too short
    /// Returns match if name matches, but ip does not
    /// Returns updated user if name and ip match
    /// Returns new if name is not found
    ///

    //console.log(">>>>>> Checking Name: ",name,"(",name.length,")");

    // CHECK IF NAME IS LONG ENOUGH
    if (name.length < 5) {
        //console.log("\tName is too short")
        return 'length';
    }

    // FOR EACH USER
    for(var i = 0; i < idCounter; i++) {

        // CHECK IF THAT USER'S NAME IS THE GIVEN NAME
        //console.log("\tChecking " +  users[i].info.name + " against given name: " + name);

        if (users[i].info.name == name) {

            // IF SO, CHECK IF THE IP ADDRESS MATCHES THE REQUESTING CLIENT'S ADDRESS
            //console.log("\tNames match");
            //console.log("\tChecking " +  users[i].info.address + " against clients ip: " + client.ip);

            if (users[i].info.address == client.ip) {

                // IF SO, UPDATE EXISTING USER INFO WITH GIVEN INFO
                //console.log("\tAddresses match, returning info.");
                return users[i].info;
            }

            else {

                // IF NOT, THE NAME IS ALREADY USED BY SOMEONE ELSE, NOTIFY CLIENT
                //console.log("\tAddresses do not match, name taken");
                return 'match';
            }

        }
    }

    return 'new';

}

function getDistance(x1,y1,x2,y2) {

    return Math.sqrt(Math.pow(x2-x1,2) + Math.pow(y2-y1,2));

}

function newUser(name,address,type) {
    users[idCounter] = new User(idCounter,name,address,type);
    idCounter += 1;
    printUsers();
}

function printUsers() {
    console.log("Current Users: ");
    for(var i = 0; i < idCounter; i++) {
        users[i].print();
    }

}

function messageClient(client,message) {
    client.send({command: 'message', text: message});
}
function messageAll(message) {
    controller.send({command: 'message',  text: message }, [], []);
}
function chatAll(name,message) {
    controller.send({command: 'chat',  text: name + " > "  + message }, [], []);
}