/**
* Copyright (c) 2025, Thomas Baier
* All rights reserved. (MIT Licensed)
*
* plotSvg.js (YaJsSvgPlot)
* A small, interactive plotting tool
* https://github.com/messier433/YaJsSvgPlot
*/
{
const round = Math.round;
const floor = Math.floor;
const log10 = Math.log10;
const ceil = Math.ceil;

const zoomButton = 2; // 0 is left mouse button; 1: middle mouse button; 2: right mouse button (recommended)
const panButton = 1; // 0 is left mouse button; 1: middle mouse button (recommended); 2: right mouse button
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
const nTicksMax = [10, 10]; // max ticks (will be adjusted for short tick labels)
const nMinorTicksMax = [10, 10]; // minor ticks  (max value; will be adjusted)
const normTicks = [1, 2, 5, 10];
const xAxesSpacing = axesLblFontSize*4;
const yAxesSpacing = axesLblFontSize*2;
const colorMapRGB =  ["rgb(0,114,190)", "rgb(218,83,25)", "rgb(238,178,32)", 
                    "rgb(126,47,142)", "rgb(119,173,48)", "rgb(77,191,239)",
                    "rgb(163,20,47)"];

function getEl(id){
    return document.getElementById(id);
};
function setAttr(obj, field, val) {
    obj.setAttribute(field, val);
};
function getAttr(obj, field) {
    return obj.getAttribute(field);
};
function size(element) {
    return [element.x.baseVal.value, element.y.baseVal.value, 
            element.width.baseVal.value, element.height.baseVal.value];
};
function view(element) {
    return [element.viewBox.baseVal.x, element.viewBox.baseVal.y, 
        element.viewBox.baseVal.width, element.viewBox.baseVal.height];
};

function setLim(vals, lim) {
    if(lim.length < 2) {
        let len = vals.length;
        let max = -Infinity;
        let min = Infinity;
        while (len--) {
            if(isFinite(vals[len])) {
                min = (vals[len] < min) ? vals[len] : min;
                max = (vals[len] > max) ? vals[len] : max;
            }
        }

        lim = [min, max]; 
    };
    if(lim[0] == lim[1]) {
        lim[0] = lim[0] - 0.5;
        lim[1] = lim[1] + 0.5;
    };
    return lim;
}

function num2eng(val) {
    const unitList = ['y', 'z', 'a', 'f', 'p', 'n', 'u', 'm', '', 'k', 'M', 'G', 'T', 'P', 'E', 'Z', 'Y'];
    const zeroIndex = 8;
    const out = Array(val.length);


    for(let idx = 0; idx < val.length; ++idx) {
        
        const nn = val[idx].toExponential(5).split(/e/);
        let u = floor(+nn[1] / 3) + zeroIndex;
        if (u > unitList.length - 1) {
            u = unitList.length - 1;
        } else
        if (u < 0) {
            u = 0;
        };

        out[idx] =  round((nn[0] * (10 ** ( +nn[1] - (u - zeroIndex) * 3)))*1000)/1000 + unitList[u];
    };
    return out;
};
function linspace(start, increment, stop) {
    // due to rounding errros it can happen numel is to small
    let numel = floor((stop-start)/increment*(1+1e-12))+1;
    
    out = Array(numel);

    for(let idx=0; idx < numel; ++idx){
        out[idx] = start + increment*idx;
    };
    return out;
};

function logspace(start, increment, stop) {
    return linspace(start, increment, stop).map(log10);
};

function decades(start, increment, stop) {
    return linspace(start, increment, stop).map((x) => 10 ** x);
};

function addSvgEl(parent, ele, attrs) {
    const ns = "http://www.w3.org/2000/svg";
    //create the element with a specified string:
    const element = (typeof ele == "string") ? document.createElementNS(ns, ele) : ele;
    //create a for...in loop set attributes:
    for (let val in attrs) {
        setAttr(element, val, attrs[val]);        
    };
    if(parent != null)
        parent.appendChild(element);
    //return the element with the set attributes:
    return element;
};
function addSvgTxt(parent, text, x, y, fontsize, textanchor = "middle", fontfamily="Sans,Arial", fill="black") {
    const textEl = addSvgEl(parent, "text", {"x":x, "y":y,
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

function legClicked(event, fontsize, ySpacing, elementId, numLines) {
    const svgLeg = getEl("svg_leg_"+elementId); //event.srcElement.ownerSVGElement;
    const legY = event.offsetY-getAttr(svgLeg, "y")+view(svgLeg)[1]; // x position inside plotting area
    const lnIdx = floor((legY-ySpacing/2) / (fontsize+ySpacing));
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
        for(let idx = 0; idx < numLines; ++idx) {
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

function updateMarkerPos(elementId) {
    const svgDraw = getEl("svg_draw_"+elementId);
    const tooltips = document.getElementsByClassName("tooltip_" + elementId);
    // update tooltip location which refers to top SVG and not scaled with drawing SVG
    for(let idx = 0; idx<tooltips.length; ++idx) {
        const svgSz = size(svgDraw);
        const svgVw = view(svgDraw)
        const scaleX = svgVw[2]/svgSz[2];
        const scaleY = svgVw[3]/svgSz[3];

        tooltips[idx].transform.baseVal[1].matrix.a = scaleX; 
        tooltips[idx].transform.baseVal[1].matrix.d = scaleY; 
    }    
}

function resizeSvg(elementId, padX, padY, hLegendItems, hLegendMargin) {
    const svgLeg = getEl("svg_leg_"+elementId);
    const svgDraw = getEl("svg_draw_"+elementId);
    const svgBg = getEl("svg_bg_"+elementId);
    const svgTop = getEl("svg_top_"+elementId);
    const svgBottom = getEl("svg_bottom_"+elementId);
    const svgLeft = getEl("svg_left_"+elementId);
    const svg = getEl("svg_"+elementId);
    
    const parentSz = size(svg);
    const childSz = size(svgDraw);
    const newChildWidth = parentSz[2]-padX;
    const newChildHeight = parentSz[3]-padY;

    if(childSz[2] != newChildWidth) {
        setAttr(svgDraw, "width", newChildWidth); 
        setAttr(svgBg, "width", newChildWidth);            
        setAttr(svgTop, "width", newChildWidth);    
        setAttr(svgBottom, "width", newChildWidth); 
        if(svgLeg!=null) svgLeg.x.baseVal.value += newChildWidth - childSz[2];    
    }
    if(childSz[3] != newChildHeight) {
        setAttr(svgDraw, "height",  newChildHeight);
        setAttr(svgBg, "height", newChildHeight);    
        setAttr(svgLeft, "height", newChildHeight); 
        if(svgLeg!=null) {
            let newLegHeight = newChildHeight -hLegendMargin;
            newLegHeight = (newLegHeight > hLegendItems) ? hLegendItems : newLegHeight;
            setAttr(svgLeg, "height", newLegHeight);
            svgLeg.viewBox.baseVal.height = newLegHeight;
        }
    }
    // update tooltip location which refers to top SVG and not scaled with drawing SVG
    updateMarkerPos(elementId);
};

function scrollLegend(event, elementId, hLegendItems){
    const svgLeg = getEl("svg_leg_"+elementId);
    const rectLeg = getEl("rect_leg_"+elementId);
    const legSz = size(svgLeg);
    const svgLegVw = view(svgLeg);   
    const minScroll = 0;
    const maxScroll = hLegendItems - legSz[3];
    svgLegVw[1] +=  event.deltaY;

    if(svgLegVw[1] < minScroll)
        svgLegVw[1] = minScroll;
    if(svgLegVw[1] > maxScroll)
        svgLegVw[1] = maxScroll;

    svgLeg.viewBox.baseVal.y = svgLegVw[1];
    rectLeg.y.baseVal.value = svgLegVw[1];
    return false;
}

function plotClicked(event, elementId, pltLim, grid, minorGrid, logScale) {

    const svgDraw = getEl("svg_draw_"+elementId);
    //const svg = getEl("svg_"+elementId);

    //else
    const drawSz = size(svgDraw);
    const drawVw = view(svgDraw)
    const scaleX = drawVw[2]/drawSz[2];
    const scaleY = drawVw[3]/drawSz[3];
    const plotX = (event.offsetX-drawSz[0]) * scaleX + drawVw[0]; // x position inside plotting viewBox
    const plotY = (event.offsetY-drawSz[1]) * scaleY + drawVw[1]; // y position inside plotting viewBox
    const dSnap = 6;
    const detX = dSnap * scaleX;
    const detY = dSnap * scaleY;
    result = getNearestLine(elementId, plotX, plotY, detX, detY);
    const closestEl = result.ele;
    if(closestEl == null)
        return;

    const intX = result.x;
    const intY = result.y;
    //const topX = (intX-vBx)/scaleX + drawX;
    //const topY = (intY-vBy)/scaleY + drawY;

    const prefix = "pl_" + elementId;
    const lnId = closestEl.id;
    const lnIdx = lnId.slice(prefix.length, lnId.length);
    const legendItem = getEl("lti_"+elementId+lnIdx);
    const plotLine = getEl("pl_"+elementId+lnIdx);
    const lineColor = getAttr(plotLine, "stroke");
    const sourceCoord = convertCoord([intX, intY], pltLim, logScale);
    let gl = getEl("gpl_" +elementId+lnIdx);
    if(gl == null) { // create group for all tooltips on the same line (to be used in case line vibility is toggled)
        //gl = addSvgEl(svg, "g", {"id":"gpl_" + elementId+lnIdx});
        gl = addSvgEl(svgDraw, "g", {"id":"gpl_" + elementId+lnIdx});
    }
    const tooltip = addSvgEl(gl, "g", {"class":"tooltip_"+elementId, 
        "transform":"translate(" + intX + " " + intY + ")" + " scale("+scaleX + " "+ scaleY + ")"
        //"transform":"translate(" + topX + " " + topY + ")"
    });
    const rect = addSvgRec(tooltip, 5, -9, 0, 32, lineColor, "rgb(223,223,223)", 1, rx=4);
    
    tooltip.onclick = (event) => {
         if(event.srcElement.parentNode.tagName == "g") event.srcElement.parentNode.remove();
         if(event.detail > 1)  setAxesLim(elementId, pltLim, pltLim, grid, minorGrid, logScale);// double click
    };   
    
    let line = null;
    if(legendItem != null) {
        text = addSvgTxt(tooltip, legendItem.textContent, 7, -11, 12, "start", "Sans,Arial", "white" ); 
        addSvgEl(null, text, {"font-weight":"bold"});
        line = addSvgLn(tooltip, 5, -8, 5,-8, stroke="white");
		addSvgEl(null, rect, {"y":-23, "height":46});
    }

    addSvgTxt(tooltip, "x: " + num2eng([sourceCoord[0]]), 7, 4, 12, "start", "Sans,Arial", "white");
    addSvgTxt(tooltip, "y: " + num2eng([sourceCoord[1]]), 7, 18, 12, "start", "Sans,Arial", "white");    
            
    const bbox = tooltip.getBBox();
    addSvgEl(null, rect, {"width": bbox.width+4});
    if(line != null)
        setAttr(line, "x2", bbox.width+4+5);

    addSvgRec(tooltip, -2, -2, 4, 4, "black");
    // add invisble circle to  capture clicks
    addSvgEl(tooltip, "circle", {"r":dSnap, "fill":"none", "pointer-events": "visible"});
}

function convertCoord(point, pltLim, logScale) {
    x = point[0] / 100 * pltLim[2] + pltLim[0];
    y = (1-point[1] / 100) * pltLim[3] + pltLim[1];

    x = (logScale[0]) ? (10**x) : x;
    y = (logScale[1]) ? (10**y) : y;

    return [x,y];
}

// find a nearest line within 'proximity'
function getNearestLine(elementId, Cx, Cy, dx, dy) {
    let closestEl = null;
    let closestDist = Infinity;
    let closestXproj = 0;
    let closestYproj = 0;

    const polylines = getEl("gp_"+elementId);
    const nLines = polylines.children.length;

    for(let idx = 0; idx < nLines; ++idx) {
        const pts = polylines.children[idx].points;
        for(let idxPt = 1; idxPt < pts.length;++idxPt) {
            const ptA = pts[idxPt-1];
            const ptB = pts[idxPt];

            // check if point is in rectangle
            if(((Cx < (ptA.x-dx)) && (Cx < (ptB.x-dx))) || ((Cx > (ptA.x+dx)) && (Cx > (ptB.x+dx))) || 
                ((Cy < (ptA.y-dy)) && (Cy < (ptB.y-dy))) || ((Cy > (ptA.y+dy)) && (Cy > (ptB.y+dy))))
                continue;
                
            // project point onto line
            const ptBAx = (ptB.x- ptA.x);
            const ptBAy = (ptB.y- ptA.y);            
            const ptCAx = Cx - ptA.x;
            const ptCAy = Cy - ptA.y;
            const coeff = (ptBAx*ptCAx + ptBAy*ptCAy) / (ptBAx*ptBAx+ptBAy*ptBAy);
            const xproj = ptA.x + ptBAx * coeff;
            const yproj = ptA.y + ptBAy * coeff;
            const dist = (xproj-Cx)*(xproj-Cx)/dx/dx + (yproj-Cy)*(yproj-Cy)/dy/dy;

            if(dist >= 1 || dist > closestDist) 
                continue;

            closestDist = dist;
            closestEl = polylines.children[idx];
            const dCAx = (Cx > ptA.x) ? Cx - ptA.x : ptA.x - Cx;
            const dCAy = (Cy > ptA.y) ? Cy - ptA.y : ptA.y - Cy;
            const dCBx = (Cx > ptB.x) ? Cx - ptB.x : ptB.x - Cx;
            const dCBy = (Cy > ptB.y) ? Cy - ptB.y : ptB.y - Cy;
            // snap to point
            if((dCAx < dCBx) && (dCAx < dx) && (dCAy < dy) ) {
                closestXproj = ptA.x;
                closestYproj = ptA.y;
            } else if((dCBx < dx) && (dCBy < dy) ) {
                closestXproj = ptB.x;
                closestYproj = ptB.y;
            } else {
                closestXproj = xproj;
                closestYproj = yproj;
            };          
        };
    };

    return {"ele": closestEl, "x":closestXproj, "y":closestYproj};
}

function plotMouseDown(event, elementId) {
    if(event.button != zoomButton && event.button != panButton)
        return;

    // else start zoom
    const svg = getEl("svg_"+elementId);

    const x = event.offsetX;
    const y = event.offsetY;
    const rect = addSvgRec(svg, x, y, 0, 0, "black");
    const opacity = (event.button != zoomButton) ? 0 : 0.3; // dont show rectangle during pan
    addSvgEl(null, rect, {"id":"zoom_rect"+elementId, "fill-opacity":opacity});
    svg.onmousemove = (eventNew) => plotDrawZoom(eventNew, elementId, x, y);
}

function plotDrawZoom(event, elementId, x0, y0) {  
    const rectZoom = getEl("zoom_rect"+elementId);
    const x = event.offsetX;
    const y = event.offsetY;
    const newW = x - x0;
    const newH = y - y0;
    const isPan = getAttr(rectZoom,"fill-opacity") == 0;
    if(isPan || newW >= 0) {
        setAttr(rectZoom, "width", newW);
    } else {
        addSvgEl(null, rectZoom, {"width": -newW, "x":x});
    };
    if(isPan || newH >= 0) {
        setAttr(rectZoom, "height", newH);
    } else {
        addSvgEl(null, rectZoom, {"height": -newH, "y":y});
    };
}

function plotZoom(elementId, rlim, grid, minorGrid, logScale) {
    const rectZoom = getEl("zoom_rect"+elementId);
    const svg = getEl("svg_"+elementId);
    svg.onmousemove = null; // disable move event to aovid unnessary callbacks
    if(rectZoom == null)
        return;

    const isPan = getAttr(rectZoom,"fill-opacity") == 0;
    const rec = size(rectZoom);
    rectZoom.remove();
    if(~isPan && (rec[2] == 0 || rec[3] == 0))
        return;

    const svgDraw = getEl("svg_draw_"+elementId);
    const vb = view(svgDraw);

    const pltAr = size(svgDraw);
    let recRel = [];
    if(isPan)
        recRel =  [-rec[2]/ pltAr[2], rec[3]/ pltAr[3], 1,1];
    else
        recRel =  [(rec[0] - pltAr[0]) / pltAr[2], 1-(rec[1]+rec[3] - pltAr[1])/pltAr[3], rec[2]/pltAr[2], rec[3]/pltAr[3]];

    const clim = [rlim[0] + rlim[2]*vb[0]/100, rlim[1] + rlim[3]*(100-vb[3]-vb[1])/100, rlim[2]*vb[2]/100, rlim[3]*vb[3]/100];
    const nlim = [clim[0] + recRel[0]*clim[2], clim[1] + recRel[1]*clim[3], recRel[2]*clim[2], recRel[3]*clim[3]];

    setAxesLim(elementId, nlim, rlim, grid, minorGrid, logScale);
}

function setAxesLim(elementId, lim, renderLim, grid, minorGrid, logScale){
    const svgDraw = getEl("svg_draw_"+elementId);
    const shiftX = 100*(lim[0]-renderLim[0]) /  renderLim[2];
    const shiftY = 100*(renderLim[1]+renderLim[3]-lim[1] - lim[3]) /  renderLim[3];
    svgDraw.viewBox.baseVal.width = 100* lim[2] / renderLim[2];
    svgDraw.viewBox.baseVal.height = 100* lim[3] / renderLim[3];
    svgDraw.viewBox.baseVal.x = shiftX;
    svgDraw.viewBox.baseVal.y = shiftY;

    // shift plot-area rectangle to new viewbox
    const plr = getEl("plr_"+elementId);
    addSvgEl(null, plr, {'x':shiftX, 'y':shiftY});

    // remove old grid before creating a new one
    const gridEl = document.getElementsByClassName("cg_"+elementId);
    while (gridEl.length > 0) gridEl[0].remove();    

    createGrid(elementId, lim, grid, minorGrid, logScale);
    updateMarkerPos(elementId);
}

function calcTick(range, nTicks, logScale)
{
    let tick = range/nTicks;		
    // round to next decade
    const exponent = floor(log10(tick));
    const mantissa = ceil(tick/(10**exponent));
    const normTickIdx=normTicks.findIndex(function(number) {
        return number >= mantissa;
    });
    tick = normTicks[normTickIdx] * (10**exponent);
    // keep 1 decade tick until there is at least 1 decade range
    return (logScale && range>=1 && tick < 1) ? 1 : tick; 

    
    /*if(logXEnbl) {
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
    }*/
}

function createGrid(elementId, lim, grid, minorGrid, logScale){    
    const svgBg = getEl("svg_bg_"+elementId);
    const svgLeft = getEl("svg_left_"+elementId);
    const svgBottom = getEl("svg_bottom_"+elementId);
    let nMinorTicks = nMinorTicksMax;
    for(let axIdx = 0; axIdx<2;++axIdx){
        const svgAx = (axIdx > 0) ? svgLeft : svgBottom; 
        const tick = calcTick(lim[2+axIdx], nTicksMax[axIdx], logScale[axIdx]);
        const max = lim[axIdx]+lim[2+axIdx];
        // next major ticks
        const minTick = ceil(lim[axIdx]/tick) * tick;
        const maxTick = floor(max/tick) * tick;

        // offset in the plot in pixel
        const offset = (axIdx > 0) ? lim[axIdx]+lim[axIdx+2] - maxTick : minTick - lim[axIdx];
        const tickOffset = 100 * (offset)/lim[2+axIdx];

        // actual number of ticks
        const nTicks = round((maxTick-minTick)/tick); // rounding should not be required, just put in case of small numerical errors
        
        const tickLength = 1;
        const minorTickLength = tickLength/2;

        let tickLabel = Array();
        if(logScale[axIdx]) {
            tickLabel = num2eng(decades(minTick,tick,maxTick));
        } else {
            tickLabel = num2eng(linspace(minTick,tick,maxTick));
        };
 
        // draw ticks, labels and grid lines
        const dTick = 100 * tick/lim[2+axIdx]; 

        // axis labels and grid
        const defs =  addSvgEl(svgBg, "defs", {"class":"cg_" +elementId});
        const defsg =  addSvgEl(defs, "g", {"id": "mg" + axIdx + "_" + elementId});
        if(minorGrid[axIdx] && nMinorTicks[axIdx] > 0) {
            let minorTickPos = Array();
            if(logScale[axIdx] && tick == 1) {
                minorTickPos = logspace(1, (9/(nMinorTicks[axIdx]-1)), 10);
                minorTickPos.forEach((value, index) => {minorTickPos[index] = (minorTickPos[index])*dTick});
            } else {
                minorTickPos = linspace(0, (1/nMinorTicks[axIdx])*dTick, dTick);
            };
            
            for(let idx = 1; idx < minorTickPos.length-1; ++idx) {
                let x0 = minorTickPos[idx];
                let x1 = minorTickPos[idx];
                let y0 = 0;
                let y1 = 100;
                if(axIdx>0) [x0,y0,x1,y1] = [y0,-x0,y1,-x1]; // swap x,y 
                addSvgLn(defsg, x0,y0,x1,y1, "rgb(223,223,223)", "2 4");
            };
        };
        
        let x0 = "0%";
        let y0 = (100-tickLength) +"%";
        let x1 = "0%";
        let y1 = "100%";
        let tx = "0%";
        let ty = tickLength +"%";
        if(axIdx>0) [x0,y0,x1,y1,tx,ty] = [y0,x0,y1,x1,ty,tx];  // swap x,y 
        
        if(grid) addSvgLn(defsg, 0, 0, x1, y1, "rgb(223,223,223)");
        addSvgLn(defsg,x0, y0, x1, y1); 
        addSvgLn(defsg, 0, 0, tx, ty);
 
        for(let idx = 0; idx <= nTicks; ++idx) {
            const tickPos =  tickOffset + dTick * idx; 
            let textEl = null;     
            if(axIdx > 0)                
                textEl = addSvgTxt(svgAx, tickLabel[nTicks-idx], size(svgAx)[2] - axesLblFontSize*0.5, tickPos+"%", axesLblFontSize, "end");
            else 
                textEl = addSvgTxt(svgAx, tickLabel[idx], tickPos+"%", axesLblFontSize*0.9, axesLblFontSize);

            addSvgEl(null,textEl,{"dominant-baseline":"central", "class":"cg_" +elementId});
            const x = (axIdx>0) ? 0:  tickPos;
            const y = (axIdx>0) ? tickPos: 0;
            addSvgEl(svgBg, "use", {"href":"#mg" + axIdx + "_"+elementId, "x":x, "y":y, "class":"cg_" +elementId});
        };
    };   
}

function plotSvg(elementId, x, y, numLines, 
{title = "", subtitle = "", xlabel = "", ylabel="", xlim=[], ylim=[], 
    legend = [], xScale = "lin", yScale = "lin", grid = true, 
    gridMinor = [], legendLocation = 'northeastoutside'
}={}
)
{      
    const ns = "http://www.w3.org/2000/svg";

    let logScale = [false, false];
    if(xScale == "log") {
        x = x.map(log10);
        //x.forEach((value, index) => {x[index] = log10(value)});
        if(xlim.length > 1) {
            xlim = xlim.map(log10);
            
            if (isNaN(xlim[0]) || isNaN(xlim[1])) {
                xlim = [];
            } else {
                xlim[0] =  (xlim[0] == -Infinity) ? 0 : xlim[0];
                xlim[1] =  (xlim[1] == -Infinity) ? 0 : xlim[1];  
            };
        };
        logScale[0] = true;
    };

    if(yScale == "log") {
        y = y.map(log10);
        //y.forEach((value, index) => {y[index] = log10(value)});
        if(ylim.length > 1) {
            ylim = ylim.map(log10);
            if (isNaN(ylim[0]) || isNaN(ylim[1])) {
                ylim = [];
            } else {
                ylim[0] =  (ylim[0] == -Infinity) ? 0 : ylim[0];
                ylim[1] =  (ylim[1] == -Infinity) ? 0 : ylim[1];  
            };
        };
        logScale[1] = true;
    };

    const el = getEl(elementId);
    const mainDiv = document.createElement("div");
    el.appendChild(mainDiv);
    //mainDiv.setAttribute( "style", "width:100%;height:calc(100vh - 4px);overflow:none");  
    setAttr(mainDiv, "style", "width:100%;height:100%;min-width:"+
        maxLegendWidth+"px;min-height:200px;overflow:none");   

    const svg = addSvgEl(mainDiv, "svg", {"id":"svg_"+elementId, "width":"100%", "height":"100%"});
    const svgSz = size(svg);

    // write styles
    svg.innerHTML += "\<style\>\n" +
        "\<![CDATA[\n" + 
        "polyline.l {\n" + 
        "stroke-width:2;\n" + 
        "vector-effect:non-scaling-stroke;\n" + 
        "fill:none;\n" +
        "}\n" + 
        "text.cll {\n" + 
        "font-size:"+legendFontSize+"px;\n" + 
        "fill:black;\n" + 
        "dominant-baseline:central;\n" + 
        "font-family:"+legendFont+";\n" + 
        "}\n" + 
        "]]\>\n" + 
        "\</style\>\n";

    let pltArYOffset = 0;
    let pltArXOffset = xAxesSpacing;
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

    let plotHeight = svgSz[3]-pltArYOffset-yAxesSpacing;
    let plotWidth = svgSz[2]-pltArXOffset;

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
    const gleg = addSvgEl(null, "g", {"pointer-events":"visible"});
    gleg.onclick = (event) => legClicked(event, legendFontSize, legendYSpacing, elementId, 0);
    gleg.ondblclick = (event) => legClicked(event, legendFontSize, legendYSpacing, elementId, numLines);
   
    let hLegendMargin = 0;
    let hLegendItems = 0;
    if(legend.length>0 && numLines > 0 && x.length > 0) {  
        // set legend dimensions depending on location
        let legFill = "";
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
        const hLegendMax = plotHeight - hLegendMargin;   
        // add legend already here to calculate width
        // will be moved again at the end of the function 
        svg.appendChild(gleg);     
        
        // define legend line        
        const defsll = addSvgEl(svg, "defs");
        addSvgEl(defsll, "line", {"id":"ll_"+elementId, "x1":0, "y1":0,"x2":legendLineLength,"y2":0, 
            "stroke-width":2,"vector-effect":"non-scaling-stroke"});
                
        // draw legend box (change width later)
        const svgLeg = addSvgEl(gleg, "svg", {"id":"svg_leg_"+elementId});
    
        let nLegend = numLines; 
        let legendTmp = legend;
        if(legend.length > numLines) { // cannot be more legend entries than lines
            legendTmp = legend.slice(0,nLegend);  
        }  
            
        hLegendItems = nLegend * (legendFontSize + legendYSpacing) + legendYSpacing;
        let hLegend = (hLegendItems > hLegendMax) ? hLegendMax : hLegendItems;
       
        addSvgEl(null, svgLeg, {"x": "100%", "height": hLegend});       
    
        // draw legend box (change width later)       
        const recleg = addSvgRec(svgLeg, 0, 0, 0, "100%", legFill, "black");
        addSvgEl(null, recleg, {"id":"rect_leg_"+elementId});
        // create legend items
        for(let lnIdx = 0; lnIdx < nLegend; ++lnIdx) {
            const colorIdx = lnIdx % colorMapRGB.length;
            const yOffset = lnIdx * (legendFontSize + legendYSpacing) +  legendYSpacing;
    
            const legItemGroup = new addSvgEl(svgLeg, "g", {"id": "lgi_"+elementId+"_"+lnIdx});

            // legend lines
            addSvgEl(legItemGroup, "use", {"id": "lli_"+elementId+"_"+lnIdx, "x":legendXSpacing, "y":yOffset+legendFontSize/2,
                "href":"#ll_"+elementId, "stroke":colorMapRGB[colorIdx]});
   
            // legend labels
            const textEl = addSvgEl(legItemGroup, "text", {"id": "lti_"+elementId+"_"+lnIdx, "class":"cll", 
                "x":legendXSpacing+legendLineLength+legendXSpacing, "y":yOffset+legendFontSize/2});
            let str = "";
            if(lnIdx < legendTmp.length) {
                str = legendTmp[lnIdx];
            };
            textEl.append(document.createTextNode(str));  
        }

        let bbox = gleg.getBBox();
        let wLegend = bbox.width + 2*legendXSpacing;
        wLegend = (wLegend > maxLegendWidth) ? maxLegendWidth : wLegend;
        // update width of legend rectangle and clip box
        setAttr(recleg,"width","100%");
        setAttr(svgLeg,"width",wLegend);

        let xLegend = 0;
        // update plot and legend dimensions depending on legend position
        switch(legendLocation) {
            case 'northeast':
                //xLegend = pltArXOffset + plotWidth - wLegend - 2*legendXSpacing;
                xLegend = -wLegend - 2*legendXSpacing - xAxesSpacing;
                plotWidth -= xAxesSpacing;                
                break;
            case 'northeastoutside':
                //xLegend = pltArXOffset + plotWidth - wLegend;
                xLegend = -wLegend - legendXSpacing;
                plotWidth -= wLegend + 2*legendXSpacing;
                break;
            default:
                throw new Error("LegendLocation not supported");
        }

        // move legend to final location   
        addSvgEl(null, svgLeg, {"x": svgSz[2] + xLegend, "y": yLegend, "viewBox": "0 0 " + wLegend + " " + hLegend});
    }   else {
        plotWidth -= xAxesSpacing;
    }

    const pltAr = [pltArXOffset, pltArYOffset, plotWidth, plotHeight];
    let padding = [svgSz[2]-pltAr[2], svgSz[3]-pltAr[3]];
    ///////////////////////////////
    // add title
    ///////////////////////////////
    const svgTop= addSvgEl(svg, "svg", {"id":"svg_top_"+elementId, "x": pltAr[0], "overflow":"visible", "width":pltAr[2]});
    let titleYOffset = 0;
    if(title.length>0) {
        for(let idx = 0; idx < titleLines.length; ++idx) {
            titleYOffset = titleYOffset + titleFontSize + fontSpacing;
            addSvgTxt(svgTop, titleLines[idx], "50%", titleYOffset, titleFontSize);
        };
    };  
    ///////////////////////////////
    // add subtitle
    ///////////////////////////////
    if(subtitle.length>0) {
        for(let idx = 0; idx < subtitleLines.length; ++idx) {
            titleYOffset = titleYOffset + subTitleFontSize + fontSpacing;
            addSvgTxt(svgTop, subtitleLines[idx], "50%", titleYOffset, subTitleFontSize);
        };    
    };

    ///////////////////////////////
    // draw xlabel
    ///////////////////////////////
    let gBottomShift = -svgSz[3] + pltAr[1] + pltAr[3];
    const gBottom = addSvgEl(svg, "g", {"transform":"translate(" + pltAr[0]  + " " + gBottomShift + ")"});
    const svgBottom = addSvgEl(gBottom, "svg", {"id":"svg_bottom_"+elementId, "overflow":"visible","y":"100%", "width":pltAr[2]});
    if(xlabel.length>0) {
        //addSvgTxt(svg, xlabel,"50%", pltAr[1] + pltAr[3] + axesLblFontSize*2.4 + fontSpacing, axesLblFontSize);
        addSvgTxt(svgBottom, xlabel,"50%", axesLblFontSize*3, axesLblFontSize);
    };

    ///////////////////////////////
    // draw ylabel
    ///////////////////////////////
    const svgLeft= addSvgEl(svg, "svg", {"id":"svg_left_"+elementId, "width": pltAr[0], "y": pltAr[1], "overflow":"visible", "height":pltAr[3]});
    if(ylabel.length>0) { 
        let text = addSvgEl(svgLeft, "text", {"writing-mode":"sideways-lr", 
        "fill":"black", "font-size":axesLblFontSize, "text-anchor":"middle", 
        "font-family":"Sans,Arial", "stroke-width": 1, "y":"50%", "x":(pltAr[0] - axesLblFontSize*4 - fontSpacing) 
        });  
        text.append(document.createTextNode(ylabel));
    };

    ///////////////////////////////
    // Draw axes
    ///////////////////////////////
    // define range of plot
    const xlims = setLim(x, xlim);
    const ylims = setLim(y, ylim);
    let pltLim = [xlims[0], ylims[0], xlims[1]-xlims[0],ylims[1]-ylims[0]];

    //////////////////////////////
    // create clip path for plotting area
    //////////////////////////////   
    // background SVG used for ticks and grid
    const svgBg = addSvgEl(svg, "svg", {"id":"svg_bg_"+elementId, "preserveAspectRatio":"none",
            "viewBox":"0 0 100 100", 
            "width":pltAr[2], "height":pltAr[3], 
            "x":pltAr[0], "y":pltAr[1]});

    const svgDraw = addSvgEl(svg, "svg", {"id":"svg_draw_"+elementId, "preserveAspectRatio":"none",
        "viewBox":"0 0 100 100", 
        "width":pltAr[2], "height":pltAr[3], 
        "x":pltAr[0], "y":pltAr[1]});

    ////////////////////////////
    // Draw grid and labels
    ////////////////////////////
    let gridMinorSet = [false, false];
    if(gridMinor.length < 1) {
        // enable minor grid by default for log axes
        gridMinorSet[0] = xScale == 'log';
        gridMinorSet[1] = yScale == 'log';
    } else {
        gridMinorSet[0] = gridMinor[0];
        if(gridMinor.length > 1)
            gridMinorSet[1] = gridMinor[1];
        else
            gridMinorSet[1] = gridMinor[1];
    }          

    const xTick = calcTick(pltLim[2], nTicksMax[0], logScale[0]);	
    const yTick = calcTick(pltLim[3], nTicksMax[1], logScale[1]);
        
    if(xlim.length < 1) {
        if (pltLim[2]/xTick >= 4) {
            // change starting points based on tick
            pltLim[0] = floor(xlims[0]/xTick) * xTick;
            pltLim[2] = ceil(xlims[1]/xTick) * xTick - pltLim[0];
        };
    };
    if(ylim.length < 1) {
        if(pltLim[3]/yTick >= 4) {
            // change starting points based on tick
            pltLim[1] = floor(ylims[0]/yTick) * yTick;
            pltLim[3] = ceil(ylims[1]/yTick) * yTick - pltLim[1];
        };
    };
    
    createGrid(elementId, pltLim, grid, gridMinorSet, logScale);

    //////////////////////////////
    // create polylines
    //////////////////////////////
    let numPtPerLine = y.length / numLines;
    let varX = x.length == y.length;
    if(!varX && (numPtPerLine != x.length))
        throw new Error("Dimension must agree");

    const gp = addSvgEl(svgDraw, "g", {"id":"gp_"+elementId});
    for(let lnIdx = 0; lnIdx < numLines; ++lnIdx) {
        const colorIdx = lnIdx % colorMapRGB.length;
        const poly = addSvgEl(gp, "polyline", {"class": "l",  "id": "pl_" +elementId+"_"+lnIdx,
            "stroke": colorMapRGB[colorIdx]});
        //poly.setAttribute("shape-rendering","optimizeSpeed ");

        for(let ptIdx = 0; ptIdx < numPtPerLine; ++ptIdx) {
            const ptx = varX ? x[lnIdx*numPtPerLine  + ptIdx] : x[ptIdx];
            const pty = y[lnIdx*numPtPerLine  + ptIdx];
            
            if (isFinite(ptx) && isFinite(pty)) {
                const point = svgDraw.createSVGPoint();
                point.x = 100*(ptx-pltLim[0])/ pltLim[2];
                point.y = 100-100*(pty-pltLim[1]) / pltLim[3];
                poly.points.appendItem(point);
            }
        };                
    };

    //////////////////////////////
    // create drawing area
    //////////////////////////////
    const plRec = addSvgRec(svgDraw, 0, 0, "100%", "100%", "none", "black");
    addSvgEl(null, plRec, {"id":"plr_"+elementId,"pointer-events": "visible"});

    // add legend last to be in front os drawing
    //svg.appendChild(gleg); 
    svg.appendChild(gleg); 
    


    // add event callbacks
    plRec.onclick = (event) => plotClicked(event, elementId, pltLim, grid, gridMinorSet, logScale)
    svg.oncontextmenu = (event) => {event.preventDefault()}; // prevent context menu during zoom
    svgDraw.onmousedown = (event) => plotMouseDown(event, elementId);
    svgDraw.ondblclick = () => setAxesLim(elementId, pltLim, pltLim, grid, gridMinorSet, logScale);
    svg.onmousedown = (event) => {event.preventDefault()}; // prevent context menu during zoom
    svg.onmouseup = () => plotZoom( elementId, pltLim, grid, gridMinorSet, logScale);
   
    if(legend.length > 0)
        gleg.onwheel = (event) => scrollLegend(event, elementId, hLegendItems)
    //gleg.addEventListener('wheel', () => this.scrollLegend(), { passive:false });
    //window.addEventListener('resize', () => resizeSvg(elementId, padding[0], padding[1], hLegendItems, hLegendMargin));
    new ResizeObserver(() => resizeSvg(elementId, padding[0], padding[1], hLegendItems, hLegendMargin)).observe(svg)
    
};

};