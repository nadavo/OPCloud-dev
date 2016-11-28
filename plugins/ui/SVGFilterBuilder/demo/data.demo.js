/*! Rappid v2.0.0 - HTML5 Diagramming Framework

Copyright (c) 2015 client IO

 2016-09-20 


This Source Code Form is subject to the terms of the Rappid Academic License
, v. 1.0. If a copy of the Rappid License was not distributed with this
file, You can obtain one at http://jointjs.com/license/rappid_academic_v1.txt
 or from the Rappid archive as was distributed by client IO. See the LICENSE file.*/


var svgFilterBuilderData = {};

svgFilterBuilderData.stencil = {
    groups: {
        basic: { index: 1, label: 'Simple' },
        input: { index: 2, label: 'With Input' },
        merge: { index: 3, label: 'Merge' }
    },
    shapes: {
        input: [
            new joint.shapes.filter.FeGaussianBlur({
                attrs: {
                    '.': {
                        'data-tooltip': 'Gaussian Blur',
                        'data-tooltip-position': 'left',
                        'data-tooltip-position-selector': '.stencil'
                    }
                }
            }),
            new joint.shapes.filter.FeOffset({
                attrs: {
                    '.': {
                        'data-tooltip': 'Offset',
                        'data-tooltip-position': 'left',
                        'data-tooltip-position-selector': '.stencil'
                    }
                }
            }),
            new joint.shapes.filter.FeColorMatrix({
                attrs: {
                    '.': {
                        'data-tooltip': 'Color Matrix',
                        'data-tooltip-position': 'left',
                        'data-tooltip-position-selector': '.stencil'
                    }
                }
            }),
            new joint.shapes.filter.FeMorphology({
                attrs: {
                    '.': {
                        'data-tooltip': 'Morphology',
                        'data-tooltip-position': 'left',
                        'data-tooltip-position-selector': '.stencil'
                    }
                }
            }),
            new joint.shapes.filter.FeConvolveMatrix({
                attrs: {
                    '.': {
                        'data-tooltip': 'Convolve Matrix',
                        'data-tooltip-position': 'left',
                        'data-tooltip-position-selector': '.stencil'
                    }
                }
            })
        ],
        basic: [
            new joint.shapes.filter.FeFlood({
                attrs: {
                    '.': {
                        'data-tooltip': 'Flood',
                        'data-tooltip-position': 'left',
                        'data-tooltip-position-selector': '.stencil'
                    }
                }
            }),
            new joint.shapes.filter.FeTurbulence({
                attrs: {
                    '.': {
                        'data-tooltip': 'Turbulence',
                        'data-tooltip-position': 'left',
                        'data-tooltip-position-selector': '.stencil'
                    }
                }
            })
        ],
        merge: [
            new joint.shapes.filter.FeComposite({
                attrs: {
                    '.': {
                        'data-tooltip': 'Composite',
                        'data-tooltip-position': 'left',
                        'data-tooltip-position-selector': '.stencil'
                    }
                }
            }),
            new joint.shapes.filter.FeMerge({
                attrs: {
                    '.': {
                        'data-tooltip': 'Merge',
                        'data-tooltip-position': 'left',
                        'data-tooltip-position-selector': '.stencil'
                    }
                }
            })
        ]
    }
};

