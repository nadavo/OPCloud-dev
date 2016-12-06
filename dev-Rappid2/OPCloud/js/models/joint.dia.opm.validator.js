function opmRuleSet (validator) {

    validator.validate(
        "change:position change:target change:source",
        function(err,command,next) {
            if (command.data.type === 'opm.Link' &&  ) return next('Objects cannot be removed.');
            return next();
        },
        function(err, command, next) {
            if (err) console.log(err);
            return next(err);
        })
};





