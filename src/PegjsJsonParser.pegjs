// JSON parser grammar
// Parser generator website: http://pegjs.majda.cz

{
	function flatten(a) {
		if (a instanceof Array) {
			var result = "";
			for (var i=0; i < a.length; i++) {
				result += flatten(a[i]);
			}
			return result;
		} else {
			return "" + a;
		}
	}

	// Special object as null replacement
	var NULL_OBJECT = {};
	
	function getValue(value) {
		return value === NULL_OBJECT ? null : value;
	}
}

json =
	WS* val:value WS*
{
	return (function(undefined) {
		return val === NULL_OBJECT ? undefined : val;
	})();
}


object "object" =
	'{'
	CWS*
	p:(
		sp:pair CWS*
		{
			return sp;
		}
	)*
	'}'
{
	var result = {}, i, len = p.length, b;
	for (i=0; i < len; i++) {
		b = p[i];
		result[b.id] = b.val;
	}
	return result;
}


pair "objectPair" =
	id:( string / key )
	WS*
	':'
	WS*
	val:value
{
	return { id: flatten(id), val: getValue(val) };
}


key "key" = [a-zA-Z0-9_$]+


array "array" =
	'['
	CWS*
	vals:(
		v:value CWS*
		{
			return v;
		}
	)*
	']'
{
	return vals.map(function(val) {
		return getValue(val);
	});
}


value =
	object
	/ array
	/ string
	/ boolean
	/ null
	/ number


boolean "boolean" =
		'true'i
		{
			return true;
		}
	/	'false'i
		{
			return false;
		}

null "null" =
	'null'i
{
	return NULL_OBJECT;
}



string "string" =
		(
			'"'
			s:(
				(
					'\\'
					e:escseq
					{
						return e;
					}
				)
			/	[^\\"]
			)*
			'"'
		)
		{
			return flatten(s);
		}
	/	(
			"'"
			s:(
				(
					'\\'
					e:escseq
					{
						return e;
					}
				)
			/	[^\\']
			)*
			"'"
		)
		{
			return flatten(s);
		}

escseq =
		(
			k:[bfnrt]
			{
				switch (k) {
					case "b": return "\b";
					case "f": return "\f";
					case "n": return "\n";
					case "r": return "\r";
					default:  return "\t";
				}
			}
		)
	/	(
			'u' hd:(hexdigit hexdigit hexdigit hexdigit)
			{
				return String.fromCharCode(parseInt(flatten(hd), 16));
			}
		)
	/	(
			// Any other escaped char is passed as is
			j:.
			{
				return j;
			}
		)


number "number" =
n:(
	sign?
	(
		(
			( '0' / (Digit digit*) )
			( '.' digit+ )?
		)
	/	( '.' digit+ )
	)
	exponent?
)
{
	return parseFloat(flatten(n));
}

sign = [+-]

exponent =
	[eE]
	sign?
	digit+

Digit = [1-9]

digit = [0-9]

hexdigit = [0-9a-fA-F]


WS "whitespace" = [ \t\n\r] / COMMENT

CWS "whitespace" = [ \t\n\r,] / COMMENT

COMMENT "comment" = LINE_COMMENT / MULTI_COMMENT

LINE_COMMENT "line comment" =
	'//'
	[^\n\r]*

MULTI_COMMENT "multi-line comment" =
	'/*'
	(
		[^*]
		/ ('*' &[^/])
	)*
	'*/'