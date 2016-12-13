inspectorShapes = {};

//options is a variable containing different options types for select-boxes that describe the different elements of the diagram
inspectorShapes.options = {
    //with (Physical) or without (Informatical) shadow
    shadowStyle: [
        {content: 'Physical', value: {name: 'dropShadow', args: {dx: 6, dy: 6, blur: 0, color: 'grey'}}},
        {content: 'Informatical', value: {name: 'dropShadow', args: {dx: 0, dy: 0, blur: 0, color: 'grey'}}},
    ],
    //dashed (Environmental) or not (Systemic) stroke
    strokeStyle: [
        { value: '0', content: 'Systemic'},
        { value: '10,5', content: 'Environmental'}
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

    labelPosition: [
        { value: 30, content: 'Close to source' },
        { value: 0.5, content: 'In the middle' },
        { value: -30, content: 'Close to target' },
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

//From this point defined different variables that build the attributes of the elements of the diagram.

/**
 filter: Showed as a select-box with options as defined in shadowStyle. Used for essence definition.
 Appears in presentation group. Ordered first.
 stroke-dasharray: Showed as a select-box with options as defined in strokeStyle. Used for Affiliation definition.
 Appears in presentation group. Ordered second.
 fill: The color of the element. Picked from a color-palette. Appears in styling group.Ordered sixth.
 stroke: The color of the element's stroke. Picked from a color-palette. Appears in styling group.Ordered seventh.
 stroke-width: The width of the element's stroke. Picked from a range bar (0-30). Appears in styling group.Ordered eighth.
 */
inspectorShapes.shapeDefinition = {
    'filter': CreateSelection('select-box', 'Essence', 'presentation', 1),
    'stroke-dasharray': CreateSelection('select', 'Affiliation', 'presentation', 2),
    fill: CreateColorsObject('Shape fill', 6),
    stroke: CreateColorsObject('Outline', 7),
};

/*Definition of the element's text - content, color and size.
 text: The text that is shown on the element. Can be edited. Appears in text group.Ordered third.
 fill: The color of the text shown on the element. Can be selected from colorPalette. Appears in styling group.Ordered fourth.
 font-size: The size of the text shown on the element. Picked from a range bar. Appears in styling group.Ordered fifth.
*/
inspectorShapes.textDefinition = {
    text: CreateTextContentObject('Text',3),
    fill: CreateColorsObject('Text fill', 4),
    'font-size': CreateRangeObject(10, 80, 'Font size', 5)
};

//From this point defined  the groups that all the inspector parameters are grouped by.
inspectorShapes.groupsDefinition = {
    presentation: createGroup('Presentation', 1),
    text: createGroup('Text', 2),
    styling: createGroup('Styling', 3, true)
};

//Function CreateSelection. Gets selection type (select or select-box), selection label, in which inspector group it should be and the index.
//The function defines options object for selection according to the label.
//The function return selection object.
function CreateSelection(selectionType, selectionLabel, selectionGroup, selectionIndex)
{
    var selectionOptions = (selectionLabel === 'Essence')? inspectorShapes.options.shadowStyle : inspectorShapes.options.strokeStyle;

    var selectionObject = {
        type: selectionType,
        label: selectionLabel,
        options: selectionOptions,
        group: selectionGroup,
        index: selectionIndex
    }
    return selectionObject;
}

//Function CreateColorsObject. Gets label and index and generate a color-plate object in Styling group
function CreateColorsObject (colorsLabel, colorsIndex)
{
    var colorsObject = {
        type: 'color-palette',
        options: opmStyle.inspectorFont.colorPalette,
        label: colorsLabel,
        group: 'styling',
        index: colorsIndex
    };
    return colorsObject;
}

// Function CreateRangeObject gets minimum and maximum values (default 10 and 40), label and index and generates a range object.
function CreateRangeObject(minValue = 10, maxValue = 40, rangeLabel, rangeIndex)
{
    var rangeObject = {
        type: 'range',
        min: minValue,
        max: maxValue,
        step: 1,
        unit: 'px',
        label: rangeLabel,
        group: 'styling',
        index: rangeIndex
    };
    return rangeObject;
}

//Function CreateTextContentObject gets text label and index and generates a text box object.
function CreateTextContentObject(textLabel, textIndex)
{
    var textContentObject = {
        type: 'content-editable',
        label: textLabel,
        group: 'text',
        index: textIndex
    };
    return textContentObject;
}

//Function createGroup. Get the name of the group, its index and if it should be collapsed and generates a group object
function createGroup(labelName, indexNumber, isClosed = false)
{
     var groupObject = {
         label: labelName,
         index: indexNumber,
         closed: isClosed
     };
 return groupObject;
}