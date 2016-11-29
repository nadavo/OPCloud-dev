/*! Rappid v1.7.1 - HTML5 Diagramming Framework

Copyright (c) 2015 client IO

 2016-03-03 


This Source Code Form is subject to the terms of the Rappid Academic License
, v. 1.0. If a copy of the Rappid License was not distributed with this
file, You can obtain one at http://jointjs.com/license/rappid_academic_v1.txt
 or from the Rappid archive as was distributed by client IO. See the LICENSE file.*/


$('#btn-open').on('click', function() {

    var ct = new joint.ui.ContextToolbar({
        tools: [
            { action: 'yes', content: 'Yes' },
            { action: 'no', content: 'No' },
            { action: 'maybe', content: 'Maybe' },
            { action: 'sure', content: 'Sure' }
        ],
        target: this
    });

    ct.on('action:yes', ct.remove, ct);
    ct.on('action:no', ct.remove, ct);

    ct.render();
});


$('circle').on('click', function() {

    var ct = new joint.ui.ContextToolbar({
        tools: [
            { action: 'hide', icon: './images/icon-trash.png' },
            { action: 'info', content: 'Info' },
            { action: 'lightbox', icon: './images/icon-lightbox.png' },
            { action: 'no', icon: './images/icon-image-list.png' }
        ],
        target: this
    });

    ct.on('action:hide', ct.remove, ct);
    ct.on('action:info', function() {
        alert('Info button clicked.');
    });

    ct.render();
});
