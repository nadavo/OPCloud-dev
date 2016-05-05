class newObject {
    constructor() {
        this.name = "Name";
    }
};
var createObject=document.querySelector('#obj');
var createObject2=document.querySelector('#proc');

var graph = new joint.dia.Graph;
var paper = new joint.dia.Paper({
    el: $('#myholder'),
    width: 1000,
    height: 1000,
    model: graph,
    gridSize: 1
});
var oleg=[];
newObject.prototype.create=function () {
    var obj = new joint.shapes.basic.Rect({
        position: { x: 250, y: 300 },
        size: { width: 100, height: 50 },
        attrs: { rect: { fill: '#DCDCDC', stroke:'#006400', 'stroke-width': 2,
            filter: { name: 'dropShadow', args: { dx: 6, dy: 6, blur: 0, color: 'grey' } } },
            text: { text: 'New Object', fill: 'black', 'font-weight': 'bold'} }
    });
    oleg.push(obj);
    graph.addCells(oleg);
}
newObject.prototype.create2=function () {
    var proc234 = new joint.shapes.basic.Ellipse({
        position: {x: 250, y: 300},
        size: {width: 120, height: 60},
        attrs: {
            ellipse: {fill: '#DCDCDC', stroke: '#00008B', 'stroke-width': 2},
            text: {text: 'Manufacturing', fill: 'black', 'font-weight': 'bold'}
        }
    });
    oleg.push(proc234);
    graph.addCells(oleg);
}
var state3 = new joint.shapes.opm.StateFinal({       //you can add possition, attr, and more
    attrs: { text: { text: 'tested', fill: 'black' }}
    });

var test = new joint.shapes.opm.PSObj;

var c1 = new newObject();
var c2 = new newObject();


graph.addCells([test]);

createObject.addEventListener('click', c1.create);
createObject2.addEventListener('click', c2.create2);


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