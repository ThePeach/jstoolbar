/*jshint bitwise:true, curly:true, eqeqeq:true, forin:true, noarg:true, noempty:true, nonew:true, undef:true, unused:true, strict:true, browser:true */

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
/* Modified by JP LANG for textile formatting */

var JSTOOLBAR = JSTOOLBAR || {};

function jsToolBar(textarea, toolbarElements) {
    'use strict';

    // default toolbar buttons order
    var defaultToolbarElements = [ 'strong', 'em', 'space', 'br', 'h1', 'h2', 'h3', 'space', 'ul', 'ol', 'bq', 'unbq', 'pre', 'space', 'link', 'email', 'styles' ];

	if (!document.createElement) { return; }

	if (!textarea) { return; }

	if ((typeof(document.selection) === "undefined")
        && (typeof(textarea.setSelectionRange) === "undefined")
    ) {
		return;
	}

    this.toolbarElements = toolbarElements || defaultToolbarElements;

	this.textarea = textarea;

	this.editor = document.createElement('div');
	this.editor.className = 'jstEditor';

	this.textarea.parentNode.insertBefore(this.editor,this.textarea);
	this.editor.appendChild(this.textarea);

	this.toolbar = document.createElement("div");
	this.toolbar.className = 'jstElements';
	this.editor.parentNode.insertBefore(this.toolbar,this.editor);

	// Draggable resizing
	if (this.editor.addEventListener && navigator.appVersion.match(/\bMSIE\b/))
	{
		this.handle = document.createElement('div');
		this.handle.className = 'jstHandle';
		var dragStart = this.resizeDragStart;
		var This = this;
		this.handle.addEventListener('mousedown',function(event) { dragStart.call(This,event); },false);
		// fix memory leak in Firefox (bug #241518)
		window.addEventListener('unload',function() {
				var del = This.handle.parentNode.removeChild(This.handle);
				delete(This.handle);
		},false);

		this.editor.parentNode.insertBefore(this.handle,this.editor.nextSibling);
	}

	this.context = null;
	this.toolNodes = {}; // when the toolbar is designed, this object is filled with shortcuts to the corresponding DOM elements tools.
}

function jsButton(title, fn, scope, className) {
    if (typeof jsToolBar.strings === 'undefined') {
      this.title = title || null;
    } else {
      this.title = jsToolBar.strings[title] || title || null;
    }
	this.fn = fn || function(){};
	this.scope = scope || null;
	this.className = className || null;
}
jsButton.prototype.draw = function() {
	if (!this.scope) {
        return null;
    }

	var button = document.createElement('button');
	button.setAttribute('type','button');
	button.tabIndex = 200;
	if (this.className) {
        button.className = this.className;
    }
	button.title = this.title;
	var span = document.createElement('span');
	span.appendChild(document.createTextNode(this.title));
	button.appendChild(span);

	if (this.icon !== undefined) {
		button.style.backgroundImage = 'url('+this.icon+')';
	}
	if (typeof(this.fn) === 'function') {
		var This = this;
		button.onclick = function() { try { This.fn.apply(This.scope, arguments) } catch (e) {} return false; };
	}
	return button;
}

function jsSpace(id) {
    'use strict';

	this.id = id || null;
	this.width = null;
}

jsSpace.prototype.draw = function() {
	var span = document.createElement('span');
	if (this.id) {
        span.id = this.id;
    }
	span.appendChild(document.createTextNode(String.fromCharCode(160)));
	span.className = 'jstSpacer';
	if (this.width) {
        span.style.marginRight = this.width+'px';
    }

	return span;
};

