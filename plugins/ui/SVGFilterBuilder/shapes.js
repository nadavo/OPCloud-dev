/*! Rappid v2.0.0 - HTML5 Diagramming Framework

Copyright (c) 2015 client IO

 2016-09-20 


This Source Code Form is subject to the terms of the Rappid Academic License
, v. 1.0. If a copy of the Rappid License was not distributed with this
file, You can obtain one at http://jointjs.com/license/rappid_academic_v1.txt
 or from the Rappid archive as was distributed by client IO. See the LICENSE file.*/


joint.shapes.filter = {};

joint.shapes.filter.Filter = joint.dia.Element.extend({

    markup: '<g class="rotatable"><text /><g class="scalable"><circle class="circle-body"/><image/></g></g>',

    defaults: joint.util.deepSupplement({
        type: 'filter',
        in: null,
        result: null,
        size: { width: 60, height: 60 },
        attrs: {
            '.circle-body': {
                fill: '#ffffff',
                stroke: '#ffffff',
                r: 30,
                cx: 30,
                cy: 30
            },
            image: {
                width: 32,
                height: 32,
                'ref-x': 14, 'ref-y': 14
            },
            '.': { magnet: false }
        }

    }, joint.dia.Element.prototype.defaults),

    exportSvg: function() {

    },

    getResult: function() {
        return this.get('result') || this.get('id');
    },

    importSvg: function(markup) {
        this.importSvgAttributes(markup);
    },

    importSvgAttributes: function(markup, map) {

        map = map || {};

        var attrs = $(markup)[0].attributes;

        _.each(attrs, function(attr) {
            var key;
            var name = attr.name.toLowerCase();

            if (_.isFunction(map[name])) {
                key = map[name](attrs);
            } else {
                key = map[name] ? map[name] : name;
            }
            this.set(key, attr.value);
        }, this);
    },

    setNumberPair: function(keyOne, keyTwo, value, drivenByKey) {

        if (value === undefined) {
            return;
        }
        var parts = value.split(',');
        this.set(drivenByKey, parts.length > 1);
        if (parts.length > 1) {
            this.set(keyTwo, parseFloat(parts[1]));
        }

        this.set(keyOne, parseFloat(parts[0]));
    },

    getNumberPair: function(keyOne, keyTwo, drivenByKey) {

        var valOne = this.get(keyOne);
        var valTwo = this.get(keyTwo);

        if (this.get(drivenByKey)) {
            return [valOne, valTwo].join(',');
        }

        return valOne;
    }
});

joint.shapes.filter.SimpleInputFilter = joint.shapes.filter.Filter.extend({

    markup: '<g class="rotatable"><g class="scalable"><circle class="circle-body"/><image/><circle class="outer-circle"/></g></g>',

    defaults: joint.util.deepSupplement({
        type: 'simpleinputfilter',
        size: { width: 60, height: 60 },
        in: 'SourceGraphic',
        attrs: {
            '.outer-circle': {
                fill: 'transparent',
                stroke: '#ffffff',
                'stroke-width': 2,
                magnet: 'passive',
                r: 30,
                cx: 30,
                cy: 30
            },
            '.circle-body': {
                r: 26,
                cx: 30,
                cy: 30
            },
            image: {
                width: 24,
                height: 24,
                'ref-x': 18, 'ref-y': 18
            }
        }

    }, joint.shapes.filter.Filter.prototype.defaults),

    getIn: function(graph) {

        var inbound = graph.getNeighbors(this, { inbound: true });
        return inbound[0] ? inbound[0].getResult() : this.get('in');
    }
});

joint.shapes.filter.FeGaussianBlur = joint.shapes.filter.SimpleInputFilter.extend({

    defaults: joint.util.deepSupplement({
        type: 'filter.FeGaussianBlur',
        in: 'SourceGraphic',
        stdDeviation: 2,
        attrs: {
            image: {
                //https://www.iconfinder.com/icons/352064/blur_on_icon#size=48
                'xlink:href': 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAB6klEQVRoQ+1ZS0oEMRCdWTkbRcHvTQQPIbrWpYiIIAx4ChEEEXUnnmDQQ7jwIH426k5RnFdQioQkNdWVEJrOQNEkL1Wpl1edhJ5+r+W/fsvz71UCpRWsCjgKPKD9BVsNKCPhakFTK3CPDL5ha4FMJLw4AXUCVofUCljzUft3isAGlucC9gPbhY2c5dpE+5LxnQy4Vx2NAk+IsMhRHvFccSK+oD3Pfc94LiXGzQQo6d+kfAQo6QWehcguOzNacTOBdS4hCkQlcudEJPzqXwndJsbNBLwBSndq3oHSuVYFYgoMAJ7AtvgduMFzCPtgJwlvrK6mhGL7/Dky2HOyOEP7gPsknIZJ54iqhHy3xtg+/47o084Mb2jPcp+E07BY/OAtNqSA79YY28cp2RmHwCvac9wn4TQsFj94i9WUUGyfp3LZdwicon3IfRJOw6RzRFVC2pdqCg7HsG0Y3ZWuYUewTw4k4dr5/sZrFGg8SU7HSoBXV9rnJbyxSBoF6jkQOSfqOTBJDdZzIHJOTLKAWQ+yxglYHTW7kHWuLP6dIiDd13Pj5ncg93cfKb6ZgPW7jtXfTEC6r+fGzQSy7CLWoJ3ahayLlcU/tQLSf2ASriaZmoD0H5iEFyegTsDqkFoBaz5q/0pAvWSJHVqvwBiavdcxKf5hpQAAAABJRU5ErkJggg=='
            }
        }

    }, joint.shapes.filter.SimpleInputFilter.prototype.defaults),

    exportSvg: function(graph) {

        return {
            tag: 'feGaussianBlur',
            children: null,
            attrs: {
                in: this.getIn(graph),
                result: this.getResult(),
                stdDeviation: this.get('stdDeviation')
            }
        };
    }
});

