(function(){

	function retrieveName(path,namespace){
		var i = path.indexOf("/");
		return i<0? {
			lib: namespace||".",
			module: path
		}:{
			lib: path.substring(0,i),
			module: path.substring(i+1)
		};
	}

	function retrieve(lib,module,libs,map,list){
		map[lib] = map[lib]||{};
		if(!map[lib][module]){
			var dependencies = libs[lib][module];
			if(dependencies){
				for(var i=0; i<dependencies.length; i++){
					var name = retrieveName(dependencies[i],lib);
					retrieve(name.lib,name.module,libs,map,list);
				}
			}
			list.push(lib+"/"+module);
			map[lib][module] = true;
		}
	}

	exports.retrieve = retrieve;
	exports.retrieveName = retrieveName;

})();