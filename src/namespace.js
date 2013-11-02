/*jshint bitwise:true, curly:true, eqeqeq:true, forin:true, noarg:true, noempty:true, nonew:true, undef:true, strict:true, browser:true */

/**
 * @projectDescription  This library contains the definition for the namespace.
 *
 * Version taken from Stoyan Stefanov - Javascript Patterns.
 * Published under the GPLv2.
 *
 * @version 0.1
 */

/**
 * create default namespace
 * @type {*|{}}
 */
var JSTB = JSTB || {};
/**
 * Takes a namespace ns and creates it if it doesn't exist yet.
 * Thanks to Stoyan Stefanov for this.
 *
 * @param {string} ns the namespace
 * @returns {*|{}}
 */
JSTB.namespace = function (ns) {
    'use strict';

    var parts = ns.split('.'),
        parent = JSTB,
        i;

    // strip redundant leading global
    if (parts[0] === 'JSTB') {
        parts = parts.slice(1);
    }

    for (i=0; i < parts.length; i += 1) {
        // create a property if it doesn't exist
        if (typeof parent[parts[i]] === 'undefined') {
            parent[parts[i]] = {};
        }
        parent = parent[parts[i]];
    }
    return parent;
};
