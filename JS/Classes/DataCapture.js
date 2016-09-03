var classes = classes || {};

(function(win, classes){
	'use strict';

	/**
	 * This class sets up data capture on the page
	 *
	 * @constructs DataCapture
	 */
	function DataCapture(reporter) {
		this.reporter = reporter;
	};

	/**
	 * This function initialises the whole process of capturing data and is the public interface
	 * 
	 * @name init
	 */
	DataCapture.prototype.init = function(mappings) {
		mappings.forEach(function(mapping) {
			if(mapping.event === 'onLoad') {
				this.sendOnLoadEvent(mapping);
			}
			else {
				this.setOnChangeListener(mapping);
			}
		}, this);
	};

	/**
	 * This function handles the on load events and sends their data via data reporter
	 * 
	 * @name sendOnLoadEvent
	 * @param {object} mapping - the mapping object defining the data to send
	 */
	DataCapture.prototype.sendOnLoadEvent = function(mapping) {
		// As they're classes there can be multiple elements, so we use querySelectorAll
		var elements = document.querySelectorAll(mapping.selector);
		
		elements.forEach(function (element) {
			var data = this.getValueFromElement(mapping, element);
			// We don't want to send null data, this indicates an invalid entry ('' is not invalid)
			if(data !== null) {
				this.reporter.send(mapping.id, data)
			};
		}, this);
	};

	/**
	 * This function sets up the on change listeners for the different elements
	 * 
	 * @name setOnChangeListener
	 * @param {object} mapping - the mapping object defining the data to send
	 */
	DataCapture.prototype.setOnChangeListener = function (mapping) {
		// Whilst they're mostly ID selectors, there is one input selector and they MIGHT not be ids, they just happen to be
		var elements = document.querySelectorAll(mapping.selector);
		
		// var reporter = this.reporter;

		elements.forEach(function (element) {
			element.addEventListener('change', function () {
				var data = this.getValueFromElement(mapping, element);
				// Again null indicates invalid data
				if(data !== null) {
					this.reporter.send(mapping.id, data);
				}
			}.bind(this))
		}, this)
	};
	
	/**
	 * Simple utility function for getting desired data from the DOM element
	 * 
	 * @name getValueFromElement
	 * @param {object} mapping - the mapping object defining the data to send
	 * @param {object} element - the dom element we are reading the data from
	 */
	DataCapture.prototype.getValueFromElement = function (mapping, element) {
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
			throw new Error("Unexpected attribute: " + mapping.attribute);
		}

		return this.validateValue(mapping, value);
	};

	/**
	 * Simple utility function for ensuring the value in the element is valid
	 * 
	 * @name validateValue
	 * @param {object} mapping - the mapping object defining the data to send
	 * @param {string} value - the value to be checked
	 */
	DataCapture.prototype.validateValue = function (mapping, value) {
		if(mapping.isPhoneNumber) {
			// Regex taken from http://www.regexlib.com/UserPatterns.aspx?authorid=d95177b0-6014-4e73-a959-73f1663ae814&AspxAutoDetectCookieSupport=1
			var phoneNumberRegex = /^(((\+44\s?\d{4}|\(?0\d{4}\)?)\s?\d{3}\s?\d{3})|((\+44\s?\d{3}|\(?0\d{3}\)?)\s?\d{3}\s?\d{4})|((\+44\s?\d{2}|\(?0\d{2}\)?)\s?\d{4}\s?\d{4}))(\s?\#(\d{4}|\d{3}))?$/;
			return phoneNumberRegex.test(value) ? value : null;
		}
		if(mapping.isEmail) {
			// Regex taken from http://emailregex.com/
			var emailRegex = /^[-a-z0-9~!$%^&*_=+}{\'?]+(\.[-a-z0-9~!$%^&*_=+}{\'?]+)*@([a-z0-9_][-a-z0-9_]*(\.[-a-z0-9_]+)*\.(aero|arpa|biz|com|coop|edu|gov|info|int|mil|museum|name|net|org|pro|travel|mobi|[a-z][a-z])|([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}))(:[0-9]{1,5})?$/i;
			return emailRegex.test(value) ? value : null;

		}
		return value;
	};

	classes.DataCapture = DataCapture;

}(window, classes));