joint.shapes.filter.FeConvolveMatrix = joint.shapes.filter.SimpleInputFilter.extend({

    defaults: joint.util.deepSupplement({
        type: 'filter.FeConvolveMatrix',

        in: 'SourceGraphic',
        orderX: 3,
        orderY: 3,
        useOrderY: false,
        divisor: null,
        kernelmatrix: null,

        attrs: {
            image: {
                //https://www.iconfinder.com/icons/463709/arrow_circle_direction_doodle_scribble_swirled_icon#size=32
                'xlink:href': 'data:imae/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAD6ElEQVRYR8WWa2jNcRjHd8aEKDSXmpipkS3KJZHyxlJI1F7M3MZmtblMmBFSU8PIbGvG2LCxTZpQvKBEKXkxtxnDoti8UWsuaUNnPt/T76///p2znbPTmV99e36353m+v+d3e1xh/7m4vPgfRd9qUAc+h5qfncAAnKW6XK4C5FA57urqCpcIJQmLwFwcl+Bolt0ZBJbRvhVqAvh2/TCrbkFGgLHGaRMkplP/HSoSVgSycTAYVEHmA/I7+AJiIJCJLLUR0LYsBYpONNDWae4DUAl+BkLWeQgTIHBHxnBcSP0aOOF2u3fSNwaU015souTNj87LJ3QXSPpDxEkgU2cBlOJUK48xhrLoO2JWK7uK0CsctaqPsUnIqWCQcepmbD/1w72R6EYgPDw8D8W9AopyqFKBgw2m3srYRuqKkrNoa/KYuw05RIPMvYJYpaovIk4CZ1BKB2kolINDGNRKLGNJva2I8Qh0biMXaS71i0QzxV8ClThfC5JRqEe5STZo30Cu8MO5fYoO9BpDfhPynDd9ZwQu4Gy9SKCsMzAPtNEejXQHSEDX+wU68eAXNnRGdMO6FSeBEl07sBVlHaBh1PUsVwfo3Joej50G06jDVmKPBBg8gEKu9k2RoN2I1Ar6XLD1DOUZZitkq9FuzHkNk1CoYcJzKVEv5gDpVPe5cLMKWMR2GcBeIfY8das4CcQy6Q2DepoV/h1IfU7BlGxs5hsDLdicQP3ftXQS0MH5yITxJmRZyKJgvKO7x5wna1FT6HvrKwJhhOwkLOVYIcsnZDnBEMBeGfZ0DZ+AmeaKa5s9xVtCEofjl2a8HoXZQRBQRN+hPxlZoVcUHKSd2xMBrfwqEzxXBoVpiNd9JJGGrbPotmNnH3X9M6eJakaPBBiMNodRn0sDyrpGgWZGA7HRht5wcB8bZbSrwWUIeF5IX1tgjSk98zyfKFch1gUYhbvo6z/QzxiNnE+7VtccAnrqeyWgCfaf8B6GltDX2QsR/Yo3caSkReR1iHUNU+g7r7MAgVR/CWheDUrWL9iBQeWOu7UyL0QSmavsKdI4L0ZaD9kuxo6B4xBQBuZXBKx5OSjm0dDqVJQjNkNGb8YfxqKQscCTTWucsc1IpWhKVpq4jkX6Y8yrWBgoAc2PwtFD5ETg7fpqTicOriPTwTecnqKdAVaiq981gXq3TNuXIYugN6mboSxnIVD2rGi8B8oZlJjayxYcaxuawQgQCYE4iCWzDUrrjvaFQE/knGPKjvSoaXtU2kEHGKc6ZEaGmoCcLoeEomMvj8wZedofBPQcP8b7HLNq/TOXgOcW9QcB+dEt0eGrBV/toegvAj7PzV9NKYwwAozsXAAAAABJRU5ErkJggg=='
            }
        }

    }, joint.shapes.filter.SimpleInputFilter.prototype.defaults),

    importSvg: function(markup) {

        this.importSvgAttributes(markup);

        this.setNumberPair('orderX', 'orderY', this.get('order'), 'useOrderY');
    },

    exportSvg: function(graph) {

        return {
            tag: 'feConvolveMatrix',
            children: null,
            attrs: {
                in: this.getIn(graph),
                result: this.getResult(),
                order: this.getNumberPair('orderX', 'orderY', 'useOrderY'),
                divisor: this.get('divisor'),
                kernelMatrix: this.get('kernelmatrix')
            }
        };
    }
});

joint.shapes.filter.FeFlood = joint.shapes.filter.Filter.extend({

    defaults: joint.util.deepSupplement({
        type: 'filter.FeFlood',
        floodColor: '#FF0000',
        floodOpacity: 1,
        attrs: {
            image: {
                'xlink:href': 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAEN0lEQVRYR+2XbWiNYRjHnRdnB9vCZBM+eQlTds52zEysxEYSMuGDlNeGhOKL1+UDJSLyEmlKFDVFmJe22mz2erAPSrKiTHk/a2ycneN3Hc9zevbsOec5zlG+uOvf83Lf9/X/3//nuq9zH0u/f9wsZvw5OTmuQCDgsVgs6cFgcLhyHcm1vLm5+YjZfLN+QwEej2c0pGuZvByMjxAkiIhlTU1N181IovX3EeB2uwsJfJVJg3UTf/D8CaSB/kqfn7ErEhHRSwB2r8HmswS3gQD31Var9brNZrvh9/uTeVcJMkAQfAODQEIiwgIKCgqcHR0d7wkoRF8Ue+/LSrOzsyfoyEt49oJ7IDUREWEBkCwiULkQQj4fW+8YkePKxpaWlnNKX26iIrQCSgm2B/SAAWT4T4OVr+f9eW1ukDPTEFyhOsF1LzjOOPlEpk0rYCWjLysOzMCBRwTfRPDNvBvHdQPvLhhF1Itg7CvG3SZ/DjY0NHyMpiIsIDc3N51Ek4kDQTtW78RqERTEiYFmK3K5XHkQihMpkhNA8kmSeTNzr0USYbQLtBa3M3ErqCTIB6MgeXl5A+rq6r5Ln4EIWX06KEdcSWNj4zt9jF4CsHIi9j1Wvqd+7BtetIDn4CvoBPLZpEo2gCVCQBGbThG7qzqBk5/oG87zR94Xeb3eJm3gsADIxzKwRlEsVa6cyQU8D432DdU+xu7nkx2QZ50ISerPYBjw4cQ8hNaq80ICqAF2n89XC6mHRykym7D8tNSGzs5Od09Pj4t3bvrdXMcCKUC93KNvO0l6TA1MUctHlDghdUVEfAFSRUVMFvFfy9hQEFa/jgChvU0rpXOfyaqt+fn5g7q7u/dAsoyx9+12+476+nqfdp6BCOkfwpza1NTUWVVVVf6QALL8IpfV4LvD4RhFUknN/ysNEfshVBcktUF2mRS7LTh2UhUgJXUO8LJ6sfmvNMiXQn6FYHZZHPc2iB1K8BdwTVA/wVE6tkkHmZpFpj5NVIGOXFZuBU5tXBJyTkgA+3cmD1W/nbE8TE5OXsD36YpXhI5ctqt8+xH6eLJztKX4BAO2KIMqUlJSFsUjQkfewcKK2HaPWeQM7k8Tf5JGyKWwgMzMTEdSUtI1HFgYr4gI5OE9T7KLC9VgjMJR02svJyJCT04uFZJLdXrbcWIKTjxR3j/qcySLR4SO3KeU3D7kqhicaOV+Mm7fNDyU/okIPTmJVUhJlt+TiA0BZXSuAmURj+WxiIiHXFQh4BCXXYg9FvV/gYGIl0w8g3XPmSzHdklY+c2XbTaXwlIfy9ZFgJwpTxFnt+kfExHhdDrlmL44QnAp2/NjJZcYJOJsEvEBmGoqQCG1oHoj94eBnHjUdouE20C2v41l5eoYfq4z5MyA6KxYBYTmFhcX29ra2uTQktbV1fWstbVVflrjbVKaA38kIF6maPP+C/gFyfgFwVFPCl8AAAAASUVORK5CYII='
            }
        }

    }, joint.shapes.filter.Filter.prototype.defaults),

    importSvg: function(markup) {

        var map = {
            'flood-color': 'floodColor',
            'flood-opacity': 'floodOpacity'
        };
        this.importSvgAttributes(markup, map);
    },

    exportSvg: function() {

        return {
            tag: 'feFlood',
            children: null,
            attrs: {
                result: this.getResult(),
                'flood-color': this.get('floodColor'),
                'flood-opacity': this.get('floodOpacity')
            }
        };
    }
});

