/*! Rappid v2.0.0 - HTML5 Diagramming Framework

Copyright (c) 2015 client IO

 2016-09-20 


This Source Code Form is subject to the terms of the Rappid Academic License
, v. 1.0. If a copy of the Rappid License was not distributed with this
file, You can obtain one at http://jointjs.com/license/rappid_academic_v1.txt
 or from the Rappid archive as was distributed by client IO. See the LICENSE file.*/


(function() {
    /**
     * Demo helper
     * @returns {{create: create, add: add}}
     */

    var logger = (function() {

        var $el = $('<div/>');

        return {
            create: function() {
                $('<div/>').append($('<h3/>').text('Log (check console for more details):')).append($el).appendTo($('body'));
            },
            add: function(message) {

                $el.prepend($('<div/>').text(message));

                if ($el.children().length > 20) {
                    $el.children().slice(10).remove();
                }
            }
        };
    }());

    /**
     * Toolbar demo
     */
    var toolbar = new joint.ui.Toolbar({
        tools: [
            { type: 'label', text: 'select Font: ' },
            {
                type: 'select-box', name: 'selectfont',
                width: 200,
                options: [
                    { content: 'Arial' },
                    { content: 'Helvetica' },
                    { content: 'Times New Roman' },
                    { content: 'Courier New' }
                ],
                defaultValue: 'Courier New'
            },
            { type: 'separator' },
            {
                type: 'select-box', name: 'theme',
                width: 200,
                options: [
                    { content: 'default' },
                    { content: 'modern' },
                    { content: 'dark' },
                    { content: 'material' }
                ],
                value: 'modern'
            },
            { type: 'separator' },
            { type: 'inputText', label: 'text' },
            { type: 'inputNumber', label: 'number', max: 100, min: 10, value: 88 },
            { type: 'textarea', label: 'label', value: 'Rect' },
            {
                type: 'select-button-group', name: 'aaaaa',
                multi: true,
                selected: [1, 3],
                options: [
                    {
                        value: 'line-through',
                        content: '<span style="text-decoration: line-through">S</span>',
                        attrs: { '.select-button-group-button': { 'data-tooltip': 'My tooltip' } }
                    },
                    { value: 'underline', content: '<span style="text-decoration: underline">U</span>' },
                    { value: 'italic', content: '<span style="font-style: italic">I</span>' },
                    { value: 'bold', content: '<span style="font-weight: bold">B</span>' }
                ]
            },
            { type: 'separator' },
            { type: 'label', text: 'Styled label ', attrs: { label: { style: 'color:#31d0c6' } } },
            { type: 'button', name: 'ok', text: 'Ok' },
            { type: 'button', name: 'cancel', text: 'Cancel' }
        ]
    });

    toolbar.on('cancel:click', function(data, e) {
        logger.add('cancel clicked');
    });

    toolbar.on('ok:click', function(data, e) {
        logger.add('ok clicked');
    });

    toolbar.on('all', function(name) {
        logger.add(name);
        console.log(arguments);
    });

    toolbar.on('theme:option:select', function(data) {
        joint.setTheme(data.content);
    });

    /**
     * Toolbar demo 2
     */
    var toolbar2 = new joint.ui.Toolbar({
        tools: [
            'zoomToFit', { type: 'zoomIn', min: 50, step: 55 }, 'zoomOut'
        ],
        references: {
            // mocking instances for the purpose of this demo
            paperScroller: {
                options: {
                    paper: {
                        on: function() {}
                    }
                },
                zoom: function() {},
                zoomToFit: function() {}
            },
            commandManager: {
                undo: function() {},
                redo: function() {}
            }
        }
    });

    /**
     * Toolbar with group
     */
    var toolbar3 = new joint.ui.Toolbar({
        className: 'toolbar toolbar2',
        groups: {
            'group-a': { index: 1 },
            'group-b': { index: 3, align: 'right' },
            'group-c': { index: 2, align: 'right' }
        },
        tools: [
            { group: 'group-a', type: 'label', text: 'group a: ' },
            { group: 'group-a', type: 'button', name: '1', text: '1' },
            { group: 'group-a', type: 'button', name: '2', text: '2' },
            { group: 'group-a', type: 'separator' },

            { group: 'group-b', type: 'separator' },
            { group: 'group-b', type: 'label', text: 'group b: ' },
            { group: 'group-b', type: 'button', name: 'a', text: 'a' },
            { group: 'group-b', type: 'checkbox', label: ' checkbox:' },

            { group: 'group-c', type: 'label', text: 'group c: ' },
            { group: 'group-c', type: 'button', name: 'Cc', text: 'Cc' }
        ]
    });

    var $container = $('body');
    $container.append($('<h3/>').text('Toolbar'));
    $container.append(toolbar.render().el);
    $container.append($('<div/>').addClass('clear'));

    $container.append($('<h3/>').text(' '));
    $container.append(toolbar2.render().el);
    $container.append($('<div/>').addClass('clear'));

    $container.append($('<h3/>').text('Toolbar with groups'));
    $container.append($('<div/>').append(toolbar3.render().el));
    $container.append($('<div/>').addClass('clear'));

    logger.create();

}());
