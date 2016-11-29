/*! Rappid v2.0.0 - HTML5 Diagramming Framework

Copyright (c) 2015 client IO

 2016-09-20 


This Source Code Form is subject to the terms of the Rappid Academic License
, v. 1.0. If a copy of the Rappid License was not distributed with this
file, You can obtain one at http://jointjs.com/license/rappid_academic_v1.txt
 or from the Rappid archive as was distributed by client IO. See the LICENSE file.*/


// PaperScroller
// =============


// `PaperScroller` wraps the paper root element and implements panning and centering of the paper.

// Example usage:

//      var paperScroller = new joint.ui.PaperScroller;
//      var paper = new joint.dia.Paper({ el: paperScroller.el });
//      paperScroller.options.paper = paper;
//      $appElement.append(paperScroller.render().el);

//      paperScroller.center();
//      paper.on('blank:pointerdown', paperScroller.startPanning);

joint.ui.PaperScroller = joint.mvc.View.extend({

    className: 'paper-scroller',

    options: {
        paper: undefined,
        // Default padding makes sure the paper inside the paperScroller is always panable
        // all the way left, right, bottom and top.
        // It also makes sure that there is always at least a fragment of the paper visible.
        // Example usage:
        //   padding: 10
        //   padding: { left: 20, right: 20 }
        //   padding: function() { return 10; }
        padding: function() {

            var minVisibleSize = Math.max(this.options.minVisiblePaperSize, 1) || 1;
            var padding = {};

            padding.left = padding.right = Math.max(this.el.clientWidth - minVisibleSize, 0);
            padding.top = padding.bottom = Math.max(this.el.clientHeight - minVisibleSize, 0);

            return padding;
        },
        // Minimal size (px) of the paper that has to stay visible.
        // Used by the default padding method only.
        minVisiblePaperSize: 50,
        autoResizePaper: false,
        baseWidth: undefined,
        baseHeight: undefined,
        contentOptions: undefined,
        cursor: 'default'
    },

    // Internal padding storage
    _padding: { paddingLeft: 0, paddingTop: 0 },

    init: function() {

        _.bindAll(this, 'startPanning', 'stopPanning', 'pan', 'onBackgroundEvent');

        var paper = this.options.paper;

        // keep scale values for a quicker access
        var initScale = V(paper.viewport).scale();
        this._sx = initScale.sx;
        this._sy = initScale.sy;

        // if the base paper dimension is not specified use the paper size.
        _.isUndefined(this.options.baseWidth) && (this.options.baseWidth = paper.options.width);
        _.isUndefined(this.options.baseHeight) && (this.options.baseHeight = paper.options.height);

        this.$background = $('<div/>').addClass('paper-scroller-background')
            .css({ width: paper.options.width, height: paper.options.height })
            .append(paper.el)
            .appendTo(this.el);

        this.listenTo(paper, 'scale', this.onScale);
        this.listenTo(paper, 'resize', this.onResize);
        this.listenTo(paper, 'beforeprint beforeexport', this.storeScrollPosition);
        this.listenTo(paper, 'afterprint afterexport', this.restoreScrollPosition);

        // automatically resize the paper
        if (this.options.autoResizePaper) {

            this.listenTo(paper.model, 'change add remove reset', this.adjustPaper);
        }

        this.delegateBackgroundEvents();
        this.setCursor(this.options.cursor);
    },

    setCursor: function(cursor) {

        switch (cursor) {
            case 'grab':
                // Make a special case for the cursor above
                // due to bad support across browsers.
                // It's handled in `layout.css`.
                this.$el.css('cursor', '');
                break;
            default:
                this.$el.css('cursor', cursor);
                break;
        }

        this.$el.attr('data-cursor', cursor);
        this.options.cursor = cursor;

        return this;
    },

    // Set up listeners for passing events from outside the paper to the paper
    delegateBackgroundEvents: function(events) {

        events || (events = _.result(this.options.paper, 'events'));

        var normalizedEvents = this.paperEvents = _.reduce(events, _.bind(normalizeEvents, this), {});

        _.each(normalizedEvents, _.bind(delegateBackgroundEvent, this));

        function normalizeEvents(events, listener, event) {
            // skip events with selectors
            if (event.indexOf(' ') === -1) {
                events[event] = _.isFunction(listener) ? listener : this.options.paper[listener];
            }
            return events;
        }

        function delegateBackgroundEvent(listener, event) {
            // Sending event data with `guarded=false` to prevent events from
            // being guarded by the paper.
            this.delegate(event, { guarded: false }, this.onBackgroundEvent);
        }

        return this;
    },

    // Pass the event outside the paper to the paper.
    onBackgroundEvent: function(evt) {

        if (this.$background.is(evt.target)) {
            var listener = this.paperEvents[evt.type];
            if (_.isFunction(listener)) {
                listener.apply(this.options.paper, arguments);
            }
        }
    },

    onResize: function() {

        // Move scroller so the user sees the same area as before the resizing.
        if (this._center) this.center(this._center.x, this._center.y);
    },

    onScale: function(sx, sy, ox, oy) {

        this.adjustScale(sx, sy);

        // update scale values for a quicker access
        this._sx = sx;
        this._sy = sy;

        // Move scroller to scale origin.
        if (ox || oy) this.center(ox, oy);
    },

    storeScrollPosition: function() {

        this._scrollLeftBeforePrint = this.el.scrollLeft;
        this._scrollTopBeforePrint = this.el.scrollTop;
    },

    restoreScrollPosition: function() {

        // Set the paper element to the scroll position before printing.
        this.el.scrollLeft = this._scrollLeftBeforePrint;
        this.el.scrollTop = this._scrollTopBeforePrint;

        // Clean-up.
        this._scrollLeftBeforePrint = null;
        this._scrollTopBeforePrint = null;
    },

    beforePaperManipulation: function() {
        // IE is trying to show every frame while we manipulate the paper.
        // That makes the viewport kind of jumping while zooming for example.
        // Make the paperScroller invisible fixes this.
        this.$el.css('visibility', 'hidden');
    },

    afterPaperManipulation: function() {

        this.$el.css('visibility', 'visible');
    },

    toLocalPoint: function(x, y) {

        var ctm = this.options.paper.viewport.getCTM();

        x += this.el.scrollLeft - this._padding.left - ctm.e;
        x /= ctm.a;

        y += this.el.scrollTop - this._padding.top - ctm.f;
        y /= ctm.d;

        return g.point(x, y);
    },

    adjustPaper: function() {

        // store the current mid point of visible paper area, so we can center the paper
        // to the same point after the resize
        this._center = this.toLocalPoint(this.el.clientWidth / 2, this.el.clientHeight / 2);

        var options = _.extend({
            gridWidth: this.options.baseWidth,
            gridHeight: this.options.baseHeight,
            allowNewOrigin: 'negative'
        }, this.options.contentOptions);

        this.options.paper.fitToContent(this.transformContentOptions(options));

        return this;
    },

    adjustScale: function(sx, sy) {

        var paperOptions = this.options.paper.options;
        var fx = sx / this._sx;
        var fy = sy / this._sy;

        this.options.paper.setOrigin(paperOptions.origin.x * fx, paperOptions.origin.y * fy);
        this.options.paper.setDimensions(paperOptions.width * fx, paperOptions.height * fy);
    },

    // Recalculates content options taking the current scale into account.
    transformContentOptions: function(opt) {

        var sx = this._sx;
        var sy = this._sy;

        if (opt.gridWidth) opt.gridWidth *= sx;
        if (opt.gridHeight) opt.gridHeight *= sy;
        if (opt.minWidth) opt.minWidth *= sx;
        if (opt.minHeight) opt.minHeight *= sy;

        if (_.isObject(opt.padding)) {
            opt.padding = {
                left: (opt.padding.left || 0) * sx,
                right: (opt.padding.right || 0) * sx,
                top: (opt.padding.top || 0) * sy,
                bottom: (opt.padding.bottom || 0) * sy
            };
        } else if (_.isNumber(opt.padding)) {
            opt.padding = opt.padding * sx;
        }

        return opt;
    },

    // Adjust the paper position so the point [x,y] is moved to the center of paperScroller element.
    // If no point given [x,y] equals to center of the paper element.
    center: function(x, y, opts) {

        var ctm = this.options.paper.viewport.getCTM();

        // the paper rectangle
        // x1,y1 ---------
        // |             |
        // ----------- x2,y2
        var x1 = -ctm.e;
        var y1 = -ctm.f;
        var x2 = x1 + this.options.paper.options.width;
        var y2 = y1 + this.options.paper.options.height;

        if (_.isUndefined(x) || _.isUndefined(y)) {
            // find center of the paper rect
            x = (x1 + x2) / 2;
            y = (y1 + y2) / 2;
        } else {
            // local coordinates to viewport coordinates
            x *= ctm.a;
            y *= ctm.d;
        }

        var p = this.getPadding();
        var cx = this.el.clientWidth / 2;
        var cy = this.el.clientHeight / 2;

        // calculate paddings
        var left = cx - p.left - x + x1;
        var right = cx - p.right + x - x2;
        var top = cy - p.top - y + y1;
        var bottom = cy - p.bottom + y - y2;

        this.addPadding(
            Math.max(left, 0),
            Math.max(right, 0),
            Math.max(top, 0),
            Math.max(bottom, 0)
        );

        this.scroll(x, y, !_.isUndefined(opts) ? opts : (x || null));

        return this;
    },

    centerContent: function(opts) {

        var vbox = V(this.options.paper.viewport).bbox(true, this.options.paper.svg);
        this.center(vbox.x + vbox.width / 2, vbox.y + vbox.height / 2, opts);

        return this;
    },

    centerElement: function(element) {

        this.checkElement(element, 'centerElement');
        var center = element.getBBox().center();
        return this.center(center.x, center.y);
    },

    // less aggresive then center as it only changes position of scrollbars
    // without adding paddings - it wont actually move view onto the position
    // if there isn't enough room for it!
    // optionally you can specify `animation` key in option argument
    // to make the scroll animated; object is passed into $.animate
    scroll: function(x, y, opt) {

        var ctm = this.options.paper.viewport.getCTM();

        var change = {};

        if (_.isNumber(x)) {
            var cx = this.el.clientWidth / 2;
            change['scrollLeft'] = x - cx + ctm.e + this._padding.left;
        }

        if (_.isNumber(y)) {
            var cy = this.el.clientHeight / 2;
            change['scrollTop'] = y - cy + ctm.f + this._padding.top;
        }

        if (opt && opt.animation) {
            this.$el.animate(change, opt.animation);
        } else {
            this.$el.prop(change);
        }
    },

    // simple wrapper around scroll method that finds center of specified
    // element and scrolls to it
    // it's possible to pass in opts object that is used in scroll() method (eg. animation)
    scrollToElement: function(element, opts) {

        this.checkElement(element, 'scrollToElement');

        var center = element.getBBox().center();
        var sx = this._sx;
        var sy = this._sy;

        center.x *= sx;
        center.y *= sy;

        return this.scroll(center.x, center.y, opts);
    },

    // Position the paper inside the paper wrapper and resize the wrapper.
    addPadding: function(left, right, top, bottom) {

        var base = this.getPadding();

        var padding = this._padding = {
            left: Math.round(base.left + (left || 0)),
            top: Math.round(base.top + (top || 0)),
            bottom: Math.round(base.bottom + (bottom || 0)),
            right: Math.round(base.right + (right || 0))
        };

        this.$background.css({
            width: padding.left + this.options.paper.options.width + padding.right,
            height: padding.top + this.options.paper.options.height + padding.bottom
        });
        this.options.paper.$el.css({
            left: padding.left,
            top: padding.top
        });

        return this;
    },

    zoom: function(value, opt) {

        opt = opt || {};

        var center = this.toLocalPoint(this.el.clientWidth / 2, this.el.clientHeight / 2);
        var sx = value;
        var sy = value;
        var ox;
        var oy;

        if (!opt.absolute) {
            sx += this._sx;
            sy += this._sy;
        }

        if (opt.grid) {
            sx = Math.round(sx / opt.grid) * opt.grid;
            sy = Math.round(sy / opt.grid) * opt.grid;
        }

        // check if the new scale won't exceed the given boundaries
        if (opt.max) {
            sx = Math.min(opt.max, sx);
            sy = Math.min(opt.max, sy);
        }

        if (opt.min) {
            sx = Math.max(opt.min, sx);
            sy = Math.max(opt.min, sy);
        }

        if (_.isUndefined(opt.ox) || _.isUndefined(opt.oy)) {

            // if the origin is not specified find the center of the paper's visible area.
            ox = center.x;
            oy = center.y;

        } else {

            var fsx = sx / this._sx;
            var fsy = sy / this._sy;

            ox = opt.ox - ((opt.ox - center.x) / fsx);
            oy = opt.oy - ((opt.oy - center.y) / fsy);
        }

        this.beforePaperManipulation();

        this.options.paper.scale(sx, sy);
        this.center(ox, oy);

        this.afterPaperManipulation();

        return this;
    },

    zoomToFit: function(opt) {

        opt = opt || {};

        var paper = this.options.paper;
        var paperOrigin = _.clone(paper.options.origin);

        // fitting bbox has exact size of the the PaperScroller
        opt.fittingBBox = opt.fittingBBox || _.extend({}, g.point(paperOrigin), {
            width: this.$el.width(),
            height: this.$el.height()
        });

        this.beforePaperManipulation();

        // scale the vieport
        paper.scaleContentToFit(opt);

        // restore original origin
        paper.setOrigin(paperOrigin.x, paperOrigin.y);

        this.adjustPaper().centerContent();

        this.afterPaperManipulation();

        return this;
    },

    startPanning: function(evt) {

        evt = joint.util.normalizeEvent(evt);

        this._clientX = evt.clientX;
        this._clientY = evt.clientY;

        this.$el.addClass('is-panning');
        this.trigger('pan:start', evt);

        $(document.body).on({
            'mousemove.panning touchmove.panning': this.pan,
            'mouseup.panning touchend.panning': this.stopPanning
        });

        $(window).on('mouseup.panning', this.stopPanning);
    },

    pan: function(evt) {

        evt = joint.util.normalizeEvent(evt);

        var dx = evt.clientX - this._clientX;
        var dy = evt.clientY - this._clientY;

        this.el.scrollTop -= dy;
        this.el.scrollLeft -= dx;

        this._clientX = evt.clientX;
        this._clientY = evt.clientY;
    },

    stopPanning: function(evt) {

        $(document.body).off('.panning');
        $(window).off('.panning');
        this.$el.removeClass('is-panning');
        this.trigger('pan:stop', evt);
    },

    getPadding: function() {

        var padding = this.options.padding;
        if (_.isFunction(padding)) {
            padding = padding.call(this);
        }

        return joint.util.normalizeSides(padding);
    },

    getVisibleArea: function() {

        var ctm = this.options.paper.viewport.getCTM();
        var area = {
            x: this.el.scrollLeft || 0,
            y: this.el.scrollTop || 0,
            width: this.el.clientWidth,
            height: this.el.clientHeight
        };

        var transformedArea = V.transformRect(area, ctm.inverse());

        transformedArea.x -= (this._padding.left || 0) / this._sx;
        transformedArea.y -= (this._padding.top || 0) / this._sy;

        return g.rect(transformedArea);
    },

    isElementVisible: function(element, opt) {

        this.checkElement(element, 'isElementVisible');

        opt = opt || {};
        var method = opt.strict ? 'containsRect' : 'intersect';
        return !!this.getVisibleArea()[method](element.getBBox());
    },

    isPointVisible: function(point) {

        return this.getVisibleArea().containsPoint(point);
    },

    // some method require element only because link is missing some tools (eg. bbox)
    checkElement: function(element, methodName) {

        if (!(element && element instanceof joint.dia.Element)) {
            throw new TypeError('ui.PaperScroller.' + methodName + '() accepts instance of joint.dia.Element only');
        }
    },

    onRemove: function() {

        this.stopPanning();
    }

});
