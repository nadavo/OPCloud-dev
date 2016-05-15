/*! Rappid v1.7.1 - HTML5 Diagramming Framework

Copyright (c) 2015 client IO

 2016-03-03 


This Source Code Form is subject to the terms of the Rappid Academic License
, v. 1.0. If a copy of the Rappid License was not distributed with this
file, You can obtain one at http://jointjs.com/license/rappid_academic_v1.txt
 or from the Rappid archive as was distributed by client IO. See the LICENSE file.*/


$('#btn-display').on('click', function() {
    (new joint.ui.FlashMessage({
        title: 'Message',
        type: 'alert',
        content: '<em>An error occured. Try again later.</em>'
    })).open();
});

$('#btn-display-width').on('click', function() {
    (new joint.ui.FlashMessage({
        width: 150,
        title: 'Message',
        content: '<em>An error occured. Try again later.</em>'
    })).open();
});

$('#btn-display-modal').on('click', function() {
    (new joint.ui.FlashMessage({
        type: 'alert',
        closeAnimation: false,
        modal: true,
        title: 'Modal Message',
        content: '<em>This is a modal Flash message requiring the user to close the message manually.</em>'
    })).open();
});

$('#btn-close-all').on('click', function() {
    joint.ui.FlashMessage.close();
});

joint.ui.FlashMessage.open('ui.FlashMessage 1');
joint.ui.FlashMessage.open('ui.FlashMessage alert', '', { type: 'alert', closeAnimation: { delay: 1000 } });
joint.ui.FlashMessage.open('ui.FlashMessage warning', '', { type: 'warning', closeAnimation: { delay: 2000 } });
joint.ui.FlashMessage.open('ui.FlashMessage success', '', { type: 'success', closeAnimation: { delay: 3000 } });
joint.ui.FlashMessage.open('ui.FlashMessage neutral', '', { type: 'neutral' });
joint.ui.FlashMessage.open('ui.FlashMessage info', '', { type: 'info' });
joint.ui.FlashMessage.open('ui.FlashMessage close delay 3s', '', { type: 'neutral', closeAnimation: { delay: 3000 } });
joint.ui.FlashMessage.open('ui.FlashMessage with title', 'Title');
joint.ui.FlashMessage.open('ui.FlashMessage without close animation', '', { closeAnimation: false });


