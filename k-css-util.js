(function(){

	var K_CSS = imports("k-css");
	var css = K_CSS.css;

	function setSizeFull(el,margin){
		margin = margin||0;
		css(el,{
			"position": "absolute",
			"left": margin+"px",
			"top": margin+"px",
			"right": margin+"px",
			"bottom": margin+"px"
		});
		el.$width = el.offsetWidth;
		el.$height = el.offsetHeight;
	}

	function setSizeRect(el,width,height){
		css(el,{
			"width": width+"px",
			"height": height+"px"
		});
		el.$width = width;
		el.$height = height;
	}

	function setPositionAbsolute(el,x,y){
		css(el,{
			position: "absolute",
			left: x+"px",
			top: y+"px"
		});
		el.$x = x;
		el.$y = y;
	}

	function setSelectNone(el){
		css(el,{
			"user-select": "none",
			"cursor": "default"
		});
	}

	function setBorderNone(el){
		css(el,{
			"margin": "0px",
			"padding": "0px",
			"border-style": "none"
		});
	}

	function registerSizeRect(el){
		css(el,{
			"width": "0px",
			"height": "0px"
		});
		var width = 0;
		var height = 0;
		Object.defineProperties(el,{
			$width: {
				get: function(){
					return width;
				},
				set: function(value){
					if(width!==value){
						width = value;
						el.$dirty();
					}
				}
			},
			$height: {
				get: function(){
					return height;
				},
				set: function(value){
					if(height!==value){
						height = value;
						el.$dirty();
					}
				}
			}
		});
		el.$onRefresh(function(){
			css(el,{
				width: width+"px",
				height: height+"px"
			});
		});
	}

	function registerPositionAbsolute(el){
		css(el,{
			position: "absolute",
			left: "0px",
			top: "0px"
		});
		var x = 0;
		var y = 0;
		Object.defineProperties(el,{
			$x: {
				get: function(){
					return x;
				},
				set: function(value){
					if(x!==value){
						x = value;
						el.$dirty();
					}
				}
			},
			$y: {
				get: function(){
					return y;
				},
				set: function(value){
					if(y!==value){
						y = value;
						el.$dirty();
					}
				}
			}
		});
		el.$onRefresh(function(){
			css(el,{
				left: x+"px",
				top: y+"px"
			});
		});
	}

	exports.setSizeFull = setSizeFull;
	exports.setSizeRect = setSizeRect;
	exports.setPositionAbsolute = setPositionAbsolute;
	exports.setSelectNone = setSelectNone;
	exports.setBorderNone = setBorderNone;

	exports.registerSizeRect = registerSizeRect;
	exports.registerPositionAbsolute = registerPositionAbsolute;

})();