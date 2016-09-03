(function () {
	'use strict';


// 	   {
//         id: 1, - id to be sent to prevent duplication of data
//         selector: '#email', - html selector for listener
//         attribute: 'value', - definition of what to send on that element
//         event: 'onChange', - when to send it
//         isEmail: true, - how to send 
//         isPhoneNumber: false - how to send
//     },

	/**
	 * This function is responsible for capturing data (based on mappings.js) and sending data (with use of DataReporter class).
	 *
	 * @name init
	 */
	function init () {
		var reporter = new classes.DataReporter;

		mappings.forEach(function(mapping) {
			if(mapping.event === 'onLoad') {
				sendOnLoadEvent(reporter, mapping);
			}
			else {
				setOnChangeListener(reporter, mapping);
			}
		});
	}

	document.addEventListener('DOMContentLoaded', init, false);

	/**
	 * This function handles the on load events and sends their data via data reporter
	 */
	function sendOnLoadEvent(reporter, mapping) {
		var elements = document.querySelectorAll(mapping.selector);
		
		for(var i = 0; i < elements.length; i++) {
			var data = getValueFromElement(mapping, elements[i]);
			if(data !== null) {
				reporter.send(mapping.id, data)
			};
		};
	}

	/**
	 * This function sets up the on change listeners for the different elements
	 */
	function setOnChangeListener(reporter, mapping) {
		var elements = document.querySelectorAll(mapping.selector);
		
		elements.forEach(function (element) {
			element.addEventListener('change', function () {
				var data = getValueFromElement(mapping, element);
				if(data !== null) {
					reporter.send(mapping.id, data);
				}
			})
		})
	}

	/**
	 * Simple utility function for getting desired data from the DOM element
	 */
	function getValueFromElement(mapping, element) {
		var value;
		if(mapping.attribute === 'text') {
			value = element.innerHTML;
		}
		else if(mapping.attribute === 'value') {
			value = element.value;
		}
		else if(mapping.attribute === 'checkbox') {
			value = element.checked ? 'Checked' : 'Unchecked';
		}
		else if(mapping.attribute === 'radio') {
			value = element.checked ? element.value : '';
		}
		else {
			throw "Unexpected attribute: " + mapping.attribute;
		}

		return validateValue(mapping, value);
	}

	function validateValue(mapping, value) {
		if(mapping.isPhoneNumber) {
			// Regex taken from http://www.regexlib.com/UserPatterns.aspx?authorid=d95177b0-6014-4e73-a959-73f1663ae814&AspxAutoDetectCookieSupport=1
			var phoneNumberRegex = /^(((\+44\s?\d{4}|\(?0\d{4}\)?)\s?\d{3}\s?\d{3})|((\+44\s?\d{3}|\(?0\d{3}\)?)\s?\d{3}\s?\d{4})|((\+44\s?\d{2}|\(?0\d{2}\)?)\s?\d{4}\s?\d{4}))(\s?\#(\d{4}|\d{3}))?$/;
			return phoneNumberRegex.test(value) ? value : null;
		}
		if(mapping.isEmail) {
			// Regex taken from http://emailregex.com/
			var emailRegex = /^[-a-z0-9~!$%^&*_=+}{\'?]+(\.[-a-z0-9~!$%^&*_=+}{\'?]+)*@([a-z0-9_][-a-z0-9_]*(\.[-a-z0-9_]+)*\.(aero|arpa|biz|com|coop|edu|gov|info|int|mil|museum|name|net|org|pro|travel|mobi|[a-z][a-z])|([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}))(:[0-9]{1,5})?$/i
;
			return emailRegex.test(value) ? value : null;

		}
		return value;
	}

}());
