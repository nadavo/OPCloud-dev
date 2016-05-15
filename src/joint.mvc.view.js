/*! Rappid v1.7.1 - HTML5 Diagramming Framework

Copyright (c) 2015 client IO

 2016-03-03 


This Source Code Form is subject to the terms of the Rappid Academic License
, v. 1.0. If a copy of the Rappid License was not distributed with this
file, You can obtain one at http://jointjs.com/license/rappid_academic_v1.txt
 or from the Rappid archive as was distributed by client IO. See the LICENSE file.*/


//      JointJS library.
//      (c) 2011-2015 client IO

joint.mvc.View = Backbone.View.extend({

    options: {
    },

    constructor: function(options) {

        Backbone.View.call(this, options);
    },

    initialize: function(options) {

        this.options = _.extend({}, joint.mvc.View.prototype.options || {}, this.options || {}, options || {});

        _.bindAll(this, 'remove', 'onRemove');

        joint.mvc.views[this.cid] = this;

        this.init();
    },

    init: function() {
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
