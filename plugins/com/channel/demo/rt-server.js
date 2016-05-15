/*! Rappid v1.7.1 - HTML5 Diagramming Framework

Copyright (c) 2015 client IO

 2016-03-03 


This Source Code Form is subject to the terms of the Rappid Academic License
, v. 1.0. If a copy of the Rappid License was not distributed with this
file, You can obtain one at http://jointjs.com/license/rappid_academic_v1.txt
 or from the Rappid archive as was distributed by client IO. See the LICENSE file.*/


var joint = require('../../../../index');
var Channel = joint.com.Channel;
var ChannelHub = joint.com.ChannelHub;

var PORT = 4141;

var channels = {};
var channelHub = new ChannelHub({ port: PORT });
channelHub.route(function(req) {
    var query = JSON.parse(req.query.query);
    if (channels[query.room]) return channels[query.room];
    return channels[query.room] = new Channel({ graph: new joint.dia.Graph });
});

console.log('ChannelHub running on port ' + PORT);
console.log('Starting repl... Type "help" to see examples on what you can do. To exit the repl, press Ctrl-C twice or type ".exit".');

var repl = require('repl');
var cli = repl.start({ prompt: 'Channel > ' });
cli.context.joint = joint;
cli.context.channels = channels;
cli.context.help = [
    'Type channels [enter] to see the server side channels for each room.',
    'channels.A.options.graph.addCell(new joint.shapes.basic.Rect({ position: { x: 50, y: 50 }, size: { width: 100, height: 70 } }))',
    'channels.B.options.graph.get("cells").at(0).translate(300, 100, { transition: { duration: 2000 } })'
];

cli.on('exit', function() {
    console.log('Bye.');
    process.exit();
});
