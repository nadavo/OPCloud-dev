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
    'filter': CreateSelection('select-box', selectOptions.shadowStyle, 'Essence', 'presentation', 1),
    'stroke-dasharray': CreateSelection('select', selectOptions.strokeStyle, 'Affiliation', 'presentation', 2),
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