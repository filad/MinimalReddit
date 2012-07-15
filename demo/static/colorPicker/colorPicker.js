/**
 * An old colorPicker utility I found, had to modify in some places. But still nearly unreadable.. - Adam
 * Find the CSS definitions in colorPicker.css
 */

function setColorPicker() {
	
function $(v,o) { return((typeof(o)=='object'?o:document).getElementById(v)); }
function $S(o) { o=$(o); if(o) return(o.style); }
function abPos(o) { var o=(typeof(o)=='object'?o:$(o)), z={X:0,Y:0}; while(o!=null) { z.X+=o.offsetLeft; z.Y+=o.offsetTop; o=o.offsetParent; }; return(z); }
function agent(v) { return(Math.max(navigator.userAgent.toLowerCase().indexOf(v),0)); }
function isset(v) { return((typeof(v)=='undefined' || v.length==0)?false:true); }
function toggle(i,t,xy) { var v=$S(i); v.display=t?t:(v.display=='none'?'block':'none'); if(xy) { v.left=xy[0]; v.top=xy[1]; } }
function XY(e,v) { e = e||event; var o=agent('msie')?{'X':e.clientX+document.body.scrollLeft,'Y':e.clientY+document.body.scrollTop}:{'X':e.pageX,'Y':e.pageY}; return(v?o[v]:o); }
function zero(n) { return(!isNaN(n=parseFloat(n))?n:0); }
function zindex(d) { d.style.zIndex=zINDEX++; }


/* COLOR PICKER */

Picker={};

Picker.stop=1;

Picker.hsv={H:0, S:0, V:100};

zINDEX=100;

Picker.core=function(o,e,xy,z,fu) {

	function point(a,b,e) { eZ=XY(e);hsv={H:0, S:0, V:100}; commit([eZ.X+a,eZ.Y+b]); }
	function M(v,a,z) { return(Math.max(!isNaN(z)?z:0,!isNaN(a)?Math.min(a,v):v)); }

	function commit(v) { 
		if(fu) fu(v);
	
		if(o=='mCur') { var W=parseInt($S('mSpec').width), W2=W/2, W3=W2/2; 

			var x=v[0]-W2-3, y=W-v[1]-W2+21, SV=Math.sqrt(Math.pow(x,2)+Math.pow(y,2)), hue=Math.atan2(x,y)/(Math.PI*2);

			hsv={'H':hue>0?(hue*360):((hue*360)+360), 'S':SV<W3?(SV/W3)*100:100, 'V':SV>=W3?Math.max(0,1-((SV-W3)/(W2-W3)))*100:100};

			$('mHEX').innerHTML=colorPickerLibrary.HSV_HEX(hsv); 
			//$S(document.body).backgroundColor='#'+$('mHEX').innerHTML;
			if( /Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent)) {
				document.body.style.backgroundImage = '';
			} else {
				document.body.style.backgroundImage = 'url(static/img/trans-bg-filkor.png)';
			}
			document.body.style.backgroundColor='#'+$('mHEX').innerHTML; 
			colorPickerLibrary.cords(W);

		}
		else if(o=='mSize') { var b=Math.max(Math.max(v[0],v[1])+oH,75); colorPickerLibrary.cords(b);

			$S('colorPicker').height=(b+28)+'px'; $S('colorPicker').width=(b+20)+'px';
			$S('mSpec').height=b+'px'; $S('mSpec').width=b+'px';

		}
		else {
		
			if(xy) v=[M(v[0],xy[0],xy[2]), M(v[1],xy[1],xy[3])]; // XY LIMIT

			if(!xy || xy[0]) d.left=v[0]+'px'; if(!xy || xy[1]) d.top=v[1]+'px';

		}
	};

	if(Picker.stop) { Picker.stop=''; var d=$S(o), eZ=XY(e); if(!z) zindex($(o));

		if(o=='mCur') { var ab=abPos($(o).parentNode); point(-(ab.X-5),-(ab.Y-28),e); }
		
		if(o=='mSize') { var oH=parseInt($S('mSpec').height), oX=-XY(e).X, oY=-XY(e).Y; }
		
		else { var oX=zero(d.left)-eZ.X, oY=zero(d.top)-eZ.Y; }

		document.onmousemove=function(e){ if(!Picker.stop) point(oX,oY,e); };
		document.onmouseup=function(){ Picker.stop=1; document.onmousemove=''; document.onmouseup=''; };

	}
};


/* COLOR LIBRARY */

colorPickerLibrary={};

colorPickerLibrary.cords=function(W) {

	var W2=W/2, rad=(hsv.H/360)*(Math.PI*2), hyp=(hsv.S+(100-hsv.V))/100*(W2/2);

	$S('mCur').left=Math.round(Math.abs(Math.round(Math.sin(rad)*hyp)+W2+3))+'px';
	$S('mCur').top=Math.round(Math.abs(Math.round(Math.cos(rad)*hyp)-W2-21))+'px';

};

colorPickerLibrary.HEX=function(o) { o=Math.round(Math.min(Math.max(0,o),255));

    return("0123456789ABCDEF".charAt((o-o%16)/16)+"0123456789ABCDEF".charAt(o%16));

};

colorPickerLibrary.RGB_HEX=function(o) { var fu=colorPickerLibrary.HEX; return(fu(o.R)+fu(o.G)+fu(o.B)); };

colorPickerLibrary.HSV_RGB=function(o) {
    
    var R, G, A, B, C, S=o.S/100, V=o.V/100, H=o.H/360;

    if(S>0) { if(H>=1) H=0;

        H=6*H; F=H-Math.floor(H);
        A=Math.round(255*V*(1-S));
        B=Math.round(255*V*(1-(S*F)));
        C=Math.round(255*V*(1-(S*(1-F))));
        V=Math.round(255*V); 

        switch(Math.floor(H)) {

            case 0: R=V; G=C; B=A; break;
            case 1: R=B; G=V; B=A; break;
            case 2: R=A; G=V; B=C; break;
            case 3: R=A; G=B; B=V; break;
            case 4: R=C; G=A; B=V; break;
            case 5: R=V; G=A; B=B; break;

        }

        return({'R':R?R:0, 'G':G?G:0, 'B':B?B:0, 'A':1});

    }
    else return({'R':(V=Math.round(V*255)), 'G':V, 'B':V, 'A':1});

};

colorPickerLibrary.HSV_HEX=function(o) { return(colorPickerLibrary.RGB_HEX(colorPickerLibrary.HSV_RGB(o))); };


/* LOAD */

toggle('colorPicker','block');
	
}