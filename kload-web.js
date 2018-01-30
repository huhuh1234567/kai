(function(){

	function Script(path,callback){
		var script= document.createElement("script");
		script.type = "text/javascript";
		script.onload = callback;
		script.src = path;
		document.body.appendChild(script);
	}

	function load(dependencies,libs,paths,callback){
		window.module = window;
		module.exports = {};
		Script(paths["kai"]+"/kload.js",function(){
			var retrieve = exports.retrieve;
			var retrieveName = exports.retrieveName;
			//analyze
			var list = [];
			var map = {};
			for(var i=0; i<dependencies.length; i++){
				var name = retrieveName(dependencies[i]);
				retrieve(name.lib,name.module,libs,map,list);
			}
			//imports
			window.imports = function(path){
				var name = retrieveName(path,module.namespace);
				return map[name.lib][name.module];
			};
			//load
			(function iterate(i){
				if(i<list.length){
					var name = retrieveName(list[i]);
					module.namespace = name.lib;
					module.exports = {};
					Script(paths[name.lib]+"/"+name.module+".js",function(){
						map[name.lib][name.module] = module.exports;
						module.exports = null;
						module.namespace = null;
						iterate(i+1);
					});
				}
				else{
					callback();
				}
			})(0);
		});
	}

	window.DEPENDENCIES = {};

	window.load = load;

})();