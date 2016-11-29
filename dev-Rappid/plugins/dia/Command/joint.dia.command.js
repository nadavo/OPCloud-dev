/*! Rappid v1.7.1 - HTML5 Diagramming Framework

Copyright (c) 2015 client IO

 2016-03-03 


This Source Code Form is subject to the terms of the Rappid Academic License
, v. 1.0. If a copy of the Rappid License was not distributed with this
file, You can obtain one at http://jointjs.com/license/rappid_academic_v1.txt
 or from the Rappid archive as was distributed by client IO. See the LICENSE file.*/


// Command manager implements undo/redo functionality.

joint.dia.CommandManager = Backbone.Model.extend({

    defaults: {
        cmdBeforeAdd: null,
        cmdNameRegex: /^(?:add|remove|change:\w+)$/
    },

    // length of prefix 'change:' in the event name
    PREFIX_LENGTH: 7,

    initialize: function(options) {

        _.bindAll(this, 'initBatchCommand', 'storeBatchCommand');

        this.graph = options.graph;

        this.reset();
        this.listen();
    },

    listen: function() {

        this.listenTo(this.graph, 'all', this.addCommand, this);

        this.listenTo(this.graph, 'batch:start', this.initBatchCommand, this);
        this.listenTo(this.graph, 'batch:stop', this.storeBatchCommand, this);
    },

    createCommand: function(options) {

        var cmd = {
            action: undefined,
            data: { id: undefined, type: undefined, previous: {}, next: {}},
            batch: options && options.batch
        };

        return cmd;
    },

    push: function(cmd) {

        this.redoStack = [];

        if (!cmd.batch) {
            this.undoStack.push(cmd);
            this.trigger('add', cmd);
        } else {
            this.lastCmdIndex = Math.max(this.lastCmdIndex, 0);
            // Commands possible thrown away. Someone might be interested.
            this.trigger('batch', cmd);
        }
    },

    addCommand: function(cmdName, cell, graph, options) {

        // Do not account for changes in `dry` run.
        if (options && options.dry) {
            return;
        }

        if (!this.get('cmdNameRegex').test(cmdName)) {
            return;
        }

        if (typeof this.get('cmdBeforeAdd') == 'function' && !this.get('cmdBeforeAdd').apply(this, arguments)) {
            return;
        }

        var command = undefined;

        if (this.batchCommand) {
            // set command as the one used last.
            // in most cases we are working with same object, doing same action
            // etc. translate an object piece by piece
            command = this.batchCommand[Math.max(this.lastCmdIndex, 0)];

            // Check if we are start working with new object or performing different action with it.
            // Note, that command is uninitialized when lastCmdIndex equals -1. (see 'initBatchCommand()')
            // in that case we are done, command we were looking for is already set
            if (this.lastCmdIndex >= 0 && (command.data.id !== cell.id || command.action !== cmdName)) {

                // trying to find command first, which was performing same action with the object
                // as we are doing with the cell now
                var similarCommandIndex = _.findIndex(this.batchCommand, function(cmd, index) {
                    return cmd.data.id === cell.id && cmd.action === cmdName;
                }, this);

                if (similarCommandIndex < 0 || (cmdName === 'add' || cmdName === 'remove')) {
                    // command with such an id and action was not found. Let's create new one.
                    // Adding and Removing is always preserve as new command. e.g.
                    // (add1, remove1, add2) can not be changed to (remove1, add2) neither (add2, remove1).
                    command = this.createCommand({ batch:  true });
                } else {
                    // move the command to the end of the batch.
                    command = this.batchCommand[similarCommandIndex];
                    this.batchCommand.splice(similarCommandIndex, 1);
                }

                this.lastCmdIndex = this.batchCommand.push(command) - 1;
            }

        } else {

            // single command
            command = this.createCommand({ batch: false });
        }

        if (cmdName === 'add' || cmdName === 'remove') {

            command.action = cmdName;
            command.data.id = cell.id;
            command.data.type = cell.attributes.type;
            command.data.attributes = _.merge({}, cell.toJSON());
            command.options = options || {};

            this.push(command);
            return;
        }

        // `changedAttribute` holds the attribute name corresponding
        // to the change event triggered on the model.
        var changedAttribute = cmdName.substr(this.PREFIX_LENGTH);

        if (!command.batch || !command.action) {
            // Do this only once. Set previous box and action (also serves as a flag so that
            // we don't repeat this branche).
            command.action = cmdName;
            command.data.id = cell.id;
            command.data.type = cell.attributes.type;
            command.data.previous[changedAttribute] = _.clone(cell.previous(changedAttribute));
            command.options = options || {};
        }

        command.data.next[changedAttribute] = _.clone(cell.get(changedAttribute));

        this.push(command);
    },

    // Batch commands are those that merge certain commands applied in a row (1) and those that
    // hold multiple commands where one action consists of more than one command (2)
    // (1) This is useful for e.g. when the user is dragging an object in the paper which would
    // normally lead to 1px translation commands. Applying undo() on such commands separately is
    // most likely undesirable.
    // (2) e.g When you are removing an element, you don't want all links connected to that element, which
    // are also being removed to be part of different command

    initBatchCommand: function() {

        if (!this.batchCommand) {

            this.batchCommand = [this.createCommand({ batch:  true })];
            this.lastCmdIndex = -1;

            // batch level counts how many times has been initBatchCommand executed.
            // It is useful when we doing an operation recursively.
            this.batchLevel = 0;

        } else {

            // batch command is already active
            this.batchLevel++;
        }
    },

    storeBatchCommand: function() {

        // In order to store batch command it is necesary to run storeBatchCommand as many times as
        // initBatchCommand was executed
        if (this.batchCommand && this.batchLevel <= 0) {

            var batchCommand = this.filterBatchCommand(this.batchCommand);
            // checking if there is any valid command in batch
            // for example: calling `initBatchCommand` immediately followed by `storeBatchCommand`
            if (batchCommand.length > 0) {

                this.redoStack = [];

                this.undoStack.push(batchCommand);
                this.trigger('add', batchCommand);
            }

            delete this.batchCommand;
            delete this.lastCmdIndex;
            delete this.batchLevel;

        } else if (this.batchCommand && this.batchLevel > 0) {

            // low down batch command level, but not store it yet
            this.batchLevel--;
        }
    },

    // Takes batch commands and returns only such commands, which when applied in order change the graph.
    filterBatchCommand: function(batchCommand) {

        var commands = batchCommand.slice();
        var filteredCommands = [];

        while (commands.length > 0) {

            var command = commands.shift();
            var id = command.data.id;

            if (command.action == null || id == null) {
                continue;
            }

            if (command.action === 'add') {

                var removeIndex = _.findIndex(commands, { action: 'remove', data: { id: id }});
                if (removeIndex >= 0) {
                    // `add` command followed by `remove` command
                    // Lets remove the `remove` command and all other commands related to
                    // this cell. Note that no commands can exist after the `remove` command,
                    // but some could inbetween `add` and `remove`.
                    // e.g.  . ADD . CHNG . REM . => . . . .
                    commands = _.reject(commands, function(cmd, index) {
                        return index <= removeIndex && cmd.data.id === id;
                    });
                    continue;
                }

            } else if (command.action === 'remove') {

                var addIndex = _.findIndex(commands, { action: 'add', data: { id: id }});
                if (addIndex >= 0) {
                    // `remove` command followed by `add` command
                    // Lets remove only the `add` command. Note that another commands could exist
                    // after the `add` command, but not inbetween `remove` and `add`.
                    // e.g. . CHNG1 . REM . ADD . CHNG2 . ==> . CHNG1 . . . CHNG2 .
                    commands.splice(addIndex, 1);
                    continue;
                }

            } else if (command.action.indexOf('change') === 0) {

                if (_.isEqual(command.data.previous, command.data.next)) {
                    // This is a command which when applied doesn't actually change anything.
                    continue;
                }
            }

            // This is a valid command.
            filteredCommands.push(command);
        }

        return filteredCommands;
    },

    revertCommand: function(command) {

        this.stopListening();

        var batchCommand;
        var opt = { commandManager: this.id || this.cid };

        if (_.isArray(command)) {
            batchCommand = command;
        } else {
            batchCommand = [command];
        }

        for (var i = batchCommand.length - 1; i >= 0; i--) {

            var cmd = batchCommand[i];
            var cell = this.graph.getCell(cmd.data.id);

            switch (cmd.action) {
                case 'add':
                    cell.remove(opt);
                    break;

                case 'remove':
                    this.graph.addCell(cmd.data.attributes, opt);
                    break;

                default:
                    var attribute = cmd.action.substr(this.PREFIX_LENGTH);
                    cell.set(attribute, cmd.data.previous[attribute], opt);
                    break;
            }
        }

        this.listen();
    },

    applyCommand: function(command) {

        this.stopListening();

        var batchCommand;
        var opt = { commandManager: this.id || this.cid };

        if (_.isArray(command)) {
            batchCommand = command;
        } else {
            batchCommand = [command];
        }

        for (var i = 0; i < batchCommand.length; i++) {

            var cmd = batchCommand[i];
            var cell = this.graph.getCell(cmd.data.id);

            switch (cmd.action) {

                case 'add':
                    this.graph.addCell(cmd.data.attributes, opt);
                    break;

                case 'remove':
                    cell.remove(opt);
                    break;

                default:
                    var attribute = cmd.action.substr(this.PREFIX_LENGTH);
                    cell.set(attribute, cmd.data.next[attribute], opt);
                    break;
            }
        }

        this.listen();
    },

    undo: function() {

        var command = this.undoStack.pop();

        if (command) {

            this.revertCommand(command);
            this.redoStack.push(command);
        }
    },


    redo: function() {

        var command = this.redoStack.pop();

        if (command) {

            this.applyCommand(command);
            this.undoStack.push(command);
        }
    },

    cancel: function() {

        if (this.hasUndo()) {

            this.revertCommand(this.undoStack.pop());
            this.redoStack = [];
        }
    },

    reset: function() {

        this.undoStack = [];
        this.redoStack = [];
    },

    hasUndo: function() {

        return this.undoStack.length > 0;
    },

    hasRedo: function() {

        return this.redoStack.length > 0;
    }
});
