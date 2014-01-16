/*jshint bitwise:true, curly:true, eqeqeq:true, forin:true, noarg:true, noempty:true, nonew:true, undef:true, unused:true, strict:true, browser:true */
/*global JSTB, describe, it, expect, beforeEach */
describe('JSTB Components', function () {
    'use strict';
    // internal vars used throughout the tests
    var textarea;

    describe('JSToolbar', function () {
        beforeEach(function() {
            var testContainer = document.getElementById('testContainer');

            textarea = document.createElement('textarea');
            textarea.id = 'jsToolbar';
            testContainer.innerHTML = '';
            testContainer.appendChild(textarea);
        });


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
                expectedLang = 'en',
                expectedSyntax = 'markdown',
                expectedModes = [ 'wiki' ],
                jsToolbar = new JSTB.components.JsToolbar(textarea, null, expectedSyntax, expectedLang);

            for (i=0; i<expectedModes.length; i++) {
                jsToolbar.draw(expectedModes[i]);

                expect(jsToolbar.getMode()).toEqual(expectedModes[i]);
            }
        });

        it('is instantiated with a custom configuration', function () {
            var i,
                expectedLang = 'en',
                expectedSyntax = 'markdown',
                buttons = [ 'strong', 'styles', 'spacer' ],
                buttonTypes = [ 'button', 'combo', 'spacer' ], // TODO this could be extracted from the actual elements types
                jsToolbar = new JSTB.components.JsToolbar(textarea, buttons, expectedSyntax, expectedLang);

            jsToolbar.draw();
            expect(jsToolbar.toolbar.childNodes.length).toEqual(3);

            for (i=0; i < jsToolbar.toolbar.childNodes.length; i+=1) {
                expect(jsToolbar.toolbar.childNodes[i].className).toEqual(jsToolbar.getButtonBaseClass() + buttonTypes[i]);
            }
        });

        it('fails silently if the buttons do not exist', function () {
            var expectedLang = 'en',
                expectedSyntax = 'markdown',
                buttons = [ 'a', 'b', 'c' ],
                jsToolbar = new JSTB.components.JsToolbar(textarea, buttons, expectedSyntax, expectedLang);

            jsToolbar.draw();
            expect(jsToolbar.toolbar.hasChildNodes()).toBeFalsy();
        });

        it('allows to customise the class of any button', function () {
            var i, buttonElement, tool, jsToolbar,
                elements = JSTB.lang.markdown.elements,
                expectedLang = 'en',
                expectedSyntax = 'markdown',
                baseClass = 'base-',
                buttonBaseClass = 'button--',
                elementsConfig = [ 'spacer', 'ol', 'strong' ],
                buttonTypes = [ 'spacer', 'button', 'button' ];

            jsToolbar = new JSTB.components.JsToolbar(textarea, elementsConfig, expectedSyntax, expectedLang);
            jsToolbar.setBaseClass(baseClass);
            jsToolbar.setButtonBaseClass(buttonBaseClass);
            jsToolbar.draw();

            for (i=0; i < jsToolbar.toolbar.childNodes.length; i+=1) {
                expect(jsToolbar.toolbar.childNodes[i].className).toEqual(baseClass + buttonBaseClass + buttonTypes[i]);
            }
        });
    });

    describe('Elements', function () {
        beforeEach(function() {
            var testContainer = document.getElementById('testContainer');

            textarea = document.createElement('textarea');
            textarea.id = 'jsToolbar';
            testContainer.innerHTML = '';
            testContainer.appendChild(textarea);
        });

        describe('Spacer', function () {
            it('Creates a custom element', function () {
                var expectedLang = 'en',
                    expectedSyntax = 'markdown',
                    baseClass = 'base-',
                    buttonClass = 'button--',
                    spacer = JSTB.lang.markdown.elements.spacer,
                    jsToolbar = new JSTB.components.JsToolbar(textarea, null, expectedSyntax, expectedLang),
                    button, element;

                jsToolbar.setBaseClass(baseClass);
                jsToolbar.setButtonBaseClass(buttonClass);
                button = jsToolbar.drawButton(spacer);
                element = button.draw();

                expect(element instanceof HTMLElement).toBeTruthy();
                expect(element.className).toEqual(baseClass + buttonClass + spacer.type.toLowerCase());
            });
        });

        describe('Button', function () {
            it('Creates a custom element', function () {
                var expectedLang = 'en',
                    expectedSyntax = 'markdown',
                    baseClass = 'base-',
                    buttonClass = 'button--',
                    strong = JSTB.lang.markdown.elements.strong,
                    jsToolbar = new JSTB.components.JsToolbar(textarea, null, expectedSyntax, expectedLang),
                    button, element;

                jsToolbar.setBaseClass(baseClass);
                jsToolbar.setButtonBaseClass(buttonClass);
                button = jsToolbar.drawButton(strong);
                element = button.draw();

                expect(element instanceof HTMLElement).toBeTruthy();
                expect(element.className).toEqual(baseClass + buttonClass + strong.type.toLowerCase());
            });
        });

        describe('Combo', function () {
            it('Creates a custom element', function () {
                var expectedLang = 'en',
                    expectedSyntax = 'markdown',
                    baseClass = 'base-',
                    buttonClass = 'button--',
                    style = JSTB.lang.markdown.elements.style,
                    jsToolbar = new JSTB.components.JsToolbar(textarea, null, expectedSyntax, expectedLang),
                    button, element;

                jsToolbar.setBaseClass(baseClass);
                jsToolbar.setButtonBaseClass(buttonClass);
                button = jsToolbar.drawButton(style);
                element = button.draw();

                expect(element instanceof HTMLElement).toBeTruthy();
                expect(element.className).toEqual(baseClass + buttonClass + style.type.toLowerCase());
            });
        });

        it('allows to call drawButton to create new elements', function () {
            var i, buttonElement, tool, jsToolbar,
                elements = JSTB.lang.markdown.elements,
                expectedLang = 'en',
                expectedSyntax = 'markdown',
                buttonElements = [ elements.spacer, elements.styles, elements.ol ];

            jsToolbar = new JSTB.components.JsToolbar(textarea, null, expectedSyntax, expectedLang);
            jsToolbar.draw();

            for (i=0; i < buttonElements.length; i+=1) {
                buttonElement = buttonElements[i];
                tool = jsToolbar.drawButton(buttonElement);

                expect(tool instanceof JSTB.components[buttonElement.type]).toBeTruthy();
                expect(tool.title).toEqual(buttonElement.title);
            }
        });
    });

});