function jsCombo(title, options, scope, fn, className) {
	this.title = title || null;
	this.options = options || null;
	this.scope = scope || null;
	this.fn = fn || function(){};
	this.className = className || null;
}
jsCombo.prototype.draw = function() {
	if (!this.scope || !this.options) {
        return null;
    }

	var select = document.createElement('select');
	if (this.className) {
        select.className = className;
    }
	select.title = this.title;

	for (var o in this.options) {
		//var opt = this.options[o];
		var option = document.createElement('option');
		option.value = o;
		option.appendChild(document.createTextNode(this.options[o]));
		select.appendChild(option);
	}

	var This = this;
	select.onchange = function() {
		try {
			This.fn.call(This.scope, this.value);
		} catch (e) { alert(e); }

		return false;
	}

	return select;
}


jsToolBar.prototype = {
	base_url: '',
	mode: 'wiki',
	elements: {},
	help_link: '',

	getMode: function() {
		return this.mode;
	},

	setMode: function(mode) {
		this.mode = mode || 'wiki';
	},

	switchMode: function(mode) {
		mode = mode || 'wiki';
		this.draw(mode);
	},

	setHelpLink: function(link) {
		this.help_link = link;
	},

	button: function(toolName) {
		var tool = JSTOOLBAR.markdown.elements[toolName];
		if (typeof tool.fn[this.mode] !== 'function') {
            return null;
        }
		var b = new jsButton(tool.title, tool.fn[this.mode], this, 'jstb_'+toolName);
		if (tool.icon !== undefined) {
            b.icon = tool.icon;
        }
		return b;
	},
	space: function(toolName) {
        'use strict';
		var tool = new jsSpace(toolName);
		if (typeof this.elements[toolName] !== 'undefined') {
            tool.width = this.elements[toolName].width;
        }
		return tool;
	},
	combo: function(toolName) {
        'use strict';

		var tool = JSTOOLBAR.markdown.elements[toolName],
            list = tool[this.mode].list,
            options = {},
            i, opt;

		if (typeof tool[this.mode].fn !== 'function' || list.length === 0) {
			return null;
		} else {
			for (i=0; i < list.length; i++) {
				opt = list[i];
				options[opt] = tool.options[opt];
			}
			return new jsCombo(tool.title, options, this, tool[this.mode].fn);
		}
	},
	draw: function(mode) {
        'use strict';

		this.setMode(mode); // defaults to 'wiki'

		// Empty toolbar
		while (this.toolbar.hasChildNodes()) {
			this.toolbar.removeChild(this.toolbar.firstChild);
		}
		this.toolNodes = {}; // empty DOM shortcuts

		// Draw toolbar elements
		var i, b, tool, newTool;

		for (i=0; i < this.toolbarElements.length; i++) {
			b = JSTOOLBAR.markdown.elements[this.toolbarElements[i]];

			var disabled =
                typeof b.type === 'undefined'
                || b.type === ''
                || (typeof b.disabled !== 'undefined' && b.disabled)
                || (typeof b.context !== 'undefined' && b.context !== null && b.context !== this.context);

			if (!disabled && typeof this[b.type] === 'function') {
				tool = this[b.type](this.toolbarElements[i]); // get the right constructor for the toolbar element
				if (tool) {
                    newTool = tool.draw();
                }
				if (newTool) {
					this.toolNodes[this.toolbarElements[i]] = newTool; // record the DOM shortcut access for later use
					this.toolbar.appendChild(newTool);
				}
			}
		}
	},

	singleTag: function(stag,etag) {
        'use strict';

		stag = stag || null;
		etag = etag || stag;

		if (!stag || !etag) { return; }

		this.encloseSelection(stag,etag);
	},

	encloseLineSelection: function(prefix, suffix, fn) {
		this.textarea.focus();

		prefix = prefix || '';
		suffix = suffix || '';

		var start, end, sel, scrollPos, subst, res;

		if (typeof(document.selection) !== "undefined") {
			sel = document.selection.createRange().text;
		}
        else if (typeof(this.textarea.setSelectionRange) !== "undefined") {
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
		} else {
			res = (sel) ? sel : '';
		}

		subst = prefix + res + suffix;

		if (typeof(document.selection) !== "undefined") {
			document.selection.createRange().text = subst;
			var range = this.textarea.createTextRange();
			range.collapse(false);
			range.move('character', -suffix.length);
			range.select();
		}
        else if (typeof(this.textarea.setSelectionRange) !== "undefined") {
			this.textarea.value = this.textarea.value.substring(0, start) + subst +
			this.textarea.value.substring(end);
			if (sel) {
				this.textarea.setSelectionRange(start + subst.length, start + subst.length);
			} else {
				this.textarea.setSelectionRange(start + prefix.length, start + prefix.length);
			}
			this.textarea.scrollTop = scrollPos;
		}
	},

	encloseSelection: function(prefix, suffix, fn) {
		this.textarea.focus();

		prefix = prefix || '';
		suffix = suffix || '';

		var start, end, sel, scrollPos, subst, res;

		if (typeof(document.selection) !== "undefined") {
			sel = document.selection.createRange().text;
		}
        else if (typeof(this.textarea.setSelectionRange) !== "undefined") {
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

		if (typeof(document.selection) !== "undefined") {
			document.selection.createRange().text = subst;
			var range = this.textarea.createTextRange();
			range.collapse(false);
			range.move('character', -suffix.length);
			range.select();
//			this.textarea.caretPos -= suffix.length;
		}
        else if (typeof(this.textarea.setSelectionRange) !== "undefined") {
			this.textarea.value = this.textarea.value.substring(0, start) + subst + this.textarea.value.substring(end);
			if (sel) {
				this.textarea.setSelectionRange(start + subst.length, start + subst.length);
			} else {
				this.textarea.setSelectionRange(start + prefix.length, start + prefix.length);
			}
			this.textarea.scrollTop = scrollPos;
		}
	},

	stripBaseURL: function(url) {
		if (this.base_url !== '') {
			var pos = url.indexOf(this.base_url);
			if (pos === 0) {
				url = url.substr(this.base_url.length);
			}
		}

		return url;
	},

    /**
     * inserts a single character at the current position and removes blank spaces before and after
     *
     * @param {String} char the character to insert
     */
    singleCharacter: function (char) {
        'use strict';

        var pos = this.getCaretPosition(this.textarea),
            content = this.textarea.value,
            nextCharIsSpace = content.charAt(pos).match(/\s/),
            prevCharIsSpace = content.charAt(pos-1).match(/\s/),
            prevCharIsNewLine = content.charAt(pos-1).match(/\n/),
            endPos = null, startPos = null,
            i;

        if (pos === 0 || pos === content.length || prevCharIsNewLine) {
            this.textarea.focus();
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

        this.textarea.value = content.substring(0, endPos || pos) + char + content.substring(startPos || pos);
        this.textarea.focus();
    },

    /**
     * Return the position of the caret within a text
     *
     * @param {Object} el the element
     * @returns {Number}
     */
    getCaretPosition: function (el) {
        'use strict';

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
};

/** Resizer
-------------------------------------------------------- */
jsToolBar.prototype.resizeSetStartH = function() {
	this.dragStartH = this.textarea.offsetHeight + 0;
};
jsToolBar.prototype.resizeDragStart = function(event) {
	var This = this;
	this.dragStartY = event.clientY;
	this.resizeSetStartH();
	document.addEventListener('mousemove', this.dragMoveHdlr=function(event){This.resizeDragMove(event);}, false);
	document.addEventListener('mouseup', this.dragStopHdlr=function(event){This.resizeDragStop(event);}, false);
};

jsToolBar.prototype.resizeDragMove = function(event) {
	this.textarea.style.height = (this.dragStartH+event.clientY-this.dragStartY)+'px';
};

jsToolBar.prototype.resizeDragStop = function(event) {
	document.removeEventListener('mousemove', this.dragMoveHdlr, false);
	document.removeEventListener('mouseup', this.dragStopHdlr, false);
};
