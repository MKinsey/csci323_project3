// var orbitApp = angular.module('orbit', [])
// orbitApp.controller('OrbitController', function(){
// 	var svg = d3.select("svg");
//
// 	var circle = svg.selectAll("circle").data([10, 20, 30])
//
// 	var circleEnter = circle.enter().append("circle");
//
// 	circleEnter.attr("cy", 250);
// 	circleEnter.attr("cx", function (d, i) {return i * 100 + 50 ;});
// 	circleEnter.attr("r", function(d) {return Math.sqrt(d);});
// });
var phonecatApp = angular.module('phonecatApp', []);

phonecatApp.controller('PhoneListCtrl', function ($scope) {
  $scope.phones = [
    {'name': 'Nexus S',
     'snippet': 'Fast just got faster with Nexus S.'},
    {'name': 'Motorola XOOM™ with Wi-Fi',
     'snippet': 'The Next, Next Generation tablet.'},
    {'name': 'MOTOROLA XOOM™',
     'snippet': 'The Next, Next Generation tablet.'}
  ];
});