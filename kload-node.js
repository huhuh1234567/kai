(function(){

	var KLOAD = require("./kload.js");
	var retrieveName = KLOAD.retrieveName;

	var map = {};

	function register(name,path){
		map[name] = path;
	}

	function imports(path){
		var name = retrieveName(path);
		return require((map[name.lib]||".")+"/"+name.module+".js");
	}

	global.register = register;
	global.imports = imports;

})();
