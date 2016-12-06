function opmRuleSet (validator, graph) {

    validator.validate(
        "change:position change:target change:source",
        function(err,command,next) {
            if (command.data.type === 'opm.Link') {
                var link = graph.getCell(command.data.id);
                if (link.getSourceElement().attributes.type === link.getTargetElement().attributes.type) {
                    if ( link.getSourceElement().attributes.type === 'opm.Object' ) {
                        return next('Objects cannot be linked together.');
                    }
                }
            }
            return next();
        },
        function(err, command, next) {
            if (err) console.log(err);
            return next(err);
        })
};





