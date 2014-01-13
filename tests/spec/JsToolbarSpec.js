/*jshint bitwise:true, curly:true, eqeqeq:true, forin:true, noarg:true, noempty:true, nonew:true, undef:true, unused:true, strict:true, browser:true */
/*global JSTB, describe, it, expect, beforeEach */
describe('JsToolbar', function () {
    'use strict';

    describe('Components', function () {
        var textarea = document.createElement('textarea');

        textarea.id = 'jsToolbar';

        beforeEach(function() {
            var testContainer = document.getElementById('testContainer');

            testContainer.innerHTML = '';
            testContainer.appendChild(textarea);
        });


        it('Creates a jstoolbar with a basic configuration', function () {
            var expectedLang = 'en',
                expectedSyntax = 'markdown',
                jstbTextarea = document.getElementById('jsToolbar'),
                jsToolbar = new JSTB.components.JsToolbar(jstbTextarea, null, expectedSyntax, expectedLang);

            expect(jsToolbar.getMode()).toEqual('wiki');
            expect(jsToolbar.language).toEqual('en');
            expect(jsToolbar.syntax).toEqual('markdown');
        });

        it('Invoking drawButton returns the created elements as intended', function () {
            var i, buttonElement, tool, jsToolbar,
                elements = JSTB.lang.markdown.elements,
                expectedLang = 'en',
                expectedSyntax = 'markdown',
                jstbTextarea = document.getElementById('jsToolbar'),
                buttonElements = [ elements.spacer, elements.styles, elements.ol ];

            jsToolbar = new JSTB.components.JsToolbar(jstbTextarea, null, expectedSyntax, expectedLang);

            for (i=0; i < buttonElements.length; i+=1) {
                buttonElement = buttonElements[i];
                tool = jsToolbar.drawButton(buttonElement);

                expect(tool instanceof JSTB.components[buttonElement.type]).toBeTruthy();
                expect(tool.title).toEqual(buttonElement.title);
            }
        });

    });

});