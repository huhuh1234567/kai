var http = require("http");
var url = require("url");

var K = imports("k");
var insure = K.insure;
var extract = K.extract;
var is = K.is;

var Logger = imports("knode-logger");
var DEBUG_LEVEL = Logger.DEBUG_LEVEL;

function Server(args){

	args = insure(args,{});
	var dbglv = insure(args.dbglv,DEBUG_LEVEL.ERROR);
	var port = insure(args.port,80);
	var host = insure(args.host,"");
	var procedures = insure(args.procedures,{});

	var logger = Logger(dbglv);
	logger.bind(DEBUG_LEVEL.ERROR,process.stderr);
	logger.bind(DEBUG_LEVEL.INFO,process.stderr);
	logger.bind(DEBUG_LEVEL.DEBUG,process.stdout);

	var server = http.createServer(function(request,response){
		logger.log(DEBUG_LEVEL.INFO,"[socket] "+request.socket.remoteAddress+":"+request.socket.remotePort);
		logger.log(DEBUG_LEVEL.INFO,"[url] "+request.url);
		//utf8
		request.charset = "utf8";
		response.setHeader("Charset","utf-8");
		response.setHeader("Access-Control-Allow-Origin","*");
		response.setHeader("Content-type","text/plain");
		//args
		var ru = url.parse(request.url);
		var pathname = ru.pathname.substring(1);
		var search = ru.search? ru.search.substring(1):"";
		var hash = ru.hash>0? ru.hash.substring(1):"";
		//module
		if(is(procedures[pathname],"Function")){
			//post
			if(request.method.toUpperCase()==="POST"){
				//data
				var data = "";
				request.on("data",function(chunk){
					data += chunk;
				});
				//run
				request.on("end",function(){
					logger.log(DEBUG_LEVEL.DEBUG,"[data] "+data);
					procedures[pathname](search,hash,data,function(error,rst){
						if(error){
							logger.log(DEBUG_LEVEL.INFO,"[re] HTTP 500 error="+error);
							response.statusCode = 500;
							response.end(error);
						}
						else{
							var str = JSON.stringify(rst);
							logger.log(DEBUG_LEVEL.INFO,"[re] HTTP 200");
							logger.log(DEBUG_LEVEL.DEBUG,"[re:data] "+str);
							response.statusCode = 200;
							response.end(str);
						}
					});
				});
			}
			else{
				logger.log(DEBUG_LEVEL.INFO,"[re] HTTP 405 method="+request.method);
				response.statusCode = 405;
				response.end();
			}
		}
		else{
			logger.log(DEBUG_LEVEL.INFO,"[re] HTTP 404 pathname="+pathname);
			response.statusCode = 404;
			response.end();
		}
	});
	//start
	logger.log(DEBUG_LEVEL.INFO,"[listen] "+host+":"+port);
	server.listen(port,host);
}

module.exports = Server;