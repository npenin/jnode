var jnodeFolder=__dirname+'/';
var cwd=process.cwd()+'/'
window={};
var debug=require('debug')('jnode:core');
var vm=require('vm');
vm.runInThisContext(require('fs').readFileSync(jnodeFolder+'jquery-core.js'), 'jquery-core.js');
var context;
var register=function(verb, path)
{
	return function(route){
		debug('registering route '+verb+' '+route);
		if($.isArray(route))
		{
			$.each(route, function(){
				$[verb](this,path); 
			});					
		}
		else
			$[verb](route,path);
		return this;
	}
}

String.prototype.startsWith=function(str){
    return this.substr(0, Math.min(this.length, str.length))==str;
}

String.prototype.endsWith=function(str){
    var length=Math.min(this.length, str.length);
    return this.substr(this.length-length)==str;
}

global.$=function(moduleName){
	if(typeof(moduleName)==='string')
	{
		if(moduleName.startsWith('./') || moduleName.startsWith('../'))
			moduleName=cwd + moduleName;
		return $[moduleName] || ($[moduleName]=require(moduleName));
	}
	if($.isFunction(moduleName))
	{
		if(context)
			$.get(context.request.url.pathname, moduleName);
		return {
			get:register('get', moduleName),
			post:register('post', moduleName),
			put:register('put', moduleName),
			head:register('head', moduleName),
			del:register('del', moduleName),
			options:register('options', moduleName),
			all:register('all', moduleName),
			on:function(verb){ return register(verb,moduleName); }
		};
	}
};

jQuery.extend($, jQuery);
var stop=false;
var subProcesses={};

$.service=function(file, cwd, args, callback){
	if($.isFunction(args))
	{
		callback=args;
		args=[];
	}
	var cp=$('child_process').fork(file, args, {cwd: cwd, env:process.env});
	subProcesses[cp.pid]=true;
	if(callback)
	    callback(cp);
    console.log('forked');
    cp.on('exit', function(){
        if(stop)
            return;
        delete subProcesses[cp.pid];
        $.service(file, cwd, args, callback);
    });
}


process.on('SIGINT', function(){
    stop=true;
    for(var i=0;i<subProcesses.length;i++)
        process.kill(subProcesses[i], 'SIGINT');
    process.exit();
})

String.prototype.endsWith=function(s)
{
	return this.substring(this.length-s.length)==s;
};
String.prototype.startsWith=function(s)
{
	return this.substring(0,s.length)==s;
};

var defaultTrimChars=' \t\r\n';

String.prototype.trimStart=function(chars)
{
	chars=chars ||defaultTrimChars;
	return this.replace(new RegExp('^['+chars+']+'), '');
}
String.prototype.trimEnd=function(chars)
{
	chars=chars ||defaultTrimChars;
	return this.replace(new RegExp('['+chars+']+$'), '');
}
String.prototype.trim=function(chars)
{
	chars=chars ||defaultTrimChars;
	return this.trimStart(chars).trimEnd(chars);
}

$(jnodeFolder+'jquery-ajax-wrapper.js');

$.eachAsync=function(array, body, completed)
{
    if(!$.isArray(array))
    {
        $.eachAsync(Object.keys(array), function(i, key, next){
            body(key, array[key], next);
        }, function(){
            if(completed)
                completed(array);
        })
    }
	(function step(index)
	{
		if(index<array.length)
			body(index, array[index], function(){ step(index+1) });
		else if(completed)
			completed(array);
	})(0);
}
