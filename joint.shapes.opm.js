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

// joint.shapes.opm.Link = joint.dia.Link.extend({
//     renderMarkup('polygon')
//     defaults:
//         type: 'opm.Link',
//         attrs: { '.marker-target': { 'points': "-2,0 -5,5 5,0 -5,-5", 'fill': "red", 'stroke': "black", 'stroke-width': 2 } , '.connection':{'stroke-width': 2} },
//         smooth: false
// });

joint.shapes.opm.Link = joint.dia.Link.extend({
    defaults: {
        type: 'opm.Link',
        attrs: { fill: '#f2f2f2', '.marker-target': { d: 'M 10,35 L -15,25 L 10,15 L0,25 L 10,35 M 0,25 L 90,25', fill: 'none', 'stroke-width': 2 }, '.connection':{'stroke-width': 2} }
    }
});

joint.shapes.opm.Lollipop = new joint.dia.Link.extend({
    defaults: {
        type: 'opm.Link',
        attrs : {'.marker-target': { fill: '#f2f2f2' ,d: 'M 10 10 m -5 0 a 5 5 0 1 0 10 0 a 5 5 0 1 0 -10 0','stroke-width': 2},'.connection':{'stroke-width': 2}}
    }
});

