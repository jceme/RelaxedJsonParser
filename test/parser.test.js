var Parser = require("../lib/JsonParser"),
	should = require("should"),
	fs = require("fs"),
	
	TEST_DIR = "./test/json/";


suite("Parser test", function() {
	var success, failing, file = null;
	
	success = {
			
			TestComplexOkay: {
				mykey: "is \"here \' for ' you \n test",
				some: -.0e+0,
				"3rd": true,
				"Handle \nbar": null,
				ary: [],
				"this": null,
				"var": "me\"for ' you",
				"$other_ary": [
					null,
					false,
					true,
					"me\u04F2",
					{}
				]
			},
			
			TestSimpleOkay: {
				foo: "bar",
				bar: "foo"
			}
			
	};
	
	failing = {
			
			TestSimpleFailed: /but "{" found/,
			
			TestEmpty: /but end of input found/
	
	};
	
	
	for (file in success) {
		test("Testing success JSON file "+file, (function(file, expectedResult) {
			return function() {
				var source, result;
				
				source = fs.readFileSync(TEST_DIR + file + ".json").toString();
				
				result = Parser.parse(source);
				
				should.deepEqual(result, expectedResult);
			};
		})(file, success[file]));
	}
	
	for (file in failing) {
		test("Testing failing JSON file "+file, (function(file, expectedResult) {
			return function() {
				var source;
				
				source = fs.readFileSync(TEST_DIR + file + ".json").toString();
				
				Parser.parse.bind(null, source).should.throwError(expectedResult);
			};
		})(file, failing[file]));
	}
	
	
	(function(equal) {

		test("Test base value null", function() {
			[ "null", "NULL", "  nUlL  \t ", "  /* true*/ null // 58"
			].forEach(function(source) {
				equal(null, source);
			});
		});
		
		test("Test base value true", function() {
			[ "true", "TRUE", "  TrUe  \t ", "  /* null*/ true // 58"
			].forEach(function(source) {
				equal(true, source);
			});
		});
		
		test("Test base value false", function() {
			[ "false", "FALSE", "  fAlSe  \t ", "  /* null*/ false // 58"
			].forEach(function(source) {
				equal(false, source);
			});
		});
		
		test("Test base value number", function() {
			equal(28, "  28 ");
			equal(-28, "  -28 ");
			equal(-28, "  -28.00 ");
			equal(-0.8, "-.8//4");
			equal(0.8, "+8e-1");
			equal(-80, "-8E+1");
			(function() { Parser.parse("8."); }).should.throwError();
		});

	})(function equal(expected, source) {
		var r;
		should.strictEqual(r = Parser.parse(source), expected, "Expecting "+expected+", not "+r);
	});
	

	(function(equal) {

		test("Test object parse", function() {
			equal({}, "{}");
			equal({}, "  {\n} ");
			equal({"foo":"bar"}, "{foo:'bar'}");
			equal({"foo":"rab"}, " /* say my */\n  // name  \n  {'foo':\"rab\"}");
		});

		test("Test array parse", function() {
			equal([], "[]");
			equal([], "  [\n] ");
			equal(["foo","bar"], "[\"foo\"\n  'bar']");
			equal(["foo","rab"], " /* say my */\n  // name  \n  ['foo',\"rab\"]");
		});
		
		test("Octal parsing", function() {
			equal([0755], "[0755]");
			equal([-0064], "[-0064]");
		});
		
		test("Hexa parsing", function() {
			equal([0x2F9], "[0x2F9]");
			equal([-0x04a], "[-0x04a]");
		});

	})(function equal(expected, source) {
		var r;
		should.deepEqual(r = Parser.parse(source), expected, "Expecting "+expected+", not "+r);
	});
	
});
