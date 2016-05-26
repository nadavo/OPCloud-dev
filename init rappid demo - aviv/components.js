var graph = new joint.dia.Graph;
var paper = new joint.dia.Paper({
    el: $('#my-paper-holder'),
    width: 1200,
    height: 500,
    gridSize: 1,
    model: graph
});

var stencil = new joint.ui.Stencil({
    graph: graph,
    paper: paper,
    width: 300,
    height: 200,
    groups: {
        objects: {label: 'Objects', index: 1 },
        links: {label: 'Links', index: 2}
    }
});
$('#my-stencil-holder').append(stencil.render().el);

var r = new joint.shapes.basic.Rect({
    position: { x: 10, y: 70 }, size: { width: 70, height: 40 },
    attrs: { rect: { fill: '#31D0C6', stroke: '#4B4A67', 'stroke-width': 8 }, text: { text: 'rect', fill: 'white' } }
});

var PSObj = new joint.shapes.opm.PSObj;
var test = new joint.shapes.uml.StartState;

var Link = new joint.shapes.opm.Link;
var Lollipop = new joint.shapes.opm.Lollipop;
var test2 = new joint.shapes.uml.Aggregation;

var Link = new joint.dia.Link({
        type: 'opm.Link',
        source: g.point(50,100),
        target: g.point(100,150),
        attrs: { fill: '#f2f2f2', '.marker-target': { fill: '#f2f2f2', d: 'M 8,33 L -12,25 L 8,17 L0,25 L 8,33 M 0,25 L 10,25', 'stroke-width': 2 }, '.connection':{'stroke-width': 2} }
});

var ob = new joint.shapes.basic.Rect({
        position: {x: 10, y: 10},
        size: { width: 70, height: 40 },
        attrs: {
            rect: {
                fill: '#DCDCDC',
                stroke: '#006400', 'stroke-width': 2,
                filter: {name: 'dropShadow', args: {dx: 6, dy: 6, blur: 0, color: 'grey'}}
            },
            text: {text: 'Object', fill: 'black', 'font-weight': 'bold'}
        }
});

var proc = new joint.shapes.basic.Ellipse({
        position: {x: 100, y: 10},
        size: {width: 70, height: 40},
        attrs: {
            ellipse: {fill: '#DCDCDC', stroke: '#00008B', 'stroke-width': 2},
            text: {text: 'Process', fill: 'black', 'font-weight': 'bold'}
        }
});

stencil.load([ob, proc, r], 'objects');
stencil.load([Link], 'links');

paper.on('change:position', function(cellView) {
    // We don't want a Halo for links.
    if (cellView.model instanceof joint.dia.Link) return;

    var halo = new joint.ui.Halo({ cellView: cellView });
    halo.render();
});


