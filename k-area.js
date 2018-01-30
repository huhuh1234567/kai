(function(){

	var K = imports("k");
	var List = K.List;
	var Event = K.Event;
	var extend = K.extend;

	var K_DOM = imports("k-dom");
	var bind = K_DOM.bind;
	var getPageLeft = K_DOM.getPageLeft;
	var getPageTop = K_DOM.getPageTop;
	var registerDirty = K_DOM.registerDirty;

	var K2D = imports("k2d");
	var matrix2d = K2D.matrix;
	var transform2d = K2D.transform;
	var combine2d = K2D.combine;
	var inverse2d = K2D.inverse;

	var K2D_UTIL = imports("k2d-util");
	var withinRect = K2D_UTIL.withinRect;

	function Layer(){
		var drawHandler = null;
		var hitHandler = null;
		var sm = matrix2d.unit();
		var bm = matrix2d.unit();
		var canvas = null;
		var layer = {};
		Object.defineProperties(layer,{
			matrix: {
				get: function(){
					return sm;
				},
				set: function(m){
					sm = m;
				}
			},
			base: {
				get: function(){
					return bm;
				}
			},
			canvas: {
				get: function(){
					return canvas;
				}
			}
		});
		return extend(layer,{
			type: "Layer",
			dirty: function(){
				canvas&&canvas.$dirty();
			},
			draw: function(gc){
				canvas = gc.canvas;
				bm = gc.matrix;
				gc.matrix = combine2d(bm,sm);
				gc.save();
				gc.transform(sm[0],sm[1],sm[2],sm[3],sm[4],sm[5]);
				drawHandler&&drawHandler(gc);
				gc.restore();
				gc.matrix = bm;
			},
			hit: function(x,y){
				var v = transform2d(inverse2d(sm),[x,y,1]);
				return hitHandler&&hitHandler(v[0],v[1])||null;
			},
			setDrawHandler: function(h){
				drawHandler = h;
			},
			setHitHandler: function(h){
				hitHandler = h;
			}
		});
	}

	function Area(){
		var area = Layer();
		var enterEvent = Event();
		var leaveEvent = Event();
		var moveEvent = Event();
		var event = {};
		return extend(area,{
			type: "Area",
			isHover: false,
			isLastHover: false,
			enter: enterEvent.trigger,
			leave: leaveEvent.trigger,
			move: moveEvent.trigger,
			onEnter: enterEvent.register,
			onLeave: leaveEvent.register,
			onMove: moveEvent.register,
			register: function(en,h){
				event[en] = event[en]||Event();
				return event[en].register(h);
			},
			trigger: function(en,e,x,y){
				area.canvas&&event[en]&&event[en].trigger(e,x,y);
			}
		});
	}

	function Canvas(){
		//canvas
		var canvas = document.createElement("canvas");
		registerDirty(canvas);
		//gc
		var gc = canvas.getContext("2d");
		gc.canvas = canvas;
		//area
		var root = Area();
		function hit(x,y){
			var rst = List();
			var queue = List();
			List.push(queue,root);
			var current$;
			while((current$=queue.head$)!==null){
				var v = transform2d(inverse2d(current$.$.base),[x,y,1]);
				var subs = current$.$.hit(v[0],v[1]);
				if(subs){
					if(subs.type==="List"){
						List.concat(queue,subs);
					}
					else{
						List.push(queue,subs);
					}
				}
				List.push(rst,List.shift(queue));
			}
			return rst;
		}
		function draw(gc){
			gc.clearRect(0,0,canvas.width,canvas.height);
			gc.matrix = matrix2d.unit();
			root.draw(gc);
		}
		//last
		var lastX = 0;
		var lastY = 0;
		//hovers
		var hovers = List();
		function update(newHovers,e){
			//记录上次hover
			List.loop(hovers.head$,null,function(area){
				area.isHover = false;
				area.isLastHover = true;
			});
			//记录本次hover
			List.loop(newHovers.head$,null,function(area){
				area.isHover = true;
			});
			//上次有本次无则leave
			List.loop(hovers.head$,null,function(area){
				if(!area.isHover){
					area.leave(e,lastX,lastY);
				}
			});
			//上次无本次有则enter
			List.loop(newHovers.head$,null,function(area){
				if(!area.isLastHover){
					area.enter(e,lastX,lastY);
				}
			});
			//本次有则move
			List.loop(newHovers.head$,null,function(area){
				area.move(e,lastX,lastY);
			});
			//清除上次hover记录
			List.loop(hovers.head$,null,function(area){
				area.isLastHover = false;
			});
			//切换列表
			hovers = newHovers;
		}
		//cursor
		bind(document.body,"mousemove",function(e){
			lastX = e.pageX-getPageLeft(canvas);
			lastY = e.pageY-getPageTop(canvas);
			update(hit(lastX,lastY),e);
		});
		//draw
		canvas.$onRefresh(function(){
			draw(gc);
			update(hit(lastX,lastY),null);
		});
		//return
		Object.defineProperties(canvas,{
			matrix: {
				get: function(){
					return root.matrix;
				},
				set: function(m){
					root.matrix = m;
				}
			},
			base: {
				get: function(){
					return root.base;
				}
			},
			canvas: {
				get: function(){
					return root.canvas;
				}
			}
		});
		return extend(extend(canvas,root),{
			getHovers: function(){
				return hovers;
			},
			getLastX: function(){
				return lastX;
			},
			getLastY: function(){
				return lastY;
			}
		});
	}

	function canvas2area(area,v){
		return transform2d(inverse2d(combine2d(area.base,area.matrix)),v);
	}

	function area2canvas(area,v){
		return transform2d(combine2d(area.base,area.matrix),v);
	}

	function OnAreaEvent(en){
		return function(doa,h){
			return doa.register(en,h);
		};
	}
	var onAreaMouseDown = OnAreaEvent("mousedown");
	var onAreaMouseUp = OnAreaEvent("mouseup");

	function RegisterAreaEvent(en){
		return function(canvas){
			bind(canvas,en,function(e){
				var x = canvas.getLastX();
				var y = canvas.getLastY();
				List.loop(canvas.getHovers().head$,null,function(area){
					area.trigger(en,e,x,y);
				});
			});
		};
	}
	var registerAreaMouseDown = RegisterAreaEvent("mousedown");
	var registerAreaMouseUp = RegisterAreaEvent("mouseup");

	function Flow(an,sn){
		return function(areas){
			var offset = 0;
			List.loop(areas.head$,null,function(area){
				area[an] = offset;
				offset += area[sn];
			});
		}
	}
	var flowX = Flow("x","width");
	var flowY = Flow("y","height");

	function hitAreaSizeRect(x,y,areas){
		return List.loop(areas.tail$,null,function(area){
			if(withinRect(x-area.x,y-area.y,area.width,area.height)){
				return area;
			}
		},true)||null;
	}

	function drawAreaPositionAbsolute(gc,areas){
		List.loop(areas.head$,null,function(area){
			area.matrix = matrix2d.translate(area.x,area.y);
			area.draw(gc);
		});
	}

	exports.Layer = Layer;
	exports.Area = Area;
	exports.Canvas = Canvas;

	exports.canvas2area = canvas2area;
	exports.area2canvas = area2canvas;

	exports.OnAreaEvent = OnAreaEvent;
	exports.onAreaMouseDown = onAreaMouseDown;
	exports.onAreaMouseUp = onAreaMouseUp;

	exports.RegisterAreaEvent = RegisterAreaEvent;
	exports.registerAreaMouseDown = registerAreaMouseDown;
	exports.registerAreaMouseUp = registerAreaMouseUp;

	exports.flowX = flowX;
	exports.flowY = flowY;
	exports.hitAreaSizeRect = hitAreaSizeRect;
	exports.drawAreaPositionAbsolute = drawAreaPositionAbsolute;

})();