joint.shapes.filter.FeOffset = joint.shapes.filter.SimpleInputFilter.extend({

    defaults: joint.util.deepSupplement({
        type: 'filter.FeOffset',
        dx: 10,
        dy: 10,
        attrs: {
            image: {
                //https://www.iconfinder.com/icons/960942/curve_dynamic_linked_object_offset_path_tool_icon#size=48
                'xlink:href': 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAFPElEQVRoQ82aacweUxTH36LWtPYttg8Su6BIBQ1R6wdiiVpDohGpqDUi1lRI8UErRYgIQVD71g8E0aC6WFtFiX0JaldL7X4/uec1ffLMO/POMzN5T/LPc2fmzrnnP3PvueeceYb19fX9Df4AP4PvwVfgM/ABeAe8AV4DP4EhJ8Ow6J8SVknyLfAseBo8BX4ocV/jXcoS6DTkT07MBPclfNe4pTkDSECsDFYBI8HGYBOwKdge7Ai2Asvn6PiN8w+BG9IbapWLxpcRye0O9k3YORHvvPdVTlyV3orTrnEpS6DTEN/SUeBosEsXKxdx7mJwfw4D36Zrr2eSVQlk7dqBg9PAccA3lZUXODgDvAScphPBiWDr1EnHcAeYBn6t8rrqIBDjrkXjbHA6GJExxqd8E9gTbJdjpEQOBB8PlkSdBGLstWmcl578ijkGxdRZLnP9TdquraWDIdEEgRh/CxrXgv0zBv1C2+l2dzp3LL/XgZh659CeMlQIhB2vZ6bOybRv7jDwFI5vTOde5rebU8jl1OQbiEGdEiulA9dGZ0ji3hO7un07HcGAL6QNAnoXPZCyRsbYMGxNGt+mA/uuOtSm0DwM2jUZpUvVZWblLA5i3s+lvdtQI+CidTErv4PzwZ3p+Hh+J4PwVqfSNiQpLW1MoeFYMweMKmGVHuvJEv36u7RBwMHWBzNAkYdxMY8Beq5SIgFXfaVtvNQI/3dageZJwGnjjuzYC8C94FywWer6Eb+uGROrQlGJbk0S/n4BzMLeBvrkZ9K5QkU9djBcnwUMRxQTp7HAvGNACQKrDdDLlPJhcHsiV6Sz6vV9uPEJ4JtSrgAXFCmTwGKwblHHdH02v1eDB0GZVLSk2v5uZ9Kamo7Uvx8whc2VWMQGVe6SZmFbgm3AXsAkJjahrBIDr0nAlLJuMbs7NCk1OjUr/DFvkCIvZAjgUzgBHAIiJAh9ujz9vOumLnEdOG03SAqNkyZUJZC9zzDZndSkxJAgxJzYKPL6uhig52DwaNJn6O3u/GI3/UVvoNs9Bl+mi87XWHD2czqNB0tqIvIAeg5PunJDjCoEwj59+S0g4hzPm9QfBL6sgYR5t+48grtx6SEto7oXAioyTLAKYUAW8h4Nqxcf1kDiMnRclPRIRueyTCGgVwJhown9rYmQ594FewBddC+iZ7TE6fpTjgHTswrrIqDOA4DzNjbFV2jvDXpdExei4/JktDXanZoiECQey7yJe2hbO+pFVufmT0BUOtyfDDX+kzrfQOg0WLPWE6IPj5y3KhGTIN234hRyKjVGQMXXAPcMxTzX3dR1UVUM9qwdhb4NafgpoJE3oF4zLKPLiP8fp6177UVMikYnBf3VjSamUBjpU3chx2bnpmScU1WcQpFP9z+QJgloqJGlO7ZilmUdtWoUuxH3upi12S9KutYlTRMwZjLDMvxQDgPmFlXFeCimpRHrI00T0FCrDlYilOeBOW9VyeqyJDmxDQImS5+CKJ1sTvv9igxMM/0+pxh3jWqDgINlk5RLOZ5UkYCbme7TBOwvMLItAs5901BlPvC7W1VZyI3bpptHt0XAkNgnZ/SqF3JafVORgTuxn7eU8W0RcLDngF9plCNB3vezIl6X0MFpqFzZJoFsbF+qZJLDxPz8tnRtepsEDMDuSgO7Ho4oetQ5141GZ6Zrs9okYHHXap9i1SHvg18RLxewC1lZ1CaBdRgw6p1f0y5bTOskZLnl83RycZsErCnFF0hLMd0KZkVP3+vZT1KNx0KdBpkjuyPrStcDBmWDFR+Efw1Slv4L7nToaygTbXMAAAAASUVORK5CYII='
            }
        }
    }, joint.shapes.filter.SimpleInputFilter.prototype.defaults),

    exportSvg: function(graph) {


        return {
            tag: 'feOffset',
            children: null,
            attrs: {
                result: this.getResult(),
                in: this.getIn(graph),
                dx: this.get('dx'),
                dy: this.get('dy')
            }
        };
    }
});

joint.shapes.filter.FeTurbulence = joint.shapes.filter.Filter.extend({

    defaults: joint.util.deepSupplement({
        type: 'filter.FeTurbulence',

        baseFrequencyX: 0,
        baseFrequencyY: 0,
        useBaseFrequencyY: false,

        turbulenceType: 'turbulence',
        stitchTiles: null,
        seed: 0,
        numOctaves: 1,

        attrs: {
            image: {
                //https://www.iconfinder.com/icons/809997/breeze_weather_wind_icon#size=48
                'xlink:href': 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAADAUlEQVRoQ+2Yy68OMRjGz9kgYeG+ZoGQYMtOiJXEZU+s3G+JSPgXSARx34slCQkbrFkRJNjI2RKECMECv+dk5qQ6baff1286M3KaPPnaab/p87Tv+07fjo/1vIz3nP9YmwLWsnj7wUawpFjICX4fgmvgeczitiFgFsQugD3AN/8f+q6C4+BnSEhuASJ/H2yIWV3GPAJbwA/f+NwCrkNkbyT5ctgVKoe6IEA2/9Qym1e0TxZ2r8XcBM6AFQZhmZP++8IlIucOyKbltGUR+fXgi0VsLu3HlojLtA+3LeANBJYbJLZSv+sxje08v230vaa+sm0BiiYzDBKzqX/3CJjD869Gn/6rAFApOU3oI7PPLxh84HeRh7wed1LAToidB3LKY+BmQMAO+m4Z/fKXVW3vQIDvP13zaD0By4ynl6gf6boAmc1mcNoi/5u2wuhLn4BddJwDC2KXKPO4i8x31DennFgO1VXyD+Cmo8SvkAAzOmReXO90Mht9vE6EyOvf2oEyOrS9C4r1b4GO0zozOW3elpzzO9DI7v4XAvTRUAa0uJElSn+pHHiiMK1KpqYdeA9Cn/V0CqN7QyVTk4B3HV59n/SpTE0CdHSV13fVhHwiJjO1Pjixjt3eTK0PAsodcGZqEtBUFApGD8MudlPXWaw8Zt8I+HwlU8sVhUL3PJ8grCO0io41CwMCKolO7ijkuuexU02R/OYR4RSQOwrZ9zx2sr8N8nc8AiqZWpNOHIweECzveSTogEFYgtaBz5YIZ6bWpIBg9KCzvOdZQ/0ZMLlIxCmgfEDFm6mlCEiKHpAy73l09j8YcF5X12SmliIgKXowuXnPM5P2PaCr9pgylamlCEiKHpYAkZags4U/+HhVMrUUAUnRA6LOex6erwb7gI4PS4vt8GZqKQKSogfEnPc8MfZjjkkRkBQ9IBGV89YJShGgdw8dPeqIxfanChg6esQSrBuXKmDo6FFHLLZ/FALKuQaKHrEE68aNUkDdXI30TwtoZFkHeOn0DgywWI0M7f0O/AVPgbFORYhF0QAAAABJRU5ErkJggg=='
            }
        }

    }, joint.shapes.filter.Filter.prototype.defaults),

    importSvg: function(markup) {

        var markupAttrToValue = {
            stitchtiles: 'stitchTiles',
            numoctaves: 'numOctaves',
            type: 'turbulenceType'
        };

        this.importSvgAttributes(markup, markupAttrToValue);
        this.setNumberPair('baseFrequencyX', 'baseFrequencyY', this.get('basefrequency'), 'useBaseFrequencyY');
    },

    exportSvg: function() {

        return {
            tag: 'feTurbulence',
            children: null,
            attrs: {
                result: this.getResult(),
                baseFrequency: this.getNumberPair('baseFrequencyX', 'baseFrequencyY', 'useBaseFrequencyY'),
                type: this.get('turbulenceType'),
                stitchTiles: this.get('stitchTiles'),
                seed: this.get('seed'),
                numOctaves: this.get('numOctaves')
            }
        };
    }
});

