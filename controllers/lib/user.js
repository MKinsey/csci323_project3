/**
 * Created by aaronc on 11/7/14.
 */

module.exports = User;

function User(name,userID,type) {
    this.info = {name: name, userID: userID, type: type};
    //types: 'view','edit','admin'
}

User.prototype.print = function() {
    console.log("\t" + this.info.name + " - " + this.info.userID + " - " + this.info.type);
};


