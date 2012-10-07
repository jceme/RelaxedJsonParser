module.exports = (function() {
	"use strict";

	var pegjsParser = require("./PegjsJsonParser");

	return {

		parse: function(source) {
			var result;
			
			if (typeof source === "string") {
				result = pegjsParser.parse(source);
				
				return result == null ? null : result;
			}
			
			// else return undefined
		}

	};
})();
