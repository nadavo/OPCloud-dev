/**
 * Created by Nadav on 17/04/2016.
 */
joint.shapes.opm = {};
//OPM Shapes definitions
joint.shapes.opm.StateFinal = joint.shapes.basic.Generic.extend({

    //svg markup for the special shape
    markup: '<g class="rotatable"><g class="scalable"><rect id="outer" width="80" height="40"/><rect id="inner" x="5" y="5" width="70" height="30"/></g><text/></g>',
    defaults: joint.util.deepSupplement({
        position: { x: 250, y: 300 },
        type: 'opm.StateFinal',
        size: {width: 80, height: 40},
        attrs: {
            'rect': { fill: '#DCDCDC', rx: 15, ry: 15, 'stroke-width': 1, stroke: '#808000' , 'follow-scale': true },
            'text': { fill: 'black' ,'font-family':'Arial' ,'font-size': 14, 'ref-x': .5, 'ref-y': .5, ref: 'rect', 'y-alignment': 'middle', 'x-alignment': 'middle' } }
    }, joint.shapes.basic.Generic.prototype.defaults)
});

joint.shapes.opm.Link = joint.dia.Link.extend({
    defaults: {
        type: 'opm.Link',
        attrs: { fill: '#f2f2f2', '.marker-target': { fill: '#f2f2f2', d: 'M 8,33 L -12,25 L 8,17 L0,25 L 8,33 M 0,25 L 10,25', 'stroke-width': 2 }, '.connection':{'stroke-width': 2} }
    }
});

joint.shapes.opm.Lollipop = joint.dia.Link.extend({
    defaults: {
        type: 'opm.Link',
        attrs : {'.marker-target': { fill: '#f2f2f2' ,d: 'M 10 10 m -5 0 a 5 5 0 1 0 10 0 a 5 5 0 1 0 -10 0','stroke-width': 2},'.connection':{'stroke-width': 2} }
    }
});
//WIP  - Stopped here
//regular opm physical systematic object
/*joint.shapes.opm.PSObj =  joint.shapes.basic.Rect({
    
        type: 'opm.Rect',
        position: {x: 250, y: 200},
        size: {width: 200, height: 50},
        attrs: {
            rect: {
                fill: '#DCDCDC', stroke: '#006400', 'stroke-width': 2,
                filter: {name: 'dropShadow', args: {dx: 6, dy: 6, blur: 0, color: 'grey'}}
            },
            text: {text: 'Raw Material', fill: 'black', 'font-weight': 'bold'}
        }
    
});
*/
joint.shapes.opm.PSObj =  function () {
    window.alert(6+6);
};


//informatical systemic object
joint.shapes.opm.ISObj = joint.shapes.basic.Rect.extend({
    defaults: {
        position: {x: 750, y: 300},
        size: {width: 100, height: 50},
        attrs: {
            rect: {fill: '#DCDCDC', stroke: '#006400', 'stroke-width': 2},
            text: {text: 'Object', fill: 'black', 'font-weight': 'bold'}
        }
    }
});

//informatical systemic process
joint.shapes.opm.ISProc = joint.shapes.basic.Ellipse.extend({
    defaults: {
        position: {x: 250, y: 300},
        size: {width: 120, height: 60},
        attrs: {
            ellipse: {fill: '#DCDCDC', stroke: '#00008B', 'stroke-width': 2},
            text: {text: 'Manufacturing', fill: 'black', 'font-weight': 'bold'}
        }
    }
});

//INITIAL STATE
joint.shapes.opm.StateInit = joint.shapes.basic.Rect.extend({
    defaults: {
        position: {x: 410, y: 170},
        size: {width: 80, height: 40},
        attrs: {
            rect: {fill: '#DCDCDC', rx: 20, ry: 20, 'stroke-width': 3, stroke: '#808000'},
            text: {text: 'pre-tested', fill: 'black'}
        }
    }
});

//NORMAL STATE
joint.shapes.opm.StateNorm = joint.shapes.basic.Rect.extend({
    defaults: {
        position: {x: 510, y: 170},
        size: {width: 80, height: 40},
        attrs: {
            rect: {fill: '#DCDCDC', rx: 20, ry: 20, 'stroke-width': 1, stroke: '#808000'},
            text: {text: 'being\ntested', fill: 'black'}
        }
    }
});

