(function(){
	var debug=$('debug')('jnode:ajax');

	$.extend($, {ajax:function(url, settings){
	if(typeof(settings)=='undefined')
		settings={};
	if(typeof(url)=='string')
		$.extend(settings, {url: url});
	else
		settings=url;
	
	url=$('url').parse(settings.url, true);

	var nodeOptions={
		hostname:url.hostname,
		port:url.port,
		method:settings.type || settings.data && 'POST' || 'GET',
		headers:settings.headers,
		path:url.pathname
	};
	
	if(nodeOptions.method=='GET' && settings.data)
	{
		if(url.search && url.search.length>1)
		{
			if(settings.data instanceof string)
				settings.data=$('querystring').parse(settings.data);
		}
		else
			url.query={}
		$.extend(url.query, settings.data);
	}
	if(url.search)
		nodeOptions.path=nodeOptions.path+'?'+$('querystring').stringify(url.query);

	debug($('util').inspect(nodeOptions));
	var request=$('http').request(nodeOptions, function(res) {
		if($.isFunction(settings.error))
			res.on('error', settings.error);
		
		var data='';
		
		if(!settings.dataType && res.headers.contentType && res.headers.contentType.startsWith('application/json'))
			settings.dataType='json';
			
		res.setEncoding('utf8');
		
		res.on('data', function(d){
			data+=d;
		});
		
		res.on('end', function(){
			if(settings.dataType=='json')
				data=JSON.parse(data.replace(/,[ \r\n]*\}/g, '}'));

			if(settings.dataType=='jsonp')
				eval(data);
			else
				settings.success(data);
		});
	});
	
	if($.isFunction(settings.error))
		request.on('error', settings.error);
	
	if(settings.data && nodeOptions.method!='GET')
	{
		if($.isPlainObject(settings.data))
			request.write(JSON.stringify(settings.data));
		else
			request.write(settings.data);	
		
	}
	
	request.end();
},
getJSON:function(url, success){
	return $.ajax({type:'GET', url:url, dataType:'json', success:success});
}});
})();