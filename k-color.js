(function(){

	var K = imports("k");
	var loop = K.loop;
	var loopArray = K.loopArray;

	var K_MATH = imports("k-math");
	var min = K_MATH.min;
	var max = K_MATH.max;
	var fix0Cycle = K_MATH.fix0Cycle;
	var fix0Symmetric = K_MATH.fix0Symmetric;
	var pad0 = K_MATH.pad0;

	function colorF2I(a){
		return Math.round(a*255);
	}

	function colorI2F(d){
		return d/255;
	}

	function color2rgb(color){
		var rgb = [0,0,0];
		loopArray(color,function(c,i){
			rgb[i] = colorI2F(c);
		});
		return rgb;
	}

	function rgb2color(rgb){
		var color = [0,0,0];
		loopArray(rgb,function(c,i){
			color[i] = colorF2I(c);
		});
		return color;
	}

	function hsl2rgb(hsl){
		var h = hsl[0];
		var s = hsl[1];
		var l = hsl[2];
		var rgb = [l,l,l];
		if(s!==0){
			var q = l<0.5? l*(1+s):l+s-l*s;
			var p = 2*l-q;
			loopArray([1/3,0,-1/3],function(d,i){
				var t = fix0Cycle(h+d,1);
				rgb[i] = t<1/6? p+(q-p)*6*t:t<1/2? q:t<2/3? p+(q-p)*(2/3-t)*6:p;
			});
		}
		return rgb;
	}

	function rgb2hsl(rgb){
		var r = rgb[0];
		var g = rgb[1];
		var b = rgb[2];
		var light = max(rgb);
		var dark = min(rgb);
		var h = 0;
		var s = 0;
		var l = (light+dark)/2;
		if(light!==dark){
			var d = light-dark;
			s = d/fix0Symmetric(l,1/2)/2;
			h = fix0Cycle(light===r? (g-b)/d/6:light===g? (b-r)/d/6+1/3:(r-g)/d/6+2/3,1);
		}
		return [h,s,l];
	}

	function hsl2color(hsl){
		return rgb2color(hsl2rgb(hsl));
	}

	function color2hsl(color){
		return rgb2hsl(color2rgb(color));
	}

	function string2color(str){
		var color = [0,0,0];
		if(str.charAt(0)==="#"){
			var value = str.substring(1);
			if(value.length===3){
				loop(3,function(i){
					var cs = value.charAt(i);
					color[i] = parseInt(cs+cs,16);
				});
			}
			else if(value.length===6){
				loop(3,function(i){
					var bi = i*2;
					color[i] = parseInt(value.substring(bi,bi+2),16);
				});
			}
		}
		return color;
	}

	function color2string(color){
		var str = "#";
		loopArray(color,function(c){
			str += pad0(c.toString(16),2);
		});
		return str;
	}

	exports.colorF2I = colorF2I;
	exports.colorI2F = colorI2F;

	exports.rgb2color = rgb2color;
	exports.color2rgb = color2rgb;

	exports.hsl2rgb = hsl2rgb;
	exports.rgb2hsl = rgb2hsl;

	exports.hsl2color = hsl2color;
	exports.color2hsl = color2hsl;

	exports.string2color = string2color;
	exports.color2string = color2string;

})();