/*! Rappid v1.7.1 - HTML5 Diagramming Framework

Copyright (c) 2015 client IO

 2016-03-03 


This Source Code Form is subject to the terms of the Rappid Academic License
, v. 1.0. If a copy of the Rappid License was not distributed with this
file, You can obtain one at http://jointjs.com/license/rappid_academic_v1.txt
 or from the Rappid archive as was distributed by client IO. See the LICENSE file.*/


joint.ui.FlashMessage = joint.ui.Dialog.extend({

    className: joint.ui.Dialog.prototype.className + ' flash-message',

    options: _.merge({}, joint.ui.Dialog.prototype.options, {
        closeButton: true,
        modal: false,
        cascade: true,
        closeAnimation: {
            delay: 2000,
            duration: 200,
            easing: 'swing',
            properties: {
                opacity: 0
            }
        },
        openAnimation: {
            duration: 200,
            easing: 'swing',
            properties: {
                opacity: 1
            }
        }
    }),

    init: function() {

        _.bindAll(this, 'startCloseAnimation');

        joint.ui.Dialog.prototype.init.apply(this, arguments);

        this.on('close:animation:complete', this.close, this);
    },

    open: function() {

        joint.ui.Dialog.prototype.open.apply(this, arguments);

        // Store foreground height for later use.
        var $fg = this.$('.fg');
        this._foregroundHeight = $fg.height();

        this.addToCascade();

        $fg.css('height', 0);
        this.startOpenAnimation();

        if (this.options.closeAnimation && this.options.closeAnimation.delay) {

            setTimeout(this.startCloseAnimation, this.options.closeAnimation.delay);
        }

        return this;
    },

    close: function() {

        joint.ui.Dialog.prototype.close.apply(this, arguments);

        this.removeFromCascade();

        return this;
    },

    addToCascade: function() {

        if (this.options.cascade) {

            var top = this.constructor.top;
            this.$('.fg').css('top', top);
            this.constructor.top += this._foregroundHeight + this.constructor.padding;
        }

        this.constructor.opened.push(this);
    },

    removeFromCascade: function() {

        if (this.options.cascade) {

            // Update top coordinate of all the cascading flash messages after me.
            var openedFlashMessages = this.constructor.opened;
            var isAfter = false;
            for (var i = 0; i < openedFlashMessages.length; i++) {
                var opened = openedFlashMessages[i];
                if (opened.options.cascade && isAfter) {
                    var openedTop = parseInt(opened.$('.fg').css('top'), 10);
                    opened.$('.fg').css('top', openedTop - this._foregroundHeight - this.constructor.padding);
                }
                if (opened === this) {
                    isAfter = true;
                }
            }

            if (isAfter) {
                // Only decrease the height if this flash messages is in the
                // opened list. It could be that someone called close() multiple times
                // and that would take `top` to negative numbers.
                this.constructor.top -= (this._foregroundHeight + this.constructor.padding);
            }
        }

        this.constructor.opened = _.without(this.constructor.opened, this);
    },

    startCloseAnimation: function() {

        this.$('.fg').animate(this.options.closeAnimation.properties, _.extend({

            complete: _.bind(function() {

                this.trigger('close:animation:complete');

            }, this)

        }, this.options.closeAnimation));
    },

    startOpenAnimation: function() {

        var $fg = this.$('.fg');
        $fg.animate(_.extend({}, this.options.openAnimation.properties, { height: this._foregroundHeight }), _.extend({

            complete: _.bind(function() {

                this.trigger('open:animation:complete');

            }, this)

        }, this.options.openAnimation));
    }
}, {

    // @private Top coordinate of the next flash message. If they are configured as `cascade`, they will stack on top of the other.
    top: 20,

    // @public Global padding between flash messages.
    padding: 15,

    // @private List of all opened flash messages.
    opened: [],

    // @public
    open: function(content, title, opt) {

        opt = opt || {};

        return new joint.ui.FlashMessage(_.extend({
            title: title,
            type: 'info',
            content: content
        }, opt)).open(opt.target);
    },

    close: function() {

        _.invoke(this.opened, 'close');
    }
});
