/**
 * Created by aaronc on 11/7/14.
 */

module.exports = User;

function User(name,ip,type) {
    this.info = {name: name, ip: ip, type: type};
    //types: 'view','edit','admin'
}
User.prototype.print = function() {
    console.log("\t" + this.info.name + " - " + this.info.ip + " - " + this.info.type);
};


