/*! Rappid v1.7.1 - HTML5 Diagramming Framework

Copyright (c) 2015 client IO

 2016-03-03 


This Source Code Form is subject to the terms of the Rappid Academic License
, v. 1.0. If a copy of the Rappid License was not distributed with this
file, You can obtain one at http://jointjs.com/license/rappid_academic_v1.txt
 or from the Rappid archive as was distributed by client IO. See the LICENSE file.*/


//  Snaplines plugin
//-------------------

// Snaplines plugin helps creating diagramms by snapping elements to better-looking positions
// (aligned with other elements) while they are dragged. It's an alternative to layout algorithms.

joint.ui.Snaplines = joint.mvc.View.extend({

    options: {
        paper: undefined,
        distance: 10
    },

    className: 'snaplines',

    init: function() {

        _.bindAll(this, 'hide');

        this.$horizontal = $('<div>').addClass('snapline horizontal').appendTo(this.el);
        this.$vertical = $('<div>').addClass('snapline vertical').appendTo(this.el);

        this.$el.hide().appendTo(this.options.paper.el);

        this.startListening();
    },

    startListening: function() {

        this.stopListening();

        this.listenTo(this.options.paper, 'cell:pointerdown', this.captureCursorOffset);
        this.listenTo(this.options.paper, 'cell:pointermove', this.snapWhileMoving);
        this.listenTo(this.options.paper.model, 'batch:stop', this.onBatchStop);

        $(document).on('mouseup', this.hide);

        // Cache filters and make tham a hash table for easier and faster access.
        // `options.filter` can contain either strings in which case they are considered
        // cell types that should be filtered out or objects in which case they must
        // be cells that should be filtered out from snapping. Alternatively,
        // `options.filter` can be a function that is passed an element and must
        // return `true` if the element should be filtered out of the snapping.
        this.filterTypes = {};
        this.filterCells = {};
        this.filterFunction = undefined;

        if (_.isArray(this.options.filter)) {

            _.each(this.options.filter, function(item) {

                if (_.isString(item)) {
                    this.filterTypes[item] = true;
                } else {
                    this.filterCells[item.id] = true;
                }

            }, this);

        } else if (_.isFunction(this.options.filter)) {

            this.filterFunction = this.options.filter;
        }
    },

    onBatchStop: function(opt) {

        opt = opt || {};

        if (opt.batchName === 'resize') {

            this.snapWhileResizing(opt.element, opt);
        }
    },

    captureCursorOffset: function(cellView, evt, x, y) {

        if (cellView instanceof joint.dia.LinkView) return;

        var cellPosition = cellView.model.get('position');

        // store the difference between top-left corner and pointer coordinates
        this._cursorOffset = {
            x: x - cellPosition.x,
            y: y - cellPosition.y
        };
    },

    snapWhileResizing: function(cell, opt) {

        if (!opt.ui || opt.snapped || !opt.direction || !opt.trueDirection) return;

        var cellView = this.options.paper.findViewByModel(cell);

        if (cellView instanceof joint.dia.LinkView) return;

        var cellBBox = cell.getBBox();
        var cellBBoxRotated = cellBBox.bbox(cell.get('angle'));
        var cellTopLeft = cellBBoxRotated.origin();
        var cellBottomRight = cellBBoxRotated.corner();
        var normalizedAngle = g.normalizeAngle(cell.get('angle'));
        var distance = this.options.distance;
        var vertical = null;
        var horizontal = null;

        // The vertical and horizontal lines to use when checking for snaplines.
        var cellLine = { vertical: 0, horizontal: 0 };

        if (opt.trueDirection.indexOf('right') !== -1) {
            cellLine.vertical = cellBottomRight.x;
        } else {
            cellLine.vertical = cellTopLeft.x;
        }

        if (opt.trueDirection.indexOf('bottom') !== -1) {
            cellLine.horizontal = cellBottomRight.y;
        } else {
            cellLine.horizontal = cellTopLeft.y;
        }

        _.find(this.options.paper.model.getElements(), function(snapElement) {

            if (
                snapElement.id === cell.id ||
                snapElement.isEmbeddedIn(cell) ||
                this.filterTypes[snapElement.get('type')] ||
                this.filterCells[snapElement.id] ||
                (this.filterFunction && this.filterFunction(snapElement))
            ) {
                return false;
            }

            var snapBBox = snapElement.getBBox().bbox(snapElement.get('angle'));
            var snapTopLeft = snapBBox.origin();
            var snapBottomRight = snapBBox.corner();

            var snapLinesByAxis = {
                vertical: [
                    snapTopLeft.x,
                    snapBottomRight.x
                ],
                horizontal: [
                    snapTopLeft.y,
                    snapBottomRight.y
                ]
            };

            _.each(snapLinesByAxis, function(snapLines, axis) {

                snapLines = _.map(snapLines, function(snapLine) {

                    return {
                        position: snapLine,
                        // Calculate the distance to each snapline.
                        distance: Math.abs(snapLine - cellLine[axis])
                    };
                });

                // Filter out snaplines that are too far away.
                snapLines = _.filter(snapLines, function(snapLine) {
                    return snapLine.distance < distance;
                });

                // Sort by distance.
                snapLines = _.sortBy(snapLines, function(snapLine1, snapLine2) {
                    return snapLine1.distance > snapLine2.distance ? 1 : (snapLine1.distance === snapLine2.distance ? 0 : -1);
                });

                snapLinesByAxis[axis] = snapLines;
            });

            if (_.isNull(vertical) && snapLinesByAxis.vertical.length > 0) {

                vertical = snapLinesByAxis.vertical[0].position;
            }

            if (_.isNull(horizontal) && snapLinesByAxis.horizontal.length > 0) {

                horizontal = snapLinesByAxis.horizontal[0].position;
            }

            // keeps looking until all elements processed or both vertical and horizontal line found
            return _.isNumber(vertical) && _.isNumber(horizontal);

        }, this);

        this.hide();

        if (_.isNumber(vertical) || _.isNumber(horizontal)) {

            var diffX = 0;

            if (_.isNumber(vertical)) {

                if (opt.trueDirection.indexOf('right') !== -1) {
                    diffX = vertical - cellBBoxRotated.corner().x;
                } else {
                    diffX = cellBBoxRotated.origin().x - vertical;
                }
            }

            var diffY = 0;

            if (_.isNumber(horizontal)) {

                if (opt.trueDirection.indexOf('bottom') !== -1) {
                    diffY = horizontal - cellBBoxRotated.corner().y;
                } else {
                    diffY = cellBBoxRotated.origin().y - horizontal;
                }
            }

            var diffWidth = 0;
            var diffHeight = 0;
            var angle = (normalizedAngle % 90);
            var isAtRightAngle = !(normalizedAngle % 90);

            // See:
            // https://www.mathsisfun.com/algebra/trig-four-quadrants.html
            var quadrant;

            if (normalizedAngle >= 0 && normalizedAngle < 90) {
                quadrant = 1;
            } else if (normalizedAngle >= 90 && normalizedAngle < 180) {
                quadrant = 4;
            } else if (normalizedAngle >= 180 && normalizedAngle < 270) {
                quadrant = 3;
            } else {
                quadrant = 2;
            }

            if (isAtRightAngle) {

                if (normalizedAngle === 90 || normalizedAngle === 270) {

                    diffWidth = diffY;
                    diffHeight = diffX;

                } else {

                    diffWidth = diffX;
                    diffHeight = diffY;
                }

            } else {

                // A little bit more complicated.

                var angleInRadians = g.toRad(angle);

                if (horizontal && vertical) {

                    // Use only one of the snaplines.
                    // Pick the closest snapline.
                    if (diffY > diffX) {
                        diffY = 0;
                        horizontal = null;
                    } else {
                        diffX = 0;
                        vertical = null;
                    }
                }

                if (diffX) {
                    if (quadrant === 3) {
                        diffWidth = diffX / Math.cos(angleInRadians);
                    } else {
                        diffWidth = diffX / Math.sin(angleInRadians);
                    }
                }

                if (diffY) {
                    if (quadrant === 3) {
                        diffHeight = diffY / Math.cos(angleInRadians);
                    } else {
                        diffHeight = diffY / Math.sin(angleInRadians);
                    }
                }

                var isQuadrantOneOrThree = quadrant === 1 || quadrant === 3;

                switch (opt.relativeDirection) {

                    case 'top':
                    case 'bottom':

                        if (diffY) {
                            diffHeight = diffY / (isQuadrantOneOrThree ? Math.cos(angleInRadians) : Math.sin(angleInRadians));
                        } else {
                            diffHeight = diffX / (isQuadrantOneOrThree ? Math.sin(angleInRadians) : Math.cos(angleInRadians));
                        }
                        break;

                    case 'left':
                    case 'right':

                        if (diffX) {
                            diffWidth = diffX / (isQuadrantOneOrThree ? Math.cos(angleInRadians) : Math.sin(angleInRadians));
                        } else {
                            diffWidth = diffY / (isQuadrantOneOrThree ? Math.sin(angleInRadians) : Math.cos(angleInRadians));
                        }
                        break;
                }
            }

            switch (opt.relativeDirection) {

                case 'top':
                case 'bottom':
                    // Keep the width the same.
                    diffWidth = 0;
                    break;

                case 'left':
                case 'right':
                    // Keep the height the same.
                    diffHeight = 0;
                    break;
            }

            var newWidth = cellBBox.width + diffWidth;
            var newHeight = cellBBox.height + diffHeight;

            cell.resize(newWidth, newHeight, {
                restrictedArea: this.options.paper.getRestrictedArea(cellView),
                snapped: true,
                direction: opt.direction,
                relativeDirection: opt.relativeDirection,
                trueDirection: opt.trueDirection
            });

            this.show({ vertical: vertical, horizontal: horizontal });
        }
    },

    snapWhileMoving: function(cellView, evt, x, y) {

        if (cellView instanceof joint.dia.LinkView) return;

        var cell = cellView.model;
        var currentPosition = cell.get('position');
        var currentSize = cell.get('size');
        var cellBBox = g.rect(_.extend({
            x: x - this._cursorOffset.x,
            y: y - this._cursorOffset.y
        }, currentSize));
        var cellCenter = cellBBox.center();
        var cellBBoxRotated = cellBBox.bbox(cell.get('angle'));
        var cellTopLeft = cellBBoxRotated.origin();
        var cellBottomRight = cellBBoxRotated.corner();

        var distance = this.options.distance;
        var vertical = null;
        var horizontal = null;
        var verticalFix = 0;
        var horizontalFix = 0;

        // find vertical and horizontal lines by comparing top-left, bottom-right and center bbox points
        _.find(this.options.paper.model.getElements(), function(snapElement) {

            if (
                snapElement === cell ||
                snapElement.isEmbeddedIn(cell) ||
                this.filterTypes[snapElement.get('type')] ||
                this.filterCells[snapElement.id] ||
                (this.filterFunction && this.filterFunction(snapElement))
            ) {
                return false;
            }

            var snapBBox = snapElement.getBBox().bbox(snapElement.get('angle'));
            var snapCenter = snapBBox.center();
            var snapTopLeft = snapBBox.origin();
            var snapBottomRight = snapBBox.corner();

            if (_.isNull(vertical)) {

                if (Math.abs(snapCenter.x - cellCenter.x) < distance) {
                    vertical = snapCenter.x;
                    verticalFix = 0.5;
                } else if (Math.abs(snapTopLeft.x - cellTopLeft.x) < distance) {
                    vertical = snapTopLeft.x;
                } else if (Math.abs(snapTopLeft.x - cellBottomRight.x) < distance) {
                    vertical = snapTopLeft.x;
                    verticalFix = 1;
                } else if (Math.abs(snapBottomRight.x - cellBottomRight.x) < distance) {
                    vertical = snapBottomRight.x;
                    verticalFix = 1;
                } else if (Math.abs(snapBottomRight.x - cellTopLeft.x) < distance) {
                    vertical = snapBottomRight.x;
                }
            }

            if (_.isNull(horizontal)) {

                if (Math.abs(snapCenter.y - cellCenter.y) < distance) {
                    horizontal = snapCenter.y;
                    horizontalFix = 0.5;
                } else if (Math.abs(snapTopLeft.y - cellTopLeft.y) < distance) {
                    horizontal = snapTopLeft.y;
                } else if (Math.abs(snapTopLeft.y - cellBottomRight.y) < distance) {
                    horizontal = snapTopLeft.y;
                    horizontalFix = 1;
                } else if (Math.abs(snapBottomRight.y - cellBottomRight.y) < distance) {
                    horizontal = snapBottomRight.y;
                    horizontalFix = 1;
                } else if (Math.abs(snapBottomRight.y - cellTopLeft.y) < distance) {
                    horizontal = snapBottomRight.y;
                }
            }

            // keeps looking until all elements processed or both vertical and horizontal line found
            return _.isNumber(vertical) && _.isNumber(horizontal);

        }, this);

        this.hide();

        if (_.isNumber(vertical) || _.isNumber(horizontal)) {

            if (_.isNumber(vertical)) {
                cellBBoxRotated.x = vertical - (verticalFix * cellBBoxRotated.width);
            }

            if (_.isNumber(horizontal)) {
                cellBBoxRotated.y = horizontal - (horizontalFix * cellBBoxRotated.height);
            }

            // find x and y of the unrotated cell
            var newCellCenter = cellBBoxRotated.center();
            var newX = newCellCenter.x - (cellBBox.width / 2);
            var newY = newCellCenter.y - (cellBBox.height / 2);

            cell.translate(newX - currentPosition.x, newY - currentPosition.y, {
                restrictedArea: this.options.paper.getRestrictedArea(cellView),
                snapped: true
            });

            this.show({ vertical: vertical, horizontal: horizontal });
        }
    },

    show: function(opt) {

        opt = opt || {};

        var ctm = this.options.paper.viewport.getCTM();

        if (opt.horizontal) {
            this.$horizontal.css('top', opt.horizontal * ctm.d + ctm.f).show();
        } else {
            this.$horizontal.hide();
        }

        if (opt.vertical) {
            this.$vertical.css('left', opt.vertical * ctm.a + ctm.e).show();
        } else {
            this.$vertical.hide();
        }

        this.$el.show();
    },

    hide: function() {

        this.$el.hide();
    },

    onRemove: function() {

        $(document).off('mouseup', this.hide);
    }
});
