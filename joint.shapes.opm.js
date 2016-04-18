/**
 * OPM Shapes Library 
 * Created by Nadav on 17/04/2016.
 */
//OPM Shapes definitions
joint.shapes.opm = {};

// OPM Final State shape definition
joint.shapes.opm.StateFinal = joint.shapes.basic.Generic.extend({

    //svg markup for the special shape
    markup: '<g class="rotatable"><g class="scalable"><rect id="outer" width="80" height="40"/><rect id="inner" x="5" y="5" width="70" height="30"/></g><text/></g>',

    defaults: joint.util.deepSupplement({
        type: 'opm.StateFinal',
        attrs: { //svg properties for shape drawn
            'rect': { fill: '#DCDCDC', rx: 15, ry: 15, 'stroke-width': 1, stroke: '#808000' , 'follow-scale': true },
            'text': { fill: 'black' ,'font-family':'Arial' ,'font-size': 14, 'ref-x': .5, 'ref-y': .5, ref: 'rect', 'y-alignment': 'middle', 'x-alignment': 'middle' } }
    }, joint.shapes.basic.Generic.prototype.defaults)
});