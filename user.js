/**
 * Created by aaronc on 11/7/14.
 */

module.exports = User;

function User(id,name,address,type) {
    this.info = { id: id, name: name, address: address, type: type};
    //types: 'view','edit','admin'
}
User.prototype.print = function() {
    console.log(this.info.id + " - " + this.info.name + " - " + this.info.address + " - " + this.info.type);
}


