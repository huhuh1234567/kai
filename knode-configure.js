(function(){

	var K = imports("k");
	var loopArray = K.loopArray;

	function configure(argv,flag){
		var sep = 1+flag.length;
		var rst = [];
		loopArray(argv,function(arg){
			if(arg.substring(1,sep)===flag){
				rst.push(arg.substring(sep+1));
			}
		});
		return rst;
	}

	module.exports = configure;

})();