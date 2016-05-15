/*! Rappid v1.7.1 - HTML5 Diagramming Framework

Copyright (c) 2015 client IO

 2016-03-03 


This Source Code Form is subject to the terms of the Rappid Academic License
, v. 1.0. If a copy of the Rappid License was not distributed with this
file, You can obtain one at http://jointjs.com/license/rappid_academic_v1.txt
 or from the Rappid archive as was distributed by client IO. See the LICENSE file.*/


// SelectionView
// =============

// `SelectionView` implements selecting group of elements and moving the selected elements in one go.
// Typically, the selection will be bound to the `Shift` key
// and selecting/deselecting individual elements to the `Ctrl` key.

// Example usage:

// var graph = new joint.dia.Graph;
// var paper = new joint.dia.Paper({ model: graph });
// var selection = new Backbone.Collection;
// var selectionView = new joint.ui.SelectionView({ paper: paper, graph: graph, model: selection });

// // Bulk selecting group of elements by creating a rectangular selection area.
// paper.on('blank:pointerdown', selectionView.startSelecting);

// // Selecting individual elements with click and the `Ctrl`/`Command` key.
// paper.on('cell:pointerup', function(cellView, evt) {
//      if ((evt.ctrlKey || evt.metaKey) && !(cellView.model instanceof joint.dia.Link)) {
//              selection.add(cellView.model);
//              selectionView.createSelectionBox(cellView);
//      }
// });

// // Deselecting previously selected elements with click and the `Ctrl`/`Command` key.
// selectionView.on('selection-box:pointerdown', function(evt) {
//      if (evt.ctrlKey || evt.metaKey) {
//              var cell = selection.get($(evt.target).data('model'));
//              selection.reset(selection.without(cell));
//              selectionView.destroySelectionBox(paper.findViewByModel(cell));
//      }
// });

