import {select} from 'd3-selection';
import {geoPath} from 'd3-geo';
import {csv, json} from 'd3-fetch';
import uid from './uid';


function processData(data, year) {
    var obj = []
    data.filter(d => {
      return d.year === year;
    }).forEach(function(d) {uid
        obj.push([d.Location, [+d.CountRate, +d.Medicare]])
    });
    var processedData = Object.assign(new Map(obj), {title: ["# Plans Per Captia", "Medicare Coverage"]});
    return processedData;
}


export default function Medicare(data) {
    
    //console.log(processedData.get('Alabama')[0]);
     // declare constants
    const height = 700;
    const width = 700;
    const state = {year: 2014};
    
    const div = d3.select('.main-area')
                .append('div')
                .attr('class', 'flex-down');

    
    const dropDown = div
    .append('select')
    .classed('dropdown', true)
    .on('change', function dropdownReaction(d) {
        state.year = this.value;
        render();
        
    });

    dropDown
    .selectAll('option')
    .data(["None", 2014, 2015, 2016])
    .enter()
    .append('option')
    .attr('value', d => d)
    .text(d => d)
    

    const colors = [
        "#e8e8e8", "#ace4e4", "#5ac8c8",
        "#dfb0d6", "#a5add3", "#5698b9", 
        "#be64ac", "#8c62aa", "#3b4994"
      ];
    
    const labels = ["low", "", "high"];
    var n = Math.floor(Math.sqrt(colors.length));
    const k = 24;
    const arrow = uid();
    const rects = d3
        // i think there's a bug here, you are just getting a big array of arryay
        .cross(d3.range(n), d3.range(n))
            .map(([i, j]) => {
                const color = colors[j * n + i];
                //const title = processedData.title;
                // and probably one here
                return `<rect width=${k} height=${k} x=${i * k} y=${(n - 1 - j) * k} fill=${color}>
                        <title>#Plans Per Capita${labels[j] && ` (${labels[j]})`}Medicare Coverage${labels[i] &&
                ` (${labels[i]})`}</title>
                </rect>`;
            })
            .join('\n');

    const legend = `<g class=legend-container font-family=sans-serif font-size=10 transform=translate(900,600)>
                            <g transform="translate(-${(k * n) / 2},-${(k * n) / 2}) rotate(-45 ${(k * n) / 2},${(k * n) /
            2})">
                                <marker
                                id="${arrow.id}"
                                markerHeight=10 markerWidth=10 refX=6 refY=3 orient=auto>
                                <path d="M0,0L9,3L0,6Z" />
                                </marker>
                                ${rects}
                                <line
                                marker-end="${arrow}"
                                x1=0 x2=${n * k} y1=${n * k} y2=${n * k} stroke=black stroke-width=1.5 />
                                ${
                                    // line doesn't have all of th values necessary to render it (missing x1 x2)
                                    ''
                                }
                                <line marker-end="${arrow}" y2=0 y1=${n * k} stroke=black stroke-width=1.5 />
                                <text
                                font-weight="bold" dy="0.71em"
                                transform="rotate(90)
                                translate(${(n / 2) * k},6)"
                                text-anchor="middle">#Plans Per Capita</text>
                                <text
                                font-weight="bold" dy="0.71em"
                                transform="translate(${(n / 2) * k},${n * k + 6})"
                                text-anchor="middle">Medicare Coverage</text>
                            </g>
                            </g>`;
    
    var svg = div
    .append("svg")
    .attr("preserveAspectRatio", "xMinYMin meet")
    .attr("viewBox", "-50 -50 1000 500")
    .classed("svg-content", true)
    .attr('transform', `translate(${height * 3/5 }, ${width / 20})`)
    .attr('height', height)
    .attr('width', width);
    
                        
    var path = d3.geoPath();
    
    function render() {
        const processedData = processData(data, state.year);
        var format = (value) => {
            if (!value) return "N/A";
            let [a, b] = value;
            return `${processedData.title[0]} ${a}${labels[x(a)] && ` (${labels[x(a)]})`}
            ${processedData.title[1]} ${b*100}% ${labels[y(b)] && ` (${labels[y(b)]})`}`;
          };
    
        
       
        var x = d3.scaleQuantile(Array.from(processedData.values(), d => d[0]), d3.range(n));
        var y = d3.scaleQuantile(Array.from(processedData.values(), d => d[1]), d3.range(n));
        svg.selectAll(".legend-container").remove();
        d3.json("https://cdn.jsdelivr.net/npm/us-atlas@3/counties-albers-10m.json").then(function(us) {
            console.log(us.objects.states.geometries);
            var states = new Map(us.objects.states.geometries.map(d => [d.id, d.properties]));
            //console.log(states);
            function color(value){
                if (!value) return "#ccc";
                let [a, b] = value;
                return colors[y(b) + x(a) * n];
                };
           
            svg.html(legend);
            

            svg.append("g")
                .selectAll("path")
                .data(topojson.feature(us, us.objects.states).features)
                .join("path")
                .attr("fill", function(d) {return color(processedData.get(d.properties.name))})
                .attr("d", path)
                .append("title")
                .text(d => `${d.properties.name}, ${format(processedData.get(d.properties.name))}`)
                    
                
            svg.append("path")
                .datum(topojson.mesh(us, us.objects.states, (a, b) => a !== b))
                .attr("fill", "none")
                .attr("stroke", "white")
                .attr("stroke-linejoin", "round")
                .attr("d", path);
    });
}
render();
}

