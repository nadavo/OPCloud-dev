//selectOptions is an object containing different options types for select-boxes that describe the different elements of the diagram
selectOptions = {

    //with (Physical) or without (Informatical) shadow
    shadowStyle: [
        {content: 'Physical', value: {name: 'dropShadow', args: {dx: 6, dy: 6, blur: 0, color: 'grey'}}},
        {content: 'Informatical', value: {name: 'dropShadow', args: {dx: 0, dy: 0, blur: 0, color: 'grey'}}},
    ],
    //dashed (Environmental) or not (Systemic) stroke
    strokeStyle: [
        {value: '0', content: 'Systemic'},
        {value: '10,5', content: 'Environmental'}
    ],
    SourceLinkType: [
        {value: {d: ''}, content: 'None'},
        {
            value: {fill: '#f2f2f2', d: 'M 8,33 L -12,25 L 8,17 L0,25 L 8,33 M 0,25 L 10,25', 'stroke-width': 2},
            content: 'Consumption Link'
        }
    ],

    DestLinkType: [
        {
            value: {fill: '#f2f2f2', d: 'M 8,33 L -12,25 L 8,17 L0,25 L 8,33 M 0,25 L 10,25', 'stroke-width': 2},
            content: 'Consumption Link'
        },
        {
            value: {fill: '#f2f2f2', d: 'M 0 0 a 5 5 0 1 0 10 0 a 5 5 0 1 0 -10 0 M 10,0 L 25,0', 'stroke-width': 2},
            content: 'Instrument Link'
        },
        {
            value: {fill: '#000000', d: 'M 0 0 a 5 5 0 1 0 10 0 a 5 5 0 1 0 -10 0 M 10,0 L 25,0', 'stroke-width': 2},
            content: 'Agent Link'
        }
    ],

    labelPosition: [
        {value: 30, content: 'Close to source'},
        {value: 0.5, content: 'In the middle'},
        {value: -30, content: 'Close to target'},
    ]
    /*
     side: [
     { value: 'top', content: 'Top Side' },
     { value: 'right', content: 'Right Side' },
     { value: 'bottom', content: 'Bottom Side' },
     { value: 'left', content: 'Left Side' }
     ],

     imageIcons: [
     { value: 'assets/image-icon1.svg', content: '<img height="42px" src="assets/image-icon1.svg"/>' },
     { value: 'assets/image-icon2.svg', content: '<img height="80px" src="assets/image-icon2.svg"/>' },
     { value: 'assets/image-icon3.svg', content: '<img height="80px" src="assets/image-icon3.svg"/>' },
     { value: 'assets/image-icon4.svg', content: '<img height="80px" src="assets/image-icon4.svg"/>' }
     ],

     arrowheadType: [
     { value: 'M 8,33 L -12,25 L 8,17 L0,25 L 8,33 M 0,25 L 10,25', content: 'Consumption Link' },
     { value: 'M 0 0 a 5 5 0 1 0 10 0 a 5 5 0 1 0 -10 0 M 10,0 L 25,0', content: 'Instrument Link' },
     { value: 'M 0 0 a 5 5 0 1 0 10 0 a 5 5 0 1 0 -10 0 M 10,0 L 25,0', content: 'Agent Link' }
     ],

     SourceLinkType: [
     { value: { d:'' }, content: 'None' },
     { value: { fill: '#f2f2f2' ,d: 'M 8,33 L -12,25 L 8,17 L0,25 L 8,33 M 0,25 L 10,25','stroke-width': 2}, content: 'Consumption Link' }
     ],

     DestLinkType: [
     { value: { fill: '#f2f2f2' ,d: 'M 8,33 L -12,25 L 8,17 L0,25 L 8,33 M 0,25 L 10,25','stroke-width': 2}, content: 'Consumption Link' },
     { value: { fill: '#f2f2f2' ,d: 'M 0 0 a 5 5 0 1 0 10 0 a 5 5 0 1 0 -10 0 M 10,0 L 25,0','stroke-width': 2}, content: 'Instrument Link' },
     { value: { fill: '#000000' ,d:'M 0 0 a 5 5 0 1 0 10 0 a 5 5 0 1 0 -10 0 M 10,0 L 25,0','stroke-width': 2}, content: 'Agent Link' }
     ],

     router: [
     { value: 'normal', content: '<p style="background:#fff;width:2px;height:30px;margin:0 14px;border-radius: 2px;"/>' },
     { value: 'orthogonal', content: '<p style="width:20px;height:30px;margin:0 5px;border-bottom: 2px solid #fff;border-left: 2px solid #fff;"/>' },
     { value: 'oneSide', content: '<p style="width:20px;height:30px;margin:0 5px;border: 2px solid #fff;border-top: none;"/>' }
     ],

     connector: [
     { value: 'normal', content: '<p style="width:20px;height:20px;margin:5px;border-top:2px solid #fff;border-left:2px solid #fff;"/>' },
     { value: 'rounded', content: '<p style="width:20px;height:20px;margin:5px;border-top-left-radius:30%;border-top:2px solid #fff;border-left:2px solid #fff;"/>' },
     { value: 'smooth', content: '<p style="width:20px;height:20px;margin:5px;border-top-left-radius:100%;border-top:2px solid #fff;border-left:2px solid #fff;"/>' }
     ],

     labelPosition: [
     { value: 30, content: 'Close to source' },
     { value: 0.5, content: 'In the middle' },
     { value: -30, content: 'Close to target' },
     ]
     */
};