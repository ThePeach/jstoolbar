/*jshint bitwise:true, curly:true, eqeqeq:true, forin:true, noarg:true, noempty:true, nonew:true, undef:true, unused:true, strict:true, browser:true */
/*global JSTB, describe, it, expect, beforeEach */
describe('JSTB Components', function () {
    'use strict';
    // internal vars used throughout the tests
    var textarea;

    beforeEach(function() {
        var testContainer = document.getElementById('testContainer');

        textarea = document.createElement('textarea');
        textarea.id = 'jsToolbar';
        testContainer.innerHTML = '';
        testContainer.appendChild(textarea);
    });

    describe('JSToolbar', function () {
        it('is instantiated with a basic configuration', function () {
            var expectedLang = 'en',
                expectedSyntax = 'markdown',
                toolbarElements = [ 'string', 'styles', 'spacer' ],
                jsToolbar = new JSTB.components.JsToolbar(textarea, toolbarElements, expectedSyntax, expectedLang);

            expect(jsToolbar instanceof JSTB.components.JsToolbar).toBeTruthy();
            expect(jsToolbar.language).toEqual(expectedLang);
            expect(jsToolbar.syntax).toEqual(expectedSyntax);
            expect(jsToolbar.toolbarElements).toEqual(toolbarElements);

            // loose check the DOM structure has been instantiated
            expect(textarea.parentNode.className).toEqual(jsToolbar.getBaseClass() + 'editor');
        });

        it('initialises the elements based on the mode', function () {
            var i,
                expectedModes = [ 'wiki' ],
                jsToolbar = new JSTB.components.JsToolbar(textarea);

            for (i=0; i<expectedModes.length; i++) {
                jsToolbar.draw(expectedModes[i]);

                expect(jsToolbar.getMode()).toEqual(expectedModes[i]);
            }
        });

        it('is instantiated with a custom configuration', function () {
            var i,
                buttons = [ 'strong', 'styles', 'spacer' ],
                buttonTypes = [ 'button', 'combo', 'spacer' ], // TODO this could be extracted from the actual elements types
                jsToolbar = new JSTB.components.JsToolbar(textarea, buttons);

            jsToolbar.draw();
            expect(jsToolbar.toolbar.childNodes.length).toEqual(3);

            for (i=0; i < jsToolbar.toolbar.childNodes.length; i+=1) {
                expect(jsToolbar.toolbar.childNodes[i].className).toEqual(jsToolbar.getButtonBaseClass() + buttonTypes[i]);
            }
        });

        it('fails silently if the buttons do not exist', function () {
            var buttons = [ 'a', 'b', 'c' ],
                jsToolbar = new JSTB.components.JsToolbar(textarea, buttons);

            jsToolbar.draw();
            expect(jsToolbar.toolbar.hasChildNodes()).toBeFalsy();
        });

        it('allows to customise the class of any button', function () {
            var i, jsToolbar,
                baseClass = 'base-',
                buttonBaseClass = 'button--',
                elementsConfig = [ 'spacer', 'ol', 'strong' ],
                buttonTypes = [ 'spacer', 'button', 'button' ];

            jsToolbar = new JSTB.components.JsToolbar(textarea, elementsConfig);
            jsToolbar.setBaseClass(baseClass);
            jsToolbar.setButtonBaseClass(buttonBaseClass);
            jsToolbar.draw();

            for (i=0; i < jsToolbar.toolbar.childNodes.length; i+=1) {
                expect(jsToolbar.toolbar.childNodes[i].className).toEqual(baseClass + buttonBaseClass + buttonTypes[i]);
            }
        });
    });

    describe('Functions', function () {
        describe('getCaretPosition', function () {
            it('returns 0 when no content in the textarea', function () {
                var jsToolbar = new JSTB.components.JsToolbar(textarea);

                expect(jsToolbar.getCaretPosition()).toEqual(0);
            });

            it('returns the expected value', function () {
                var jsToolbar = new JSTB.components.JsToolbar(textarea),
                    value = 'something',
                    positions = [
                        {
                            actual: -1,
                            expected: 0
                        },
                        {
                            actual: 0,
                            expected: 0
                        },
                        {
                            actual: 3,
                            expected: 3
                        },
                        {
                            actual: value.length,
                            expected: value.length
                        },
                        {
                            actual: value.length+1,
                            expected: value.length
                        }
                    ],
                    i;

                jsToolbar.textarea.value = value;

                for (i=0; i<positions.length; i+=1) {
                    jsToolbar.setCaretPosition(positions[i].actual);
                    expect(jsToolbar.getCaretPosition()).toEqual(positions[i].expected);
                }
            });

            it('returns the beginning of a selection', function () {
                var jsToolbar = new JSTB.components.JsToolbar(textarea),
                    expected = 2;

                jsToolbar.textarea.value = 'something';
                // NOTE this won't work on IE < 9
                if (typeof jsToolbar.textarea.setSelectionRange !== 'undefined') {
                    jsToolbar.textarea.setSelectionRange(expected, expected+1);
                    expect(jsToolbar.getCaretPosition()).toEqual(expected);
                }
            });
        });

        describe('singleCharacter', function () {
            it('adds a single character at a specific position', function () {
                var jsToolbar = new JSTB.components.JsToolbar(textarea),
                    character = '*',
                    value = 'something',
                    positions = [ 0, 3, value.length ],
                    i;

                // test without any content in the textarea
                jsToolbar.singleCharacter(character);
                expect(jsToolbar.textarea.value).toEqual(character);

                // test with some stupid content
                for (i=0; i<positions.length; i+=1) {
                    jsToolbar.textarea.value = value;
                    jsToolbar.setCaretPosition(positions[i]);
                    jsToolbar.singleCharacter(character);

                    expect(jsToolbar.textarea.value).toEqual(value.substr(0, positions[i]) + character + value.substr(positions[i], value.length) );
                }
            });

            it('places the caret right after the inserted character', function () {
                var jsToolbar = new JSTB.components.JsToolbar(textarea),
                    character = '*',
                    value = 'something',
                    positions = [ 0, 3, value.length ],
                    i;

                // test without any content in the textarea
                jsToolbar.singleCharacter(character);
                expect(jsToolbar.getCaretPosition()).toEqual(character.length);

                // test with some stupid content
                for (i=0; i<positions.length; i+=1) {
                    jsToolbar.textarea.value = value;
                    jsToolbar.setCaretPosition(positions[i]);
                    jsToolbar.singleCharacter(character);

                    expect(jsToolbar.getCaretPosition()).toEqual(positions[i] + character.length);
                }
            });
        });

        describe('singleTag', function () {
            it ('adds a couple of tags', function () {
                var jsToolbar = new JSTB.components.JsToolbar(textarea),
                    tags = [ 'x', '*', [ 'x', 'y' ], ['x', 'x'] ],
                    i, expectedValue;

                for (i=0; i<tags.length; i+=1) {
                    // reset the content of the textarea
                    jsToolbar.textarea.value = '';

                    if (typeof tags[i] === 'object' && tags[i].length === 2) {
                        jsToolbar.singleTag(tags[i][0], tags[i][1]);
                        expectedValue = tags[i][0] + tags[i][1];
                    }
                    else if (typeof tags[i] === 'string') {
                        jsToolbar.singleTag(tags[i]);
                        expectedValue = tags[i] + tags[i];
                    }

                    expect(jsToolbar.textarea.value).toEqual(expectedValue);
                    expect(jsToolbar.getCaretPosition()).toEqual(1);
                }
            });

            it('surrounds a selection with balanced tags', function () {
                var jsToolbar = new JSTB.components.JsToolbar(textarea),
                    tag = '*',
                    value = 'something',
                    range = [ 0, 3 ];

                jsToolbar.textarea.value = value;
                // NOTE this won't work on IE < 9
                if (typeof jsToolbar.textarea.setSelectionRange !== 'undefined') {
                    jsToolbar.textarea.setSelectionRange(range[0], range[1]);

                    jsToolbar.singleTag(tag);
                    expect(jsToolbar.textarea.value).toEqual(value.substr(0, range[0]) + tag + value.substr(range[0], range[1]) + tag + value.substr(range[1], jsToolbar.textarea.value.length));
                }
            });
        });

        describe('encloseSelection', function () {
            it('wraps a selection with supplied tags', function () {
                var jsToolbar = new JSTB.components.JsToolbar(textarea),
                    tag = '*',
                    value = 'something',
                    range = [ 0, value.length ];

                jsToolbar.textarea.value = value;
                // NOTE this won't work on IE < 9
                if (typeof jsToolbar.textarea.setSelectionRange !== 'undefined') {
                    jsToolbar.textarea.setSelectionRange(range[0], range[1]);

                    jsToolbar.encloseSelection(tag, tag);

                    expect(jsToolbar.textarea.value).toEqual(value.substr(0, range[0]) + tag + value.substr(range[0], range[1]) + tag + value.substr(range[1], jsToolbar.textarea.value.length));
                }
            });

            it('executes a callback and wraps its output with supplied tags', function () {
                var jsToolbar = new JSTB.components.JsToolbar(textarea),
                    tag = [ '', '*',
                        {
                            first: '<pre>',
                            last: '</pre>'
                        }
                    ],
                    value = 'something',
                    callback = function () { return value;},
                    i, first, last;

                for (i=0; i<tag.length; i+=1) {
                    // reset the content of the textarea
                    jsToolbar.textarea.value = '';

                    if (typeof tag[i] === 'string') {
                        first = tag[i];
                        last = tag[i];
                    }
                    else {
                        first = tag[i].first;
                        last = tag[i].last;
                    }

                    jsToolbar.encloseSelection(first, last, callback);

                    expect(jsToolbar.textarea.value).toEqual(first + value + last);
                }
            });

            it('places the caret after the first tag if no selection or callback', function () {
                var jsToolbar = new JSTB.components.JsToolbar(textarea),
                    tag = '*';

                jsToolbar.encloseSelection(tag, tag);
                expect(jsToolbar.getCaretPosition()).toEqual(tag.length);
            });

            it('places the caret at the end of the newly placed content using a selected text', function () {
                var jsToolbar = new JSTB.components.JsToolbar(textarea),
                    tag = '*',
                    value = 'something';

                jsToolbar.textarea.value = value;
                // NOTE this works only on IE > 9
                if (typeof jsToolbar.textarea.setSelectionRange !== "undefined") {
                    jsToolbar.textarea.setSelectionRange(0, value.length);
                    jsToolbar.encloseSelection(tag, tag);
                    expect(jsToolbar.getCaretPosition()).toEqual(tag.length * 2 + value.length);
                }
            });

            it('places the caret at the end of the newly placed content returned by the callback', function () {
                var jsToolbar = new JSTB.components.JsToolbar(textarea),
                    tag = '*',
                    value = 'something';

                jsToolbar.encloseSelection(tag, tag, function () { return value; });

                expect(jsToolbar.getCaretPosition()).toEqual(tag.length * 2 + value.length);
            });
        });
    });

    describe('Elements', function () {
        it('allows to call drawButton to create new elements', function () {
            var i, buttonElement, tool, jsToolbar,
                elements = JSTB.lang.markdown.elements,
                buttonElements = [ elements.spacer, elements.styles, elements.ol ];

            jsToolbar = new JSTB.components.JsToolbar(textarea);
            jsToolbar.draw();

            for (i=0; i < buttonElements.length; i+=1) {
                buttonElement = buttonElements[i];
                tool = jsToolbar.drawButton(buttonElement);

                expect(tool instanceof JSTB.components[buttonElement.type]).toBeTruthy();
                expect(tool.title).toEqual(buttonElement.title);
            }
        });

        describe('Spacer', function () {
            it('Creates a custom element', function () {
                var baseClass = 'base-',
                    buttonClass = 'button--',
                    spacer = JSTB.lang.markdown.elements.spacer,
                    jsToolbar = new JSTB.components.JsToolbar(textarea),
                    button, element;

                jsToolbar.setBaseClass(baseClass);
                jsToolbar.setButtonBaseClass(buttonClass);
                button = jsToolbar.drawButton(spacer);
                element = button.draw();

                expect(button.disabled).toBeFalsy();
                expect(element instanceof HTMLElement).toBeTruthy();
                expect(element.className).toEqual(baseClass + buttonClass + spacer.type.toLowerCase());
            });
        });

        describe('Button', function () {
            it('Creates a custom element', function () {
                var baseClass = 'base-',
                    buttonClass = 'button--',
                    strong = JSTB.lang.markdown.elements.strong,
                    jsToolbar = new JSTB.components.JsToolbar(textarea),
                    button, element;

                jsToolbar.setBaseClass(baseClass);
                jsToolbar.setButtonBaseClass(buttonClass);
                button = jsToolbar.drawButton(strong);
                element = button.draw();

                expect(button.disabled).toBeFalsy();
                expect(typeof button.fn === 'function').toBeTruthy();
                expect(element instanceof HTMLElement).toBeTruthy();
                expect(element.className).toEqual(baseClass + buttonClass + strong.type.toLowerCase());
            });
        });

        describe('Combo', function () {
            it('Creates a custom element', function () {
                var baseClass = 'base-',
                    buttonClass = 'button--',
                    styles = JSTB.lang.markdown.elements.styles,
                    jsToolbar = new JSTB.components.JsToolbar(textarea),
                    button, element;

                jsToolbar.setBaseClass(baseClass);
                jsToolbar.setButtonBaseClass(buttonClass);
                button = jsToolbar.drawButton(styles);
                element = button.draw();

                expect(button.disabled).toBeFalsy();
                expect(typeof button.fn === 'function').toBeTruthy();
                expect(element instanceof HTMLElement).toBeTruthy();
                expect(element.className).toEqual(baseClass + buttonClass + styles.type.toLowerCase());
            });
        });
    });

});
