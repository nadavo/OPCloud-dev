/*! Rappid v2.0.0 - HTML5 Diagramming Framework

Copyright (c) 2015 client IO

 2016-09-20 


This Source Code Form is subject to the terms of the Rappid Academic License
, v. 1.0. If a copy of the Rappid License was not distributed with this
file, You can obtain one at http://jointjs.com/license/rappid_academic_v1.txt
 or from the Rappid archive as was distributed by client IO. See the LICENSE file.*/


//      JointJS library.
//      (c) 2011-2015 client IO

joint.mvc.View = Backbone.View.extend({

    options: {},
    theme: null,
    themeClassNamePrefix: joint.util.addClassNamePrefix('theme-'),
    requireSetThemeOverride: false,
    defaultTheme: joint.config.defaultTheme,

    constructor: function(options) {

        Backbone.View.call(this, options);
    },

    initialize: function(options) {

        this.requireSetThemeOverride = options && !!options.theme;

        this.options = _.extend({}, this.options, options);

        _.bindAll(this, 'setTheme', 'onSetTheme', 'remove', 'onRemove');

        joint.mvc.views[this.cid] = this;

        this.setTheme(this.options.theme || this.defaultTheme);
        this._ensureElClassName();
        this.init();
    },

    _ensureElClassName: function() {

        var className = _.result(this, 'className');
        var prefixedClassName = joint.util.addClassNamePrefix(className);

        this.$el.removeClass(className);
        this.$el.addClass(prefixedClassName);
    },

    init: function() {
        // Intentionally empty.
        // This method is meant to be overriden.
    },

    onRender: function() {
        // Intentionally empty.
        // This method is meant to be overriden.
    },

    setTheme: function(theme, opt) {

        opt = opt || {};

        // Theme is already set, override is required, and override has not been set.
        // Don't set the theme.
        if (this.theme && this.requireSetThemeOverride && !opt.override) return;

        this.removeThemeClassName();
        this.addThemeClassName(theme);
        this.onSetTheme(this.theme/* oldTheme */, theme/* newTheme */);
        this.theme = theme;

        return this;
    },

    addThemeClassName: function(theme) {

        theme = theme || this.theme;

        var className = this.themeClassNamePrefix + theme;

        this.$el.addClass(className);

        return this;
    },

    removeThemeClassName: function(theme) {

        theme = theme || this.theme;

        var className = this.themeClassNamePrefix + theme;

        this.$el.removeClass(className);

        return this;
    },

    onSetTheme: function(oldTheme, newTheme) {
        // Intentionally empty.
        // This method is meant to be overriden.
    },

    remove: function() {

        this.onRemove();

        joint.mvc.views[this.cid] = null;

        Backbone.View.prototype.remove.apply(this, arguments);

        return this;
    },

    onRemove: function() {
        // Intentionally empty.
        // This method is meant to be overriden.
    }
});

(function() {

    joint.mvc.View._extend = joint.mvc.View.extend;

    joint.mvc.View.extend = function(protoProps, staticProps) {

        protoProps = protoProps || {};

        var render = protoProps.render || this.prototype.render || null;

        protoProps.render = function() {

            if (render) {
                // Call the original render method.
                render.apply(this, arguments);
            }

            // Should always call onRender() method.
            this.onRender();

            // Should always return itself.
            return this;
        };

        return joint.mvc.View._extend.call(this, protoProps, staticProps);
    };

})();
