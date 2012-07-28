jnode
=====

nodejs api using jquery simplicity. 

jnode uses the file core.js (c14a6b385fa419ce67f115e853fb4a89d8bd8fad) which is at https://github.com/jquery/jquery/blob/master/src/core.js.

jnode aims to be used by an http server. You may also use it without but you might have useless features

What jnode brings :
- an easy configuration of http server
- a static file server
- an api server (with the ability to handle automatic wrapping on result depending on content type expected by the client)
- the $ function of jquery : you can load a module using the $ function or export an handler (discussed below)
- the isFunction, isArray, ... of jquery
- the each, inArray, merge, grep, map,  function of jquery

How to make an handler
=====

The most explicit is the quit handler bundled with jnode :

$(function(req,res,japi){
```js
japi('Will be turned off when all the '+server.connections+' connection(s) will be closed');
req.connection.destroy();
server.close(function()
{
  console.log('Exiting');
});
});
```

As you can see, the function passed to the $ function expects 3 arguments : the request, the response, and the japi.

japi is a function built-in to jnode used to wrap the result of your handler. In the quit handler, a simple string is retrurned but it also could have been a JSON object. The JSON object would then have been wrapped by the callback if the expected result is jsonp.

How to make japi know which content type is expected
=====
You have 2 possibilities to make japi understand which content you expect : query string or HTTP Accept header.

Query String
====
If you want a to have json or jsonp in your response, you have to specify it in the ret query string parameter :

http://192.168.68.11/quit.jnode?ret=json

http://192.168.68.11/quit.jnode?ret=jsonp

Accept header
====
If you have not specified the ret query string parameter, the accept header is used. Which is basically what jquery on client does change.

Here are the allowed content types for json :
  - text/javascript
	- application/json
  - application/x-javascript
  - text/x-javascript
  - text/x-json

Here are the allowed content types for jsonp :
  - application/jsonp
  - text/x-jsonp