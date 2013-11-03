/*jshint bitwise:true, curly:true, eqeqeq:true, forin:true, noarg:true, noempty:true, nonew:true, undef:true, unused:true, strict:true, browser:true */
/*global JSTB, describe, it, expect */
describe('JsToolbar', function () {
    'use strict';

    describe('Components', function () {
        it('create a jstoolbar with a basic configuration', function () {
            var expectedLang = 'en',
                expectedSyntax = 'markdown',
                jsToolbar = new JSTB.components.JsToolbar({}, null, expectedSyntax, expectedLang);

            expect(jsToolbar.getmode()).toEqual('wiki');
            expect(jsToolbar.language).toEqual('en');
            expect(jsToolbar.syntax).toEqual('markdown');
        });
    });
});