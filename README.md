<a href="https://messier433.github.io/YaJsSvgPlot/example.html" target="_blank"><img src="https://github.com/user-attachments/assets/fd9ca9d8-7afe-4fd7-a208-0aa0d71a2484"/></a>
Supported plot features
- multiple line plots with different markers and dash styles
- scatter plot (no lines)
- linear and log scale of axes
- major and minor grid lines
- title, subtitle and axes label
- auto and custom set axes limits
- legend inside or next to plot area

Supported interactions:
- auto resize to parent div dimensions
- zoom-in via pressing right mouse button while defining zoom-in area
- pan via middle mouse button or right mouse button with "Shift" pressed on keyboard
- reset view via double left-click on plot area
- left click tooltip placement and removal; linear interpolation on line and snap to exact points
- Legend interaction<br />
  Single-click on legend item: toggle visibility of selected element<br />
  Double-click of legend item: if selected item is visible, hide all other items. If invisible, make all items visible<br />
  Mouse wheel: Scroll legend in case items do not fit in vertical legend area<br />
- download generated SVG

Function call:
plotSvg(ID, x, y, numLines, optParam);

Optional parameters:
 - title: String that defines the main title on top of plot area 
 - subtitle: String that defines the sub-title below the main title with smaller font,
 - xlabel: String that defines the label below the x-axes
 - ylabel: String that defines the label on the left of the y-axes
 - xScale: String that defines the scaling of the x-axes. Valid options: "log", "lin" (default)
 - yScale: String that defines the scaling of the y-axes. Valid options: "log", "lin" (default)
 - style: String or string-array the defines the type of each line.<br />
   Valid options:<br />
   ":" dotted<br />
   "--" solid line<br />
   "-." dash-dot<br />
   "*" no-line (marker to be defined for scatter plots<br />
 - marker: String or string-array the defines the type of markers used for each line.<br />
   Valid option: <br />
   "" No markers<br />
   "o" Circle<br />
   "+" Cross<br />
   "*" Star<br />
   "." Dot<br />
   "x" X<br />
   "_" Horizontal line<br />
   "|" Vertical Line<br />
   "sq" Square<br />
   "^" Triangle pointing up<br />
   "v" Triangle pointing down<br />
   "\>" Triangle pointing right<br />
   "\<" Triangle pointing left<br />
 - xlim: length-2 array that defines min and max range of x-axes
 - ylim: length-2 array that defines min and max range of y-axes
 - legend: String array that defines the legend names for each line
 - legendLocation: String that defines the location of the legend<br />
   Allowed values:<br />
   "northeastoutside" On the right side next to the plot area<br />
   "northeast" Inside the plot area<br />
