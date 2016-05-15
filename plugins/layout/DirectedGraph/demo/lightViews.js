/*! Rappid v1.7.1 - HTML5 Diagramming Framework

Copyright (c) 2015 client IO

 2016-03-03 


This Source Code Form is subject to the terms of the Rappid Academic License
, v. 1.0. If a copy of the Rappid License was not distributed with this
file, You can obtain one at http://jointjs.com/license/rappid_academic_v1.txt
 or from the Rappid archive as was distributed by client IO. See the LICENSE file.*/


// Redefining default views making them much more lightweight.
// ===========================================================


joint.dia.LightElementView = joint.dia.ElementView.extend({

    node: V('<g><text font-size="10" transform="translate(0, -20)">Label</text><circle r="10" fill="white" stroke="black"/></g>'),

    initialize: function() {

        joint.dia.CellView.prototype.initialize.apply(this, arguments);

        V(this.el).attr({

            'class': 'element ' + this.model.get('type').split('.').join(' '),
            'model-id': this.model.id
        });

        this.model.on('change:position', this.translate, this);
    },

    render: function() {

        var node = this.node.clone();
        var label = this.model.get('attrs').text.text;
        V(node.node.firstChild).text(label);

        V(this.el).append(node);

        this.translate();
    },

    update: function() {
        // noop
    }
});


joint.dia.LightLinkView = joint.dia.ElementView.extend({

    node: V('<g><path stroke="gray" fill="none" d=""/></g>'),

    initialize: function() {

        joint.dia.CellView.prototype.initialize.apply(this, arguments);

        V(this.el).attr({ 'class': 'link', 'model-id': this.model.id });
    },

    render: function() {

        var node = this.node.clone();

        this._sourceModel = this.paper.getModelById(this.model.get('source').id);
        this._targetModel = this.paper.getModelById(this.model.get('target').id);

        this._pathNode = V(node.node.firstChild);

        this._sourceModel.on('change:position', this.update, this);
        this._targetModel.on('change:position', this.update, this);
        this.model.on('change:vertices', this.update, this);

        V(this.el).append(node);
    },

    update: function() {

        var sourcePosition = this._sourceModel.get('position');
        var targetPosition = this._targetModel.get('position');

        if (sourcePosition && targetPosition) {

            var vertices = this.model.get('vertices');

            var d;
            if (this.model.get('smooth')) {

                d = g.bezier.curveThroughPoints([sourcePosition].concat(vertices || []).concat([targetPosition]));

            } else {

                d = ['M', sourcePosition.x, sourcePosition.y];
                _.each(vertices, function(vertex) {
                    d.push(vertex.x, vertex.y);
                });
                d.push(targetPosition.x, targetPosition.y);
            }

            this._pathNode.attr('d', d.join(' '));
        }
    }
});

