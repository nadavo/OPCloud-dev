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

//Function CreateSelection. Gets selection type (select or select-box), selection label, in which inspector group it should be and the index.
//The function defines options object for selection according to the label.
//The function return selection object.
function CreateSelection(selectionType, selectionOptions, selectionLabel, selectionGroup, selectionIndex, selectionDefault = '')
{
    var selectionObject = {
        type: selectionType,
        label: selectionLabel,
        defaultValue: selectionDefault,
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