/**
* Copyright (c) 2025, Thomas Baier
* All rights reserved. (MIT Licensed)
*
* plotSvg.js (YaJsSvgPlot)
* A small, interactive plotting tool
* https://github.com/messier433/YaJsSvgPlot
*/

function getEl(id)
{
    return document.getElementById(id);
}

function getMax(arr) {
    let len = arr.length;
    let max = -Infinity;

    while (len--) {
        max = ((arr[len] > max) && isFinite(arr[len])) ? arr[len] : max;
    }
    return max;
}

function getMin(arr) {
    let len = arr.length;
    let min = Infinity;

    while (len--) {
        min = ((arr[len] < min) && isFinite(arr[len])) ? arr[len] : min;
    }			
    return min;

}

function num2eng(val) {
    const unitList = ['y', 'z', 'a', 'f', 'p', 'n', 'u', 'm', '', 'k', 'M', 'G', 'T', 'P', 'E', 'Z', 'Y'];
    const zeroIndex = 8;
    var out = Array(val.length);


    for(idx = 0; idx < val.length; ++idx) {
        
        const nn = val[idx].toExponential(5).split(/e/);
        let u = Math.floor(+nn[1] / 3) + zeroIndex;
        if (u > unitList.length - 1) {
            u = unitList.length - 1;
        } else
        if (u < 0) {
            u = 0;
        };

        out[idx] =  Math.round((nn[0] * Math.pow(10, +nn[1] - (u - zeroIndex) * 3))*1000)/1000 + unitList[u];
    };
    return out;
};
function linspace(start, increment, stop) {
    numel = Math.floor((stop-start)/increment)+1;
    out = Array(numel);

    for(idx=0; idx < numel; ++idx){
        out[idx] = start + increment*idx;
    };
    return out;
};

function logspace(start, increment, stop) {
    return linspace(start, increment, stop).map(Math.log10);
};

function decades(start, increment, stop) {
    return linspace(start, increment, stop).map((x) => 10 ** x);
};

function addSvgEl(parent, ele, attrs) {
    const ns = "http://www.w3.org/2000/svg";
    //create the element with a specified string:
    var element = (typeof ele == "string") ? document.createElementNS(ns, ele) : ele;
    //create a for...in loop set attributes:
    for (let val in attrs) {
        element.setAttribute( val, attrs[val]);          
    };
    if(parent != null)
        parent.appendChild(element);
    //return the element with the set attributes:
    return element;
};
function addSvgTxt(parent, text, x, y, fontsize, textanchor = "middle", fontfamily="Sans,Arial", fill="black") {
    var textEl = addSvgEl(parent, "text", {"x":x, "y":y,
            "fill":fill, "font-size":fontsize, "text-anchor":textanchor, "font-family":fontfamily,
            "stroke-width": 1
            });
    textEl.append(document.createTextNode(text));              
    return textEl;
}
function addSvgLn(parent, x1, y1, x2,y2, stroke="black", strokedasharray="") {
    return addSvgEl(parent, "line", {"x1":x1, "y1":y1,"x2":x2, "y2":y2,
            "stroke":stroke, "stroke-width": 1, "stroke-dasharray": strokedasharray, "vector-effect":"non-scaling-stroke"
    });  
};

function addSvgRec(parent, x, y, width, height, fill="none", stroke="none", stroke_width=2, rx=0) {
    return addSvgEl(parent, "rect", {"x":x, "y":y,"width":width, "height":height, "rx":rx,
            "stroke":stroke, "stroke-width": stroke_width, "fill": fill, "vector-effect":"non-scaling-stroke"
    });  
};

function legClk(event, fontsize, ySpacing, elementId, numLines) {
    const svgLeg = getEl("svg_leg_"+elementId); //event.srcElement.ownerSVGElement;
    const legY = event.offsetY-svgLeg.y.baseVal.value; // x position inside plotting area
    var lnIdx = Math.floor((legY-ySpacing/2) / (fontsize+ySpacing));
    const clkLn = getEl("pl_"+elementId+"_"+lnIdx);
    if(clkLn == null)
        return;
    const style = clkLn.style.display;


    // else
    if(numLines == 0) {
        const tooltips = getEl("gpl_" +elementId+"_"+lnIdx); // tooltip group
        if (style === "none") {
            getEl("pl_"+elementId+"_"+lnIdx).style.display = "block";
            getEl("lgi_"+elementId+"_"+lnIdx).style.opacity = 1;
            if(tooltips!=null) tooltips.style.display = "block";
        } else {        
            getEl("pl_"+elementId+"_"+lnIdx).style.display = "none";
            getEl("lgi_"+elementId+"_"+lnIdx).style.opacity = 0.3;
            if(tooltips!=null) tooltips.style.display = "none";
        };
    } else {
        for(idx = 0; idx < numLines; ++idx) {
            const tooltips = getEl("gpl_" +elementId+"_"+idx); // tooltip group        
            if (style === "none") { // make all visible again
                getEl("pl_"+elementId+"_"+idx).style.display = "block";
                getEl("lgi_"+elementId+"_"+idx).style.opacity = 1;
                if(tooltips!=null) tooltips.style.display = "block";
            } else  if(idx != lnIdx) { // only keep selected one visible
                getEl("pl_"+elementId+"_"+idx).style.display = "none";
                getEl("lgi_"+elementId+"_"+idx).style.opacity = 0.3;
                if(tooltips!=null) tooltips.style.display = "none";
            };
        };
    };
}

