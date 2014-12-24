'use strict';

var gearSpyServices = angular.module('gearSpyServices', []);

gearSpyServices.factory('d3Service', ['$document', '$window', '$q', '$rootScope',
	function($document, $window, $q, $rootScope) {
		var d = $q.defer(),
		d3service = {
			d3: function() { return d.promise; }
		};
		function onScriptLoad() {
			$rootScope.$apply(function() { d.resolve(window.d3); });
		}
		var scriptTag = $document[0].createElement('script');
		scriptTag.type = 'text/javascript'; 
		scriptTag.async = true;
		scriptTag.src = 'http://d3js.org/d3.v3.min.js';
		scriptTag.onreadystatechange = function() {
			if (this.readyState == 'complete') onScriptLoad();
		}
		scriptTag.onload = onScriptLoad;
		
		var s = $document[0].getElementsByTagName('body')[0];
		s.appendChild(scriptTag);
		
		return {
			d3: function() { return d.promise; }
		};
}]);

gearSpyServices.factory('Activity', ['$http', '$routeParams', function($http, $routeParams) {
	return {
		id: null,
		get: function(callback) {
			var id = (this.id) ? this.id : $routeParams.activityId
			$http.get("inc/GearSpy.php?action=activity&id=" + id).success(function(data) {
				callback(data);
			});
		}
	}
}]);

gearSpyServices.factory('User', ['$http', function($http) {
	return {
		get: function(callback) {
			$http.get("inc/GearSpy.php?action=auth").success(function(data) {
				callback(data);
			});
		}
	}
}]);


gearSpyServices.factory('ActivityList', ['$http', function($http) {
	return {
		activities: null,
		get: function(callback) {
			if (!this.activities) { 
				//console.log("calling for activities");
				$http.get("inc/GearSpy.php?action=initui").success(function(data) {
					callback(data.activities);
				});
			}
		}
	}
}]);