var colorPaletteOptions = [
    {
        content: 'transparent',
        icon: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGoAAABrCAYAAACffRcyAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAABPxJREFUeNrsnc9rU1kUx+/LS2LTBtI4VMiqjYjiQgQ3IoIUuhvGUmYzUBgV8SdWLS7sooLgxm0XgjKg0P+gMDC7ggjDzGwGOt1psS2WBptioiYVmrbxnviiSc17eaPvvdzz7vcLlyTk5vVyPtzzzv3mtDWq1arYrVwuNyAfxuUYkaNfQEFoWY4ZOaYymczS7jeNRlASUC9NlOMs4tZRTdNGkcCKX4GyID2V4yjipITm5Bisw4oAkrIiFk8tNp9AWekOkNSENVVLfaurq1Q4LCImSisbtao7R5mmWTQMYxPx8l6yRohvb2/3tpk2HrVKcFtA6XT6WSwWKyOk/qlSqfQUCoVTDsBGIk7nJEAKRhRjirXDlP6I024CpGBhUczt3rcFhXtS8HKKeQTh4aHot35Q3vyObW1tpdvNSyQSi8lk8iWu1yFQtGg59rWbJyuZNVzv+4XUx0QABVCa68+/0mJi8oj4/Y99Xlwuioj6BOn8lSHx4UOs9vr0j2vYUYrJ/G++6zOkRKIihn9aQepTzV14viB6Lo5lP0N68mhWnDxRACjFIP1w9YYwNjZMryEBlNeQSmVR7e7e9hoSib44rLasMqLRtb6+vlm7D5ZKpf3ycNfj4qCY2tnZ2dM2t5tmSY4NbtejexKlO9pJBOndbw/ym4cPtd0ArRyMfD4/ZHeo/uaqz61N4vTDGxWPx9dSqdQ8q+tRdXfhGhUOtXRnPH44u3nwwDE/HAykPi9KcB/uSQDFEBJAMYEEUEwgAdT3OA4BQgIoBRwHgGLiOAAUE8fBrXzvmaATPR0W3TgEdPhU5Xo1x+Hy9WbHQR5m5QnZk/XJOa8DAeW2h0A3x8Ht+pD6GJfgAMUcEkDZQSLdmfhbFUgAZQfp9q1/xK+jKyotUXtQTY5DHdLYlZeqrVNrUE2Og8KQtAbV5DgoDklbUI2OAwdIJO16Jhp7HOh1eXLizcbPw1tBrw89E24dB2snSUjZTqwPPRP/pwRXPN3pB4o5JD1AhQBS+EGFBFKoQXFxHLQGxclx0BYUN8dBS1CR9yWRuneflePgVqHpmTCKb83kxWvZyOJSV4PjkJUn0KwK62txgNawZyKfj4vRc0Pi1UpXpx0H9EzYRzAuRn4hSL1hS3fhAaUJJN6gNILEF5RmkFiCoupON0jsQNE5KXnmQlY3SKxAEaS9V2+K+jlJJ0hsQNUhxV4sCB0h1VK+6j0TNcdBprtdjkPgPQ7omQiZ46Bfz4SGJTg/UIDEABQgMQAFSOqD0tVxYAVKZ8eBDSjdHQcWoOA4uFfHeia49Tjo2TMRYschPD0TKMEZgAIkBqAAiQEoQFIfFBwHBqDgODAABceBASg4Dj7cQrzumQhrj0O4eibgODDomUAJzuAeBUhMQF0aOw5IHECVy3FA8lfe/HvXu5P/1h4V+husANVKAMTXmYAACqnPD9EJ3M3hzm0PgW7XCwyU29/6wPWQ+nCPghQAVa1W4whPsHKKuS0oeUPsrVQqPQhfMKJYU8ydQC3bvVkoFE4BVjCQKNYOU5ap6puR46bdrlpfXx82TbNoGMYmQupPunPaSZZm6BveAflkESFTWtlIJpNZkk+mEQtlNU2M6sXEuBxziIlymrPYfKr6JLGifBgELOUgDVpsvpTnDbCQBhVId42QSIasOr6alcvlBqwtNyJHP+IWiJatCnzKqhua1BIUpJ4+CjAAVnYzLhKE5pcAAAAASUVORK5CYII='
    },
    { content: '#31d0c6' },
    { content: '#FF0000' },
    { content: '#7c68fc' },
    { content: '#61549C' },
    { content: '#fe854f' },
    { content: '#feb663' },
    { content: '#f6f6f6' },
    { content: '#222138' },
    { content: '#33334e' },
    { content: '#4b4a67' },
    { content: '#3c4260' },
    { content: '#6a6c8a' },
    { content: '#c6c7e2' }
];

var groupBasic = { index: 1, label: 'Filter Attributes' };

