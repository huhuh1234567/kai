(function(){

	var K = imports("k");
	var loopObject = K.loopObject;
	var insure = K.insure;
	var extract = K.extract;
	var extend = K.extend;
	var Event = K.Event;
	var List = K.List;
	var once = K.once;

	var K_GC = imports("k-gc");
	var drawBorder = K_GC.drawBorder;
	var fillTriangle = K_GC.fillTriangle;
	var fillRect = K_GC.fillRect;

	var K_AREA = imports("k-area");
	var Area = K_AREA.Area;
	var View = K_AREA.View;
	var Layer = K_AREA.Layer;
	var onAreaMouseDown = K_AREA.onAreaMouseDown;
	var global2local = K_AREA.global2local;
	var drawAreaAbsolute = K_AREA.drawAreaAbsolute;
	var hitAreaRect = K_AREA.hitAreaRect;

	var K_DOM_MOUSE = imports("k-dom-mouse");
	var onMouseUp = K_DOM_MOUSE.onMouseUp;

	var K_AREA_MOUSE = imports("k-area-mouse");
	var onAreaSlide = K_AREA_MOUSE.onAreaSlide;
	var onAreaHold = K_AREA_MOUSE.onAreaHold;
	var onAreaDrag = K_AREA_MOUSE.onAreaDrag;

	var CONFIG = imports("kw-area.config");
	var AREA_RAW_BUTTON = CONFIG.AREA_RAW_BUTTON;
	var AREA_BUTTON = CONFIG.AREA_BUTTON;
	var AREA_ARROW_BUTTON = CONFIG.AREA_ARROW_BUTTON;
	var AREA_RATE_BAR = CONFIG.AREA_RATE_BAR;
	var AREA_SCROLL_BAR = CONFIG.AREA_SCROLL_BAR;

	function AreaRawButton(args){
		var area = extend(extend(Area(View),extract(args,{
			width: 0,
			height: 0,
			hidden: false,
			disabled: false
		})),{
			isDown: false
		});
		//draw
		area.setDrawHandler(function(gc){
			if(!area.hidden){
				args.clip&&args.clip(gc);
				args.draw&&args.draw(gc);
				//active
				if(!area.disabled){
					gc.fillStyle = AREA_RAW_BUTTON.ACTIVE_COLOR;
					gc.globalAlpha = AREA_RAW_BUTTON.ACTIVE_ALPHA;
					if(area.isHover){
						fillRect(gc,area.width,area.height,AREA_RAW_BUTTON.ACTIVE_COLOR);
						if(area.isDown){
							fillRect(gc,area.width,area.height,AREA_RAW_BUTTON.ACTIVE_COLOR);
						}
					}
				}
				//disable
				else{
					gc.globalAlpha = AREA_RAW_BUTTON.DISABLE_ALPHA;
					fillRect(gc,area.width,area.height,AREA_RAW_BUTTON.DISABLE_COLOR);
				}
			}
		});
		//event
		onAreaMouseDown(area,function(){
			if(!area.hidden&&!area.disabled){
				area.isDown = true;
				area.dirty();
				once(onMouseUp,document.body,function(){
					area.isDown = false;
					area.dirty();
				});
			}
		});
		area.onEnter(area.dirty);
		area.onLeave(area.dirty);
		return area;
	}

	function AreaButton(args){
		var value = insure(args.value,"");
		var area = AreaRawButton({
			width: args.width,
			height: args.height,
			hidden: args.hidden,
			disabled: args.disabled,
			draw: function(gc){
				//bg
				fillRect(gc,area.width,area.height,AREA_BUTTON.BACKGROUND_COLOR);
				//value
				gc.font = AREA_BUTTON.FONT;
				gc.textBaseline = "middle";
				gc.fillStyle = AREA_BUTTON.COLOR;
				gc.fillText(value,(area.width-gc.measureText(value).width)/2,area.height/2);
			}
		});
		Object.defineProperty(area,"value",{
			get: function(){
				return value;
			},
			set: function(v){
				if(value!==v){
					value = v;
					area.dirty();
				}
			}
		});
		return area;
	}

	function AreaArrowButton(args){
		var arrow = extract(insure(args.arrow,{}),{
			direction: 0,
			width: 0,
			height: 0
		});
		var area = extend(AreaRawButton({
			width: args.width,
			height: args.height,
			hidden: args.hidden,
			disabled: args.disabled,
			draw: function(gc){
				drawBorder(gc,area.width,area.height,AREA_ARROW_BUTTON.COLOR,1);
				gc.save();
				gc.translate(area.width/2,area.height/2);
				gc.rotate(area.arrow.direction*Math.PI/2);
				gc.translate(0,-area.arrow.height*AREA_ARROW_BUTTON.OFFSET);
				fillTriangle(gc,area.arrow.width,area.arrow.height,AREA_ARROW_BUTTON.COLOR);
				gc.restore();
			}
		}),{
			arrow: {}
		});
		loopObject(arrow,function(k){
			Object.defineProperty(area.arrow,k,{
				get: function(){
					return arrow[k];
				},
				set: function(value){
					if(arrow[k]!==value){
						arrow[k] = value;
						area.dirty();
					}
				}
			});
		});
		return area;
	}

	function AreaRateBar(args){
		var value = insure(args.value,"");
		var changeEvent = Event();
		var area = AreaRawButton({
			width: args.width,
			height: args.height,
			hidden: args.hidden,
			disabled: args.disabled,
			draw: function(gc){
				//background
				fillRect(gc,area.width,area.height,AREA_RATE_BAR.BACKGROUND_COLOR);
				drawBorder(gc,area.width,area.height,AREA_RATE_BAR.COLOR,1);
				//value
				fillRect(gc,area.width*value,area.height,AREA_RATE_BAR.COLOR);
			}
		});
		Object.defineProperty(area,"value",{
			get: function(){
				return value;
			},
			set: function(v){
				if(value!==v){
					value = v;
					area.dirty();
				}
			}
		});
		onAreaSlide(area,function(e,x,y){
			var v = global2local(area,[x,y,1]);
			value = Math.max(0,Math.min(1,v[0]/area.width));
			changeEvent.trigger(value);
			area.dirty();
		});
		return extend(area,{
			onChange: changeEvent.register
		});
	}

	function AreaScrollBar(args){

		var area = Area(Layer);
		//properties
		var $dirty = true;
		var $ = extract(args,{
			height: 0,
			total: 0,
			length: 0,
			offset: 0
		});
		loopObject($,function(k){
			Object.defineProperty(area,k,{
				get: function(){
					if($dirty){
						$dirty = false;
						$.total = Math.max(1,$.total);
						$.length = Math.max(0,$.length);
						$.height = Math.max(AREA_SCROLL_BAR.BUTTON_HEIGHT*2+1,$.height);
						$.offset = Math.max(0,Math.min($.total-$.length,$.offset));
					}
					return $[k];
				},
				set: function(value){
					$[k] = value;
					$dirty = true;
					area.dirty();
				}
			});
		});
		area.width = AREA_SCROLL_BAR.WIDTH;
		//uis
		var areas = List();
		//上箭头
		var upButton = AreaArrowButton({
			width: AREA_SCROLL_BAR.WIDTH,
			height: AREA_SCROLL_BAR.BUTTON_HEIGHT,
			arrow: {
				direction: 2,
				width: AREA_SCROLL_BAR.TRIANGLE_WIDTH,
				height: AREA_SCROLL_BAR.TRIANGLE_HEIGHT
			}
		});
		upButton.x = 0;
		upButton.y = 0;
		List.push(areas,upButton);
		//下箭头
		var downButton = AreaArrowButton({
			width: AREA_SCROLL_BAR.WIDTH,
			height: AREA_SCROLL_BAR.BUTTON_HEIGHT,
			arrow: {
				direction: 0,
				width: AREA_SCROLL_BAR.TRIANGLE_WIDTH,
				height: AREA_SCROLL_BAR.TRIANGLE_HEIGHT
			}
		});
		downButton.x = 0;
		List.push(areas,downButton);
		//滑块
		var span = AreaRawButton({
			width: AREA_SCROLL_BAR.WIDTH,
			draw: function(gc){
				drawBorder(gc,span.width,span.height,AREA_SCROLL_BAR.COLOR,1);
			}
		});
		span.x = 0;
		List.push(areas,span);
		//main area
		var height = 1;
		var rate = 1;
		area.setDrawHandler(function(gc){
			//bg
			fillRect(gc,AREA_SCROLL_BAR.WIDTH,area.height,AREA_SCROLL_BAR.BACKGROUND_COLOR);
			//uis
			downButton.y = area.height-AREA_SCROLL_BAR.BUTTON_HEIGHT;
			height = area.height-AREA_SCROLL_BAR.BUTTON_HEIGHT*2;
			rate = height/area.total;
			span.height = Math.min(height,area.length*rate);
			span.y = AREA_SCROLL_BAR.BUTTON_HEIGHT+area.offset*rate;
			//draw
			drawAreaAbsolute(gc,areas);
		});
		area.setHitHandler(function(x,y){
			return hitAreaRect(x,y,areas);
		});
		//event
		function scroll(d){
			area.offset += d;
			area.dirty();
		}
		var scrollEvent = Event();
		onAreaHold(upButton,function(){
			var d = -AREA_SCROLL_BAR.STEP_RATE*area.length;
			scroll(d);
			scrollEvent.trigger(d);
		});
		onAreaHold(downButton,function(){
			var d = AREA_SCROLL_BAR.STEP_RATE*area.length;
			scroll(d);
			scrollEvent.trigger(d);
		});
		onAreaDrag(span,function(e,x,y,x1,y1){
			var v = global2local(area,[x,y,1]);
			var v0 = global2local(area,[x1,y1,1]);
			var d = (v[1]-v0[1])/rate;
			scroll(d);
			scrollEvent.trigger(d);
		});
		return extend(area,{
			scroll: scroll,
			onScroll: scrollEvent.register
		});
	}

	exports.AreaRawButton = AreaRawButton;
	exports.AreaButton = AreaButton;
	exports.AreaArrowButton = AreaArrowButton;
	exports.AreaRateBar = AreaRateBar;
	exports.AreaScrollBar = AreaScrollBar;

})();