gearSpyServices.factory('GearSpy', ['d3Service', function(d3Service) {
	return {
		h: 350,
		w: 700,
		padding: 30,
		barOffset: null,
		dataset: null,
		gearing: null,
		plotSpdCadnc: function(data) {
			this.w = d3.select(".map").property("width");
			this.h = Math.round(this.w / 2);
			this.barOffset = this.padding + 52;
			var spdSvg = null;
			if (d3.select(".spdCdnc").empty()) {
				spdSvg = d3.select("#scatter")
					.classed("svg-container", true)
					.append("svg")
					.attr("width", this.w)
					.attr("height", this.h)
					.attr("class", "spdCdnc")
					.attr("preserveAspectRatio", "xMinYMin meet")
					.classed("svg-content-responsive", true) 
					.attr("viewBox", "0 0 " + this.w + " " + this.h);
				
				spdSvg.append("clipPath")
				    .attr("id", "chart-area")
				    .append("rect")
				    .attr("x", this.padding)
				    .attr("y", this.padding)
				    .attr("width", this.w - this.padding * 3)
				    .attr("height", this.h - this.padding * 2);
				
				spdSvg.append("g")
					.attr("id", "circles")
					.attr("clip-path", "url(#chart-area)");

			} else {
				spdSvg = d3.select(".spdCdnc");
			}
			
			var ratioMax = d3.max(data, function(d) { return d.gear.ratio; });
			var ratioMin = d3.min(data, function(d) { return d.gear.ratio; });
			
			var xScale = d3.scale.linear()
				.domain([0, d3.max(data, function(d) { return d.speed; })])
				.range([this.padding, this.w - this.padding]);
				
			var yScale = d3.scale.linear()
				.domain([0, d3.max(data, function(d) { return d.cadence; })])
				.range([this.h - this.padding, this.padding]);
			var color = d3.scale.category20();
				
			var cScale = d3.scale.linear()
				.domain([ratioMin, ratioMax])
				.range([0, 20]);
			
			var circles = spdSvg.selectAll("circle")
			.data(data);
			
			var circUpdate = circles;
			
			circUpdate.attr("class", "data-point")
			.attr("opacity", 0.0)
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
					.attr("transform", "translate(0," + (this.h - this.padding) + ")")
					.call(d3.svg.axis()
						.scale(xScale)
						.orient("bottom")
					);
			
				//Create Y axis
				spdSvg.append("g")
					.attr("class", "axis")
					.attr("transform", "translate(" + (this.padding) + ",0)")
					.call(d3.svg.axis()
						.scale(yScale)
						.orient("left")
						.ticks(5)
					);
			}
			
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
			
		},
		plotGearPie: function(data) {

			// find the maximum chainring (in number of teeth, which is kinda the circumference)
			var cMax = d3.max(data, function(d) { return d.chainring; });
			// divide by PI to get a kinda diameter
			var rMax = Math.round(cMax / Math.PI);
			
			if (d3.select(".barChart").empty()) {
				d3.select("#barChart")
					.append("svg")
					.attr("class", "barChart")
					.attr("width", this.w)
					.attr("height", (rMax * data.length) * 2.2 + this.padding);
					
				this.reOrder({value:""})
			}
				this.updateBars(data);
				
		},

		updateBars: function(data) {
			// find the maximum chainring (in number of teeth, which is kinda the circumference)
			var cMax = d3.max(data, function(d) { return d.chainring; });
			// divide by PI to get a kinda diameter
			var rMax = Math.round(cMax / Math.PI);
			
			var xScale = d3.scale.linear()
				.domain([d3.min(data, function(d) { return d.percent; }), d3.max(data, function(d) { return d.percent; })])
				//.range([1, this.w]);
				.range([this.barOffset + rMax, this.w - this.padding]);
				
			var yScale = d3.scale.linear()
		   		.domain([0, data.length])
		   		.range([this.padding, this.h - this.padding]);
			
			var color = d3.scale.category20();
			var cScale = d3.scale.linear()
				.domain([d3.min(data, function(d) { return d.ratio; }), d3.max(data, function(d) { return d.ratio; })])
				.range([0, 20]);
				
			var svg = d3.select(".barChart");
			
			var bar = svg.selectAll(".barGroup")
				.data(data);
			
			var barUpdate = bar;
			
			barUpdate.select("line")
				.attr("x1", cMax*2)
				.attr("y1", 0)
				.attr("x2", cMax*2)
				.attr("y2", 0)
				.transition()
				.duration(1000)
				.attr("y2", 0)
				.attr("x2", function(d) {
					return xScale(d.percent);
					//return Math.round((cMax*2)) + (this.w * (d.percent / 100));
				});
			
			barUpdate.select(".chainring")
				.attr("cx", 25 + (cMax / 2))
				.attr("cy", 0)
				.attr("r", function(d) {
					return Math.round(d.chainring / Math.PI);
				})
				.attr("fill", function(d, i) {
					return color(cScale(d.chainring));
				});
			
			barUpdate.select(".cog")
				.attr("cx", parseInt(25) + parseInt(cMax) + parseInt(5) )
				.attr("cy", 0)
				.attr("r", function(d) {
					return Math.round(d.cog / Math.PI);
				})
				.attr("fill", function(d, i) {
					return color(cScale(d.cog));
				});
			
			barUpdate.select(".percent")
				.text( function(d) {
					return d.percent + "%"; 
				})
				.attr("class", "percent")
				.attr("x", cMax*2)
				.attr("y", 0)
				.transition()
				.duration(1000)
				.attr("x", function(d) {
					return xScale(d.percent) - 5;
					//return Math.round((cMax * 2) + this.w * (d.percent / 100) - 15);
				});

			barUpdate.select(".distance")
				.text( function(d) {
					return (Math.round((d.distance / 1609.344) * 100) / 100) + " mi" ; 
				})
				.attr("class", "distance")
				.attr("x", cMax * 2)
				.attr("y", 0)
				.transition()
				.duration(1000)
				.attr("x", function(d) {
					return xScale(d.percent) + 5;
					//return Math.round((cMax * 2) + (this.w * (d.percent / 100) + 8));
				});
			
			barUpdate.select(".gear")
				.text( function(d) {
					return d.chainring + "-" + d.cog; 
				})
				.attr("class", "gear")
				.attr("x", 0)
				.attr("y", 0);
			
			var barEnter = bar.enter()
				.append("g")
				.attr("class", "barGroup")
				.attr("transform", function(d, i) {
					return "translate(0, " + ((rMax * 2.2) * (i + 1)) + ")";
				});
					
			barEnter.append("line")
				.attr("x1", cMax*2)
				.attr("y1", 0)
				.attr("x2", cMax*2)
				.attr("y2", 0)
				.attr('stroke', function(d) {
					return color(cScale(d.ratio));
				})
				.transition()
				.duration(1000)
				.attr("y2", 0)
				.attr("x2", function(d) {
					return xScale(d.percent);
					//return Math.round((cMax*2)) + (this.w * (d.percent / 100));
				});
			
			barEnter.append("circle")
				.attr("class", "chainring")
				.attr("cx", 25 + (cMax / 2))
				.attr("cy", 0)
				.attr("r", function(d) {
					return Math.round(d.chainring / Math.PI);
				})
				.attr("fill", function(d, i) {
					return color(cScale(d.chainring));
				});
			
			barEnter.append("circle")
				.attr("class", "cog")
				.attr("cx", 25 + cMax + 5)
				.attr("cy", 0)
				.attr("r", function(d) {
					return Math.round(d.cog / Math.PI);
				})
				.attr("fill", function(d, i) {
					return color(cScale(d.cog));
				});
				
			barEnter.append("text")
				.text( function(d) {
					return d.percent + "%"; 
				})
				.attr("class", "percent")
				.attr("x", cMax*2)
				.attr("y", 0)
				.transition()
				.duration(1000)
				.attr("x", function(d) {
					return xScale(d.percent) - 5;
					//return Math.round((cMax * 2) + this.w * (d.percent / 100) - 15);
				})
				.each(function(d) {
					d.visible = xScale(d.percent) > 145;
				})
				.style('display', function(d) {
					return d.visible ? null : 'none';
				});
			
			barEnter.append("text")
				.text( function(d) {
					return (Math.round((d.distance / 1609.344) * 100) / 100) + " mi" ; 
				})
				.attr("class", "distance")
				.attr("x", cMax * 2)
				.attr("y", 0)
				.transition()
				.duration(1000)
				.attr("x", function(d) {
					return xScale(d.percent) + 5;
					//return Math.round((cMax * 2) + (this.w * (d.percent / 100) + 8));
				});
				
			barEnter.append("text")
				.text( function(d) {
					return d.chainring + "-" + d.cog; 
				})
				.attr("class", "gear")
				.attr("x", 0)
				.attr("y", 0);
				
			var barExit = bar.exit()
			.transition()
			.duration(500)
			.attr("transform", function(d, i) {
				return "translate(800, 0)";
			})
			.remove();

			this.reOrder(this.sort);
				/*
				var outerRadius = ((rMax) * (data.length));
				var innerRadius = outerRadius * 0.6;
				
				var arc = d3.svg.arc()
						.innerRadius(function(d) {
							//return (d.data.chainring * Math.PI);
							return 50 * Math.PI;
						})
						.outerRadius(function(d) {
							//return (d.data.chainring * Math.PI) + (d.data.cog * Math.PI);
							return 100 * Math.PI;
						});
						
				var myPie = d3.layout.pie()
				.value(function(d) {
					return d.use_count;
				})
				.sort(function(d) {
					return d.chainring;
				});
				
			var arcs = d3.select("svg")
				.selectAll("g.arc")
				.data(myPie(data))
				.enter()
				.append("g")
				.attr("class", "arc")
				.attr("transform", "translate(" + (outerRadius) + "," + (outerRadius) + ")");
				
				arcs.append("path")
				.attr("d", arc)
				.attr("fill", function(d, i) {
					return color(cScale(d.data.ratio));
				})
				.on("mouseover", function(d) {
			
				//Get this bar's x/y values, then augment for the tooltip
				var xPosition = parseFloat(d3.event.pageX);
				var yPosition = parseFloat(d3.event.pageY);
									
				//Update the tooltip position and value
				d3.select("#tooltip")
				  .style("left", xPosition + "px")
				  .style("top", yPosition + "px")
				  .select("#value")
				  .text(d.data.chainring + " x " + d.data.cog);
				
				//Show the tooltip
				d3.select("#tooltip").classed("hidden", false);
			
				}).on("mouseout", function() {
					//Hide the tooltip
					d3.select("#tooltip").classed("hidden", true);
				});		
				*/
		},

		plotClimbing: function(data) {
			var xScale = d3.scale.linear()
				.domain([d3.min(data, function(d) { return d.distance; }), d3.max(data, function(d) { return d.distance; })])
				.range([this.padding, this.w - this.padding]);
				
			var yScale = d3.scale.linear()
				.domain([d3.min(data, function(d) { return d.altitude; }), d3.max(data, function(d) { return d.altitude; })])
		   		.range([this.h - this.padding, this.padding]);
		   		
			var color = d3.scale.category20();
				
			var cScale = d3.scale.linear()
				.domain([d3.min(data, function(d) { return d.gear.ratio; }), d3.max(data, function(d) { return d.gear.ratio; })])
				.range([0, 20]);
		   		
		   	if (d3.select(".elevationPlot").empty()) {
					var elevSvg = d3.select("#elevationPlot")
						.classed("svg-container", true)
						.attr("width", this.w)
						.attr("height", this.h)
						.append("svg")
						.attr("class", "elevationPlot")
						.attr("preserveAspectRatio", "xMinYMin meet")
						.classed("svg-content-responsive", true) 
						.attr("viewBox", "0 0 " + this.w + " " + this.h);
				
					elevSvg.append("clipPath")
					    .attr("id", "elev-area")
					    .append("rect")
					    .attr("x", this.padding)
					    .attr("y", this.padding)
					    .attr("width", this.w - this.padding * 2)
					    .attr("height", this.h - this.padding * 2);
					    		
					if ( d3.selectAll(".eAxis").empty() ) {
						elevSvg.append("g")
							.attr("class", "eAxis")  //Assign "axis" class
							.attr("transform", "translate(0," + (this.h - this.padding) + ")")
							.call(d3.svg.axis()
								.scale(xScale)
								.orient("bottom")
							);
					
						//Create Y axis
						elevSvg.append("g")
							.attr("class", "eAxis")
							.attr("transform", "translate(" + (this.padding) + ",0)")
							.call(d3.svg.axis()
								.scale(yScale)
								.orient("left")
								.ticks(5)
							);
					}
			}
			
			var elevGroup = d3.select(".elevationPlot")
				.append("g")
				.attr("class", "elevGroup")
				.attr("clip-path", "url(#elev-area)");
			
			var lineFn = d3.svg.line()
			    .x(function(d) { return xScale(d.distance); })
			    .y(function(d) { return yScale(d.altitude); })
			    .interpolate("basis");
			    
			var area = d3.svg.area()
				.x(function(d) { return xScale(d.distance); })
				.y0(this.h)
				.y1(function(d) { return yScale(d.altitude); });   
    
				
			var barsEnter = elevGroup.selectAll('.elev-bars')
				.data(data)
				.enter()
				.append('line')
				.attr('x1', function(d) {
					return xScale(d.distance);
				})
				.attr('y1', this.h)
				.transition()
				.delay(function(d, i) {
					return i * 40;
				})
				.duration(500)
				.attr('x2', function(d) {
					return xScale(d.distance);
				})
				.attr('y2', function(d) {
					return yScale(d.altitude);
				})
				.attr('class', 'elev-bars')
				.attr('stroke-width', 2)
				.attr('stroke', function(d) {
					return color(cScale(d.gear.ratio));
				})
				.attr('opacity', 0.8);		
				
			elevGroup.append("path")
				.datum(data)
				.attr("d", lineFn)
				.attr("class", 'line');
				
		},

		reOrder: function(selectedSort) {

			//console.log("in reOrder");
			var newOrder;
			
			switch (selectedSort.value) {
				case "gears":
					newOrder = this.dataset.gears.sort( function(a, b) {
						if (((parseInt(a.chainring) * 2) + parseInt(a.cog)) > ((parseInt(b.chainring) * 2) + parseInt(b.cog))) return -1;
						else return 1;
					});
				break;
				case "percent":
					newOrder = this.dataset.gears.sort( function(a, b) {
						if (a.percent < b.percent) return 1;
						else return -1;
					});
				break;
					case "ratio":
					newOrder = this.dataset.gears.sort( function(a, b) {
						if (a.ratio < b.ratio) return -1;
						else return 1;
					});
				break;
				default:
					newOrder = this.dataset.gears;
				break;
			}
			
			this.dataset.gears = newOrder;
			
			// find the maximum chainring (in number of teeth, which is kinda the circumference)
			var cMax = d3.max(newOrder, function(d) { return d.chainring; });
			// divide by PI to get a kinda diameter
			var rMax = Math.round(cMax / Math.PI);
					
			//var svg = d3.select("svg");
			
			var bar = d3.selectAll(".barGroup")
				.data(newOrder, function(d) {
						return d.ratio;
				})
				.transition()
				.duration(1000)
				.attr("transform", function(d, i) {
					return "translate(0, " + ((rMax * 2.2) * (i + 1)) + ")";
				});
					
			}
	};
}]);