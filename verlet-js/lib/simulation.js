/**
 * Created by aaronc on 10/29/14.
 */

/*
var Body = require('./body.js')

var timer = new Date();


var bodies = new Array(2);
bodies[0] = new Body(  0,  0,100,0);
bodies[1] = new Body( 10,  0, 10,1);
//bodies[2] = new Body( 10,  3, 10,2);
//bodies[3] = new Body( 10, -3, 10,3);
//bodies[4] = new Body(-10,  0, 10,4);
//bodies[5] = new Body(-10,  3, 10,5);
//bodies[6] = new Body(-10, -3, 10,6);
//bodies[7] = new Body(  0, 10, 10,7);


var steps = 100;
var G = 0.00000006673;
var PI2 = Math.PI * 2;
var frameTime = timer.getTime();
var deltaTime = 0;


// 6.673×10−11

for (var s=0;s<steps;s++) {
    setTimeout(update(s),10);
}

function update(step) {

    console.log("Step: " + step)

    for (var a=0;a<bodies.length;a++) {
        var bodyA = bodies[a];
        console.log(">" + bodies[a].toString());
        bodyA.resetForce()
        for (var b=0;b<bodies.length;b++) {
            var bodyB = bodies[b];
            if (bodyA.id != bodyB.id) {
                var r = getDistance(bodyA.x,bodyA.y,bodyB.x,bodyB.y);

                var theta = Math.atan((bodyB.y-bodyA.y)/(bodyB.x-bodyA.x));
                if (bodyB.x < bodyA.x) {theta += Math.PI;}
                if (theta >= PI2 ) {theta -= PI2;}
                if (theta <    0) {theta += PI2;}
                var tF = G*(bodyA.m*bodyB.m)/r^2;
                var tFx = Math.cos(theta) * tF;
                var tFy = Math.sin(theta) * tF;
                bodyA.addForce(tFx,tFy);


                console.log("Add Force: From: " + bodyB.toString() + " r: " + r + " | F: " + tF + " Fx: " + tFx + " Fy: " + tFy + " | Deg: " + (theta * (180 / Math.PI)) + " Rad: " + theta);




            }
        }

        //console.log(bodies[a].toString());
    }
    var out = "";
    timer = new Date();
    var deltaTime = timer.getTime() - frameTime;
    console.log(timer.getTime() + " - " + frameTime + " = " + deltaTime);
    for (var c=0;c<bodies.length;c++) {
        bodies[c].applyForce(deltaTime/1000);
        out = out + bodies[c].serialize();
    }
    frameTime = timer.getTime();

}
function getDistance(x1,y1,x2,y2) {

    return Math.sqrt(Math.pow(x2-x1,2) + Math.pow(y2-y1,2));

}

function sleep(milliseconds) {
    var start = new Date().getTime();
    for (var i = 0; i < 1e7; i++) {
        if ((new Date().getTime() - start) > milliseconds){
            break;
        }
    }
}
 */