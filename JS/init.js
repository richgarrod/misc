(function () {
	'use strict';

	/**
	 * This function is responsible for capturing data (based on mappings.js) and sending data (with use of DataReporter class).
	 *
	 * @name init
	 */
	function init () {
		var reporter = new classes.DataReporter();
		var dataCapture = new classes.DataCapture(reporter);

		dataCapture.init(mappings);
	}

	document.addEventListener('DOMContentLoaded', init, false);
}());
