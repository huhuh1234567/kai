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

	function global2local(area,v){
		return transform2d(inverse2d(area.getGlobalMatrix()),v);
	}

	function local2global(area,v){
		return transform2d(area.getGlobalMatrix(),v);
	}

	function View(){
		var canvas = null;
		var bm = null;
		var gm = null;
		var draw = null;
		var sm = matrix2d.unit();
		return {
			_k_constructor: View,
			setLocalMatrix: function(m){
				sm = m;
			},
			getGlobalMatrix: function(){
				return gm;
			},
			getCanvas: function(){
				return canvas;
			},
			setDrawHandler: function(op){
				draw = op;
			},
			draw: function(gc){
				//refresh
				canvas = gc.canvas;
				bm = gc.matrix;
				gm = combine2d(bm,sm);
				//draw
				gc.matrix = gm;
				gc.save();
				gc.transform(sm[0],sm[1],sm[2],sm[3],sm[4],sm[5]);
				draw&&draw(gc);
				gc.restore();
				gc.matrix = bm;
			}
		};
	}

	function Layer(){
		var hit = null;
		var layer = View();
		return extend(layer,{
			_k_constructor: Layer,
			_k_base_constructor: View,
			setHitHandler: function(op){
				hit = op;
			},
			hit: function(x,y){
				var v = global2local(layer,[x,y,1]);
				return hit&&hit(v[0],v[1])||null;
			}
		});
	}

	function Layout(){
		var hit = null;
		var layout = View();
		return extend(layout,{
			_k_constructor: Layout,
			_k_base_constructor: View,
			setHitHandler: function(op){
				hit = op;
			},
			hit: function(x,y){
				return hit&&hit(x,y)||null;
			}
		});
	}

	function Area(Base){
		var area = Base();
		var enterEvent = Event();
		var leaveEvent = Event();
		var moveEvent = Event();
		var event = {};
		return extend(area,{
			_k_constructor: Area,
			_k_base_constructor: area._k_constructor,
			dirty: function(){
				var canvas = area.getCanvas();
				canvas&&canvas.$dirty();
			},
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
				event[en]&&event[en].trigger(e,x,y);
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
		gc.matrix = matrix2d.unit();
		//root
		var root = null;
		function hit(x,y){
			var rst = List();
			root._k_constructor===Area&&List.push(rst,root);
			var queue = List();
			List.push(queue,root);
			var current$;
			while((current$=queue.head$)!==null){
				var subs = current$.$.getCanvas()&&current$.$.hit&&current$.$.hit(x,y)||null;
				List.concat2(rst,subs);
				List.concat2(queue,subs);
				List.shift(queue);
			}
			return rst;
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
			if(root){
				update(hit(lastX,lastY),e);
			}
		});
		//draw
		canvas.$onRefresh(function(){
			gc.clearRect(0,0,canvas.width,canvas.height);
			if(root){
				root.draw(gc);
				update(hit(lastX,lastY),null);
			}
		});
		//return
		return extend(canvas,{
			_k_constructor: Canvas,
			setRoot: function(r){
				root = r;
			},
			getRoot: function(){
				return root;
			},
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
			return canvas;
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

	function hitAreaLayers(x,y,layers){
		return List.loop(layers.tail$,null,function(layer){
			return layer.hit(x,y)||undefined;
		},true)||null;
	}

	function hitAreaRect(x,y,areas){
		return List.loop(areas.tail$,null,function(area){
			return withinRect(x-area.x,y-area.y,area.width,area.height)? area:undefined;
		},true)||null;
	}

	function drawAreaAbsolute(gc,views){
		List.loop(views.head$,null,function(view){
			view.setLocalMatrix(matrix2d.translate(view.x,view.y));
			view.draw(gc);
		});
	}

	exports.View = View;
	exports.Layer = Layer;
	exports.Layout = Layout;
	exports.Area = Area;
	exports.Canvas = Canvas;

	exports.global2local = global2local;
	exports.local2global = local2global;

	exports.OnAreaEvent = OnAreaEvent;
	exports.onAreaMouseDown = onAreaMouseDown;
	exports.onAreaMouseUp = onAreaMouseUp;

	exports.RegisterAreaEvent = RegisterAreaEvent;
	exports.registerAreaMouseDown = registerAreaMouseDown;
	exports.registerAreaMouseUp = registerAreaMouseUp;

	exports.flowX = flowX;
	exports.flowY = flowY;
	exports.hitAreaRect = hitAreaRect;
	exports.hitAreaLayers = hitAreaLayers;
	exports.drawAreaAbsolute = drawAreaAbsolute;

})();