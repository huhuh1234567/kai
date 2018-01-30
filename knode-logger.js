(function(){

	var K = imports("k");
	var loopObject = K.loopObject;

	var K_MATH = imports("k-math");
	var pad0 = K_MATH.pad0;

	var DEBUG_LEVEL = {
		"ERROR": 0,
		"INFO": 1,
		"DEBUG": 2,
		"DEMO-DEBUG": 9
	};

	var DEBUG_LABEL = [];
	loopObject(DEBUG_LEVEL,function(k,v){
		DEBUG_LABEL[v] = k;
	});

	function Logger(maxLevel){
		var loggers = [];
		function log(level,message){
			if(level>=0){
				var logger = loggers[level];
				if(logger&&level<=maxLevel){
					var date = new Date();
					logger.write("["+pad0(date.getFullYear(),4)+"-"+pad0(date.getMonth()+1,2)+"-"+pad0(date.getDate(),2)+"|"+
						pad0(date.getHours(),2)+":"+pad0(date.getMinutes(),2)+":"+pad0(date.getSeconds(),2)+"]"+
						"["+(DEBUG_LABEL[level]||"LOG("+level+")")+"]"+message+"\n");
					logger.uncork();
				}
			}
		}
		return {
			bind: function(level,logger){
				loggers[level] = logger;
			},
			log: log,
			error: function(message,errno){
				log(DEBUG_LEVEL.ERROR,"("+errno+")"+message);
			}
		};
	}

	Logger.DEBUG_LABEL = DEBUG_LABEL;
	Logger.DEBUG_LEVEL = DEBUG_LEVEL;

	module.exports = Logger;

})();