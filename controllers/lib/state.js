/**
 * Created by aaronc on 11/15/14.
 */
module.exports = State;

var Body = require('./body.js');

function State(bodies) {
    this.bodies = new Array(bodies.length);
    for(var i = 0; i < bodies.length; i++) {
        this.bodies[i] = bodies[i].clone();
    }

}

State.prototype.load = function() {

    newBodies = new Array(this.bodies.length);
    for(var i = 0; i < this.bodies.length; i++) {
        newBodies[i] = this.bodies[i].clone();
    }

    return newBodies;
};
