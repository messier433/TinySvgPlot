/**
* Copyright (c) 2025, Thomas Baier
* All rights reserved. (MIT Licensed)
*
* plotSvg.js (YaJsSvgPlot)
* A small, interactive plotting tool
* https://github.com/messier433/YaJsSvgPlot
*/

function num2eng (val) {
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
function linspace (start, increment, stop) {
    numel = Math.floor((stop-start)/increment)+1;
    out = Array(numel);

    for(idx=0,val =start; val <= stop; ++idx,val+=increment){
        out[idx] = val;
    };
    return out;
};

function logspace (start, increment, stop) {
    numel = Math.floor((stop-start)/increment)+1;
    out = Array(numel);

    for(idx=0,val =start; val <= stop; ++idx,val+=increment){
        out[idx] = Math.log10(val);
    };
    return out;
};

function decades (start, increment, stop) {
    numel = Math.floor((stop-start)/increment)+1;
    out = Array(numel);

    for(idx=0,val =start; val <= stop; ++idx,val+=increment){
        out[idx] = Math.pow(10,val);
    };
    return out;
};

function createSVGElement(ele, attrs) {
    const ns = "http://www.w3.org/2000/svg";
    //create the element with a specified string:
    var element = document.createElementNS(ns, ele);

    //create a for...in loop set attributes:
    for (let val in attrs) {
        element.setAttribute( val, attrs[val]);          
    };
    //return the element with the set attributes:
    return element;
};
function appendSvgText(parent, text, x, y, fontsize, textanchor = "middle", fontfamily="Sans,Arial", fill="black") {
    var textEl = createSVGElement("text", {"x":x, "y":y,
            "fill":fill, "font-size":fontsize, "text-anchor":textanchor, "font-family":fontfamily,
            "stroke-width": 1
            });
    textEl.append(document.createTextNode(text));              
    parent.appendChild(textEl);
    return textEl;
}
function appendSvgLine(parent, x1, y1, x2,y2, stroke="black", strokedasharray="") {
    var lineEl = createSVGElement("line", {"x1":x1, "y1":y1,"x2":x2, "y2":y2,
            "stroke":stroke, "stroke-width": 1, "stroke-dasharray": strokedasharray, "vector-effect":"non-scaling-stroke"
    });  
    parent.appendChild(lineEl);
    return lineEl;
};

function toggleLineVisibility(elementId, lineIdx, nLegend, numLines) {
    var style = document.getElementById("pl_"+elementId+lineIdx).style.display;
    if(numLines == 0) {
        if (style === "none") {
            document.getElementById("pl_"+elementId+lineIdx).style.display = "block";
            document.getElementById("lli_"+elementId+lineIdx).style.opacity = 1;
            document.getElementById("lti_"+elementId+lineIdx).style.opacity = 1;
        } else {        
            document.getElementById("pl_"+elementId+lineIdx).style.display = "none";
            document.getElementById("lli_"+elementId+lineIdx).style.opacity = 0.3;
            document.getElementById("lti_"+elementId+lineIdx).style.opacity = 0.3;
        };
    } else {
        for(idx = 0; idx < numLines; ++idx) {
            if (style === "none") { // make all visible again
                document.getElementById("pl_"+elementId+idx).style.display = "block";
                if(idx < nLegend) {
                    document.getElementById("lli_"+elementId+idx).style.opacity = 1;
                    document.getElementById("lti_"+elementId+idx).style.opacity = 1;
                }
            } else  if(idx != lineIdx) { // only keep selected one visible
                document.getElementById("pl_"+elementId+idx).style.display = "none";
                if(idx < nLegend) {
                    document.getElementById("lli_"+elementId+idx).style.opacity = 0.3;
                    document.getElementById("lti_"+elementId+idx).style.opacity = 0.3;
                };
            };
        };
    };
};

function removeInvalidPoints(pts) {
    var x = pts[0];
    var y = pts[1];

    var newX = Array(x.length);
    var newY = Array(y.length);

    if(x.length == y.length) {
        var newIdx = 0;
        for(idx = 0; idx < y.length; ++idx) {
            if(isFinite(x[idx]) && isFinite(y[idx])) {
                newX[newIdx] = x[idx];
                newY[newIdx] = y[idx];
                ++newIdx;
            };
        };
        if(newIdx < x.length) {
        newX = newX.slice(0, newIdx);
        newY = newY.slice(0, newIdx);
        };
    } else {
        var newIdx = 0;
        var numLines = y.length/x.length;
        var numPoints = x.length;
        for(idx = 0; idx < numPoints; ++idx) {
            var xValid = isFinite(x[idx]);
            var yValid = true;
            for(idxLines = 0; idxLines < numLines; ++idxLines) {
                if(!isFinite(y[idxLines*numPoints +  idx])) {
                yValid = false;
                break;
                };
                newY[idxLines*numPoints + newIdx] = y[idxLines*numPoints + idx];  
            };
            if(xValid && yValid) {
                newX[newIdx] = x[idx];          
                ++newIdx;
            };
        };
        if(newIdx < x.length) {
            newX = newX.slice(0, newIdx);
            newIdx = 0;
            for(idx = 0; idx < y.length; ++idx) {
                if((idx % numPoints) < newX.length) {
                newY[newIdx] = y[idx];
                ++newIdx;
                }
            }
            newY = newY.slice(0, newX.length*numLines);
        };
    }
    return [newX, newY];
}

function resizeSvg(elementId, padX, padY, hLegendItems, hLegendMargin) {
    var svgLeg = document.getElementById("svg_leg_"+elementId);
    var svgDraw = document.getElementById("svg_draw_"+elementId);
    var svg = document.getElementById("svg_"+elementId);
    
    const parentWidth = svg.width.baseVal.value;
    const parentHeight = svg.height.baseVal.value;
    const newChildWidth = parentWidth-padX;
    const newChildHeight = parentHeight-padY;
    const oldChildWidth = svgDraw.width.baseVal.value;
    const oldChildHeight = svgDraw.height.baseVal.value;
    
    tooltips = document.getElementsByClassName("tooltip");

    if(oldChildWidth != newChildWidth) {
        svgDraw.width.baseVal.value = newChildWidth;    
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
    var svgLeg = document.getElementById("svg_leg_"+elementId);
    var rectLeg = document.getElementById("rect_leg_"+elementId);
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
    
    svgDraw = document.getElementById("svg_draw_"+elementId);
    svg = document.getElementById("svg_"+elementId);
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
    var closestIdx = 0;
    var closestDist = Infinity;

    for(idx = 0; idx < points.length; ++idx ) {
        const ptX = points[idx].x;
        const ptY = points[idx].y;
        const dist = (ptX-plotX)*(ptX-plotX) + (ptY-plotY)*(ptY-plotY);
        if(dist < closestDist) {
            closestDist = dist;
            closestIdx = idx;
        }
    }
    const snapDist = 6*6; // snap to exact point if clicked within distance
    var nextIdx = (points[closestIdx].x > plotX) ? closestIdx -1 : closestIdx +1;
    nextIdx = (nextIdx < 0) ? 0 : nextIdx;
    nextIdx = (nextIdx >= points.length) ? points.length-1 : nextIdx;
    nextIdx = (closestDist < snapDist) ? closestIdx : nextIdx;

    // interpolate between the 2 points
    var dx = (points[closestIdx].x - plotX) / (points[closestIdx].x - points[nextIdx].x);
    if(nextIdx == closestIdx)
        dx = 1;

    const intX = points[nextIdx].x * dx + points[closestIdx].x * (1-dx);
    const intY = points[nextIdx].y * dx + points[closestIdx].y * (1-dx);
    const topX = intX/scaleX + svgDraw.x.baseVal.value;
    const topY = intY/scaleY + svgDraw.y.baseVal.value;

    const prefix = "pl_" + elementId;
    const lineId = closestEl.id;
    const lineIdx = lineId.slice(prefix.length, lineId.length);
    const legendItem = document.getElementById("lti_"+elementId+lineIdx);
    const legendLine = document.getElementById("lli_"+elementId+lineIdx);
    lineColor = legendLine.getAttribute("stroke");
    sourceCoord = convertCoord([intX, intY], renderWidth, renderHeight, [xmin,xmax], [ymin, ymax], logx, logy);
    const tooltip = createSVGElement("g", {"class":"tooltip", "transform":"translate(" + topX + " " + topY + ")"});
    const rect = createSVGElement("rect", {"x":5, "y": -21, "stroke":"rgb(223,223,223)", "fill":lineColor, "rx":4, 
        "vector-effect":"non-scaling-stroke"});
    tooltip.append(rect);
    if(legendItem != null) {
        text = appendSvgText(tooltip, legendItem.textContent, 7, -9, 12, "start", "Sans,Arial", "white" );  
        text.setAttribute("font-weight","bold");
        line = appendSvgLine(tooltip, 5, -6, 5,-6, stroke="white");
    }

    appendSvgText(tooltip, "x: " + num2eng([sourceCoord[0]]), 7, 6, 12, "start", "Sans,Arial", "white");
    appendSvgText(tooltip, "y: " + num2eng([sourceCoord[1]]), 7, 20, 12, "start", "Sans,Arial", "white");    
            
    svg.append(tooltip);
    var bbox = tooltip.getBBox();
    rect.setAttribute("width", bbox.width+4);
    rect.setAttribute("height", bbox.height+4);
    if(line != null)
        line.setAttribute("x2", bbox.width+4+5);

    const marker = createSVGElement("rect", {"x":-2, "y": -2,"width":4, "height":4, "fill":"black"});
    tooltip.append(marker)

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
    gridMinor = [], legendLocation = 'northeast'
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
    const fontSpacing = 4;
    const titleFontSize = 24;
    const subTitleFontSize = 12;
    var nXTicks = 10; // max ticks (will be adjusted for short tick labels)
    var nYTicks = 10; // max ticks (will be adjusted for short tick labels)
    var nXMinorTicks = 10; // minor ticks  (max value; will be adjusted)
    var nYMinorTicks = 10; // minor ticks  (max value; will be adjusted)
    const normTicks = [1, 2, 5, 10];
    const xAxesSpacing = axesLblFontSize*5;
    const yAxesSpacing = axesLblFontSize*3;
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

    // remove NAN and infinity
    newPts = removeInvalidPoints([x,y]);
    x = newPts[0];
    y = newPts[1];

    var el = document.getElementById(elementId);
    var mainDiv = document.createElement("div");
    el.appendChild(mainDiv);
    //mainDiv.setAttribute( "style", "width:100%;height:100vh;overflow:auto");   
    mainDiv.setAttribute( "style", "width:100%;height:96vh;overflow:none");    
    //var svg = createSVGElement("svg", {"preserveAspectRatio":"xMinYMin meet",
    //    "viewBox":"0 0 " + width + " " + height});
    var svg = createSVGElement("svg", {"id":"svg_"+elementId, "width":"100%", "height":"100%"});
    mainDiv.appendChild(svg);
    const width=svg.width.baseVal.value;
    const height=svg.height.baseVal.value; 
    const maxLegendWidth = width/4;

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
        "    dominant-baseline:middle;\n" + 
        "    font-family:"+legendFont+";\n" + 
        "  }\n" + 
        "]]\>\n" + 
        "\</style\>\n";


    var plotAreaYOffset = 0;
    var plotAreaXOffset = xAxesSpacing;
    ////////////////////////////////
    // Calc plot and legend area
    ////////////////////////////////
    const titleLines = title.split("\n");
    const subtitleLines = subtitle.split("\n");
    if(title.length>0) {        
        plotAreaYOffset += (titleFontSize + fontSpacing) * titleLines.length;
    };
    if(subtitle.length>0) {
        plotAreaYOffset += (subTitleFontSize + fontSpacing) * subtitleLines.length;
    };

    plotAreaYOffset = plotAreaYOffset + 10;

    var plotHeight = height-plotAreaYOffset-yAxesSpacing;
    var plotWidth = width-plotAreaXOffset;

    // reserve space for labels
    if(xlabel.length>0) {
        plotHeight = plotHeight - axesLblFontSize - fontSpacing;
    };
    if(ylabel.length>0) {
        plotAreaXOffset= plotAreaXOffset + axesLblFontSize + fontSpacing;
        plotWidth = plotWidth - axesLblFontSize - fontSpacing;
    };

    //////////////////////////////////////
    // create legend
    //////////////////////////////////////
    // create group
    var gleg = createSVGElement("g");
    var hLegendMargin = 0;
    if(legend.length>0 && numLines > 0 && x.length > 0) {  
        // set legend dimensions depending on location
        var legFill = "";
        switch(legendLocation) {
            case 'northeast':
                yLegend = plotAreaYOffset + 2*legendYSpacing;
                hLegendMargin = 4*legendYSpacing;
                legFill="white";
                break;
            case 'northeastoutside':
                yLegend = plotAreaYOffset;
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
        var defsll = createSVGElement("defs");
        svg.appendChild(defsll); 
        var ll = createSVGElement("line", {"id":"ll_"+elementId, "x1":0, "y1":0,"x2":legendLineLength,"y2":0, 
            "stroke-width":2,"vector-effect":"non-scaling-stroke"});
        defsll.appendChild(ll); 

        wLegendMax = maxLegendWidth;
        hLetter = legendFontSize;
        
        // draw legend box (change width later)
        var svgLeg = createSVGElement("svg", {"id":"svg_leg_"+elementId});
    
        var nLegend = numLines; 
        var legendTmp = legend;0
        if(legend.length > numLines) { // cannot be more legend entries than lines
            legendTmp = legend.slice(0,nLegend);  
        }  
            
        var hLegendItems = nLegend * (hLetter + legendYSpacing) + legendYSpacing;
        var hLegend = (hLegendItems > hLegendMax) ? hLegendMax : hLegendItems;
        var legendTrunc = 0;
       
        svgLeg.setAttribute("x", "100%");
        svgLeg.setAttribute("height", hLegend);
        gleg.appendChild(svgLeg);        
    
        // draw legend box (change width later)
        var recleg = createSVGElement("rect", {"id":"rect_leg_"+elementId, "x":0,"y":0,"height":"100%",
            "fill":legFill,"stroke":"black","stroke-width":2,"vector-effect":"non-scaling-stroke"});
            svgLeg.appendChild(recleg); 
            
            
        // create legend items
        for(lineIdx = 0; lineIdx < nLegend; ++lineIdx) {
            colorIdx = lineIdx % colorMapRGB.length;
            yOffset = lineIdx * (hLetter + legendYSpacing) +  legendYSpacing;
    
                // legend lines
            var lineEl = createSVGElement("use", {"id": "lli_"+elementId+lineIdx, "x":legendXSpacing, "y":yOffset+hLetter/2,
                "href":"#ll_"+elementId, "stroke":colorMapRGB[colorIdx], 
                "onclick":"toggleLineVisibility(\""+elementId+"\",\""+lineIdx+"\", 0, 0)",
                "ondblclick":"toggleLineVisibility(\""+elementId+"\",\""+lineIdx+"\","  + nLegend + "," + numLines+")"
                });
                svgLeg.appendChild(lineEl);
    
    
            // legend labels
            var textEl = createSVGElement("text", {"id": "lti_"+elementId+lineIdx, "class":"cll", 
                "x":legendXSpacing+legendLineLength+legendXSpacing, "y":yOffset+hLetter/2, 
                "onclick":"toggleLineVisibility(\""+elementId+"\",\""+lineIdx+"\",0, 0)",
                "ondblclick":"toggleLineVisibility(\""+elementId+"\",\""+lineIdx+"\","  + nLegend + "," + numLines+")"
            });
            if(lineIdx < legendTmp.length) {
                textEl.append(document.createTextNode(legendTmp[lineIdx]));  
            }  else {
                textEl.append(document.createTextNode("")); 
            }
            svgLeg.appendChild(textEl);
            
        }
            
        if(legendTrunc) {
            // todo add scrollbars
    
        }
    
        var bbox = gleg.getBBox();
        var wLegend = bbox.width + 2*legendXSpacing;
        wLegend = (wLegend > wLegendMax) ? wLegendMax : wLegend;
        // update width of legend rectangle and clip box
        recleg.setAttribute("width","100%");
        svgLeg.setAttribute("width",wLegend);
    
        // create bouding box for mouse clicks on legend items
        for(lineIdx = 0; lineIdx < nLegend; ++lineIdx) {
            colorIdx = lineIdx % colorMapRGB.length;
            yOffset = lineIdx * (hLetter + legendYSpacing) +  legendYSpacing;
    
            // create rectangle to capture mouse event
            var rectEl = createSVGElement("rect", {"id": "lri_"+elementId+lineIdx, "x":legendXSpacing, "y":yOffset,
                "width":wLegend, "height":hLetter + legendYSpacing, "fill":"none",
                "pointer-events":"visible", "onclick":"toggleLineVisibility(\""+elementId+"\",\""+lineIdx+"\",0,0)",
                "ondblclick":"toggleLineVisibility(\""+elementId+"\",\""+lineIdx+"\"," + nLegend + "," + numLines + ")"   
            });
            svgLeg.appendChild(rectEl);
        }

        var xLegend = 0;
        // update plot and legend dimensions depending on legend position
        switch(legendLocation) {
            case 'northeast':
                //xLegend = plotAreaXOffset + plotWidth - wLegend - 2*legendXSpacing;
                xLegend = -wLegend - 2*legendXSpacing - xAxesSpacing;
                plotWidth -= xAxesSpacing;                
                break;
            case 'northeastoutside':
                //xLegend = plotAreaXOffset + plotWidth - wLegend;
                xLegend = -wLegend
                plotWidth -= wLegend + legendXSpacing;
                break;
            default:
                throw new Error("LegendLocation not supported");
        }

        // move legend to final location   
        //gleg.setAttribute( "transform", "translate(" + xLegend +  " " + yLegend + ")");
        svgLeg.setAttribute("x", "calc(100% + " + xLegend + "px)");
        svgLeg.setAttribute("y", yLegend);
        svgLeg.setAttribute("viewBox", "0 0 " + wLegend + " " + hLegend)
    }   else {
        plotWidth -= legendLineLength + 3*legendXSpacing + legendFontSize;
    }

    plotArea = [plotAreaXOffset, plotAreaYOffset, plotWidth, plotHeight];
    var padding = [width-plotArea[2], height-plotArea[3]];
    ///////////////////////////////
    // add title
    ///////////////////////////////
    var svgTop= createSVGElement("svg", {"x": plotArea[0], "overflow":"visible", "width":"calc(100% - "+padding[0]+"px)"});
    svg.appendChild(svgTop);
    var titleYOffset = 0;
    if(title.length>0) {
        for(idx = 0; idx < titleLines.length; ++idx) {
            titleYOffset = titleYOffset + titleFontSize + fontSpacing;
            appendSvgText(svgTop, titleLines[idx], "50%", titleYOffset, titleFontSize);
        };
    };  
    ///////////////////////////////
    // add subtitle
    ///////////////////////////////
    if(subtitle.length>0) {
        for(idx = 0; idx < subtitleLines.length; ++idx) {
            titleYOffset = titleYOffset + subTitleFontSize + fontSpacing;
            appendSvgText(svgTop, subtitleLines[idx], "50%", titleYOffset, subTitleFontSize);
        };    
    };

    ///////////////////////////////
    // draw xlabel
    ///////////////////////////////
    var gBottomShift = -height + plotArea[1] + plotArea[3];
    var gBottom = createSVGElement("g", {"transform":"translate(" + plotArea[0]  + " " + gBottomShift + ")"});
    var svgBottom = createSVGElement("svg", {"overflow":"visible","y":"100%", "width":"calc(100% - "+padding[0]+"px)"});
    gBottom.appendChild(svgBottom);
    svg.appendChild(gBottom);
    if(xlabel.length>0) {
        //appendSvgText(svg, xlabel,"50%", plotArea[1] + plotArea[3] + axesLblFontSize*2.4 + fontSpacing, axesLblFontSize);
        appendSvgText(svgBottom, xlabel,"50%", axesLblFontSize*3, axesLblFontSize);
    };

    ///////////////////////////////
    // draw ylabel
    ///////////////////////////////
    var svgLeft= createSVGElement("svg", {"y": plotArea[1], "overflow":"visible", "height":"calc(100% - "+padding[1]+"px)"});
    svg.appendChild(svgLeft);
    if(ylabel.length>0) { 
        var text = createSVGElement("text", {"writing-mode":"sideways-lr", 
        "fill":"black", "font-size":axesLblFontSize, "text-anchor":"middle", 
        "font-family":"Sans,Arial", "stroke-width": 1, "y":"50%", "x":(plotArea[0] - axesLblFontSize*4 - fontSpacing) 
        });  
        text.append(document.createTextNode(ylabel));
        svgLeft.appendChild(text);  
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
        xMin = Math.min(...x);
        xMax = Math.max(...x);
        if(xMin == NaN) {
        xMin = 0;
        xMax = 1;
        };
        if(xMin == xMax) {
        xMin = xMin - 0.5;
        xMax = xMax + 0.5;
        };
    } else {
        xMin = xlim[0];
        xMax = xlim[1];
    };
    if(ylim.length < 2) {
        yMin = Math.min(...y);
        yMax = Math.max(...y);

        if(yMin == NaN) {
            yMin = 0;
            yMax = 1;
        };
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
    var svgDraw = createSVGElement("svg", {"id":"svg_draw_"+elementId, "preserveAspectRatio":"none",
        "viewBox":"0 0 " + plotArea[2] + " " + plotArea[3], 
        "width":drawWidth, "height":drawHeight, 
        "x":plotArea[0], "y":plotArea[1]});       


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
    var xTickOffset = plotArea[2] * (xMinTick - xMin)/(xMax-xMin);
    var yTickOffset = plotArea[3] * (yMaxTick - yMax)/(yMax-yMin);
    var xTickOffsetPct = 100 * (xMinTick - xMin)/(xMax-xMin);
    var yTickOffsetPct = 100 * (yMaxTick - yMax)/(yMax-yMin);


    // actual number of ticks
    nXTicks = Math.round((xMaxTick-xMinTick)/xTick); // rounding should not be required, just put in case of small numerical errors
    nYTicks = Math.round((yMaxTick-yMinTick)/yTick); // rounding should not be required, just put in case of small numerical errors

    var tickLength = (plotArea[2] > plotArea[3]) ? plotArea[2] / 100 : plotArea[3] / 100;
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
    dXTick = plotArea[2] * xTick/(xMax-xMin); 
    dXTickPct = 100 * xTick/(xMax-xMin); 

    // draw y tick, labels and grid lines
    dYTick = plotArea[3] * yTick/(yMax-yMin); 
    dYTickPct = 100 * yTick/(yMax-yMin); 

    // axis labels
    for(idx = 0; idx <= nYTicks; ++idx) {
        var yTickPos =  - yTickOffsetPct + dYTickPct * idx;
        var textEl = appendSvgText(svgLeft, yTickLabel[nYTicks-idx], plotArea[0] - axesLblFontSize*0.5, yTickPos+"%", axesLblFontSize, "end");
        textEl.setAttribute("alignment-baseline","middle");
    }
    for(idx = 0; idx <= nXTicks; ++idx) {
        var xTickPos = dXTickPct * idx + xTickOffsetPct;  
        appendSvgText(svgBottom, xTickLabel[idx], xTickPos+"%", axesLblFontSize*1.4, axesLblFontSize);
    }

    // draw tick lines via pattern (in case we use custom ticks, this cant
    // be used anymore, see below's loop then for an alternative)
    var defsgy = document.createElementNS(ns, "defs");
    svgDraw.appendChild(defsgy);
    if(minorGridY && nYMinorTicks > 0) {
        var mgy = createSVGElement("g", { "id": "mgy_"+elementId});
        if(grid) {
        appendSvgLine(mgy, 0, 1, plotArea[2],1, stroke="rgb(223,223,223)", strokedasharray="2 4");
        };
        appendSvgLine(mgy, 0, 1, minorTickLength,1);
        appendSvgLine(mgy, plotArea[2] - minorTickLength, 1, plotArea[2], 1);
        defsgy.appendChild(mgy);
    };

    var py = createSVGElement('pattern', {"id":"yTick_"+elementId, "x":0, 
        "y":yTickOffset-1, "width": plotArea[2], "height": dYTick,
        "patternUnits": "userSpaceOnUse"
        });
    defsgy.appendChild(py);

    if(minorGridY && nYMinorTicks > 0) {
        if(logYEnbl && yTick == 1) {
        minorTickPos = logspace(1, (9/(nYMinorTicks-1)), 10);
        minorTickPos.forEach((value, index) => {minorTickPos[index] = (1-minorTickPos[index])*dYTick});
        } else {
        minorTickPos = linspace(0, (1/nYMinorTicks)*dYTick, dYTick);
        };
        for(idx = 1; idx < minorTickPos.length-1; ++idx) {
        var usey = createSVGElement('use', {"href":"#mgy_"+elementId, "y":minorTickPos[idx]});
        py.append(usey);
        };
    };
    if(grid) {
        appendSvgLine(py, 0, 1, plotArea[2],1, stroke="rgb(223,223,223)");
    };
    appendSvgLine(py, 0, 1, tickLength,1);
    appendSvgLine(py, plotArea[2] - tickLength, 1, plotArea[2], 1);
    var pyr = createSVGElement("rect", {"x":0,"y":0,"width":plotArea[2],
        "height": plotArea[3],"fill": "url(#yTick_"+elementId+")"
    });
    svgDraw.appendChild(pyr);

    // draw tick lines via pattern (in case we use custom ticks, this cant
    // be used anymore, see below's loop then for an alternative)
    var defsgx = document.createElementNS(ns, "defs");
    svgDraw.appendChild(defsgx);
    if(minorGridX && nXMinorTicks > 0) {
        var mgx = createSVGElement("g", { "id": "mgx_"+elementId});
        if(grid) {
        appendSvgLine(mgx, 1, 0, 1, plotArea[3], stroke="rgb(223,223,223)", strokedasharray="2 4");
        };
        appendSvgLine(mgx, 1, 0, 1, minorTickLength);
        appendSvgLine(mgx, 1, plotArea[3] - minorTickLength, 1, plotArea[3]);
        defsgx.appendChild(mgx);
    };

    var px = createSVGElement('pattern', {"id":"xTick_"+elementId, "x":xTickOffset-1, 
        "y":0, "width": dXTick, "height": plotArea[3],
        "patternUnits": "userSpaceOnUse"
        });
    defsgx.appendChild(px);

    if(minorGridX && nXMinorTicks > 0) {
        if(logXEnbl && xTick == 1) {
        minorTickPos = logspace(1, (9/(nXMinorTicks-1)), 10);
        minorTickPos.forEach((value, index) => {minorTickPos[index] *= dXTick});
        } else {
        minorTickPos = linspace(0, (1/nXMinorTicks)*dXTick, dXTick);
        };
        for(idx = 1; idx < minorTickPos.length-1; ++idx) {
        var usex = createSVGElement('use', {"href":"#mgx_"+elementId, "x":minorTickPos[idx], "vector-effect":"non-scaling-stroke"});
        px.append(usex);
        };
    };
    if(grid) {
        appendSvgLine(px, 1, 0, 1, plotArea[3], stroke="rgb(223,223,223)");
    };
    appendSvgLine(px, 1, 0, 1, tickLength);
    appendSvgLine(px, 1, plotArea[3] - tickLength, 1, plotArea[3]);

    var pxr = createSVGElement("rect", {"x":0,"y":0,"width":plotArea[2],
        "height": plotArea[3],"fill": "url(#xTick_"+elementId+")"
    });
    svgDraw.appendChild(pxr);


    //////////////////////////////
    // create polylines
    //////////////////////////////
    var numPtPerLine = y.length / numLines;
    var varX = x.length == y.length;
    if(!varX && (numPtPerLine != x.length))
        throw new Error("Dimension must agree");

    for(lineIdx = 0; lineIdx < numLines; ++lineIdx) {
        var xLen = x.length;
        var pointArray = new Array(xLen*2);
        colorIdx = lineIdx % colorMapRGB.length;
        for(ptIdx = 0; ptIdx < numPtPerLine; ++ptIdx) {
        var ptx = varX ? x[lineIdx*numPtPerLine  + ptIdx] : x[ptIdx];
        var pty = y[lineIdx*numPtPerLine  + ptIdx];
        pointArray[2*ptIdx] = plotArea[2] * (ptx-xMin) / (xMax-xMin);
        pointArray[2*ptIdx+1] = plotArea[3] - plotArea[3]*(pty-yMin) / (yMax-yMin);
        };

        var poly = document.createElementNS(ns, "polyline");
        //rect.setAttributeNS(null, 'class', "pl")
        poly.setAttribute("class", "l");
        poly.setAttribute("id", "pl_" +elementId+lineIdx);
        poly.setAttribute("points", pointArray.join(" "));
        poly.setAttribute("stroke", colorMapRGB[colorIdx]);
                
        //poly.setAttribute("shape-rendering","optimizeSpeed ");
        svgDraw.appendChild(poly);
    };

    //////////////////////////////
    // create drawing area
    //////////////////////////////
    var rect = createSVGElement("rect", {"x":0,"y":0,"width":plotArea[2],
        "height": plotArea[3],"fill": "none","stroke":"black","stroke-width": 2,
        "vector-effect":"non-scaling-stroke"
    });
    svgDraw.appendChild(rect);
    svg.appendChild(svgDraw);

    // add legend last to be in front os drawing
    //svg.appendChild(gleg); 
    svg.appendChild(gleg); 
    

    // add event callbacks
    svgDraw.onclick = (event) => plotClicked(event, elementId, plotArea[2], plotArea[3], xMin, xMax, yMin, yMax, logXEnbl, logYEnbl)
    //svgDraw.setAttribute("onclick","console.log('test')");

    if(legend.length > 0)
        gleg.onwheel = (event) => scrollLegend(event, elementId, hLegendItems)
    //gleg.addEventListener('wheel', () => this.scrollLegend(), { passive:false });
    //window.addEventListener('resize', () => resizeSvg(elementId, padding[0], padding[1], hLegendItems, hLegendMargin));
    new ResizeObserver(() => resizeSvg(elementId, padding[0], padding[1], hLegendItems, hLegendMargin)).observe(svg)
    
};



