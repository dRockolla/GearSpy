'use strict';

var gearSpyDirectives = angular.module('gearSpyDirectives', ['gearSpyServices']);

gearSpyDirectives.directive('gearspyScatter', ['d3Service', 
    function(d3Service) {
        var link = function($scope, $el, $attrs) {
            d3Service.d3().then(function(d3) {
                var width = $el[0].clientWidth;
                var height = Math.round(width / 2);
                var padding = 30;
                var barOffset = padding + 52;
                var spdSvg = null;
                if (d3.select(".spdCdnc").empty()) {
                    spdSvg = d3.select("#scatter")
                        .classed("svg-container", true)
                        .append("svg")
                        .attr("width", width)
                        .attr("height", height)
                        .attr("class", "spdCdnc")
                        .attr("preserveAspectRatio", "xMinYMin meet")
                        .classed("svg-content-responsive", true) 
                        .attr("viewBox", "0 0 " + width + " " + height);
                    
                    spdSvg.append("clipPath")
                        .attr("id", "chart-area")
                        .append("rect")
                        .attr("x", padding)
                        .attr("y", padding)
                        .attr("width", width - padding * 3)
                        .attr("height", height - padding * 2);
                    
                    spdSvg.append("g")
                        .attr("id", "circles")
                        .attr("clip-path", "url(#chart-area)");

                } else {
                    spdSvg = d3.select(".spdCdnc");
                }
                
                var ratioMax = d3.max($scope.points, function(d) { return d.gear.ratio; });
                var ratioMin = d3.min($scope.points, function(d) { return d.gear.ratio; });
                
                var xScale = d3.scale.linear()
                    .domain([0, d3.max($scope.points, function(d) { return d.speed; })])
                    .range([padding, widht - padding]);
                    
                var yScale = d3.scale.linear()
                    .domain([0, d3.max($scope.points, function(d) { return d.cadence; })])
                    .range([height - padding, padding]);
                
                var color = d3.scale.category20();
                var cScale = d3.scale.linear()
                    .domain([ratioMin, ratioMax])
                    .range([0, 20]);
                
                var circles = spdSvg.selectAll("circle")
                .data($scope.points);
                
                var circUpdate = circles;
                
                circUpdate.attr("class", "data-point")
                .attr("opacity", 0.0)
                .attr('ratio', function(d) {
                    return d.gear.ratio;
                })
                .transition()
                .delay(function(d, i) {
                    return i * 40;
                })
                .duration(500)
                .attr("cx", function(d) {
                        return Math.round(xScale(d.speed));
                })
                .attr("cy", function(d) {
                        return Math.round(yScale(d.cadence));
                })
                .attr("opacity", 0.8)
                .attr("r", 4)
                .attr("fill", function(d) {
                    return color(cScale(d.gear.ratio));
                })
                .each("end", function() {
                    d3.select(this)
                        .attr("opacity", 0.3)
                        .attr("r", 3);
                });
                
                var circEnter = circles
                .enter()
                .append("circle")
                .attr("class", "data-point")
                .transition()
                .delay(function(d, i) {
                    return i * 40;
                })
                .duration(500)
                .attr("cx", function(d) {
                        return Math.round(xScale(d.speed));
                })
                .attr("cy", function(d) {
                        return Math.round(yScale(d.cadence));
                })
                .attr("opacity", 0.8)
                .attr("r", 4)
                .attr("fill", function(d) {
                    return color(cScale(d.gear.chainring + d.gear.cog));
                })
                .each("end", function() {
                    d3.select(this)
                        .attr("opacity", 0.3)
                        .attr("r", 3);
                });
                
                circles.exit().remove();
                
                if ( d3.selectAll(".axis").empty() ) {
                    spdSvg.append("g")
                        .attr("class", "axis")  //Assign "axis" class
                        .attr("transform", "translate(0," + (height - padding) + ")")
                        .call(d3.svg.axis()
                            .scale(xScale)
                            .orient("bottom")
                        );
                
                    //Create Y axis
                    spdSvg.append("g")
                        .attr("class", "axis")
                        .attr("transform", "translate(" + (padding) + ",0)")
                        .call(d3.svg.axis()
                            .scale(yScale)
                            .orient("left")
                            .ticks(5)
                        );
                };
                
                /*
                svg.selectAll(".loading").remove();
                    
                var yMean = d3.mean(data, function(d) {
                    return d.cadence;
                });
                var xMax = d3.max(data, function(d) {
                    return d.speed;
                });
                
                var trendData = [[0, yMean, xMax, yMean]];
                
                svg.selectAll(".trend-line")
                    .data(trendData)
                    .enter()
                    .append("line")
                    .attr("class", "trend-line")
                    .attr("x1", function(d) { return xScale(d[0]); })
                    .attr("y1", function(d) { return yScale(d[1]); })
                    .attr("x2", function(d) { return xScale(d[2]); })
                    .attr("y2", function(d) { return yScale(d[3]); })
                    
                svg.selectAll(".trend-label")
                    .data(trendData)
                    .enter()
                    .append("text")
                    .text(function(d) {
                        return Math.round(d[1]);
                    })
                    .attr("x", function(d) {
                        return xScale(d[0]);
                    })
                    .attr("y", function(d) {
                        return yScale(d[1]);
                    })
                    .attr("class", "trend-label")
                    */
                
            
                $scope.$watch('points', update);
            });
        };

        return {
            template: '<div id="scatter" class="canvas"></div>',
            replace: true,
            link: link,
            restrict: 'E'
        };
    }
]);