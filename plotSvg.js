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
const legendFont = "Lucida Sans Typewriter";
const legendLineLength = 30; // number of pixels for the line length in the legend
const legendXSpacing = 4; // number of pixels between legend box, line and text
const legendYSpacing = 4; // number of pixels between two entries
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
const isArray = Array.isArray;
const Inf = Infinity;
const doc =document;

function plotSvg(elementId, x, y, numLines, 
{color = "", title = "", subtitle = "", xlabel = "", ylabel="", xlim=[], ylim=[], 
    style="-", marker="", legend = [], xScale = "lin", yScale = "lin", grid = true, 
    gridMinor = [], xtick = [], ytick = [], xticklbl=[], yticklbl=[], 
    xtickangle = 0, ytickangle = 0,legendLocation = 'northeastoutside', linTip = true 
}={}
)
{    
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
        "text.cll {\n" + 
        "font-size:"+legendFontSize+"px;\n" + 
        "fill:black;\n" + 
        "dominant-baseline:central;\n" + 
        "font-family:"+legendFont+";\n" + 
        "}\n" + 
        ".b:hover polyline{\n" + 
        "opacity:0.5;\n" +
        "}\n" + 
        "]]\>\n" + 
        "\</style\>\n";

    //////////////////////////////////////
    // create legend
    //////////////////////////////////////
    // create group
    const gleg = addSvgEl(null, "g", {"pointer-events":"visible"});
    gleg.onclick = (event) => legClicked(event, 0);
    gleg.ondblclick = (event) => legClicked(event, numLines);
   

    let legFill = (legendLocation == 'northeast') ? "white" : "none";
    let svgLeg = null; // define already here
    let recleg  = null;
    let defsLeg  = null;
    let hSvgLeg = 0;
    let wSvgLeg = 0;
    if(length(legend)>0 && numLines > 0 && length(x) > 0) {  
        // draw legend box (change width later)
        svgLeg = addSvgEl(gleg, "svg", {"id":"sl_"+elementId});
        defsLeg = addSvgEl(svgLeg, "defs");
        // add legend already here to calculate width
        // will be moved again at the end of the function 
        addSvgEl(svg,gleg);             

        let nLegend = numLines; 
        let legendTmp = legend;
        if(length(legend) > numLines) { // cannot be more legend entries than lines
            legendTmp = legend.slice(0,nLegend);  
        }             
        
        // draw legend box (change width later)       
        recleg = addSvgRec(svgLeg, 0, 0, 0, "100%", legFill, "black");
        addSvgEl(null, recleg, {"id":"rect_leg_"+elementId});
        // create legend items
        for(let lnIdx = 0; lnIdx < nLegend; ++lnIdx) {
            const yOffset = lnIdx * (legendFontSize + legendYSpacing) +  legendYSpacing;    
            const legItemGroup = new addSvgEl(svgLeg, "g", {"id": "lgi_"+elementId+"_"+lnIdx});
      
            // legend labels
            const textEl = addSvgEl(legItemGroup, "text", {"id": "lti_"+elementId+"_"+lnIdx, "class":"cll", 
                "x":legendXSpacing+legendLineLength+legendXSpacing, "y":yOffset+legendFontSize/2});
            // legend lines
            const y0 = yOffset+legendFontSize/2;
            addSvgPolyLn(legItemGroup, legendXSpacing +  "," +y0 + " " + (legendXSpacing+legendLineLength/2) +  "," +y0 + 
                                        " " + (legendXSpacing+legendLineLength) +  "," +y0);
            //setAttr(lli, "id", "lli_"+elementId+"_"+lnIdx);
            let str = "";
            if(lnIdx < length(legendTmp)) {
                str = legendTmp[lnIdx];
            };
            textEl.append(doc.createTextNode(str));              
        };
        const bbox = gleg.getBBox();
        hSvgLeg = (legendFontSize+legendYSpacing)*nLegend + legendYSpacing;
        wSvgLeg = bbox.width + 2*legendXSpacing;
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
        addSvgEl(null, text,  {"writing-mode":"vertical-rl", "transform-origin": "center"});
        transform(text, [axesLblFontSize, 0], [-1,-1])
    };

    //////////////////////////////
    // plotting area
    //////////////////////////////   
    // background SVG used for ticks and grid
    const svgBg = addSvgEl(svg, "svg", {"id":"s_bg_"+elementId, "preserveAspectRatio":"none",
            "viewBox":"0 0 100 100"});

    const svgDraw = addSvgEl(svg, "svg", {"id":"sd_"+elementId, "preserveAspectRatio":"none",
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
    let defsDraw = null;
    let plRec = null;

    draw();

    function draw() {
        svgDraw.innerHTML = "";

        // define markers
        defsDraw = addSvgEl(svgDraw, "defs");
        if(marker != "") {
            //"o","+", "*", ".", "x", "_", "|", "sq"
            addMarker("o", [addSvgEl(null, "circle", {"r":"5"})], 1);
            addMarker("+", [addSvgLn(null, 0, -5, 0, 5, "", "", ""), addSvgLn(null, -5, 0, 5, 0, "", "", "")]);
            addMarker("*", [addSvgLn(null, 0, -5, 0, 5, "", "", ""), addSvgLn(null, -5, 0, 5, 0, "", "", ""),
                                                    addSvgLn(null, -3.5, -3.5, 3.5, 3.5, "", "", ""), addSvgLn(null, -3.5, 3.5, 3.5, -3.5, "", "", "")]);
            addMarker(".", [addSvgEl(null, "circle", {"r":"1.5", "stroke-width":3})]);
            addMarker("x", [addSvgLn(null, -3.5, -3.5, 3.5, 3.5, "","",""), addSvgLn(null, -3.5, 3.5, 3.5, -3.5, "","","")]);
            addMarker("_", [addSvgLn(null, -5, 0, 5, 0, "","","")]);
            addMarker("|", [addSvgLn(null, 0, -5, 0, 5, "","","")]);
            addMarker("sq", [addSvgRec(null,-5,-5,10,10,"", "", "")], 1);
            addMarker("^", [addSvgEl(null, "polygon", {"points":"-5 3, 0 -5, 5 3"})], 1);
            addMarker("v", [addSvgEl(null, "polygon", {"points":"-5 -3, 0 5, 5 -3"})], 1);
            addMarker("tr", [addSvgEl(null, "polygon", {"points":"-3 -5, 5 0, -3 5"})], 1);
            addMarker("tl", [addSvgEl(null, "polygon", {"points":"-5 0, 3 5, 3 -5"})], 1);
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

        if(length(gridMinor) < 1) {
            // enable minor grid by default for log axes
            gridMinorSet[0] = xScale == 'log';
            gridMinorSet[1] = yScale == 'log';
        } else {
            if(length(gridMinor) > 1) {
                gridMinorSet[0] = gridMinor[0];
                gridMinorSet[1] = gridMinor[1];
            } else {
                gridMinorSet[0] = gridMinor;
                gridMinorSet[1] = gridMinor;
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
        if(length(length(yLimInt)) < 1) {
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
            const markerStyle = "url(#m" + (Array.isArray(marker) ? marker[lnIdx] : marker) +"_"+elementId+ ")";  
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

            const poly = addSvgPolyLn(gp, "", colorSel, dashStr, strokeWidth);
            addSvgEl(null, poly, {"id": "pl_" +elementId+"_"+lnIdx,
                "marker-start":markerStyle, "marker-mid":markerStyle, "marker-end":markerStyle, 
                "stroke-width":strokeWidth});
            //poly.setAttribute("shape-rendering","optimizeSpeed ");
            if(svgLeg!=null) {
                const markerStyle = "url(#ml" + (isArray(marker) ? marker[lnIdx] : marker) +"_"+elementId+ ")";  
                addSvgEl(null, svgLeg.childNodes[lnIdx+2].childNodes[1], {"stroke-dasharray": dashStr,
                    "marker-mid":markerStyle, "stroke-width":strokeWidth, "stroke": colorSel});
            };

            for(let ptIdx = 0; ptIdx < numPtPerLine; ++ptIdx) {
                const ptx = varX ? xInt[lnIdx*numPtPerLine  + ptIdx] : xInt[ptIdx];
                const pty = yInt[lnIdx*numPtPerLine  + ptIdx];
                
                if (isFinite(ptx) && isFinite(pty)) {
                    const point = svgDraw.createSVGPoint();
                    point.x = 100*(ptx-pltLim[0])/ pltLim[2];
                    point.y = 100-100*(pty-pltLim[1]) / pltLim[3];
                    poly.points.appendItem(point);
                };
            };                
        };
        plRec = addSvgRec(svgDraw, 0, 0, "100%", "100%", "none", "black");
        addSvgEl(null, plRec, {"id":"plr_"+elementId,"pointer-events": "visible"});
        plRec.onclick = (event) => plotClicked(event);
    };
    //////////////////////////////
    // create drawing area and resize elements
    //////////////////////////////
    const wSvgLeft = axLblBb[1].width + 0.5*axesLblFontSize + 1.5*axesLblFontSize*(length(ylabel)>0) + fontSpacing;
    const hSvgBtm = axLblBb[0].height + fontSpacing + (1.5*axesLblFontSize+fontSpacing)*(length(xlabel)>0);   
    const hSvgDraw = svgSz[3] - hSvgBtm - hSvgTop; 
    const legInside = (legFill=="white") ;
    const wLegendMargin = legInside ? 2*legendXSpacing : 0;
    const hLegendMargin = legInside ? 2*legendYSpacing : 0;
    const maxLegendHeight = hSvgDraw - hLegendMargin;
    const hLegendItems = hSvgLeg;
    wSvgLeg = (wSvgLeg > maxLegendWidth) ? maxLegendWidth : wSvgLeg;
    hSvgLeg = (hSvgLeg > maxLegendHeight) ? maxLegendHeight : hSvgLeg;
    const wSvgDraw = svgSz[2] - wSvgLeg*(1-legInside) - wSvgLeft - 2*legendXSpacing;
    const pltAr = [wSvgLeft, hSvgTop, wSvgDraw, hSvgDraw];
    const gBottomShift = -svgSz[3] + pltAr[1] + pltAr[3];
    const padding = [svgSz[2]-pltAr[2], svgSz[3]-pltAr[3]];
    const xleg = svgSz[2]-wSvgLeg-legendXSpacing - wLegendMargin;
    const yleg = hSvgTop + hLegendMargin/2;
    addSvgEl(null, svgBg, {"width":pltAr[2], "height":pltAr[3], "x":pltAr[0], "y":pltAr[1]});
    addSvgEl(null, svgDraw, {"width":pltAr[2], "height":pltAr[3], "x":pltAr[0], "y":pltAr[1]});
    addSvgEl(null, svgLeft, {"width": pltAr[0], "y": pltAr[1], "height":pltAr[3]});
    transform(gBottom, [pltAr[0], gBottomShift ]);
    addSvgEl(null, svgBottom, {"y":"100%", "width":pltAr[2], "height": hSvgBtm});
    addSvgEl(null, svgTop, {"x": pltAr[0], "width":pltAr[2]});
    if (svgLeg != null) {
        transform(gleg, [xleg, yleg]);
        addSvgEl(null, svgLeg, {"height": hSvgLeg, "width":wSvgLeg,
            "viewBox": "0 0 " + wSvgLeg + " " + hSvgLeg});
    
        // update width of legend rectangle and clip box
        setAttr(recleg,"width","100%");
            
        // add legend again at the end to be in front of drawing
        if(legInside) addSvgEl(svg,gleg); 
    }

    ////////////////////////////
    // toolbar
    ////////////////////////////
    const btnGrp = addSvgEl(svgTop, "g", {"id":"b_"+elementId, "cursor": "pointer",});
    transform(btnGrp, [0, pltAr[1]]);
    // draw download button
    const downloadBtn = addSvgEl(btnGrp, "g", {
        "stroke-width":2,"stroke-linecap":"round", "stroke-linejoin":"round","class":"b", "pointer-events": "visible"});
    transform(downloadBtn, [pltAr[2]-18, -24]);
    addSvgPolyLn(downloadBtn, "8,0 8,16 2,9 8,16 14,9");
    addSvgPolyLn(downloadBtn, "0,17 0,20 16,20 16,17");
    addSvgRec(downloadBtn, 0, 0, 21, 21); // invisible rectangle for click event
    downloadBtn.onclick = () => {downloadSvg()};
    let btnXOffset = 0;
    // draw logx and logy button
    addToggleButton("log(x)", logScale[0], (state) => {xScale = (state) ? "log" : "lin"; draw();resizeSvg();});
    addToggleButton("log(y)", logScale[1], (state) => {yScale = (state) ? "log" : "lin"; draw(); resizeSvg();});
   
    // add event callbacks
    svg.oncontextmenu = (event) => {event.preventDefault()}; // prevent context menu during zoom
    svgDraw.onmousedown = (event) => plotMouseDown(event);
    svgDraw.ondblclick = () => setAxesLim(pltLim);
    svg.onmousedown = (event) => {event.preventDefault()}; // prevent context menu during zoom
    svg.onmouseup = () => plotZoom();
   
    if(length(legend) > 0)
        gleg.onwheel = (event) => scrollLegend(event, elementId, hLegendItems)
   
    new ResizeObserver(() => resizeSvg()).observe(svg);
    resizeSvg(); // execute once for proper scaling of several elements

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

    function addToggleButton(text, initState, callback=null) {
        const logBtn = addSvgEl(btnGrp, "g", {"pointer-events": "visible"});

        const rec = addSvgRec(logBtn, 0, -14, 0, 18, "none");  // invisible rectangle for click event
        //addSvgRec(logBtn, 0, -14, 36, 18, "none", "#73AFD7", 2.5, 3);  // invisible rectangle for click event
        const lbl = addSvgTxt(logBtn, text, 3,-1,12, "start", defaultFont, "grey");
        const bbw = lbl.getBBox().width + 6;
        let isClicked = initState;
        
        addSvgEl(null, rec, {"width": bbw, "rx":3});
        changeStatus(isClicked);
        transform(logBtn, [btnXOffset, -8]);
        logBtn.onclick = () => {
            isClicked = !isClicked;
            changeStatus(isClicked);
            if(callback != null) callback(isClicked);
        };

        function changeStatus(clicked) {
            addSvgEl(null, rec, {"stroke":(clicked) ? "#73AFD7" : "#A0A0A0", 
                "stroke-width":(clicked) ? 2.5 : 1.5});
            setAttr(lbl, "fill", (clicked)? "#black" : "grey");
        }
        btnXOffset += bbw + 5;
        return logBtn;
    }

    function addMarker(id, elements, addSolid=0) {
        //"o","+", "*", ".", "x", "_", "|", "sq"
        const marker = addSvgEl(defsDraw, "marker", {"id":"m"+id+"_"+elementId,
            "markerWidth":"10", "markerHeight":"10", "refX":"5", "refY":"5",
            "markerUnits":"userSpaceOnUse", "fill":"none","stroke":"context-stroke"});
        const markerGrp = addSvgEl(marker, "g", {
            "stroke-width":1.5,"vector-effect":"non-scaling-stroke",
            "class":"marker_" + elementId});
        transform(markerGrp, [5,5], [1,1]);
    
        for(let idx = 0; idx < length(elements); ++idx)
            addSvgEl(markerGrp, elements[idx]);
    
        // copy to legend
        const markerClone = addSvgEl(defsLeg, marker.cloneNode(true), {"id":"ml"+id+"_"+elementId});
        setAttr(markerClone.childNodes[0], "class", "");

        // copy but fill
        if(addSolid) addSvgEl(defsDraw, marker.cloneNode(true), {"id":"mf"+id+"_"+elementId, "fill":"context-stroke"});
    };

    function downloadSvg() {
        btnGrp.style.display = "none"; // hide button for screenshot
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

        const str =(visible) ? "block" : "none";        
        getEl("pl_"+elementId+"_"+lnIdx).style.display = str;
        getEl("lgi_"+elementId+"_"+lnIdx).style.opacity = 0.3+0.7*visible;
        if(datatips!=null) datatips.style.display = str;
    }

    function legClicked(event, numLines) {
     
        //const svgLeg = getEl("sl_"+elementId); //event.srcElement.ownerSVGElement;
        const legY = event.offsetY-yleg+view(svgLeg)[1]; // y position inside plotting area
        const lnIdx = floor((legY-legendYSpacing/2) / (legendFontSize+legendYSpacing));
        const clkLn = getEl("pl_"+elementId+"_"+lnIdx);
        
        if(clkLn == null)
            return;

        const visible = clkLn.style.display != "none";   
    
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
    
        if(childSz[2] != newChildWidth) {
            setAttr(svgDraw, "width", newChildWidth); 
            setAttr(svgBg, "width", newChildWidth);            
            setAttr(svgTop, "width", newChildWidth);    
            setAttr(svgBottom, "width", newChildWidth); 
            if(svgLeg!=null) svgLeg.x.baseVal.value += newChildWidth - childSz[2];  
            downloadBtn.transform.baseVal[0].matrix.e += newChildWidth - childSz[2];   
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
        // update datatip location which refers to top SVG and not scaled with drawing SVG
        updateMarkerPos();
    };

    function scrollLegend(event){
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
        recleg.y.baseVal.value = svgLegVw[1];
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
    function getNearestLine(elementId, Cx, Cy, dx, dy, linTip) {
        let closestEl = null;
        let closestDist = Inf;
        let closestXproj = 0;
        let closestYproj = 0;

        const polylines = getEl("gp_"+elementId);
        const nLines = length(polylines.children);

        for(let idx = 0; idx < nLines; ++idx) {
            const line = polylines.children[idx];
            const pts = line.points;
            const nPts = length(pts);
            if( line.style.display == "none") // dont consider hidden lines
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
                } else if(linTip && getAttr(line, "stroke-width")!= 0) {
                    closestXproj = xproj;
                    closestYproj = yproj;
                } else {
                    closestEl = null;
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
        result = getNearestLine(elementId, plotX, plotY, detX, detY, linTip);
        const closestEl = result.ele;
        if(closestEl == null)
            return;    
       
        const intX = result.x;
        const intY = result.y;
        //const topX = (intX-vBx)/scaleX + drawX;
        //const topY = (intY-vBy)/scaleY + drawY;
    
        const prefix = "pl_" + elementId;
        const lnId = closestEl.id;
        const lnIdx = lnId.slice(length(prefix), length(lnId)); // substring includes "_"
        const legendItem = getEl("lti_"+elementId+lnIdx);
        const plotLine = getEl("pl_"+elementId+lnIdx);
        const lineColor = getAttr(plotLine, "stroke");
        const sourceCoord = convertCoord([intX, intY], pltLim, logScale);
        let gl = getEl("gpl_" +elementId+lnIdx);
        if(gl == null) { // create group for all datatips on the same line (to be used in case line vibility is toggled)
            //gl = addSvgEl(svg, "g", {"id":"gpl_" + elementId+lnIdx});
            gl = addSvgEl(svgDraw, "g", {"id":"gpl_" + elementId+lnIdx});
        }
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
        
        if(legendItem != null) {
            text = addSvgTxt(lbl, legendItem.textContent, 2, -35, 12, "start", defaultFont, "white" ); 
            addSvgEl(null, text, {"font-weight":"bold"});
            addSvgEl(null, rect, {"y":-48, "height":48});
        }

        addSvgTxt(lbl, "x: " + num2eng([sourceCoord[0]]), 2, -19, 12, "start", defaultFont, "white");
        addSvgTxt(lbl, "y: " + num2eng([sourceCoord[1]]), 2, -5, 12, "start", defaultFont, "white");    
                
        const bbox = datatip.getBBox();
        const bb = [bbox.width+4, bbox.height];
        addSvgEl(null, rect, {"width": bb[0]});
        if(legendItem != null)
            addSvgLn(lbl, 0, -31,  bb[0],-31, "white");
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
                shiftLblX =  -bb[0]-5;
                scaleLnX =  -1;
            };
            if(y){
                shiftLblY =  bb[1]+5;
                scaleLnY =  -1;
            };
            transform(lbl, [shiftLblX,shiftLblY]);
            transform(lblLn, null, [scaleLnX,scaleLnY]);
        };

        addSvgRec(datatip, -2, -2, 4, 4, "black");
        // add invisble circle to  capture clicks
        addSvgEl(datatip, "circle", {"r":dSnap, "fill":"none", "pointer-events": "visible"});
    };

    function updateMarkerPos() {
        const datatips = doc.getElementsByClassName("marker_" + elementId);
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
        addSvgEl(null, plRec, {"x":shiftX, "y":shiftY});        

        createGrid(lim);
        updateMarkerPos();
    };

    function plotZoom() {
        const rectZoom = getEl("zoom_rect"+elementId);
        svgDraw.style.cursor = "crosshair";
        svg.onmousemove = null; // disable move event to aovid unnessary callbacks
        if(rectZoom == null)
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
        const gridEl = doc.getElementsByClassName("cg_"+elementId);
        while (length(gridEl) > 0) gridEl[0].remove(); 

        for(let axIdx = 0; axIdx<2;++axIdx)  {
            const svgAx = (axIdx) ? svgLeft : svgBottom; 
            const lblGrp = addSvgEl(svgAx, "g", {"id":"ga"+svgAx+"_" +elementId});
            const tick = calcTick(lim[2+axIdx], nTicksMax[axIdx], logScale[axIdx]);
            const max = lim[axIdx]+lim[2+axIdx];
            // next major ticks
            const minTick = (ceil(lim[axIdx]/tick)-1) * tick; // -1 to draw extend the minor grid
            const maxTick = (floor(max/tick)) * tick;
    
            // actual number of ticks       
            const isManTick = (length(tickOvr[axIdx]) > 0);     
            const ticks = isManTick ? tickOvr[axIdx] : linspace(minTick,tick,maxTick);
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

            const pos = calcTickPos(ticks, lim[axIdx], lim[2+axIdx]);       
            const textAnchor = (defaultAngle < -11) ? "end" :  ((defaultAngle > 11) ? "start" : "middle");
            //const textAnchor = (axIdx ^ swapAnchor) ? "end" : "middle";
            for(let idx = 0; idx < length(ticks); ++idx) {
                //const tickPos =  tickOffset + dTick * idx; 
                const tickPos = (axIdx >0) ? 100-pos[idx] : pos[idx];
                const c = (axIdx) ? [0,tickPos] : [tickPos, 0];
                const tc = (axIdx) ? ["100%",tickPos+"%"] : 
                    [tickPos+"%", fontSpacing + axesLblFontSize*0.5*(textAnchor=="middle")];
                let textEl = null; 
                //size(svgAx)[2] - axesLblFontSize*0.5
                if(pos[idx] >= 0 && (idx > 0 || tickOvr)) {
                    textEl = addSvgTxt(lblGrp, tickLabel[idx], tc[0], tc[1], axesLblFontSize, textAnchor);    
                    addSvgEl(null,textEl,{"dominant-baseline":"central", "class":"cg_" +elementId,
                        "transform":"translate(-" + axesLblFontSize*0.5*axIdx + " 0) rotate(" + tickangle[axIdx] + ")", 
                        "transform-origin": tc[0] + " "+  tc[1]
                    });
                }
                
                addSvgEl(svgBg, "use", {"href":"#mg" + axIdx + "_"+elementId, "x":c[0], "y":c[1], 
                    "class":"cg_" +elementId});
            };
            bb[axIdx] = lblGrp.getBBox();
        };   
        return bb;
    };

    // calculates the coordiantes of the ticks based on values 
    function calcTickPos(values, startPos, range) {
        const pos = Array(length(values));
        for(let idx = 0; idx < length(values); ++idx)
            pos [idx] = 100*(values[idx] - startPos) / range;

        return pos;
    };

    // calculates the space between ticks
    function calcTick(range, nTicks, logScale) {
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
    };

    function addTickLines(parent, offset, axIdx, tickLength, dash, gridEnbl){
        let x = [offset, 0, 0, tickLength, offset, 100];
        if(axIdx>0) x = [x[1],x[0],x[3],x[2],x[5],x[4]];  // swap x,y 
        if(gridEnbl) addSvgLn(parent, x[0], x[1], x[4], x[5], "#DFDFDF", dash);
        const startTick = addSvgLn(parent, 0,0, x[2], x[3]);
        const endTick = addSvgLn(parent, -x[2], -x[3], 0, 0);
        transform(startTick, [x[0],x[1]], [1, 1]);
        transform(endTick, [x[4],x[5]], [1, 1]);
        addSvgEl(null, startTick, {"class":"marker_" + elementId}); // reuse "marker" class to gete automatic resizing
        addSvgEl(null, endTick, { "class":"marker_" + elementId}); // reuse "marker" class to gete automatic resizing
            
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
        const rect = addSvgRec(svg, x, y, 0, 0, "black");
        const opacity = isPan ? 0 : 0.3; // dont show rectangle during pan
        addSvgEl(null, rect, {"id":"zoom_rect"+elementId, "fill-opacity":opacity});
        svg.onmousemove = (eventNew) => plotDrawZoom(eventNew, x, y);
    };

    function plotDrawZoom(event, x0, y0) {  
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

    function num2eng(val) {
        const unitList = ['y', 'z', 'a', 'f', 'p', 'n', 'u', 'm', '', 'k', 'M', 'G', 'T', 'P', 'E', 'Z', 'Y'];
        const zeroIndex = 8;
        const out = Array(length(val));
        const nVal = length(val);
        const nUnits = length(unitList);
    
        for(let idx = 0; idx < nVal; ++idx) {
            
            const nn = val[idx].toExponential(5).split(/e/);
            let u = floor(+nn[1] / 3) + zeroIndex;
            if (u > nUnits - 1) {
                u = nUnits - 1;
            } else
            if (u < 0) {
                u = 0;
            };
    
            out[idx] =  round((nn[0] * (10 ** ( +nn[1] - (u - zeroIndex) * 3)))*1000)/1000 + unitList[u];
        };
        return out;
    };

    function getEl(id){
        return doc.getElementById(id);
    };
    function setAttr(obj, field, val) {
        obj.setAttribute(field, val);
    };
    function getAttr(obj, field) {
        return obj.getAttribute(field);
    };
    function length(element) {
        return element.length;
    }
    function size(element) {
        return [element.x.baseVal.value, element.y.baseVal.value, 
                element.width.baseVal.value, element.height.baseVal.value];
    };
    function view(element) {
        return [element.viewBox.baseVal.x, element.viewBox.baseVal.y, 
            element.viewBox.baseVal.width, element.viewBox.baseVal.height];
    };
    function transform(element, translate, scale){
        let str = (translate!=null) ? "translate("+translate[0]+" "+translate[1]+")" : "";
        str += (scale!=null) ? "scale("+scale[0]+" "+scale[1]+")" : "";
        element.setAttribute("transform", str);
    }
    
    function addSvgEl(parent, ele, attrs) {
        //create the element with a specified string:
        const element = (typeof ele == "string") ? doc.createElementNS(ns, ele) : ele;
        //create a for...in loop set attributes:
        for (let val in attrs) {
            setAttr(element, val, attrs[val]);        
        };
        if(parent != null)
            parent.appendChild(element);
        //return the element with the set attributes:
        return element;
    };
    function addSvgTxt(parent, text, x, y, fontsize, textanchor = "middle", fontfamily=defaultFont, fill="black") {
        const textEl = addSvgEl(parent, "text", {"x":x, "y":y,
                "fill":fill, "font-size":fontsize, "text-anchor":textanchor, "font-family":fontfamily,
                "stroke-width": 1
                });
        textEl.append(doc.createTextNode(text));              
        return textEl;
    }
    function addSvgLn(parent, x1, y1, x2,y2, stroke="black", strokedasharray="", stroke_width=1) {
        return addSvgEl(parent, "line", {"x1":x1, "y1":y1,"x2":x2, "y2":y2,
                "stroke":stroke, "stroke-width": stroke_width, "stroke-dasharray": strokedasharray, "vector-effect":"non-scaling-stroke"
        });  
    };
    function addSvgPolyLn(parent, points="", stroke="black", strokedasharray="", stroke_width=2) {
        return addSvgEl(parent, "polyline", {"points":points, "fill": "none",
                "stroke":stroke, "stroke-width": stroke_width, "stroke-dasharray": strokedasharray, "vector-effect":"non-scaling-stroke"
        });  
    };
    
    function addSvgRec(parent, x, y, width, height, fill="none", stroke="none", stroke_width=2, rx=0) {
        return addSvgEl(parent, "rect", {"x":x, "y":y,"width":width, "height":height, "rx":rx,
                "stroke":stroke, "stroke-width": stroke_width, "fill": fill, "vector-effect":"non-scaling-stroke"
        });  
    };
};

};