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
//var phonecatApp = angular.module('phonecatApp', []);

var d3app = angular.module('d3angularapp', ['d3'])
    .directive('d3Bodies', ['$window', '$timeout', 'd3Service',
                          function($window, $timeout, d3Service) {
                       return {
                           restrict: 'EA',
                           scope: {
                                                              data: '='
                                                              //                                                              label: '@',
                                                              //                                                              onClick: '&'
                           },
                           link: function(scope, ele, attrs) {
                               d3Service.d3().then(function(d3) {
 
                                       var renderTimeout;
                                       var margin = parseInt(attrs.margin) || 20,
                                       barHeight = parseInt(attrs.barHeight) || 20,
                                       barPadding = parseInt(attrs.barPadding) || 5;
 
                                       var svg = d3.select(ele[0])
                                       .append('svg')
                                       .style('width', '100%');
 
                                       $window.onresize = function() {
                                           scope.$apply();
                                       };
 
                                       scope.$watch(function() {
                                               return angular.element($window)[0].innerWidth;
                                           }, function() {
                                               scope.render(scope.data);
                                           });
 
                                       scope.$watch('data', function(newData) {
                                               scope.render(newData);
                                           }, true);

                                       scope.render = function(data) {
                                           var masses = data.map(function(d) {
                                                   return d.m;
                                               });
                                           var circle = svg.selectAll("circle").data(masses);
                                           var circleEnter = circle.enter().append("circle");

                                           circleEnter.attr("cy", 20);
                                           circleEnter.attr("cx", function(d,i) {return i*100 + 50;});
                                           circleEnter.attr("r", function(d) {return Math.sqrt(d)});
                                       };

                                       // scope.render = function(data) {
//                                            svg.selectAll('*').remove();
//
//                                            if (!data) return;
//                                            if (renderTimeout) clearTimeout(renderTimeout);
//
//                                            renderTimeout = $timeout(function() {
//                                                    var width = d3.select(ele[0])[0][0].offsetWidth - margin,
//                                                    height = scope.data.length * (barHeight + barPadding),
//                                                    color = d3.scale.category20(),
//                                                    xScale = d3.scale.linear()
//                                                    .domain([0, d3.max(data, function(d) {
//                                                                    return d.score;
//                                                                })])
//                                                    .range([0, width]);
//
//                                                    svg.attr('height', height);
//
//                                                    svg.selectAll('rect')
//                                                    .data(data)
//                                                    .enter()
//                                                    .append('rect')
//                                                    //                                                   .on('click', function(d,i) {
//                                                    //                                                           return scope.onClick({item: d});
//                                                    //                                                       })
//                                                    .attr('height', barHeight)
//                                                    .attr('width', 140)
//                                                    .attr('x', Math.round(margin/2))
//                                                    .attr('y', function(d,i) {
//                                                            return i * (barHeight + barPadding);
//                                                        })
//                                                    .attr('fill', function(d) {
//                                                            return color(d.score);
//                                                        })
//                                                    .transition()
//                                                    .duration(1000)
//                                                    .attr('width', function(d) {
//                                                            return xScale(d.score);
//                                                        });
//                                                    svg.selectAll('text')
//                                                    .data(data)
//                                                    .enter()
//                                                    .append('text')
//                                                    .attr('fill', '#fff')
//                                                    .attr('y', function(d,i) {
//                                                            return i * (barHeight + barPadding) + 15;
//                                                        })
//                                                    .attr('x', 15)
//                                                    .text(function(d) {
//                                                            return d.name + " (scored: " + d.score + ")";
//                                                        });
//                                                }, 200);
//                                        };
                                   });
                           }}
                   }]);

bodyData = [
        {id: 0, x: 50, y: 20, m: 10}, {id: 1, x: 100, y: 20, m: 20}, {id: 2, x: 150, y: 20, m: 30}
       ];

d3app.controller('D3Ctrl', ['$scope', function($scope){
            $scope.data = bodyData;
        }]);

/*phonecatApp.controller('PhoneListCtrl', function ($scope) {
  $scope.phones = [
    {'name': 'Nexus S',
     'snippet': 'Fast just got faster with Nexus S.'},
    {'name': 'Motorola XOOM™ with Wi-Fi',
     'snippet': 'The Next, Next Generation tablet.'},
    {'name': 'MOTOROLA XOOM™',
     'snippet': 'The Next, Next Generation tablet.'}
  ];
  });*/