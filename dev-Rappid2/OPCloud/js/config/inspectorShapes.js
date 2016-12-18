inspectorShapes = {};

//In this file defined different variables that build the attributes of the elements of the diagram.

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
    var selectionOptions = (selectionLabel === 'Essence')? selectOptions.shadowStyle : selectOptions.strokeStyle;

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
        index: textIndex,
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