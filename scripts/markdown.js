/* ***** BEGIN LICENSE BLOCK *****
 * This file is part of DotClear.
 * Copyright (c) 2005 Nicolas Martin & Olivier Meunier and contributors. All
 * rights reserved.
 *
 * DotClear is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or
 * (at your option) any later version.
 *
 * DotClear is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with DotClear; if not, write to the Free Software
 * Foundation, Inc., 59 Temple Place, Suite 330, Boston, MA  02111-1307  USA
 *
 * ***** END LICENSE BLOCK *****
*/

/* Modified for markdown formatting */
/* 2013-10-10 Matteo 'Peach' Pescarin - refactored code as modular */

var JSTOOLBAR = JSTOOLBAR || {};

JSTOOLBAR.markdown = (function () {
    'use strict';
    var elements = {},
        // style selection
        styleList = {
            'small': "Small",
            'big': "Big"
        };

    // space
    elements.space = {
        type: 'space'
    };
    // br
    elements.br = {
        type: 'button',
        title: 'New line break',
        fn: {
            wiki: function () {
                this.singleCharacter('  \n');
            }
        }
    };
    // strong
    elements.strong = {
        type: 'button',
        title: 'Strong',
        fn: {
            wiki: function() { this.singleTag('**'); }
        }
    };
    // em
    elements.em = {
        type: 'button',
        title: 'Italic',
        fn: {
            wiki: function() { this.singleTag("_"); }
        }
    };

    // h1
    elements.h1 = {
        type: 'button',
        title: 'Heading 1',
        fn: {
            wiki: function() {
                this.encloseLineSelection('', '\n=============', function(str) {
                    str = str.replace(/=============/, '');
                    return str;
                });
            }
        }
    };
    // h2
    elements.h2 = {
        type: 'button',
        title: 'Heading 2',
        fn: {
            wiki: function() {
                this.encloseLineSelection('', '\n-------------',function(str) {
                    str = str.replace(/-------------/, '');
                    return str;
                });
            }
        }
    };
    // h3
    elements.h3 = {
        type: 'button',
        title: 'Heading 3',
        fn: {
            wiki: function() {
                this.encloseLineSelection('### ', '',function(str) {
                    str = str.replace(/^###/, '');
                    return str;
                });
            }
        }
    };

    // ul
    elements.ul = {
        type: 'button',
        title: 'Unordered list',
        fn: {
            wiki: function() {
                this.encloseLineSelection('','',function(str) {
                    str = str.replace(/\r/g,'');
                    return str.replace(/(\n|^)[#-]?\s*/g,"$1* ");
                });
            }
        }
    };
    // ol
    elements.ol = {
        type: 'button',
        title: 'Ordered list',
        fn: {
            wiki: function() {
                this.encloseLineSelection('','',function(str) {
                    str = str.replace(/\r/g,'');
                    return str.replace(/(\n|^)[*-]?\s*/g,"$10. ");
                });
            }
        }
    };
    // bq
    elements.bq = {
        type: 'button',
        title: 'Quote',
        fn: {
            wiki: function() {
                this.encloseLineSelection('','',function(str) {
                    str = str.replace(/\r/g,'');
                    return str.replace(/(\n|^) *([^\n]*)/g,"$1> $2");
                });
            }
        }
    };
    // unbq
    elements.unbq = {
        type: 'button',
        title: 'Unquote',
        fn: {
            wiki: function() {
                this.encloseLineSelection('','',function(str) {
                    str = str.replace(/\r/g,'');
                    return str.replace(/(\n|^) *[>]? *([^\n]*)/g,"$1$2");
                });
            }
        }
    };
    // pre
    elements.pre = {
        type: 'button',
        title: 'Preformatted text',
        fn: {
            wiki: function() { this.encloseLineSelection('<pre>\n', '\n</pre>'); }
        }
    };
    // link
    elements.link = {
        type: 'button',
        title: 'Link',
        fn: {
            wiki: function() {

                this.encloseSelection('', '', function(url) {
                    if (!url.length) {
                        url = window.prompt('Url', 'http://');
                    }

                    var text = window.prompt('Link text');
                    var title = window.prompt('Title');

                    return '['+text+']('+url+' "'+title+'")';
                });
            }
        }
    };
    // email
    elements.email = {
        type: 'button',
        title: 'Email',
        fn: {
            wiki: function() {

                this.encloseSelection('', '', function(email) {
                    if (!email.length) {
                        email = window.prompt('E-mail');
                    }

                    return '<'+email+'>';
                });
            }
        }
    };
    // styles
    elements.styles = {
        type: 'combo',
        title: 'Text style',
        options: { 0: "Style:" },
        wiki: {
            list: [0],
            fn: function (value) {
                this.encloseLineSelection('', '', function (str) {
                    // remove old tag:
                    str = str.replace(/\[style:[^\]]*\](.*)\[\/style\]/, "$1");

                    if (value && value !== 0) {
                        str = '[style:' + value + ']' + str + '[/style]';
                    }

                    return str;
                });
            }
        },
        init: function (options) {
            var style;

            for (style in options) {
                if (options.hasOwnProperty(style)) {
                    this.wiki.list.push(style);
                    this.options[style] = options[style];
                }
            }
        }
    };
    // img TODO implement img button
//    elements.img = {
//        type: 'button',
//        title: 'Image',
//        fn: {
//            wiki: function () {
//                this.encloseSelection("!", "!")
//            }
//        }
//    }
    // help TODO implement help button
//    elements.help = {
//        type: 'button',
//        title: 'Help',
//        fn: {
//            wiki: function () {
//                window.open(this.help_link, '', 'resizable=yes, location=no, width=300, height=640, menubar=no, status=no, scrollbars=yes')
//            }
//        }
//    }

    (function init() {

        // initialise the styles for the dropdown list
        elements.styles.init(styleList);
    })();

    return {
        'elements': elements
    };
})();
