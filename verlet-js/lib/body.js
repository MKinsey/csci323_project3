
/*
Copyright 2013 Sub Protocol and other contributors
http://subprotocol.com/

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

// A simple 2-dimensional vector implementation

module.exports = Body

function Body(x, y, xx, yy, m, id) {
	this.x = x || 0;
	this.y = y || 0;
    this.xx = xx;
    this.yy = yy;
    this.fx = 0;
    this.fy = 0;
    this.m = m;
    this.c = 0;
    this.id = id;
}

Body.prototype.addForce = function(fx,fy) {
    this.fx += fx;
    this.fy += fy;

}

Body.prototype.resetForce = function() {
    this.fx = 0;
    this.fy = 0;
}

Body.prototype.applyForce = function(dt,pdt) {


    this.xx += (this.fx/this.m)*dt;
    this.yy += (this.fy/this.m)*dt;
    this.x += this.xx;
    this.y += this.yy;

    //var nx = x + (x-px) * (dt/pdt) + (this.fx/this.m)*dt*dt;


    //F = m*a
    //F = m*d/s/s
    //F*s*s = m*d
    //F*s*s/m = d
    // Distance = (Force/Mass)*Time^2

    //next position = current position + (current position - last position) * (this dt / last dt) + acceleration*(current dt * current dt)

    // v = a*t



}

Body.prototype.serializeUpdate = function() {
    //return [this.id,Math.round(this.x),Math.round(this.y)];
    return [this.id, Math.round(this.x*100)/100, Math.round(this.y*100)/100];
    //return this.id + "," + Math.round(this.x*100)/100 + "," + Math.round(this.y*100)/100 + "|"
}
Body.prototype.serializeInitial = function() {
    //return [this.id,Math.round(this.x),Math.round(this.y),this.m,this.c];
    return [this.id, Math.round(this.x*100)/100, Math.round(this.y*100)/100, this.m, this.c];
    //return this.id + "," + Math.round(this.x*100)/100 + "," + Math.round(this.y*100)/100 + "|"
}

Body.prototype.toString = function() {
    return "ID: " + this.id + " (" + this.x + ", " + this.y + ") m=" + this.m;
}

//Body.prototype.add = function(v) {
//	return new Body(this.x + v.x, this.y + v.y);
//}
//
//Body.prototype.sub = function(v) {
//	return new Body(this.x - v.x, this.y - v.y);
//}
//
//Body.prototype.mul = function(v) {
//	return new Body(this.x * v.x, this.y * v.y);
//}
//
//Body.prototype.div = function(v) {
//	return new Body(this.x / v.x, this.y / v.y);
//}
//
//Body.prototype.scale = function(coef) {
//	return new Body(this.x*coef, this.y*coef);
//}
//
//Body.prototype.mutableSet = function(v) {
//	this.x = v.x;
//	this.y = v.y;
//	return this;
//}
//
//Body.prototype.mutableAdd = function(v) {
//	this.x += v.x;
//	this.y += v.y;
//	return this;
//}
//
//Body.prototype.mutableSub = function(v) {
//	this.x -= v.x;
//	this.y -= v.y;
//	return this;
//}
//
//Body.prototype.mutableMul = function(v) {
//	this.x *= v.x;
//	this.y *= v.y;
//	return this;
//}
//
//Body.prototype.mutableDiv = function(v) {
//	this.x /= v.x;
//	this.y /= v.y;
//	return this;
//}
//
//Body.prototype.mutableScale = function(coef) {
//	this.x *= coef;
//	this.y *= coef;
//	return this;
//}
//
//Body.prototype.equals = function(v) {
//	return this.x == v.x && this.y == v.y;
//}
//
//Body.prototype.epsilonEquals = function(v, epsilon) {
//	return Math.abs(this.x - v.x) <= epsilon && Math.abs(this.y - v.y) <= epsilon;
//}
//
//Body.prototype.length = function(v) {
//	return Math.sqrt(this.x*this.x + this.y*this.y);
//}
//
//Body.prototype.length2 = function(v) {
//	return this.x*this.x + this.y*this.y;
//}
//
//Body.prototype.dist = function(v) {
//	return Math.sqrt(this.dist2(v));
//}
//
//Body.prototype.dist2 = function(v) {
//	var x = v.x - this.x;
//	var y = v.y - this.y;
//	return x*x + y*y;
//}
//
//Body.prototype.normal = function() {
//	var m = Math.sqrt(this.x*this.x + this.y*this.y);
//	return new Body(this.x/m, this.y/m);
//}
//
//Body.prototype.dot = function(v) {
//	return this.x*v.x + this.y*v.y;
//}
//
//Body.prototype.angle = function(v) {
//	return Math.atan2(this.x*v.y-this.y*v.x,this.x*v.x+this.y*v.y);
//}
//
//Body.prototype.angle2 = function(vLeft, vRight) {
//	return vLeft.sub(this).angle(vRight.sub(this));
//}
//
//Body.prototype.rotate = function(origin, theta) {
//	var x = this.x - origin.x;
//	var y = this.y - origin.y;
//	return new Body(x*Math.cos(theta) - y*Math.sin(theta) + origin.x, x*Math.sin(theta) + y*Math.cos(theta) + origin.y);
//}
//
//Body.prototype.toString = function() {
//	return "ID: " + this.id + " (" + this.x + ", " + this.y + ") m=" + this.m;
//}
//
//function test_Body() {
//	var assert = function(label, expression) {
//		console.log("Body(" + label + "): " + (expression == true ? "PASS" : "FAIL"));
//		if (expression != true)
//			throw "assertion failed";
//	};
//
//	assert("equality", (new Body(5,3).equals(new Body(5,3))));
//	assert("epsilon equality", (new Body(1,2).epsilonEquals(new Body(1.01,2.02), 0.03)));
//	assert("epsilon non-equality", !(new Body(1,2).epsilonEquals(new Body(1.01,2.02), 0.01)));
//	assert("addition", (new Body(1,1)).add(new Body(2, 3)).equals(new Body(3, 4)));
//	assert("subtraction", (new Body(4,3)).sub(new Body(2, 1)).equals(new Body(2, 2)));
//	assert("multiply", (new Body(2,4)).mul(new Body(2, 1)).equals(new Body(4, 4)));
//	assert("divide", (new Body(4,2)).div(new Body(2, 2)).equals(new Body(2, 1)));
//	assert("scale", (new Body(4,3)).scale(2).equals(new Body(8, 6)));
//	assert("mutable set", (new Body(1,1)).mutableSet(new Body(2, 3)).equals(new Body(2, 3)));
//	assert("mutable addition", (new Body(1,1)).mutableAdd(new Body(2, 3)).equals(new Body(3, 4)));
//	assert("mutable subtraction", (new Body(4,3)).mutableSub(new Body(2, 1)).equals(new Body(2, 2)));
//	assert("mutable multiply", (new Body(2,4)).mutableMul(new Body(2, 1)).equals(new Body(4, 4)));
//	assert("mutable divide", (new Body(4,2)).mutableDiv(new Body(2, 2)).equals(new Body(2, 1)));
//	assert("mutable scale", (new Body(4,3)).mutableScale(2).equals(new Body(8, 6)));
//	assert("length", Math.abs((new Body(4,4)).length() - 5.65685) <= 0.00001);
//	assert("length2", (new Body(2,4)).length2() == 20);
//	assert("dist", Math.abs((new Body(2,4)).dist(new Body(3,5)) - 1.4142135) <= 0.000001);
//	assert("dist2", (new Body(2,4)).dist2(new Body(3,5)) == 2);
//
//	var normal = (new Body(2,4)).normal()
//	assert("normal", Math.abs(normal.length() - 1.0) <= 0.00001 && normal.epsilonEquals(new Body(0.4472, 0.89443), 0.0001));
//	assert("dot", (new Body(2,3)).dot(new Body(4,1)) == 11);
//	assert("angle", (new Body(0,-1)).angle(new Body(1,0))*(180/Math.PI) == 90);
//	assert("angle2", (new Body(1,1)).angle2(new Body(1,0), new Body(2,1))*(180/Math.PI) == 90);
//	assert("rotate", (new Body(2,0)).rotate(new Body(1,0), Math.PI/2).equals(new Body(1,1)));
//	assert("toString", (new Body(2,4)) == "(2, 4)");
//}
//
