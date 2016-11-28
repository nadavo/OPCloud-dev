/*! Rappid v2.0.0 - HTML5 Diagramming Framework

Copyright (c) 2015 client IO

 2016-09-20 


This Source Code Form is subject to the terms of the Rappid Academic License
, v. 1.0. If a copy of the Rappid License was not distributed with this
file, You can obtain one at http://jointjs.com/license/rappid_academic_v1.txt
 or from the Rappid archive as was distributed by client IO. See the LICENSE file.*/


(function($, _, V, joint) {

    /*
        Gotcha's:
        * IE won't show background images and colors unless the "Print background colors and images" option is on. [1]
        * SVG filters are removed if their ID attribute conflicts with other elements in the DOM. [2]

        [1] https://support.microsoft.com/en-us/kb/296326
        [2] https://stackoverflow.com/questions/19042282/svg-filters-after-cloning-svg
    */

    /*
        Use media queries to apply styles when printing, like this:

        @media print {
            .printarea {
                position: absolute;
                left: 0px;
                top: 0px;
            }
        }
    */

    function beforePrint(opt) {

        opt = opt || {};

        this.trigger('beforeprint', opt);

        this.$printArea = $('<div/>').addClass('printarea');

        if (opt.size) {
            this.$printArea.addClass('printarea-size-' + opt.size);
        }

        var $printPaper = this.$el.clone().appendTo(this.$printArea);
        var padding = joint.util.normalizeSides(opt.padding);
        var bbox = this.getContentBBox().moveAndExpand({
            x: - padding.left,
            y: - padding.top,
            width: padding.left + padding.right,
            height: padding.top + padding.bottom
        });

        // Stretch the content to the size of the container and apply padding.
        V($printPaper.find('svg')[0]).attr({
            width: '100%',
            height: '100%',
            viewBox: [bbox.x, bbox.y, bbox.width, bbox.height].join(' ')
        });

        /*
            Detach the children of the paper element before adding the cloned paper element to the DOM.
            This is necessary because otherwise the SVG filters are removed because of duplicate element IDs.
        */
        this.$detachedChildren = this.$el.children().detach();
        this.$printArea.prependTo(document.body);
    }

    function afterPrint(opt) {

        opt = opt || {};

        this.$printArea.remove();
        this.$el.append(this.$detachedChildren);

        // Clean-up.
        this.$detachedChildren = null;
        this.$printArea = null;

        this.trigger('afterprint', opt);
    }

    joint.dia.Paper.prototype.print = function(opt) {

        opt = opt || {};

        _.defaults(opt, {
            // For setting actual paper print size via CSS.
            // Adds another class to printarea <div/> like `printarea-size-a4`.
            size: 'a4',
            padding: 5
        });

        // Create local versions of before/after methods.
        var localBeforePrint = _.bind(beforePrint, this, opt);
        var localAfterPrint = _.bind(afterPrint, this, opt);

        var onceAfterPrint = _.once(function() {
            localAfterPrint();
            $(window).off('afterprint', onceAfterPrint);
        });

        $(window).one('afterprint', onceAfterPrint);

        // To make sure an app won't get stuck without its original body, add a delayed version.
        _.delay(onceAfterPrint, 200);

        localBeforePrint();
        window.print();
    };

})($, _, V, joint);