function resizeSvg(elementId, padX, padY, hLegendItems, hLegendMargin) {
    var svgLeg = getEl("svg_leg_"+elementId);
    var svgDraw = getEl("svg_draw_"+elementId);
    var svgTop = getEl("svg_top_"+elementId);
    var svgBottom = getEl("svg_bottom_"+elementId);
    var svgLeft = getEl("svg_left_"+elementId);
    var svg = getEl("svg_"+elementId);
    
    const parentWidth = svg.width.baseVal.value;
    const parentHeight = svg.height.baseVal.value;
    const newChildWidth = parentWidth-padX;
    const newChildHeight = parentHeight-padY;
    const oldChildWidth = svgDraw.width.baseVal.value;
    const oldChildHeight = svgDraw.height.baseVal.value;
    
 
    tooltips = document.getElementsByClassName("tooltip");

    if(oldChildWidth != newChildWidth) {
        svgDraw.width.baseVal.value = newChildWidth;    
        svgTop.width.baseVal.value = newChildWidth;    
        svgBottom.width.baseVal.value = newChildWidth; 
        svgLeg.x.baseVal.value += newChildWidth - oldChildWidth;  
        // update tooltip location which refers to top SVG and not scaled with drawing SVG
        for(idx = 0; idx<tooltips.length; ++idx) {
            const offsetX = svgDraw.x.baseVal.value;
            const tranformX = tooltips[idx].transform.baseVal[0].matrix.e;
            const plotX = tranformX- offsetX;
            tooltips[idx].transform.baseVal[0].matrix.e = offsetX + plotX * newChildWidth / oldChildWidth; 
        }    
    }
    if(oldChildHeight != newChildHeight) {
        svgDraw.height.baseVal.value= newChildHeight;
        svgLeft.height.baseVal.value = newChildHeight; 
        if(svgLeg!=null) {
            var newLegHeight = newChildHeight -hLegendMargin;
            newLegHeight = (newLegHeight > hLegendItems) ? hLegendItems : newLegHeight;
            svgLeg.height.baseVal.value = newLegHeight;
            svgLeg.viewBox.baseVal.height = newLegHeight;
        }
        // update tooltip location which refers to top SVG and not scaled with drawing SVG
        for(idx = 0; idx<tooltips.length; ++idx) {
            const offsetY = svgDraw.y.baseVal.value;
            const tranformY = tooltips[idx].transform.baseVal[0].matrix.f;
            const plotY = tranformY - offsetY;
            tooltips[idx].transform.baseVal[0].matrix.f = offsetY + plotY * newChildHeight / oldChildHeight; 
        }    
    }
};

function scrollLegend(event, elementId, hLegendItems){
    var svgLeg = getEl("svg_leg_"+elementId);
    var rectLeg = getEl("rect_leg_"+elementId);
    svgLeg.viewBox.baseVal.y +=  event.deltaY;
    const minScroll = 0;
    const maxScroll = hLegendItems - svgLeg.height.baseVal.value;

    if(svgLeg.viewBox.baseVal.y < minScroll)
        svgLeg.viewBox.baseVal.y = minScroll;
    if(svgLeg.viewBox.baseVal.y > maxScroll)
        svgLeg.viewBox.baseVal.y = maxScroll;

    rectLeg.y.baseVal.value = svgLeg.viewBox.baseVal.y;
    return false;
}

