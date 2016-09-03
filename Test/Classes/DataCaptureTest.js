(function(win, classes){
  'use strict';

  describe('DataCapture', function () {
    var DataCapture = classes.DataCapture,
        DataReporter = classes.DataReporter,
        dataCaptureInstance, mappings,
        reporter;

    describe('constructor', function () {
      it('initalizes the reporter object', function () {
        reporter = new DataReporter();
        dataCaptureInstance = new DataCapture(reporter);

        expect(dataCaptureInstance.reporter).toBe(reporter);
        expect(dataCaptureInstance.reporter.data).toEqual({});
      });
    });

    describe('validateValue', function () {
      beforeEach(function () {
        reporter = new DataReporter();
        dataCaptureInstance = new DataCapture(reporter);
      });

      it('should return only valid email addresses when validating email addresses', function () {
          var mapping = {
              isEmail: true
          };

          var validEmail = 'valid@email.com';
          expect(dataCaptureInstance.validateValue(mapping, validEmail)).toEqual(validEmail);
          expect(dataCaptureInstance.validateValue(mapping, 'invalidemail.com')).toEqual(null);
      })

      it('should return only valid phone numbers when validating phone numbers', function () {
          var mapping = {
              isPhoneNumber: true
          };

          var validNumber = '02055 333 125';
          expect(dataCaptureInstance.validateValue(mapping, validNumber)).toEqual(validNumber);
          expect(dataCaptureInstance.validateValue(mapping, '123')).toEqual(null);
      })  

      it('should return the value if it is not an email or phone number', function () {
            var mapping = {};

            expect(dataCaptureInstance.validateValue(mapping, 'anyValue')).toEqual('anyValue');
      })    
    });

    describe('getValueFromElement', function () {
        beforeEach(function () {
            var reporter = new DataReporter();
            dataCaptureInstance = new DataCapture(reporter);
        });

        it('should get the innterHTML when we want the text attribute', function () {
            var mapping = {
                attribute: 'text'
            };

            var element = document.createElement('div');
            var expectedValue = 'testValue';

            element.innerHTML = expectedValue;
            
            expect(dataCaptureInstance.getValueFromElement(mapping, element)).toEqual(expectedValue);
        });

        it('should get the value when we want the value attribute', function () {
            var mapping = {
                attribute: 'value'
            };

            var element = document.createElement('input');
            var expectedValue = 'testValue';

            element.value = expectedValue;
            
            expect(dataCaptureInstance.getValueFromElement(mapping, element)).toEqual(expectedValue);
        });

        it('should get "Checked" when we want the checkbox attribute and it is checked', function () {
            var mapping = {
                attribute: 'checkbox'
            };

            var element = document.createElement('checkbox');

            element.checked = true;
            
            expect(dataCaptureInstance.getValueFromElement(mapping, element)).toEqual('Checked');
        });

        it('should get "Unchecked" when we want the checkbox attribute and it is not checked', function () {
            var mapping = {
                attribute: 'checkbox'
            };

            var element = document.createElement('checkbox');

            element.checked = false;
            
            expect(dataCaptureInstance.getValueFromElement(mapping, element)).toEqual('Unchecked');
        });

        it('should get the value of the element when we want a radio attribute and it is checked', function () {
            var mapping = {
                attribute: 'radio'
            };

            var element = document.createElement('input');
            var expectedValue = 'testValue';
            element.checked = true;

            element.value = expectedValue;
            
            expect(dataCaptureInstance.getValueFromElement(mapping, element)).toEqual(expectedValue);
        });

        it('should not get the value of the element when we want a radio attribute and it is not checked', function () {
            var mapping = {
                attribute: 'radio'
            };

            var element = document.createElement('input');
            element.checked = false;

            element.value = 'weDontWantThis';
            
            expect(dataCaptureInstance.getValueFromElement(mapping, element)).toEqual('');
        });

        it('should throw an error when we ask for an unexpected attribute', function () {
            var mapping = {
                attribute: 'bacon'
            };

            var element = document.createElement('div');

            expect(function () {dataCaptureInstance.getValueFromElement(mapping, element)})
                .toThrowError('Unexpected attribute: bacon');
        })
    });
    describe('setOnLoadEvent', function () {
        beforeEach(function () {
            reporter = new DataReporter();
            dataCaptureInstance = new DataCapture(reporter);

            spyOn(reporter, 'send');
        });

        it('should send the data with reporter for each matching element', function () {
            var element = document.createElement('input');
            var expectedValue = 'testValue';
            element.value = expectedValue;

            var mapping = {
                selector: '.email',
                id: 5,
                attribute: 'value'
            };

            spyOn(document, 'querySelectorAll').and.callFake(function (selector) {
                if(selector === mapping.selector) {
                    return [element, element];
                }
            });

            dataCaptureInstance.sendOnLoadEvent(mapping);
            
            expect(reporter.send.calls.count()).toEqual(2);
        });

        it('should not send data for null data', function () {
            var element = document.createElement('input');
            var expectedValue = 'testValue';
            element.value = expectedValue;

            var mapping = {
                selector: '.email',
                id: 5,
                attribute: 'value',
                isEmail: true
            };

            spyOn(document, 'querySelectorAll').and.callFake(function (selector) {
                if(selector === mapping.selector) {
                    return [element];
                }
            });

            dataCaptureInstance.sendOnLoadEvent(mapping);
            
            expect(reporter.send.calls.count()).toEqual(0);
        });
    });

    describe('setOnChangeListener', function () {
         beforeEach(function () {
            reporter = new DataReporter();
            dataCaptureInstance = new DataCapture(reporter);

            spyOn(reporter, 'send');
        });

        it('should send the data with reporter when the element changes', function () {
            var element = document.createElement('input');

            var mapping = {
                selector: '.email',
                id: 5,
                attribute: 'value'
            };

            spyOn(document, 'querySelectorAll').and.callFake(function (selector) {
                if(selector === mapping.selector) {
                    return [element];
                }
            });

            dataCaptureInstance.setOnChangeListener(mapping);
            
            var event = new Event('change');

            element.dispatchEvent(event);
            expect(reporter.send.calls.count()).toEqual(1);
        });

        it('should not send the data with reporter when the element changes but is invalid', function () {
            var element = document.createElement('input');

            var mapping = {
                selector: '.email',
                id: 5,
                attribute: 'value',
                isEmail: true
            };

            spyOn(document, 'querySelectorAll').and.callFake(function (selector) {
                if(selector === mapping.selector) {
                    return [element];
                }
            });

            dataCaptureInstance.setOnChangeListener(mapping);
            
            element.value = 'not a valid email';

            var event = new Event('change');
            
            element.dispatchEvent(event);
            expect(reporter.send.calls.count()).toEqual(0);
        });
    });

    describe('init', function () {
         beforeEach(function () {
            reporter = new DataReporter();
            dataCaptureInstance = new DataCapture(reporter);

            spyOn(reporter, 'send');
        });

        it('should send initial data and set up listeners', function () {
            var element1 = document.createElement('input');
            var expectedValue1 = 'testValue';
            element1.value = expectedValue1;

            var element2 = document.createElement('div');
            var expectedValue2 = 'testText';
            element2.value = expectedValue2;

            var elements = [element1, element2];

            var mappings = [{
                selector: '.email',
                id: 5,
                attribute: 'value',
                event: 'onLoad'
            }, {
                selector: 'phoneNumber',
                id: 10,
                attribute: 'text',
                event: 'onChange'
            }];

            spyOn(document, 'querySelectorAll').and.callFake(function (selector) {
                if(selector === mappings[0].selector) {
                    return [elements[0]];
                }
                if(selector === mappings[1].selector) {
                    return [elements[1]];
                }
            });

            dataCaptureInstance.init(mappings);
            
            expect(reporter.send.calls.count()).toEqual(1);

            var event = new Event('change');
            elements[1].dispatchEvent(event);

            // this should not emit a send as element1 is not being watched
            var event = new Event('change');
            elements[0].dispatchEvent(event);

            expect(reporter.send.calls.count()).toEqual(2);


        });
    });
  });
}(window, classes));