joint.shapes.filter.FeMorphology = joint.shapes.filter.SimpleInputFilter.extend({

    defaults: joint.util.deepSupplement({
        type: 'filter.FeMorphology',

        operator: 'erode',

        radiusX: 0,
        radiusY: 0,
        useRadiusY: false,

        attrs: {
            image: {
                //https://www.iconfinder.com/icons/509414/biology_cell_clone_copy_icon#size=32
                'xlink:href': 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAExklEQVRYR82XeYhXVRSAHS01UsRMm9B0ChtKXLHFbBvLpKQNSxz1D8fQKYI2qEyciFYqRNssUsulVSMsWhBccC21hVwiLKLRttHKyqSsKe375N7h+vq9X78JIS98vHffdpZ7zrnnlbXIH2XcOgp+g/1Fnit260hutoU9ed9QSDpaMhkJtTA4vPwrx1UwA94qQZk2PHMd1EBf8JsqsBSmwepUYKpAB268DBcXMWkB98aDXik0enDxTegdbv7BsTXsC4p4WSVuC9daRAWO4MJiuLCI8HhrISfVkF0WDXgfesIHMBkmwrvwHKyHrqCHHgz3mxTQ5U+XIDw+ciUnr2eef4T5TbACLoPZQejjHJ8PSr3DcU1QfgDHjdEDm5lEt5Wix3IeSr1lsH4HBtwpcF8B4dO59gJUwBkwC2pVoBN8X4rU5Jk/g7C/wrVzOBpcWvd1EeHvce81+CxQqQK94ONmKuDjx8HO8N4Ijq+Cit0Oqduj5Qr3fB6Mhd3QQQWOh2/+gwIGk1HucDlMs5UwFOKaFxLuUt0M26GHCkg9dG+GEkb76cnzHTnXGypkNq0L1rrmqeUfMf8dHgNTujoG4Z1M7mmGAhaabNa8yLXRQfh5wQtZ4aawKXps8NSyqMDRQdNTS1BC684F1zsdJzDZCHqjPlg4haNrruVbYCb4nAVPZZvqgOcnwttgGuUNXX8p7Mh54EyuWwm10AxxnQ3WXdAtvKMMy70l/iAFnLeDW8HCZHDGsY2TJ8G121tEQW/53l1gpPu9OD7lZCo8A5bmAyO7GcXrbiAVoCUGlwo0d0d0D6iE9vAVfFlI8TwF/sXIQ3f7sFTgJOxzy7UfMKIt05bZZ8EyW8roz0PjYCCYYRY6C5UZ8VP6gdQDrnsdWBPcnrPD4LPMPgF58WB1tAy7DRcaP3BxArgfHBipAnE7beS6EW9VOz8odDfHQeEdc/uBAl9vFT5smv4MluGTwR1Syx8FU13lR8ErqQKXMDE/f4Fh0AXsWtzX3enuAC2fD3rH7dSakI4bmJim5v4QuAJcxjFg5fSae4WGKscMaYgecI0VpHtMO12dCtcq71tK3fvd+a5OpGu9qWrHYxl27c9OhFdxbhelIveC3dP9UKcCTn4MWhl8t+QI90U7oc/BePC92A/Y3XwIluI5QdloeSpcLzwMtmmW5wEqYCdkR+S6eYyWT0rOFe6HzoI3wGUoh1iSVWwRuNXq5ijcGLLma7nvu/bXgstpNnRUAddiK5huBo2uzhNuAPYDq5spGlNqOOe27HrBYFVgIeFmh0t3QVC+XAX8eXAJjFb3gBq4PCiSWq5wg9G2y7Ka9g/ucAZfA+jiNPiqmGu5wm1WjP6XYAkMi0Houin4W7BF0wtZ4SplOrlEDwVlODSNGMgbwvvRCwZfFK6MtdAHjLe5UYEKJptA16qdfUEVuOZa7kdsWK4Bs0QlLSrp0Or41+M39Ggq/EbmVlPT3AA0lRvTQuQfkYHki+5etlYGk/XB9ewMNpI+ZxQXGgbYU+B3PwE7oqvA+DBO3J5dqir4wg9kNyNruP+AWpMd1vLrwZa62LiImxakbGNjBdQzpnnspnP7AVPTQnIMmFr+nNpQlDrcV3TxaRD7AX9m/rGZ/e/b8d+PryUwiKCefQAAAABJRU5ErkJggg=='
            }
        }
    }, joint.shapes.filter.SimpleInputFilter.prototype.defaults),

    importSvg: function(markup) {

        this.importSvgAttributes(markup);

        this.setNumberPair('radiusX', 'radiusY', this.get('radius'), 'useRadiusY');
    },

    exportSvg: function(graph) {

        return {
            tag: 'feMorphology',
            children: null,
            attrs: {
                result: this.getResult(),
                in: this.getIn(graph),
                operator: this.get('operator'),
                radius: this.getNumberPair('radiusX', 'radiusY', 'useRadiusY')
            }
        };
    }
});

joint.shapes.filter.FeColorMatrix = joint.shapes.filter.SimpleInputFilter.extend({

    defaults: joint.util.deepSupplement({
        type: 'filter.FeColorMatrix',
        size: { width: 60, height: 60 },

        matrixType: 'matrix',
        valMatrix: '1 0 0 0 0, 0 1 0 0 0, 0 0 1 0 0, 0 0 0 10 -7',
        valSaturate: 0,
        valLuminanceToAlpha: '0 0 0 0 0, 0 0 0 0 0, 0 0 0 0 0, 0.2125 0.7154 0.0721 0 0',
        valHueRotate: 0,

        attrs: {
            image: {
                //https://www.iconfinder.com/icons/468101/dots_grid_matrix_polka_icon#size=32
                'xlink:href': 'data:image/png;base64,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'
            },
            '.': { magnet: false }
        }

    }, joint.shapes.filter.SimpleInputFilter.prototype.defaults),


    resolveValues: function() {
        var type = this.get('matrixType');

        return this.get(this.resolveValueKey(type));
    },

    resolveValueKey: function(type) {
        var typeToValueKey = {
            'matrix': 'valMatrix',
            'saturate': 'valSaturate',
            'luminanceToAlpha': 'valLuminanceToAlpha',
            'hueRotate': 'valHueRotate'
        };

        if (!typeToValueKey[type]) {
            throw new Error('FeColorMatrix: unable to resolve key for type ' + type);
        }

        return typeToValueKey[type];
    },

    importSvg: function(markup) {
        var self = this;
        var attrMap = {
            type: 'matrixType',
            values: function(attrs) {
                var type = attrs.getNamedItem('type').value;
                return self.resolveValueKey(type);
            }
        };

        this.importSvgAttributes(markup, attrMap);
    },

    exportSvg: function(graph) {

        return {
            tag: 'feColorMatrix',
            children: null,
            attrs: {
                in: this.getIn(graph),
                result: this.getResult(),
                type: this.get('matrixType'),
                values: this.resolveValues()
            }
        };
    }
});

