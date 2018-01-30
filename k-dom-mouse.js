(function(){

	var K = imports("k");
	var once = K.once;

	var K_DOM = imports("k-dom");
	var OnEvent = K_DOM.OnEvent;

	var CONFIG = imports("k.config");

	var onMouseDown = OnEvent("mousedown");
	var onMouseUp = OnEvent("mouseup");
	var onMouseMove = OnEvent("mousemove");
	var onMouseOver = OnEvent("mouseover");
	var onMouseOut = OnEvent("mouseout");

	var onMouseWheel = OnEvent("mousewheel");

	var onClick = OnEvent("click");
	var onDoubleClick = OnEvent("dblclick");

	function registerHover(el,setHandler,clearHandler){
		if(el.$isHover===undefined){
			el.$isHover = false;
			onMouseOver(el,function(){
				el.$isHover = true;
			});
			onMouseOut(el,function(){
				el.$isHover = false;
			});
		}
		if(setHandler){
			onMouseOver(el,setHandler);
		}
		if(clearHandler){
			onMouseOut(el,clearHandler);
		}
		return el;
	}

	function registerDown(el,setHandler,clearHandler){
		if(el.$isDown===undefined){
			el.$isDown = false;
			onMouseDown(el,function(){
				el.$isDown = true;
				once(onMouseUp,document,function(){
					el.$isDown = false;
				});
			});
		}
		if(setHandler){
			onMouseDown(el,setHandler);
		}
		if(clearHandler){
			onMouseDown(el,function(){
				once(onMouseUp,document,clearHandler);
			});
		}
		return el;
	}

	function onSlide(el,task){
		return onMouseDown(el,function(e0){
			var move$ = onMouseMove(document.body,function(e){
				task(e,e.pageX,e.pageY);
			});
			var up$ = once(onMouseUp,document.body,function(e){
				if(e.button===e0.button){
					up$.remove();
					move$.remove();
					task(e,e.pageX,e.pageY);
				}
			});
			task(e0,e0.pageX,e0.pageY);
		});
	}

	function onDrag(el,task){
		return onMouseDown(el,function(e0){
			var x0 = e0.pageX;
			var y0 = e0.pageY;
			var x1 = x0;
			var y1 = y0;
			var move$ = onMouseMove(document.body,function(e){
				var x = e.pageX;
				var y = e.pageY;
				task(e,x,y,x1,y1,x0,y0);
				x1 = x;
				y1 = y;
			});
			var up$ = onMouseUp(document.body,function(e){
				if(e.button===e0.button){
					up$.remove();
					move$.remove();
					task(e,e.pageX,e.pageY,x1,y1,x0,y0);
				}
			});
			task(e0,x0,y0,x1,y1,x0,y0);
		});
	}

	function onHold(el,task){
		return onMouseDown(el,function(e0){
			var timer = 0;
			var x0 = e0.pageX;
			var y0 = e0.pageY;
			function hold(){
				timer = setTimeout(hold,CONFIG.HOLD_TIME);
				task(null,e.pageX,e.pageY,x0,y0);
			}
			function setup(e){
				timer = setTimeout(hold,CONFIG.HOLD_DELAY);
				task(e,e.pageX,e.pageY,x0,y0);
			}
			function clear(){
				clearTimeout(timer);
				timer = 0;
			}
			var setup$ = onMouseOver(el,setup);
			var clear$ = onMouseOut(el,clear);
			var up$ = onMouseUp(document.body,function(e){
				if(e.button===e0.button){
					up$.remove();
					setup$.remove();
					clear$.remove();
					timer&&clear();
				}
			});
			setup(e0);
		});
	}

	exports.registerHover = registerHover;
	exports.registerDown = registerDown;

	exports.onMouseDown = onMouseDown;
	exports.onMouseUp = onMouseUp;
	exports.onMouseMove = onMouseMove;
	exports.onMouseOver = onMouseOver;
	exports.onMouseOut = onMouseOut;

	exports.onMouseWheel = onMouseWheel;

	exports.onClick = onClick;
	exports.onDoubleClick = onDoubleClick;

	exports.onSlide = onSlide;
	exports.onDrag = onDrag;
	exports.onHold = onHold;

})();