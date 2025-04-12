GitHub:  <a href="https://github.com/messier433/TinySvgPlot">https://github.com/messier433/TinySvgPlot</a>
<a href="https://messier433.github.io/TinySvgPlot/example.html" target="_blank"><img src="https://github.com/user-attachments/assets/17fffdfe-d66c-4713-b960-0d6e01751c38"/></a>

Supported plot features
- multiple line plots with different markers and dash styles
- scatter plot (no lines)
- linear and log scale of axes
- Auto or manual axes ticks
- major and minor grid lines
- title, subtitle and axes label
- auto and custom set axes limits
- legend inside or next to plot area

Supported interactions:
- auto resize to parent div dimensions
- zoom-in via pressing right mouse button while defining zoom-in area
- pan via middle mouse button or right mouse button with "Ctrl" pressed on keyboard
- reset view via double left-click on plot area
- left click datatip placement and removal; linear interpolation on line and snap to exact points
- left click + ctrl key on datatip, changes the location of the tooltip label
- Legend interaction<br />
  Single-click on legend item: toggle visibility of selected element<br />
  Double-click of legend item: if selected item is visible, hide all other items. If invisible, make all items visible<br />
  Mouse wheel: Scroll legend in case items do not fit in vertical legend area<br />
- download generated SVG
- Custom toogle buttons to change optParams dynamically

Function call:
plotSvg(ID, x, y, numLines, optParam);

Optional parameters:
 - color: String or string array that defines the color for all lines
 - title: String that defines the main title on top of plot area 
 - subtitle: String that defines the sub-title below the main title with smaller font,
 - xlabel: String that defines the label below the x-axes
 - ylabel: String that defines the label on the left of the y-axes
 - xScale: String that defines the scaling of the x-axes. Valid options: "log", "lin" (default)
 - yScale: String that defines the scaling of the y-axes. Valid options: "log", "lin" (default)
 - grid: Boolean to enable grid lines for x and y-axes. In case of log-scale this automatically enables also minor-grid lines
 - gridMinor: Scalar or 2 value Boolean array to enable minor grid lines for x- and/or y-axes
 - xtick: Numeric array with manual definition of xtick position
 - ytick: Numeric array with manual definition of ytick position
 - xticklbl: String array with manual definition of xTick label
 - yticklbl: String array with manual definition of yTick label
 - xtickangle: Numeric for rotating the xTick label in degrees
 - ytickangle: Numeric for rotating the yTick label in degrees
 - style: String or string-array the defines the type of each line.<br />
   Valid options:<br />
   "" solid line<br />
   ":" dotted<br />
   "--" dash<br />
   "-." dash-dot<br />
   "*" no-line (marker to be defined for scatter plots)<br />
 - marker: String or string-array the defines the type of markers used for each line.<br />
   Valid option: <br />
   "" No markers<br />
   "o" Circle<br />
   "+" Plus<br />
   "*" Star<br />
   "." Dot<br />
   "x" Cross<br />
   "_" Horizontal line<br />
   "|" Vertical Line<br />
   "sq" Square<br />
   "^" Triangle pointing up<br />
   "v" Triangle pointing down<br />
   "tr" Triangle pointing right<br />
   "tl" Triangle pointing left<br />
   "fsq" Filled square<br />
   "fo" Filled circle<br />
   "f^" Filled triangle pointing up<br />
   "fv" Filled triangle pointing down<br />
   "ftr" Filled triangle pointing right<br />
   "ftl" Filled triangle pointing left<br />
 - xlim: length-2 array that defines min and max range of x-axes
 - ylim: length-2 array that defines min and max range of y-axes
 - legend: String array that defines the legend names for each line
 - legendLocation: String that defines the location of the legend<br />
   Allowed values:<br />
   "northeastoutside" On the right side next to the plot area<br />
   "northeast" Inside the plot area<br />
 - linTip: Boolean that defines if tooltips can be freely placed on line or snap to points (default: true)

