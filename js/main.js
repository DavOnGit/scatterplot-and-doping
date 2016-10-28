var padding = {top: 70, right: 48, bottom: 50, left: 50},
h = 600 - padding.top - padding.bottom,
w = 800 - padding.left - padding.right,
xSc = d3.scaleUtc().range([0, w]),
ySc = d3.scaleLinear().range([0,h]),
xAxis = d3.axisBottom(xSc)
	.ticks(d3.timeSecond, 30)
	.tickFormat(d3.timeFormat('%_M\':%S\'\''))
	.tickSizeOuter(0),
yAxis = d3.axisLeft(ySc).tickSizeOuter(0);

var tolPosX = window.innerWidth / 2;

function toolover() {
	d3.select(this).interrupt();
}

function toolout() {
	d3.select(this).transition()
		.duration(600)
		.style("opacity", 0)
		.transition()
		.style("display", "none");
}

var chartSvg = d3.select("body")
	.append("svg").attr("class", "chartSvg")
	.attr("width", w + padding.left + padding.right)
	.attr("height", h + padding.top + padding.bottom);

chartSvg.append("defs")
	.append("pattern")
	.attr("id", "patt-1")
	.attr("patternUnits", "userSpaceOnUse")
	.attr("width", w)
	.attr("height", h)
	.append("image")
	.attr("id", "bg-patt")
	.attr("xlink:href", "#")
	.attr("x", -45)
	.attr("y", -35)
	.attr("width", w + 70)
	.attr("height", h + 70);

var chart = chartSvg.append("g")
	.attr("id", "chart").classed("no-select", true)
	.attr("transform", "translate(" + padding.left + "," + padding.top + ")");

chart.append("rect").attr("id", "bg").style("fill", "url(#patt-1)")
	.attr("x", 0).attr("y", 0).attr("width", w).attr("height", h);

chart.append("circle")
	.attr("cx", w / 1.3)
	.attr("cy", 30)
	.attr("r", 5)
	.attr("fill", "teal");

chart.append("circle")
	.attr("cx", w / 1.3)
	.attr("cy", 50)
	.attr("r", 5)
	.attr("fill", "red");

chart.append("text").attr("x", w / 1.27).attr("y", 34).text("No Doping");
chart.append("text").attr("x", w / 1.27).attr("y", 54).text("Doping alleged");

chartSvg.append("text").attr("id", "title")
	.attr("x", 400).attr("y", 45)
	.text("Fastest Bicycle Racing up Alpe d'Huez and Doping")

var tooltip = d3.select("body").append("div")
	.attr("id", "tooltip")
	.style("left", tolPosX - 250 + "px")
	.style("top", h / 1.88 + "px")
	.on("mouseenter", toolover)
	.on("mouseleave", toolout);

var tTitle = tooltip.append("h2").attr("id", "t-name");
var tPlace = tooltip.append("p").attr("id", "t-place");
var tTime = tooltip.append("p").attr("id", "t-time");
var tYear = tooltip.append("p").attr("id", "t-year");
var tNation = tooltip.append("p").attr("id", "t-nation");
var tDoping = tooltip.append("p").attr("id", "t-doping");

d3.xml("./resources/github-corner.svg").mimeType("image/svg+xml").get(function(error, xml) {
	if (error) throw error;

	var link = document.createElement("a");
	link.setAttribute("href", "https://github.com/DavOnGit/scatterplot-and-doping");
	link.appendChild(xml.documentElement);
	document.body.appendChild(link).setAttribute("id", "link-ghub");
});

d3.json("./js/cycle-data.json", function(error, data) {
	if (error) throw error;

	var dlen = data.length,
	offset = {xstart: 5, xend:22, y:1},
	toMillis = 1000,
	firstTime = data[0].Seconds,
	yTicks = [1];

	data.forEach(function(d, i) {
		var timeToFirst = (d.Seconds - firstTime) * toMillis;
		d.Gap = timeToFirst;
		d.Place = +d.Place;
		d.shortName = d.Name.replace(/(^[A-Z])\w*\s(\w+)/, '$1. $2');
		if (!(d.Place % 5)) { yTicks.push(d.Place) };
	});

	xSc.domain([
		new Date(-offset.xstart * toMillis),
		d3.max(data, function(d) { return new Date(d.Gap + offset.xend * toMillis) })
	]);
	ySc.domain([data[0].Place - 1, data[dlen - 1].Place + offset.y]);
	yAxis.tickValues(yTicks);

	function mouseover(d) {
		var nat = d.Nationality.toLowerCase();

		d3.select(this).select("text").attr("font-weight", "bold");
		d3.select(this).select("circle").attr("stroke", "black").attr("r", "7");
		d3.select("#bg-patt").interrupt("flagAnim").attr("opacity", "0")
			.attr("xlink:href", "./resources/" + nat + "-flag.svg")
			.transition("flagAnim").delay(500).duration(3000).attr("opacity", ".65");

		tooltip.style("display", "block").transition().duration(300).style("opacity", ".9");
		tTitle.text(d.Name);
		tPlace.text("place: " + d.Place);
		tTime.text("time: " + d.Time + " m:s");
		tYear.text("year: " + d.Year);
		tNation.text("nationality: " + d.Nationality);
		if (d.Doping) {
			tDoping.html(
	            'doping: <a href= "' + d.URL + '" target="_blank">' +
	            d.Doping +
	            '</a>')
		} else {
			tDoping.text("doping: no evidences");
		}
	}

	function mouseout() {
		d3.select(this).select("text").attr("font-weight", "normal");
		d3.select(this).select("circle").attr("stroke", "none").attr("r", "5");
		d3.select("#bg-patt").interrupt("flagAnim").transition("flagAnim").duration(3000).attr("opacity", "0").transition("flagAnim").attr("xlink:href", "#");

		tooltip.transition()
			.delay(4000)
			.duration(100)
			.style("opacity", 0)
			.transition()
			.style("display", "none");
	}

	chart.append("g")
		.attr("class", "x Axis")
	 	.attr("transform", "translate(0, " + h + ")")
	 	.call(xAxis)
		.append("text");

	 chart.append("g")
	 	.attr("class", "y Axis")
	 	.call(yAxis);

	chart.append("text")
		.attr("id", "x-label")
		.attr("text-anchor", "middle")
		.attr("x", w / 2)
		.attr("y", h + padding.bottom / 2)
		.attr("dy", "1.1em")
		.text("GAP or Time to first ( min:sec )");

	chart.append("text")
		.attr("id", "y-label")
		.attr("transform", "rotate(-90)")
		.attr("x", -h / 2)
		.attr("y", -padding.left)
		.attr("dy", "1.4em")
		.attr("text-anchor", "middle")
		.text("Ranking");

	var dataGroup =	chart.append("g")
			.attr("class", "rider")
			.selectAll("g")
			.data(data)
			.enter()
			.append("g")
			.on("mouseenter", mouseover)
			.on("mouseleave", mouseout);

	dataGroup.append("circle")
		.attr("cx", function(d) {
			return xSc(d.Gap);
		})
		.attr("cy", function(d) {
			return ySc(d.Place);
		})
		.attr("r", 5)
		.attr("fill", function(d) {
			if(d.Doping) return "red";
			return "teal";
		});

	dataGroup.append("text")
		.text(function(d) {
	    	return d.shortName;
		})
		.attr("x", function(d) {
        	return xSc(d.Gap) + 10;
		})
		.attr("y", function(d) {
    		return ySc(d.Place) + 3;
		})
		.attr("font-size", "10px");
});
