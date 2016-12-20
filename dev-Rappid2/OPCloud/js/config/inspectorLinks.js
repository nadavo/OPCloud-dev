inspectorLinks = {};

//From this point defined  the groups that all the inspector parameters are grouped by.
inspectorLinks.groupsDefinition = {
    marker : createGroup('Marker', 1),
    labels: createGroup('Labels', 2)
};

inspectorLinks.linkDefinition = {
    '.marker-source': CreateSelection('select-box', selectOptions.SourceLinkType, 'source link type', 'Marker', 1),
    '.marker-target': CreateSelection('select-box', selectOptions.DestLinkType, 'destination link type', 'Marker', 2),
};

inspectorLinks.labelDefinistion = [{
        position: CreateSelection('select-box', selectOptions.labelPosition, 'Position', 'Labels', 4, 0.5),
        attrs: {
            text: {
                text: {
                    group: 'Labels',
                    type: 'text',
                    label: 'text',
                    index: 3
                }
            }
        }
    }]
