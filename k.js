(function(){

	function loop(total,block,reverse){
		var rst;
		var end = reverse?-1:total;
		for(var i = reverse?total-1:0; i!=end; reverse?i--:i++){
			if((rst = block(i))!==undefined){
				return rst;
			}
		}
	}

	function loopArray(arr,block,reverse){
		return loop(arr.length,function(i){
			return block(arr[i],i);
		},reverse);
	}

	function memset(a,o,val,len){
		loop(len,function(i){
			a[o+i] = val;
		});
	}

	function memcpy(ad,od,as,os,len){
		loop(len,function(i){
			ad[od+i] = as[os+i];
		});
	}

	function loopObject(obj,block){
		var rst;
		for(var k in obj){
			if(obj.hasOwnProperty(k)){
				if((rst = block(k,obj[k]))!==undefined){
					return rst;
				}
			}
		}
	}

	function is(obj,type){
		return Object.prototype.toString.call(obj)==="[object "+type+"]";
	}

	function insure(val,def){
		return val===undefined?def:val;
	}

	function extract(obj,def){
		var rst = {};
		loopObject(def,function(k){
			rst[k] = insure(obj[k],def[k]);
		});
		return rst;
	}

	function extend(obj,trait){
		loopObject(trait,function(k,v){
			obj[k] = v;
		});
		return obj;
	}

	function wrap(obj,ops,delays){
		loopObject(ops,function(name,op){
			if(is(op,"Function")){
				var oop = obj[name];
				if(is(oop,"Function")){
					if(delays&&delays[name]){
						obj[name] = function(){
							op.apply(null,arguments);
							oop&&oop.apply(null,arguments);
						}
					}
					else{
						obj[name] = function(){
							oop&&oop.apply(null,arguments);
							op.apply(null,arguments);
						}
					}
				}
				else{
					obj[name] = op;
				}
			}
		});
		return obj;
	}

	//链表
	function List(){
		var $ = {
			length: 0,
			head$: null,
			tail$: null
		};
		var list = {};
		loopObject($,function(k){
			Object.defineProperty(list,k,{
				get: function(){
					return $[k];
				}
			});
		});
		return extend(list,{
			_k_constructor: List,
			insert$: function(target$,next$){
				var previous$ = next$?next$.previous$:$.tail$;
				target$.next$ = next$;
				target$.previous$ = previous$;
				if(previous$){
					previous$.next$ = target$
				}
				else{
					$.head$ = target$
				}
				if(next$){
					next$.previous$ = target$;
				}
				else{
					$.tail$ = target$;
				}
				$.length++;
				return target$;
			},
			remove$: function(target$){
				var next$ = target$.next$;
				var previous$ = target$.previous$;
				if(previous$){
					previous$.next$ = next$;
				}
				else{
					$.head$ = next$;
				}
				if(next$){
					next$.previous$ = previous$;
				}
				else{
					$.tail$ = previous$;
				}
				$.length--;
				return next$;
			},
			$$: function(){
				var rst = [];
				for(var current$=$.head$; current$!==null; current$=current$.next$){
					rst.push(current$.$);
				}
				return rst;
			}
		});
	}

	//节点
	List.$ = function(value){
		return {
			previous$: null,
			next$: null,
			$: value
		};
	};

	//遍历
	List.loop = function(begin$,end$,block,reverse){
		var rst;
		for(var current$ = begin$; current$!==end$; current$ = insure(reverse,false)?current$.previous$:current$.next$){
			if((rst = block(current$.$,current$))!==undefined){
				return rst;
			}
		}
	};

	//计数

	//堆栈队列
	List.push = function(list,value){
		return list.insert$(List.$(value),null);
	};
	List.pop = function(list){
		var rst = list.tail$.$;
		list.remove$(list.tail$);
		return rst;
	};
	List.unshift = function(list,value){
		return list.insert$(List.$(value),list.head$);
	};
	List.shift = function(list){
		var rst = list.head$.$;
		list.remove$(list.head$);
		return rst;
	};

	//数组构造
	List.$$ = function(a){
		var rst = List();
		loopArray(a,function(v){
			List.push(v);
		});
		return rst;
	};

	//判断前后关系
	List.isBefore$ = function(l$,r$){
		for(; r$&&r$!==l$; r$ = r$.next$){
		}
		return r$===null;
	};

	//大小
	List.min = function(list,less){
		var rst$ = list.head$;
		List.loop(list.head$,null,function(v,v$){
			if(less(v,rst$.$)){
				rst$ = v$;
			}
		});
		return rst$;
	};

	//排序
	List.sort = function(list,less){
		var current$ = list.tail$;
		while(current$!==null){
			var next$ = current$.next$;
			var previous$ = current$.previous$;
			list.remove$(current$);
			while(next$!==null){
				if(less(next$.$,current$.$)){
					next$ = next$.next$;
				}
				else{
					break;
				}
			}
			list.insert$(current$,next$);
			current$ = previous$;
		}
	};

	//合并
	List.concat = function(list,plus){
		List.loop(plus.head$,null,function(v){
			List.push(list,v);
		});
		return list;
	};

	List.concat2 = function(list,plus){
		if(plus){
			if(plus._k_constructor===List){
				List.concat(list,plus);
			}
			else{
				List.push(list,plus);
			}
		}
	};

	//事件列表
	function Event(){
		var handlers = List();
		return {
			_k_constructor: Event,
			register: function(h){
				var h$ = List.push(handlers,h);
				return {
					remove: function(){
						handlers.remove$(h$);
					}
				}
			},
			trigger: function(){
				var args = arguments;
				List.loop(handlers.head$,null,function(h){
					h.apply(null,args);
				});
			}
		};
	}

	function once(register,box,task){
		var handle = register(box,function(){
			handle.remove();
			task.apply(null,arguments);
		});
		return handle;
	}

	//并发执行
	function Loader(){
		var count = 1;
		var event = Event();
		function done(){
			if(--count===0){
				event.trigger();
			}
		}
		return {
			_k_constructor: Loader,
			onDone: function(h){
				return event.register(h);
			},
			load: function(block){
				count++;
				block(done);
			},
			complete: done
		};
	}

	function assert(){
		var args = Array.prototype.slice.call(arguments,1);
		try{
			arguments[0].apply(null,args);
		}
		catch(e){

		}
	}

	exports.loop = loop;
	exports.loopArray = loopArray;
	exports.loopObject = loopObject;

	exports.memset = memset;
	exports.memcpy = memcpy;

	exports.is = is;
	exports.insure = insure;
	exports.extract = extract;
	exports.extend = extend;
	exports.wrap = wrap;

	exports.List = List;

	exports.Event = Event;
	exports.once = once;

	exports.Loader = Loader;

	exports.assert = assert;

})();