var jnodeFolder=__dirname+'/';
var cwd=process.cwd()+'/'
window={};
require('vm').runInThisContext(require('fs').readFileSync(jnodeFolder+'jquery-core.js'), 'jquery-core.js');
var context;
var register=function(verb, path)
{
	return function(route){
		console.log('registering route '+verb+' '+route);
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
			all:register('all', moduleName)
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