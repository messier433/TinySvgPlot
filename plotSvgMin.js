{const a=Math.round,b=Math.floor,c=Math.log10,d=Math.ceil,e=1/0,f=document,g=2,h=1,i=12,j=10,k="Lucida Sans Typewriter",l=20,m=4,n=4,o=400,p=4,q=24,r=12,s=[10,10],t=[10,10],u=[1,2,5,10],v=4*i,w=2*i,z=["rgb(0,114,190)","rgb(218,83,25)","rgb(238,178,32)","rgb(126,47,142)","rgb(119,173,48)","rgb(77,191,239)","rgb(163,20,47)"],A="http://www.w3.org/2000/svg";function gE(e){return f.getElementById(e)}function sAt(e,t,l){e.setAttribute(t,l)}function gAt(e,t){return e.getAttribute(t)}function sz(e){return[e.x.baseVal.value,e.y.baseVal.value,e.width.baseVal.value,e.height.baseVal.value]}function vw(e){return[e.viewBox.baseVal.x,e.viewBox.baseVal.y,e.viewBox.baseVal.width,e.viewBox.baseVal.height]}function tr(e,t,l){t=null!=t?"translate("+t[0]+" "+t[1]+")":"";t+=null!=l?"scale("+l[0]+" "+l[1]+")":"",e.setAttribute("transform",t)}function sLi(a,r){if(r.length<2){let t=a.length,l=-e,n=e;for(;t--;)isFinite(a[t])&&(n=a[t]<n?a[t]:n,l=a[t]>l?a[t]:l);r=[n,l]}return r[0]==r[1]&&(r[0]=r[0]-.5,r[1]=r[1]+.5),r}function n2e(l){var n=["y","z","a","f","p","n","u","m","","k","M","G","T","P","E","Z","Y"],r=Array(l.length);for(let t=0;t<l.length;++t){var i=l[t].toExponential(5).split(/e/);let e=b(+i[1]/3)+8;e>n.length-1?e=n.length-1:e<0&&(e=0),r[t]=a(i[0]*10**(+i[1]-3*(e-8))*1e3)/1e3+n[e]}return r}function lis(t,l,e){var n=b((e-t)/l*(1+1e-12))+1;out=Array(n);for(let e=0;e<n;++e)out[e]=t+l*e;return out}function los(e,t,l){return lis(e,t,l).map(c)}function dec(e,t,l){return lis(e,t,l).map(e=>10**e)}function aSE(e,t,l){var n,a="string"==typeof t?f.createElementNS(A,t):t;for(n in l)sAt(a,n,l[n]);return null!=e&&e.appendChild(a),a}function aST(e,t,l,n,a,r="middle",i="Sans,Arial",s="black"){e=aSE(e,"text",{x:l,y:n,fill:s,"font-size":a,"text-anchor":r,"font-family":i,"stroke-width":1});return e.append(f.createTextNode(t)),e}function aSL(e,t,l,n,a,r="black",i="",s=1){return aSE(e,"line",{x1:t,y1:l,x2:n,y2:a,stroke:r,"stroke-width":s,"stroke-dasharray":i,"vector-effect":"non-scaling-stroke"})}function aSR(e,t,l,n,a,r="none",i="none",s=2,o=0){return aSE(e,"rect",{x:t,y:l,width:n,height:a,rx:o,stroke:i,"stroke-width":s,fill:r,"vector-effect":"non-scaling-stroke"})}function lC(e,t,l,n,a){var r=gE("sl_"+n),e=e.offsetY-gAt(r,"y")+vw(r)[1],i=b((e-l/2)/(t+l)),r=gE("pl_"+n+"_"+i);if(null!=r){var s=r.style.display;if(0==a){e=gE("gpl_"+n+"_"+i);"none"===s?(gE("pl_"+n+"_"+i).style.display="block",gE("lgi_"+n+"_"+i).style.opacity=1,null!=e&&(e.style.display="block")):(gE("pl_"+n+"_"+i).style.display="none",gE("lgi_"+n+"_"+i).style.opacity=.3,null!=e&&(e.style.display="none"))}else for(let e=0;e<a;++e){var o=gE("gpl_"+n+"_"+e);"none"===s?(gE("pl_"+n+"_"+e).style.display="block",gE("lgi_"+n+"_"+e).style.opacity=1,null!=o&&(o.style.display="block")):e!=i&&(gE("pl_"+n+"_"+e).style.display="none",gE("lgi_"+n+"_"+e).style.opacity=.3,null!=o)&&(o.style.display="none")}}}function iMP(e){var t=gE("sd_"+e),l=f.getElementsByClassName("marker_"+e);for(let e=0;e<l.length;++e){var n=sz(t),a=vw(t),r=a[2]/n[2],a=a[3]/n[3];l[e].transform.baseVal[1].matrix.a=r,l[e].transform.baseVal[1].matrix.d=a}}function rS(e,t,l,n,a){var r=gE("sl_"+e),i=gE("sd_"+e),s=gE("s_bg_"+e),o=gE("st_"+e),g=gE("s_btm_"+e),c=gE("sy_"+e),h=gE("s_"+e),u=gE("bd_"+e),h=sz(h),d=sz(i),t=h[2]-t,h=h[3]-l;d[2]!=t&&(sAt(i,"width",t),sAt(s,"width",t),sAt(o,"width",t),sAt(g,"width",t),null!=r&&(r.x.baseVal.value+=t-d[2]),u.transform.baseVal[0].matrix.e+=t-d[2]),d[3]!=h&&(sAt(i,"height",h),sAt(s,"height",h),sAt(c,"height",h),null!=r)&&(sAt(r,"height",l=n<(l=h-a)?n:l),r.viewBox.baseVal.height=l),iMP(e)}function sL(e,t,l){var n=gE("sl_"+t),t=gE("rect_leg_"+t),a=sz(n),r=vw(n),l=l-a[3];return r[1]+=e.deltaY,r[1]<0&&(r[1]=0),l<r[1]&&(r[1]=l),n.viewBox.baseVal.y=r[1],t.y.baseVal.value=r[1],!1}function pC(l,n,a,r,i,s,o){var g=gE("sd_"+n),c=sz(g),h=vw(g),u=h[2]/c[2],d=h[3]/c[3],f=(l.offsetX-c[0])*u+h[0],l=(l.offsetY-c[1])*d+h[1],c=(result=gNL(n,f,l,6*u,6*d,o)).ele;if(null!=c){var h=result.x,f=result.y,l=c.id,o=l.slice(("pl_"+n).length,l.length),c=gE("lti_"+n+o),l=gAt(gE("pl_"+n+o),"stroke"),y=cC([h,f],a,s);let e=gE("gpl_"+n+o);null==e&&(e=aSE(g,"g",{id:"gpl_"+n+o}));g=aSE(e,"g",{class:"marker_"+n}),o=(tr(g,[h,f],[u,d]),aSR(g,5,-9,0,32,l,"rgb(223,223,223)",1,rx=4));g.onclick=e=>{"g"==e.srcElement.parentNode.tagName&&e.srcElement.parentNode.remove(),1<e.detail&&sAL(n,a,a,r,i,s)};let t=null;null!=c&&(aSE(null,text=aST(g,c.textContent,7,-11,12,"start","Sans,Arial","white"),{"font-weight":"bold"}),t=aSL(g,5,-8,5,-8,stroke="white"),aSE(null,o,{y:-23,height:46})),aST(g,"x: "+n2e([y[0]]),7,4,12,"start","Sans,Arial","white"),aST(g,"y: "+n2e([y[1]]),7,18,12,"start","Sans,Arial","white");h=g.getBBox();aSE(null,o,{width:h.width+4}),null!=t&&sAt(t,"x2",h.width+4+5),aSR(g,-2,-2,4,4,"black"),aSE(g,"circle",{r:6,fill:"none","pointer-events":"visible"})}}function cC(e,t,l){return x=e[0]/100*t[2]+t[0],y=(1-e[1]/100)*t[3]+t[1],x=l[0]?10**x:x,y=l[1]?10**y:y,[x,y]}function gNL(t,l,n,a,r,i){let s=null,o=e,g=0,c=0;var h=gE("gp_"+t),u=h.children.length;for(let e=0;e<u;++e){var d=h.children[e],f=d.points;for(let e=1;e<f.length;++e){var y,v,E,p,S,_,x=f[e-1],b=f[e];l<x.x-a&&l<b.x-a||l>x.x+a&&l>b.x+a||n<x.y-r&&n<b.y-r||n>x.y+r&&n>b.y+r||(E=((y=b.x-x.x)*(l-x.x)+(v=b.y-x.y)*(n-x.y))/(y*y+v*v),1<=(E=((y=x.x+y*E)-l)*(y-l)/a/a+((v=x.y+v*E)-n)*(v-n)/r/r))||E>o||(o=E,s=d,E=x.x<l?l-x.x:x.x-l,p=x.y<n?n-x.y:x.y-n,S=b.x<l?l-b.x:b.x-l,_=b.y<n?n-b.y:b.y-n,E<S&&E<a&&p<r?(g=x.x,c=x.y):S<a&&_<r?(g=b.x,c=b.y):i&&0!=gAt(d,"stroke-width")?(g=y,c=v):s=null)}}return{ele:s,x:g,y:c}}function pM(e,t){var l=gE("sd_"+t);let n=0;if(e.button==h||e.button==g&&e.shiftKey)n=1;else if(e.button!=g)return;l.style.cursor=n?"move":"zoom-in";l=gE("s_"+t);const a=e.offsetX,r=e.offsetY;var e=aSR(l,a,r,0,0,"black"),i=n?0:.3;aSE(null,e,{id:"zoom_rect"+t,"fill-opacity":i}),l.onmousemove=e=>pDZ(e,t,a,r)}function pDZ(e,t,l,n){var t=gE("zoom_rect"+t),a=e.offsetX,e=e.offsetY,l=a-l,n=e-n,r=0==gAt(t,"fill-opacity");r||0<=l?sAt(t,"width",l):aSE(null,t,{width:-l,x:a}),r||0<=n?sAt(t,"height",n):aSE(null,t,{height:-n,y:e})}function pZ(t,l,n,a,r){var i=gE("zoom_rect"+t),s=gE("s_"+t),o=gE("sd_"+t);if(o.style.cursor="crosshair",(s.onmousemove=null)!=i){var s=0==gAt(i,"fill-opacity"),g=sz(i);if(i.remove(),!~s||0!=g[2]&&0!=g[3]){i=vw(o),o=sz(o);let e=[];e=s?[-g[2]/o[2],g[3]/o[3],1,1]:[(g[0]-o[0])/o[2],1-(g[1]+g[3]-o[1])/o[3],g[2]/o[2],g[3]/o[3]];s=[l[0]+l[2]*i[0]/100,l[1]+l[3]*(100-i[3]-i[1])/100,l[2]*i[2]/100,l[3]*i[3]/100];sAL(t,[s[0]+e[0]*s[2],s[1]+e[1]*s[3],e[2]*s[2],e[3]*s[3]],l,n,a,r)}}}function sAL(e,t,l,n,a,r){for(var i=gE("sd_"+e),s=100*(t[0]-l[0])/l[2],o=100*(l[1]+l[3]-t[1]-t[3])/l[3],l=(i.viewBox.baseVal.width=100*t[2]/l[2],i.viewBox.baseVal.height=100*t[3]/l[3],i.viewBox.baseVal.x=s,i.viewBox.baseVal.y=o,gE("plr_"+e)),i=gE("cpr_"+e),g=(aSE(null,l,{x:s,y:o}),aSE(null,i,{x:s,y:o}),f.getElementsByClassName("cg_"+e));0<g.length;)g[0].remove();cGr(e,t,n,a,r),iMP(e)}function cTi(e,t,l){var t=e/t,n=b(c(t));const a=d(t/10**n);var r=u.findIndex(function(e){return e>=a}),t=u[r]*10**n;return l&&1<=e&&t<1?1:t}function cGr(o,e,g,l,c){var h=gE("s_bg_"+o),u=gE("sy_"+o),f=gE("s_btm_"+o);for(let r=0;r<2;++r){var y=0<r?u:f,v=cTi(e[2+r],s[r],c[r]),E=e[r]+e[2+r],p=d(e[r]/v)*v,E=b(E/v)*v,S=100*(0<r?e[r]+e[r+2]-E:p-e[r])/e[2+r],_=a((E-p)/v);let n=Array();n=c[r]?n2e(dec(p,v,E)):n2e(lis(p,v,E));const m=100*v/e[2+r];var p=aSE(h,"defs",{class:"cg_"+o}),x=aSE(p,"g",{id:"mg"+r+"_"+o}),E=c[r]||l[r]?t[r]:0;if(0<E){let l=Array();c[r]&&1==v?(l=los(1,9/(E-1),10)).forEach((e,t)=>{l[t]=l[t]*m}):l=lis(0,2/E*m,m);for(let e=1;e<l.length-1;++e)aTL(x,o,0<r?m-l[e]:l[e],g,r,4,"2 4")}aTL(x,o,0,g,r,8,"");for(let l=-1;l<=_;++l){var w=S+m*l;let e=null,t=(0<=l&&aSE(null,e=0<r?aST(y,n[_-l],sz(y)[2]-.5*i,w+"%",i,"end"):aST(y,n[l],w+"%",.9*i,i),{"dominant-baseline":"central",class:"cg_"+o}),[w,0]);0<r&&(t=[t[1],t[0]]),aSE(h,"use",{href:"#mg"+r+"_"+o,x:t[0],y:t[1],class:"cg_"+o})}}}function aTL(e,t,l,n,a,r,i){let s=[l,0,0,r,l,100];0<a&&(s=[s[1],s[0],s[3],s[2],s[5],s[4]]),n&&aSL(e,s[0],s[1],s[4],s[5],"rgb(223,223,223)",i);r=aSL(e,0,0,s[2],s[3]),l=aSL(e,-s[2],-s[3],0,0);tr(r,[s[0],s[1]],[1,1]),tr(l,[s[4],s[5]],[1,1]),aSE(null,r,{class:"marker_"+t}),aSE(null,l,{class:"marker_"+t})}function dSvg(e,t){var l=gE("bd_"+e),e=(l.style.display="none",gE("s_"+e)),n=sz(e),n='<svg width="'+n[2]+'" height="'+n[3]+'" xmlns="'+A+'">',n=new Blob([n,e.innerHTML,"</svg>"],{type:"image/svg+xml;charset=utf-8"}),e=URL.createObjectURL(n),n=f.createElement("a");n.href=e,n.download="snapshot_"+t+".svg",aSE(f.body,n),n.click(),f.body.removeChild(n),l.style.display="block"}function aM(e,t,l,n,a=0){var r=aSE(e,"marker",{id:"m"+l,markerWidth:"10",markerHeight:"10",refX:"5",refY:"5",markerUnits:"userSpaceOnUse",fill:"none",stroke:"context-stroke"}),i=aSE(r,"g",{"stroke-width":1.5,"vector-effect":"non-scaling-stroke",class:"marker_"+t});tr(i,[5,5],[1,1]);for(let e=0;e<n.length;++e)aSE(i,n[e]);a&&aSE(e,r.cloneNode(!0),{id:"mf"+l,fill:"context-stroke"})}function plotSvg(g,a,h,t,{title:u="",subtitle:y="",xlabel:E="",ylabel:S="",xlim:_=[],ylim:x=[],style:te="-",marker:A="",legend:L=[],xScale:M="lin",yScale:T="lin",grid:B=!0,gridMinor:le=[],legendLocation:N="northeastoutside",freeTool:ne=!0}={}){let V=[!1,!1];"log"==M&&(a=a.map(c),1<_.length&&(_=_.map(c),isNaN(_[0])||isNaN(_[1])?_=[]:(_[0]=_[0]==-e?0:_[0],_[1]=_[1]==-e?0:_[1])),V[0]=!0),"log"==T&&(h=h.map(c),1<x.length&&(x=x.map(c),isNaN(x[0])||isNaN(x[1])?x=[]:(x[0]=x[0]==-e?0:x[0],x[1]=x[1]==-e?0:x[1])),V[1]=!0);var R=gE(g),C=f.createElement("div"),R=(aSE(R,C),sAt(C,"style","width:100%;height:100%;min-width:"+o+"px;min-height:200px;overflow:none"),aSE(C,"svg",{id:"s_"+g,width:"100%",height:"100%"})),C=sz(R);R.innerHTML+="<style>\n<![CDATA[\ntext.cll {\nfont-size:"+j+"px;\nfill:black;\ndominant-baseline:central;\nfont-family:"+k+";\n}\n.b:hover polyline{\nopacity:0.5;\n}\n]]>\n</style>\n";let Y=0,D=v;var ae=u.split("\n"),re=y.split("\n");0<u.length&&(Y+=(q+p)*ae.length),0<y.length&&(Y+=(r+p)*re.length),Y=Y<19?25:Y+6;let P=C[3]-Y-w,G=C[2]-D;0<E.length&&(P=P-i-p),0<S.length&&(D=D+i+2*p,G=G-i-2*p);var Z=aSE(null,"g",{"pointer-events":"visible"});Z.onclick=e=>lC(e,j,n,g,0),Z.ondblclick=e=>lC(e,j,n,g,t);let U=0,X=0,F="";if(0<L.length&&0<t&&0<a.length){switch(N){case"northeast":yLegend=Y+2*n,U=4*n,F="white";break;case"northeastoutside":yLegend=Y,F="none";break;default:throw new Error("LegendLocation not supported")}var H=P-U,I=(aSE(R,Z),aSE(R,"defs")),O=(aSE(I,"line",{id:"ll_"+g,x1:0,y1:0,x2:l,y2:0,"stroke-width":2,"vector-effect":"non-scaling-stroke"}),aSE(Z,"svg",{id:"sl_"+g})),ie=t;let a=L;L.length>t&&(a=L.slice(0,ie));I=(X=ie*(j+n)+n)>H?H:X,H=(aSE(null,O,{x:"100%",height:I}),aSR(O,0,0,0,"100%",F,"black"));aSE(null,H,{id:"rect_leg_"+g});for(let t=0;t<ie;++t){var se=t%z.length,oe=t*(j+n)+n,ge=new aSE(O,"g",{id:"lgi_"+g+"_"+t}),se=(aSE(ge,"use",{id:"lli_"+g+"_"+t,x:m,y:oe+j/2,href:"#ll_"+g,stroke:z[se]}),aSE(ge,"text",{id:"lti_"+g+"_"+t,class:"cll",x:m+l+m,y:oe+j/2}));let e="";t<a.length&&(e=a[t]),se.append(f.createTextNode(e))}var K=(K=Z.getBBox().width+2*m)>o?o:K;sAt(H,"width","100%"),sAt(O,"width",K);let e=0;switch(N){case"northeast":e=-K-2*m-v,G-=v;break;case"northeastoutside":e=-K-m,G-=K+2*m;break;default:throw new Error("LegendLocation not supported")}aSE(null,O,{x:C[2]+e,y:yLegend,viewBox:"0 0 "+K+" "+I})}else G-=v;H=[D,Y,G,P];let W=[C[2]-H[2],C[3]-H[3]];var ce=aSE(R,"svg",{id:"st_"+g,x:H[0],overflow:"visible",width:H[2]});let J=0;if(0<u.length)for(let e=0;e<ae.length;++e)J=J+q+p,aST(ce,ae[e],"50%",J,q);if(0<y.length)for(let e=0;e<re.length;++e)J=J+r+p,aST(ce,re[e],"50%",J,r);N=-C[3]+H[1]+H[3],I=aSE(R,"g"),tr(I,[H[0],N]),y=aSE(I,"svg",{id:"s_btm_"+g,overflow:"visible",y:"100%",width:H[2]}),0<E.length&&aST(y,E,"50%",3*i,i),C=aSE(R,"svg",{id:"sy_"+g,width:H[0],y:H[1],overflow:"visible",height:H[3]}),0<S.length&&aSE(C,"text",{"writing-mode":"sideways-lr",fill:"black","font-size":i,"text-anchor":"middle","font-family":"Sans,Arial","stroke-width":1,y:"50%",x:H[0]-4*i-p}).append(f.createTextNode(S)),N=sLi(a,_),I=sLi(h,x);let Q=[N[0],I[0],N[1]-N[0],I[1]-I[0]];aSE(R,"svg",{id:"s_bg_"+g,preserveAspectRatio:"none",viewBox:"0 0 100 100",width:H[2],height:H[3],x:H[0],y:H[1]});var $=aSE(R,"svg",{id:"sd_"+g,preserveAspectRatio:"none",viewBox:"0 0 100 100",overflow:"visible",width:H[2],height:H[3],x:H[0],y:H[1]});let ee=[!($.style.cursor="crosshair"),!1];le.length<1?(ee[0]="log"==M,ee[1]="log"==T):(ee[0]=le[0],ee[1]=le[1]);var y=cTi(Q[2],s[0],V[0]),E=cTi(Q[3],s[1],V[1]),C=(_.length<1&&4<=Q[2]/y&&(Q[0]=b(N[0]/y)*y,Q[2]=d(N[1]/y)*y-Q[0]),x.length<1&&4<=Q[3]/E&&(Q[1]=b(I[0]/E)*E,Q[3]=d(I[1]/E)*E-Q[1]),cGr(g,Q,B,ee,V),aSE($,"defs")),he=(""!=A&&(aM(C,g,"o",[aSE(null,"circle",{r:"5"})],1),aM(C,g,"+",[aSL(null,0,-5,0,5,"","",""),aSL(null,-5,0,5,0,"","","")]),aM(C,g,"*",[aSL(null,0,-5,0,5,"","",""),aSL(null,-5,0,5,0,"","",""),aSL(null,-3.5,-3.5,3.5,3.5,"","",""),aSL(null,-3.5,3.5,3.5,-3.5,"","","")]),aM(C,g,".",[aSE(null,"circle",{r:"1.5","stroke-width":3})]),aM(C,g,"x",[aSL(null,-3.5,-3.5,3.5,3.5,"","",""),aSL(null,-3.5,3.5,3.5,-3.5,"","","")]),aM(C,g,"_",[aSL(null,-5,0,5,0,"","","")]),aM(C,g,"|",[aSL(null,0,-5,0,5,"","","")]),aM(C,g,"sq",[aSR(null,-5,-5,10,10,"","","")],1),aM(C,g,"^",[aSE(null,"polygon",{points:"-5 3, 0 -5, 5 3"})],1),aM(C,g,"v",[aSE(null,"polygon",{points:"-5 -4, 0 5, 5 -4"})],1),aM(C,g,">",[aSE(null,"polygon",{points:"-3 -5, 5 0, -3 5"})],1),aM(C,g,"<",[aSE(null,"polygon",{points:"-5 0, 3 5, 3 -5"})],1)),h.length/t),ue=a.length==h.length;if(!ue&&he!=a.length)throw new Error("Dimension must agree");var S=aSE($,"clipPath",{id:"cpg_"+g}),de=(aSE(null,aSR(S,0,0,"100%","100%"),{id:"cpr_"+g}),aSE($,"g",{id:"gp_"+g,"clip-path":"url(#cpg_"+g+")"}));for(let l=0;l<t;++l){var fe=l%z.length,ye=Array.isArray(te)?te[l]:te,ve="url(#m"+(Array.isArray(A)?A[l]:A)+")";let e="",t=2;switch(ye){case":":e="2 3";break;case"--":e="12 6";break;case"-.":e="9 3 3 3";break;case"*":t=0}var Ee=aSE(de,"polyline",{class:"l",id:"pl_"+g+"_"+l,stroke:z[fe],"stroke-dasharray":e,"marker-start":ve,"marker-mid":ve,"marker-end":ve,"stroke-width":t,"vector-effect":"non-scaling-stroke",fill:"none"});for(let e=0;e<he;++e){var pe,Se=ue?a[l*he+e]:a[e],_e=h[l*he+e];isFinite(Se)&&isFinite(_e)&&((pe=$.createSVGPoint()).x=100*(Se-Q[0])/Q[2],pe.y=100-100*(_e-Q[1])/Q[3],Ee.points.appendItem(pe))}}M=aSR($,0,0,"100%","100%","none","black",1),aSE(null,M,{id:"plr_"+g,"pointer-events":"visible"}),"white"==F&&aSE(R,Z),T=aSE(ce,"g",{id:"bd_"+g,"stroke-width":2,"stroke-linecap":"round","stroke-linejoin":"round",class:"b","pointer-events":"visible"});tr(T,[H[2]-18,H[1]-24]),aSE(T,"polyline",{stroke:"black",fill:"none",points:"8,0 8,16 2,9 8,16 14,9"}),aSE(T,"polyline",{stroke:"black",fill:"none",points:"0,17 0,20 16,20 16,17"}),aSR(T,0,0,21,21),T.onclick=()=>{dSvg(g,u)},M.onclick=e=>pC(e,g,Q,B,ee,V,ne),R.oncontextmenu=e=>{e.preventDefault()},$.onmousedown=e=>pM(e,g),$.ondblclick=()=>sAL(g,Q,Q,B,ee,V),R.onmousedown=e=>{e.preventDefault()},R.onmouseup=()=>pZ(g,Q,B,ee,V),0<L.length&&(Z.onwheel=e=>sL(e,g,X)),new ResizeObserver(()=>rS(g,W[0],W[1],X,U)).observe(R),rS(g,W[0],W[1],X,U)}}