joint.shapes.filter.FeMerge = joint.shapes.filter.Filter.extend(_.extend({}, joint.shapes.basic.PortsModelInterface, {

    markup: '<g class="rotatable"><g class="scalable"><circle class="circle-body"/><image/></g><text class="label"/><g class="inPorts"/><g class="outPorts"/></g>',
    portMarkup: '<g class="port port<%= id %>"><circle class="port-body"/><line class="port-line" /><text class="port-label"/><circle class="port-magnet"/></g>',

    defaults: joint.util.deepSupplement({
        type: 'filter.FeMerge',

        inPorts: ['IN1', 'IN2'],
        outPorts: [],
        in: [],

        attrs: {
            '.': { magnet: false },
            '.circle-body': {
                fill: '#ffffff', r: 30, cx: 30, cy: 30
            },
            image: {
                'xlink:href': 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiA/PjxzdmcgaGVpZ2h0PSIxMDAiIGlkPSJMYXllcl8xIiB2ZXJzaW9uPSIxLjEiIHZpZXdCb3g9IjAgMCAxMDYuMjU0IDEwMS42NjciIHdpZHRoPSIxMDAiIHhtbDpzcGFjZT0icHJlc2VydmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6Y2M9Imh0dHA6Ly9jcmVhdGl2ZWNvbW1vbnMub3JnL25zIyIgeG1sbnM6ZGM9Imh0dHA6Ly9wdXJsLm9yZy9kYy9lbGVtZW50cy8xLjEvIiB4bWxuczppbmtzY2FwZT0iaHR0cDovL3d3dy5pbmtzY2FwZS5vcmcvbmFtZXNwYWNlcy9pbmtzY2FwZSIgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIiB4bWxuczpzb2RpcG9kaT0iaHR0cDovL3NvZGlwb2RpLnNvdXJjZWZvcmdlLm5ldC9EVEQvc29kaXBvZGktMC5kdGQiIHhtbG5zOnN2Zz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxkZWZzIGlkPSJkZWZzOSIvPjxnIGlkPSJnMzc1NiIgdHJhbnNmb3JtPSJtYXRyaXgoMC44NjYwMjg3MSwwLDAsMC44NjYwMjg3MSw3LjAzNDU1NiwtMS44MjU4MDUzKSI+PHBhdGggZD0ibSAzMy42NDUzNjcsMjUuNjM1NTkzIDMwLjcyMTg1MywwIC0xMi43MjYzODcsMjMuODM0NzQ2IC0wLjEwNTkzMiwyNy43NTg0MjYgLTQuMTk0NzAxLDIuOTk2MjE1IDAsLTMwLjc1NDY0MSB6IiBpZD0icGF0aDI5ODIiIHN0eWxlPSJmaWxsOiMwMDAwMDA7c3Ryb2tlOm5vbmUiIHRyYW5zZm9ybT0ibWF0cml4KDEuMDYyNTQsMCwwLDEuMDYyNTQsMCwtMi4yOTM1KSIvPjxwYXRoIGQ9Im0gMTguMzI5MzksNC43NjY5NDkxIDI2LjA5MjU1Myw0NS44Njg2NDM5IDAsMzQuODQxMDQ4IDEwLjMwODY1NiwtNi4xNDQwNjggMC4xMDU5MzIsLTI5Ljg2MjIzNCAyNS42ODcwMDEsLTQ0LjcwMzM4OTkgNC4xMTYyOTksLTEwZS04IEwgNTguNjg2NDQxLDUwLjYzNTU5MyA1OC41ODA1MDksODEuNDYxODY0IDQwLjQ2NjEwMiw5My4zMjYyNzEgNDAuMTQ4MzA1LDQ5LjQ3MDMzOSAxNC4xOTQ5MTYsNC43NjY5NDkgeiIgaWQ9InBhdGgzNzUyIiBzdHlsZT0iZmlsbDojMDAwMDAwO2ZpbGwtb3BhY2l0eToxO3N0cm9rZTpub25lIiB0cmFuc2Zvcm09Im1hdHJpeCgxLjA2MjU0LDAsMCwxLjA2MjU0LDAsLTIuMjkzNSkiLz48L2c+PGcgaWQ9ImcxMDIiIHRyYW5zZm9ybT0ibWF0cml4KDAuMTk0ODYxMzQsMCwwLDAuMTk0ODYxMzQsNDQuMTUxMDg5LDgwLjU3NDE2NikiPjxwYXRoIGQ9Ik0gNTAuNjg0LDQgQyA1OSwyNiA2NS4xNjUsMzQuMDgzIDc1LjcxNCw1NS41NzYgODUuOTUyLDc2LjQzOCA3MC43OCw5Ny40IDUwLjY4NCw5Ny40IDMwLjU4OCw5Ny40IDE1LjQxNCw3Ni40MzcgMjUuNjU2LDU1LjU3NiAzNi4yMDEsMzQuMDgzIDQyLDI2IDUwLjY4NCw0IHoiIGlkPSJwYXRoMTA0Ii8+PC9nPjwvc3ZnPg=='
            },
            '.port-body': {
                fill: '#ffffff', r: 20, cx: 20, cy: 20, stroke: '#f6f6f6', 'stroke-width': 3
            },
            '.port-magnet': {
                r: 20, cx: 20, cy: 20, fill: 'transparent', magnet: 'passive'
            },
            '.port-line': {
                x1: 20, y1: 40, x2: 20, y2: 50, stroke: '#f6f6f6', 'stroke-width': 3
            },
            '.port-label': {
                fill: '#000000', x: 20, y: 25, 'text-anchor': 'middle'
            }
        }

    }, joint.shapes.filter.Filter.prototype.defaults),


    importSvg: function(markup) {

        this.importSvgAttributes(markup);

        var children = $(markup).find('[in]').andSelf();
        var inputs = [];
        var inPorts = this.get('inPorts');

        children.each(function(portName) {
            var inputAttr = $(this).attr('in');

            if (inputAttr) {
                inputs.push(inputAttr);
            }
            if (inputs.length > inPorts.length) {
                inPorts.push(portName);
            }
        });

        this.set('in', inputs);
        var i = 1;
        this.prop('inPorts', inputs.map(function() {
            return 'IN' + i++;
        }));
    },

    getPortAttrs: function(portName, index, total, selector, type) {

        var attrs = {};

        var portClass = 'port' + index;
        var portSelector = selector + '>.' + portClass;
        var portLabelSelector = portSelector + '>.port-label';
        var portBodySelector = portSelector + '>.port-magnet';

        attrs[portLabelSelector] = { text: portName };
        attrs[portBodySelector] = { port: { id: portName || _.uniqueId(type), type: type } };
        attrs[portSelector] = { ref: '.circle-body', 'ref-x': 10, 'ref-y': (total - index) * -50 };

        if (selector === '.outPorts') {
            attrs[portSelector]['ref-dx'] = 0;
        }

        return attrs;
    },

    getConnectedPorts: function(graph, links) {

        var portsMap = [];

        _.each(links, function(link) {

            var inPorts = this.get('inPorts');

            var target = link.get('target');
            if (target.port) {
                var index = inPorts.indexOf(target.port);
                portsMap[index] = graph.getCell(link.get('source').id).getResult();
            }
        }, this);

        this.set('in', portsMap);
        return portsMap;
    },

    resolveUsedPorts: function(graph, links) {

        this.getConnectedPorts(graph, links);

        return this.get('in').map(function(item) {
            return { tag: 'feMergeNode', attrs: { 'in': item } };
        });
    },

    exportSvg: function(graph) {

        var links = graph.getConnectedLinks(this);
        return {
            tag: 'feMerge',
            attrs: {
                result: this.getResult()
            },
            children: this.resolveUsedPorts(graph, links)
        };
    }
}));