function plotClicked(event, elementId, renderWidth, renderHeight, xmin, xmax, ymin, ymax, logx, logy) {
    svgDraw = getEl("svg_draw_"+elementId);
    svg = getEl("svg_"+elementId);
    closestEl = getNearestLine(event.clientX, event.clientY)
    if(closestEl == null)
        return;
    //else
    var plotX = event.offsetX-svgDraw.x.baseVal.value; // x position inside plotting area
    var plotY = event.offsetY-svgDraw.y.baseVal.value; // x position inside plotting area
    // rescale in case width changed after drawing
    const plotW = svgDraw.width.baseVal.value;
    const plotH = svgDraw.height.baseVal.value;
    const scaleX = renderWidth/plotW;
    const scaleY = renderHeight/plotH;
    plotX *= scaleX;
    plotY *= scaleY;

    // search closest points on line
    const points = closestEl.points;
    var closestIdx = (plotX > points[points.length-1].x) ? points.length-1 : 0;
    for(idx = 1; idx < points.length; ++idx ) {
        const ptX = points[idx].x;
        const ptY = points[idx].y;
        if(points[idx].x >= plotX && points[idx-1].x <= plotX) {
            closestIdx = idx-1;
            break;
        }
    }

    var nextIdx = closestIdx +1;
    nextIdx = (nextIdx >= points.length) ? points.length-1 : nextIdx;

    const snapDist = 6*6; // snap to exact point if clicked within distance
    var idx = (plotX - points[closestIdx].x) > (points[nextIdx].x-plotX) ? nextIdx : closestIdx;
    const dist = (points[idx].x-plotX)*(points[idx].x-plotX) + (points[idx].y-plotY)*(points[idx].y-plotY);
    nextIdx = (dist < snapDist) ? idx : nextIdx;
    closestIdx = (dist < snapDist) ? idx : closestIdx;

    // interpolate between the 2 points
    const spanX = points[closestIdx].x - points[nextIdx].x;
    const spanY = points[closestIdx].y - points[nextIdx].y;
    const span = spanX*spanX+spanY*spanY;
    const dx = (points[closestIdx].x - plotX);// / spanX;
    const dy = (points[closestIdx].y - plotY);// / spanY;
    var d = dx * (spanX/span) + dy * (spanY/span)
    if(nextIdx == closestIdx)
        d = 1;

    const intX = points[nextIdx].x * d + points[closestIdx].x * (1-d);
    const intY = points[nextIdx].y * d + points[closestIdx].y * (1-d);
    const topX = intX/scaleX + svgDraw.x.baseVal.value;
    const topY = intY/scaleY + svgDraw.y.baseVal.value;

    const prefix = "pl_" + elementId;
    const lnId = closestEl.id;
    const lnIdx = lnId.slice(prefix.length, lnId.length);
    const legendItem = getEl("lti_"+elementId+lnIdx);
    const plotLine = getEl("pl_"+elementId+lnIdx);
    lineColor = plotLine.getAttribute("stroke");
    sourceCoord = convertCoord([intX, intY], renderWidth, renderHeight, [xmin,xmax], [ymin, ymax], logx, logy);
    var gl = getEl("gpl_" +elementId+lnIdx);
    if(gl == null) { // create group for all tooltips on the same line (to be used in case line vibility is toggled)
        gl = addSvgEl(svg, "g", {"id":"gpl_" + elementId+lnIdx});
    }
    const tooltip = addSvgEl(gl, "g", {"class":"tooltip", 
        "transform":"translate(" + topX + " " + topY + ")"
    });
    
    tooltip.onclick = (event) => {if(event.srcElement.parentNode.tagName == "g") event.srcElement.parentNode.remove()};
   
    const rect = addSvgRec(tooltip, 5, -9, 0, 0, lineColor, "rgb(223,223,223)", 1, rx=4);
	var line = null;
    if(legendItem != null) {
        text = addSvgTxt(tooltip, legendItem.textContent, 7, -11, 12, "start", "Sans,Arial", "white" ); 
        addSvgEl(null, text, {"font-weight":"bold"});
        line = addSvgLn(tooltip, 5, -8, 5,-8, stroke="white");
		rect.setAttribute("y",-23);
    }

    addSvgTxt(tooltip, "x: " + num2eng([sourceCoord[0]]), 7, 4, 12, "start", "Sans,Arial", "white");
    addSvgTxt(tooltip, "y: " + num2eng([sourceCoord[1]]), 7, 18, 12, "start", "Sans,Arial", "white");    
            
    var bbox = tooltip.getBBox();
    addSvgEl(null, rect, {"width": bbox.width+4, "height": bbox.height+4});
    if(line != null)
        line.setAttribute("x2", bbox.width+4+5);

    addSvgRec(tooltip, -2, -2, 4, 4, "black");
}

function plotMouseDown(event, elementId) {
    if(event.button != 2) // not a right click?
        return;

    // else start zoom
    svg = getEl("svg_"+elementId);

    var rect = addSvgRec(svg, event.offsetX, event.offsetY, 0, 0, "black");
    addSvgEl(null, rect, {"id":"zoom_rect"+elementId, "fill-opacity":"0.3"});
    svg.onmousemove = (eventNew) => plotZoom(eventNew, elementId);
}

function plotZoom(event, elementId) {
    rectZoom = getEl("zoom_rect"+elementId);
    rectZoom.width.baseVal.value = event.offsetX - rectZoom.x.baseVal.value;
    rectZoom.height.baseVal.value = event.offsetY - rectZoom.y.baseVal.value;
    if(event.buttons != 2) {
        rectZoom.remove();
        svg = getEl("svg_"+elementId);
        svg.onmousemove = null;
    }
}

function convertCoord(point, plotW, plotH, xlim, ylim, logx, logy) {
    x = point[0] / plotW * (xlim[1]-xlim[0]) + xlim[0];
    y = (1-point[1] / plotH) * (ylim[1]-ylim[0]) + ylim[0];

    x = (logx) ? Math.pow(10, x) : x;
    y = (logy) ? Math.pow(10, y) : y;

    return [x,y];
}

// find a nearest line within 'proximity'
function getNearestLine(x, y) {
    const proximity = 4;

    var closestEl = null;
    var closestDist = Infinity;
    // move along each axis and see if we land on a line
    for (let curX = x-proximity; curX <= x+proximity; curX++) {
        for (let curY = y-proximity; curY <= y+proximity; curY++) {
        const element = document.elementFromPoint(curX, curY);
        if (element?.tagName == 'polyline') {
            const dist = (curX - x)*(curX - x) + (curY - y)*(curY - y);
            if(dist < closestDist) {
                closestDist = dist;
                closestEl = element;
            };
        };
      };
    };
    return closestEl;
  }

