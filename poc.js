var graph = new joint.dia.Graph;
var paper = new joint.dia.Paper({
    el: $('#myholder'),
    width: 1000,
    height: 1000,
    model: graph,
    gridSize: 1
});
var object = new joint.shapes.basic.Rect({
    position: { x: 150, y: 100 },
    size: { width: 100, height: 50 },
    attrs: { rect: { fill: '#DCDCDC', stroke:'#006400', 'stroke-width': 2,
        filter: { name: 'dropShadow', args: { dx: 6, dy: 6, blur: 0, color: 'grey' } } },
        text: { text: 'Raw Material', fill: 'black', 'font-weight': 'bold'} }
});

var object2 = new joint.shapes.basic.Rect({
    position: { x: 750, y: 300 },
    size: { width: 100, height: 50 },
    attrs: { rect: { fill: '#DCDCDC', stroke:'#006400', 'stroke-width': 2} ,
        text: { text: 'Object', fill: 'black', 'font-weight': 'bold'} }
});

var proc = new joint.shapes.basic.Ellipse({
    position: { x: 250, y: 300 },
    size: { width: 120, height: 60 },
    attrs: { ellipse: { fill: '#DCDCDC', stroke:'#00008B', 'stroke-width': 2},
        text: { text: 'Manufacturing', fill: 'black', 'font-weight': 'bold'} }
});
var proc2 = new joint.shapes.basic.Ellipse({
    position: { x: 500, y: 300 },
    size: { width: 120, height: 60 },
    attrs: { ellipse: { fill: '#DCDCDC', stroke:'#00008B', 'stroke-width': 2},
        text: { text: 'Testing', fill: 'black', 'font-weight': 'bold'} }
});
var StateFullObject = new joint.shapes.basic.Rect({
    position: { x: 400, y: 100 },
    size: { width: 300, height: 120 },
    attrs: { rect: { fill: '#DCDCDC', stroke:'#006400', 'stroke-width': 2},
        text: { text: 'Product', fill: 'black', 'font-weight': 'bold', 'ref-y': '.2'} }
});
var link1 = new joint.shapes.opm.Link({
    source: { id: object.id },
    target: { id: proc.id }
});
var link2 = new joint.shapes.opm.Link({
    source: { id: proc.id },
    target: { id: StateFullObject.id }
});
var state1 = new joint.shapes.basic.Rect({
    position: { x: 410, y: 170 },
    size: { width: 80, height: 40 },
    attrs: { rect: { fill: '#DCDCDC', rx: 20, ry: 20, 'stroke-width': 3, stroke: '#808000' },
        text: { text: 'pre-tested', fill: 'black' } }
});
var state2 = new joint.shapes.basic.Rect({
    position: { x: 510, y: 170 },
    size: { width: 80, height: 40 },
    attrs: { rect: { fill: '#DCDCDC', rx: 20, ry: 20, 'stroke-width': 1, stroke: '#808000' },
        text: { text: 'being\ntested', fill: 'black' } }
});
/* var state3 = new joint.shapes.erd.WeakEntity({
 position: { x: 610, y: 170 },
 size: { width: 80, height: 40 },
 attrs: {
 text: {
 fill: 'black',
 text: 'tested'},
 '.inner': {
 fill: '#DCDCDC',
 stroke: '#808000', 'stroke-width': 1,
 points: '150,10 150,50 10,50 10,10'
 },
 '.outer': {
 fill: '#DCDCDC',
 stroke: '#808000', 'stroke-width': 1,
 points: '160,0 160,60 0,60 0,0'
 }
 }});*/

var state3 = new joint.shapes.opm.StateFinal({
    position: { x: 610, y: 170 },
    size: {width: 80, height: 40},
    attrs: { text: { text: 'tested', fill: 'black' } }
});

var link3 = new joint.shapes.opm.Link({
    source: {id: state1.id},
    target: {id: proc2.id}
});
var link4 = new joint.shapes.opm.Link({
    source: {id: proc2.id},
    target: {id: state3.id}
});
//Lollipop Connector
var link5 = new joint.shapes.opm.Lollipop({
    source: { id: object2.id },
    target: { id: proc2.id }
});

//Embeds state objects in parent object
StateFullObject.embed(state1);
StateFullObject.embed(state2);
StateFullObject.embed(state3);

graph.addCells([StateFullObject,state1,state2, state3, object, object2, proc, proc2, link1, link2, link3, link4, link5]);

graph.on('change:position', function(cell) {
    var parentId = cell.get('parent');
    if (!parentId) return;
    var parent = graph.getCell(parentId);
    var parentBbox = parent.getBBox();
    var cellBbox = cell.getBBox();
    if (parentBbox.containsPoint(cellBbox.origin()) &&
        parentBbox.containsPoint(cellBbox.topRight()) &&
        parentBbox.containsPoint(cellBbox.corner()) &&
        parentBbox.containsPoint(cellBbox.bottomLeft())) {
        // All the four corners of the child are inside
        // the parent area.
        return;
    }
    // Revert the child position.
    cell.set('position', cell.previous('position'));
});