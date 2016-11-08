/*! Rappid v2.0.0 - HTML5 Diagramming Framework

Copyright (c) 2015 client IO

 2016-09-20 


This Source Code Form is subject to the terms of the Rappid Academic License
, v. 1.0. If a copy of the Rappid License was not distributed with this
file, You can obtain one at http://jointjs.com/license/rappid_academic_v1.txt
 or from the Rappid archive as was distributed by client IO. See the LICENSE file.*/


(function(joint, _) {
    'use strict';

    joint.ui.SVGFilterBuilder = joint.mvc.View.extend({
        className: 'svg-filter-builder',
        options: {
            stencil: {
                groups: {},
                shapes: {}
            },
            inspector: {
                groups: {},
                inputs: {}
            },
            toolbar: {}
        },

        init: function() {

            this.graph = null;
            this.paper = null;
            this.paperScroller = null;
            this.stencil = null;

            this.graph = new joint.dia.Graph;
            this.paper = new joint.dia.Paper({
                width: 900,
                height: 1000,
                linkPinning: false,
                model: this.graph,
                defaultRouter: { name: 'normal' },
                defaultConnector: { name: 'rounded' },
                perpendicularLinks: true,
                multiLinks: false,
                defaultLink: new joint.dia.Link({
                    markup: [
                        '<path class="connection" stroke="black" d="M 0 0 0 0"/>',
                        '<path class="marker-source" fill="black" stroke="black" d="M 0 0 0 0"/>',
                        '<path class="marker-target" fill="black" stroke="black" d="M 0 0 0 0"/>',
                        '<path class="connection-wrap" d="M 0 0 0 0"/>',
                        '<g class="marker-vertices"/>',
                        '<g class="link-tools"/>'
                    ].join(''),
                    toolMarkup: [
                        '<g class="link-tool">',
                        '<g class="tool-remove" event="remove">',
                        '<circle r="11" />',
                        '<path transform="scale(.8) translate(-16, -16)" d="M24.778,21.419 19.276,15.917 24.777,10.415 21.949,7.585 16.447,13.087 10.945,7.585 8.117,10.415 13.618,15.917 8.116,21.419 10.946,24.248 16.447,18.746 21.948,24.248z" />',
                        '<title>Remove link.</title>',
                        '</g>',
                        '</g>'
                    ].join(''),

                    smooth: false,
                    attrs: {
                        '.': { magnet: false },
                        '.connection': {
                            'stroke-width': 3,
                            stroke: '#f6f6f6'
                        },
                        '.marker-target': {
                            fill: '#000000',
                            stroke: '#f6f6f6',
                            'stroke-width': 2,
                            d: 'M 10 0 L 0 5 L 10 10 z'
                        }
                    }
                }),

                validateConnection: function(sourceView, sourceMagnet, targetView, targetMagnet, end, linkView) {

                    if (sourceView == targetView) {
                        return false;
                    }

                    var hasCycle = _.find(this.model.getSuccessors(targetView.model), function(cell) {
                        return cell.id === sourceView.model.id;
                    });

                    if (hasCycle) {
                        return false;
                    }

                    var portUsage = _.find(this.model.getLinks(), function(link) {

                        var targetHasPorts = targetView.model.get('inPorts') !== undefined;
                        var linkToTarget = link.id !== linkView.model.id && link.get('target').id === targetView.model.id;

                        if (targetHasPorts) {
                            return linkToTarget && link.get('target').port === targetMagnet.getAttribute('port');
                        } else {
                            return linkToTarget;
                        }
                    });

                    var portIsUsed = portUsage !== undefined;

                    return !portIsUsed;
                }
            });

            this.overlay = new DropOverlay({ className: 'svg-filter-builder drop-overlay' });

            this.commandManager = new joint.dia.CommandManager({ graph: this.graph });

            this.paperScroller = new joint.ui.PaperScroller({
                autoResizePaper: true,
                paper: this.paper
            });

            this.stencil = new joint.ui.Stencil({
                paperScroller: this.paperScroller,
                layout: {
                    columnWidth: 70,
                    columns: 2,
                    rowHeight: 65,
                    resizeToFit: false,
                    dy: 1,
                    dx: 1
                },
                groups: this.options.stencil.groups,
                // Remove tooltip definition from cloned element
                dragStartClone: function(cell) {
                    return cell.clone().removeAttr('./data-tooltip');
                }
            });

            var filterPreviewData = this.options['filter-preview'] || {};
            this.filterPreview = new FilterPreview({
                className: 'filter-preview',
                toolbar: filterPreviewData.toolbar
            });

            var originalPreviewData = this.options['original-preview'] || {};
            this.originalPreview = new FilterPreview({
                className: 'original-preview',
                toolbar: originalPreviewData.toolbar
            });

            this.keyboard = new joint.ui.Keyboard();
            this.clipboard = new joint.ui.Clipboard;
            this.selection = new joint.ui.Selection({ paper: this.paper });

            new joint.ui.Tooltip({
                rootTarget: document.body,
                target: '[data-tooltip]',
                direction: 'auto',
                padding: 10
            });

            this.result = new joint.shapes.basic.Circle({

                markup: '<g class="rotatable"><g class="scalable"><circle/></g><text/><circle class="magnet"/></g>',

                size: { width: 60, height: 60 },
                static: true,
                position: { x: 200, y: 600 },
                attrs: {
                    '.': {
                        magnet: false
                    },
                    '.magnet': {
                        magnet: 'passive',
                        fill: 'transparent'
                    },
                    text: {
                        text: 'result'
                    }
                }
            });

            this.sourceLayers = this.getSourceLayers();

            this.fio = new SVGFilterIO(this.sourceLayers, _.bind(function() {
                return this.paper.getDefaultLink();
            }, this));

            this.toolbar = new joint.ui.Toolbar({
                references: {
                    paperScroller: this.paperScroller,
                    commandManager: this.commandManager
                },
                tools: this.options.toolbar
            });

            this.bindEvents();
        },

        initializeKeyboardShortcuts: function() {

            this.keyboard.on({

                'ctrl+c': function() {

                    var nonStatic = _.filter(this.selection.collection.toArray(), function(element) {
                        return !element.prop('static');
                    });

                    this.selection.collection.reset(nonStatic);
                    // Copy all selected elements and their associated links.
                    this.clipboard.copyElements(this.selection.collection, this.graph);
                },

                'ctrl+v': function() {

                    var pastedCells = this.clipboard.pasteCells(this.graph, {
                        translate: { dx: 20, dy: 20 },
                        useLocalStorage: true
                    });

                    var elements = _.filter(pastedCells, function(cell) {
                        return cell.isElement();
                    });

                    // Make sure pasted elements get selected immediately. This makes the UX better as
                    // the user can immediately manipulate the pasted elements.
                    this.selection.collection.reset(elements);
                },

                'ctrl+x shift+delete': function() {
                    var nonStatic = _.filter(this.selection.collection.toArray(), function(element) {
                        return !element.prop('static');
                    });
                    this.selection.collection.reset(nonStatic);
                    this.clipboard.cutElements(this.selection.collection, this.graph);
                },

                'delete backspace': function(evt) {
                    var nonStatic = _.filter(this.selection.collection.toArray(), function(element) {
                        return !element.prop('static');
                    });

                    evt.preventDefault();
                    this.graph.removeCells(nonStatic);
                    this.selection.cancelSelection();
                },

                'ctrl+z': function() {
                    this.commandManager.undo();
                    this.selection.cancelSelection();
                },

                'ctrl+y': function() {
                    this.commandManager.redo();
                    this.selection.cancelSelection();
                },

                'ctrl+a': function() {
                    this.selection.collection.reset(this.graph.getElements());
                },

                'ctrl+plus': function(evt) {
                    evt.preventDefault();
                    this.paperScroller.zoom(0.2, { max: 5, grid: 0.2 });
                },

                'ctrl+minus': function(evt) {
                    evt.preventDefault();
                    this.paperScroller.zoom(-0.2, { min: 0.2, grid: 0.2 });
                }

            }, this);
        },

        initializeSelection: function() {

            // Initiate selecting when the user grabs the blank area of the paper while the Shift key is pressed.
            // Otherwise, initiate paper pan.
            this.paper.on('blank:pointerdown', function(evt, x, y) {

                if (this.keyboard.isActive('shift', evt)) {
                    this.selection.startSelecting(evt);
                } else {
                    this.selection.cancelSelection();
                    this.paperScroller.startPanning(evt, x, y);
                }

            }, this);

            this.paper.on('element:pointerdown', function(elementView, evt) {

                // Select an element if CTRL/Meta key is pressed while the element is clicked.
                if (this.keyboard.isActive('ctrl meta', evt)) {
                    this.selection.collection.add(elementView.model);
                }

            }, this);

            this.selection.on('selection-box:pointerdown', function(cellView, evt) {

                // Unselect an element if the CTRL/Meta key is pressed while a selected element is clicked.
                if (this.keyboard.isActive('ctrl meta', evt)) {
                    this.selection.collection.remove(cellView.model);
                }

            }, this);
        },

        getSourceLayers: function() {

            var sourceInputs = ['SourceGraphic', 'SourceAlpha', 'BackgroundImage', 'BackgroundAlpha', 'FillPaint', 'StrokePaint'];
            var cells = [];

            _.each(sourceInputs, function(item, index) {

                var cell = new joint.shapes.filter.Filter({
                    type: 'filter.Source',
                    static: true,
                    result: item,
                    size: { width: 40, height: 40 },
                    position: { x: 0, y: 100 * (index + 2) },
                    attrs: {
                        '.': {
                            magnet: false
                        },
                        '.circle-body': {
                            fill: '#c6c7e2', stroke: '#ffffff', 'stroke-width': 2
                        },
                        text: {
                            fill: '#ffffff', x: -10, y: 25, 'text-anchor': 'end', text: item
                        },
                        image: {
                            width: 0, height: 0
                        }
                    }
                });
                cells.push(cell);
            });

            return cells;
        },

        connectResult: function() {

            var sinks = _.difference(this.graph.getSinks(), this.sourceLayers);

            this.result.addTo(this.graph);

            if (sinks.length === 1) {

                // it's safe to connect result automatically - there is only one option
                var link = this.paper.getDefaultLink().set({
                    source: { id: sinks[0].id },
                    target: { id: this.result.id }
                });

                link.addTo(this.graph);
            }
        },

        setSvgFilter: function(filterMarkup) {

            this.graph.startBatch('layout');

            this.graph.resetCells([]);

            var cells = this.fio.markupToCells(filterMarkup);
            _.each(cells, function(cell) {
                this.graph.addCell(cell);
            }, this);

            this.connectResult();

            this.updateResult();
            this.layout();

            this.graph.stopBatch('layout');
        },

        layout: function() {

            joint.layout.DirectedGraph.layout(this.graph, {
                setLinkVertices: true,
                marginX: 50,
                marginY: 50,
                nodeSep: 300,
                edgeSep: 300,
                rankSep: 60
            });

            var sources = _.filter(this.graph.getCells(), function(item) {
                return item.get('type') === 'filter.Source';
            });

            _.each(sources, function(item, index) {
                if (this.graph.isSink(item)) {
                    item.set('position', { x: -100, y: 50 * index + 100 });
                }
            }, this);

            this.paperScroller.centerContent();
        },

        setSvgSource: function(svgMarkup) {

            this.originalPreview.setShape(svgMarkup);
            this.filterPreview.setShape(svgMarkup);
        },

        bindEvents: function() {

            this.graph.on('remove', this.updateResult, this);
            this.graph.on('add', this.updateResult, this);

            this.graph.on('change:source change:target', function(model) {
                var e = 'target' in model.changed ? 'target' : 'source';

                if ((model.previous(e).id && !model.get(e).id) || (!model.previous(e).id && model.get(e).id)) {
                    this.updateResult();
                }
            }, this);

            this.toolbar.on('export:pointerclick', this.showExportDialog, this);
            this.toolbar.on('import:pointerclick', this.showImportFilterDialog, this);
            this.toolbar.on('layout:pointerclick', this.layout, this);

            this.originalPreview.toolbar.on('import:pointerclick', this.showImportSvgDialog, this);

            this.overlay.on('filedropped', function(strContent, event) {

                var uploadAction = $(event.target).data('name');
                this.import(this.parseInput(strContent), uploadAction);
            }, this);

            this.initializeSelection();
            this.initializeKeyboardShortcuts();
            this.initializeHaloAndInspector();
        },

        showImportFilterDialog: function() {
            this.showImportDialog('filter');
        },

        showImportSvgDialog: function() {
            this.showImportDialog('svg');
        },

        showImportDialog: function(type) {

            this.keyboard.disable();

            var options = {
                parseContent: _.bind(function(data) {
                    return this.parseInput(data);
                }, this)
            };

            var availableDialogs = {
                'svg': function() {
                    options.headerText = 'Import SVG markup';
                    options.placeholderText = 'Paste markup containing SVG here.';
                    return new ImportSVGDialog(options);
                },
                'filter': function() {
                    return new ImportFilterDialog(options);
                }
            };

            var dialog = availableDialogs[type]().open();


            dialog.on('action:submit', _.bind(function(content) {
                this.import(content, type);
            }, this));

            dialog.on('action:close', this.keyboard.enable, this.keyboard);
            this.overlay.on('filedropped', dialog.close, dialog);
        },

        showExportDialog: function() {

            this.keyboard.disable();

            var data = this.filterPreview.exportFilter();
            var content = ['<svg xmlns="http://www.w3.org/2000/svg" version="1.1">', data, '</svg>'].join('');

            var header = $('<div/>').addClass('content-element');
            var footer = $('<div/>').addClass('content-element');

            var dialog = new joint.ui.Lightbox({
                className: 'dialog lightbox svg-filter-builder-dialog',
                content: [header, $('<textarea/>').text(content), footer]
            }).open();

            $('<h3/>').text('Export').appendTo(header);
            $('<h4/>').text('1. Copy this code and paste it into your html document').appendTo(header);

            $('<h4/>').text('2. Integrate filter into CSS').appendTo(footer);
            $('<pre/>').text('.filtered {\n\t-webkit-filter: url("#filterId");\n\tfilter: url(#filterId);\n}').appendTo(footer);
            $('<h4/>').text('3. Apply filter').appendTo(footer);
            $('<pre/>').text('<span class="filtered">Hello!</span>').appendTo(footer);

            dialog.on('action:close', function() {
                this.keyboard.enable();
            }, this);
            this.overlay.on('filedropped', dialog.close, dialog);
        },

        parseInput: function(content) {

            return new SvgDom().findByTagName($(content), ['svg', 'filter']);
        },

        /**
         * @private
         * @param {Object<string. jQuery>} parsedContent
         * @param {string} action
         */
        import: function(parsedContent, action) {

            var fit = { padding: 20 };
            var $filter = parsedContent['filter'][0];
            var $svg = parsedContent['svg'][0];

            if (action === 'filter') {

                this.setSvgFilter($filter);
                this.filterPreview.paperScroller.zoomToFit(fit);
            }

            if (action === 'svg') {
                if ($filter) {
                    $filter.empty();
                }

                this.setSvgSource($svg);

                this.filterPreview.paperScroller.zoomToFit(fit);
                this.originalPreview.paperScroller.zoomToFit(fit);
            }
        },

        dummyDfs: function(element, iteratee, opt, _distance) {

            opt = opt || {};
            var distance = _distance || 0;
            if (iteratee(element, distance) === false) return;

            _.each(this.graph.getNeighbors(element, opt), function(neighbor) {
                this.dummyDfs(neighbor, iteratee, opt, distance + 1);
            }, this);
        },

        processGraph: function() {

            var start = this.result;
            var filters = [];
            var filterMap = {};

            this.dummyDfs(start, _.bind(function(element, distance) {

                if (_.contains(element.get('type'), 'filter.')) {

                    if (filterMap[element.id] === undefined) {
                        filterMap[element.id] = [0, element.exportSvg(this.graph)];
                    }

                    filterMap[element.id][0] = Math.max(filterMap[element.id][0], distance);
                }

            }, this), { inbound: true });

            var sortedFilterMap = _.sortBy(filterMap, function(item) {
                return -item[0];
            });

            _.each(sortedFilterMap, function(item) {
                filters.push(item[1]);
            });

            return filters;
        },

        initializeHaloAndInspector: function() {

            this.paper.on('element:pointerup', function(cellView) {

                if (this.selection.collection.contains(cellView.model)) {
                    return;
                }

                var halo = new joint.ui.Halo({ cellView: cellView, type: 'toolbar' });

                halo.removeHandle('resize');
                halo.removeHandle('fork');
                halo.removeHandle('rotate');
                halo.changeHandle('clone', { position: 'se' });

                if (cellView.model.prop('static')) {
                    halo.removeHandle('remove');
                    halo.removeHandle('clone');
                }

                if (cellView.model === this.result) {
                    halo.removeHandle('link');
                }

                if (cellView.model.get('type') === 'filter.FeComposite') {
                    halo.addHandle({ name: 'switchInputs' });
                    halo.on('action:switchInputs:pointerdown', function(evt) {
                        var element = cellView.model;

                        this.graph.startBatch('switch-inputs');
                        var links = this.graph.getConnectedLinks(element, { inbound: true });
                        _.each(links, function(link) {
                            var target = link.get('target');
                            if (target.port) {
                                link.prop('target/port', target.port === 'IN' ? 'IN2' : 'IN');
                            }
                        }, this);

                        this.graph.stopBatch('switch-inputs');
                        this.updateResult();

                    }, this);
                }
                halo.render();

                this.createInspector(cellView);

                this.selection.collection.reset([]);
                this.selection.collection.add(cellView.model, { silent: true });
            }, this);
        },

        createInspector: function(cellView) {

            var data = this.options.inspector[cellView.model.get('type')] || {};

            this.inspector = joint.ui.Inspector.create(this.inspectorPlaceholder, {
                inputs: data.inputs,
                groups: data.groups,
                cell: cellView.model
            });

            this.inspector.on('all', this.updateResult, this);
        },

        render: function() {

            this.stencil.render().$el.appendTo(this.$el);

            var pap = $('<div/>').addClass('filter-graph').appendTo(this.$el);
            this.paperScroller.$el.appendTo(pap);
            this.toolbar.render().$el.appendTo(pap);

            this.inspectorPlaceholder = $('<div/>').addClass('inspector-container').appendTo(pap);

            var res = $('<div/>').addClass('result').appendTo(this.$el);

            this.originalPreview.render().$el.appendTo(res);
            this.filterPreview.render().$el.appendTo(res);

            return this;
        },

        updateResult: function() {

            if (this.timeout) {
                clearTimeout(this.timeout);
            }

            this.timeout = setTimeout(_.bind(function() {
                var filterData = this.processGraph();
                this.filterPreview.setFilter(filterData);
            }, this), 50);
        },

        onRender: function() {

            this.filterPreview.onRender();
            this.originalPreview.onRender();

            this.commandManager.stopListening();
            this.graph.resetCells(this.sourceLayers);
            this.graph.addCell(this.result);
            this.commandManager.listen();

            this.stencil.load(this.options.stencil.shapes);
            this.paperScroller.center();

            this.overlay.render().$el.appendTo(document.body);
        }
    });

    var SvgDom = function() {

    };

    SvgDom.prototype = {

        constructor: SvgDom,

        convertToMarkup: function(data) {

            if (!data) {
                return '';
            }

            if (_.isString(data)) {
                return data;
            }

            if (_.isArray(data)) {
                var ret = [];
                _.each(data, function(item) {
                    if (item) {
                        ret.push(this.convertElementToMarkup(item));
                    }
                }, this);

                return ret.join('');
            }

            return this.convertElementToMarkup(data);
        },

        /**
         * @param {jQuery} $content
         * @param {Array<string>} tags
         * @param {Object=} result
         * @returns {Object<string, Array<jQuery>>}
         */
        findByTagName: function($content, tags, result) {

            tags = tags || [];

            if (!result) {
                result = {};
                _.each(tags, function(tag) {
                    result[tag.toLowerCase()] = [];
                });
            }

            $content.each(_.bind(function(index, value) {

                var $filterElement = $(value);
                var tagName = ($filterElement.prop('tagName') || '').toLowerCase();
                if (result[tagName]) {
                    result[tagName].push($filterElement);
                }

                _.each($filterElement.children(), function(item) {
                    this.findByTagName($(item), tags, result);
                }, this);
            }, this));

            return result;
        },

        /**
         * @private
         * @param data
         * @returns {string}
         */
        convertElementToMarkup: function(data) {

            var attrs = [''];
            if (data.attrs) {
                _.each(data.attrs, function(value, key) {
                    if (value) {
                        attrs.push([key, '="', value, '"'].join(''));
                    }
                });
            }

            var result = [
                '<', data.tag, attrs.join(' '), '>',
                this.convertToMarkup(data.children),
                '</', data.tag, '>'
            ];

            return result.join('');
        }
    };

    var ImportFilterDialog = joint.mvc.View.extend({

        options: {
            placeholderText: 'Paste markup containing filter definition here.',
            headerText: 'Import Filter Definition',
            parseContent: function(data) {
                return {};
            }
        },

        open: function() {

            var content = '';
            var contentElement = $('<div/>').addClass('content-element');
            var header = $('<div/>').addClass('content-element');
            var filterSource = $('<textarea/>').text(content).prop('placeholder', this.options.placeholderText);
            var $info = $('<div/>');

            this.dialog = new joint.ui.Lightbox({
                className: 'dialog lightbox svg-filter-builder-dialog',
                content: [header, filterSource, contentElement]
            }).open();

            var $ok = $('<button/>').text('OK');
            var $cancel = $('<button/>')
                .text('Cancel')
                .bind('click', _.bind(function() {
                    this.close();
                }, this));

            header.append($('<h3/>').text(this.options.headerText));

            contentElement.append($info);
            contentElement.append($cancel);
            contentElement.append($ok);

            this.bindEvents(filterSource, $ok, $info);
            return this.dialog;
        },

        close: function() {
            this.dialog.trigger('action:close');
            //this.dialog.close();
        },

        validate: function($okButton, $info) {

            var content = this.content;
            $info.empty();

            if (content['filter'].length === 0) {
                $okButton.prop('disabled', true);
                $info.append($('<h3/>').text('No filter found'));
            }

            if (content['filter'].length >= 1) {
                $okButton.prop('disabled', false);
                var $list = $('<ol/>');

                _.each(content['filter'], function(filter) {
                    $list.append($('<li/>').text(filter.prop('id') || '~name not available~'));
                });

                var suffix = '';
                if (content['filter'].length > 1) {
                    suffix = ', only first will be imported';
                }
                $info.append($('<h3/>').text('filter(s) found ' + suffix));
                $info.append($list);
            }
        },

        bindEvents: function($source, $ok, $info) {

            $ok.bind('click', _.bind(function() {
                this.dialog.trigger('action:submit', this.content);
                this.close();
            }, this));

            $source.bind('blur paste keydown', _.bind(function() {

                if (this.timeout) {
                    clearTimeout(this.timeout);
                }

                this.timeout = setTimeout(_.bind(function() {

                    this.content = this.options.parseContent($source.val());
                    this.validate($ok, $info);
                }, this), 200);
            }, this));
        }
    });

    var ImportSVGDialog = ImportFilterDialog.extend({

        validate: function($okButton, $info) {

            var content = this.content;
            $info.empty();

            if (content['svg'].length === 0) {
                $okButton.prop('disabled', true);
                $info.append($('<h3/>').text('No SVG content found'));
            }

            if (content['svg'].length >= 1) {
                $okButton.prop('disabled', false);
                $info.append($('<h3/>').text('SVG content found'));
            }
        }
    });

    var FilterPreview = joint.mvc.View.extend({

        className: 'filter-preview',
        options: {
            toolbar: {}
        },
        init: function() {

            this.markup = '<g></g>';
            this.graph = new joint.dia.Graph;
            this.paper = new joint.dia.Paper({
                width: 300,
                height: 200,
                model: this.graph
            });

            this.paperScroller = new joint.ui.PaperScroller({
                autoResizePaper: true,
                paper: this.paper
            });

            this.toolbar = new joint.ui.Toolbar({
                references: {
                    paperScroller: this.paperScroller
                },
                tools: this.options.toolbar
            });

            this.dom = new SvgDom();
        },

        render: function() {

            this.paperScroller.render().$el.appendTo(this.$el);
            this.toolbar.render().$el.appendTo(this.$el);
            return this;
        },

        onRender: function() {

            this.shape = new joint.shapes.basic.Generic({
                markup: this.markup
            });

            this.graph.addCell(this.shape);

            this.update();
        },

        resolveShapeContent: function($markup) {
            return $markup.prop('tagName').toLowerCase() === 'svg' ? $markup[0].innerHTML : $markup[0].outerHTML;
        },

        setShape: function(markup) {
            this.markup = _.isString(markup) ? markup : this.resolveShapeContent(markup);
            this.update();
        },

        setFilter: function(filterData) {

            this.filterData = filterData || [];
            this.update();
        },

        exportFilter: function() {

            var filtersMarkups = [];
            _.each(this.filterData, function(filter) {
                filtersMarkups.push(this.dom.convertToMarkup(filter));
            }, this);

            var filter = [];

            if (filtersMarkups.length > 0) {
                filter.push('<defs><filter id="filterId">');
                filter.push(filtersMarkups.join(''));
                filter.push('</filter></defs>');
            }

            return filter.join('');
        },

        exportFilteredShape: function() {

            var filterMarkup = this.exportFilter();

            if (filterMarkup !== '') {
                return [
                    filterMarkup,
                    '<g filter = "url(#filterId)">', this.markup, '</g>'
                ].join('');
            }

            return ['<g>', this.markup, '</g>'].join('');
        },

        update: function() {

            this.shape.set('markup', this.exportFilteredShape());

            var view = this.paper.findViewByModel(this.shape);
            view.render();
        }
    });

    var DropOverlay = joint.mvc.View.extend({
        className: 'drop-overlay',

        init: function() {

            _.bindAll(this, 'handleDragOver', 'handleFileSelect', 'handleDragLeave', 'handleDragOverDropZone');
        },

        readFile: function(file, evt) {

            var reader = new FileReader();

            var self = this;
            // Closure to capture the file information.
            reader.onload = (function(theFile) {
                return function(e) {
                    var v = e.target.result.split(',')[1];
                    self.trigger('filedropped', atob(v), evt);
                };
            })(file);

            // Read in the image file as a data URL.
            reader.readAsDataURL(file);
        },

        handleFileSelect: function(evt) {

            this.readFile(evt.dataTransfer.files[0], evt);
            evt.stopPropagation();
            evt.preventDefault();

            this.$el.hide();
        },

        handleDragOver: function(evt) {

            clearTimeout(this.dndTimer);

            evt.stopPropagation();
            evt.preventDefault();

            this.$el.show();
        },

        handleDragLeave: function(event) {

            var element = this.$el;

            this.dndTimer = setTimeout(function() {
                event.stopPropagation();
                element.hide();
            }, 300);
        },

        handleDragOverDropZone: function(event) {

            $(event.target).addClass('dragover');
            event.dataTransfer.dropEffect = 'copy';
            this.handleDragOver(event);
        },

        render: function() {

            var dropZonesDef = [
                {
                    name: 'filter',
                    text: 'import filter'
                },
                {
                    name: 'svg',
                    text: 'import svg shape'
                }
            ];

            var content = $('<div/>').addClass('content').append($('<h1/>').text('Drop it here')).appendTo(this.$el);

            _.each(dropZonesDef, function(item) {
                var element = $('<div/>')
                    .addClass('drop-zone')
                    .addClass(item.className || '')
                    .text(item.text)
                    .data('name', item.name).appendTo(content);
                element[0].addEventListener('drop', this.handleFileSelect, false);
                element[0].addEventListener('dragover', this.handleDragOverDropZone, false);
            }, this);

            this.$el.hide();

            var dropZone = $('body')[0];

            dropZone.addEventListener('dragover', this.handleDragOver, false);

            this.$el[0].addEventListener('dragleave', this.handleDragLeave, false);
            this.$el[0].addEventListener('dragover', this.handleDragOver, false);

            return this;
        }
    });

    var SVGFilterIO = function(sources, createLink) {
        this.map = {
            FEFLOOD: function() {
                return new joint.shapes.filter.FeFlood();
            },
            FEOFFSET: function() {
                return new joint.shapes.filter.FeOffset();
            },
            FECOMPOSITE: function() {
                return new joint.shapes.filter.FeComposite();
            },
            FEMERGE: function() {
                return new joint.shapes.filter.FeMerge();
            },
            FEGAUSSIANBLUR: function() {
                return new joint.shapes.filter.FeGaussianBlur();
            },
            FECONVOLVEMATRIX: function() {
                return new joint.shapes.filter.FeConvolveMatrix();
            },
            FECOLORMATRIX: function() {
                return new joint.shapes.filter.FeColorMatrix();
            },
            FETURBULENCE: function() {
                return new joint.shapes.filter.FeTurbulence();
            },
            FEMORPHOLOGY: function() {
                return new joint.shapes.filter.FeMorphology();
            }
        };

        this.createLinksCallback = createLink || function() {
            return new joint.dia.Link();
        };

        this.sources = sources;
    };

    SVGFilterIO.prototype = {

        constructor: SVGFilterIO,

        markupToCells: function(markup) {

            var filterParts = $(markup).find('filter').andSelf().children();
            var cells = [];
            var cellsMap = {};

            filterParts.each(_.bind(function(index, value) {

                var $filterElement = $(value);
                var tagName = $filterElement.prop('tagName').toUpperCase();

                if (!this.map[tagName]) {
                    throw new Error('SVGFilterIO: filter is not implemented ' + tagName);
                }

                var cell = this.map[tagName]();
                cell.importSvg(value);

                var inputs = cell.get('in') || [];
                if (_.isString(inputs)) {
                    inputs = [inputs];
                }

                cellsMap[cell.getResult()] = { cell: cell, inputs: inputs };
                cells.push(cell);

            }, this));

            _.each(this.sources, function(cell) {
                cellsMap[cell.getResult()] = { cell: cell, inputs: [] };
                cells.push(cell);
            });

            return cells.concat(this.createLinks(cellsMap));
        },

        createLinks: function(cellsMap) {

            var links = [];
            _.each(cellsMap, _.bind(function(value) {
                var cell = value.cell;
                var inputs = value.inputs;
                var inputsLength = inputs.length;
                var ports = inputsLength > 1 ? cell.get('inPorts') : null;

                for (var i = 0; i < inputsLength; i++) {

                    var input = inputs[i];
                    var linkTarget;

                    if (cellsMap[input]) {
                        linkTarget = { id: cell.id };

                        if (ports) {
                            if (!ports[i]) {
                                ports.push(i);
                            }
                            linkTarget.port = ports[i];
                        }

                        var link = this.createLinksCallback().set({
                            source: { id: cellsMap[input].cell.id, selector: '.circle-body' },
                            target: linkTarget
                        });

                        links.push(link);
                    }
                }
            }, this));

            return links;
        }
    };
}(joint, _));

