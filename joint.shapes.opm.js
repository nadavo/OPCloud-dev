/**
 * Created by Nadav on 17/04/2016.
 */
joint.shapes.opm = {};

joint.shapes.opm.StateFinal = joint.shapes.basic.Generic.extend({

    markup: '<g class="rotatable"><g class="scalable"><rect id="outer" width="80" height="40"/><rect id="inner" x="5" y="5" width="70" height="30"/></g><text/></g>',

    defaults: joint.util.deepSupplement({
        type: 'opm.StateFinal',
        attrs: {
            //'path': { fill: '#DCDCDC', d: 'M 10 10 m 0 0 a 5 5 0 1 0 10 0 a 5 5 0 1 0 -10 0', 'follow-scale': true, stroke: '#808000' ,'stroke-width': 1 },
            'rect': { fill: '#DCDCDC', rx: 15, ry: 15, 'stroke-width': 1, stroke: '#808000' , 'follow-scale': true },
            'text': { fill: 'black' ,'font-family':'Arial' ,'font-size': 14, 'ref-x': .5, 'ref-y': .5, ref: 'rect', 'y-alignment': 'middle', 'x-alignment': 'middle' } }
    }, joint.shapes.basic.Generic.prototype.defaults)
});