/*jshint bitwise:true, curly:true, eqeqeq:true, forin:true, noarg:true, noempty:true, nonew:true, undef:true, unused:true, strict:true, browser:true */
/*global JSTB */

/**
 * @projectDescription  This library contains the definitions for textile formatting.
 *
 * First version taken from DotClear, published under the GPLv2.
 * Copyright (c) 2005 Nicolas Martin & Olivier Meunier and contributors. All
 * rights reserved.
 * Modified by JP LANG for textile formatting.
 * Entirely rewritten and refactored by Matteo 'Peach' Pescarin.
 *
 * @version 0.1
 */

JSTB.namespace('lang.textile');

JSTB.lang.textile = (function () {
    'use strict';
    var elements = {};
    // space
    elements.spacer = {
        type: 'Spacer'
    };

    elements.strong = {
        type: 'Button',
        title: 'Strong',
        fn: {
            wiki: function () {
                this.singleTag('*');
            }
        }
    };

    elements.em = {
        type: 'Button',
        title: 'Italic',
        fn: {
            wiki: function () {
                this.singleTag("_");
            }
        }
    };

    elements.ins = {
        type: 'Button',
        title: 'Underline',
        fn: {
            wiki: function () {
                this.singleTag('+');
            }
        }
    };

    elements.del = {
        type: 'Button',
        title: 'Deleted',
        fn: {
            wiki: function () {
                this.singleTag('-');
            }
        }
    };

    elements.code = {
        type: 'Button',
        title: 'Code',
        fn: {
            wiki: function () { 
                this.singleTag('@');
            }
        }
    };

    elements.h1 = {
        type: 'Button',
        title: 'Heading 1',
        fn: {
            wiki: function () {
                this.encloseLineSelection('h1. ', '', function (str) {
                    str = str.replace(/^h\d+\.\s+/, '');
                    return str;
                });
            }
        }
    };

    elements.h2 = {
        type: 'Button',
        title: 'Heading 2',
        fn: {
            wiki: function () {
                this.encloseLineSelection('h2. ', '', function (str) {
                    str = str.replace(/^h\d+\.\s+/, '');
                    return str;
                });
            }
        }
    };

    elements.h3 = {
        type: 'Button',
        title: 'Heading 3',
        fn: {
            wiki: function () {
                this.encloseLineSelection('h3. ', '', function (str) {
                    str = str.replace(/^h\d+\.\s+/, '');
                    return str;
                });
            }
        }
    };

    elements.ul = {
        type: 'Button',
        title: 'Unordered list',
        fn: {
            wiki: function () {
                this.encloseLineSelection('', '', function (str) {
                    str = str.replace(/\r/g,'');
                    return str.replace(/(\n|^)[#-]?\s*/g,"$1* ");
                });
            }
        }
    };

    elements.ol = {
        type: 'Button',
        title: 'Ordered list',
        fn: {
            wiki: function () {
                this.encloseLineSelection('', '', function (str) {
                    str = str.replace(/\r/g,'');
                    return str.replace(/(\n|^)[*-]?\s*/g,"$1# ");
                });
            }
        }
    };

    elements.bq = {
        type: 'Button',
        title: 'Block quote',
        fn: {
            wiki: function () {
                this.encloseLineSelection('', '', function (str) {
                    str = str.replace(/\r/g,'');
                    return str.replace(/(\n|^) *([^\n]*)/g,"$1> $2");
                });
            }
        }
    };

    elements.unbq = {
        type: 'Button',
        title: 'Unquote',
        fn: {
            wiki: function () {
                this.encloseLineSelection('', '', function (str) {
                    str = str.replace(/\r/g,'');
                    return str.replace(/(\n|^) *[>]? *([^\n]*)/g,"$1$2");
                });
            }
        }
    };

    elements.pre = {
        type: 'Button',
        title: 'Preformatted text',
        fn: {
            wiki: function () {
                this.encloseLineSelection('<pre>\n', '\n</pre>');
            }
        }
    };

    // FIXME wrong syntax for the link, should be "Text":http://link
    elements.link = {
        type: 'Button',
        title: 'Wiki link',
        fn: {
            wiki: function () {
                this.encloseSelection("[[", "]]");
            }
        }
    };

    // TODO add title/alt description with the following syntax !URL/IMAGE(Alt)!
    elements.img = {
        type: 'Button',
        title: 'Image',
        fn: {
            wiki: function () {
                this.encloseSelection("!", "!");
            }
        }
    };

    elements.help = {
        type: 'Button',
        title: 'Help',
        fn: {
            wiki: function () {
                window.open(this.help_link, '', 'resizable=yes, location=no, width=300, height=640, menubar=no, status=no, scrollbars=yes');
            }
        }
    };

    return {
        elements: elements
    };
})();