svgFilterBuilderData.inspector = {

    'filter.FeGaussianBlur': {
        groups: {
            basic: groupBasic
        },
        inputs: {
            stdDeviation: { type: 'range', min: 0, max: 50, defaultValue: 1, group: 'basic', index: 2 }
        }
    },
    'filter.FeFlood': {
        groups: {
            basic: groupBasic
        },
        inputs: {
            floodColor: {
                type: 'color-palette',
                options: colorPaletteOptions,
                target: 'body',
                group: 'basic',
                label: 'flood-color',
                index: 1
            },
            floodOpacity: { type: 'range', min: 0, max: 1, defaultValue: 1, step: 0.1, group: 'basic', index: 2 }
        }
    },
    'filter.FeOffset': {
        groups: {
            basic: groupBasic
        },
        inputs: {
            dx: { type: 'range', min: 0, max: 50, group: 'basic', index: 1 },
            dy: { type: 'range', min: 0, max: 50, group: 'basic', index: 2 }
        }
    },
    'filter.FeMerge': {
        groups: {
            data: { index: 1, label: 'Ports' }
        },
        inputs: {
            inPorts: { type: 'list', item: { type: 'text', defaultValue: 'IN' }, group: 'data', index: -2 }
        }
    },
    'filter.FeComposite': {
        groups: {
            data: { index: 1, label: 'Ports' },
            basic: groupBasic
        },
        inputs: {
            operator: {
                type: 'select',
                options: ['over', 'in', 'out', 'atop', 'xor', 'arithmetic'],
                group: 'basic',
                index: 1
            },
            k1: {
                type: 'number',
                min: 0,
                max: 500,
                step: 0.5,
                group: 'basic',
                label: 'k1',
                index: 2,
                when: { eq: { operator: 'arithmetic' } }
            },
            k2: {
                type: 'number',
                min: 0,
                max: 500,
                step: 0.5,
                group: 'basic',
                label: 'k2',
                index: 3,
                when: { eq: { operator: 'arithmetic' } }
            },
            k3: {
                type: 'number',
                min: 0,
                max: 500,
                step: 0.5,
                group: 'basic',
                label: 'k3',
                index: 4,
                when: { eq: { operator: 'arithmetic' } }
            },
            k4: {
                type: 'number',
                min: 0,
                max: 500,
                step: 0.5,
                group: 'basic',
                label: 'k4',
                index: 5,
                when: { eq: { operator: 'arithmetic' } }
            }
        }
    },
    'filter.FeTurbulence': {
        groups: {
            basic: groupBasic,
            data: { index: 1, label: 'Ports' }
        },
        inputs: {
            baseFrequencyX: { type: 'number', min: 0, max: 1, step: 0.001, group: 'basic', index: 1 },
            baseFrequencyY: {
                type: 'number',
                min: 0,
                max: 1,
                step: 0.001,
                group: 'basic',
                index: 2,
                when: { eq: { useBaseFrequencyY: true } }
            },
            useBaseFrequencyY: { type: 'toggle', group: 'basic', index: 3, label: 'baseFrequency Y' },

            turbulenceType: {
                type: 'select',
                options: ['fractalNoise', 'turbulence'],
                label: 'type',
                group: 'basic',
                index: 4
            },
            stitchTiles: { type: 'select', options: ['stitch', 'noStitch'], index: 5, group: 'basic' },
            seed: { type: 'range', min: 0, max: 1, defaultValue: 1, step: 0.1, group: 'basic', index: 6 },
            numOctaves: { type: 'range', min: 0, max: 100, group: 'basic', index: 7 }
        }
    },
    'filter.FeColorMatrix': {
        groups: {
            basic: groupBasic
        },
        inputs: {
            matrixType: {
                type: 'select',
                options: ['matrix', 'saturate', 'hueRotate', 'luminanceToAlpha'],
                label: 'type',
                group: 'basic',
                index: 2
            },
            valMatrix: {
                type: 'textarea',
                group: 'basic',
                index: 3,
                when: { eq: { matrixType: 'matrix' } },
                label: 'matrix'
            },
            valSaturate: {
                type: 'range',
                min: 0,
                max: 1,
                step: 0.01,
                group: 'basic',
                index: 4,
                when: { eq: { matrixType: 'saturate' } },
                label: 'saturate'
            },
            valHueRotate: {
                type: 'range',
                min: 0,
                max: 360,
                step: 1,
                group: 'basic',
                index: 4,
                when: { eq: { matrixType: 'hueRotate' } },
                label: 'hueRotate'
            },
            valLuminanceToAlpha: {
                type: 'textarea',
                group: 'basic',
                index: 3,
                when: { eq: { matrixType: 'luminanceToAlpha' } },
                label: 'luminanceToAplha'
            }
        }
    },
    'filter.FeMorphology': {
        groups: {
            basic: { index: 1, label: 'Filter Attributes' }
        },
        inputs: {
            operator: { type: 'select', options: ['erode', 'dilate'], index: 1, group: 'basic' },
            useRadiusY: { type: 'toggle', group: 'basic', index: 4, label: 'radius Y' },
            radiusX: { type: 'number', min: -500, max: 500, step: 0.1, group: 'basic', label: 'radius', index: 2 },
            radiusY: {
                type: 'number', min: -500, max: 500, step: 0.1, group: 'basic', label: 'radius', index: 4,
                when: { eq: { useRadiusY: true } }
            }
        }
    },
    'filter.FeConvolveMatrix': {
        groups: {
            basic: groupBasic
        },
        inputs: {
            orderX: { type: 'range', min: 3, max: 10, group: 'basic', index: 2, label: 'order X', value: 8 },
            orderY: {
                type: 'range',
                min: 3,
                max: 10,
                group: 'basic',
                index: 3,
                when: { eq: { useOrderY: true } },
                label: 'order Y'
            },
            useOrderY: { type: 'toggle', group: 'basic', index: 4, label: 'order Y' },
            divisor: { type: 'range', min: 1, max: 10, group: 'basic', index: 5, label: 'divisor', value: 8 },
            kernelmatrix: {
                type: 'textarea',
                group: 'basic',
                index: 6,
                value: '1 0 0 0 0 0 0 0 0 1 0 0 0 0 0 0 0 0 1 0 0 0 0 0 0 0 0 1 0 0 0 0 0 0 0 0 1 0 0 0 0 0 0 0 0 1 0 0 0 0 0 0 0 0 1 0 0 0 0 0 0 0 0 1'
            }
        }
    }
};

