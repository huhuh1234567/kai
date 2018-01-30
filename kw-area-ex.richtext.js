(function(){

	var K = imports("k");
	var extend = K.extend;
	var List = K.List;

	var ELEMENT_TYPE = {
		CHARACTER: 1,
		IMAGE: 2
	};

	function Element(){
		return {
			_: null,
			type: 0,
			data: null,
			word$: null,
			style$: null,
			segment$: null,
			width: 0,
			height: 0,
			text: ""
		};
	}

	function Word(){
		return {
			_: null,
			begin$: null,
			end$: null
		};
	}

	function Paragraph(){
		return {
			_: null,
			format$: null,
			elements: null,
			words: null
		};
	}

	function ViewUnit(){
		return {
			width: 0,
			height: 0,
			offsetX: 0,
			offsetY: 0,
			text: ""
		};
	}

	function Brick(){
		return extend(ViewUnit(),{
			_: null,
			element$: null
		});
	}

	function Line(){
		return extend(ViewUnit(),{
			_: null,
			begin$: null,
			end$: null
		});
	}

	function Block(){
		return extend(ViewUnit(),{
			_: null,
			bricks: null,
			lines: null
		});
	}

	function Segment(){
		return {
			_: null,
			begin$: null,
			end$: null
		};
	}

	function Group(){
		return {
			_: null,
			segments: List()
		};
	}

	var prefix = /^[£¨¡¾¡°¡®]$/;
	var suffix = /^[£©¡¿¡±¡¯£¬¡££»£º£¿£¡¡¢]$/;
	var connector = /^[0-9a-zA-Z`~!@#\$%\^&\*\(\)\-_=\+\[\{\]\}\\\|:;"'<,>\.\?\/]$/;
	var blank = /^[ 	¡¡]$/;
	var enter = /^[\n\r]$/;

	var measureGC = document.createElement("canvas").getContext("2d");

	function style2font(style){
		return [style.fontStyle, style.fontVariant, style.fontWeight, style.fontSize+"px", style.fontFamily].join(" ");
	}

	function getWidth(element){
		if(element){
			switch(element.type){
				case ELEMENT_TYPE.CHARACTER:
					measureGC.font = style2font(element.style);
					return measureGC.measureText(element.data).width;
				case ELEMENT_TYPE.IMAGE:
					return element.data.width;
				default:
					return 0;
			}
		}
		else{
			return 0;
		}
	}

	function getHeight(element){
		return element&&element.type===ELEMENT_TYPE.IMAGE? element.data.height:0;
	}

	function getCharacter(element){
		return element&&element.type===ELEMENT_TYPE.CHARACTER? element.data:"";
	}

	function isWord(left,right){
		return left&&right&&								//both text
			(prefix.test(left)&&!blank.test(right)||		//prefix is not the end
			!blank.test(left)&&suffix.test(right)||			//suffix is not the begin
			connector.test(left)&&connector.test(right)||	//connectors connect
			blank.test(left)&&blank.test(right));			//blanks connect
	}

	function elements2words(begin$,end$){
		var words = List();
		var word = Word();
		word._ = List.push(words,word);
		word.begin$ = begin$;
		List.loop(begin$,end$,function(element,element$){
			element.word$ = word._;
			var next$ = element$.next$;
			if(!next$||!isWord(element.text,next$.$.text)){
				word.end$ = next$;
				if(next$){
					word = Word();
					word._ = List.push(words,word);
					word.begin$ = next$;
				}
			}
		});
		return words;
	}

	function elements2bricks(begin$,end$){
		var bricks = List();
		List.loop(begin$,end$,function(element,element$){
			var brick = Brick();
			brick._ = List.push(bricks,brick);
			brick.element$ = element$;
			brick.width = element$.$.width;
			brick.height = element$.$.height;
			brick.text = element$.$.text;
		});
	}

	function bricks2lines(bricks,width,offset){
		var lines = List();
		var wordOffset = offset;
		var wordWidth = 0;
		var wordText = "";
		var wordBegin$ = bricks.begin$;
		var line = Line();
		line._ = List.push(lines,line);
		line.text = "";
		line.begin$ = bricks.head$;
		List.loop(bricks.head$,null,function(brick,brick$){
			//update word
			wordWidth += brick.width;
			wordText += brick.text;
			//end word
			var next$ = brick$.next$;
			if(next$===end$||brick.element$.$.word$!==next$.$.element$.$.word$){
				//change line
				if(wordBegin$!==line.begin$&&wordOffset+wordWidth>width&&(!wordBegin$.text||!blank.test(wordBegin$.text))){
					//end line
					line.end$ = wordBegin$;
					//new line
					line = Line();
					line._ = List.push(lines,line);
					line.begin$ = wordBegin$;
					wordOffset = wordWidth;
				}
				else{
					line.text += wordText;
					wordOffset += wordWidth;
				}
				//reset word
				wordText = "";
				wordWidth = 0;
				wordBegin$ = next$;
			}
		});
		line.end$ = end$;
		return lines;
	}

	function lineAlignLeft(line,offset){
		var offsetX = offset;
		List.loop(line.begin$,line.end$,function(brick){
			brick.offsetX = offsetX;
			offsetX += brick.width;
		});
		line.width = offsetX-offset;
	}

	function lineAlignSide(line,width,offset){
		//skip back space
		var end$ = line.end$;
		List.loop(line.begin$,line.end$,function(brick,brick$){
			if(!brick.text||!blank.test(brick.text)){
				end$ = brick$.next$;
			}
		});
		//calculate width
		var totalWidth = 0;
		List.loop(line.begin$,line.end$,function(brick){
			totalWidth += brick.width;
		});
		//calculate space
		var totalSpaceCount = 0;
		List.loop(line.begin$,line.end$,function(brick,brick$){
			var next$ = brick$.next$;
			if(next$!==end$&&brick.element$.$.word$!==next$.$.element$.$.word$){
				totalSpaceCount++;
			}
		});
		//calculate x
		var space = totalSpaceCount>0? (width-offset-totalWidth)/totalSpaceCount:0;
		var offsetX = offset;
		var spaceOffsetX = 0;
		var spaceCount = 0;
		List.loop(line.begin$,end$,function(brick,brick$){
			brick.offsetX = offsetX+spaceOffsetX;
			offsetX += brick.width;
			var next$ = brick$.next$;
			if(next$!==end$&&brick.element$.$.word$!==next$.$.element$.$.word$){
				spaceCount++;
				spaceOffsetX = (space*Math.min(spaceCount,totalSpaceCount)+0.5)<<0;
			}
		});
		List.loop(end$,line.end$,function(brick){
			brick.offsetX = offsetX+spaceOffsetX;
		});
		line.width = offsetX-offset;
	}

	function lineFlow(line,height){
		line.height = height;
		List.loop(line.begin$,line.end$,function(brick){
			line.height = Math.max(line.height,brick.height);
		});
		List.loop(line.begin$,line.end$,function(brick){
			brick.height = brick.height<0? height:brick.height;
			brick.offsetY = offsetY+line.height-brick.height;
		});
	}

	function blockFlow(block,offset){
		var offsetY = offset;
		var lines = block.lines;
		List.loop(lines.begin$,lines.end$,function(line){
			line.offsetY = offsetY;
			List.loop(line.begin$,line.end$,function(brick){
				brick.offsetY = offsetY+line.height-brick.height;
			});
			offsetY += line.height;
		});
		block.height = offsetY-offset;
	}

})();