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
	}

	function onSlide(el,task){
		return onMouseDown(el,function(e){
			task(e.pageX,e.pageY);
			var handle = onMouseMove(document.body,function(e){
				task(e.pageX,e.pageY);
			});
			once(onMouseUp,document.body,function(e){
				handle.remove();
				task(e.pageX,e.pageY);
			});
		});
	}

	function onDrag(el,task){
		return onMouseDown(el,function(e){
			var x0 = e.pageX;
			var y0 = e.pageY;
			var x1 = x0;
			var y1 = y0;
			var handle = onMouseMove(document.body,function(e){
				task(e.pageX,e.pageY,x1,y1,x0,y0);
				x1 = e.pageX;
				y1 = e.pageY;
			});
			once(onMouseUp,document.body,function(){
				handle.remove();
			});
		});
	}

	function onHold(el,task){
		return onMouseDown(el,function(e){
			var x0 = e.pageX;
			var y0 = e.pageY;
			var x1 = x0;
			var y1 = y0;
			task(x1,y1,x0,y0);
			var handle = onMouseMove(document.body,function(e){
				x1 = e.pageX;
				y1 = e.pageY;
			});
			var timer = setTimeout(function hold(){
				if(timer){
					timer = setTimeout(hold,CONFIG.HOLD_TIME);
				}
				if(el.$isHover){
					task(x1,y1,x0,y0);
				}
			},CONFIG.HOLD_DELAY);
			once(onMouseUp,document.body,function(){
				handle.remove();
				if(timer){
					clearTimeout(timer);
					timer = 0;
				}
			});
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
	exports.onHold = onHold;
	exports.onDrag = onDrag;

})();