svgFilterBuilderData.toolbar = [
    {
        type: 'zoom-out',
        name: 'zoom-out',
        attrs: {
            button: {
                'data-tooltip': 'Zoom Out',
                'data-tooltip-position': 'top',
                'data-tooltip-position-selector': '.toolbar-container'
            }
        }
    },
    {
        type: 'zoom-in',
        name: 'zoom-in',
        attrs: {
            button: {
                'data-tooltip': 'Zoom In',
                'data-tooltip-position': 'top',
                'data-tooltip-position-selector': '.toolbar-container'
            }
        }
    },
    {
        type: 'zoom-to-fit',
        name: 'zoom-to-fit',
        attrs: {
            button: {
                'data-tooltip': 'Zoom To Fit',
                'data-tooltip-position': 'top',
                'data-tooltip-position-selector': '.toolbar-container'
            }
        }
    },
    {
        type: 'zoom-slider'
    },
    {
        type: 'undo',
        name: 'undo',
        attrs: {
            button: {
                'data-tooltip': 'Undo',
                'data-tooltip-position': 'top',
                'data-tooltip-position-selector': '.toolbar-container'
            }
        }
    },
    {
        type: 'redo',
        name: 'redo',
        attrs: {
            button: {
                'data-tooltip': 'Redo',
                'data-tooltip-position': 'top',
                'data-tooltip-position-selector': '.toolbar-container'
            }
        }
    },
    {
        type: 'button',
        name: 'layout',
        attrs: {
            button: {
                id: 'btn-layout',
                'data-tooltip': 'Auto-layout Graph',
                'data-tooltip-position': 'top',
                'data-tooltip-position-selector': '.toolbar-container'
            }
        }
    },
    {
        type: 'button',
        name: 'export',
        text: 'export filter',
        attrs: {
            button: {
                'data-tooltip': 'Export Filter as text',
                'data-tooltip-position': 'top',
                'data-tooltip-position-selector': '.toolbar-container'
            }
        }
    },
    {
        type: 'button',
        name: 'import',
        text: 'import filter',
        attrs: {
            button: {
                'data-tooltip': 'Import Filter',
                'data-tooltip-position': 'top',
                'data-tooltip-position-selector': '.toolbar-container'
            }
        }
    }
];

svgFilterBuilderData['filter-preview'] = {
    toolbar: [
        {
            type: 'label',
            text: 'FILTERED'
        },
        {
            type: 'zoom-out',
            name: 'zoom-out',
            attrs: {
                button: {
                    'data-tooltip': 'Zoom Out',
                    'data-tooltip-position': 'top',
                    'data-tooltip-position-selector': '.toolbar-container'
                }
            }
        },
        {
            type: 'zoom-in',
            name: 'zoom-in',
            attrs: {
                button: {
                    'data-tooltip': 'Zoom In',
                    'data-tooltip-position': 'top',
                    'data-tooltip-position-selector': '.toolbar-container'
                }
            }
        },
        {
            type: 'zoom-to-fit',
            name: 'zoom-to-fit',
            attrs: {
                button: {
                    'data-tooltip': 'Zoom To Fit',
                    'data-tooltip-position': 'top',
                    'data-tooltip-position-selector': '.toolbar-container'
                }
            }
        },
        {
            type: 'zoom-slider'
        }
    ]
};

svgFilterBuilderData['original-preview'] = {
    toolbar: [
        {
            type: 'label',
            text: 'ORIGINAL'
        },
        {
            type: 'zoom-out',
            name: 'zoom-out',
            attrs: {
                button: {
                    'data-tooltip': 'Zoom Out',
                    'data-tooltip-position': 'top',
                    'data-tooltip-position-selector': '.toolbar-container'
                }
            }
        },
        {
            type: 'zoom-in',
            name: 'zoom-in',
            attrs: {
                button: {
                    'data-tooltip': 'Zoom In',
                    'data-tooltip-position': 'top',
                    'data-tooltip-position-selector': '.toolbar-container'
                }
            }
        },
        {
            type: 'zoom-to-fit',
            name: 'zoom-to-fit',
            attrs: {
                button: {
                    'data-tooltip': 'Zoom To Fit',
                    'data-tooltip-position': 'top',
                    'data-tooltip-position-selector': '.toolbar-container'
                }
            }
        },
        {
            type: 'zoom-slider'
        },
        {
            type: 'button',
            name: 'import',
            text: 'import graphic',
            attrs: {
                button: {
                    'data-tooltip': 'Import SVG graphic',
                    'data-tooltip-position': 'top',
                    'data-tooltip-position-selector': '.toolbar-container'
                }
            }
        }

    ]
};
