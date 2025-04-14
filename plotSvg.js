/**
* Copyright (c) 2025, Thomas Baier
* All rights reserved. (MIT Licensed)
*
* plotSvg.js (TinySvgPlot)
* A small, interactive plotting tool
* https://github.com/messier433/TinySvgPlot
*/
{
const defaultFont = "Sans,Arial";
const zoomButton = 2; // 0 is left mouse button; 1: middle mouse button; 2: right mouse button (recommended)
const panButton = 1; // 0 is left mouse button; 1: middle mouse button (recommended); 2: right mouse button
const axesLblFontSize = 12;
const legendFontSize = 10;
const legendFont = "Lucida Sans Typewriter,Courier";
const legendLineLength = 30; // number of pixels for the line length in the legend
const boxSpacing = 4; // number of pixels between legend box, line and text
const maxLegendWidth = 400;
const fontSpacing = 4;
const titleFontSize = 24;
const subTitleFontSize = 12;
const nTicksMax = [10, 10]; // max ticks (will be adjusted for short tick labels)
const nMinorTicksMax = [10, 10]; // minor ticks  (max value; will be adjusted)
const tickLength = 8;
const minorTickLength = tickLength/2;
const normTicks = [1, 2, 5, 10];
const colorMapRGB =  ["#0072BE", "#DA5319", "#EEB220", 
                    "#7E2F8E", "#77AD30", "#4CBFEF",
                    "#A3142F"];
        
// few variables to reduce minimized code size
const ns = "http://www.w3.org/2000/svg";
const round = Math.round;
const floor = Math.floor;
const log10 = Math.log10;
const ceil = Math.ceil;
const array = Array;
const isArray = array.isArray;
const Inf = Infinity;
const doc =document;
const NULL = null;
const NONE = "none";

function plotSvg(elementId, x, y, numLines, 
{color = "", title = "", subtitle = "", xlabel = "", ylabel="", xlim=[], ylim=[], style="-", marker="", 
    legend= {names:[], x:0, y:0, anchor:["right", "top"], ref:["out", "in"], boxed:1, fill:NONE}, 
    xScale = "lin", yScale = "lin", grid = true, gridMinor = [], xtick = [], ytick = [], 
    xticklbl=[], yticklbl=[], xtickangle = 0, ytickangle = 0, linTip = true,
    buttons = [], add = []
}={}
)
{    
    // few helper functions...
    const setAttr = (obj, field, val) => obj.setAttribute(field, val);
    const addSvgEl = (parent, ele, attrs) => {
        //create the element with a specified string:
        const element = (typeof ele == "string") ? doc.createElementNS(ns, ele) : ele;
        //create a for...in loop set attributes:
        for (let val in attrs) {
            setAttr(element, val, attrs[val]);        
        };
        if(parent != NULL)
            parent.appendChild(element);
        //return the element with the set attributes:
        return element;
    };
    const addSvgRec = (parent, x, y, width, height, fill=NONE, stroke=NONE, stroke_width=2, rx=0) =>
        addSvgEl(parent, "rect", {"x":x, "y":y,"width":width, "height":height, "rx":rx,
                "stroke":stroke, "stroke-width": stroke_width, "fill": fill, "vector-effect":"non-scaling-stroke"
        });  

    const addSvgTxt = (parent, text, x, y, fontsize, textanchor = "middle", fontfamily=defaultFont, fill="#000") => {
        const textEl = addSvgEl(parent, "text", {"x":x, "y":y,
                "fill":fill, "font-size":fontsize, "text-anchor":textanchor, "font-family":fontfamily,
                "stroke-width": 1
                });
        textEl.append(doc.createTextNode(text));              
        return textEl;
    }
    const addSvgLn = (parent, x1, y1, x2,y2, stroke="#000", strokedasharray="", stroke_width=1) =>
        addSvgEl(parent, "line", {"x1":x1, "y1":y1,"x2":x2, "y2":y2,
                "stroke":stroke, "stroke-width": stroke_width, "stroke-dasharray": strokedasharray, "vector-effect":"non-scaling-stroke"
        });  

    const addSvgPolyLn = (parent, points="", stroke="#000", strokedasharray="", stroke_width=2) => 
        addSvgEl(parent, "polyline", {"points":points, "fill": NONE,
                "stroke":stroke, "stroke-width": stroke_width, "stroke-dasharray": strokedasharray, "vector-effect":"non-scaling-stroke"
        });  
    const getEl = id => doc.getElementById(id);
    const getAttr = (obj, field) => obj.getAttribute(field);
    const length = element => element.length;
    const getBb = (element) => {const bb = element.getBBox(); return [bb.x, bb.y, bb.width, bb.height]};
    const size = element => [element.x.baseVal.value, element.y.baseVal.value, 
                             element.width.baseVal.value, element.height.baseVal.value];
    const setSize = (element, size) => addSvgEl(NULL, element, {"x":size[0], "y":size[1], "width":size[2], "height":size[3]});
    const view = element => [element.viewBox.baseVal.x, element.viewBox.baseVal.y, 
            element.viewBox.baseVal.width, element.viewBox.baseVal.height];
    const transform = (element, translate, scale) => {
        let str = (translate!=NULL) ? "translate("+translate[0]+" "+translate[1]+")" : "";
        str += (scale!=NULL) ? "scale("+scale[0]+" "+scale[1]+")" : "";
        setAttr(element, "transform", str);
    };
    const getClassMember = classStr => doc.getElementsByClassName(classStr + "_" + elementId);

    
    /////////////////////////////////////
    // main
    /////////////////////////////////////
    const el = getEl(elementId);
    const mainDiv = doc.createElement("div");
    addSvgEl(el,mainDiv)
    //mainDiv.setAttribute( "style", "width:100%;height:calc(100vh - 4px);overflow:none");  
    setAttr(mainDiv, "style", "width:100%;height:100%;min-width:"+
        maxLegendWidth+"px;min-height:200px;overflow:none");   

    const svg = addSvgEl(mainDiv, "svg", {"id":"s_"+elementId, "width":"100%", "height":"100%"});
    const svgSz = size(svg);
    // write styles
    svg.innerHTML += "\<style\>\n" +
        "\<![CDATA[\n" + 
        ".b:hover polyline{\n" + 
        "opacity:0.5;\n" +
        "}\n" + 
        "]]\>\n" + 
        "\</style\>\n";

    //////////////////////////////////////
    // create legend
    //////////////////////////////////////
    // create group
    const gridMinInt = gridMinor;
    const legInt = legend;
    const legAnchor = legInt.anchor;
    const legRef = legInt.ref;
    const gleg = addSvgEl(NULL, "g", {"pointer-events":"visible", 
        "class" : legAnchor[0]+"_" +elementId +" " +legAnchor[1] + "_"+elementId});
    gleg.onclick = (event) => legClicked(event, 0);
    gleg.ondblclick = (event) => legClicked(event, numLines);
   
    let svgLeg = NULL; // define already here
    let defsLeg  = NULL;

    if(length(legInt.names)>0 && numLines > 0 && length(x) > 0) {  
        // draw legend box (change width later)
        svgLeg = addSvgEl(gleg, "svg", {"id":"sl_"+elementId});
        defsLeg = addSvgEl(svgLeg, "defs");
  
        let nLegend = numLines; 
        let legendTmp = legInt.names;
        if(length(legendTmp) > numLines) { // cannot be more legend entries than lines
            legendTmp = legendTmp.slice(0,nLegend);  
        }             
        
        // create legend items
        for(let lnIdx = 0; lnIdx < nLegend; ++lnIdx) {
            const yOffset = lnIdx * (legendFontSize + boxSpacing)+legendFontSize /2;    
            const legItemGroup = addSvgEl(svgLeg, "g", {"id": "lgi_"+elementId+"_"+lnIdx});
      
            // legend labels
            let str = "";
            if(lnIdx < length(legendTmp)) 
                str = legendTmp[lnIdx];
            
            addSvgTxt(legItemGroup, str,2*boxSpacing+legendLineLength, yOffset+0.35*legendFontSize,legendFontSize, 
                "start", legendFont, "#000");
            // legend lines
            addSvgPolyLn(legItemGroup, "0," +yOffset + " " + (legendLineLength/2) +  "," +yOffset + 
                                       " " + legendLineLength +  "," +yOffset);
                   
        };        
    };

    const titleLines = title.split("\n");
    const subtitleLines = subtitle.split("\n");
    ///////////////////////////////
    // add title
    ///////////////////////////////
    const svgTop= addSvgEl(svg, "svg", {"id":"st_"+elementId, "overflow":"visible"});
    let hSvgTop = 0;
    if(length(title)>0) {
        for(let idx = 0; idx < length(titleLines); ++idx) {
            hSvgTop += titleFontSize + fontSpacing;
            addSvgTxt(svgTop, titleLines[idx], "50%", hSvgTop, titleFontSize);
        };
    };  
    ///////////////////////////////
    // add subtitle
    ///////////////////////////////
    if(length(subtitle)>0) {
        for(let idx = 0; idx < length(subtitleLines); ++idx) {
            hSvgTop += subTitleFontSize + fontSpacing;
            addSvgTxt(svgTop, subtitleLines[idx], "50%", hSvgTop, subTitleFontSize);
        };    
    };
    hSvgTop += fontSpacing;

    ///////////////////////////////
    // draw xlabel
    ///////////////////////////////    
    const gBottom = addSvgEl(svg, "g");
    const svgBottom = addSvgEl(gBottom, "svg", {"id":"s_btm_"+elementId, "overflow":"visible"});
    if(length(xlabel)>0) {
        const text = addSvgTxt(svgBottom, xlabel,"50%", "100%", axesLblFontSize);
        transform(text, [0, -axesLblFontSize/2])
    };

    ///////////////////////////////
    // draw ylabel
    ///////////////////////////////
    const svgLeft= addSvgEl(svg, "svg", {"id":"sy_"+elementId, "overflow":"visible"});
    if(length(ylabel)>0) { 
        const text = addSvgTxt(svgLeft, ylabel, "100%", "50%", axesLblFontSize);
        addSvgEl(NULL, text,  {"writing-mode":"vertical-rl", "transform-origin": "center"});
        transform(text, [axesLblFontSize, 0], [-1,-1])
    };

    //////////////////////////////
    // plotting area
    //////////////////////////////   
    // background SVG used for ticks and grid
    const svgBg = addSvgEl(svg, "svg", {"id":"s_bg_"+elementId, "preserveAspectRatio":NONE,
            "viewBox":"0 0 100 100"});

    const svgDraw = addSvgEl(svg, "svg", {"id":"sd_"+elementId, "preserveAspectRatio":NONE,
        "viewBox":"0 0 100 100"});
    
    svgDraw.style.cursor = "crosshair";

    let logScale = [false, false];
    let xInt = [];
    let yInt = [];
    let xLimInt = [];
    let yLimInt = [];
    let xTickInt = [];
    let yTickInt = [];
    let gridMinorSet = [];
    let tickMinorSet = [];
    let pltLim = [];
    let defsDraw = NULL;
    let plRec = NULL;

    draw();

    function draw() {
        svgDraw.innerHTML = ""; // clear
        setAttr(svgDraw, "viewBox", "0 0 100 100"); // reset viewbox

        // define markers
        defsDraw = addSvgEl(svgDraw, "defs");
        if(marker != "") {
            //"o","+", "*", ".", "x", "_", "|", "sq"
            addMarker("o", [addSvgEl(NULL, "circle", {"r":"5"})], 1);
            addMarker("+", [addSvgLn(NULL, 0, -5, 0, 5, "", "", ""), addSvgLn(NULL, -5, 0, 5, 0, "", "", "")]);
            addMarker("*", [addSvgLn(NULL, 0, -5, 0, 5, "", "", ""), addSvgLn(NULL, -5, 0, 5, 0, "", "", ""),
                                                    addSvgLn(NULL, -3.5, -3.5, 3.5, 3.5, "", "", ""), addSvgLn(NULL, -3.5, 3.5, 3.5, -3.5, "", "", "")]);
            addMarker(".", [addSvgEl(NULL, "circle", {"r":"1.5", "stroke-width":3})]);
            addMarker("x", [addSvgLn(NULL, -3.5, -3.5, 3.5, 3.5, "","",""), addSvgLn(NULL, -3.5, 3.5, 3.5, -3.5, "","","")]);
            addMarker("_", [addSvgLn(NULL, -5, 0, 5, 0, "","","")]);
            addMarker("|", [addSvgLn(NULL, 0, -5, 0, 5, "","","")]);
            addMarker("sq", [addSvgRec(NULL,-5,-5,10,10,"", "", "")], 1);
            addMarker("^", [addSvgEl(NULL, "polygon", {"points":"-5 3, 0 -5, 5 3"})], 1);
            addMarker("v", [addSvgEl(NULL, "polygon", {"points":"-5 -3, 0 5, 5 -3"})], 1);
            addMarker("tr", [addSvgEl(NULL, "polygon", {"points":"-3 -5, 5 0, -3 5"})], 1);
            addMarker("tl", [addSvgEl(NULL, "polygon", {"points":"-5 0, 3 5, 3 -5"})], 1);
        }

        logScale = [false, false];
        xInt = x;
        yInt = y;
        xLimInt = xlim;
        yLimInt = ylim;
        xTickInt = xtick;
        yTickInt = ytick;
        
        ///////////////////////////////
        // Log scale transform
        ///////////////////////////////
        if(xScale == "log") {
            xInt = x.map(log10);
            //x.forEach((value, index) => {x[index] = log10(value)});
            if(length(xLimInt) > 1) {
                xLimInt = xLimInt.map(log10);
                
                if (isNaN(xLimInt[0]) || isNaN(xLimInt[1])) {
                    xLimInt = [];
                } else {
                    xLimInt[0] =  (xLimInt[0] == -Inf) ? 0 : xLimInt[0];
                    xLimInt[1] =  (xLimInt[1] == -Inf) ? 0 : xLimInt[1];  
                };
            };
            if(length(xTickInt) > 0)
                xTickInt = xTickInt.map(log10); 

            logScale[0] = true;
        };

        if(yScale == "log") {
            yInt = y.map(log10);
            //y.forEach((value, index) => {y[index] = log10(value)});
            if(length(yLimInt) > 1) {
                yLimInt = yLimInt.map(log10);
                if (isNaN(yLimInt[0]) || isNaN(yLimInt[1])) {
                    yLimInt = [];
                } else {
                    yLimInt[0] =  (yLimInt[0] == -Inf) ? 0 : yLimInt[0];
                    yLimInt[1] =  (yLimInt[1] == -Inf) ? 0 : yLimInt[1];  
                };
            };
            
            if(length(yTickInt) > 0)
                yTickInt = yTickInt.map(log10);
            logScale[1] = true;
        };

        // define range of plot
        const xlims = setLim(xInt, xLimInt);
        const ylims = setLim(yInt, yLimInt);
        pltLim = [xlims[0], ylims[0], xlims[1]-xlims[0],ylims[1]-ylims[0]];

        ////////////////////////////
        // Draw grid and labels
        ////////////////////////////

        if(length(gridMinInt) < 1) {
            // enable minor grid by default for log axes
            gridMinorSet[0] = xScale == 'log';
            gridMinorSet[1] = yScale == 'log';
        } else {
            if(length(gridMinInt) > 1) {
                gridMinorSet[0] = gridMinInt[0];
                gridMinorSet[1] = gridMinInt[1];
            } else {
                gridMinorSet[0] = gridMinInt;
                gridMinorSet[1] = gridMinInt;
            };
        };     

        const xAutoTick = calcTick(pltLim[2], nTicksMax[0], logScale[0]);	
        const yAutoTick = calcTick(pltLim[3], nTicksMax[1], logScale[1]);
        const autoTick = [length(xTickInt) == 0, length(yTickInt) == 0];
        tickMinorSet = [(logScale[0] || gridMinorSet[0]) && autoTick[0], (logScale[1] || gridMinorSet[1]) && autoTick[1]];
        gridMinorSet = [gridMinorSet[0] && autoTick[0],gridMinorSet[1] && autoTick[1]]; // minor grid currently not supported with custom grid
        
        if(length(xLimInt) < 1) {
            if (pltLim[2]/xAutoTick >= 4) {
                // change starting points based on tick
                pltLim[0] = floor(xlims[0]/xAutoTick) * xAutoTick;
                pltLim[2] = ceil(xlims[1]/xAutoTick) * xAutoTick - pltLim[0];
            };
        };
        if(length(yLimInt) < 1) {
            if(pltLim[3]/yAutoTick >= 4) {
                // change starting points based on tick
                pltLim[1] = floor(ylims[0]/yAutoTick) * yAutoTick;
                pltLim[3] = ceil(ylims[1]/yAutoTick) * yAutoTick - pltLim[1];                
            };
        };
        
        axLblBb = createGrid(pltLim);

        //////////////////////////////
        // create polylines
        //////////////////////////////
        let numPtPerLine = length(y) / numLines;
        let varX = length(x) == length(y);
        if(!varX && (numPtPerLine != length(x)))
            throw new Error("Dimension must agree");

        const gp = addSvgEl(svgDraw, "g", {"id":"gp_"+elementId });
        for(let lnIdx = 0; lnIdx < numLines; ++lnIdx) {
            const colorIdx = lnIdx % length(colorMapRGB);
            const dashStyle = isArray(style) ? style[lnIdx] : style;
            const markerStyle = "url(#m" + (isArray(marker) ? marker[lnIdx] : marker) +"_"+elementId+ ")";  
            const colorStr = isArray(color) ? ((lnIdx < length(color)) ? color[lnIdx] : "") : color;
            const colorSel = (colorStr == "") ?  colorMapRGB[colorIdx] : colorStr;

            let dashStr = "";
            let strokeWidth = 2;
            switch(dashStyle) {            
                case ":":
                    dashStr = "2 3";
                    break;
                case "--":
                    dashStr = "12 6";
                    break;
                case "-.":
                    dashStr = "0 1.5 9 3 3 2.5";
                    break;
                case "*":
                    strokeWidth = 0;
            };
            const hideLn = svgLeg != NULL && svgLeg.childNodes[lnIdx+1].style.opacity == 0.3;         
            const polyGrp = addSvgEl(gp, "g", {"id": "pl_" +elementId+"_"+lnIdx});
            polyGrp.style.display = (hideLn) ? NONE : "block";
            let poly = NULL;
            //poly.setAttribute("shape-rendering","optimizeSpeed ");
            if(svgLeg!=NULL) {
                const markerStyle = "url(#ml" + (isArray(marker) ? marker[lnIdx] : marker) +"_"+elementId+ ")";  
                addSvgEl(NULL, svgLeg.childNodes[lnIdx+1].childNodes[1], {"stroke-dasharray": dashStr,
                    "marker-mid":markerStyle, "stroke-width":strokeWidth, "stroke": colorSel});
            };

            for(let ptIdx = 0; ptIdx < numPtPerLine; ++ptIdx) {
                const ptx = varX ? xInt[lnIdx*numPtPerLine  + ptIdx] : xInt[ptIdx];
                const pty = yInt[lnIdx*numPtPerLine  + ptIdx];
                const point = svgDraw.createSVGPoint();

                if (!isFinite(ptx) || !isFinite(pty)) {
                    poly = NULL; // interrupt line
                    continue;
                }

                if(poly == NULL) {
                    poly = addSvgPolyLn(polyGrp, "", colorSel, dashStr, strokeWidth);
                    addSvgEl(NULL, poly, {"marker-start":markerStyle, "marker-mid":markerStyle, "marker-end":markerStyle, 
                        "stroke-width":strokeWidth});
                }                
                
                point.x = 100*(ptx-pltLim[0])/ pltLim[2];
                point.y = 100-100*(pty-pltLim[1]) / pltLim[3];
                poly.points.appendItem(point);
                
            };                
        };
        plRec = addSvgRec(svgDraw, 0, 0, "100%", "100%", NONE, "#000");
        addSvgEl(NULL, plRec, {"id":"plr_"+elementId,"pointer-events": "visible"});
        plRec.onclick = (event) => plotClicked(event);
    };
    //////////////////////////////
    // create drawing area and resize elements
    //////////////////////////////
    let xSvgleft = 0;
    let ySvgBottom = 0;
    let ySvgtop = 0;
    let legBB = NULL;
    let recleg = NULL;
    const wSvgLeft = axLblBb[1][2] + 0.5*axesLblFontSize + 1.5*axesLblFontSize*(length(ylabel)>0) + fontSpacing;
    const hSvgBtm = axLblBb[0][3] + fontSpacing + (1.5*axesLblFontSize+fontSpacing)*(length(xlabel)>0);   
    const hSvgDraw = svgSz[3] - hSvgBtm - hSvgTop; 
    const wSvgDraw = svgSz[2] - wSvgLeft - 2*axesLblFontSize;
    const pltAr = [wSvgLeft, hSvgTop, wSvgDraw, hSvgDraw];
    const gBottomShift = -svgSz[3] + pltAr[1] + pltAr[3];    
    //const wLegendMargin = 1 + 2*legInt.boxed*boxSpacing + 2*legInt.x; //legInside ? 2*boxSpacing : 0;
    const hLegendMargin = 1 + 2*legInt.boxed*boxSpacing + 2*legInt.y; //legInside ? 2*boxSpacing : 0;

    if (svgLeg != NULL) {
        legBB = addToAnchor(gleg, legInt);

        const maxLegendHeight = hSvgDraw - hLegendMargin;
        const truncH =  (legBB[3] > maxLegendHeight);
        const wSvgLeg = (legBB[2] > maxLegendWidth) ? maxLegendWidth : legBB[2];
        const hSvgLeg = truncH ? maxLegendHeight : legBB[3];

        addSvgEl(NULL, svgLeg, {"width":wSvgLeg, "height": hSvgLeg,
            "viewBox": "0 0 " + wSvgLeg + " " + hSvgLeg});
        recleg = gleg.childNodes[0];
        recleg.height.baseVal.value = hSvgLeg + 2*(legInt.boxed&&truncH)*boxSpacing;
        if (legRef[0] == "out") {
            if(legAnchor[0] == "left") {
                pltAr[0] += legBB[0]+legBB[2]+boxSpacing;
                xSvgleft += legBB[0]+legBB[2]+boxSpacing;
            } else {
                pltAr[2] = legBB[0]-wSvgLeft - boxSpacing;
            };
        };

        if (legRef[1] == "out") {
            pltAr[3] -= legBB[3];
            
            if(legAnchor[1] == "top") {
                pltAr[1] += legBB[3];
                ySvgtop += legBB[3];
            } else
                ySvgBottom -= legBB[3];
        };
    };

    add.forEach(el => addToAnchor (el.group, el));

    setSize(svgBg, pltAr);
    setSize(svgDraw, pltAr);
    setSize(svgLeft, [xSvgleft, pltAr[1],wSvgLeft,pltAr[3]]);
    setSize(svgBottom, [0, svgSz[3]+ySvgBottom,pltAr[2],hSvgBtm]);
    setSize(svgTop, [pltAr[0], ySvgtop,pltAr[2],hSvgTop]);
    transform(gBottom, [pltAr[0], gBottomShift ]);

    const padding = [svgSz[2]-pltAr[2], svgSz[3]-pltAr[3]];

    ////////////////////////////
    // toolbar
    ////////////////////////////
    const btnGrp = addSvgEl(svgTop, "g", {"id":"b_"+elementId, "cursor": "pointer",});
    transform(btnGrp, [0, pltAr[1]]);
    // draw download button
    const downloadBtn = addSvgEl(btnGrp, "g", {
        "stroke-width":2,"stroke-linecap":"round", "stroke-linejoin":"round","class":"b right_"+elementId, "pointer-events": "visible"});
    transform(downloadBtn, [pltAr[2]-18, -24]);
    addSvgPolyLn(downloadBtn, "8,0 8,16 2,9 8,16 14,9");
    addSvgPolyLn(downloadBtn, "0,17 0,20 16,20 16,17");
    addSvgRec(downloadBtn, 0, 0, 21, 21); // invisible rectangle for click event
    downloadBtn.onclick = () => {downloadSvg()};
    // add custom buttons
    let btnXOffset = 0;
    buttons.forEach(button => addToggleButton(button));

    // add event callbacks
    svg.oncontextmenu = event => event.preventDefault(); // prevent context menu during zoom
    svgDraw.onmousedown = event => plotMouseDown(event);
    svgDraw.ondblclick = () => setAxesLim(pltLim);
    svg.onmousedown = event => event.preventDefault(); // prevent context menu during zoom
    svg.onmouseup = () => plotZoom();
   
    if(length(legInt.names) > 0)
        gleg.onwheel = event => scrollLegend(event)
   
    new ResizeObserver(() => resizeSvg()).observe(svg);
    resizeSvg(); // execute once for proper scaling of several elements


    function addToAnchor (group, el) {
        addSvgEl(svg, group); // add already here to calculate BBox
        let bb = getBb(group);
        let x = el.x;
        let y = el.y;
        let anchor = el.anchor;
     
        if(el.boxed||e.fill!=NONE) {
            x += boxSpacing;
            y += boxSpacing;
            const stroke = el.boxed ? "#000" : NONE;
            const rect = addSvgRec(NULL, -boxSpacing + bb[0], -boxSpacing + bb[1],
                bb[2]+2*boxSpacing, bb[3]+2*boxSpacing, el.fill, stroke, 1);
            group.insertBefore(rect, group.firstChild);
        };
        
        if (el.ref[0] == "in")
            x = (anchor[0] == "right") ? pltAr[0] + pltAr[2] -x - bb[2] : x+pltAr[0];
        else
            x = (anchor[0] == "right") ? svgSz[2] -x - bb[2] : x;
        if (el.ref[1] == "in")
            y = (anchor[1] == "bottom") ? pltAr[1] +pltAr[3] -y - bb[3] : y+pltAr[1];
        else           
            y = (anchor[1] == "bottom") ? svgSz[3] -y - bb[3] : y;

        x -= bb[0]-0.5;
        y -= bb[1]-0.5;
        setAttr(group, "class", anchor[0]+"_" +elementId +" " +anchor[1] + "_"+elementId);
        transform(group, [x,y]);  
       
        bb = getBb(group);
        bb[0] += x;
        bb[1] += y; 
        return bb;    
    }

    function setLim(vals, lim) {
        if(length(lim) < 2) {
            let len = length(vals);
            let max = -Inf;
            let min = Inf;
            while (len--) {
                if(isFinite(vals[len])) {
                    min = (vals[len] < min) ? vals[len] : min;
                    max = (vals[len] > max) ? vals[len] : max;
                };
            };    
            lim = [min, max]; 
        };
        if(lim[0] == lim[1]) {
            lim[0] = lim[0] - 0.5;
            lim[1] = lim[1] + 0.5;
        };
        return lim;
    };

    function addToggleButton(button) {
        const tglBtn = addSvgEl(btnGrp, "g", {"pointer-events": "visible"});
        const hover = addSvgEl(tglBtn, "title");        
        const rec = addSvgRec(tglBtn, 0, -14, 0, 18, NONE);  // invisible rectangle for click event
        //addSvgRec(logBtn, 0, -14, 36, 18, NONE, "#73AFD7", 2.5, 3);  // invisible rectangle for click event
        const lbl = addSvgTxt(tglBtn, button.text, 3,-1,12, "start", defaultFont, "grey");
        const bbw = getBb(lbl)[2] + 6;
        let isClicked = eval(button.init);
        hover.append(doc.createTextNode(button.hover));   
        
        addSvgEl(NULL, rec, {"width": bbw, "rx":3});
        changeStatus(isClicked);
        transform(tglBtn, [btnXOffset, -8]);
        tglBtn.onclick = () => {
            isClicked = !isClicked;
            changeStatus(isClicked);
            if(button.callback != NULL) {
                attrs = button.callback(isClicked);
                for (let val in attrs) 
                    eval(val+"=" + attrs[val]);
            };
            if(button.redraw) {
                draw();resizeSvg();
            };
        };

        function changeStatus(clicked) {
            addSvgEl(NULL, rec, {"stroke":(clicked) ? "#73AFD7" : "#A0A0A0", 
                "stroke-width":(clicked) ? 2.5 : 1.5});
            setAttr(lbl, "fill", (clicked)? "#000" : "grey");
        }
        btnXOffset += bbw + 5;
        return tglBtn;
    }

    function addMarker(id, elements, addSolid=0) {
        //"o","+", "*", ".", "x", "_", "|", "sq"
        const marker = addSvgEl(defsDraw, "marker", {"id":"m"+id+"_"+elementId,
            "markerWidth":"10", "markerHeight":"10", "refX":"5", "refY":"5",
            "markerUnits":"userSpaceOnUse", "fill":NONE,"stroke":"context-stroke"});
        const markerGrp = addSvgEl(marker, "g", {
            "stroke-width":1.5,"vector-effect":"non-scaling-stroke",
            "class":"marker_" + elementId});
        transform(markerGrp, [5,5], [1,1]);
    
        elements.forEach(element => addSvgEl(markerGrp, element));
    
        // copy to legend
        const markerClone = addSvgEl(defsLeg, marker.cloneNode(true), {"id":"ml"+id+"_"+elementId});
        setAttr(markerClone.childNodes[0], "class", "");

        // copy but fill
        if(addSolid) addSvgEl(defsDraw, marker.cloneNode(true), {"id":"mf"+id+"_"+elementId, "fill":"context-stroke"});
    };

    function downloadSvg() {
        btnGrp.style.display = NONE; // hide button for screenshot
        svgDraw.style.cursor = "auto"; // change cursor style over plot area to avoid confusion that this is a screenshot
        const svgSz = size(svg); // get current size of svg
        const outerStr = "\<svg width=\"" + svgSz[2] + "\" height=\""+svgSz[3]+"\" xmlns=\""+ns+"\"\>";
        const svgBlob = new Blob([outerStr, svg.innerHTML, "\</svg\>"], {type:"image/svg+xml;charset=utf-8"});
        const svgUrl = URL.createObjectURL(svgBlob);
        const downloadLink = doc.createElement("a");
        downloadLink.href = svgUrl;
        downloadLink.download = "snapshot_"+title +".svg";
        addSvgEl(doc.body, downloadLink)
        downloadLink.click();
        downloadLink.remove();
        //doc.body.removeChild(downloadLink);
        btnGrp.style.display = "block";
        svgDraw.style.cursor = "crosshair";
    };

    function setVisibility(elementId, lnIdx, visible = 0) {
        const datatips = getEl("gpl_" +elementId+"_"+lnIdx); // datatip group

        const str =(visible) ? "block" : NONE;        
        getEl("pl_"+elementId+"_"+lnIdx).style.display = str;              
        getEl("lgi_"+elementId+"_"+lnIdx).style.opacity = 0.3+0.7*visible;
        if(datatips!=NULL) datatips.style.display = str;
    }

    function legClicked(event, numLines) {
     
        //const svgLeg = getEl("sl_"+elementId); //event.srcElement.ownerSVGElement;
        const offsetY = gleg.transform.baseVal[0].matrix.f;
        const legY = event.offsetY-offsetY+view(svgLeg)[1]; // y position inside plotting area
        const lnIdx = floor(legY / (legendFontSize+boxSpacing));
        const clkLn = getEl("pl_"+elementId+"_"+lnIdx);
        if(clkLn == NULL)
            return;

        const visible = clkLn.style.display != NONE;   
    
        // else
        const startIdx = (numLines == 0) ? lnIdx : 0;
        const endIdx = (numLines == 0) ? lnIdx+1 : numLines;
        for(let idx = startIdx; idx < endIdx; ++idx) {  
            if (!visible) { // make all visible again
                setVisibility(elementId, idx, 1);
            } else  if(idx != lnIdx || numLines == 0)  { // only keep selected one visible
                setVisibility(elementId, idx);
            };
        };
    };

    function resizeSvg() {
        const parentSz = size(svg); // current size of top svg
        const childSz = size(svgDraw); // current size of current plot area
        const newChildWidth = parentSz[2]-padding[0];
        const newChildHeight = parentSz[3]-padding[1];
        const rightAnchorEl = getClassMember("right");
        const bottomAnchorEl =getClassMember("bottom");

        if(childSz[2] != newChildWidth) {
            setAttr(svgDraw, "width", newChildWidth); 
            setAttr(svgBg, "width", newChildWidth);            
            setAttr(svgTop, "width", newChildWidth);    
            setAttr(svgBottom, "width", newChildWidth); 
            for (let el of rightAnchorEl) 
                el.transform.baseVal[0].matrix.e += newChildWidth - childSz[2];  
        }
        if(childSz[3] != newChildHeight) {
            setAttr(svgDraw, "height",  newChildHeight);
            setAttr(svgBg, "height", newChildHeight);    
            setAttr(svgLeft, "height", newChildHeight); 
            svgBottom.y.baseVal.value +=  newChildHeight - childSz[3];
            for (let el of bottomAnchorEl) 
                el.transform.baseVal[0].matrix.f += newChildHeight - childSz[3];  
            if(svgLeg!=NULL) {
                let newLegHeight = newChildHeight -hLegendMargin;
                let trunc = (newLegHeight < legBB[3]);
                newLegHeight = trunc ? newLegHeight : legBB[3];
                setAttr(svgLeg, "height", newLegHeight);
                svgLeg.viewBox.baseVal.height = newLegHeight;
                recleg.height.baseVal.value = newLegHeight+ 2*(legInt.boxed&&trunc)*boxSpacing;
            }
        }
        // update datatip location which refers to top SVG and not scaled with drawing SVG
        updateMarkerPos();
    };

    function scrollLegend(event){
        
        const legSz = size(svgLeg);
        const svgLegVw = view(svgLeg);   
        const minScroll = 0;
        const maxScroll = legBB[3] - legSz[3];
        svgLegVw[1] +=  event.deltaY;
    
        if(svgLegVw[1] < minScroll)
            svgLegVw[1] = minScroll;
        if(svgLegVw[1] > maxScroll)
            svgLegVw[1] = maxScroll;
    
        svgLeg.viewBox.baseVal.y = svgLegVw[1];
        //recleg.y.baseVal.value = svgLegVw[1];
        return false;
    };

    // converts plot coordiantes back to data source
    function convertCoord(point, pltLim, logScale) {
        let x = point[0] / 100 * pltLim[2] + pltLim[0];
        let y = (1-point[1] / 100) * pltLim[3] + pltLim[1];
    
        x = (logScale[0]) ? (10**x) : x;
        y = (logScale[1]) ? (10**y) : y;
    
        return [x,y];
    }

    // find a nearest line within 'proximity'
    function getNearestLine(elementId, Cx, Cy, dx, dy) {
        let closestEl = NULL;
        let closestDist = Inf;
        let closestXproj = 0;
        let closestYproj = 0;

        const polylines = getEl("gp_"+elementId);
        const nLines = length(polylines.children);

        for(let idx = 0; idx < nLines; ++idx) {
            const line = polylines.children[idx];
            const nSeg = length(line.children);
            for(let segidx = 0; segidx < nSeg; ++segidx) {
                const seg = line.children[segidx];
                const pts = seg.points;
                const nPts = length(pts);
                if( line.style.display == NONE) // dont consider hidden lines
                    continue;
                for(let idxPt = 1; idxPt < nPts;++idxPt) {
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
                    closestEl = line;
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
                    } else if(linTip && getAttr(seg, "stroke-width")!= 0) {
                        closestXproj = xproj;
                        closestYproj = yproj;
                    } else {
                        closestEl = NULL;
                    };          
                };
            };
        };
        return {"ele": closestEl, "x":closestXproj, "y":closestYproj};
    }

    function plotClicked(event) {
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
        if(closestEl == NULL)
            return;    
       
        const intX = result.x;
        const intY = result.y;
        //const topX = (intX-vBx)/scaleX + drawX;
        //const topY = (intY-vBy)/scaleY + drawY;
    
        const prefix = "pl_" + elementId;
        const lnId = closestEl.id;
        const lnIdx = lnId.slice(length(prefix), length(lnId)); // substring includes "_"
        const legendItem = getEl("lgi_"+elementId+lnIdx);
        const plotLine = closestEl.childNodes[0];//getEl("pl_"+elementId+lnIdx);
        const lineColor = getAttr(plotLine, "stroke");
        const sourceCoord = convertCoord([intX, intY], pltLim, logScale);
        let gl = getEl("gpl_" +elementId+lnIdx);
        if(gl == NULL)  // create group for all datatips on the same line (to be used in case line vibility is toggled)
            gl = addSvgEl(svgDraw, "g", {"id":"gpl_" + elementId+lnIdx});
        
        const datatip = addSvgEl(gl, "g", {"class":"marker_"+elementId});
        const lbl = addSvgEl(datatip, "g");        
        const rect = addSvgRec(lbl, 0, -33, 1, 33, lineColor, "#DFDFDF", 1, rx=4);
        transform(datatip, [intX,intY], [scaleX, scaleY]);
        
        datatip.onclick = (event) => {
            if(event.ctrlKey)
                setLblPos(1);
            else {
                datatip.remove();
                if(event.detail > 1)  setAxesLim(pltLim);// double click
            }
        };   
        
        if(legendItem != NULL) {
            text = addSvgTxt(lbl, legendItem.textContent, 2, -35, 12, "start", defaultFont, "#fff" ); 
            addSvgEl(NULL, text, {"font-weight":"bold"});
            addSvgEl(NULL, rect, {"y":-48, "height":48});
        }

        addSvgTxt(lbl, "x: " + num2eng([sourceCoord[0]]), 2, -19, 12, "start", defaultFont, "#fff");
        addSvgTxt(lbl, "y: " + num2eng([sourceCoord[1]]), 2, -5, 12, "start", defaultFont, "#fff");    
                
        const bbox = getBb(datatip);
        bbox[2] += 4;
        addSvgEl(NULL, rect, {"width": bbox[2]});
        if(legendItem != NULL)
            addSvgLn(lbl, 0, -31,  bbox[2],-31, "#fff");
        const lblLn = addSvgLn(datatip, 0, 0,  6,-6);

        // check if label fits in drawing area
        const bbcr =lbl.getBoundingClientRect();
        let x = (bbcr.right+5+mainDiv.offsetLeft > drawSz[0]+drawSz[2]); // can be changed by click event
        let y = (bbcr.y-5-mainDiv.offsetTop < drawSz[1]); // can be changed by click event
        setLblPos(false);

        function setLblPos(rotate) { // x==0 is right, y==0 is down
            let shiftLblX =  5;
            let shiftLblY =  -5;
            let scaleLnX =  1;
            let scaleLnY =  1; 

            if(rotate)
                [x,y] = [!y, x];

            if(x) {
                shiftLblX =  -bbox[2]-5;
                scaleLnX =  -1;
            };
            if(y){
                shiftLblY =  bbox[3]+5;
                scaleLnY =  -1;
            };
            transform(lbl, [shiftLblX,shiftLblY]);
            transform(lblLn, NULL, [scaleLnX,scaleLnY]);
        };

        addSvgRec(datatip, -2, -2, 4, 4, "#000");
        // add invisble circle to  capture clicks
        addSvgEl(datatip, "circle", {"r":dSnap, "fill":NONE, "pointer-events": "visible"});
    };

    function updateMarkerPos() {
        const datatips = getClassMember("marker");
        // update datatip location which refers to top SVG and not scaled with drawing SVG
        for(let idx = 0; idx<length(datatips); ++idx) {
            const svgSz = size(svgDraw);
            const svgVw = view(svgDraw)
            const scaleX = svgVw[2]/svgSz[2];
            const scaleY = svgVw[3]/svgSz[3];
    
            datatips[idx].transform.baseVal[1].matrix.a = scaleX; 
            datatips[idx].transform.baseVal[1].matrix.d = scaleY; 
        }    
    };

    function setAxesLim(lim){
        const shiftX = 100*(lim[0]-pltLim[0]) /  pltLim[2];
        const shiftY = 100*(pltLim[1]+pltLim[3]-lim[1] - lim[3]) /  pltLim[3];
        svgDraw.viewBox.baseVal.width = 100* lim[2] / pltLim[2];
        svgDraw.viewBox.baseVal.height = 100* lim[3] / pltLim[3];
        svgDraw.viewBox.baseVal.x = shiftX;
        svgDraw.viewBox.baseVal.y = shiftY;
    
        // shift plot-area rectangle to new viewbox
        addSvgEl(NULL, plRec, {"x":shiftX, "y":shiftY});        

        createGrid(lim);
        updateMarkerPos();
    };

    function plotZoom() {
        const rectZoom = getEl("zoom_rect"+elementId);
        svgDraw.style.cursor = "crosshair";
        svg.onmousemove = NULL; // disable move event to aovid unnessary callbacks
        if(rectZoom == NULL)
            return;
    
        const isPan = getAttr(rectZoom,"fill-opacity") == 0;
        const rec = size(rectZoom);
        rectZoom.remove();
        if(~isPan && (rec[2] == 0 || rec[3] == 0))
            return;
    
        const vb = view(svgDraw);
    
        const pltAr = size(svgDraw);
        let recRel = [];
        if(isPan)
            recRel =  [-rec[2]/ pltAr[2], rec[3]/ pltAr[3], 1,1];
        else
            recRel =  [(rec[0] - pltAr[0]) / pltAr[2], 1-(rec[1]+rec[3] - pltAr[1])/pltAr[3], rec[2]/pltAr[2], rec[3]/pltAr[3]];
    
        const clim = [pltLim[0] + pltLim[2]*vb[0]/100, pltLim[1] + pltLim[3]*(100-vb[3]-vb[1])/100, pltLim[2]*vb[2]/100, pltLim[3]*vb[3]/100];
        const nlim = [clim[0] + recRel[0]*clim[2], clim[1] + recRel[1]*clim[3], recRel[2]*clim[2], recRel[3]*clim[3]];
    
        setAxesLim(nlim);
    };
    
   
    function createGrid(lim){ 
        const tickOvr = [xTickInt, yTickInt];
        const ticklbl = [xticklbl, yticklbl];
        const tickangle = [xtickangle, ytickangle];
        const bb = [0,0];
        // remove old grid before creating a new one
        const gridEl = getClassMember("cg");
   
        while (length(gridEl) > 0) gridEl[0].remove(); 

        for(let axIdx = 0; axIdx<2;++axIdx)  {
            const svgAx = (axIdx) ? svgLeft : svgBottom; 
            const lblGrp = addSvgEl(svgAx, "g", {"id":"ga"+svgAx+"_" +elementId});
            const tick = calcTick(lim[2+axIdx], nTicksMax[axIdx], logScale[axIdx]);
            const max = lim[axIdx]+lim[2+axIdx];
            // next major ticks
            const minTick = (ceil(lim[axIdx]/tick)-1); // -1 to draw extend the minor grid
            const maxTick = (floor(max/tick));
    
            // actual number of ticks       
            const isManTick = (length(tickOvr[axIdx]) > 0);     
            const ticks = isManTick ? tickOvr[axIdx] : linspace(minTick,1,maxTick).map((x) => x*tick);
            const tickLabel = (length(ticklbl[axIdx]) > 0) ? ticklbl[axIdx] : (logScale[axIdx] ? num2eng(ticks.map((x) => 10 ** x)) : num2eng(ticks));
            // draw ticks, labels and grid lines
            const dTick = 100 * tick/lim[2+axIdx]; 
    
            // axis labels and grid
            const defsBg =  addSvgEl(svgBg, "defs", {"class":"cg_" +elementId});
            const defsg =  addSvgEl(defsBg, "g", {"id": "mg" + axIdx + "_" + elementId});
            const isLogTick = logScale[axIdx] && tick == 1;
            const nMinorTicks = (tickMinorSet[axIdx]) ?  nMinorTicksMax[axIdx]  / (2-isLogTick) : 1;
            const minorTickPos = linspace(10/nMinorTicks, 10/nMinorTicks, 10);
     
            if(nMinorTicks>1) {              
                if(logScale[axIdx] && tick == 1)                 
                    minorTickPos.forEach((value, index) => {minorTickPos[index] = 10*log10(minorTickPos[index])});
                for(let idx = 0; idx < length(minorTickPos)-1; ++idx)
                    addTickLines(defsg, minorTickPos[idx]/10 * dTick * (1-2*axIdx), axIdx, minorTickLength, "2 4", gridMinorSet[axIdx]);
            };
            
            addTickLines(defsg, 0, axIdx, tickLength, "", grid);
            let defaultAngle = tickangle[axIdx];
            defaultAngle -= (axIdx) ? 90 : 0;
            defaultAngle = defaultAngle % 180;

             // calculates the coordiantes of the ticks based on values 
            const pos = ticks.map( x => 100*(x - lim[axIdx]) /  lim[2+axIdx]);
            const textAnchor = (defaultAngle < -11) ? "end" :  ((defaultAngle > 11) ? "start" : "middle");
            
            for(let idx = 0; idx < length(ticks); ++idx) {
                //const tickPos =  tickOffset + dTick * idx; 
                const tickPos = (axIdx >0) ? 100-pos[idx] : pos[idx];
                const c = (axIdx) ? [0,tickPos] : [tickPos, 0];
                const tc = (axIdx) ? ["100%",tickPos+"%"] : 
                    [tickPos+"%", fontSpacing + axesLblFontSize*0.5*(textAnchor=="middle")];
                let textEl = NULL; 
                //size(svgAx)[2] - axesLblFontSize*0.5
                if(pos[idx] >= 0 && (idx > 0 || tickOvr)) {
                    textEl = addSvgTxt(lblGrp, tickLabel[idx], tc[0], tc[1], axesLblFontSize, textAnchor);    
                    addSvgEl(NULL,textEl,{"dominant-baseline":"central", "class":"cg_" +elementId,
                        "transform":"translate(-" + axesLblFontSize*0.5*axIdx + " 0) rotate(" + tickangle[axIdx] + ")", 
                        "transform-origin": tc[0] + " "+  tc[1]
                    });
                }
                
                addSvgEl(svgBg, "use", {"href":"#mg" + axIdx + "_"+elementId, "x":c[0], "y":c[1], 
                    "class":"cg_" +elementId});
            };
            bb[axIdx] = getBb(lblGrp);
        };   
        return bb;
    };

   
    // calculates the space between ticks
    function calcTick(range, nTicks, logScale) {
        let tick = range/nTicks;		
        // round to next decade
        const exponent = floor(log10(tick));
        const mantissa = ceil(tick/(10**exponent));
        const normTickIdx=normTicks.findIndex(number => number >= mantissa);
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
    };

    function addTickLines(parent, offset, axIdx, tickLength, dash, gridEnbl){
        let x = [offset, 0, 0, tickLength, offset, 100];
        if(axIdx>0) x = [x[1],x[0],x[3],x[2],x[5],x[4]];  // swap x,y 
        if(gridEnbl) addSvgLn(parent, x[0], x[1], x[4], x[5], "#DFDFDF", dash);
        const startTick = addSvgLn(parent, 0,0, x[2], x[3]);
        const endTick = addSvgLn(parent, -x[2], -x[3], 0, 0);
        transform(startTick, [x[0],x[1]], [1, 1]);
        transform(endTick, [x[4],x[5]], [1, 1]);
        addSvgEl(NULL, startTick, {"class":"marker_" + elementId}); // reuse "marker" class to gete automatic resizing
        addSvgEl(NULL, endTick, { "class":"marker_" + elementId}); // reuse "marker" class to gete automatic resizing
            
    };

    function plotMouseDown(event) {
        let isPan = 0;
        if(event.button == panButton || (event.button == zoomButton && event.ctrlKey))
            isPan = 1;
        else if (event.button != zoomButton)
            return;
    
        svgDraw.style.cursor = isPan ? "move" : "zoom-in";
        // else start zoom
        const x = event.offsetX;
        const y = event.offsetY;
        const rect = addSvgRec(svg, x, y, 0, 0, "#000");
        const opacity = isPan ? 0 : 0.3; // dont show rectangle during pan
        addSvgEl(NULL, rect, {"id":"zoom_rect"+elementId, "fill-opacity":opacity});
        svg.onmousemove = (eventNew) => plotDrawZoom(eventNew, x, y);
    };

    function plotDrawZoom(event, x0, y0) {  
        const rectZoom = getEl("zoom_rect"+elementId);
        const x = event.offsetX;
        const y = event.offsetY;
        const newW = x - x0;
        const newH = y - y0;
        const isPan = getAttr(rectZoom,"fill-opacity") == 0;
        if(isPan || newW >= 0)
            setAttr(rectZoom, "width", newW);
        else
            addSvgEl(NULL, rectZoom, {"width": -newW, "x":x});

        if(isPan || newH >= 0)
            setAttr(rectZoom, "height", newH);
        else
            addSvgEl(NULL, rectZoom, {"height": -newH, "y":y});
    };

    function linspace(start, increment, stop) {
        // due to rounding errros it can happen numel is to small
        let numel = floor((stop-start)/increment*(1+1e-12))+1;
        
        out = array(numel);    
        for(let idx=0; idx < numel; ++idx)
            out[idx] = start + increment*idx;

        return out;
    };

    function num2eng(val) {
        const unitList = ['y', 'z', 'a', 'f', 'p', 'n', 'u', 'm', '', 'k', 'M', 'G', 'T', 'P', 'E', 'Z', 'Y'];
        const zeroIndex = 8;
        const out = array(length(val));
        const nVal = length(val);
        const nUnits = length(unitList);
    
        for(let idx = 0; idx < nVal; ++idx) {
            
            const nn = val[idx].toExponential(5).split(/e/);
            let u = floor(+nn[1] / 3) + zeroIndex;
            if (u > nUnits - 1)
                u = nUnits - 1;
            else if (u < 0) 
                u = 0;
    
            out[idx] =  round((nn[0] * (10 ** ( +nn[1] - (u - zeroIndex) * 3)))*1000)/1000 + unitList[u];
        };
        return out;
    };

};

};