function plotSvg(elementId, x, y, numLines, 
{title = "", subtitle = "", xlabel = "", ylabel="", xlim=[], ylim=[], 
    legend = [], xScale = "linear", yScale = "linear", grid = true, 
    gridMinor = [], legendLocation = 'northeastoutside'
}={}
)
{      
    const ns = "http://www.w3.org/2000/svg";
    const axesLblFontSize = 12;
    const legendFontSize = 10;
    const legendFont = "Lucida Sans Typewriter"; // needs to be a monospace font!
    const legendLineLength = 20; // number of pixels for the line length in the legend
    const legendXSpacing = 4; // number of pixels between legend box, line and text
    const legendYSpacing = 4; // number of pixels between two entries
	const maxLegendWidth = 400;
    const fontSpacing = 4;
    const titleFontSize = 24;
    const subTitleFontSize = 12;
    var nXTicks = 10; // max ticks (will be adjusted for short tick labels)
    var nYTicks = 10; // max ticks (will be adjusted for short tick labels)
    var nXMinorTicks = 10; // minor ticks  (max value; will be adjusted)
    var nYMinorTicks = 10; // minor ticks  (max value; will be adjusted)
    const normTicks = [1, 2, 5, 10];
    const xAxesSpacing = axesLblFontSize*4;
    const yAxesSpacing = axesLblFontSize*2;
    const colorMapRGB =  ["rgb(0,114,190)", "rgb(218,83,25)", "rgb(238,178,32)", 
                        "rgb(126,47,142)", "rgb(119,173,48)", "rgb(77,191,239)",
                        "rgb(163,20,47)"];

    logXEnbl = false;
    if(xScale == "log") {
        x = x.map(Math.log10);
        //x.forEach((value, index) => {x[index] = Math.log10(value)});
        if(xlim.length > 1) {
            xlim = xlim.map(Math.log10);
            
            if (isNaN(xlim[0]) || isNaN(xlim[1])) {
                xlim = [];
            } else {
                xlim[0] =  (xlim[0] == -Infinity) ? 0 : xlim[0];
                xlim[1] =  (xlim[1] == -Infinity) ? 0 : xlim[1];  
            };
        };
        logXEnbl = true;
    };

    logYEnbl = false;
    if(yScale == "log") {
        y = y.map(Math.log10);
        //y.forEach((value, index) => {y[index] = Math.log10(value)});
        if(ylim.length > 1) {
            ylim = ylim.map(Math.log10);
            if (isNaN(ylim[0]) || isNaN(ylim[1])) {
                ylim = [];
            } else {
                ylim[0] =  (ylim[0] == -Infinity) ? 0 : ylim[0];
                ylim[1] =  (ylim[1] == -Infinity) ? 0 : ylim[1];  
            };
        };
        logYEnbl = true;
    };

    var el = getEl(elementId);
    var mainDiv = document.createElement("div");
    el.appendChild(mainDiv);
    //mainDiv.setAttribute( "style", "width:100%;height:100vh;overflow:auto");   
    mainDiv.setAttribute( "style", "width:100%;height:calc(100vh - 16px);overflow:none");    
    //var svg = addSvgEl("svg", {"preserveAspectRatio":"xMinYMin meet",
    //    "viewBox":"0 0 " + width + " " + height});
    var svg = addSvgEl(mainDiv, "svg", {"id":"svg_"+elementId, "width":"100%", "height":"100%"});
    var width=svg.width.baseVal.value;
    var height=svg.height.baseVal.value; 
	width = (width < 1200) ? 1200 : width; // too small values can cause errors (negative dimensions)
	height = (height < 800) ? 800 : height; // too small values can cause errors (negative dimensions)
    
    // write styles
    svg.innerHTML += "\<style\>\n" +
        "\<![CDATA[\n" + 
        "  polyline.l {\n" + 
        "    stroke-width:2;\n" + 
        "    vector-effect:non-scaling-stroke;\n" + 
        "    fill:none;\n" +
        "  }\n" + 
        "  text.cll {\n" + 
        "    font-size:"+legendFontSize+"px;\n" + 
        "    fill:black;\n" + 
        "    dominant-baseline:central;\n" + 
        "    font-family:"+legendFont+";\n" + 
        "  }\n" + 
        "]]\>\n" + 
        "\</style\>\n";

    var pltArYOffset = 0;
    var pltArXOffset = xAxesSpacing;
    ////////////////////////////////
    // Calc plot and legend area
    ////////////////////////////////
    const titleLines = title.split("\n");
    const subtitleLines = subtitle.split("\n");
    if(title.length>0) {        
        pltArYOffset += (titleFontSize + fontSpacing) * titleLines.length;
    };
    if(subtitle.length>0) {
        pltArYOffset += (subTitleFontSize + fontSpacing) * subtitleLines.length;
    };

    pltArYOffset = pltArYOffset + 10;

    var plotHeight = height-pltArYOffset-yAxesSpacing;
    var plotWidth = width-pltArXOffset;

    // reserve space for labels
    if(xlabel.length>0) {
        plotHeight = plotHeight - axesLblFontSize - fontSpacing;
    };
    if(ylabel.length>0) {
        pltArXOffset= pltArXOffset + axesLblFontSize + fontSpacing;
        plotWidth = plotWidth - axesLblFontSize - fontSpacing;
    };

    //////////////////////////////////////
    // create legend
    //////////////////////////////////////
    // create group
    var gleg = addSvgEl(null, "g", {"pointer-events":"visible"});
    gleg.onclick = (event) => legClk(event, hLetter, legendYSpacing, elementId, 0);
    gleg.ondblclick = (event) => legClk(event, hLetter, legendYSpacing, elementId, numLines);
   
    var hLegendMargin = 0;
    if(legend.length>0 && numLines > 0 && x.length > 0) {  
        // set legend dimensions depending on location
        var legFill = "";
        switch(legendLocation) {
            case 'northeast':
                yLegend = pltArYOffset + 2*legendYSpacing;
                hLegendMargin = 4*legendYSpacing;
                legFill="white";
                break;
            case 'northeastoutside':
                yLegend = pltArYOffset;
                legFill = "none";
                break;
            default:
                throw new Error("LegendLocation not supported");
        }
        hLegendMax = plotHeight - hLegendMargin;   
        // add legend already here to calculate width
        // will be moved again at the end of the function 
        svg.appendChild(gleg);     
        
        // define legend line        
        var defsll = addSvgEl(svg, "defs");
        addSvgEl(defsll, "line", {"id":"ll_"+elementId, "x1":0, "y1":0,"x2":legendLineLength,"y2":0, 
            "stroke-width":2,"vector-effect":"non-scaling-stroke"});

        wLegendMax = maxLegendWidth;
        hLetter = legendFontSize;
        
        // draw legend box (change width later)
        var svgLeg = addSvgEl(gleg, "svg", {"id":"svg_leg_"+elementId});
    
        var nLegend = numLines; 
        var legendTmp = legend;0
        if(legend.length > numLines) { // cannot be more legend entries than lines
            legendTmp = legend.slice(0,nLegend);  
        }  
            
        var hLegendItems = nLegend * (hLetter + legendYSpacing) + legendYSpacing;
        var hLegend = (hLegendItems > hLegendMax) ? hLegendMax : hLegendItems;
       
        addSvgEl(null, svgLeg, {"x": "100%", "height": hLegend});       
    
        // draw legend box (change width later)       
        var recleg = addSvgRec(svgLeg, 0, 0, 0, "100%", legFill, "black");
        addSvgEl(null, recleg, {"id":"rect_leg_"+elementId});
        // create legend items
        for(lnIdx = 0; lnIdx < nLegend; ++lnIdx) {
            colorIdx = lnIdx % colorMapRGB.length;
            yOffset = lnIdx * (hLetter + legendYSpacing) +  legendYSpacing;
    
            var legItemGroup = new addSvgEl(svgLeg, "g", {"id": "lgi_"+elementId+"_"+lnIdx});

            // legend lines
            addSvgEl(legItemGroup, "use", {"id": "lli_"+elementId+"_"+lnIdx, "x":legendXSpacing, "y":yOffset+hLetter/2,
                "href":"#ll_"+elementId, "stroke":colorMapRGB[colorIdx]});
   
            // legend labels
            var textEl = addSvgEl(legItemGroup, "text", {"id": "lti_"+elementId+"_"+lnIdx, "class":"cll", 
                "x":legendXSpacing+legendLineLength+legendXSpacing, "y":yOffset+hLetter/2});
            var str = "";
            if(lnIdx < legendTmp.length) {
                str = legendTmp[lnIdx];
            };
            textEl.append(document.createTextNode(str));  
        }

        var bbox = gleg.getBBox();
        var wLegend = bbox.width + 2*legendXSpacing;
        wLegend = (wLegend > wLegendMax) ? wLegendMax : wLegend;
        // update width of legend rectangle and clip box
        recleg.setAttribute("width","100%");
        svgLeg.setAttribute("width",wLegend);

        var xLegend = 0;
        // update plot and legend dimensions depending on legend position
        switch(legendLocation) {
            case 'northeast':
                //xLegend = pltArXOffset + plotWidth - wLegend - 2*legendXSpacing;
                xLegend = -wLegend - 2*legendXSpacing - xAxesSpacing;
                plotWidth -= xAxesSpacing;                
                break;
            case 'northeastoutside':
                //xLegend = pltArXOffset + plotWidth - wLegend;
                xLegend = -wLegend
                plotWidth -= wLegend + legendXSpacing;
                break;
            default:
                throw new Error("LegendLocation not supported");
        }

        // move legend to final location   
        addSvgEl(null, svgLeg, {"x": svg.width.baseVal.value + xLegend, "y": yLegend, "viewBox": "0 0 " + wLegend + " " + hLegend});
    }   else {
        plotWidth -= xAxesSpacing;
    }

    pltAr = [pltArXOffset, pltArYOffset, plotWidth, plotHeight];
    var padding = [width-pltAr[2], height-pltAr[3]];
    ///////////////////////////////
    // add title
    ///////////////////////////////
    var svgTop= addSvgEl(svg, "svg", {"id":"svg_top_"+elementId, "x": pltAr[0], "overflow":"visible", "width":svg.width.baseVal.value-padding[0]});
    var titleYOffset = 0;
    if(title.length>0) {
        for(idx = 0; idx < titleLines.length; ++idx) {
            titleYOffset = titleYOffset + titleFontSize + fontSpacing;
            addSvgTxt(svgTop, titleLines[idx], "50%", titleYOffset, titleFontSize);
        };
    };  
    ///////////////////////////////
    // add subtitle
    ///////////////////////////////
    if(subtitle.length>0) {
        for(idx = 0; idx < subtitleLines.length; ++idx) {
            titleYOffset = titleYOffset + subTitleFontSize + fontSpacing;
            addSvgTxt(svgTop, subtitleLines[idx], "50%", titleYOffset, subTitleFontSize);
        };    
    };

    ///////////////////////////////
    // draw xlabel
    ///////////////////////////////
    var gBottomShift = -height + pltAr[1] + pltAr[3];
    var gBottom = addSvgEl(svg, "g", {"transform":"translate(" + pltAr[0]  + " " + gBottomShift + ")"});
    var svgBottom = addSvgEl(gBottom, "svg", {"id":"svg_bottom_"+elementId, "overflow":"visible","y":"100%", "width":svg.width.baseVal.value-padding[0]});
    if(xlabel.length>0) {
        //addSvgTxt(svg, xlabel,"50%", pltAr[1] + pltAr[3] + axesLblFontSize*2.4 + fontSpacing, axesLblFontSize);
        addSvgTxt(svgBottom, xlabel,"50%", axesLblFontSize*3, axesLblFontSize);
    };

    ///////////////////////////////
    // draw ylabel
    ///////////////////////////////
    var svgLeft= addSvgEl(svg, "svg", {"id":"svg_left_"+elementId, "y": pltAr[1], "overflow":"visible", "height":svg.height.baseVal.value-padding[1]});
    if(ylabel.length>0) { 
        var text = addSvgEl(svgLeft, "text", {"writing-mode":"sideways-lr", 
        "fill":"black", "font-size":axesLblFontSize, "text-anchor":"middle", 
        "font-family":"Sans,Arial", "stroke-width": 1, "y":"50%", "x":(pltAr[0] - axesLblFontSize*4 - fontSpacing) 
        });  
        text.append(document.createTextNode(ylabel));
    };

    ///////////////////////////////
    // Draw axes
    ///////////////////////////////
    // define range of plot
    var xMin = 0;
    var xMax = 0;
    var yMin = 0;
    var yMax = 0;

    if(xlim.length < 2) {
        xMin = getMin(x);
        xMax = getMax(x);

        if(xMin == xMax) {
        xMin = xMin - 0.5;
        xMax = xMax + 0.5;
        };
    } else {
        xMin = xlim[0];
        xMax = xlim[1];
    };
    if(ylim.length < 2) {
        yMin = getMin(y);
        yMax = getMax(y);

        if(yMin == yMax) {
            yMin = yMin - 0.5;
            yMax = yMax + 0.5;
        };
    } else {
        yMin = ylim[0];
        yMax = ylim[1];
    }

    //////////////////////////////
    // create clip path for plotting area
    //////////////////////////////
    var drawWidth = svg.width.baseVal.value - padding[0];
    var drawHeight = svg.height.baseVal.value - padding[1];    
    var svgDraw = addSvgEl(svg, "svg", {"id":"svg_draw_"+elementId, "preserveAspectRatio":"none",
        "viewBox":"0 0 " + pltAr[2] + " " + pltAr[3], 
        "width":drawWidth, "height":drawHeight, 
        "x":pltAr[0], "y":pltAr[1]});       


    ////////////////////////////
    // Draw grid and labels
    ////////////////////////////
    var minorGridX = false;
    var minorGridY = false;
    if(gridMinor.length < 1) {
        // enable minor grid by default for log axes
        minorGridX = xScale == 'log';
        minorGridY = yScale == 'log';
    } else {
        minorGridX = gridMinor[0];
        if(gridMinor.length > 1)
            minorGridY = gridMinor[1];
        else
            minorGridY = gridMinor[1];
    }          

    var xTick = (xMax-xMin)/nXTicks;
		
    // round to next decade
    var exponent = Math.floor(Math.log10(xTick));
    var mantissa = Math.ceil(xTick/Math.pow(10,exponent));
    var normTickIdx=normTicks.findIndex(function(number) {
        return number >= mantissa;
    });
    var xTick = normTicks[normTickIdx] * Math.pow(10,exponent);

    if(logXEnbl) {
        if ((xMax-xMin) >= 1) { // keep 1 decade tick until there is at least 1 decade range
        xTick = xTick < 1 ? 1 : xTick;
        if(xTick > 1) {
            // log sub ticks only used for 1 decade range, higher ranges change to lin sub ticks
            // in that case each sub tick should be at least 1 decade
            nXMinorTicks = (xTick > nXMinorTicks) ? nXMinorTicks : xTick;
        }
        } else {
        nXMinorTicks = 0; // no sub ticks for less than 1 decade major tick range
        }
    } else {
        nXMinorTicks = 5; // 5 sub ticks for linear axes are cleaner than 10
    }
	

    var yTick = (yMax-yMin)/nYTicks;
    // round to next decade
    exponent = Math.floor(Math.log10(yTick));
    mantissa = Math.ceil(yTick/Math.pow(10,exponent));
    normTickIdx=normTicks.findIndex(function(number) {
        return number >= mantissa;
    });

    yTick = normTicks[normTickIdx] * Math.pow(10,exponent);
    if(logYEnbl) {
        if ((yMax-yMin) >= 1) { // keep 1 decade tick until there is at least 1 decade range
            yTick = yTick < 1 ? 1 : yTick;
            if(yTick > 1) {
                // log sub ticks only used for 1 decade range, higher ranges change to lin sub ticks
                // in that case each sub tick should be at least 1 decade
                nYMinorTicks = (yTick > nYMinorTicks) ? nYMinorTicks : yTick;
            }
        } else {
        nYMinorTicks = 0; // no sub ticks for less than 1 decade major tick range
        }
    } else {
        nYMinorTicks = 5; // 5 sub ticks for linear axes are cleaner than 10
    }
        
    if(xlim.length < 1) {
        if ((xMax-xMin)/xTick >= 4) {
        // change starting points based on tick
        xMin = Math.floor(xMin/xTick) * xTick;
        xMax = Math.ceil(xMax/xTick) * xTick;
        };
    };
    if(ylim.length < 1) {
        if((yMax-yMin)/yTick >= 4) {
            // change starting points based on tick
            yMin = Math.floor(yMin/yTick) * yTick;
            yMax = Math.ceil(yMax/yTick) * yTick;
        };
    };

    // next major ticks
    var xMinTick = Math.ceil(xMin/xTick) * xTick;
    var xMaxTick = Math.floor(xMax/xTick) * xTick;
    var yMinTick = Math.ceil(yMin/yTick) * yTick;
    var yMaxTick = Math.floor(yMax/yTick) * yTick;

    // offset in the plot in pixel
    var xTickOffset = pltAr[2] * (xMinTick - xMin)/(xMax-xMin);
    var yTickOffset = pltAr[3] * (yMaxTick - yMax)/(yMax-yMin);
    var xTickOffsetPct = 100 * (xMinTick - xMin)/(xMax-xMin);
    var yTickOffsetPct = 100 * (yMaxTick - yMax)/(yMax-yMin);

    // actual number of ticks
    nXTicks = Math.round((xMaxTick-xMinTick)/xTick); // rounding should not be required, just put in case of small numerical errors
    nYTicks = Math.round((yMaxTick-yMinTick)/yTick); // rounding should not be required, just put in case of small numerical errors

    var tickLength = (pltAr[2] > pltAr[3]) ? pltAr[2] / 100 : pltAr[3] / 100;
    var minorTickLength = tickLength/2;

    if(logXEnbl) {
        xTickLabel = num2eng(decades(xMinTick,xTick,xMaxTick));
    } else {
        xTickLabel = num2eng(linspace(xMinTick,xTick,xMaxTick));
    };

    if(logYEnbl) {
        yTickLabel = num2eng(decades(yMinTick,yTick,yMaxTick));
    } else {
        yTickLabel = num2eng(linspace(yMinTick,yTick,yMaxTick));
    };
        
    // draw x ticks, labels and grid lines
    dXTick = pltAr[2] * xTick/(xMax-xMin); 
    dXTickPct = 100 * xTick/(xMax-xMin); 

    // draw y tick, labels and grid lines
    dYTick = pltAr[3] * yTick/(yMax-yMin); 
    dYTickPct = 100 * yTick/(yMax-yMin); 

    // axis labels
    for(idx = 0; idx <= nYTicks; ++idx) {
        var yTickPos =  - yTickOffsetPct + dYTickPct * idx;
        var textEl = addSvgTxt(svgLeft, yTickLabel[nYTicks-idx], pltAr[0] - axesLblFontSize*0.5, yTickPos+"%", axesLblFontSize, "end");
        textEl.setAttribute("dominant-baseline","central");
    }
    for(idx = 0; idx <= nXTicks; ++idx) {
        var xTickPos = dXTickPct * idx + xTickOffsetPct;  
        addSvgTxt(svgBottom, xTickLabel[idx], xTickPos+"%", axesLblFontSize*1.4, axesLblFontSize);
    }

    // draw tick lines via pattern (in case we use custom ticks, this cant
    // be used anymore, see below's loop then for an alternative)
    var defsgy = addSvgEl(svgDraw, "defs");    
    if(minorGridY && nYMinorTicks > 0) {
        var mgy = addSvgEl(defsgy, "g", { "id": "mgy_"+elementId});
        if(grid) {
        addSvgLn(mgy, 0, 1, pltAr[2],1, stroke="rgb(223,223,223)", strokedasharray="2 4");
        };
        addSvgLn(mgy, 0, 1, minorTickLength,1);
        addSvgLn(mgy, pltAr[2] - minorTickLength, 1, pltAr[2], 1);
        defsgy.appendChild(mgy);
    };

    var py = addSvgEl(defsgy, "pattern", {"id":"yTick_"+elementId, "x":0, 
        "y":yTickOffset-1, "width": pltAr[2], "height": dYTick,
        "patternUnits": "userSpaceOnUse"
        });

    if(minorGridY && nYMinorTicks > 0) {
        if(logYEnbl && yTick == 1) {
            minorTickPos = logspace(1, (9/(nYMinorTicks-1)), 10);
            minorTickPos.forEach((value, index) => {minorTickPos[index] = (1-minorTickPos[index])*dYTick});
        } else {
            minorTickPos = linspace(0, (1/nYMinorTicks)*dYTick, dYTick);
        };
        for(idx = 1; idx < minorTickPos.length-1; ++idx) {
        addSvgEl(py, 'use', {"href":"#mgy_"+elementId, "y":minorTickPos[idx]});
        };
    };
    if(grid) {
        addSvgLn(py, 0, 1, pltAr[2],1, stroke="rgb(223,223,223)");
    };
    addSvgLn(py, 0, 1, tickLength,1);
    addSvgLn(py, pltAr[2] - tickLength, 1, pltAr[2], 1);
    addSvgRec(svgDraw, 0, 0, pltAr[2], pltAr[3], "url(#yTick_"+elementId+")");

    // draw tick lines via pattern (in case we use custom ticks, this cant
    // be used anymore, see below's loop then for an alternative)
    var defsgx =  addSvgEl(svgDraw, "defs");
    if(minorGridX && nXMinorTicks > 0) {
        var mgx = addSvgEl(defsgx, "g", { "id": "mgx_"+elementId});
        if(grid) {
        addSvgLn(mgx, 1, 0, 1, pltAr[3], stroke="rgb(223,223,223)", strokedasharray="2 4");
        };
        addSvgLn(mgx, 1, 0, 1, minorTickLength);
        addSvgLn(mgx, 1, pltAr[3] - minorTickLength, 1, pltAr[3]);
    };

    var px = addSvgEl(defsgx, "pattern", {"id":"xTick_"+elementId, "x":xTickOffset-1, 
        "y":0, "width": dXTick, "height": pltAr[3],
        "patternUnits": "userSpaceOnUse"
        });

    if(minorGridX && nXMinorTicks > 0) {
        if(logXEnbl && xTick == 1) {
            minorTickPos = logspace(1, (9/(nXMinorTicks-1)), 10);
            minorTickPos.forEach((value, index) => {minorTickPos[index] *= dXTick});
        } else {
            minorTickPos = linspace(0, (1/nXMinorTicks)*dXTick, dXTick);
        };
        for(idx = 1; idx < minorTickPos.length-1; ++idx) {
        addSvgEl(px, "use", {"href":"#mgx_"+elementId, "x":minorTickPos[idx], "vector-effect":"non-scaling-stroke"});
        };
    };
    if(grid) {
        addSvgLn(px, 1, 0, 1, pltAr[3], stroke="rgb(223,223,223)");
    };
    addSvgLn(px, 1, 0, 1, tickLength);
    addSvgLn(px, 1, pltAr[3] - tickLength, 1, pltAr[3]);
    addSvgRec(svgDraw, 0, 0, pltAr[2], pltAr[3], "url(#xTick_"+elementId+")");

    //////////////////////////////
    // create polylines
    //////////////////////////////
    var numPtPerLine = y.length / numLines;
    var varX = x.length == y.length;
    if(!varX && (numPtPerLine != x.length))
        throw new Error("Dimension must agree");

    for(lnIdx = 0; lnIdx < numLines; ++lnIdx) {
        var xLen = x.length;
        var pointArray = new Array(xLen*2);
        colorIdx = lnIdx % colorMapRGB.length;
        var poly = document.createElementNS(ns, "polyline");
        poly.setAttribute("class", "l");
        poly.setAttribute("id", "pl_" +elementId+"_"+lnIdx);
        poly.setAttribute("stroke", colorMapRGB[colorIdx]);
        //poly.setAttribute("shape-rendering","optimizeSpeed ");

        for(ptIdx = 0; ptIdx < numPtPerLine; ++ptIdx) {
            const ptx = varX ? x[lnIdx*numPtPerLine  + ptIdx] : x[ptIdx];
            const pty = y[lnIdx*numPtPerLine  + ptIdx];
            
            if (isFinite(ptx) && isFinite(pty)) {
                var point = svgDraw.createSVGPoint();
                point.x = pltAr[2] * (ptx-xMin) / (xMax-xMin);
                point.y = pltAr[3] - pltAr[3]*(pty-yMin) / (yMax-yMin);
                poly.points.appendItem(point);
            }
        };                
        
        svgDraw.appendChild(poly);
    };

    //////////////////////////////
    // create drawing area
    //////////////////////////////
    addSvgRec(svgDraw, 0, 0, pltAr[2], pltAr[3], "none", "black");

    // add legend last to be in front os drawing
    //svg.appendChild(gleg); 
    svg.appendChild(gleg); 
    

    // add event callbacks
    svgDraw.onclick = (event) => plotClicked(event, elementId, pltAr[2], pltAr[3], xMin, xMax, yMin, yMax, logXEnbl, logYEnbl)
    svg.oncontextmenu = (event) => {event.preventDefault()}; // prevent context menu during zoom
    svgDraw.onmousedown = (event) => plotMouseDown(event, elementId);
    svg.onmousedown = (event) => {event.preventDefault()}; // prevent context menu during zoom

    if(legend.length > 0)
        gleg.onwheel = (event) => scrollLegend(event, elementId, hLegendItems)
    //gleg.addEventListener('wheel', () => this.scrollLegend(), { passive:false });
    //window.addEventListener('resize', () => resizeSvg(elementId, padding[0], padding[1], hLegendItems, hLegendMargin));
    new ResizeObserver(() => resizeSvg(elementId, padding[0], padding[1], hLegendItems, hLegendMargin)).observe(svg)
    
};

