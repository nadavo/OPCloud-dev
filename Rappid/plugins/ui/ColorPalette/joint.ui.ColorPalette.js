/*! Rappid v1.7.1 - HTML5 Diagramming Framework

Copyright (c) 2015 client IO

 2016-03-03 


This Source Code Form is subject to the terms of the Rappid Academic License
, v. 1.0. If a copy of the Rappid License was not distributed with this
file, You can obtain one at http://jointjs.com/license/rappid_academic_v1.txt
 or from the Rappid archive as was distributed by client IO. See the LICENSE file.*/


joint.ui.ColorPalette = joint.ui.SelectBox.extend({

    className: 'select-box color-palette',

    position: function() {

        var $selection = this.$('.select-box-selection');
        var selectionHeight = $selection.outerHeight();
        var selectionOffset = $selection.offset();

        var left = selectionOffset.left;
        var top = selectionOffset.top + selectionHeight;

        if (this.options.target !== document.body) {

            this.$target = this.$target || $(this.options.target);

            // Position relative to target element
            var targetOffset = this.$target.offset();
            left -= targetOffset.left - this.$target.scrollLeft();
            top -= targetOffset.top - this.$target.scrollTop();
        }

        this.$options.css({ left: left, top: top });
    },

    renderOptionContent: function(option) {

        var $option = $('<div/>', { 'class': 'select-box-option-content' });
        $option.css('background-color', option.content);
        if (option.icon) {
            $option.prepend($('<img/>', {
                'class': 'select-box-option-icon',
                src: option.icon
            }));
        }
        return $option;
    }
});
