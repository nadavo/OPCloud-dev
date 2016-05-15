/*! Rappid v1.7.1 - HTML5 Diagramming Framework

Copyright (c) 2015 client IO

 2016-03-03 


This Source Code Form is subject to the terms of the Rappid Academic License
, v. 1.0. If a copy of the Rappid License was not distributed with this
file, You can obtain one at http://jointjs.com/license/rappid_academic_v1.txt
 or from the Rappid archive as was distributed by client IO. See the LICENSE file.*/


var CommonInspectorInputs = {

    size: {
        width: { type: 'number', min: 1, max: 500, group: 'geometry', index: 1 },
        height: { type: 'number', min: 1, max: 500, group: 'geometry', index: 2 }
    },
    position: {
        x: { type: 'number', min: 1, max: 2000, group: 'geometry', index: 3 },
        y: { type: 'number', min: 1, max: 2000, group: 'geometry', index: 4 }
    },
    name: { type: 'text', group: 'data', index: 1 }
};

var CommonInspectorGroups = {

    text: { label: 'Text', index: 1 },
    presentation: { label: 'Presentation', index: 2 },
    geometry: { label: 'Geometry', index: 3, closed: true },
    data: { label: 'Data', index: 4 }
};

var CommonInspectorTextInputs = {
    'text': { type: 'textarea', group: 'text', index: 1 },
    'font-size': { type: 'range', min: 5, max: 80, unit: 'px', group: 'text', index: 2, when: { regex: { 'attrs/text/text': 'a.c' } } },
    'font-family': { type: 'select-box', width: 200, previewMode: true, options: [{ content: 'Arial' }, { content: 'Helvetica' }, { content: 'Times New Roman' }, { content: 'Courier New' }, { content: 'Georgia' }, { content: 'Garamond' }, { content: 'Tahoma' }, { content: 'Lucida Console' }, { content: 'Comic Sans MS' }], group: 'text', index: 3 },
    'fill': { type: 'color-palette', group: 'text', index: 4, options: [{ content: '#000000' }, { content: '#FFFFFF' }, { content: 'transparent', icon: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGoAAABrCAYAAACffRcyAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAABPxJREFUeNrsnc9rU1kUx+/LS2LTBtI4VMiqjYjiQgQ3IoIUuhvGUmYzUBgV8SdWLS7sooLgxm0XgjKg0P+gMDC7ggjDzGwGOt1psS2WBptioiYVmrbxnviiSc17eaPvvdzz7vcLlyTk5vVyPtzzzv3mtDWq1arYrVwuNyAfxuUYkaNfQEFoWY4ZOaYymczS7jeNRlASUC9NlOMs4tZRTdNGkcCKX4GyID2V4yjipITm5Bisw4oAkrIiFk8tNp9AWekOkNSENVVLfaurq1Q4LCImSisbtao7R5mmWTQMYxPx8l6yRohvb2/3tpk2HrVKcFtA6XT6WSwWKyOk/qlSqfQUCoVTDsBGIk7nJEAKRhRjirXDlP6I024CpGBhUczt3rcFhXtS8HKKeQTh4aHot35Q3vyObW1tpdvNSyQSi8lk8iWu1yFQtGg59rWbJyuZNVzv+4XUx0QABVCa68+/0mJi8oj4/Y99Xlwuioj6BOn8lSHx4UOs9vr0j2vYUYrJ/G++6zOkRKIihn9aQepTzV14viB6Lo5lP0N68mhWnDxRACjFIP1w9YYwNjZMryEBlNeQSmVR7e7e9hoSib44rLasMqLRtb6+vlm7D5ZKpf3ycNfj4qCY2tnZ2dM2t5tmSY4NbtejexKlO9pJBOndbw/ym4cPtd0ArRyMfD4/ZHeo/uaqz61N4vTDGxWPx9dSqdQ8q+tRdXfhGhUOtXRnPH44u3nwwDE/HAykPi9KcB/uSQDFEBJAMYEEUEwgAdT3OA4BQgIoBRwHgGLiOAAUE8fBrXzvmaATPR0W3TgEdPhU5Xo1x+Hy9WbHQR5m5QnZk/XJOa8DAeW2h0A3x8Ht+pD6GJfgAMUcEkDZQSLdmfhbFUgAZQfp9q1/xK+jKyotUXtQTY5DHdLYlZeqrVNrUE2Og8KQtAbV5DgoDklbUI2OAwdIJO16Jhp7HOh1eXLizcbPw1tBrw89E24dB2snSUjZTqwPPRP/pwRXPN3pB4o5JD1AhQBS+EGFBFKoQXFxHLQGxclx0BYUN8dBS1CR9yWRuneflePgVqHpmTCKb83kxWvZyOJSV4PjkJUn0KwK62txgNawZyKfj4vRc0Pi1UpXpx0H9EzYRzAuRn4hSL1hS3fhAaUJJN6gNILEF5RmkFiCoupON0jsQNE5KXnmQlY3SKxAEaS9V2+K+jlJJ0hsQNUhxV4sCB0h1VK+6j0TNcdBprtdjkPgPQ7omQiZ46Bfz4SGJTg/UIDEABQgMQAFSOqD0tVxYAVKZ8eBDSjdHQcWoOA4uFfHeia49Tjo2TMRYschPD0TKMEZgAIkBqAAiQEoQFIfFBwHBqDgODAABceBASg4Dj7cQrzumQhrj0O4eibgODDomUAJzuAeBUhMQF0aOw5IHECVy3FA8lfe/HvXu5P/1h4V+husANVKAMTXmYAACqnPD9EJ3M3hzm0PgW7XCwyU29/6wPWQ+nCPghQAVa1W4whPsHKKuS0oeUPsrVQqPQhfMKJYU8ydQC3bvVkoFE4BVjCQKNYOU5ap6puR46bdrlpfXx82TbNoGMYmQupPunPaSZZm6BveAflkESFTWtlIJpNZkk+mEQtlNU2M6sXEuBxziIlymrPYfKr6JLGifBgELOUgDVpsvpTnDbCQBhVId42QSIasOr6alcvlBqwtNyJHP+IWiJatCnzKqhua1BIUpJ4+CjAAVnYzLhKE5pcAAAAASUVORK5CYII=' }, { content: '#B3B3B3' }, { content: '#808080' }, { content: '#4D4D4D' }, { content: '#E6E6E6' }, { content: '#FFC7C9' }, { content: '#FFA0A4' }, { content: '#E3686D' }, { content: '#D71920' }, { content: '#FFE3D1' }, { content: '#FFCBA8' }, { content: '#FFAB73' }, { content: '#F58235' }] },
    style: {
        'text-decoration': { type: 'select-button-group', previewMode: true, defaultValue: 'none', options: [
            { value: 'none', content: 'N' },
            { value: 'underline', content: '<span style="text-decoration: underline">U</span>' },
            { value: 'overline', content: '<span style="text-decoration: overline">O</span>' },
            { value: 'line-through', content: '<span style="text-decoration: line-through">S</span>' }
        ], group: 'text' }
    }
};

var InspectorDefs = {

    'link': {

        inputs: {

            attrs: {
                '.connection': {
                    'stroke-width': { type: 'range', min: 0, max: 50, defaultValue: 1, unit: 'px', group: 'connection', index: 1 },
                    'stroke': { type: 'color', group: 'connection', index: 2 }
                },
                '.marker-target': {
                    transform: { type: 'range', min: 1, max: 5, unit: 'x scale', defaultValue: 'scale(1)', valueRegExp: '(scale\\()(.*)(\\))', group: 'marker-target', index: 1 },
                    fill: { type: 'color', group: 'marker-target', index: 2 }
                }
            },
            smooth: { type: 'toggle', group: 'connection', index: 3 },
            manhattan: { type: 'toggle', group: 'connection', index: 4 },

            labels: {
                type: 'list',
                addButtonLabel: 'Add New Label',
                removeButtonLabel: 'Remove Label',
                group: 'labels',
                item: {
                    type: 'object',
                    properties: {
                        position: { type: 'range', min: 0.1, max: .9, step: .1, defaultValue: .5, label: 'position', index: 2 },
                        attrs: {
                            text: {
                                text: {
                                    type: 'text', label: 'text', defaultValue: 'label', index: 1
                                }
                            }
                        }
                    }
                }
            }
        },
        groups: {
            labels: { label: 'Labels', index: 1 },
            'connection': { label: 'Connection', index: 2 },
            'marker-source': { label: 'Source marker', index: 3 },
            'marker-target': { label: 'Target marker', index: 4 }
        }
    },

    'basic.Rect': {

        inputs: _.extend({

            attrs: {
                text: CommonInspectorTextInputs,
                rect: {
                    fill: { type: 'color-palette', group: 'presentation', index: 1, previewMode: true, options: [{ content: '#000000' }, { content: '#FFFFFF' }, { content: 'transparent', icon: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGoAAABrCAYAAACffRcyAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAABPxJREFUeNrsnc9rU1kUx+/LS2LTBtI4VMiqjYjiQgQ3IoIUuhvGUmYzUBgV8SdWLS7sooLgxm0XgjKg0P+gMDC7ggjDzGwGOt1psS2WBptioiYVmrbxnviiSc17eaPvvdzz7vcLlyTk5vVyPtzzzv3mtDWq1arYrVwuNyAfxuUYkaNfQEFoWY4ZOaYymczS7jeNRlASUC9NlOMs4tZRTdNGkcCKX4GyID2V4yjipITm5Bisw4oAkrIiFk8tNp9AWekOkNSENVVLfaurq1Q4LCImSisbtao7R5mmWTQMYxPx8l6yRohvb2/3tpk2HrVKcFtA6XT6WSwWKyOk/qlSqfQUCoVTDsBGIk7nJEAKRhRjirXDlP6I024CpGBhUczt3rcFhXtS8HKKeQTh4aHot35Q3vyObW1tpdvNSyQSi8lk8iWu1yFQtGg59rWbJyuZNVzv+4XUx0QABVCa68+/0mJi8oj4/Y99Xlwuioj6BOn8lSHx4UOs9vr0j2vYUYrJ/G++6zOkRKIihn9aQepTzV14viB6Lo5lP0N68mhWnDxRACjFIP1w9YYwNjZMryEBlNeQSmVR7e7e9hoSib44rLasMqLRtb6+vlm7D5ZKpf3ycNfj4qCY2tnZ2dM2t5tmSY4NbtejexKlO9pJBOndbw/ym4cPtd0ArRyMfD4/ZHeo/uaqz61N4vTDGxWPx9dSqdQ8q+tRdXfhGhUOtXRnPH44u3nwwDE/HAykPi9KcB/uSQDFEBJAMYEEUEwgAdT3OA4BQgIoBRwHgGLiOAAUE8fBrXzvmaATPR0W3TgEdPhU5Xo1x+Hy9WbHQR5m5QnZk/XJOa8DAeW2h0A3x8Ht+pD6GJfgAMUcEkDZQSLdmfhbFUgAZQfp9q1/xK+jKyotUXtQTY5DHdLYlZeqrVNrUE2Og8KQtAbV5DgoDklbUI2OAwdIJO16Jhp7HOh1eXLizcbPw1tBrw89E24dB2snSUjZTqwPPRP/pwRXPN3pB4o5JD1AhQBS+EGFBFKoQXFxHLQGxclx0BYUN8dBS1CR9yWRuneflePgVqHpmTCKb83kxWvZyOJSV4PjkJUn0KwK62txgNawZyKfj4vRc0Pi1UpXpx0H9EzYRzAuRn4hSL1hS3fhAaUJJN6gNILEF5RmkFiCoupON0jsQNE5KXnmQlY3SKxAEaS9V2+K+jlJJ0hsQNUhxV4sCB0h1VK+6j0TNcdBprtdjkPgPQ7omQiZ46Bfz4SGJTg/UIDEABQgMQAFSOqD0tVxYAVKZ8eBDSjdHQcWoOA4uFfHeia49Tjo2TMRYschPD0TKMEZgAIkBqAAiQEoQFIfFBwHBqDgODAABceBASg4Dj7cQrzumQhrj0O4eibgODDomUAJzuAeBUhMQF0aOw5IHECVy3FA8lfe/HvXu5P/1h4V+husANVKAMTXmYAACqnPD9EJ3M3hzm0PgW7XCwyU29/6wPWQ+nCPghQAVa1W4whPsHKKuS0oeUPsrVQqPQhfMKJYU8ydQC3bvVkoFE4BVjCQKNYOU5ap6puR46bdrlpfXx82TbNoGMYmQupPunPaSZZm6BveAflkESFTWtlIJpNZkk+mEQtlNU2M6sXEuBxziIlymrPYfKr6JLGifBgELOUgDVpsvpTnDbCQBhVId42QSIasOr6alcvlBqwtNyJHP+IWiJatCnzKqhua1BIUpJ4+CjAAVnYzLhKE5pcAAAAASUVORK5CYII=' }, { content: '#B3B3B3' }, { content: '#808080' }, { content: '#4D4D4D' }, { content: '#E6E6E6' }, { content: '#FFC7C9' }, { content: '#FFA0A4' }, { content: '#E3686D' }, { content: '#D71920' }, { content: '#FFE3D1' }, { content: '#FFCBA8' }, { content: '#FFAB73' }, { content: '#F58235' }] },
                    'stroke-width': { type: 'range', min: 0, max: 30, defaultValue: 1, unit: 'px', group: 'presentation', index: 2 }
                }
            },

            mybuttongroup: {
                type: 'select-button-group',
                group: 'data',
                multi: true,
                previewMode: true,
                options: [{ value: 'a', content: 'A' }, { value: 'b', content: 'B' }, { value: 'c', content: 'C' }, { value: 'd', content: 'D' }]
            },

            myobject: {
                type: 'object',
                group: 'data',
                properties: {
                    first: { type: 'number' },
                    second: { type: 'text' }
                }
            },
            mylist: {
                // This is an example of using the `when` clause.
                // The mylist will be displayed only if cell.get('myobject').second === 'secret'.
                when: {
                    eq: {
                        'myobject/second': 'secret'
                    },
                    otherwise: {
                        unset: true
                    }
                },
                type: 'list',
                group: 'data',
                item: {
                    type: 'text'
                }
            },
            // This is an example of using the `when` clause.
            // The mycondition will be displayed only if cell.attr('text/text') matches the a.c regular expression.
            mycondition: {
                type: 'text',
                when: {
                    regex: {
                        'attrs/text/text': 'a.c'
                    }
                },
                group: 'data'
            },
            nestedList: {
                type: 'list',
                group: 'data',
                item: {
                    type: 'list',
                    item: { type: 'text' }
                }
            },
            nestedObject: {
                type: 'object',
                group: 'data',
                properties: {
                    nested: {
                        type: 'object',
                        properties: {
                            one: { type: 'text' },
                            two: { type: 'text' }
                        }
                    },
                    shallow: { type: 'text' }
                }
            }

        }, CommonInspectorInputs),

        groups: CommonInspectorGroups
    },

    'basic.Circle': {

        inputs: _.extend({

            attrs: {
                text: CommonInspectorTextInputs,
                circle: {
                    fill: { type: 'color', group: 'presentation', index: 1 },
                    'stroke-width': { type: 'range', min: 0, max: 30, defaultValue: 1, unit: 'px', group: 'presentation', index: 2 }
                }
            },

            cpText: { type: 'text', label: 'Put some text here.', defaultValue: '', group: 'custom operator' },
            cpValue: { type: 'number', label: 'If number of characters is greater than this number, an extra input will be shown.', defaultValue: 3, group: 'custom operator' },
            cpResult: { type: 'text', label: 'I\'m visible now!', defaultValue: 'Ahoy!', group: 'custom operator', when: {
                longerThan: { cpText: 'cpValue' },
                dependencies: ['cpValue']
            }}

        }, CommonInspectorInputs),

        groups: CommonInspectorGroups
    },

    'devs.Atomic': {

        inputs: {
            inPorts: { type: 'list', item: { type: 'text' }, group: 'data', index: -2 },
            outPorts: { type: 'list', item: { type: 'text' }, group: 'data', index: -1 }
        }
    }
};
