/*! Rappid v2.0.0 - HTML5 Diagramming Framework

Copyright (c) 2015 client IO

 2016-09-20 


This Source Code Form is subject to the terms of the Rappid Academic License
, v. 1.0. If a copy of the Rappid License was not distributed with this
file, You can obtain one at http://jointjs.com/license/rappid_academic_v1.txt
 or from the Rappid archive as was distributed by client IO. See the LICENSE file.*/


(function() {
    'use strict';

    var keyboard = new joint.ui.Keyboard();

    function checkModifiers(event) {
        $('.demo_mod').each(function(index, element) {
            toggleHighLight(keyboard.isActive($(element).text(), event), $(element));
        });
    }

    function initShortcuts(items) {
        items.each(function(index, element) {
            keyboard.on($(element).text(), function(event) {
                event.preventDefault();
                highLight($(element));
            });
        });
    }

    function toggleHighLight(toggle, element) {
        element.toggleClass('active', toggle);
    }

    function highLight(element) {
        element.addClass('active');
        setTimeout(function() {
            element.removeClass('active');
        }, 100);
    }

    $(document).ready(function() {
        var helper = new DemoHelper($('#dump'));

        keyboard.on('all', function(normalizedEventName, event) {
            helper.flush(event);
            checkModifiers(event);
        });

        initShortcuts($('.demo_no_context .demo_item'));

        $('#listeningStart').click(function() {
            helper.toggleEnabled(true);
            keyboard.enable();

            $('.demo_item').removeClass('disabled');
            $('.demo_mod').removeClass('disabled');
        });

        $('#listening').click(function() {
            helper.toggleEnabled(false);
            keyboard.disable();
            $('.demo_item').addClass('disabled');
            $('.demo_mod').addClass('disabled');
        });
    });

    var DemoHelper;

    DemoHelper = function(destination) {
        this.lines = [];
        this.count = 0;
        this.destinationElement = destination;
        this.toggleEnabled(true);
    };

    DemoHelper.prototype.flush = function(event) {
        this.destinationElement.prepend(this.createLine(event));
        this.count++;
        if (this.count > 50) {
            this.count = 0;
            this.destinationElement.empty();
        }
    };

    DemoHelper.prototype.toggleEnabled = function(toggle) {
        if (toggle) {
            $('.demo_log_status').css('color', 'green').text('LISTENING');
        } else {
            $('.demo_log_status').css('color', 'red').text('STOPPED');
        }
    };

    DemoHelper.prototype.createLine = function(event) {
        var line = [];

        line.push('<div class="g4">' + event.type + '</div>');

        line.push('<div class="g2">' + event.which + '&nbsp;</div>');
        line.push('<div class="g2">' + String.fromCharCode(event.which) + '&nbsp;</div>');

        line.push('<div class="g2">' + (+event.shiftKey) + '</div>');
        line.push('<div class="g2">' + (+event.ctrlKey) + '</div>');
        line.push('<div class="g2">' + (+event.altKey) + '</div>');
        line.push('<div class="g2">' + (+event.metaKey) + '</div>');

        return line;
    };
}());
