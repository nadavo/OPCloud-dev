function opmRuleSet (validator, graph) {
    validator.validate(
        "change:target change:source",
        function(err,command,next) {
            if (command.data.type === 'opm.Link') {
                var link = graph.getCell(command.data.id);
                console.log('Shefi');
                if (null === link.getTargetElement())
                {
                    return next('A link must have a target!');
                }
                else if (link.getSourceElement().attributes.type === 'opm.Object' && link.getSourceElement().attributes.type === link.getTargetElement().attributes.type)
                {
                    return next('Objects cannot be linked together!');
                }
                else
                {
                    console.log('Link ' + link.id + ' was created!');
                }
            }
            return next();
        },
        function(err, command, next) {
            if (err) console.log(err);
            return next(err);
        })
};





