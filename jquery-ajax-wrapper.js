(function ()
{
    var debug = $('debug')('jnode:ajax');

    $.extend($, { ajax: function (url, settings)
    {
        if (typeof (settings) == 'undefined')
            settings = {};
        if (typeof (url) == 'string')
            $.extend(settings, { url: url });
        else
            settings = url;
        if(typeof(settings.url)=='string')
            url = $('url').parse(settings.url, true);
        else
            url=settings.url;
		
		if(!settings.headers)
			settings.headers={};
		if(!settings.headers.accept)
		{
			switch(settings.dataType)
			{
				case 'json':
					settings.headers.accept='application/json';
					break;
				case 'xml':
					settings.headers.accept='application/xml';
					break;
			}
		}

        if(!url.hostname)
        {
            url.hostname=global.host;
            url.port=global.port;
            url.protocol='http';
        }
        
        var nodeOptions = {
            hostname: url.hostname,
            port: url.port,
            method: settings.type && settings.type.toUpperCase() || settings.data && 'POST' || 'GET',
            headers: settings.headers,
            path: url.pathname
        };
        
        if(url.auth)
            nodeOptions.auth=url.auth;

        debug(nodeOptions.method);
        debug(url.query);
        if (nodeOptions.method == 'GET' && settings.data)
        {
            if (settings.data instanceof String)
                settings.data = $('querystring').parse(settings.data);
            if(!url.query)
                url.query = {};
            $.extend(url.query, settings.data);
        }
        if (url.query && Object.keys(url.query).length>0)
            nodeOptions.path = nodeOptions.path + '?' + $('querystring').stringify(url.query);

        if(url.protocol && url.protocol.endsWith(':'))
            url.protocol=url.protocol.substring(0,url.protocol.length-1);
            
		if (settings.data && nodeOptions.method != 'GET')
        {
            if ($.isPlainObject(settings.data))
                settings.data=JSON.stringify(settings.data);
			settings.headers['content-length']=settings.data.length;
			switch(settings.dataType)
			{
				case 'json':
					settings.headers['content-type']='application/json';
					break;
				case 'xml':
					settings.headers['content-type']='text/xml';
					break;
			}
		}
			
        debug($('util').inspect(nodeOptions));
		var request=$(url.protocol || global.protocol).request(nodeOptions);
		if(settings.success)
			request.on('response', function (res)
        {
            if ($.isFunction(settings.error))
                res.on('error', settings.error);

            if((res.statusCode==302 || res.statusCode==301 || res.statusCode==307) && res.headers.location)
            {
                $.ajax(res.headers.location, settings);
            }
            
            var data = '';

            if (!settings.dataType && res.headers.contentType && res.headers.contentType.startsWith('application/json'))
                settings.dataType = 'json';

			res.setEncoding('utf8');

			res.on('data', function (d)
			{
				data += d;
			});

			res.on('end', function ()
			{
				if (res.statusCode==200 && settings.dataType=='json' || res.headers['content-type'] && res.headers['content-type'].startsWith('application/json'))
				{
					try
					{
						data = JSON.parse(data.replace(/,[ \r\n]*\}/g, '}'));
					}
					catch(error)
					{
						console.log(error);
						console.log(data);	
					}
				}
				
				if (res.statusCode==200 && settings.dataType == 'xml' || res.headers['content-type'] && res.headers['content-type'].startsWith('application/xml'))
					$('xml2js').parseString(data, function(error, result){ 
						if(error) 
							settings.error(error); 
						else 
							settings.success(result);
					});
				else if(res.statusCode==200)
				{
					if (settings.dataType == 'jsonp')
						eval(data);
					else
						settings.success(data);
				}
				else if(settings.error)
					settings.error(data, res.statusCode, res);
			});
        });

        if ($.isFunction(settings.error))
            request.on('error', settings.error);
        
		if (settings.data && nodeOptions.method != 'GET')
		{
			debug(settings.data);
			request.write(settings.data);
        }

		process.nextTick(function(){
			request.end();
		});

        return request;
    },
        getJSON: function (url, success)
        {
            return $.ajax({ type: 'GET', url: url, dataType: 'json', success: success });
        } 
    });
})();