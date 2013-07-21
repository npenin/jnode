var jnodeFolder=__dirname+'/';
var cwd=process.cwd()+'/'
window={};
var debug=require('debug')('jnode:core');
require('vm').runInThisContext(require('fs').readFileSync(jnodeFolder+'jquery-core.js'), 'jquery-core.js');
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
