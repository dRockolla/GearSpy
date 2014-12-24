jQuery(document).ready(function($) {

	var h = 500;
	var w = 500;
	var padding = 30;
	var id = $('#grgk-canvas').attr('data-ride-id');
	
	var svg = d3.select("#grgk-canvas")
	.append("svg")
	.attr("width", w)
	.attr("height", h);
	
	svg.append("clipPath")
	    .attr("id", "chart-area")
	    .append("rect")
	    .attr("x", padding)
	    .attr("y", padding)
	    .attr("width", w - padding * 3)
	    .attr("height", h - padding * 2);
	
	/*svg.append("text")
		.attr("class", "loading")
		.text("Loading...")
		.attr("x", function() {return w/2})
		.attr("y", function() {return h/2-5});*/
		
	    var color = d3.scale.category20c()
	
	d3.selectAll("li.activities").on("click", function() {
		id = d3.select(this).attr("data-activity");
		console.log("clicked: " + id);
		d3.select("h1.activity-title").text(d3.select(this).text());
		
	
		$.ajax({
			url: grgkAjax.ajaxurl,
			type: 'post',
			dataType: 'json',
			data: {action: grgkAjax.action, rideid: id},
			success: function(data, textStatus, XMLHttpRequest) {
				var dataset = data;
				var xScale = d3.scale.linear()
					.domain([0, d3.max(dataset, function(d) { return d.speed; })])
					.range([padding, w - padding]);
					
				var yScale = d3.scale.linear()
					.domain([0, d3.max(dataset, function(d) { return d.cadence; })])
					.range([h - padding, padding]);
					
				var cScale = d3.scale.linear()
					.domain([d3.min(dataset, function(d) { return d.gear.ratio; }), d3.max(dataset, function(d) { return d.gear.ratio; })])
					.range([0, 20]);
				
				svg.append("g")
				.attr("id", "circles")
				.attr("clip-path", "url(#chart-area)")
				.selectAll("circle")
				.data(dataset)
				.enter()
				.append("circle")
				.attr("class", "data-point")
				.attr("cx", 0 + padding)
				.attr("cy", (0 + h - padding))
				.attr("opacity", 0.3)
				.attr("r", 4)
				.attr("fill", "#FFFFFF")
				.on("mouseover", function(d) {
				
					//Get this bar's x/y values, then augment for the tooltip
					var xPosition = parseFloat(d3.select(this).attr("cx"));
					var yPosition = parseFloat(d3.select(this).attr("cy"));
										
					//Update the tooltip position and value
					d3.select("#tooltip")
					  .style("left", xPosition + "px")
					  .style("top", yPosition + "px")
					  .select("#value")
					  .text(d.ratio + " : " + d.gear.ratio);
					
					//Show the tooltip
					d3.select("#tooltip").classed("hidden", false);
				
				}).on("mouseout", function() {
				
					//Hide the tooltip
					d3.select("#tooltip").classed("hidden", true);
					
				})
				.transition()
				.delay(function(d, i) {
					return i * 40;
				})
				.duration(1000)
				.attr("cx", function(d) {
						return xScale(d.speed);
				})
				.attr("cy", function(d) {
						return yScale(d.cadence);
				})
				/*.attr("fill", "#000");*/
				.attr("fill", function(d) {
					//if(d.ratio > 4.2 || d.cadence < 5) return "#42b408";
					var v = Math.round(cScale(d.gear.ratio));
					//return "rgb(255, " + (v * 12) + ", 0)";
					return color(v);
				});
				

				
				svg.append("g")
					.attr("class", "axis")  //Assign "axis" class
					.attr("transform", "translate(0," + (h - padding) + ")")
					.call(d3.svg.axis()
						.scale(xScale)
						.orient("bottom")
					);
				
				//Create Y axis
				svg.append("g")
					.attr("class", "axis")
					.attr("transform", "translate(" + (padding) + ",0)")
					.call(d3.svg.axis()
						.scale(yScale)
						.orient("left")
						.ticks(5)
					);
					
				svg.selectAll(".loading").remove();
					
				var yMean = d3.mean(data, function(d) {
					return d.cadence;
				});
				var xMax = d3.max(data, function(d) {
					return d.speed;
				});
	
				
				var trendData = [[0, yMean, xMax, yMean]];
				
				/*svg.selectAll(".trend-line")
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
	
			}
		});
	})


});