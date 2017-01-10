/*! Rappid v2.0.0 - HTML5 Diagramming Framework

Copyright (c) 2015 client IO

 2016-09-20 


This Source Code Form is subject to the terms of the Rappid Academic License
, v. 1.0. If a copy of the Rappid License was not distributed with this
file, You can obtain one at http://jointjs.com/license/rappid_academic_v1.txt
 or from the Rappid archive as was distributed by client IO. See the LICENSE file.*/


/**
 * make xhr.response = 'arraybuffer' available for the IE9
 */
(function() {

    if (typeof XMLHttpRequest === 'undefined') {
        return;
    }

    if ('response' in XMLHttpRequest.prototype ||
        'mozResponseArrayBuffer' in XMLHttpRequest.prototype ||
        'mozResponse' in XMLHttpRequest.prototype ||
        'responseArrayBuffer' in XMLHttpRequest.prototype) {
        return;
    }

    Object.defineProperty(XMLHttpRequest.prototype, 'response', {
        get: function() {
            return new Uint8Array(new VBArray(this.responseBody).toArray());
        }
    });
})();
