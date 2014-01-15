/*jshint bitwise:true, curly:true, eqeqeq:true, forin:true, noarg:true, noempty:true, nonew:true, undef:true, unused:true, strict:true, browser:true */
/*global JSTB, describe, it, expect, beforeEach */
describe('JSTB Components', function () {
    'use strict';
    // internal vars used throughout the tests
    var textarea = document.createElement('textarea');

    textarea.id = 'jsToolbar';

    describe('JSToolbar', function () {
        beforeEach(function() {
            var testContainer = document.getElementById('testContainer');

            testContainer.innerHTML = '';
            testContainer.appendChild(textarea);
        });


        it('is instantiated with a basic configuration', function () {
            var expectedLang = 'en',
                expectedSyntax = 'markdown',
                jstbTextarea = document.getElementById('jsToolbar'),
                toolbarElements = [ 'string', 'styles', 'spacer' ],
                jsToolbar = new JSTB.components.JsToolbar(jstbTextarea, toolbarElements, expectedSyntax, expectedLang);

            expect(jsToolbar instanceof JSTB.components.JsToolbar).toBeTruthy();
            expect(jsToolbar.language).toEqual(expectedLang);
            expect(jsToolbar.syntax).toEqual(expectedSyntax);
            expect(jsToolbar.toolbarElements).toEqual(toolbarElements);

            // loose check the DOM structure has been instantiated
            expect(jstbTextarea.parentNode.className).toEqual('jstEditor');
        });

        it('initialises the elements based on the mode', function () {
            var i,
                expectedLang = 'en',
                expectedSyntax = 'markdown',
                jstbTextarea = document.getElementById('jsToolbar'),
                expectedModes = [ 'wiki' ],
                jsToolbar = new JSTB.components.JsToolbar(jstbTextarea, null, expectedSyntax, expectedLang);

            for (i=0; i<expectedModes.length; i++) {
                jsToolbar.draw(expectedModes[i]);

                expect(jsToolbar.getMode()).toEqual(expectedModes[i]);
            }
        });

        it('is instantiated with a custom configuration', function () {
            var i,
                expectedLang = 'en',
                expectedSyntax = 'markdown',
                jstbTextarea = document.getElementById('jsToolbar'),
                buttons = [ 'strong', 'styles', 'spacer' ],
                buttonTypes = [ 'button', 'select', 'spacer' ],
                jsToolbar = new JSTB.components.JsToolbar(jstbTextarea, buttons, expectedSyntax, expectedLang);

            jsToolbar.draw();
            expect(jsToolbar.toolbar.childNodes.length).toEqual(3);

            for (i=0; i < jsToolbar.toolbar.childNodes.length; i+=1) {
                expect(jsToolbar.toolbar.childNodes[i].className).toEqual(jsToolbar.getBaseClass() + '-button--' + buttonTypes[i]);
            }
        });

        it('fails silently if the buttons do not exist', function () {
            var expectedLang = 'en',
                expectedSyntax = 'markdown',
                jstbTextarea = document.getElementById('jsToolbar'),
                buttons = [ 'a', 'b', 'c' ],
                jsToolbar = new JSTB.components.JsToolbar(jstbTextarea, buttons, expectedSyntax, expectedLang);

            jsToolbar.draw();
            expect(jsToolbar.toolbar.hasChildNodes()).toBeFalsy();
        });
    });

    describe('Elements', function () {

        describe('Spacer', function () {
            it('', function () {
                var expectedLang = 'en',
                    expectedSyntax = 'markdown',
                    jstbTextarea = document.getElementById('jsToolbar'),
                    buttons = [ 'a', 'b', 'c' ],
                    jsToolbar = new JSTB.components.JsToolbar(jstbTextarea, buttons, expectedSyntax, expectedLang);

                jsToolbar.setBaseClass('something');
            });
        });

        it('allows to call drawButton to create new elements', function () {
            var i, buttonElement, tool, jsToolbar,
                elements = JSTB.lang.markdown.elements,
                expectedLang = 'en',
                expectedSyntax = 'markdown',
                jstbTextarea = document.getElementById('jsToolbar'),
                buttonElements = [ elements.spacer, elements.styles, elements.ol ];

            jsToolbar = new JSTB.components.JsToolbar(jstbTextarea, null, expectedSyntax, expectedLang);
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
