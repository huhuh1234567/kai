(function(){

	var K = imports("k");
	var loopArray = K.loopArray;
	var loopObject = K.loopObject;

	//测试样式是否有效
	var testElement = document.createElement("div");
	function test(name,value){
		if(window.CSS&&CSS.supports){
			return CSS.supports(name,value);
		}
		else{
			testElement.removeAttribute("style");
			testElement.style.setProperty(name,value,"");
			return (typeof testElement.getAttribute("style")).toLowerCase()==="string";
		}
	}

	//找前缀
	var lastPrefix = "";
	function adapt(name,value){
		//白板
		if(test(name,value)){
			return name;
		}
		else{
			//已适配
			if(lastPrefix){
				return test(lastPrefix+name,value)?lastPrefix+name:name;
			}
			else{
				//适配
				return loopArray(["-webkit-","-ms-","-moz-","-o-"],function(prefix){
					if(test(prefix+name,value)){
						lastPrefix = prefix;
						return true;
					}
				})?lastPrefix+name:name;
			}
		}
	}

	//设置或清除样式
	function css(el,styles){
		loopObject(styles,function(k,v){
			if((typeof v)==="string"){
				el.style.setProperty(adapt(k,v),v,"");
			}
			else{
				loopArray(["","-webkit-","-ms-","-moz-","-o-"],function(prefix){
					el.style.removeProperty(prefix+k);
				});
			}
		});
		return el;
	}

	//生成CSS样式字符串
	function css2string(styles){
		var rst = "";
		loopObject(styles,function(k,v){
			rst += adapt(k,v)+":"+v+";";
		});
		return rst;
	}

	exports.css = css;
	exports.css2string = css2string;

})();