joint.ui.SelectionView = joint.mvc.View.extend({

    options: {

        paper: undefined,
        graph: undefined,
        boxContent: function(boxElement) {

            var tmpl =  _.template('<%= length %> elements selected.');
            return tmpl({ length: this.model.length });
        },
        handles: [
            { name: 'remove', position: 'nw', events: { pointerdown: 'removeElements' } },
            { name: 'rotate', position: 'sw', events: { pointerdown: 'startRotating', pointermove: 'doRotate', pointerup: 'stopBatch' } }
        ],
        useModelGeometry: false,
        strictSelection: false,
        rotateAngleGrid: 15
    },

    className: 'selection',

    events: {

        'mousedown .selection-box': 'startTranslatingSelection',
        'touchstart .selection-box': 'startTranslatingSelection',
        'mousedown .handle': 'onHandlePointerDown',
        'touchstart .handle': 'onHandlePointerDown'
    },

    init: function() {

        if (this.options.paper) {
            // Allow selectionView to be initialized with a paper only.
            _.defaults(this.options, { graph: this.options.paper.model });
        } else {
            throw new Error('SelectionView: paper required');
        }

        _.bindAll(this, 'startSelecting', 'stopSelecting', 'adjustSelection', 'pointerup');

        $(document.body).on('mousemove.selectionView touchmove.selectionView', this.adjustSelection);
        $(document).on('mouseup.selectionView touchend.selectionView', this.pointerup);

        this.listenTo(this.options.graph, 'reset', this.cancelSelection);
        this.listenTo(this.options.paper, 'scale translate', this.updateSelectionBoxes);
        this.listenTo(this.options.graph, 'remove change', function(cell, opt) {
            // Do not react on changes that happened inside the selectionView.
            if (!opt['selectionView_' + this.cid]) this.updateSelectionBoxes();
        });

        this.options.paper.$el.append(this.$el);

        // A counter of existing boxes. We don't want to update selection boxes on
        // each graph change when no selection boxes exist.
        this._boxCount = 0;

        this.$selectionWrapper = this.createSelectionWrapper();

        // Add handles.
        this.handles = [];
        _.each(this.options.handles, this.addHandle, this);
    },

    addHandle: function(opt) {

        this.handles.push(opt);

        var $handle = $('<div/>', {
            'class': 'handle ' + (opt.position || '') + ' ' + (opt.name || ''),
            'data-action': opt.name
        });
        if (opt.icon) {
            $handle.css('background-image', 'url(' + opt.icon + ')');
        }
        $handle.html(opt.content || '');
        this.$selectionWrapper.append($handle);

        _.each(opt.events, function(method, event) {

            if (_.isString(method)) {
                this.on('action:' + opt.name + ':' + event, this[method], this);
            } else {
                // Otherwise, it must be a function.
                this.on('action:' + opt.name + ':' + event, method);
            }

        }, this);

        return this;
    },

    removeHandle: function(name) {

        var handleIdx = _.findIndex(this.handles, { name: name });
        var handle = this.handles[handleIdx];
        if (handle) {

            _.each(handle.events, function(method, event) {
                this.off('action:' + name + ':' + event);
            }, this);

            this.$('.handle.' + name).remove();

            this.handles.splice(handleIdx, 1);
        }

        return this;
    },

    changeHandle: function(name, opt) {

        var handle = _.findWhere(this.handles, { name: name });
        if (handle) {

            this.removeHandle(name);
            this.addHandle(_.merge({ name: name }, handle, opt));
        }

        return this;
    },

    startTranslatingSelection: function(evt) {

        evt.stopPropagation();

        evt = joint.util.normalizeEvent(evt);

        this._action = 'translating';

        this.options.graph.trigger('batch:start');

        var snappedClientCoords = this.options.paper.snapToGrid(g.point(evt.clientX, evt.clientY));
        this._snappedClientX = snappedClientCoords.x;
        this._snappedClientY = snappedClientCoords.y;

        this.trigger('selection-box:pointerdown', evt);
    },

    startSelecting: function(evt) {

        evt = joint.util.normalizeEvent(evt);

        this.cancelSelection();

        this._action = 'selecting';

        this._clientX = evt.clientX;
        this._clientY = evt.clientY;

        // Normalize `evt.offsetX`/`evt.offsetY` for browsers that don't support it (Firefox).
        var paperElement = evt.target.parentElement || evt.target.parentNode;
        var paperOffset = $(paperElement).offset();
        var paperScrollLeft = paperElement.scrollLeft;
        var paperScrollTop = paperElement.scrollTop;

        this._offsetX = evt.offsetX === undefined ? evt.clientX - paperOffset.left + window.pageXOffset + paperScrollLeft : evt.offsetX;
        this._offsetY = evt.offsetY === undefined ? evt.clientY - paperOffset.top + window.pageYOffset + paperScrollTop : evt.offsetY;

        this.$el.css({ width: 1, height: 1, left: this._offsetX, top: this._offsetY }).show();
    },

    adjustSelection: function(evt) {

        evt = joint.util.normalizeEvent(evt);

        var dx;
        var dy;

        switch (this._action) {

            case 'selecting':

                dx = evt.clientX - this._clientX;
                dy = evt.clientY - this._clientY;

                var width = this.$el.width();
                var height = this.$el.height();
                var left = parseInt(this.$el.css('left'), 10);
                var top = parseInt(this.$el.css('top'), 10);

                this.$el.css({
                    left: dx < 0 ? this._offsetX + dx : left,
                    top: dy < 0 ? this._offsetY + dy : top,
                    width: Math.abs(dx),
                    height: Math.abs(dy)
                });
                break;

            case 'translating':

                var snappedClientCoords = this.options.paper.snapToGrid(g.point(evt.clientX, evt.clientY));
                var snappedClientX = snappedClientCoords.x;
                var snappedClientY = snappedClientCoords.y;

                dx = snappedClientX - this._snappedClientX;
                dy = snappedClientY - this._snappedClientY;

                if (dx || dy) {

                    // This hash of flags makes sure we're not adjusting vertices of one link twice.
                    // This could happen as one link can be an inbound link of one element in the selection
                    // and outbound link of another at the same time.
                    var processedCells = {};

                    this.model.each(function(element) {

                        // TODO: snap to grid.

                        if (processedCells[element.id]) return;

                        // Make sure that selectionView won't update itself when not necessary
                        var opt = {};
                        opt['selectionView_' + this.cid] = true;

                        // Translate the element itself.
                        element.translate(dx, dy, opt);

                        _.each(element.getEmbeddedCells({ deep: true }), function(embed) {
                        processedCells[embed.id] = true;
                    });

                        // Translate link vertices as well.
                        var connectedLinks = this.options.graph.getConnectedLinks(element);

                        _.each(connectedLinks, function(link) {

                            if (processedCells[link.id]) return;

                            link.translate(dx, dy, opt);

                            processedCells[link.id] = true;
                        });

                    }, this);

                    if (!this.boxesUpdated) {

                        var paperScale = V(this.options.paper.viewport).scale();

                        // Translate each of the `selection-box` amd `selection-wrapper`.
                        this.$el.children('.selection-box').add(this.$selectionWrapper)
                            .css({
                                left: '+=' + (dx * paperScale.sx),
                                top: '+=' + (dy * paperScale.sy)
                            });

                    } else if (this.model.length > 1) {

                        // If there is more than one cell in the selection, we need to update
                        // the selection boxes again. e.g when the first element went over the
                        // edge of the paper, a translate event was triggered, which updated the selection
                        // boxes. After that all remaining elements were translated but the selection
                        // boxes stayed unchanged.
                        this.updateSelectionBoxes();
                    }

                    this._snappedClientX = snappedClientX;
                    this._snappedClientY = snappedClientY;
                }

                this.trigger('selection-box:pointermove', evt);
                break;

            default:
                if (this._action) {
                    this.pointermove(evt);
                }
                break;
        }

        this.boxesUpdated = false;
    },

    stopSelecting: function(evt) {

        switch (this._action) {

            case 'selecting':

                var offset = this.$el.offset();
                var width = this.$el.width();
                var height = this.$el.height();
                var paper = this.options.paper;

                // Convert offset coordinates to the local point of the <svg> root element viewport.
                var localPoint = V(paper.viewport).toLocalPoint(offset.left, offset.top);

                // Take page scroll into consideration.
                localPoint.x -= window.pageXOffset;
                localPoint.y -= window.pageYOffset;

                // Convert width and height to take current viewport scale into account
                var paperScale = V(paper.viewport).scale();
                width /= paperScale.sx;
                height /= paperScale.sy;

                var selectedArea = g.rect(localPoint.x, localPoint.y, width, height);
                var elementViews = this.getElementsInSelectedArea(selectedArea);

                var filter = this.options.filter;
                if (_.isArray(filter)) {

                    elementViews = _.reject(elementViews, function(view) {
                        return _.contains(filter, view.model) || _.contains(filter, view.model.get('type'));
                    });

                } else if (_.isFunction(filter)) {

                    elementViews = _.reject(elementViews, function(view) {
                        return filter(view.model);
                    });
                }

                this.model.reset(_.pluck(elementViews, 'model'), { ui: true });

                if (elementViews.length) {

                    // Create a `selection-box` `<div>` for each element covering its bounding box area.
                    _.each(elementViews, this.createSelectionBox, this);

                    // The root element of the selection switches `position` to `static` when `selected`. This
                    // is neccessary in order for the `selection-box` coordinates to be relative to the
                    // `paper` element, not the `selection` `<div>`.
                    this.$el.addClass('selected');

                } else {

                    // Hide the selection box if there was no element found in the area covered by the
                    // selection box.
                    this.$el.hide();
                }

                break;

            case 'translating':

                this.options.graph.trigger('batch:stop');
                this.trigger('selection-box:pointerup', evt);
                // Everything else is done during the translation.
                break;

            default:
                // Hide selection if the user clicked somehwere else in the document.
                if (!this._action) {
                    this.cancelSelection();
                }
                break;
        }

        delete this._action;
    },

    getElementsInSelectedArea: function(selectedArea) {

        var paper = this.options.paper;

        var filterOpt = {
            strict: this.options.strictSelection
        };

        if (this.options.useModelGeometry) {
            var models = paper.model.findModelsInArea(selectedArea, filterOpt);
            return _.filter(_.map(models, paper.findViewByModel, paper));
        }

        return paper.findViewsInArea(selectedArea, filterOpt);
    },

    pointerup: function(evt) {

        if (!this._action) return;

        this.triggerAction(this._action, 'pointerup', evt);
        this.stopSelecting();

        delete this._action;
    },

    cancelSelection: function() {

        this.destroyAllSelectionBoxes();
        this.model.reset([], { ui: true });
        this.updateSelectionWrapper();
    },

    destroyAllSelectionBoxes: function() {

        this.$el.hide().children('.selection-box').remove();
        this.$el.removeClass('selected');
        this._boxCount = 0;
        this.updateSelectionWrapper();
    },

    destroySelectionBox: function(elementView) {

        this.$('[data-model="' + elementView.model.get('id') + '"]').remove();

        if (this.$el.children('.selection-box').length === 0) {
            this.$el.hide().removeClass('selected');
        }

        this._boxCount = Math.max(0, this._boxCount - 1);

        this.updateSelectionWrapper();
    },

    createSelectionBox: function(elementView) {

        var viewBbox = elementView.getBBox({ useModelGeometry: this.options.useModelGeometry });

        var $selectionBox = $('<div/>', { 'class': 'selection-box', 'data-model': elementView.model.get('id') });
        $selectionBox.css({ left: viewBbox.x, top: viewBbox.y, width: viewBbox.width, height: viewBbox.height });
        this.$el.append($selectionBox);

        this.$el.addClass('selected').show();

        this._boxCount++;

        this.updateSelectionWrapper();
    },

    createSelectionWrapper: function() {

        var $selectionWrapper = $('<div/>', { 'class': 'selection-wrapper' });
        var $box = $('<div/>', { 'class': 'box' });
        $selectionWrapper.append($box);
        $selectionWrapper.attr('data-selection-length', this.model.length);
        this.$el.prepend($selectionWrapper);
        return $selectionWrapper;
    },

    updateSelectionWrapper: function() {

        // Find the position and dimension of the rectangle wrapping
        // all the element views.
        var origin = { x: Infinity, y: Infinity };
        var corner = { x: 0, y: 0 };

        this.model.each(function(cell) {

            var view = this.options.paper.findViewByModel(cell);
            if (view) {
                var bbox = view.getBBox({ useModelGeometry: this.options.useModelGeometry });
                origin.x = Math.min(origin.x, bbox.x);
                origin.y = Math.min(origin.y, bbox.y);
                corner.x = Math.max(corner.x, bbox.x + bbox.width);
                corner.y = Math.max(corner.y, bbox.y + bbox.height);
            }
        }, this);

        this.$selectionWrapper.css({
            left: origin.x,
            top: origin.y,
            width: (corner.x - origin.x),
            height: (corner.y - origin.y)
        }).attr('data-selection-length', this.model.length);

        if (_.isFunction(this.options.boxContent)) {

            var $box = this.$('.box');
            var content = this.options.boxContent.call(this, $box[0]);

            // don't append empty content. (the content might had been created inside boxContent()
            if (content) {
                $box.html(content);
            }
        }
    },

    updateSelectionBoxes: function() {

        if (!this._boxCount) return;

        var $selectionBoxes = this.$el.hide().removeClass('selected').children('.selection-box');

        _.each($selectionBoxes, function(element) {

            var removedId = $(element).remove().attr('data-model');

            // try to find an element with the same id in the selection collection and
            // find the view for this model.
            var removedModel = this.model.get(removedId);
            var view = removedModel && this.options.paper.findViewByModel(removedModel);

            if (view) {
                // The view doesn't need to exist on the paper anymore as we use this method
                // as a handler for element removal.
                this.createSelectionBox(view);
            }

        }, this);

        this.updateSelectionWrapper();

        // When an user drags selection boxes over the edge of the paper and the paper gets resized,
        // we update the selection boxes here (giving them exact position) and we do not want
        // the selection boxes to be shifted again based on the mousemove.
        // See adjustSelection() method.
        this.boxesUpdated = true;
    },

    onRemove: function() {

        $(document.body).off('.selectionView', this.adjustSelection);
        $(document).off('.selectionView', this.pointerup);
    },

    onHandlePointerDown: function(evt) {

        this._action = $(evt.target).closest('.handle').attr('data-action');
        if (this._action) {

            evt.preventDefault();
            evt.stopPropagation();
            evt = joint.util.normalizeEvent(evt);

            this._clientX = evt.clientX;
            this._clientY = evt.clientY;
            this._startClientX = this._clientX;
            this._startClientY = this._clientY;

            this.triggerAction(this._action, 'pointerdown', evt);
        }
    },

    pointermove: function(evt) {

        if (!this._action) return;

        var clientCoords = this.options.paper.snapToGrid({ x: evt.clientX, y: evt.clientY });
        var oldClientCoords = this.options.paper.snapToGrid({ x: this._clientX, y: this._clientY });

        var dx = clientCoords.x - oldClientCoords.x;
        var dy = clientCoords.y - oldClientCoords.y;

        this.triggerAction(this._action, 'pointermove', evt, dx, dy, evt.clientX - this._startClientX, evt.clientY - this._startClientY);

        this._clientX = evt.clientX;
        this._clientY = evt.clientY;
    },

    // Trigger an action on the SelectionView object. `evt` is a DOM event, `eventName` is an abstracted
    // JointJS event name (pointerdown, pointermove, pointerup).
    triggerAction: function(action, eventName, evt) {

        var args = Array.prototype.slice.call(arguments, 2);
        args.unshift('action:' + action + ':' + eventName);
        this.trigger.apply(this, args);
    },

    // Handle actions.
    removeElements: function(evt) {

        // Store cells before `cancelSelection()` resets the selection collection.
        var cells = this.model.models;
        this.cancelSelection();
        this.options.graph.trigger('batch:start');
        _.invoke(cells, 'remove');
        this.options.graph.trigger('batch:stop');
    },

    startRotating: function(evt) {

        this.options.graph.trigger('batch:start');

        var center = this.options.graph.getBBox(this.model.models).center();
        var clientCoords = this.options.paper.snapToGrid({ x: evt.clientX, y: evt.clientY });
        var initialAngles = _.transform(this.model.toArray(), function(res, element) {
            res[element.id] = g.normalizeAngle(element.get('angle') || 0);
        });

        this._rotation = {
            center: center,
            clientAngle: g.point(clientCoords).theta(center),
            initialAngles: initialAngles
        };
    },

    doRotate: function(evt, dx, dy, tx, ty) {

        var rotation = this._rotation;

        // Calculate an angle between the line starting at mouse coordinates, ending at the centre
        // of rotation and y-axis and deduct the angle from the start of rotation.
        var angleGrid = this.options.rotateAngleGrid;
        var clientCoords = this.options.paper.snapToGrid({ x: evt.clientX, y: evt.clientY });
        var theta = rotation.clientAngle - g.point(clientCoords).theta(rotation.center);

        this.model.each(function(element) {
            var newAngle = g.snapToGrid(rotation.initialAngles[element.id] + theta, angleGrid);
            element.rotate(newAngle, true, rotation.center);
        });
    },

    stopBatch: function() {

        this.options.graph.trigger('batch:stop');
    },

    // Return the current action of the SelectionView.
    // This can be one of:
    // 'translating' | 'selecting' or any custom action.
    // This is especially useful if you want to prevent from something happening
    // while the selection is taking place (e.g. in the 'selecting' state and you are
    // handling the mouseover event).
    getAction: function() {

        return this._action;
    }
});
