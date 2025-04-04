/**
* Copyright (c) 2025, Thomas Baier
* All rights reserved. (MIT Licensed)
*
* plotSvg.js (TinySvgPlot)
* A small, interactive plotting tool
* https://github.com/messier433/TinySvgPlot
*/
{
const round = Math.round;
const floor = Math.floor;
const log10 = Math.log10;
const ceil = Math.ceil;
const isArray = Array.isArray;
const Inf = Infinity;
const doc =document;

const zoomButton = 2; // 0 is left mouse button; 1: middle mouse button; 2: right mouse button (recommended)
const panButton = 1; // 0 is left mouse button; 1: middle mouse button (recommended); 2: right mouse button
const axesLblFontSize = 12;
const legendFontSize = 10;
const legendFont = "Lucida Sans Typewriter"; // needs to be a monospace font!
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
const xAxesSpacing = axesLblFontSize*4;
const yAxesSpacing = axesLblFontSize*2;
const colorMapRGB =  ["rgb(0,114,190)", "rgb(218,83,25)", "rgb(238,178,32)", 
                    "rgb(126,47,142)", "rgb(119,173,48)", "rgb(77,191,239)",
                    "rgb(163,20,47)"];

const ns = "http://www.w3.org/2000/svg";

function plotSvg(elementId, x, y, numLines, 
{color = "", title = "", subtitle = "", xlabel = "", ylabel="", xlim=[], ylim=[], 
    style="-", marker="", legend = [], xScale = "lin", yScale = "lin", grid = true, 
    gridMinor = [], xtick = [], ytick = [], xticklbl=[], yticklbl=[], 
    xtickangle = 0, ytickangle = 0,legendLocation = 'northeastoutside', linTip = true 
}={}
)
{      
    let logScale = [false, false];
    if(xScale == "log") {
        x = x.map(log10);
        //x.forEach((value, index) => {x[index] = log10(value)});
        if(xlim.length > 1) {
            xlim = xlim.map(log10);
            
            if (isNaN(xlim[0]) || isNaN(xlim[1])) {
                xlim = [];
            } else {
                xlim[0] =  (xlim[0] == -Inf) ? 0 : xlim[0];
                xlim[1] =  (xlim[1] == -Inf) ? 0 : xlim[1];  
            };
        };
        if(xtick.length > 0)
            xtick = xtick.map(log10); 

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
                ylim[0] =  (ylim[0] == -Inf) ? 0 : ylim[0];
                ylim[1] =  (ylim[1] == -Inf) ? 0 : ylim[1];  
            };
        };
        
        if(ytick.length > 0)
            ytick = ytick.map(log10);
        logScale[1] = true;
    };

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

    pltArYOffset = (pltArYOffset < 19) ? 25 : pltArYOffset + 6;
    

    let plotHeight = svgSz[3]-pltArYOffset-yAxesSpacing;
    let plotWidth = svgSz[2]-pltArXOffset;

    // reserve space for labels
    if(xlabel.length>0) {
        plotHeight = plotHeight - axesLblFontSize - fontSpacing;
    };
    if(ylabel.length>0) {
        pltArXOffset= pltArXOffset + axesLblFontSize + 2*fontSpacing;
        plotWidth = plotWidth - axesLblFontSize - 2*fontSpacing;
    };

    //////////////////////////////////////
    // create legend
    //////////////////////////////////////
    // create group
    const gleg = addSvgEl(null, "g", {"pointer-events":"visible"});
    gleg.onclick = (event) => legClicked(event, 0);
    gleg.ondblclick = (event) => legClicked(event, numLines);
   
    let hLegendMargin = 0;
    let hLegendItems = 0;
    let legFill = "none";
    let svgLeg = null; // define already here
    let recleg  = null;
    let defsLeg  = null;
    if(legend.length>0 && numLines > 0 && x.length > 0) {  
        // set legend dimensions depending on location  
        let yLegend = pltArYOffset;      
        if(legendLocation == 'northeast') {
            yLegend = pltArYOffset + 2*legendYSpacing;
            hLegendMargin = 4*legendYSpacing;
            legFill="white";
        }
        const hLegendMax = plotHeight - hLegendMargin;   
        // draw legend box (change width later)
        svgLeg = addSvgEl(gleg, "svg", {"id":"sl_"+elementId});
        defsLeg = addSvgEl(svgLeg, "defs");
        // add legend already here to calculate width
        // will be moved again at the end of the function 
        addSvgEl(svg,gleg);             

        let nLegend = numLines; 
        let legendTmp = legend;
        if(legend.length > numLines) { // cannot be more legend entries than lines
            legendTmp = legend.slice(0,nLegend);  
        }  
            
        hLegendItems = nLegend * (legendFontSize + legendYSpacing) + legendYSpacing;
        let hLegend = (hLegendItems > hLegendMax) ? hLegendMax : hLegendItems;
       
        addSvgEl(null, svgLeg, {"x": "100%", "height": hLegend});       
    
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
            if(lnIdx < legendTmp.length) {
                str = legendTmp[lnIdx];
            };
            textEl.append(doc.createTextNode(str));              
        }

        let bbox = gleg.getBBox();
        let wLegend = bbox.width + 2*legendXSpacing;
        wLegend = (wLegend > maxLegendWidth) ? maxLegendWidth : wLegend;
        // update width of legend rectangle and clip box
        setAttr(recleg,"width","100%");
        setAttr(svgLeg,"width",wLegend);

        let xLegend = -wLegend - legendXSpacing;
        plotWidth -= wLegend + 2*legendXSpacing;
        // update plot and legend dimensions depending on legend position
        if(legendLocation == 'northeast') {
            //xLegend = pltArXOffset + plotWidth - wLegend - 2*legendXSpacing;
            xLegend -= legendXSpacing + xAxesSpacing;
            plotWidth -= xAxesSpacing - wLegend - 2*legendXSpacing;                
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
    const svgTop= addSvgEl(svg, "svg", {"id":"st_"+elementId, "x": pltAr[0], "overflow":"visible", "width":pltAr[2]});
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
    const gBottom = addSvgEl(svg, "g");
    transform(gBottom, [pltAr[0], gBottomShift ]);
    const svgBottom = addSvgEl(gBottom, "svg", {"id":"s_btm_"+elementId, "overflow":"visible","y":"100%", "width":pltAr[2]});
    if(xlabel.length>0) {
        //addSvgTxt(svg, xlabel,"50%", pltAr[1] + pltAr[3] + axesLblFontSize*2.4 + fontSpacing, axesLblFontSize);
        addSvgTxt(svgBottom, xlabel,"50%", axesLblFontSize*3, axesLblFontSize);
    };

    ///////////////////////////////
    // draw ylabel
    ///////////////////////////////
    const svgLeft= addSvgEl(svg, "svg", {"id":"sy_"+elementId, "width": pltAr[0], "y": pltAr[1], "overflow":"visible", "height":pltAr[3]});
    if(ylabel.length>0) { 
        let text = addSvgTxt(svgLeft, ylabel, pltAr[0] - axesLblFontSize, "50%", axesLblFontSize);
        addSvgEl(null, text,  {"writing-mode":"vertical-rl", "transform-origin": "center"});
        transform(text, null, [-1,-1])
    };

    ///////////////////////////////
    // Draw axes
    ///////////////////////////////
    // define range of plot
    const xlims = setLim(x, xlim);
    const ylims = setLim(y, ylim);
    let pltLim = [xlims[0], ylims[0], xlims[1]-xlims[0],ylims[1]-ylims[0]];

    //////////////////////////////
    // plotting area
    //////////////////////////////   
    // background SVG used for ticks and grid
    const svgBg = addSvgEl(svg, "svg", {"id":"s_bg_"+elementId, "preserveAspectRatio":"none",
            "viewBox":"0 0 100 100", 
            "width":pltAr[2], "height":pltAr[3], 
            "x":pltAr[0], "y":pltAr[1]});

    const svgDraw = addSvgEl(svg, "svg", {"id":"sd_"+elementId, "preserveAspectRatio":"none",
        "viewBox":"0 0 100 100", "width":pltAr[2], "height":pltAr[3], "x":pltAr[0], "y":pltAr[1]});
    
    svgDraw.style.cursor = "crosshair";
    ////////////////////////////
    // Draw grid and labels
    ////////////////////////////
    let gridMinorSet = [0, 0];

    if(gridMinor.length < 1) {
        // enable minor grid by default for log axes
        gridMinorSet[0] = xScale == 'log';
        gridMinorSet[1] = yScale == 'log';
    } else {
        if(gridMinor.length > 1) {
            gridMinorSet[0] = gridMinor[0];
            gridMinorSet[1] = gridMinor[1];
        } else {
            gridMinorSet[0] = gridMinor;
            gridMinorSet[1] = gridMinor;
        };
    };     

    const xTick = calcTick(pltLim[2], nTicksMax[0], logScale[0]);	
    const yTick = calcTick(pltLim[3], nTicksMax[1], logScale[1]);
    const autoTick = [xtick.length == 0, ytick.length == 0];
    const tickMinorSet = [(logScale[0] || gridMinorSet[0]) && autoTick[0], (logScale[1] || gridMinorSet[1]) && autoTick[1]];
    gridMinorSet = [gridMinorSet[0] && autoTick[0],gridMinorSet[1] && autoTick[1]]; // minor grid currently not supported with custom grid
    
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
    
    createGrid(pltLim);

    //////////////////////////////
    // create polylines
    //////////////////////////////
    // define markers
    const defsDraw = addSvgEl(svgDraw, "defs");
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

    let numPtPerLine = y.length / numLines;
    let varX = x.length == y.length;
    if(!varX && (numPtPerLine != x.length))
        throw new Error("Dimension must agree");

    const gp = addSvgEl(svgDraw, "g", {"id":"gp_"+elementId });
    for(let lnIdx = 0; lnIdx < numLines; ++lnIdx) {
        const colorIdx = lnIdx % colorMapRGB.length;
        const dashStyle = isArray(style) ? style[lnIdx] : style;
        const markerStyle = "url(#m" + (Array.isArray(marker) ? marker[lnIdx] : marker) +"_"+elementId+ ")";  
        const colorStr = isArray(color) ? ((lnIdx < color.length) ? color[lnIdx] : "") : color;
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
            const ptx = varX ? x[lnIdx*numPtPerLine  + ptIdx] : x[ptIdx];
            const pty = y[lnIdx*numPtPerLine  + ptIdx];
            
            if (isFinite(ptx) && isFinite(pty)) {
                const point = svgDraw.createSVGPoint();
                point.x = 100*(ptx-pltLim[0])/ pltLim[2];
                point.y = 100-100*(pty-pltLim[1]) / pltLim[3];
                poly.points.appendItem(point);
            };
        };                
    };

    //////////////////////////////
    // create drawing area
    //////////////////////////////
    const plRec = addSvgRec(svgDraw, 0, 0, "100%", "100%", "none", "black");
    const plr = addSvgEl(null, plRec, {"id":"plr_"+elementId,"pointer-events": "visible"});

   
    // add legend last to be in front fs drawing
    if(legFill=="white")
        addSvgEl(svg,gleg); 
    

    // draw download button
    const downloadBtn = addSvgEl(svgTop, "g", {"id":"bd_"+elementId, 
        "stroke-width":2,"stroke-linecap":"round", "stroke-linejoin":"round","class":"b", "pointer-events": "visible"});
    transform(downloadBtn, [(pltAr[2] - 18), (pltAr[1] - 24)]);
    addSvgPolyLn(downloadBtn, "8,0 8,16 2,9 8,16 14,9");
    addSvgPolyLn(downloadBtn, "0,17 0,20 16,20 16,17");
    addSvgRec(downloadBtn, 0, 0, 21, 21)
    downloadBtn.onclick = () => {downloadSvg()};

    // add event callbacks
    plRec.onclick = (event) => plotClicked(event)
    svg.oncontextmenu = (event) => {event.preventDefault()}; // prevent context menu during zoom
    svgDraw.onmousedown = (event) => plotMouseDown(event);
    svgDraw.ondblclick = () => setAxesLim(pltLim);
    svg.onmousedown = (event) => {event.preventDefault()}; // prevent context menu during zoom
    svg.onmouseup = () => plotZoom();
   
    if(legend.length > 0)
        gleg.onwheel = (event) => scrollLegend(event, elementId, hLegendItems)
    //gleg.addEventListener('wheel', () => this.scrollLegend(), { passive:false });
    //window.addEventListener('resize', () => resizeSvg(elementId, padding[0], padding[1], hLegendItems, hLegendMargin));
    new ResizeObserver(() => resizeSvg()).observe(svg);
    resizeSvg(); // execute once for proper scaling of several elements

    function setLim(vals, lim) {
        if(lim.length < 2) {
            let len = vals.length;
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

    function addMarker(id, elements, addSolid=0) {
        //"o","+", "*", ".", "x", "_", "|", "sq"
        const marker = addSvgEl(defsDraw, "marker", {"id":"m"+id+"_"+elementId,
            "markerWidth":"10", "markerHeight":"10", "refX":"5", "refY":"5",
            "markerUnits":"userSpaceOnUse", "fill":"none","stroke":"context-stroke"});
        const markerGrp = addSvgEl(marker, "g", {
            "stroke-width":1.5,"vector-effect":"non-scaling-stroke",
            "class":"marker_" + elementId});
        transform(markerGrp, [5,5], [1,1]);
    
        for(let idx = 0; idx < elements.length; ++idx)
            addSvgEl(markerGrp, elements[idx]);
    
        // copy to legend
        const markerClone = addSvgEl(defsLeg, marker.cloneNode(true), {"id":"ml"+id+"_"+elementId});
        setAttr(markerClone.childNodes[0], "class", "");

        // copy but fill
        if(addSolid) addSvgEl(defsDraw, marker.cloneNode(true), {"id":"mf"+id+"_"+elementId, "fill":"context-stroke"});
    };

    function downloadSvg() {
        downloadBtn.style.display = "none"; // hide button for screenshot
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
        doc.body.removeChild(downloadLink);
        downloadBtn.style.display = "block";
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
        const legY = event.offsetY-getAttr(svgLeg, "y")+view(svgLeg)[1]; // x position inside plotting area
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
        x = point[0] / 100 * pltLim[2] + pltLim[0];
        y = (1-point[1] / 100) * pltLim[3] + pltLim[1];
    
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
        const nLines = polylines.children.length;

        for(let idx = 0; idx < nLines; ++idx) {
            const line = polylines.children[idx];
            const pts = line.points;
            if( line.style.display == "none") // dont consider hidden lines
                continue;
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
        const lnIdx = lnId.slice(prefix.length, lnId.length); // substring includes "_"
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
        const rect = addSvgRec(lbl, 0, -33, 1, 33, lineColor, "rgb(223,223,223)", 1, rx=4);
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
            text = addSvgTxt(lbl, legendItem.textContent, 2, -35, 12, "start", "Sans,Arial", "white" ); 
            addSvgEl(null, text, {"font-weight":"bold"});
            addSvgEl(null, rect, {"y":-48, "height":48});
        }

        addSvgTxt(lbl, "x: " + num2eng([sourceCoord[0]]), 2, -19, 12, "start", "Sans,Arial", "white");
        addSvgTxt(lbl, "y: " + num2eng([sourceCoord[1]]), 2, -5, 12, "start", "Sans,Arial", "white");    
                
        const bbox = datatip.getBBox();
        const bb = [bbox.width+4, bbox.height];
        addSvgEl(null, rect, {"width": bb[0]});
        if(legendItem != null)
            addSvgLn(lbl, 0, -31,  bb[0],-31, stroke="white");
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
        for(let idx = 0; idx<datatips.length; ++idx) {
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
        addSvgEl(null, plr, {"x":shiftX, "y":shiftY});
    
        // remove old grid before creating a new one
        const gridEl = doc.getElementsByClassName("cg_"+elementId);
        while (gridEl.length > 0) gridEl[0].remove();    
    
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
        tickOvr = [xtick, ytick];
        ticklbl = [xticklbl, yticklbl];
        tickangle = [xtickangle, ytickangle];
        for(let axIdx = 0; axIdx<2;++axIdx)  {
            const svgAx = (axIdx) ? svgLeft : svgBottom; 
            const tick = calcTick(lim[2+axIdx], nTicksMax[axIdx], logScale[axIdx]);
            const max = lim[axIdx]+lim[2+axIdx];
            // next major ticks
            const minTick = (ceil(lim[axIdx]/tick)-1) * tick; // -1 to draw extend the minor grid
            const maxTick = (floor(max/tick)) * tick;
    
            // actual number of ticks       
            const isManTick = (tickOvr[axIdx].length > 0);     
            const ticks = isManTick ? tickOvr[axIdx] : linspace(minTick,tick,maxTick);
            const tickLabel = (ticklbl[axIdx].length > 0) ? ticklbl[axIdx] : (logScale[axIdx] ? num2eng(ticks.map((x) => 10 ** x)) : num2eng(ticks));
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
                for(let idx = 0; idx < minorTickPos.length-1; ++idx)
                    addTickLines(defsg, minorTickPos[idx]/10 * dTick * (1-2*axIdx), axIdx, minorTickLength, "2 4", gridMinorSet[axIdx]);
            };
            
            addTickLines(defsg, 0, axIdx, tickLength, "", grid);
    
            const pos = calcTickPos(ticks, lim[axIdx], lim[2+axIdx]);
            for(let idx = 0; idx < ticks.length; ++idx) {
                //const tickPos =  tickOffset + dTick * idx; 
                const tickPos = (axIdx >0) ? 100-pos[idx] : pos[idx];
                const c = (axIdx) ? [0,tickPos] : [tickPos, 0];
                const tc = (axIdx) ? [size(svgAx)[2] - axesLblFontSize*0.5,tickPos+"%"] : [tickPos+"%", axesLblFontSize*0.9];
                let textEl = null; 
                if(pos[idx] >= 0 && (idx > 0 || tickOvr)) {
                    textEl = addSvgTxt(svgAx, tickLabel[idx], tc[0], tc[1], axesLblFontSize, (axIdx) ? "end" : "middle");    
                    addSvgEl(null,textEl,{"dominant-baseline":"central", "class":"cg_" +elementId,
                        "transform":"rotate(" + tickangle[axIdx] + ")", "transform-origin": tc[0] + " "+  tc[1]
                    });
                }
                
                addSvgEl(svgBg, "use", {"href":"#mg" + axIdx + "_"+elementId, "x":c[0], "y":c[1], 
                    "class":"cg_" +elementId});
            };
        };   
    };

    // calculates the coordiantes of the ticks based on values 
    function calcTickPos(values, startPos, range) {
        const pos = Array(values.length);
        for(let idx = 0; idx < values.length; ++idx)
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
        if(gridEnbl) addSvgLn(parent, x[0], x[1], x[4], x[5], "rgb(223,223,223)", dash);
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
    
    function logspace(start, increment, stop) {
        return linspace(start, increment, stop).map(log10);
    };

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

    function getEl(id){
        return doc.getElementById(id);
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
    function addSvgTxt(parent, text, x, y, fontsize, textanchor = "middle", fontfamily="Sans,Arial", fill="black") {
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