joint.shapes.filter.FeComposite = joint.shapes.filter.Filter.extend(_.extend({}, joint.shapes.basic.PortsModelInterface, {

    markup: '<g class="rotatable"><g class="scalable"><circle class="circle-body"/><image/></g><text class="label"/><g class="inPorts"/><g class="outPorts"/></g>',
    portMarkup: '<g class="port port<%= id %>"><circle class="port-body"/><line class="port-line" /><text class="port-label"/><circle class="port-magnet" /></g>',

    defaults: joint.util.deepSupplement({
        type: 'filter.FeComposite',

        inPorts: ['IN', 'IN2'],
        outPorts: [],
        in: [],

        operator: 'in',// over | in | out | atop | xor | arithmetic,
        k1: null, //Only applicable if operator="arithmetic".
        k2: null, //Only applicable if operator="arithmetic".
        k3: null, //Only applicable if operator="arithmetic".
        k4: null, //Only applicable if operator="arithmetic".
        attrs: {
            image: {
                //https://www.iconfinder.com/icons/322808/arrow_arrows_creative_direction_grid_join_move_right_shape_icon#size=48
                'xlink:href': 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiA/PjxzdmcgaGVpZ2h0PSI1MTJtbSIgaWQ9InN2ZzQ5OTQiIHZlcnNpb249IjEuMSIgdmlld0JveD0iMCAwIDE4MTQuMTczMiAxODE0LjE3MzIiIHdpZHRoPSI1MTJtbSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczpjYz0iaHR0cDovL2NyZWF0aXZlY29tbW9ucy5vcmcvbnMjIiB4bWxuczpkYz0iaHR0cDovL3B1cmwub3JnL2RjL2VsZW1lbnRzLzEuMS8iIHhtbG5zOmlua3NjYXBlPSJodHRwOi8vd3d3Lmlua3NjYXBlLm9yZy9uYW1lc3BhY2VzL2lua3NjYXBlIiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiIHhtbG5zOnNvZGlwb2RpPSJodHRwOi8vc29kaXBvZGkuc291cmNlZm9yZ2UubmV0L0RURC9zb2RpcG9kaS0wLmR0ZCIgeG1sbnM6c3ZnPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnMgaWQ9ImRlZnM0OTk2Ii8+PGcgaWQ9ImxheWVyMSIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMCw3NjEuODExMDIpIj48ZyBpZD0iZzQ1NDIiIHN0eWxlPSJzdHJva2U6bm9uZSIgdHJhbnNmb3JtPSJtYXRyaXgoMy4xMjMxODQ1LDAsMCwzLjI3OTgyMzMsLTgyMDMuMDY5MywtNjM1Mi4zMjE4KSI+PHBhdGggZD0ibSAzMDgzLjM1MTUsMTk3Ny40NTUgYyAtMC41NTE0LC0yOS4zODA3IC0xMC4wOTE2LC01Mi41NjczIC0yMy44NTg1LC02OC44NjYgLTE1LjczNjIsLTE4LjYyOTggLTM1LjkzMzksLTI4LjIwODcgLTUzLjMxMjIsLTMxLjgzMjYgLTM3LjQwNTgsLTcuODAwMiAtNzkuNDY5NSw4LjUwODUgLTExNC44OTg4LDM3LjM1NyAtOS4zNzU3LDcuMzE1MiAtMzEuNTAyOSwxNC4xOTE0IC01My4zNzk2LDE3LjQzMzMgLTIxLjg3NjksMy4yNDE3IC00My44Nzg4LDMuNzY2NiAtNTMuNjE1OSwzLjQxODQgLTAuMjA1NywtMC4wMTcgLTAuNDExNiwtMC4wMTcgLTAuNjE3NSwtMC4wMTcgbCAtODcuNDQ5NywwIGMgLTkuNjM4MiwtMC4xMzcyIC0xNy41MjQxLDcuNjM5MSAtMTcuNTI0MSwxNy4yNzgxIDAsOS42Mzg4IDcuODg1OSwxNy40MTQzIDE3LjUyNDEsMTcuMjc4IGwgODcuNDQ5NywwIC0wLjYxNzUsLTAuMDE3IGMgMTIuNTM2MywwLjQ0OCAzNS4zNzk2LC0wLjEzNzIgNTkuOTE2LC0zLjc3MjggMjQuNTM2NywtMy42MzU5IDUwLjM5MzEsLTkuNDA0OCA2OS41NzE0LC0yNC4zNjggMC4xMDA5LC0wLjA3OSAwLjIwMzQsLTAuMTYwNyAwLjMwMzUsLTAuMjQzMSAyOS42MDk3LC0yNC4xOTU5IDY0LjYwNzgsLTM1LjA1MzIgODYuMjgyMSwtMzAuNTMzNCAxMC40ODc0LDIuMTg2OCAyNC4wMjQ3LDguNTI4MiAzMy45NzIyLDIwLjMwNTEgNi4zMjYyLDcuNDg5MyAxMS42MTg0LDE3LjIxMTEgMTQuMTQzMSwzMC41MzggMS4zMjU1LDkuNzU1NiAyLjcyNTEsMzAuNDcwNiAtMC4xOTU0LDQ1LjE0MDQgLTIuNTk1MiwxMi44MjA0IC03Ljc3OTcsMjIuMjQ2NCAtMTMuOTQ3NywyOS41NDg3IC05Ljk0NzcsMTEuNzc2NiAtMjMuNDg0OCwxOC4xMTQ3IC0zMy45NzIyLDIwLjMwMTYgLTIxLjY3NDMsNC41MTk4IC01Ni42NzI0LC02LjMzNDEgLTg2LjI4MjEsLTMwLjUzIC0wLjEsLTAuMDgyIC0wLjIwMTUsLTAuMTYyNCAtMC4zMDM1LC0wLjI0MjkgLTE5LjE3ODMsLTE0Ljk2MzQgLTQ1LjAzNDcsLTIwLjczNTggLTY5LjU3MTQsLTI0LjM3MTUgLTI0LjUzNjQsLTMuNjM1OSAtNDcuMzc5NywtNC4yMjA4IC01OS45MTYsLTMuNzcyOSBsIDAuNjE3NSwtMC4wMTcgLTg3LjQ0OTcsMCBjIC05LjYzODIsLTAuMTM1OCAtMTcuNTI0MSw3LjYzOTIgLTE3LjUyNDEsMTcuMjc4IDAsOS42Mzg5IDcuODg1OSwxNy40MTQ0IDE3LjUyNDEsMTcuMjc4MSBsIDg3LjQ0OTcsMCBjIDAuMjA1OSwwIDAuNDExOCwwIDAuNjE3NSwtMC4wMTcgOS43MzcxLC0wLjM0OCAzMS43MzksMC4xNzY3IDUzLjYxNTksMy40MTg1IDIxLjg3NjcsMy4yNDE2IDQ0LjAwMzksMTAuMTE4MiA1My4zNzk2LDE3LjQzMzIgMzUuNDI5MywyOC44NDg4IDc3LjQ5Myw0NS4xNjA2IDExNC44OTg4LDM3LjM2MDQgMTcuMzc4MywtMy42MjQgMzcuNTc2LC0xMy4yMDY0IDUzLjMxMjIsLTMxLjgzNjIgMTMuNzY2OSwtMTYuMjk4NSAyMy4zMDcxLC0zOS40ODUyIDIzLjg1ODUsLTY4Ljg2NTcgbCAwLC0wLjAxNyBjIDAuMDM2LC0xLjk3NjEgMC4wMjcsLTMuOTg0OSAtMC4wMjEsLTYuMDE3IDAuMDQ1LC0yLjAzMyAwLjA1NywtNC4wNDMxIDAuMDIxLC02LjAyMDIgeiIgaWQ9InBhdGg0NTI5IiBzdHlsZT0iY29sb3I6IzAwMDAwMDtmb250LXN0eWxlOm5vcm1hbDtmb250LXZhcmlhbnQ6bm9ybWFsO2ZvbnQtd2VpZ2h0Om5vcm1hbDtmb250LXN0cmV0Y2g6bm9ybWFsO2ZvbnQtc2l6ZTptZWRpdW07bGluZS1oZWlnaHQ6bm9ybWFsO2ZvbnQtZmFtaWx5OnNhbnMtc2VyaWY7dGV4dC1pbmRlbnQ6MDt0ZXh0LWFsaWduOnN0YXJ0O3RleHQtZGVjb3JhdGlvbjpub25lO3RleHQtZGVjb3JhdGlvbi1saW5lOm5vbmU7dGV4dC1kZWNvcmF0aW9uLXN0eWxlOnNvbGlkO3RleHQtZGVjb3JhdGlvbi1jb2xvcjojMDAwMDAwO2xldHRlci1zcGFjaW5nOm5vcm1hbDt3b3JkLXNwYWNpbmc6bm9ybWFsO3RleHQtdHJhbnNmb3JtOm5vbmU7ZGlyZWN0aW9uOmx0cjtibG9jay1wcm9ncmVzc2lvbjp0Yjt3cml0aW5nLW1vZGU6bHItdGI7YmFzZWxpbmUtc2hpZnQ6YmFzZWxpbmU7dGV4dC1hbmNob3I6c3RhcnQ7d2hpdGUtc3BhY2U6bm9ybWFsO2NsaXAtcnVsZTpub256ZXJvO2Rpc3BsYXk6aW5saW5lO292ZXJmbG93OnZpc2libGU7dmlzaWJpbGl0eTp2aXNpYmxlO29wYWNpdHk6MTtpc29sYXRpb246YXV0bzttaXgtYmxlbmQtbW9kZTpub3JtYWw7Y29sb3ItaW50ZXJwb2xhdGlvbjpzUkdCO2NvbG9yLWludGVycG9sYXRpb24tZmlsdGVyczpsaW5lYXJSR0I7c29saWQtY29sb3I6IzAwMDAwMDtzb2xpZC1vcGFjaXR5OjE7ZmlsbDojMDAwMDAwO2ZpbGwtb3BhY2l0eToxO2ZpbGwtcnVsZTpldmVub2RkO3N0cm9rZTpub25lO3N0cm9rZS13aWR0aDoyMDtzdHJva2UtbGluZWNhcDpyb3VuZDtzdHJva2UtbGluZWpvaW46cm91bmQ7c3Ryb2tlLW1pdGVybGltaXQ6NDtzdHJva2UtZGFzaGFycmF5Om5vbmU7c3Ryb2tlLWRhc2hvZmZzZXQ6MDtzdHJva2Utb3BhY2l0eToxO2NvbG9yLXJlbmRlcmluZzphdXRvO2ltYWdlLXJlbmRlcmluZzphdXRvO3NoYXBlLXJlbmRlcmluZzphdXRvO3RleHQtcmVuZGVyaW5nOmF1dG87ZW5hYmxlLWJhY2tncm91bmQ6YWNjdW11bGF0ZSIvPjxwYXRoIGQ9Im0gMjc0Ny44MjksMTk3Ny40NTUgYyAwLjU1MTUsLTI5LjM4MDcgMTAuMDkxNywtNTIuNTY3MyAyMy44NTg2LC02OC44NjYgMTUuNzM2MiwtMTguNjI5OCAzNS45MzM5LC0yOC4yMDg3IDUzLjMxMjIsLTMxLjgzMjYgMzcuNDA1OCwtNy44MDAyIDc5LjQ2OTQsOC41MDg1IDExNC44OTg4LDM3LjM1NyA5LjM3NTcsNy4zMTUyIDMxLjUwMjksMTQuMTkxNCA1My4zNzk0LDE3LjQzMzMgMjEuODc3MSwzLjI0MTcgNDMuODc5LDMuNzY2NiA1My42MTYsMy40MTg0IDAuMjA1OCwtMC4wMTcgMC40MTE2LC0wLjAxNyAwLjYxNzUsLTAuMDE3IGwgODcuNDQ5OCwwIGMgOS42MzgxLC0wLjEzNzIgMTcuNTI0MSw3LjYzOTEgMTcuNTI0MSwxNy4yNzgxIDAsOS42Mzg4IC03Ljg4NiwxNy40MTQzIC0xNy41MjQxLDE3LjI3OCBsIC04Ny40NDk4LDAgMC42MTc2LC0wLjAxNyBjIC0xMi41MzYzLDAuNDQ4IC0zNS4zNzk4LC0wLjEzNzIgLTU5LjkxNjMsLTMuNzcyOCAtMjQuNTM2NCwtMy42MzU5IC01MC4zOTI4LC05LjQwNDggLTY5LjU3MTEsLTI0LjM2OCAtMC4xMDA5LC0wLjA3OSAtMC4yMDM0LC0wLjE2MDcgLTAuMzAzNSwtMC4yNDMxIC0yOS42MDk3LC0yNC4xOTU5IC02NC42MDc4LC0zNS4wNTMyIC04Ni4yODIxLC0zMC41MzM0IC0xMC40ODc0LDIuMTg2OCAtMjQuMDI0OCw4LjUyODIgLTMzLjk3MjIsMjAuMzA1MSAtNi4zMjYyLDcuNDg5MyAtMTEuNjE4NCwxNy4yMTExIC0xNC4xNDMxLDMwLjUzOCAtMS4zMjU3LDkuNzU1NiAtMi43MjUyLDMwLjQ3MDYgMC4xOTU0LDQ1LjE0MDQgMi41OTUxLDEyLjgyMDQgNy43Nzk1LDIyLjI0NjQgMTMuOTQ3NywyOS41NDg3IDkuOTQ3NywxMS43NzY2IDIzLjQ4NDgsMTguMTE0NyAzMy45NzIyLDIwLjMwMTYgMjEuNjc0Myw0LjUxOTggNTYuNjcyNCwtNi4zMzQxIDg2LjI4MjEsLTMwLjUzIDAuMSwtMC4wODIgMC4yMDE0LC0wLjE2MjQgMC4zMDM1LC0wLjI0MjkgMTkuMTc4MywtMTQuOTYzNCA0NS4wMzQ3LC0yMC43MzU4IDY5LjU3MTEsLTI0LjM3MTUgMjQuNTM2NSwtMy42MzU5IDQ3LjM4LC00LjIyMDggNTkuOTE2MywtMy43NzI5IGwgLTAuNjE3NiwtMC4wMTcgODcuNDQ5OCwwIGMgOS42MzgxLC0wLjEzNTggMTcuNTI0MSw3LjYzOTIgMTcuNTI0MSwxNy4yNzggMCw5LjYzODkgLTcuODg2LDE3LjQxNDQgLTE3LjUyNDEsMTcuMjc4MSBsIC04Ny40NDk4LDAgYyAtMC4yMDU5LDAgLTAuNDExNywwIC0wLjYxNzUsLTAuMDE3IC05LjczNywtMC4zNDggLTMxLjczODksMC4xNzY3IC01My42MTYsMy40MTg1IC0yMS44NzY1LDMuMjQxNiAtNDQuMDAzNywxMC4xMTgyIC01My4zNzk0LDE3LjQzMzIgLTM1LjQyOTQsMjguODQ4OCAtNzcuNDkzLDQ1LjE2MDYgLTExNC44OTg4LDM3LjM2MDQgLTE3LjM3ODMsLTMuNjI0IC0zNy41NzYsLTEzLjIwNjQgLTUzLjMxMjIsLTMxLjgzNjIgLTEzLjc2NjksLTE2LjI5ODUgLTIzLjMwNzEsLTM5LjQ4NTIgLTIzLjg1ODYsLTY4Ljg2NTcgbCAwLC0wLjAxNyBjIC0wLjAzNywtMS45NzYxIC0wLjAyNywtMy45ODQ5IDAuMDIxLC02LjAxNyAtMC4wNDUsLTIuMDMzIC0wLjA1NywtNC4wNDMxIC0wLjAyMSwtNi4wMjAyIHoiIGlkPSJwYXRoNDU0MCIgc3R5bGU9ImNvbG9yOiMwMDAwMDA7Zm9udC1zdHlsZTpub3JtYWw7Zm9udC12YXJpYW50Om5vcm1hbDtmb250LXdlaWdodDpub3JtYWw7Zm9udC1zdHJldGNoOm5vcm1hbDtmb250LXNpemU6bWVkaXVtO2xpbmUtaGVpZ2h0Om5vcm1hbDtmb250LWZhbWlseTpzYW5zLXNlcmlmO3RleHQtaW5kZW50OjA7dGV4dC1hbGlnbjpzdGFydDt0ZXh0LWRlY29yYXRpb246bm9uZTt0ZXh0LWRlY29yYXRpb24tbGluZTpub25lO3RleHQtZGVjb3JhdGlvbi1zdHlsZTpzb2xpZDt0ZXh0LWRlY29yYXRpb24tY29sb3I6IzAwMDAwMDtsZXR0ZXItc3BhY2luZzpub3JtYWw7d29yZC1zcGFjaW5nOm5vcm1hbDt0ZXh0LXRyYW5zZm9ybTpub25lO2RpcmVjdGlvbjpsdHI7YmxvY2stcHJvZ3Jlc3Npb246dGI7d3JpdGluZy1tb2RlOmxyLXRiO2Jhc2VsaW5lLXNoaWZ0OmJhc2VsaW5lO3RleHQtYW5jaG9yOnN0YXJ0O3doaXRlLXNwYWNlOm5vcm1hbDtjbGlwLXJ1bGU6bm9uemVybztkaXNwbGF5OmlubGluZTtvdmVyZmxvdzp2aXNpYmxlO3Zpc2liaWxpdHk6dmlzaWJsZTtvcGFjaXR5OjE7aXNvbGF0aW9uOmF1dG87bWl4LWJsZW5kLW1vZGU6bm9ybWFsO2NvbG9yLWludGVycG9sYXRpb246c1JHQjtjb2xvci1pbnRlcnBvbGF0aW9uLWZpbHRlcnM6bGluZWFyUkdCO3NvbGlkLWNvbG9yOiMwMDAwMDA7c29saWQtb3BhY2l0eToxO2ZpbGw6IzAwMDAwMDtmaWxsLW9wYWNpdHk6MTtmaWxsLXJ1bGU6ZXZlbm9kZDtzdHJva2U6bm9uZTtzdHJva2Utd2lkdGg6MjA7c3Ryb2tlLWxpbmVjYXA6cm91bmQ7c3Ryb2tlLWxpbmVqb2luOnJvdW5kO3N0cm9rZS1taXRlcmxpbWl0OjQ7c3Ryb2tlLWRhc2hhcnJheTpub25lO3N0cm9rZS1kYXNob2Zmc2V0OjA7c3Ryb2tlLW9wYWNpdHk6MTtjb2xvci1yZW5kZXJpbmc6YXV0bztpbWFnZS1yZW5kZXJpbmc6YXV0bztzaGFwZS1yZW5kZXJpbmc6YXV0bzt0ZXh0LXJlbmRlcmluZzphdXRvO2VuYWJsZS1iYWNrZ3JvdW5kOmFjY3VtdWxhdGUiLz48L2c+PC9nPjwvc3ZnPg=='
            },
            '.': { magnet: false },
            '.port-body': {
                fill: '#ffffff', stroke: '#f6f6f6', r: 20, cx: -30, cy: 20, 'stroke-width': 3
            },
            '.port-magnet': {
                r: 20, cx: -30, cy: 20, fill: 'transparent', stoke: 'transparent', magnet: 'passive'
            },
            '.port-line': {
                x1: -10, y1: 20, x2: 0, y2: 20, stroke: '#f6f6f6', 'stroke-width': 3
            },
            '.port-label': {
                fill: '#000000', x: -30, y: 25, 'text-anchor': 'middle'
            },
            '.circle-body': {
                fill: '#ffffff', r: 30, cx: 30, cy: 30
            }
        }

    }, joint.shapes.filter.Filter.prototype.defaults),

    importSvg: function(markup) {

        this.importSvgAttributes(markup);

        var inputs = [$(markup).attr('in'), $(markup).attr('in2')];
        this.set('in', inputs);
    },

    getPortAttrs: function(portName, index, total, selector, type) {

        var attrs = {};

        var portClass = 'port' + index;
        var portSelector = selector + '>.' + portClass;
        var portLabelSelector = portSelector + '>.port-label';
        var portBodySelector = portSelector + '>.port-magnet';
        var lineSelector = portSelector + '>.port-line';

        attrs[portLabelSelector] = { text: portName };
        attrs[portBodySelector] = { port: { id: portName || _.uniqueId(type), type: type } };
        attrs[portSelector] = { ref: '.circle-body', 'ref-y': 10, 'ref-x': index * 120 };
        attrs[lineSelector] = { ref: '.circle-body', 'ref-y': 0, 'ref-x': index * -50 };

        if (selector === '.outPorts') {
            attrs[portSelector]['ref-dx'] = 0;
        }

        return attrs;
    },

    getConnectedPorts: function(graph, links) {

        var portsMap = {};

        _.each(links, function(link) {

            var target = link.get('target');
            if (target.port) {
                portsMap[target.port] = graph.getCell(link.get('source').id).getResult();
            }
        }, this);

        return portsMap;
    },

    exportSvg: function(graph) {

        var portsMap = this.getConnectedPorts(graph, graph.getConnectedLinks(this));

        return {
            tag: 'feComposite',
            children: null,
            attrs: {
                in: portsMap['IN'],
                in2: portsMap['IN2'],
                result: this.getResult(),
                operator: this.get('operator'),
                k1: this.get('k1'),
                k2: this.get('k2'),
                k3: this.get('k3'),
                k4: this.get('k4')
            }
        };
    }
}));

joint.shapes.filter.FeCompositeView = joint.dia.ElementView.extend(joint.shapes.basic.PortsViewInterface);
joint.shapes.filter.FeMergeView = joint.dia.ElementView.extend(joint.shapes.basic.PortsViewInterface);

