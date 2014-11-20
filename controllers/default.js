exports.install = function(framework) {
    framework.route('/', view_homepage);
    framework.route('/usage/', view_usage);
    framework.websocket('/', socket_homepage, ['json']);
}
var Userbase = require('./lib/userbase.js');
var Simulator = require('./lib/simulator.js');


// OTHER
var userbase = new Userbase();
var simulator = new Simulator();
var controller;

// DEBUG
var userbaseDebug = true;

// TIMING
var play = false;
var steps = 0;


// VIEW
var translation = [0,0];
var zoom = 1;




function step() {
    if (play) {
        steps += 1;
        //console.log("Step: " + steps);

        controller.send(simulator.simulate());

        setTimeout(step, 5);
    }

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

        client.name = "guest" + Date.now();
        var index = userbase.addUser(client.name,client.id,0);
        if (userbaseDebug) {userbase.print();}
        client.send({command: 'updateuser', name: client.name, type: 0, index: index});


        client.send({command: 'updateuser', name: client.name, type: 2, index: index});
        client.send({command: 'message', text: "You have been automatically assigned an admin access level."});


        console.log('Connect (' + client.name + ') / Online:', controller.online);
        controller.send({command: 'users', users: controller.online});

        //client.send({command: 'message', message: 'User Connected: {0}'.format(client.id) });
        //controller.send({command: 'message',  message: 'Connect new user: {0}\nOnline: {1}'.format(client.id, controller.online) }, [], [client.id]);

        initialize(client);

    });

    controller.on('close', function(client) {

        userbase.removeUser(client.name);
        if (userbaseDebug) {userbase.print();}

        //WHEN USER DISCONNECTS
        console.log('Disconnect (' + client.name + ') / Online:', controller.online);
        //client.send({ message: 'User Disconnected: {0}'.format(client.id) });
        //controller.send({ message: 'Disconnect user: {0}\nOnline: {1}'.format(client.id, controller.online) });
        controller.send({command: 'users', users: controller.online});


    });

    controller.on('message', function(client, message) {

        var command = message.command;
        console.log("Command received by " + client.name + ": " + command);

        if (command == 'viewport') {
            controller.send({command:'viewport', translation: message.translation, zoom: message.zoom}, [], [client.id]);
            translation = message.translation;
            zoom = message.zoom;
        }

        if (command == 'edit') {
            simulator.bodies[message.body.id].x = message.body.x;
            simulator.bodies[message.body.id].y = message.body.y;
            simulator.bodies[message.body.id].m = message.body.m;

            controller.send({command:'edit', body: message.body}, [], [client.id]);
        }

        if (command == 'start') {
            console.log("Starting...");
            play = true;
            controller.send({command: 'start'});
            step();
        }
        if (command == 'stop') {
            console.log("Stopping...");
            play = false;
            controller.send({command: 'stop'});
        }
        if (command == 'reset') {
            console.log("Resetting...");
            play = false;
            simulator.reset();
            steps = 0;

            initialize(controller);
        }
        if (command == 'rename') {

            var index = message.index;
            var name = message.name;

            if (userbase.nameCheck(name)) {
                userbase.rename(index,name);
                client.send({command: 'updateuser', name: name, type: null, index: null});
                console.log("Renamed: " + client.name + " --> " + name);
                client.send({command: 'message', text: client.name + " renamed to " + name + "."});
                client.name = name;
            }
            else {
                console.log("Rename failed: Name taken.");
            }


        }
        if (command == 'requesttype') {

            var index = message.index;
            var type = message.type;
            var key = message.key;

            if (userbase.setType(index,type,key)) {
                client.send({command: 'updateuser', name: null, type: type, index: null});
                console.log("Updated type: " + client.name + " now has permission level " + type + ".");
            }
            else {
                console.log("Type update denied: Incorrect admin key.");
            }
        }
        if (command == 'send') {
            var text = message.text;
            controller.send({command: 'chat', sender: client.name, text: text});
        }

        if (command == 'add') {
            var info = message.info;
            simulator.addBody(info[0],info[1],info[2],info[3],info[4],info[5]);   //(x,y,xx,yy,m,userID)
            initialize(controller);
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

function initialize(client) {
    var initBodies = simulator.initialize();

    var box = {command: 'initialize', bodies: initBodies, running: play};
    client.send(box);

    client.send({command:'viewport', translation: translation, zoom: zoom}, [], [client.id]);
}
