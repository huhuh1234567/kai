(function(){

	var K = imports("k");
	var once = K.once;

	var K_AREA = imports("k-area");
	var onAreaMouseDown = K_AREA.onAreaMouseDown;
	var onAreaMouseUp = K_AREA.onAreaMouseUp;

	var CONFIG = imports("k.config");

	function onAreaSlide(area,task){
		return onAreaMouseDown(area,function(e,x,y){
			task(x,y);
			var handle = area.canvas.onMove(function(e,x,y){
				task(x,y);
			});
			once(onAreaMouseUp,area.canvas,function(e,x,y){
				handle.remove();
				task(x,y);
			});
		});
	}

	function onAreaClick(area,task){
		return onAreaMouseDown(area,function(e,x0,y0){
			once(onAreaMouseUp,area.canvas,function(e,x,y){
				if(area.isHover){
					task(x,y,x0,y0);
				}
			});
		});
	}

	function onAreaHold(area,task){
		return onAreaMouseDown(area,function(e,x0,y0){
			var x1 = x0;
			var y1 = y0;
			var handle = area.canvas.onMove(function(e,x,y){
				x1 = x;
				y1 = y;
			});
			task(x1,y1,x0,y0);
			var timer = setTimeout(function hold(){
				if(timer){
					timer = setTimeout(hold,CONFIG.HOLD_TIME);
				}
				if(area.isHover){
					task(x1,y1,x0,y0);
				}
			},CONFIG.HOLD_DELAY);
			once(onAreaMouseUp,area.canvas,function(e,x,y){
				handle.remove();
				if(timer){
					clearTimeout(timer);
					timer = 0;
				}
			});
		});
	}

	function onAreaDrag(area,task){
		return onAreaMouseDown(area,function(e,x0,y0){
			var x1 = x0;
			var y1 = y0;
			var handle = area.canvas.onMove(function(e,x,y){
				task(x,y,x1,y1,x0,y0);
				x1 = x;
				y1 = y;
			});
			once(onAreaMouseUp,area.canvas,function(){
				handle.remove();
			});
		});
	}

	exports.onAreaSlide = onAreaSlide;
	exports.onAreaClick = onAreaClick;
	exports.onAreaHold = onAreaHold;
	exports.onAreaDrag = onAreaDrag;

})();