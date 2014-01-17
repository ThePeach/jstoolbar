/*jshint bitwise:true, curly:true, eqeqeq:true, forin:true, noarg:true, noempty:true, nonew:true, undef:true, unused:true, strict:true, browser:true, laxbreak:true */
/*global JSTB */
/**
 * @projectDescription  This library contains the definition of the JSToolbar.
 *
 * First version taken from DotClear, published under the GPLv2.
 * Copyright (c) 2005 Nicolas Martin & Olivier Meunier and contributors. All
 * rights reserved.
 * Modified by JP LANG for textile formatting.
 * Entirely rewritten and refactored by Matteo 'Peach' Pescarin.
 *
 * @version 0.1
 */

JSTB.namespace('components');

JSTB.components = (function () {
    'use strict';

        /**
         * Default name for the wrapping block.
         * @property {String}
         * */
    var defaultClass = 'jstoolbar',
        baseClass = 'jstb-',
        buttonBaseClass = baseClass + 'button--',
        /**
         * Mode, defaults to wiki
         * @property {String}
         */
        defaultMode = 'wiki',
        /**
         * Default toolbar buttons order.
         * @property {Array}
         */
        defaultToolbarElements = [ 'strong', 'em', 'spacer', 'br', 'h1', 'h2', 'h3', 'spacer', 'ul', 'ol', 'bq', 'unbq', 'pre', 'spacer', 'link', 'email', 'styles' ],
        /**
         * The default language used for the toolbar.
         * @property {String}
         */
        defaultSyntax = 'markdown',
        defaultLanguage = 'en';

    /**
     * Constructor for the JsToolbar
     * TODO fix in case the textarea is an array of HTMLInputElements
     * e.g. taken from getElementsByClass()
     *
     * @param {HTMLElement} textarea          the textarea the jsToolbar should be applied to
     * @param {Array}       [toolbarElements] the elements used in the toolbar
     * @param {String}      [syntax]          the syntax to use, defaults to 'markdown'
     * @param {String}      [language]        the language to use, defaults to 'en'
     * @constructor
     */
    var JsToolbar = function (textarea, toolbarElements, syntax, language) {
        // sanity checks, see if we are in the right place at the right time.
        if (!textarea || typeof document.createElement === "undefined" || (typeof document.getSelection === "undefined" && typeof textarea.setSelectionRange === "undefined") ) {
            throw new Error('Unable to initialise the toolbar');
        }

        // the toolbar mode e.g. "wiki", is set when calling draw()
        this.mode = null;
        // the textarea the jstoolbar should be attached to
        this.textarea = textarea || null;
        // toolbarElements to create
        this.toolbarElements = toolbarElements || defaultToolbarElements;
        // language to be used
        this.language = language || defaultLanguage;
        this.context = null;
        // help link
        this.helpLink = '';
        // syntax to be used, defaults to markdown
        this.syntax = syntax || defaultSyntax;

        // element definitions for the chosen language
        if (typeof JSTB.lang[syntax].elements !== "undefined") {
            this.lang = {
                elements: JSTB.lang[syntax].elements
            };
        }

        this.editor = document.createElement('div');
        this.editor.className = baseClass+'editor';

        this.textarea.parentNode.insertBefore(this.editor, this.textarea);
        this.editor.appendChild(this.textarea);

        /** @var {DomElement} toolbar the toolbar containing all buttons */
        this.toolbar = document.createElement("div");
        this.toolbar.className = defaultClass;
        this.editor.parentNode.insertBefore(this.toolbar, this.editor);

        // Draggable resizing
        // TODO rewrite this crap
        if (this.editor.addEventListener && navigator.appVersion.match(/\bMSIE\b/)) {
            this.handle = document.createElement('div');
            this.handle.className = 'jstHandle';
            var dragStart = this.resizeDragStart;
            var This = this;
            this.handle.addEventListener('mousedown', function (event) {
                dragStart.call(This, event);
            }, false);
            // fix memory leak in Firefox (bug #241518)
            window.addEventListener('unload', function () {
                var del = This.handle.parentNode.removeChild(This.handle);
                delete(This.handle);
            }, false);

            this.editor.parentNode.insertBefore(this.handle, this.editor.nextSibling);
        }
    };

    /**
     * Spacer object, just adds some spacing between objects
     *
     * @param {Object} element
     * @constructor
     */
    var Spacer = function (element) {
        this.width = element.width || null;
        this.className = element.className || buttonBaseClass + element.type.toLowerCase();
    };

    /**
     * Draws the actual spacer element.
     *
     * @returns {HTMLElement}
     */
    Spacer.prototype.draw = function () {
        var span = document.createElement('span');
        // add an "space" character;
        // FIXME this is silly, should be in the CSS using content: " ";
        span.appendChild(document.createTextNode(String.fromCharCode(160)));
        span.className = this.className;

        if (this.width) {
            span.style.marginRight = this.width+'px';
        }

        return span;
    };

    /**
     * Button object, generic constructor for the class
     *
     * @param {Object} element
     * @param {String} mode
     * @param {Object} scope the initial scope in order to access the drawing functions
     * @constructor
     */
    var Button = function (element, mode, scope) {
        this.disabled = false;

        // translate the title
        // TODO enable translation of titles
//        this.title = JSTB.strings[element.title] || element.title || null;
        this.title = element.title || null;
        this.className = element.className || buttonBaseClass + element.type.toLowerCase();

        this.fn = element.fn[mode] || function () {};
        this.scope = scope || null;

        // no action defined for the button
        if (typeof element.fn[mode] !== "function") {
            this.disabled = true;
        }

        if (typeof element.icon !== 'undefined') {
            this.icon = element.icon;
        }
    };

    /**
     * Draws the actual button element.
     *
     * @returns {HTMLElement}
     */
    Button.prototype.draw = function () {
        var button = document.createElement('button'),
            span = document.createElement('span'),
            context = this;

        if (!this.scope) { // it's useless otherwise
            return null;
        }

        span.appendChild(document.createTextNode(this.title));

        button.setAttribute('type','button');
        button.tabIndex = 200;
        if (this.className) {
            button.className = this.className;
        }
        button.title = this.title;
        button.appendChild(span);

        if (typeof this.icon !== "undefined") {
            button.style.backgroundImage = 'url('+this.icon+')';
        }

        button.addEventListener('click', function() {
            try {
                context.fn.apply(context.scope, arguments);
            }
            catch (e) { // FIXME not really a good way to use this construct
            }
            return false;
        }, false);

        return button;
    };

    /**
     * Combo box (dropdown/select).
     *
     * @param {Object} element
     * @param {String} mode
     * @param {Object} scope the initial scope in order to access the drawing functions
     * @constructor
     */
    var Combo = function (element, mode, scope) {
        var list = element.fn.list,
            i;

        this.disabled = false;

        this.title = element.title || null;
        this.className = element.className || buttonBaseClass + element.type.toLowerCase();

        this.fn = element.fn[mode] || function () {};
        this.scope = scope || null;
        this.options = {};

        if (typeof element.fn[mode] !== 'function' || list.length === 0) {
            this.disabled = true;
        }
        else {
            for (i=0; i < list.length; i++) {
                this.options[list[i]] = element.options[list[i]];
            }
        }

    };

    /**
     * Draws the actual box for the toolbar
     *
     * @returns {HTMLElement}
     */
    Combo.prototype.draw = function() {
        var select = document.createElement('select'),
            context = this;

        if (!this.scope && !this.options) {
            return null;
        }

        if (this.className) {
            select.className = this.className;
        }

        select.title = this.title;

        for (var o in this.options) {
            if (this.options.hasOwnProperty(o)) {
                //var opt = this.options[o];
                var option = document.createElement('option');
                option.value = o;
                option.appendChild(document.createTextNode(this.options[o]));
                select.appendChild(option);
            }
        }

        select.addEventListener('change', function () {
            try {
                context.fn.call(context.scope, this.value);
            }
            catch (e) {
                window.alert(e); // FIXME still possibly not a great use of the catch
            }

            return false;
        }, false);

        return select;
    };

    JsToolbar.prototype = (function () {
        /*jshint validthis:true */

        /**
         * getter for the mode
         *
         * @returns {String}
         */
        function getMode() {
            return this.mode;
        }

        /**
         * setter for the mode
         *
         * @param {String} mode
         */
        function setMode(mode) {
            this.mode = mode || defaultMode;
        }

        /**
         * sets the mode and redraws the toolbar
         *
         * @param {String} mode e.g. 'wiki'
         */
        function switchMode(mode) {
            this.setMode(mode);
            this.draw(mode);
        }

        /**
         * setter for the help link
         *
         * @param {String} link
         */
        function setHelpLink(link) {
            this.helpLink = link;
        }

        /**
         * Returns the base class
         *
         * @returns {string}
         */
        function getBaseClass() {
            return baseClass;
        }

        /**
         * Sets the base classname for the buttons
         *
         * @param {String} className
         */
        function setBaseClass(className) {
            baseClass = className;
        }

        /**
         * Returns the base class
         *
         * @returns {string}
         */
        function getButtonBaseClass() {
            return buttonBaseClass;
        }

        /**
         * Sets the base classname for the buttons
         *
         * @param {String} className
         */
        function setButtonBaseClass(className) {
            buttonBaseClass = baseClass + className;
        }

        /**
         * The draw function acts as an initialisation function that acts on the DOM
         *
         * @param {String} [mode] the mode, defaults to wiki, optional.
         */
        function draw(mode) {
            var i, b, tool, newTool, disabled;

            // reset the mode
            this.setMode(mode);

            // Empty toolbar
            while (this.toolbar.hasChildNodes()) {
                this.toolbar.removeChild(this.toolbar.firstChild);
            }

            // Draw toolbar elements
            for (i=0; i < this.toolbarElements.length; i++) {
                // picks the definition of the element for the current language
                b = this.lang.elements[this.toolbarElements[i]];

                if (!b) {
                    continue;
                }

                disabled =
                    typeof b.type === 'undefined'
                    || b.type === ''
                    || (typeof b.disabled !== 'undefined' && b.disabled)
                    || (typeof b.context !== 'undefined' && b.context !== null && b.context !== this.context);

                if (!disabled && typeof this[b.type] === 'function') {
                    // get the right constructor for the toolbar element
                    tool = this.drawButton(b);

                    if (tool) {
                        newTool = tool.draw();
                    }

                    if (newTool) {
                        this.toolbar.appendChild(newTool);
                    }
                }
            }
        }

        /**
         * Factory for buttons to be drawn in the toolbar
         *
         * @param {Object} element the element definition
         *
         * @return {HtmlElement}
         */
        function drawButton(element) {
            var constr = element.type || 'Spacer',
                context = this;

            if (typeof this[constr] !== "function") {
                throw new Error('Unable to initialise ' + constr + '. No constructor found.');
            }

            return new this[constr](element, this.getMode() || defaultMode, context);
        }

        // drawing functions for the button
        /**
         * Adds a tag in the specific position, or wraps the selection.
         *
         * @param {String} startTag
         * @param {String} endTag
         */
        function singleTag(startTag, endTag) {
            startTag = startTag || null;
            endTag = endTag || startTag;

            if (!startTag || !endTag) {
                return;
            }

            this.encloseSelection(startTag, endTag);
        }

        /**
         * Encloses a line within a prefix and suffix.
         *
         * @param {String}   prefix the prefix
         * @param {String}   suffix the suffix
         * @param {Function} [fn]   an optional callback function
         */
        function encloseLineSelection(prefix, suffix, fn) {
            var start, end, sel, scrollPos, subst, res;

            prefix = prefix || '';
            suffix = suffix || '';

            this.textarea.focus();

            if (typeof document.selection !== "undefined") {
                sel = document.selection.createRange().text;
            }
            else if (typeof this.textarea.setSelectionRange !== "undefined") {
                start = this.textarea.selectionStart;
                end = this.textarea.selectionEnd;
                scrollPos = this.textarea.scrollTop;
                // go to the start of the line
                start = this.textarea.value.substring(0, start).replace(/[^\r\n]*$/g,'').length;
                // go to the end of the line
                end = this.textarea.value.length - this.textarea.value.substring(end, this.textarea.value.length).replace(/^[^\r\n]*/, '').length;
                sel = this.textarea.value.substring(start, end);
            }

            if (sel.match(/ $/)) { // exclude ending space char, if any
                sel = sel.substring(0, sel.length - 1);
                suffix = suffix + " ";
            }

            if (typeof fn  === 'function') {
                res = (sel) ? fn.call(this,sel) : fn('');
            }
            else {
                res = (sel) ? sel : '';
            }

            subst = prefix + res + suffix;

            if (typeof document.selection !== "undefined") {
                document.selection.createRange().text = subst;
                var range = this.textarea.createTextRange();
                range.collapse(false);
                range.move('character', -suffix.length);
                range.select();
            }
            else if (typeof this.textarea.setSelectionRange !== "undefined") {
                this.textarea.value = this.textarea.value.substring(0, start) + subst + this.textarea.value.substring(end);
                if (sel) {
                    this.textarea.setSelectionRange(start + subst.length, start + subst.length);
                } else {
                    this.textarea.setSelectionRange(start + prefix.length, start + prefix.length);
                }

                this.textarea.scrollTop = scrollPos;
            }
        }

        /**
         * Encloses a selection within a given prefix and suffix.
         * TODO merge this function with encloseLineSelection
         *
         * @param {String} prefix
         * @param {String} suffix
         * @param {Function} fn a callback function
         */
        function encloseSelection(prefix, suffix, fn) {
            var start, end, sel, scrollPos, subst, res;

            prefix = prefix || '';
            suffix = suffix || '';

            this.textarea.focus();

            if (typeof document.selection !== "undefined") {
                sel = document.selection.createRange().text;
            }
            else if (typeof this.textarea.setSelectionRange !== "undefined") {
                start = this.textarea.selectionStart;
                end = this.textarea.selectionEnd;
                scrollPos = this.textarea.scrollTop;
                sel = this.textarea.value.substring(start, end);
            }

            if (sel.match(/ $/)) { // exclude ending space char, if any
                sel = sel.substring(0, sel.length - 1);
                suffix = suffix + " ";
            }

            if (typeof fn === 'function') {
                res = (sel) ? fn.call(this,sel) : fn('');
            }
            else {
                res = (sel) ? sel : '';
            }

            subst = prefix + res + suffix;

            if (typeof document.selection !== "undefined") {
                document.selection.createRange().text = subst;
                var range = this.textarea.createTextRange();
                range.collapse(false);
                range.move('character', -suffix.length);
                range.select();
//			this.textarea.caretPos -= suffix.length;
            }
            else if (typeof this.textarea.setSelectionRange !== "undefined") {
                this.textarea.value = this.textarea.value.substring(0, start) + subst + this.textarea.value.substring(end);
                if (sel) {
                    this.textarea.setSelectionRange(start + subst.length, start + subst.length);
                }
                else {
                    this.textarea.setSelectionRange(start + prefix.length, start + prefix.length);
                }

                this.textarea.scrollTop = scrollPos;
            }
        }

        /**
         * Strips the base url from a given string
         *
         * @param {String} url the url to strip
         * @returns {String}
         */
        function stripBaseURL(url) {
            if (this.base_url !== '') {
                var pos = url.indexOf(this.base_url);
                if (pos === 0) {
                    url = url.substr(this.base_url.length);
                }
            }

            return url;
        }

        /**
         * inserts a single character at the current position
         * and removes blank spaces before and after.
         *
         * @param {String} character the character to insert
         * @param {Object} textarea  the textarea to get the information from
         */
        function singleCharacter(character, textarea) {
            var pos = getCaretPosition(textarea),
                content = textarea.value,
                nextCharIsSpace = content.charAt(pos).match(/\s/),
                prevCharIsSpace = content.charAt(pos-1).match(/\s/),
                prevCharIsNewLine = content.charAt(pos-1).match(/\n/),
                endPos = null, startPos = null,
                i;

            if (pos === 0 || pos === content.length || prevCharIsNewLine) {
                textarea.focus();
                return;
            }

            // find the next non-space character
            if (nextCharIsSpace) {
                for (i=pos+1; i<content.length && startPos === null; i+=1) {
                    if (content.charAt(i).match(/\s/) === null) {
                        startPos = i;
                    }
                }
            }
            // find the previous non-space character
            if (prevCharIsSpace) {
                for (i=pos-1; i>=0 && endPos === null; i-=1) {
                    if (content.charAt(i).match(/\s/) === null) {
                        endPos = i+1;
                    }
                }
            }

            textarea.value = content.substring(0, endPos || pos) + character + content.substring(startPos || pos);
            textarea.focus();
        }

        /**
         * Return the position of the caret within a text
         *
         * @param {Object} el the element
         * @returns {Number}
         */
        function getCaretPosition(el) {
            if (el.selectionStart) {
                return el.selectionStart;
            }

            else if (document.selection) {
                el.focus();

                var r = document.selection.createRange(),
                    re = el.createTextRange(),
                    rc = re.duplicate();

                if (r === null) {
                    return 0;
                }

                re.moveToBookmark(r.getBookmark());
                rc.setEndPoint('EndToStart', re);

                return rc.text.length;
            }
            return 0;
        }

        /** Resizer
         * TODO move into main prototype definition
         -------------------------------------------------------- */
        function resizeSetStartH() {
            this.dragStartH = this.textarea.offsetHeight + 0;
        }

        function resizeDragStart(event) {
            var This = this;
            this.dragStartY = event.clientY;
            this.resizeSetStartH();
            document.addEventListener('mousemove', this.dragMoveHdlr=function(event){This.resizeDragMove(event);}, false);
            document.addEventListener('mouseup', this.dragStopHdlr=function(event){This.resizeDragStop(event);}, false);
        }

        function resizeDragMove(event) {
            this.textarea.style.height = (this.dragStartH+event.clientY-this.dragStartY)+'px';
        }

        function resizeDragStop(event) {
            document.removeEventListener('mousemove', this.dragMoveHdlr, false);
            document.removeEventListener('mouseup', this.dragStopHdlr, false);
        }

        // expose public objects/functions
        return {
            setMode: setMode,
            getMode: getMode,
            switchMode: switchMode,
            getBaseClass: getBaseClass,
            setBaseClass: setBaseClass,
            getButtonBaseClass: getButtonBaseClass,
            setButtonBaseClass: setButtonBaseClass,
            draw: draw,
            drawButton: drawButton,
            Button: Button,
            Spacer: Spacer,
            Combo: Combo,
            singleTag: singleTag,
            singleCharacter: singleCharacter,
            encloseSelection: encloseSelection,
            encloseLineSelection: encloseLineSelection,
            stripBaseURL: stripBaseURL,
            getCaretPosition: getCaretPosition,
            resizeDragStop: resizeDragStop,
            resizeDragMove: resizeDragMove,
            resizeDragStart: resizeDragStart,
            resizeSetStartH: resizeSetStartH
        };
    })();


    // expose public methods/objects
    return {
        JsToolbar: JsToolbar,
        Spacer: Spacer,
        Button: Button,
        Combo: Combo
    };
})();


