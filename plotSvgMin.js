{const a="Sans,Arial",b=2,c=1,d=12,e=10,f="Lucida Sans Typewriter",g=30,h=4,i=4,j=400,k=4,l=24,m=12,n=[10,10],o=[10,10],p=8,q=p/2,r=[1,2,5,10],s=["#0072BE","#DA5319","#EEB220","#7E2F8E","#77AD30","#4CBFEF","#A3142F"],t="http://www.w3.org/2000/svg",u=Math.round,v=Math.floor,w=Math.log10,x=Math.ceil,y=Array.isArray,z=1/0,A=document;function plotSvg(E,_,B,V,{color:ce="",title:ue="",subtitle:N="",xlabel:fe="",ylabel:de="",xlim:he=[],ylim:ve=[],style:ge="-",marker:F="",legend:ye=[],xScale:xe="lin",yScale:me="lin",grid:pe=!0,gridMinor:D=[],xtick:we=[],ytick:be=[],xticklbl:ke=[],yticklbl:_e=[],xtickangle:Be=0,ytickangle:Ae=0,legendLocation:L="northeastoutside",linTip:Ve=!0}={}){var T=ee(E);const Ne=A.createElement("div"),M=(re(T,Ne),te(Ne,"style","width:100%;height:100%;min-width:"+j+"px;min-height:200px;overflow:none"),re(Ne,"svg",{id:"s_"+E,width:"100%",height:"100%"}));var T=ne(M),S=(M.innerHTML+="<style>\n<![CDATA[\ntext.cll {\nfont-size:"+e+"px;\nfill:black;\ndominant-baseline:central;\nfont-family:"+f+";\n}\n.b:hover polyline{\nopacity:0.5;\n}\n]]>\n</style>\n",re(null,"g",{"pointer-events":"visible"})),L=(S.onclick=e=>nt(e,0),S.ondblclick=e=>nt(e,V),"northeast"==L?"white":"none");let C=null,Ee=null,Fe=null,Y=0,R=0;if(0<le(ye)&&0<V&&0<le(_)){C=re(S,"svg",{id:"sl_"+E}),Fe=re(C,"defs"),re(M,S);var De=V;let n=ye;le(ye)>V&&(n=ye.slice(0,De)),re(null,Ee=ae(C,0,0,0,"100%",L,"black"),{id:"rect_leg_"+E});for(let l=0;l<De;++l){var Le=l*(e+i)+i,Te=new re(C,"g",{id:"lgi_"+E+"_"+l}),Me=re(Te,"text",{id:"lti_"+E+"_"+l,class:"cll",x:h+g+h,y:Le+e/2}),Le=Le+e/2;vt(Te,h+","+Le+" "+(h+g/2)+","+Le+" "+(h+g)+","+Le);let t="";l<le(n)&&(t=n[l]),Me.append(A.createTextNode(t))}var ze=S.getBBox();Y=(e+i)*De+i,R=ze.width+2*h}var Se=ue.split("\n"),Ce=N.split("\n");const Ye=re(M,"svg",{id:"st_"+E,overflow:"visible"});let H=0;if(0<le(ue))for(let e=0;e<le(Se);++e)H+=l+k,oe(Ye,Se[e],"50%",H,l);if(0<le(N))for(let e=0;e<le(Ce);++e)H+=m+k,oe(Ye,Ce[e],"50%",H,m);H+=k;ze=re(M,"g");const Re=re(ze,"svg",{id:"s_btm_"+E,overflow:"visible"});if(0<le(fe)){const text=oe(Re,fe,"50%","100%",d);ie(text,[0,-d/2])}const He=re(M,"svg",{id:"sy_"+E,overflow:"visible"});if(0<le(de)){const text=oe(He,de,"100%","50%",d);re(null,text,{"writing-mode":"vertical-rl","transform-origin":"center"}),ie(text,[d,0],[-1,-1])}const Ue=re(M,"svg",{id:"s_bg_"+E,preserveAspectRatio:"none",viewBox:"0 0 100 100"}),U=re(M,"svg",{id:"sd_"+E,preserveAspectRatio:"none",viewBox:"0 0 100 100"});let X=[!(U.style.cursor="crosshair"),!1],Xe=[],Ie=[],I=[],O=[],G=[],K=[],P=[],Oe=[],W=[],je=null,Ge=null;function Ke(){U.innerHTML="",je=re(U,"defs"),""!=F&&($("o",[re(null,"circle",{r:"5"})],1),$("+",[se(null,0,-5,0,5,"","",""),se(null,-5,0,5,0,"","","")]),$("*",[se(null,0,-5,0,5,"","",""),se(null,-5,0,5,0,"","",""),se(null,-3.5,-3.5,3.5,3.5,"","",""),se(null,-3.5,3.5,3.5,-3.5,"","","")]),$(".",[re(null,"circle",{r:"1.5","stroke-width":3})]),$("x",[se(null,-3.5,-3.5,3.5,3.5,"","",""),se(null,-3.5,3.5,3.5,-3.5,"","","")]),$("_",[se(null,-5,0,5,0,"","","")]),$("|",[se(null,0,-5,0,5,"","","")]),$("sq",[ae(null,-5,-5,10,10,"","","")],1),$("^",[re(null,"polygon",{points:"-5 3, 0 -5, 5 3"})],1),$("v",[re(null,"polygon",{points:"-5 -3, 0 5, 5 -3"})],1),$("tr",[re(null,"polygon",{points:"-3 -5, 5 0, -3 5"})],1),$("tl",[re(null,"polygon",{points:"-5 0, 3 5, 3 -5"})],1)),X=[!1,!1],Xe=_,Ie=B,I=he,O=ve,G=we,K=be,"log"==xe&&(Xe=_.map(w),1<le(I)&&(I=I.map(w),isNaN(I[0])||isNaN(I[1])?I=[]:(I[0]=I[0]==-z?0:I[0],I[1]=I[1]==-z?0:I[1])),0<le(G)&&(G=G.map(w)),X[0]=!0),"log"==me&&(Ie=B.map(w),1<le(O)&&(O=O.map(w),isNaN(O[0])||isNaN(O[1])?O=[]:(O[0]=O[0]==-z?0:O[0],O[1]=O[1]==-z?0:O[1])),0<le(K)&&(K=K.map(w)),X[1]=!0);var e=et(Xe,I),t=et(Ie,O),l=(W=[e[0],t[0],e[1]-e[0],t[1]-t[0]],le(D)<1?(P[0]="log"==xe,P[1]="log"==me):1<le(D)?(P[0]=D[0],P[1]=D[1]):(P[0]=D,P[1]=D),at(W[2],n[0],X[0])),i=at(W[3],n[1],X[1]),r=[0==le(G),0==le(K)],o=(Oe=[(X[0]||P[0])&&r[0],(X[1]||P[1])&&r[1]],P=[P[0]&&r[0],P[1]&&r[1]],le(I)<1&&4<=W[2]/l&&(W[0]=v(e[0]/l)*l,W[2]=x(e[1]/l)*l-W[0]),le(le(O))<1&&4<=W[3]/i&&(W[1]=v(t[0]/i)*i,W[3]=x(t[1]/i)*i-W[1]),axLblBb=st(W),le(B)/V),a=le(_)==le(B);if(!a&&o!=le(_))throw new Error("Dimension must agree");var c=re(U,"g",{id:"gp_"+E});for(let l=0;l<V;++l){var u=l%le(s),f=y(ge)?ge[l]:ge,d="url(#m"+(Array.isArray(F)?F[l]:F)+"_"+E+")",h=y(ce)?l<le(ce)?ce[l]:"":ce,u=""==h?s[u]:h;let e="",t=2;switch(f){case":":e="2 3";break;case"--":e="12 6";break;case"-.":e="0 1.5 9 3 3 2.5";break;case"*":t=0}var g=vt(c,"",u,e,t);re(null,g,{id:"pl_"+E+"_"+l,"marker-start":d,"marker-mid":d,"marker-end":d,"stroke-width":t}),null!=C&&(h="url(#ml"+(y(F)?F[l]:F)+"_"+E+")",re(null,C.childNodes[l+2].childNodes[1],{"stroke-dasharray":e,"marker-mid":h,"stroke-width":t,stroke:u}));for(let e=0;e<o;++e){var m,p=a?Xe[l*o+e]:Xe[e],b=Ie[l*o+e];isFinite(p)&&isFinite(b)&&((m=U.createSVGPoint()).x=100*(p-W[0])/W[2],m.y=100-100*(b-W[1])/W[3],g.points.appendItem(m))}}re(null,Ge=ae(U,0,0,"100%","100%","none","black"),{id:"plr_"+E,"pointer-events":"visible"})}Ke();var N=axLblBb[1].width+.5*d+1.5*d*(0<le(de))+k,de=axLblBb[0].height+k+(1.5*d+k)*(0<le(fe)),fe=T[3]-de-H,L="white"==L,Pe=L?2*h:0;const qe=L?2*i:0;var Z=fe-qe;R=R>j?j:R;const We=Y=Y>Z?Z:Y;Z=T[2]-R*(1-L)-N-2*h;const J=[N,H,Z,fe];N=-T[3]+J[1]+J[3];const Ze=[T[2]-J[2],T[3]-J[3]];Z=T[2]-R-h-Pe;const Je=H+qe/2,Qe=(re(null,Ue,{width:J[2],height:J[3],x:J[0],y:J[1]}),re(null,U,{width:J[2],height:J[3],x:J[0],y:J[1]}),re(null,He,{width:J[0],y:J[1],height:J[3]}),ie(ze,[J[0],N]),re(null,Re,{y:"100%",width:J[2],height:de}),re(null,Ye,{x:J[0],width:J[2]}),null!=C&&(ie(S,[Z,Je]),re(null,C,{height:Y,width:R,viewBox:"0 0 "+R+" "+Y}),te(Ee,"width","100%"),L)&&re(M,S),re(Ye,"g",{id:"b_"+E})),Q=re(Qe,"g",{"stroke-width":2,"stroke-linecap":"round","stroke-linejoin":"round",class:"b","pointer-events":"visible"});ie(Q,[J[2]-18,J[1]-24]),vt(Q,"8,0 8,16 2,9 8,16 14,9"),vt(Q,"0,17 0,20 16,20 16,17"),ae(Q,0,0,21,21),Q.onclick=()=>{var e,l;Qe.style.display="none",U.style.cursor="auto",e='<svg width="'+(e=ne(M))[2]+'" height="'+e[3]+'" xmlns="'+t+'">',e=new Blob([e,M.innerHTML,"</svg>"],{type:"image/svg+xml;charset=utf-8"}),e=URL.createObjectURL(e),(l=A.createElement("a")).href=e,l.download="snapshot_"+ue+".svg",re(A.body,l),l.click(),l.remove(),Qe.style.display="block",U.style.cursor="crosshair"};let $e=20;function et(n,i){if(le(i)<2){let e=le(n),t=-z,l=z;for(;e--;)isFinite(n[e])&&(l=n[e]<l?n[e]:l,t=n[e]>t?n[e]:t);i=[l,t]}return i[0]==i[1]&&(i[0]=i[0]-.5,i[1]=i[1]+.5),i}function tt(e,t,l=null){var n=re(Qe,"g",{"pointer-events":"visible"});const i=ae(n,0,-14,0,18,"none"),r=oe(n,e,3,-1,12,"start",a,"grey");e=r.getBBox().width+6;let o=t;function s(e){re(null,i,{stroke:e?"#73AFD7":"#A0A0A0","stroke-width":e?2.5:1.5}),te(r,"fill",e?"#black":"grey")}$e+=e+5,re(null,i,{width:e,rx:3}),s(o),ie(n,[J[2]-$e,J[1]-8]),n.onclick=()=>{s(o=!o),null!=l&&l(o)}}function $(e,t,l=0){var n=re(je,"marker",{id:"m"+e+"_"+E,markerWidth:"10",markerHeight:"10",refX:"5",refY:"5",markerUnits:"userSpaceOnUse",fill:"none",stroke:"context-stroke"}),i=re(n,"g",{"stroke-width":1.5,"vector-effect":"non-scaling-stroke",class:"marker_"+E});ie(i,[5,5],[1,1]);for(let e=0;e<le(t);++e)re(i,t[e]);te(re(Fe,n.cloneNode(!0),{id:"ml"+e+"_"+E}).childNodes[0],"class",""),l&&re(je,n.cloneNode(!0),{id:"mf"+e+"_"+E,fill:"context-stroke"})}function lt(e,t,l=0){var n=ee("gpl_"+e+"_"+t),i=l?"block":"none";ee("pl_"+e+"_"+t).style.display=i,ee("lgi_"+e+"_"+t).style.opacity=.3+.7*l,null!=n&&(n.style.display=i)}function nt(t,l){var t=t.offsetY-Je+ht(C)[1],n=v((t-i/2)/(e+i)),t=ee("pl_"+E+"_"+n);if(null!=t){var r="none"!=t.style.display,o=0==l?n+1:l;for(let e=0==l?n:0;e<o;++e)r?e==n&&0!=l||lt(E,e):lt(E,e,1)}}function it(){var e=ne(M),t=ne(U),l=e[2]-Ze[0],e=e[3]-Ze[1];t[2]!=l&&(te(U,"width",l),te(Ue,"width",l),te(Ye,"width",l),te(Re,"width",l),null!=C&&(C.x.baseVal.value+=l-t[2]),Q.transform.baseVal[0].matrix.e+=l-t[2]),t[3]!=e&&(te(U,"height",e),te(Ue,"height",e),te(He,"height",e),null!=C)&&(l=(l=e-qe)>We?We:l,te(C,"height",l),C.viewBox.baseVal.height=l),rt()}function rt(){var t=A.getElementsByClassName("marker_"+E);for(let e=0;e<le(t);++e){var l=ne(U),n=ht(U),i=n[2]/l[2],n=n[3]/l[3];t[e].transform.baseVal[1].matrix.a=i,t[e].transform.baseVal[1].matrix.d=n}}function ot(e){var t=100*(e[0]-W[0])/W[2],l=100*(W[1]+W[3]-e[1]-e[3])/W[3];U.viewBox.baseVal.width=100*e[2]/W[2],U.viewBox.baseVal.height=100*e[3]/W[3],U.viewBox.baseVal.x=t,U.viewBox.baseVal.y=l,re(null,plr,{x:t,y:l}),st(e),rt()}function st(e){for(var l=[G,K],i=[ke,_e],r=[Be,Ae],s=[0,0],t=A.getElementsByClassName("cg_"+E);0<le(t);)t[0].remove();for(let t=0;t<2;++t){var a=t?He:Re,c=re(a,"g",{id:"ga"+a+"_"+E}),a=at(e[2+t],n[t],X[t]),u=e[t]+e[2+t],f=(x(e[t]/a)-1)*a,u=v(u/a)*a,h=0<le(l[t])?l[t]:ut(f,a,u),g=0<le(i[t])?i[t]:X[t]?ft(h.map(e=>10**e)):ft(h),y=100*a/e[2+t],f=re(Ue,"defs",{class:"cg_"+E}),m=re(f,"g",{id:"mg"+t+"_"+E}),u=X[t]&&1==a,f=Oe[t]?o[t]/(2-u):1;const N=ut(10/f,10/f,10);if(1<f){X[t]&&1==a&&N.forEach((e,t)=>{N[t]=10*w(N[t])});for(let e=0;e<le(N)-1;++e)ct(m,N[e]/10*y*(1-2*t),t,q,"2 4",P[t])}ct(m,0,t,p,"",pe);var u=r[t],b=(u=(u-(t?90:0))%180,function(t,l,n){var i=Array(le(t));for(let e=0;e<le(t);++e)i[e]=100*(t[e]-l)/n;return i}(h,e[t],e[2+t])),_=u<-11?"end":11<u?"start":"middle";for(let e=0;e<le(h);++e){var B=0<t?100-b[e]:b[e],V=t?[0,B]:[B,0],B=t?["100%",B+"%"]:[B+"%",k+.5*d*("middle"==_)];0<=b[e]&&(0<e||l)&&re(null,oe(c,g[e],B[0],B[1],d,_),{"dominant-baseline":"central",class:"cg_"+E,transform:"translate(-"+.5*d*t+" 0) rotate("+r[t]+")","transform-origin":B[0]+" "+B[1]}),re(Ue,"use",{href:"#mg"+t+"_"+E,x:V[0],y:V[1],class:"cg_"+E})}s[t]=c.getBBox()}return s}function at(e,t,l){var t=e/t,n=v(w(t));const i=x(t/10**n);var o=r.findIndex(function(e){return e>=i}),t=r[o]*10**n;return l&&1<=e&&t<1?1:t}function ct(e,t,l,n,i,r){let o=[t,0,0,n,t,100];0<l&&(o=[o[1],o[0],o[3],o[2],o[5],o[4]]),r&&se(e,o[0],o[1],o[4],o[5],"#DFDFDF",i);n=se(e,0,0,o[2],o[3]),t=se(e,-o[2],-o[3],0,0);ie(n,[o[0],o[1]],[1,1]),ie(t,[o[4],o[5]],[1,1]),re(null,n,{class:"marker_"+E}),re(null,t,{class:"marker_"+E})}function ut(t,l,e){var n=v((e-t)/l*(1+1e-12))+1;out=Array(n);for(let e=0;e<n;++e)out[e]=t+l*e;return out}function ft(l){var n=["y","z","a","f","p","n","u","m","","k","M","G","T","P","E","Z","Y"],i=Array(le(l)),e=le(l),r=le(n);for(let t=0;t<e;++t){var o=l[t].toExponential(5).split(/e/);let e=v(+o[1]/3)+8;e>r-1?e=r-1:e<0&&(e=0),i[t]=u(o[0]*10**(+o[1]-3*(e-8))*1e3)/1e3+n[e]}return i}function ee(e){return A.getElementById(e)}function te(e,t,l){e.setAttribute(t,l)}function dt(e,t){return e.getAttribute(t)}function le(e){return e.length}function ne(e){return[e.x.baseVal.value,e.y.baseVal.value,e.width.baseVal.value,e.height.baseVal.value]}function ht(e){return[e.viewBox.baseVal.x,e.viewBox.baseVal.y,e.viewBox.baseVal.width,e.viewBox.baseVal.height]}function ie(e,t,l){t=null!=t?"translate("+t[0]+" "+t[1]+")":"";t+=null!=l?"scale("+l[0]+" "+l[1]+")":"",e.setAttribute("transform",t)}function re(e,l,n){var i,r="string"==typeof l?A.createElementNS(t,l):l;for(i in n)te(r,i,n[i]);return null!=e&&e.appendChild(r),r}function oe(e,t,l,n,i,r="middle",o=a,s="black"){e=re(e,"text",{x:l,y:n,fill:s,"font-size":i,"text-anchor":r,"font-family":o,"stroke-width":1});return e.append(A.createTextNode(t)),e}function se(e,t,l,n,i,r="black",o="",s=1){return re(e,"line",{x1:t,y1:l,x2:n,y2:i,stroke:r,"stroke-width":s,"stroke-dasharray":o,"vector-effect":"non-scaling-stroke"})}function vt(e,t="",l="black",n="",i=2){return re(e,"polyline",{points:t,fill:"none",stroke:l,"stroke-width":i,"stroke-dasharray":n,"vector-effect":"non-scaling-stroke"})}function ae(e,t,l,n,i,r="none",o="none",s=2,a=0){return re(e,"rect",{x:t,y:l,width:n,height:i,rx:a,stroke:o,"stroke-width":s,fill:r,"vector-effect":"non-scaling-stroke"})}tt("log(y)",X[1],e=>{me=e?"log":"lin",Ke(),it()}),tt("log(x)",X[0],e=>{xe=e?"log":"lin",Ke(),it()}),Ge.onclick=t=>{var l=ne(U),n=(c=ht(U))[2]/l[2],i=c[3]/l[3],s=(t.offsetX-l[0])*n+c[0],s=(result=function(e,t,l,n,i,r){let o=null,s=z,a=0,c=0;var u=ee("gp_"+e),f=le(u.children);for(let e=0;e<f;++e){var d=u.children[e],h=d.points,v=le(h);if("none"!=d.style.display)for(let e=1;e<v;++e){var g,y,x,m,p,w,b=h[e-1],k=h[e];t<b.x-n&&t<k.x-n||t>b.x+n&&t>k.x+n||l<b.y-i&&l<k.y-i||l>b.y+i&&l>k.y+i||(g=k.x-b.x,x=(g*(t-b.x)+(y=k.y-b.y)*(l-b.y))/(g*g+y*y),1<=(x=((g=b.x+g*x)-t)*(g-t)/n/n+((y=b.y+y*x)-l)*(y-l)/i/i))||x>s||(s=x,o=d,x=b.x<t?t-b.x:b.x-t,m=b.y<l?l-b.y:b.y-l,p=k.x<t?t-k.x:k.x-t,w=k.y<l?l-k.y:k.y-l,x<p&&x<n&&m<i?(a=b.x,c=b.y):p<n&&w<i?(a=k.x,c=k.y):r&&0!=dt(d,"stroke-width")?(a=g,c=y):o=null)}}return{ele:o,x:a,y:c}}(E,s,t=(t.offsetY-l[1])*i+c[1],c=6*n,u=6*i,Ve)).ele;if(null!=s){var t=result.x,c=result.y,u="pl_"+E,s=s.id,u=s.slice(le(u),le(s)),s=ee("lti_"+E+u),f=dt(ee("pl_"+E+u),"stroke"),d=function(e,t,l){return _=e[0]/100*t[2]+t[0],B=(1-e[1]/100)*t[3]+t[1],[_=l[0]?10**_:_,B=l[1]?10**B:B]}([t,c],W,X);let e=ee("gpl_"+E+u);null==e&&(e=re(U,"g",{id:"gpl_"+E+u}));const v=re(e,"g",{class:"marker_"+E}),g=re(v,"g");u=ae(g,0,-33,1,33,f,"#DFDFDF",1,rx=4),f=(ie(v,[t,c],[n,i]),v.onclick=e=>{e.ctrlKey?h(1):(v.remove(),1<e.detail&&ot(W))},null!=s&&(re(null,text=oe(g,s.textContent,2,-35,12,"start",a,"white"),{"font-weight":"bold"}),re(null,u,{y:-48,height:48})),oe(g,"x: "+ft([d[0]]),2,-19,12,"start",a,"white"),oe(g,"y: "+ft([d[1]]),2,-5,12,"start",a,"white"),v.getBBox());const y=[f.width+4,f.height],x=(re(null,u,{width:y[0]}),null!=s&&se(g,0,-31,y[0],-31,"white"),se(v,0,0,6,-6));t=g.getBoundingClientRect();let r=t.right+5+Ne.offsetLeft>l[0]+l[2],o=t.y-5-Ne.offsetTop<l[1];function h(e){let t=5,l=-5,n=1,i=1;e&&([r,o]=[!o,r]),r&&(t=-y[0]-5,n=-1),o&&(l=y[1]+5,i=-1),ie(g,[t,l]),ie(x,null,[n,i])}h(!1),ae(v,-2,-2,4,4,"black"),re(v,"circle",{r:6,fill:"none","pointer-events":"visible"})}},M.oncontextmenu=e=>{e.preventDefault()},U.onmousedown=t=>{{let e=0;if(t.button==c||t.button==b&&t.ctrlKey)e=1;else if(t.button!=b)return;U.style.cursor=e?"move":"zoom-in";const o=t.offsetX,s=t.offsetY,l=ae(M,o,s,0,0,"black"),n=e?0:.3;re(null,l,{id:"zoom_rect"+E,"fill-opacity":n}),M.onmousemove=e=>{var t=o,l=s,n=ee("zoom_rect"+E),i=e.offsetX,t=i-t,l=(e=e.offsetY)-l,r=0==dt(n,"fill-opacity");r||0<=t?te(n,"width",t):re(null,n,{width:-t,x:i}),r||0<=l?te(n,"height",l):re(null,n,{height:-l,y:e})}}},U.ondblclick=()=>ot(W),M.onmousedown=e=>{e.preventDefault()},M.onmouseup=()=>{var t=ee("zoom_rect"+E);if(U.style.cursor="crosshair",(M.onmousemove=null)!=t){var l=0==dt(t,"fill-opacity"),n=ne(t);if(t.remove(),!~l||0!=n[2]&&0!=n[3]){var t=ht(U),i=ne(U);let e=[];e=l?[-n[2]/i[2],n[3]/i[3],1,1]:[(n[0]-i[0])/i[2],1-(n[1]+n[3]-i[1])/i[3],n[2]/i[2],n[3]/i[3]];l=[W[0]+W[2]*t[0]/100,W[1]+W[3]*(100-t[3]-t[1])/100,W[2]*t[2]/100,W[3]*t[3]/100];ot([l[0]+e[0]*l[2],l[1]+e[1]*l[3],e[2]*l[2],e[3]*l[3]])}}},0<le(ye)&&(S.onwheel=e=>{We;var t=ne(C),l=ht(C),t=We-t[3];return l[1]+=e.deltaY,l[1]<0&&(l[1]=0),t<l[1]&&(l[1]=t),C.viewBox.baseVal.y=l[1],Ee.y.baseVal.value=l[1],!1}),new ResizeObserver(()=>it()).observe(M),it()}}