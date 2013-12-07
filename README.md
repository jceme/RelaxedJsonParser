Relaxed JSON Parser
=======

This is a **JSON parser** which accepts laxly-formatted JSON sources for input.

The intention was to have a more liberal parser than `JSON.parse()` which just accepts the [Standard JSON spec](http://www.json.org/).

This parser is usable as CommonJS module for Javascript.

Many thanks to David Majda and his parser generator [PEG.js](http://pegjs.majda.cz/).


Usage
-----
Assume the following JSON input in a file *myconf.json*:
```javascript
/*
 * This is an example config JSON file with comments.
 * It demonstrates a lax JSON file format.
 */
// Let's start ...

{

	server: 'http://example.com'
	"port": 8080                       // Defaults to 1234
	user: "Test",
	,
	$password
				:
					"me\there
on"
	
	modes: [
		"on"
		"off",
		"active", "disabled"
	]

	/* And most important */
	foo: +.3E-0,
	
	bar: 0644,
	test: 0xFF,
}

// That's it!
```

And now make use of the relaxed parser:
```javascript
var fs = require("fs"),
	Parser = require("RelaxedJsonParser");

fs.readFile("myconf.json", function(err, source) {
	var jsondata;
	if (err) throw err;
	
	try {
		jsondata = Parser.parse(source);
		
		// JSON parsed into jsondata, you are now free to use it ...
		console.log("Have server " + jsondata.server + " with password " + jsondata["$password"]);
		// etc.
	}
	catch (e) {
		// If even this JSON source is not parseable then an error is thrown by the parser
	}
});
```

The *jsondata* variable in the callback will be this Javascript object:
```json
{
	"server": "http://example.com",
	"port": 8080,
	"user": "Test",
	"$password": "me\there\non",
	"modes": [
		"on",
		"off",
		"active",
		"disabled"
	],
	"foo": 0.3,
	"bar": 420,
	"test": 255
}
```
