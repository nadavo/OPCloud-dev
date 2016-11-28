/*! Rappid v2.0.0 - HTML5 Diagramming Framework

Copyright (c) 2015 client IO

 2016-09-20 


This Source Code Form is subject to the terms of the Rappid Academic License
, v. 1.0. If a copy of the Rappid License was not distributed with this
file, You can obtain one at http://jointjs.com/license/rappid_academic_v1.txt
 or from the Rappid archive as was distributed by client IO. See the LICENSE file.*/


// requires: joint.format.svg.js plugin
// support 3rd party library: canvg - canvg.js, rgbcolor.js, StackBlur.js

(function(joint, _) {
    'use strict';

    /**
     * @public
     * @param {function} callback
     * @param {{width?:number, height?: number, size?:string, padding?: Object|number type: string backgroundColor: string quality: string }} opt
     */
    joint.dia.Paper.prototype.toDataURL = function(callback, opt) {

        // check whether the svg export plugin was loaded.
        if (typeof this.toSVG !== 'function') throw new Error('The joint.format.svg.js plugin must be loaded.');

        // options: type, width, height, quality (works only with type set to 'image/jpeg' or 'image/webp'),
        // backgroundColor
        opt = opt || {};

        var clientRect = V.transformRect(this.getContentBBox(), this.viewport.getCTM().inverse());
        var svgViewBox = createSVGViewBox(clientRect, opt);

        var dimensions = (opt.width && opt.height) ? opt : svgViewBox;
        var rasterSize = scaleRasterSize(dimensions, getScale(opt.size));

        var img = new Image();
        var svg;

        // Drawing an image into the canvas has to be done after the image was completely loaded.
        img.onload = function() {

            var dataURL, context, canvas;

            // Helper to create a new canvas.
            function createCanvas() {

                canvas = document.createElement('canvas');
                canvas.width = rasterSize.width;
                canvas.height = rasterSize.height;

                // Draw rectangle of a certain color covering the whole canvas area.
                // A JPEG image has black background by default and it might not be desirable.
                context = canvas.getContext('2d');
                context.fillStyle = opt.backgroundColor || 'white';
                context.fillRect(0, 0, rasterSize.width, rasterSize.height);
            }

            // Helper to read the canvas
            function readCanvas() {

                // Try to read the content of our canvas.
                dataURL = canvas.toDataURL(opt.type, opt.quality);
                // Return dataURL in the given callback.
                callback(dataURL);

                if (canvas.svg && _.isFunction(canvas.svg.stop)) {
                    // Clear the interval that is set up by the Canvg lib.
                    _.defer(canvas.svg.stop);
                }
            }

            createCanvas();

            // Drawing SVG images can taint our canvas in some browsers. That means we won't be able
            // to read canvas back as it would fail with `Error: SecurityError: DOM Exception 18`.
            // See `http://getcontext.net/read/chrome-securityerror-dom-exception-18`.
            try {

                // Draw the image to the canvas with native `drawImage` method.
                context.drawImage(img, 0, 0, rasterSize.width, rasterSize.height);

                readCanvas();

            } catch (e) {

                // The security error was thrown. We have to parse and render the SVG image with
                // `canvg` library (https://code.google.com/p/canvg/).
                if (typeof canvg === 'undefined') {

                    // The library is not present.
                    console.error('Canvas tainted. Canvg library required.');
                    return;
                }

                // The canvas was tainted. We need to render a new one. Clearing only the content won't help.
                createCanvas();

                // Draw the SVG with canvg library.
                var canvgOpt = {
                    ignoreDimensions: true,
                    ignoreClear: true,
                    ignoreMouse: true,
                    ignoreAnimation: true,
                    offsetX: 0,
                    offsetY: 0,
                    useCORS: true
                };

                canvg(canvas, svg, _.extend(canvgOpt, {

                    forceRedraw: _.once(function() {
                        // Force the redraw only the first time.
                        // Important in case the canvg is waiting for images to be loaded.
                        return true;
                    }),

                    renderCallback: function() {

                        try {

                            readCanvas();

                        } catch (e) {


                            // As IE throws security error when trying to
                            // draw an SVG into the canvas that contains (even though data-uri'ed)
                            // <image> element with another SVG in it, we apply a little trick here.
                            // The trick is in replacing all <image> elements that have
                            // SVG in xlink:href with embedded <svg> elements.
                            svg = replaceSVGImagesWithSVGEmbedded(svg);

                            // And try again. If even this fails, there is no hope.
                            createCanvas();

                            canvg(canvas, svg, _.extend(canvgOpt, { renderCallback: readCanvas }));
                        }
                    }
                }));
            }
        };

        this.toSVG(function(svgString) {

            // A canvas doesn't like width and height to be defined as percentage for some reason. We need to replace it
            // with desired width and height instead.
            svg = svgString = svgString.replace('width="100%"', 'width="' + rasterSize.width + '"')
                .replace('height="100%"', 'height="' + rasterSize.height + '"');

            // An image starts loading when we assign its source.
            //img.src = 'data:image/svg+xml;base64,' + btoa(encodeURIComponent(svgString));
            //img.src = 'data:image/svg+xml;base64,' + btoa(svgString);
            img.src = 'data:image/svg+xml,' + encodeURIComponent(svgString);

        }, { convertImagesToDataUris: true, area: svgViewBox });
    };

    /**
     * @param {function} callback
     * @param {Object} opt
     */
    joint.dia.Paper.prototype.toPNG = function(callback, opt) {

        // options: width, height, backgroundColor
        opt = opt || {};
        opt.type = 'image/png';
        this.toDataURL(callback, opt);
    };

    /**
     * @param {function} callback
     * @param {Object} opt
     */
    joint.dia.Paper.prototype.toJPEG = function(callback, opt) {

        // options: width, height, backgroundColor, quality
        opt = opt || {};
        opt.type = 'image/jpeg';
        this.toDataURL(callback, opt);
    };

    /**
     * Just a little helper for quick-opening the paper as PNG in a new browser window.
     * @param {Object} opt
     */
    joint.dia.Paper.prototype.openAsPNG = function(opt) {

        var windowFeatures = 'menubar=yes,location=yes,resizable=yes,scrollbars=yes,status=yes';
        var windowName = _.uniqueId('png_output');

        this.toPNG(function(dataURL) {

            var imageWindow = window.open('', windowName, windowFeatures);
            imageWindow.document.write('<img src="' + dataURL + '"/>');

        }, _.extend({ padding: 10 }, opt));
    };

    /**
     * @private
     * @param {{x:number, y:number, width:number, height:number}} clientBox
     * @param {{width?:number, height?: number, size?:string, padding?: Object|number}} opt
     * @returns {rect}
     */
    function createSVGViewBox(clientBox, opt) {

        var padding = getPadding(opt);

        var paddingBox = g.rect({
            x: -padding.left,
            y: -padding.top,
            width: padding.left + padding.right,
            height: padding.top + padding.bottom
        });

        if (opt.width && opt.height) {

            var paddingWidth = clientBox.width + padding.left + padding.right;
            var paddingHeight = clientBox.height + padding.top + padding.bottom;

            paddingBox.scale(paddingWidth / opt.width, paddingHeight / opt.height);
        }

        return g.Rect(clientBox).moveAndExpand(paddingBox);
    }

    /**
     * @private
     * @param {string} size Size of the image could be also changed by a factor e.g, 0.5x, 2x, 4x
     * @returns {number}
     */
    function getScale(size) {

        var scale = 1;

        if (!_.isUndefined(size)) {
            scale = parseFloat(size);
            if (!_.isFinite(scale) || scale === 0) {
                throw new Error('dia.Paper: invalid raster size (' + size + ')');
            }
        }
        return scale;
    }

    /**
     * @param {{width: number, height: number}} size
     * @param {number} scale
     * @returns {{width: number, height: number}}
     */
    function scaleRasterSize(size, scale) {

        // the dimensions of the output image
        return {
            width: (size.width || 1) * scale,
            height: (size.height || 1) * scale
        };
    }

    /**
     * @private
     * @param {{width?, height?, padding}}opt
     * @returns {{top, bottom, left, right}}
     */
    function getPadding(opt) {

        var padding = joint.util.normalizeSides(opt.padding);
        if (opt.width && opt.height) {

            // The content has to be at least 1px wide.
            if (padding.left + padding.right >= opt.width) {
                padding.left = padding.right = 0;
            }

            // The content has to be at least 1px high.
            if (padding.top + padding.bottom >= opt.height) {
                padding.top = padding.bottom = 0;
            }
        }

        return padding;
    }

    function replaceSVGImagesWithSVGEmbedded(svg) {

        return svg.replace(/\<image[^>]*>/g, function(imageTag) {

            var href = imageTag.match(/href="([^"]*)"/)[1];
            var svgDataUriPrefix = 'data:image/svg+xml';

            if (href.substr(0, svgDataUriPrefix.length) === svgDataUriPrefix) {

                var svg = atob(href.substr(href.indexOf(',') + 1));
                return svg.substr(svg.indexOf('<svg'));
            }

            return imageTag;
        });
    }
}(joint, _));

