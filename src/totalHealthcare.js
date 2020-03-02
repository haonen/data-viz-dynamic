import {select} from 'd3-selection';
import {geoPath} from 'd3-geo';
import {csv, json} from 'd3-fetch';


function processData(data) {
    var obj = []
    data.forEach(function(d) {
        obj.push([d.Location, [+d.CountRate, +d.TotalCoverage]])
    });
    var processedData = Object.assign(new Map(obj), {title: ["# Plans Per Captia", "Total Coverage"]});
    return processedData;
}


export default function totalHealthcare(data) {
    var processedData = processData(data);
    console.log(processedData.get('Alabama')[0]);
     // declare constants
    const height = 600;
    const width = 1000;
    const div = select('.main-area')
                .append('div')
                .attr('class', 'flex-down');
                
    
    const svg = div
    .append('svg')
    .attr('height', height)
    .attr('width', width);


    const colors = [
        "#e8e8e8", "#ace4e4", "#5ac8c8",
        "#dfb0d6", "#a5add3", "#5698b9", 
        "#be64ac", "#8c62aa", "#3b4994"
      ];
    
    const labels = ["low", "", "high"];
    var format = (value) => {
        if (!value) return "N/A";
        let [a, b] = value;
        return `${processedData.title[0]} ${a} plans per captia ${labels[x(a)] && ` (${labels[x(a)]})`}
        ${processedData.title[1]} ${b*100}% ${labels[y(b)] && ` (${labels[y(b)]})`}`;
      };


    //svg.append(legend)
        //.attr("transform", "translate(870,450)");
    var projection =  d3.geoAlbersUsa().scale(1300).translate([width/2, height/2]);
    var path = d3.geoPath();
    var n = Math.floor(Math.sqrt(colors.length));
    var x = d3.scaleQuantile(Array.from(processedData.values(), d => d[0]), d3.range(n));
    var y = d3.scaleQuantile(Array.from(processedData.values(), d => d[1]), d3.range(n));

        
    d3.json("https://cdn.jsdelivr.net/npm/us-atlas@3/counties-albers-10m.json").then(function(us) {
        console.log(us.objects.states.geometries);
        var states = new Map(us.objects.states.geometries.map(d => [d.id, d.properties]));
        //console.log(states);
        function color(value){
            if (!value) return "#ccc";
            let [a, b] = value;
            return colors[y(b) + x(a) * n];
            };
        
        
        svg.append("g")
            .selectAll("path")
            .data(topojson.feature(us, us.objects.states).features)
            .join("path")
            .attr("fill", function(d) {return color(processedData.get(d.properties.name))})
            .attr("d", path)
            .append("title")
            .text(d => `${d.properties.name}, ${format(processedData.get(d.properties.name))}`);

        svg.append("path")
            .datum(topojson.mesh(us, us.objects.states, (a, b) => a !== b))
            .attr("fill", "none")
            .attr("stroke", "white")
            .attr("stroke-linejoin", "round")
            .attr("d", path);
    });
}

