/*! Rappid v2.0.0 - HTML5 Diagramming Framework

Copyright (c) 2015 client IO

 2016-09-20 


This Source Code Form is subject to the terms of the Rappid Academic License
, v. 1.0. If a copy of the Rappid License was not distributed with this
file, You can obtain one at http://jointjs.com/license/rappid_academic_v1.txt
 or from the Rappid archive as was distributed by client IO. See the LICENSE file.*/


var App = window.App || {};
var modelName = localStorage.getItem("globalName");

(function(_, joint) {

    'use strict';

    App.MainView = joint.mvc.View.extend({

        className: 'app',

        events: {
            'focus input[type="range"]': function(evt) { evt.target.blur(); }
        },

        init: function() {
            this.initializeDatabase();
            this.initializePaper();
            this.initializeStencil();
            this.initializeSelection();
            this.initializeHaloAndInspector();
            this.initializeValidator();
            this.initializeNavigator();
            this.initializeToolbar();
            this.initializeKeyboardShortcuts();
            this.initializeTooltips();
        },

        initializeDatabase: function() {
            this.graph = new joint.dia.Graph;
            this.graph.fireDB = firebase.database();
            this.graph.modelName = localStorage.getItem("globalName");
            this.graph.myChangeLock = false;
            function getModel(model) {
                if (app.graph.myChangeLock) {
                    console.log('my change');
                    app.graph.myChangeLock=false;
                    return;
                }
                app.graph.JSON = model;
                app.graph.fromJSON(app.graph.JSON);
            }
            this.graph.updateModel = function (modelName,graphJSON) {
                //this.fireDB.ref('/models/' + modelName).off();
                this.myChangeLock = true;
                this.fireDB.ref('/models/' + modelName).set(graphJSON);
                // this.fireDB.ref('/models/' + modelName).on('value', function(snapshot) { getModel(snapshot.val());});
            };
            _.bind(this.graph.updateModel, this.graph);
            if (modelName) {
               this.graph.fireDB.ref('/models/' + modelName).on('value', function(snapshot) { getModel(snapshot.val());});
            }
        },

        // Create a graph, paper and wrap the paper in a PaperScroller.
        initializePaper: function() {


            this.graph.updateJSON = function () {
                this.JSON = this.toJSON();
                console.log("updateJSON() --- Graph JSON updated!");
                this.updateModel(modelName,this.JSON);
                console.log("updateModel() --- Graph Model updated on DB!");
            };
            _.bind(this.graph.updateJSON, this.graph);

            this.graph.on('add', function(cell, collection, opt) {
                if (opt.stencil) this.createInspector(cell);
            }, this);

            this.commandManager = new joint.dia.CommandManager({ graph: this.graph });

            this.graph.on('add', this.graph.updateJSON, this.graph);
            this.graph.on('remove', this.graph.updateJSON, this.graph);
            this.graph.on('change:position', this.graph.updateJSON, this.graph);
            this.graph.on('change:attrs', this.graph.updateJSON, this.graph);
            this.graph.on('change:size', this.graph.updateJSON, this.graph);
            this.graph.on('change:angle', this.graph.updateJSON, this.graph);

            var paper = this.paper = new joint.dia.Paper({
                width: 1000,
                height: 1000,
                gridSize: 10,
                drawGrid: true,
                model: this.graph,
                defaultLink: new joint.shapes.opm.Link
            });

            paper.on('blank:mousewheel', _.partial(this.onMousewheel, null), this);
            paper.on('cell:mousewheel', this.onMousewheel, this);

            this.snaplines = new joint.ui.Snaplines({ paper: paper });

            var paperScroller = this.paperScroller = new joint.ui.PaperScroller({
                paper: paper,
                autoResizePaper: true,
                cursor: 'grab'
            });

            this.$('.paper-container').append(paperScroller.el);
            paperScroller.render().center();
        },

        // Create and populate stencil.
        initializeStencil: function() {

            var stencil = this.stencil = new joint.ui.Stencil({
                paper: this.paperScroller,
                snaplines: this.snaplines,
                scaleClones: true,
                width: 240,
                groups: App.config.stencil.groups,
                dropAnimation: true,
                groupsToggleButtons: true,
                search: {
                    '*': ['type', 'attrs/text/text', 'attrs/.label/text'],
                    'org.Member': ['attrs/.rank/text', 'attrs/.name/text']
                },
                // Use default Grid Layout
                layout: true,
                // Remove tooltip definition from clone
                dragStartClone: function(cell) {
                    return cell.clone().removeAttr('./data-tooltip');
                }
            });

            this.$('.stencil-container').append(stencil.el);
            stencil.render().load(App.config.stencil.shapes);
        },

        initializeKeyboardShortcuts: function() {

            this.keyboard = new joint.ui.Keyboard();
            this.keyboard.on({

                'ctrl+c': function() {
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
                    this.clipboard.cutElements(this.selection.collection, this.graph);
                },

                'delete backspace': function(evt) {
                    evt.preventDefault();
                    this.graph.removeCells(this.selection.collection.toArray());
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
                },

                'keydown:shift': function(evt) {
                    this.paperScroller.setCursor('crosshair');
                },

                'keyup:shift': function() {
                    this.paperScroller.setCursor('grab');
                }

            }, this);
        },

        initializeSelection: function() {

            this.clipboard = new joint.ui.Clipboard();
            this.selection = new joint.ui.Selection({ paper: this.paper });

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

            this.selection.on('selection-box:pointerdown', function(elementView, evt) {

                // Unselect an element if the CTRL/Meta key is pressed while a selected element is clicked.
                if (this.keyboard.isActive('ctrl meta', evt)) {
                    this.selection.collection.remove(elementView.model);
                }

            }, this);
        },

        createInspector: function(cell) {

            return joint.ui.Inspector.create('.inspector-container', _.extend({
                cell: cell
            }, App.config.inspector[cell.get('type')]));
        },

        initializeHaloAndInspector: function() {

            this.paper.on('element:pointerup link:options', function(cellView) {

                var cell = cellView.model;

                if (!this.selection.collection.contains(cell)) {

                    if (cell.isElement()) {

                        new joint.ui.FreeTransform({
                            cellView: cellView,
                            allowRotation: false,
                            preserveAspectRatio: !!cell.get('preserveAspectRatio'),
                            allowOrthogonalResize: cell.get('allowOrthogonalResize') !== false
                        }).render();

                        new joint.ui.Halo({
                            cellView: cellView,
                            type: 'toolbar',
                            handles: App.config.halo.handles

                        }).render();

                        this.selection.collection.reset([]);
                        this.selection.collection.add(cell, { silent: true });
                    }

                    this.createInspector(cell);
                }
            }, this);
        },

        initializeValidator: function() {

            this.validator = new joint.dia.Validator({commandManager: this.commandManager});
            opmRuleSet(this.validator, this.graph);

        },

        initializeNavigator: function() {

            var navigator = this.navigator = new joint.ui.Navigator({
                width: 240,
                height: 115,
                paperScroller: this.paperScroller,
                zoom: false
            });

            this.$('.navigator-container').append(navigator.el);
            navigator.render();
        },

        initializeToolbar: function() {

            var toolbar = this.toolbar = new joint.ui.Toolbar({
                groups: App.config.toolbar.groups,
                tools: App.config.toolbar.tools,
                references: {
                    paperScroller: this.paperScroller,
                    commandManager: this.commandManager
                }
            });

            toolbar.on({
                'svg:pointerclick': _.bind(this.openAsSVG, this),
                'png:pointerclick': _.bind(this.openAsPNG, this),
                'fullscreen:pointerclick': _.bind(joint.util.toggleFullScreen, joint.util, document.body),
                'load-model:pointerclick': _.bind(this.loadModel, this),
                'save-model:pointerclick': _.bind(this.saveModel, this),
                'layout:pointerclick': _.bind(this.layoutDirectedGraph, this),
                'snapline:change': _.bind(this.changeSnapLines, this),
                'clear:pointerclick': _.bind(this.graph.clear, this.graph),
                'print:pointerclick': _.bind(this.paper.print, this.paper),
                'grid-size:change': _.bind(this.paper.setGridSize, this.paper)
            });

            this.$('.toolbar-container').append(toolbar.el);
            toolbar.render();
        },

        loadModel: function(checked) {
            var models = this.graph.fireDB.ref('/models/');
            models.on("value", function(snapshot) {
                console.log(snapshot.val());
            }, function (error) {
                console.log("Error: " + error.code);
            });
        },

        saveModel: function(checked) {
            // var user = firebase.auth().currentUser;
            // this.modelName = '';
            // var dialog = new joint.ui.Dialog({
            //     width: 400,
            //     title: 'Save model as',
            //     content: '<b>Input model name</b><br><input type="text" name="model" id="input"><br>',
            //     buttons: [
            //         { action: 'model', content: 'Save' },
            //     ]
            // });
            //
            // dialog.on('action:model', function getName(dialog) {this.modelName=dialog.getElementById("input").value; dialog.close });
            // dialog.open();
            var modelName = prompt("Save model as:", "default");
            this.graph.fireDB.ref('models/' + modelName).set(this.graph.JSON);
            // open up the same listener for the saved model!!
        },

        changeSnapLines: function(checked) {

            if (checked) {
                this.snaplines.startListening();
                this.stencil.options.snaplines = this.snaplines;
            } else {
                this.snaplines.stopListening();
                this.stencil.options.snaplines = null;
            }
        },

        initializeTooltips: function() {

            new joint.ui.Tooltip({
                rootTarget: document.body,
                target: '[data-tooltip]',
                direction: 'auto',
                padding: 10
            });
        },

        openAsSVG: function() {

            this.paper.toSVG(function(svg) {
                new joint.ui.Lightbox({
                    title: '(Right-click, and use "Save As" to save the diagram in SVG format)',
                    image: 'data:image/svg+xml,' + encodeURIComponent(svg)
                }).open();
            }, { preserveDimensions: true, convertImagesToDataUris: true });
        },

        openAsPNG: function() {

            this.paper.toPNG(function(dataURL) {
                new joint.ui.Lightbox({
                    title: '(Right-click, and use "Save As" to save the diagram in PNG format)',
                    image: dataURL
                }).open();
            }, { padding: 10 });
        },

        onMousewheel: function(cellView, evt, x, y, delta) {

            if (this.keyboard.isActive('alt', evt)) {
                this.paperScroller.zoom(delta / 10, { min: 0.2, max: 5, ox: x, oy: y });
            }
        },

        layoutDirectedGraph: function() {

            joint.layout.DirectedGraph.layout(this.graph, {
                setLinkVertices: true,
                rankDir: 'TB',
                marginX: 100,
                marginY: 100
            });

            this.paperScroller.centerContent();
        }
    });

})(_, joint);


/*
initializeValidator: function() {

    // This is just for demo purposes. Every application has its own validation rules or no validation
    // rules at all.

    this.validator = new joint.dia.Validator({ commandManager: this.commandManager });

    this.validator.validate('change:position change:size add', _.bind(function(err, command, next) {

        if (command.action === 'add' && command.batch) return next();

        var cell = command.data.attributes || this.graph.getCell(command.data.id).toJSON();
        var area = g.rect(cell.position.x, cell.position.y, cell.size.width, cell.size.height);

        if (_.find(this.graph.getElements(), function(e) {

       var position = e.get('position');
            var size = e.get('size');
       return (e.id !== cell.id && area.intersect(g.rect(position.x, position.y, size.width, size.height)));

        })) return next("Another cell in the way!");
    }, this));

    this.validator.on('invalid',function(message) {

        $('.statusbar-container').text(message).addClass('error');

        _.delay(function() {

            $('.statusbar-container').text('').removeClass('error');

        }, 1500);
    });
},
*/
