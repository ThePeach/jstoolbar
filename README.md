jsToolbar
=========

A JS-based editor toolbar for any input form.
Shipped with markdown and textile formats.

This is a fork and improvement of the default jstoolbar used in DotClear (but never shipped separately).

How to use it
-------------

Load the scripts in your page in the following order:

1. namespace.js
2. jstoolbar.js
3. <language>.js

where <language> can be either 'markdown' or 'textile'.

Once you've got the scripts loaded you just need a textarea available in the page:

```
<textarea id="jsToolbar" rows="3" cols="50"></textarea>
```

and a two lines of code to show the toolbar

```javascript
var jsToolbar = new JSTB.components.jsToolbar(document.getElementById("jsToolbar"));
jsToolbar.draw();
```

By default the jsToolbar will use markdown as syntax and the draw the following elements:

* strong
* em
* spacer
* br
* h1
* h2
* h3
* spacer
* ul
* ol
* bq
* unbq
* pre
* spacer
* link
* email
* styles

The **spacer** is a special element that will add some space between buttons.

Extending the language
=========

You can create new languages to be used in jsToolbar, and I'll happily integrate them, just do a pull request.

Extending or modifying the syntax should be quite straightforward, every button can define its own callback to be used and within the callback you can access the internals of the jsToolbar, such as tag functions and elements (textarea) through _this_.

Testing
=========

The whole library is being tested using [Jasmine](https://github.com/pivotal/jasmine).

Currently it's being tested under Firefox and Chrome (WebKit).

Before reporting any error, be sure to run the tests on your browser and see if there's anything wrong with it.

TODO
========

- [ ] Refactor internal tag writing functions to be more flexible
- [ ] Refactor CSS classes and icons
- [ ] Test under IE (>=9)
- [ ] Introduce language translations
