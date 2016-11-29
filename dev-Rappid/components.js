class ShapeCreator {
    constructor(graph,graphElements) {
        this.graph = graph;
        this.graphElements=graphElements;
    }
    PSObjCreator(){
        var PSObj = new joint.shapes.opm.PSObj;
        this.graphElements.push(PSObj);
        this.graph.addCells(this.graphElements);
    }
    ISProcCreator(){
        var Proc = new joint.shapes.opm.ISProc;
        this.graphElements.push(Proc);
        this.graph.addCells(this.graphElements);
    }
    LinkCreator(){
        var Link = new joint.shapes.opm.Link;
        this.graphElements.push(Link);
        this.graph.addCells(this.graphElements);
    }
};

//Creating the components, association to the HTML buttons
var ObjectButton=document.querySelector('#obj');
var ProcButton=document.querySelector('#proc');
var LinkButton=document.querySelector('#link');

var graph = new joint.dia.Graph;
var paper = new joint.dia.Paper({
    el: $('#myholder'),
    width: 1000,
    height: 1000,
    model: graph,
    gridSize: 1
});
var graphElements=[];

var shapes = new ShapeCreator(graph,graphElements);

ObjectButton.addEventListener('click', shapes.PSObjCreator.bind(shapes));
ProcButton.addEventListener('click', shapes.ISProcCreator.bind(shapes));
LinkButton.addEventListener('click', shapes.LinkCreator.bind(shapes));


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