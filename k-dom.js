(function(){

	var K = imports("k");
	var Event = K.Event;
	var extend = K.extend;
	var wrap = K.wrap;

	function bind(el,ev,h){
		el.addEventListener(ev,h);
		return {
			remove: function(){
				el.removeEventListener(ev,h);
			}
		};
	}

	function OnEvent(name){
		return function(el,task){
			return bind(el,name,task);
		};
	}

	function GetPageOffset(dn){
		return function(el,rel){
			var rst = el["offset"+dn];
			rel = rel||document.body;
			for(var current = el.offsetParent; current!==rel; current = current.offsetParent){
				rst += current["offset"+dn]-current["scroll"+dn];
			}
			return rst;
		};
	}
	var getPageLeft = GetPageOffset("Left");
	var getPageTop = GetPageOffset("Top");

	function registerDirty(el){
		var dirty = true;
		var refreshEvent = Event();
		var af = null;
		(function draw(t){
			if(dirty){
				dirty = false;
				refreshEvent.trigger();
			}
			af = requestAnimationFrame(draw,null);
		})(0);
		return extend(wrap(el,{
			$remove: function(){
				af&&cancelAnimationFrame(af);
			}
		}),{
			$dirty: function(){
				dirty = true;
			},
			$refresh: refreshEvent.trigger,
			$onRefresh: refreshEvent.register
		});
	}

	exports.bind = bind;
	exports.OnEvent = OnEvent;

	exports.getPageLeft = getPageLeft;
	exports.getPageTop = getPageTop;

	exports.registerDirty = registerDirty;

})();