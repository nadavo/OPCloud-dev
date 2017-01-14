
function opmRuleSet (validator, graph) {
    validator.validate(
        "change:target change:source",
        function(err,command,next) {
            if (command.data.type === 'opm.Link') {
                var link = graph.getCell(command.data.id);
                if (null === link.getTargetElement())
                {
                    return next('A link must connect to a target element!');
                }
                else if (link.getSourceElement().attributes.type === 'opm.Object' && link.getSourceElement().attributes.type === link.getTargetElement().attributes.type)
                {
                    return next('Objects cannot be linked together!');
                }
                else
                {
                    $("opl").empty();
                    target = link.getTargetElement().attributes.attrs.text.text;
                    source = link.getSourceElement().attributes.attrs.text.text;

                    opl_to_show = opl_to_show + target + "  is linked to " + source + "<BR>" ;

                    console.log(target + " link to " + source);
                    document.getElementById("opl").innerHTML = opl_to_show ;

                    // $("#header ul").empty();
                    //$("#items ol").append('<li>$target is linked to $source</li>');
                    console.log('Link ' + link.id + ' was created!');
                }
            }
            return next();
        },
        function(err, command, next) {
            var errorMessage = new joint.ui.FlashMessage({
                title: 'Validation Error!',
                type: 'alert',
                content: err
            });
            if (err) errorMessage.open();
            return next(err);
        })
};





