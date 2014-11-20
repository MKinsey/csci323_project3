/**
 * Created by aaronc on 11/10/14.
 */


module.exports = Userbase;
var User = require('./user.js');

function Userbase() {
    this.users = new Array(50);
    this.cursor = 0;
    this.adminKey = 'starpeople';
    for(var i = 0; i < this.users.length; i++) {
        this.users[i] = null;
    }
}

Userbase.prototype.print = function() {
    console.log("Users: ----- ");
    for(var i = 0; i < this.users.length; i++) {
        if (this.users[i] != null) {
            this.users[i].print();
        }
    }
    console.log("------------- ");
};

Userbase.prototype.addUser = function(name,ip,type) {
    this.users[this.cursor] = new User(name,ip,type);
    index = this.cursor;
    this.findSlot();
    return index;
};

Userbase.prototype.removeUser = function(name) {
    for (var i = 0; i < this.users.length; i++) {
        if (this.users[i] != null) {
            if (this.users[i].info.name.toLowerCase() == name.toLowerCase()) {
                this.users[i] = null;
                return true;
            }
        }
    }
    return false;
};

Userbase.prototype.getUser = function(index) {
    if (this.users[index]!= null) {
        return this.users[index];
    }
    return null;
};

Userbase.prototype.setType = function(index,type,key) {

    switch(type) {
        case 0:
        case 1:
            this.users[index].type = type;
            return true;
            break;
        case 2:
            if (key == this.adminKey) {
                this.users[index].type = 2;
                return true;
            }
            else {
                return false;
            }
            break;
    }
}

Userbase.prototype.nameCheck = function(name) {
    for (var i = 0; i < this.users.length; i++) {
        if (this.users[i] != null) {
            if (this.users[i].info.name.toLowerCase() == name.toLowerCase()) {
                return false
            }
        }
    }
    return true;
}

Userbase.prototype.rename = function (index, name) {
    this.users[index].info.name = name;
}

Userbase.prototype.findSlot = function() {
    start = this.cursor;
    this.cursor += 1;
    while(this.users[this.cursor] != null && this.cursor != start) {
        this.cursor += 1;
        if (this.cursor = this.users.length) {
            this.cursor = 0;
        }
    }
};



