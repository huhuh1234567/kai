(function(){

	var K = imports("k");
	var once = K.once;

	var K_AREA = imports("k-area");
	var onAreaMouseDown = K_AREA.onAreaMouseDown;

	var K_DOM_MOUSE = imports("k-dom-mouse");
	var onMouseMove = K_DOM_MOUSE.onMouseMove;
	var onMouseUp = K_DOM_MOUSE.onMouseUp;

	var CONFIG = imports("k.config");

	function onAreaClick(area,task){
		return onAreaMouseDown(area,function(e0,x,y){
			var canvas = area.getCanvas();
			var up$ = onMouseUp(document.body,function(e){
				if(e.button===e0.button){
					up$.remove();
					if(area.isHover){
						task(e,canvas.getLastX(),canvas.getLastY(),x,y);
					}
				}
			});
		});
	}

	function onAreaSlide(area,task){
		return onAreaMouseDown(area,function(e0,x,y){
			var canvas = area.getCanvas();
			var move$ = onMouseMove(document.body,function(e){
				task(e,canvas.getLastX(),canvas.getLastY());
			});
			var up$ = onMouseUp(document.body,function(e){
				if(e.button===e0.button){
					up$.remove();
					move$.remove();
					task(e,canvas.getLastX(),canvas.getLastY());
				}
			});
			task(e0,x,y);
		});
	}

	function onAreaDrag(area,task){
		return onAreaMouseDown(area,function(e0,x0,y0){
			var canvas = area.getCanvas();
			var x1 = x0;
			var y1 = y0;
			var move$ = onMouseMove(document.body,function(e){
				var x = canvas.getLastX();
				var y = canvas.getLastY();
				task(e,x,y,x1,y1,x0,y0);
				x1 = x;
				y1 = y;
			});
			var up$ = onMouseUp(document.body,function(e){
				if(e.button===e0.button){
					up$.remove();
					move$.remove();
					task(e,canvas.getLastX(),canvas.getLastY(),x1,y1,x0,y0);
				}
			});
			task(e0,x0,y0,x1,y1,x0,y0);
		});
	}

	function onAreaHold(area,task){
		return onAreaMouseDown(area,function(e0,x0,y0){
			var canvas = area.getCanvas();
			var timer = 0;
			function hold(){
				timer = setTimeout(hold,CONFIG.HOLD_TIME);
				task(null,canvas.getLastX(),canvas.getLastY(),x0,y0);
			}
			function setup(e,x,y){
				timer = setTimeout(hold,CONFIG.HOLD_DELAY);
				task(e,x,y,x0,y0);
			}
			function clear(){
				clearTimeout(timer);
				timer = 0;
			}
			var setup$ = area.onEnter(setup);
			var clear$ = area.onLeave(clear);
			var up$ = onMouseUp(document.body,function(e){
				if(e.button===e0.button){
					up$.remove();
					setup$.remove();
					clear$.remove();
					timer&&clear();
				}
			});
			setup(e0,x0,y0);
		});
	}

	exports.onAreaClick = onAreaClick;
	exports.onAreaSlide = onAreaSlide;
	exports.onAreaDrag = onAreaDrag;
	exports.onAreaHold = onAreaHold;

})();