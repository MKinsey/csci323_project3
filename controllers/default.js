exports.install = function(framework) {
    framework.route('/', view_homepage);
    framework.route('/usage/', view_usage);
    framework.websocket('/', socket_homepage, ['json']);
}
var Userbase = require('./lib/userbase.js');
var Simulator = require('./lib/simulator.js');
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/orbitable');

// OTHER
var userbase = new Userbase();
var simulator = new Simulator();
var controller;
var idCounter = 100;
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
    var cookie = self.req.cookie('__orbitable_id');
    if (!cookie) self.res.cookie('__orbitable_id', Date.now());
}

var num = 0;
var SystemSchema = new mongoose.Schema({ num: Number, bodies: [] });
var System = mongoose.model('System', SystemSchema);
var UserSchema = new mongoose.Schema({ orbitable_id: String, name: String, permissions: Number });
var User = mongoose.model('User', UserSchema);

function generateName() {
    var adjs = [
                "autumn", "hidden", "bitter", "misty", "silent", "empty", "dry", "dark",
                "summer", "icy", "delicate", "quiet", "white", "cool", "spring", "winter",
                "patient", "twilight", "dawn", "crimson", "wispy", "weathered", "blue",
                "billowing", "broken", "cold", "damp", "falling", "frosty", "green",
                "long", "late", "lingering", "bold", "little", "morning", "muddy", "old",
                "red", "rough", "still", "small", "sparkling", "throbbing", "shy",
                "wandering", "withered", "wild", "black", "young", "holy", "solitary",
                "fragrant", "aged", "snowy", "proud", "floral", "restless", "divine",
                "polished", "ancient", "purple", "lively", "nameless"
                ];

    var nouns = [
                 "waterfall", "river", "breeze", "moon", "rain", "wind", "sea", "morning",
                 "snow", "lake", "sunset", "pine", "shadow", "leaf", "dawn", "glitter",
                 "forest", "hill", "cloud", "meadow", "sun", "glade", "bird", "brook",
                 "butterfly", "bush", "dew", "dust", "field", "fire", "flower", "firefly",
                 "feather", "grass", "haze", "mountain", "night", "pond", "darkness",
                 "snowflake", "silence", "sound", "sky", "shape", "surf", "thunder",
                 "violet", "water", "wildflower", "wave", "water", "resonance", "sun",
                 "wood", "dream", "cherry", "tree", "fog", "frost", "voice", "paper",
                 "frog", "smoke", "star"
                 ];

    var rnd = Math.floor(Math.random()*Math.pow(2,12));
    return adjs[rnd>>6%64]+"-"+nouns[rnd%64];
}

function socket_homepage() {

    controller = this;

    controller.on('open', function(client) {

        // WHEN USER CONNECTS

        // Look up user if exists
        var query = User.where({ orbitable_id: client.cookie("__orbitable_id")});
        query.findOne(function(err, usr) {
                if(err) {
                    console.log("user fetch error: " + err);
                } else if(usr) {
                    console.log("found user");
                    console.log(usr);
                    client.name = usr.name;
                    client.permissions = usr.permissions;
                    var index = userbase.addUser(usr.name, client.id, usr.permissions);
                    client.send({command: 'updateuser', name: usr.name, type: usr.permissions, index: index});
                } else {
                    var newUser = new User({ orbitable_id: client.cookie("__orbitable_id"), name: generateName(), permissions: 0 });
                    newUser.save(function(err) {
                            if(err) console.log("new user error: " + err);
                        });
                    console.log(newUser);
                    client.name = newUser.name;
                    client.permissions = newUser.permissions;
                    var index = userbase.addUser(newUser.name, client.id, newUser.permissions);
                    client.send({command: 'updateuser', name: newUser.name, type: newUser.permissions, index: index});
                }
                console.log('Connect (' + client.name + ') / Online:', controller.online);
                controller.send({command: 'users', users: controller.online});
            });


        //client.send({command: 'updateuser', name: client.name, type: 2, index: index});
        //client.send({command: 'message', text: "You have been automatically assigned an admin access level."});


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
            simulator.bodies[message.body.id].xx = message.body.xx;
            simulator.bodies[message.body.id].yy = message.body.yy;
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
                User.findOne({ name: client.name }, function(err, usr) {
                        if(!err && usr) {
                            usr.name = name;
                            usr.save();
                        }
                    });
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
                User.findOne({orbitable_id: client.cookie("__orbitable_id")}, function(err, usr) {
                        console.log("hello!", err, usr);
                        if(!err && usr) {
                            usr.permissions = type;
                            usr.save();
                        }
                    });
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
            console.log("Adding Body:",info[0],info[1],info[2],info[3],info[4],idCounter);
            idCounter += 1;
            initialize(controller);
        }

        if (command == 'delete') {
            var id = message.id;
            simulator.destroyBody(id);
            initialize(controller);
        }

        if (command == 'save') {
            System.remove({}, function() { console.log("removed all")});
            var mySystem = new System({num: num++, bodies: simulator.initialize()});
            mySystem.save(function(err) {
                    console.log(err);
                });
        }

        if  (command == 'load') {
            System.findOne({}, function(err, res) {
                    if(res) {
                        console.log("found one");
                        console.log(res.bodies);
                        simulator.load(res.bodies);
                        initialize(controller);
                    }
                });
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
