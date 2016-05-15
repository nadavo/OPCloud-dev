/*! Rappid v1.7.1 - HTML5 Diagramming Framework

Copyright (c) 2015 client IO

 2016-03-03 


This Source Code Form is subject to the terms of the Rappid Academic License
, v. 1.0. If a copy of the Rappid License was not distributed with this
file, You can obtain one at http://jointjs.com/license/rappid_academic_v1.txt
 or from the Rappid archive as was distributed by client IO. See the LICENSE file.*/


joint.ui.Halo = joint.mvc.View.extend({

    PIE_INNER_RADIUS: 20,
    PIE_OUTER_RADIUS: 50,

    className: 'halo',

    events: {
        'mousedown .handle': 'onHandlePointerDown',
        'touchstart .handle': 'onHandlePointerDown',
        'mousedown .pie-toggle': 'onPieTogglePointerDown',
        'touchstart .pie-toggle': 'onPieTogglePointerDown'
    },

    options: {
        tinyThreshold: 40,
        smallThreshold: 80,
        loopLinkPreferredSide: 'top',
        loopLinkWidth: 40,
        rotateAngleGrid: 15,
        clearAll: true,
        // This option allows you to compute bbox from the model. The view bbox can sometimes return
        // an unwanted result e.g when an element uses SVG filters or clipPaths. Note that downside
        // of computing a bbox is that it takes no relative subelements into account (e.g ports).
        useModelGeometry: false,
        // a function returning a html string, which will be used as the halo box content
        boxContent: function(cellView, boxElement) {

            var tmpl =  _.template('x: <%= x %>, y: <%= y %>, width: <%= width %>, height: <%= height %>, angle: <%= angle %>');

            var bbox = cellView.model.getBBox();

            return tmpl({
                x: Math.floor(bbox.x),
                y: Math.floor(bbox.y),
                width: bbox.width,
                height: bbox.height,
                angle: Math.floor(cellView.model.get('angle') || 0)
            });

        },
        // A function returning a copy of given cell used in cloning and forking.
        // Useful e.g. when you wish to translate the clone after it's created.
        // Note that clone is not in the graph when the function is invoked.
        clone: function(cell, opt) {
            return cell.clone().unset('z');
        },
        handles: [
            {
                name: 'resize',
                position: 'se',
                events: { pointerdown: 'startResizing', pointermove: 'doResize', pointerup: 'stopBatch' },
                icon: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAeCAYAAAA7MK6iAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAA2RpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMC1jMDYwIDYxLjEzNDc3NywgMjAxMC8wMi8xMi0xNzozMjowMCAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDo2NjREODhDMjc4MkVFMjExODUyOEU5NTNCRjg5OEI3QiIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDowQTc4MzUwQjJGMEIxMUUyOTFFNUE1RTAwQ0EwMjU5NyIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDowQTc4MzUwQTJGMEIxMUUyOTFFNUE1RTAwQ0EwMjU5NyIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ1M1IFdpbmRvd3MiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDo2NjREODhDMjc4MkVFMjExODUyOEU5NTNCRjg5OEI3QiIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDo2NjREODhDMjc4MkVFMjExODUyOEU5NTNCRjg5OEI3QiIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/Pk3oY88AAAEMSURBVHja7JftDYMgEIbRdABHcARG6CalGziCG3QE3KAj0A0cod3AEa6YUEMpcKeI9oeXvP5QuCeA90EBAGwPK7SU1hkZ12ldiT6F1oUycARDRHLBgiTiEzCwTNhNuRT8XOEog/AyMqlOXPEuZzx7q29aXGtIhLvQwfNuAgtrYgrcB+VWqH2BhceBD45ZE4EyB/7zIQTvCeAWgdpw1CqT2Sri2LsRZ4cddtg/GLfislo55oNZxE2ZLcFXT8haU7YED9yXpxsCGMvTn4Uqe7DIXJnsAqGYB5CjFnNT6yEE3qr7iIJT+60YXJUZQ3G8ALyof+JWfTV6xrluEuqkHw/ESW3CoJsBRVubtwADAI2b6h9uJAFqAAAAAElFTkSuQmCC'
            },
            {
                name: 'remove',
                position: 'nw',
                events: { pointerdown: 'removeElement' },
                icon: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAO5JREFUeNrUV9sNwyAMtLoAI3SEjJIRMgqjdBRG8CiMQGnlVHwEOBAE19L9OdwRGz+IcNsibISLCBk48dlooB0RXCDNgeXbbntWbovCyVlNtkf4AeQnvJwJ//IwCQdy8zAZeynm/gYBPpcT7gbyNDGb4/4CnyOLb1M+MED+MVPxZfEhQASnFQ4hp4qIlJxAEd+KaQGlpiIC8bmCRZOvRNBL/kvGltp+RdRLfqK5wZhCITMdjaury5lB5OFBCuxvQjAtCZc/w+WFaHkpXt6MVLTj5QOJipFs+VCqYixXsZioWM1GLaf7yK45ZT1/CzAAESidXQn9F/MAAAAASUVORK5CYII='
            },
            {
                name: 'clone',
                position: 'n',
                events: { pointerdown: 'startCloning', pointermove: 'doClone', pointerup: 'stopCloning' },
                icon: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAeCAYAAAA7MK6iAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAA2RpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMC1jMDYwIDYxLjEzNDc3NywgMjAxMC8wMi8xMi0xNzozMjowMCAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDo2NjREODhDMjc4MkVFMjExODUyOEU5NTNCRjg5OEI3QiIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDoxNTM0NjJBRjJGMkQxMUUyQkRFM0FCRTMxMDhFQkE2QiIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDoxNTM0NjJBRTJGMkQxMUUyQkRFM0FCRTMxMDhFQkE2QiIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ1M1IFdpbmRvd3MiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDo2NjREODhDMjc4MkVFMjExODUyOEU5NTNCRjg5OEI3QiIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDo2NjREODhDMjc4MkVFMjExODUyOEU5NTNCRjg5OEI3QiIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PkJFWv4AAAD3SURBVHja5FfRDYMgED2bDsAIjsAIMAluoqs4CY7gCI7ABtTTnsEUNCVQanzJGT/Qx7t7HFBZa6EEHlAIxYh90HPYzCHul+pixM93TV1wfDRNA0qppGRSyh2x8A2q6xqEEIc/mqZpCcTZWJ/iaPR9D13XLe/fNqKiNd6lahxHMMb8jlhrvRlgGAbvYJwQTsytMcH9hjEGnPN0NUZS15khx2L2SMi1GwgqQfdSkKPJ1RRnau/ZMq9J3LbtVtfodezrw6H1nAp2NeWK2bm5Tx9lTyAfilNhXuOkTv/n7hTqwbFwN5DDVGcMHVIsM2fVu7lXt7s7vQQYAIMHB7xhVbHdAAAAAElFTkSuQmCC'
            },
            {
                name: 'link',
                position: 'e',
                events: { pointerdown: 'startLinking', pointermove: 'doLink', pointerup: 'stopLinking' },
                icon: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAeCAYAAAA7MK6iAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyBpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMC1jMDYwIDYxLjEzNDc3NywgMjAxMC8wMi8xMi0xNzozMjowMCAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNSBXaW5kb3dzIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOjIwRkVFNkM3MkU3RjExRTJBMDA3RkZBQzMyMzExQzIzIiB4bXBNTTpEb2N1bWVudElEPSJ4bXAuZGlkOjIwRkVFNkM4MkU3RjExRTJBMDA3RkZBQzMyMzExQzIzIj4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6MjBGRUU2QzUyRTdGMTFFMkEwMDdGRkFDMzIzMTFDMjMiIHN0UmVmOmRvY3VtZW50SUQ9InhtcC5kaWQ6MjBGRUU2QzYyRTdGMTFFMkEwMDdGRkFDMzIzMTFDMjMiLz4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz5hjT/5AAAA8ElEQVR42syXwQ3DIAxFUbtAR+gIHLsSN2+SboA6CSOEMbghJqCAHKlNmwYwkWvpKwdinmRsY4Sos2sSJJkknxRX8rgG+C/ZJG4YG2XQt9kuSVMHcK0J96qGzgOgi+Ya+GhoFfwo6C5890wBIGqto5SScuYf2fvTKcMW895T4G/ZblrARLh5bQ5VTjnMg+ClyUCL0yA4iJ7ONABewu17koQIz8z+2iTCaY3hG7zG7yQYjS3UbMnFVk5sDYStZbJdEizX4hnBDqeD21bNOedECKF8lVLCWttTuvekx9+MPmzDHut4yzrQsz5hDn+0PQUYAOGQcmTsT0IpAAAAAElFTkSuQmCC'
            },
            {
                name: 'fork',
                position: 'ne',
                events: { pointerdown: 'startForking', pointermove: 'doFork', pointerup: 'stopForking' },
                icon: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH3QUUEAUZcNUVHAAAALtJREFUWMPtlt0RgjAMgL9zAkZglI7ACLoJm8RNHIERGMER6ksfsIeRtsGq9LvLW2i+oz8JNBoHYAZcTQEfQoCupoAH7sBZS1jGDAwbCgwh1yfEDejfCSx/3SsksXAcIxsTZYfiSQJrEiUCT1sQ45TFNQkJ33aphzB1f9ckZK9rKBkHM2YqfYgsJIr5aYnJshfkSJj3Ak3C5fQCSwmTh+hTEh4YTwUCF+D6DRNPcTuuPpD8/UhWfShtNFQe+d/oVK9MAB0AAAAASUVORK5CYII='
            },
            {
                name: 'unlink',
                position: 'w',
                events: { pointerdown: 'unlinkElement' },
                icon: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAeCAYAAAA7MK6iAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyBpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMC1jMDYwIDYxLjEzNDc3NywgMjAxMC8wMi8xMi0xNzozMjowMCAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNSBXaW5kb3dzIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOjJCNjcxNUZBMkU3RjExRTI5RURCRDA5NDlGRDBFMDgwIiB4bXBNTTpEb2N1bWVudElEPSJ4bXAuZGlkOjJCNjcxNUZCMkU3RjExRTI5RURCRDA5NDlGRDBFMDgwIj4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6MkI2NzE1RjgyRTdGMTFFMjlFREJEMDk0OUZEMEUwODAiIHN0UmVmOmRvY3VtZW50SUQ9InhtcC5kaWQ6MkI2NzE1RjkyRTdGMTFFMjlFREJEMDk0OUZEMEUwODAiLz4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz5htS6kAAABHElEQVR42uxW0Q2DIBBV0wEcwRHsBo7QERjBbkAnYARGaDdghI5gN9ANKCRHQy4HxFakH77kxeTAe95xd1JrrasSaKpCOIR3R2+oDLXHp+GQU3RAYhyezsZyCU8gwJGdgX3+wXcHfi1HyOwHGsQpuMjXprwFMU3QavGTtzHkwGJZIXoxFBBtyOer8opKog0ykQ0qrSoQpTsy7gfZg9EtKu/cnbBvm4iC454PijKUgQ4WYy9rot0Y6gBMhQvKoY70dYs+TERqAcOe4dXwsUXbWdF7IgsztM3/jsziqd69uLZqp/GbdgoNEJF7gMR+BC7KfuXInBIfwJrELF4Ss5yCLaiz4S3isyv6W8QXAbHXRaDI1ac+LvSHcC68BRgAHv/CnODh8mEAAAAASUVORK5CYII='
            },
            {
                name: 'rotate',
                position: 'sw',
                events: { pointerdown: 'startRotating', pointermove: 'doRotate', pointerup: 'stopBatch' },
                icon: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAeCAYAAAA7MK6iAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyBpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMC1jMDYwIDYxLjEzNDc3NywgMjAxMC8wMi8xMi0xNzozMjowMCAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNSBXaW5kb3dzIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOjI1NTk5RUFBMkU3RjExRTI4OUIyQzYwMkMyN0MxMDE3IiB4bXBNTTpEb2N1bWVudElEPSJ4bXAuZGlkOjI1NTk5RUFCMkU3RjExRTI4OUIyQzYwMkMyN0MxMDE3Ij4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6MjU1OTlFQTgyRTdGMTFFMjg5QjJDNjAyQzI3QzEwMTciIHN0UmVmOmRvY3VtZW50SUQ9InhtcC5kaWQ6MjU1OTlFQTkyRTdGMTFFMjg5QjJDNjAyQzI3QzEwMTciLz4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz6W+5aDAAABJElEQVR42syXbRGDMAyGYTcBOBgSkICESWAOmAMcTAJzgAQksCnYHFRC13Jlx7qkDf0Acvf+6ZF7mjRNQ8o5T/ZqmVAt1AkxIa5JrvXqmywUsAVANkmf3BV6RqKjSvpWlqD+7OYBhKKHoMNS6EuddaPUqjUqfIJyPb2Ysyye0pC6Qm0I8680KJ/vhDmcFbU2mAb9glvk48KhMAtiYY7RYunxuRVWcI2cqa/ZegBYFGWA5jPYwAy4MrGhI1hf6FaA8gPg/PSA9tSbcAz8il2XOIRM9SILXVxki3GdEvUmD6bhIHYDQeFrtEwUvsYj0WBRx34Wc5cXJcQg8GMpMPrUBsBb6DHrbie1IdNUeRe6UNLVRB72Nh1v9zfQR/+FSbf6afsIMAB0elCwFZfPigAAAABJRU5ErkJggg=='
            }
        ],
        // Type of the halo. Determines the look of the halo (esp. positioning of handles).
        type: 'surrounding',
        // Various options for a specific types.
        pieSliceAngle: 45,
        pieStartAngleOffset: 0,
        pieIconSize: 14,
        // Pie toggle buttons. Usually, there is only one but in general, there can be
        // many. Each button can have a position (e ... east, w ... west, s ... south, n ... north)
        // and name. This name is then used when triggering events when the pie toggle button
        // is clicked (pie:open:default / pie:close:default).
        pieToggles: [{ name: 'default', position: 'e' }],

        // Rest of options are deprecated (better use joint.dia.Paper.options.linkModel)
        linkAttributes: {},
        smoothLinks: undefined
    },

    init: function() {

        _.defaults(this.options, {
            paper: this.options.cellView.paper,
            graph: this.options.cellView.paper.model
        });

        _.bindAll(this, 'pointermove', 'pointerup', 'render', 'update');

        if (this.options.clearAll) {
            // Clear a previous halo if there was one for the paper.
            joint.ui.Halo.clear(this.options.paper);
        }

        // Update halo when the graph changed.
        this.listenTo(this.options.graph, 'reset', this.remove);
        this.listenTo(this.options.graph, 'all', this.update);
        // Hide Halo when the user clicks anywhere in the paper or a new halo is created.
        this.listenTo(this.options.paper, 'blank:pointerdown halo:create', this.remove);
        this.listenTo(this.options.paper, 'scale translate', this.update);

        this.listenTo(this.options.cellView.model, 'remove', this.remove);

        $(document.body).on('mousemove touchmove', this.pointermove);
        $(document).on('mouseup touchend', this.pointerup);

        // Add all default handles first.
        this.handles = [];
        _.each(this.options.handles, this.addHandle, this);
    },

    render: function() {

        var options = this.options;

        this.$el.empty();
        this.$handles = $('<div/>').addClass('handles').appendTo(this.el);
        this.$box = $('<label/>').addClass('box').appendTo(this.el);
        // A cache for pie toggle buttons in the form [toggleName] -> [$pieToggle].
        this.$pieToggles = {};

        // Add halo type for css styling purposes.
        this.$el.addClass(options.type);

        // Add the `data-type` attribute with the `type` of the cell to the root element.
        // This makes it possible to style the halo (including hiding/showing actions) based
        // on the type of the cell.
        this.$el.attr('data-type', options.cellView.model.get('type'));

        // Render handles.
        this.$handles.append(_.map(this.handles, this.renderHandle, this));

        switch (options.type) {

            case 'toolbar':
            case 'surrounding':

                // If the cell can not connect itself with the clone of
                // itself due to the validate connection method, don't
                // display fork handle at all.
                if (this.hasHandle('fork')) {
                    this.toggleFork();
                }

                break;

            case 'pie':

                // Pie halo has a button to toggle visibility of the
                // menu, that is not a handle (can't be added or removed).
                _.each(this.options.pieToggles, function(opt) {
                    var $pieToggle = $('<div/>');
                    $pieToggle.addClass('pie-toggle ' + (opt.position || 'e'));
                    $pieToggle.attr('data-name', opt.name);
                    joint.util.setAttributesBySelector($pieToggle, opt.attrs);
                    $pieToggle.appendTo(this.el);
                    this.$pieToggles[opt.name] = $pieToggle;
                }, this);

                break;

            default:
                throw new Error('ui.Halo: unknown type');
        }

        this.update();
        this.$el.addClass('animate').appendTo(options.paper.el);

        return this;
    },

    update: function() {

        var cellView = this.options.cellView;

        if (cellView.model instanceof joint.dia.Link) return;

        this.updateBoxContent();

        var bbox = cellView.getBBox({ useModelGeometry: this.options.useModelGeometry });

        this.$el.toggleClass('tiny', bbox.width < this.options.tinyThreshold && bbox.height < this.options.tinyThreshold);
        this.$el.toggleClass('small', !this.$el.hasClass('tiny') && (bbox.width < this.options.smallThreshold && bbox.height < this.options.smallThreshold));

        this.$el.css({
            width: bbox.width,
            height: bbox.height,
            left: bbox.x,
            top: bbox.y
        });

        if (this.hasHandle('unlink')) {
            this.toggleUnlink();
        }
    },

    // Updates the box content.
    updateBoxContent: function() {

        if (!this.$box) return;

        var boxContent = this.options.boxContent;
        var cellView = this.options.cellView;

        if (_.isFunction(boxContent)) {

            var content = boxContent.call(this, cellView, this.$box[0]);

            // don't append empty content. (the content might had been created inside boxContent()
            if (content) {
                this.$box.html(content);
            }

        } else if (boxContent) {

            this.$box.html(boxContent);

        } else {

            this.$box.remove();
        }
    },

    // Add multiple handles in one go. This is just a syntactic sugar
    // to looping over `handles` and calling `addHandle()`.
    addHandles: function(handles) {

        _.each(handles, this.addHandle, this);
        return this;
    },

    addHandle: function(opt) {

        var handle = this.getHandle(opt.name);

        /// Add new handle only if this does not exist yet.
        if (!handle) {

            this.handles.push(opt);

            _.each(opt.events, function(method, event) {

                if (_.isString(method)) {

                    this.on('action:' + opt.name + ':' + event, this[method], this);

                } else {

                    // Otherwise, it must be a function.
                    this.on('action:' + opt.name + ':' + event, method);
                }

            }, this);

            if (this.$handles) {
                // Render the new handle only if the entire halo has been rendered.
                // Otherwise `render()` takes care about it.
                var $handle = this.renderHandle(opt).appendTo(this.$handles);
            }
        }

        return this;
    },

    renderHandle: function(opt) {

        // basic handle element
        var handleIdx = this.getHandleIdx(opt.name);
        var $handle = $('<div/>')
            .addClass('handle')
            .addClass(opt.name)
            .attr('data-action', opt.name)
            .prop('draggable', false);

        switch (this.options.type) {

            case 'toolbar':
            case 'surrounding':

                // add direction to the handle, so the handle
                // can be positioned via css
                $handle.addClass(opt.position);

                if (opt.content) {
                    $handle.html(opt.content);
                }

                break;

            case 'pie':

                var outerRadius = this.PIE_OUTER_RADIUS;
                var innerRadius = this.PIE_INNER_RADIUS;
                var iconRadius = (outerRadius + innerRadius) / 2;
                var center = g.point(outerRadius, outerRadius);
                var sliceRadian = g.toRad(this.options.pieSliceAngle);
                var startRadian = handleIdx * sliceRadian + g.toRad(this.options.pieStartAngleOffset);
                var stopRadian = startRadian + sliceRadian;
                var slicePathData = V.createSlicePathData(innerRadius, outerRadius, startRadian, stopRadian);

                // Create SVG elements for the slice.
                var svgRoot = V('svg').addClass('slice-svg');
                // Note that css transformation on svg elements do not work in IE.
                var svgSlice = V('path').attr('d', slicePathData).translate(outerRadius, outerRadius).addClass('slice');

                // Position the icon in the center of the slice.
                var iconPosition = g.point.fromPolar(iconRadius, - startRadian - sliceRadian / 2, center);
                var iconSize = this.options.pieIconSize;
                var svgIcon = V('image').attr(iconPosition).addClass('slice-icon');

                // Setting the size of an SVG image via css is possible only in chrome.
                svgIcon.attr({ width: iconSize, height: iconSize });

                // Setting a `transform` css rule on an element with a value as
                // a percentage is not possible in firefox.
                svgIcon.translate(-iconSize / 2, -iconSize / 2);

                svgRoot.append([svgSlice, svgIcon]);
                $handle.append(svgRoot.node);

                break;
        }

        if (opt.icon) {
            this.setHandleIcon($handle, opt.icon);
        }

        // `opt.attrs` allows for setting arbitrary attributes on the generated HTML.
        // This object is of the form: `<selector> : { <attributeName> : <attributeValue>, ... }`
        joint.util.setAttributesBySelector($handle, opt.attrs);

        return $handle;
    },

    setHandleIcon: function($handle, icon) {

        switch (this.options.type) {

            case 'pie':
                var $icon = $handle.find('.slice-icon');
                V($icon[0]).attr('xlink:href', icon);
                break;

            case 'toolbar':
            case 'surrounding':
                $handle.css('background-image', 'url(' + icon + ')');
                break;
        }
    },

    // Remove all the handles from the Halo.
    removeHandles: function() {

        // Note that we cannot use `_.each()` here because `removeHandle()`
        // changes the length of the `handles` array.
        while (this.handles.length) {
            this.removeHandle(this.handles[0].name);
        }

        return this;
    },

    removeHandle: function(name) {

        var handleIdx = this.getHandleIdx(name);
        var handle = this.handles[handleIdx];
        if (handle) {

            _.each(handle.events, function(method, event) {

                this.off('action:' + name + ':' + event);

            }, this);

            this.$('.handle.' + name).remove();

            this.handles.splice(handleIdx, 1);
        }

        return this;
    },

    changeHandle: function(name, opt) {

        var handle = this.getHandle(name);
        if (handle) {

            this.removeHandle(name);
            this.addHandle(_.merge({ name: name }, handle, opt));
        }

        return this;
    },

    hasHandle: function(name) {

        return this.getHandleIdx(name) !== -1;
    },

    getHandleIdx: function(name) {

        return _.findIndex(this.handles, { name: name });
    },

    getHandle: function(name) {

        return _.findWhere(this.handles, { name: name });
    },

    // Handle selection
    // ----------------
    // Adds 'selected' class on certain handle.
    // Replace the icon based on the selected state.

    // change the selected state of a handle.
    // selected / unselected
    toggleHandle: function(name, selected) {

        var handle = this.getHandle(name);

        if (handle) {

            var $handle = this.$('.handle.' + name);

            if (_.isUndefined(selected)) {
                // If no selected state is requested
                // change the current state to the opposite one.
                selected = !$handle.hasClass('selected');
            }

            $handle.toggleClass('selected', selected);

            var icon = selected ? handle.iconSelected : handle.icon;

            if (icon) {
                this.setHandleIcon($handle, icon);
            }
        }

        return this;
    },

    // a helper to select handle
    selectHandle: function(name) {

        return this.toggleHandle(name, true);
    },

    // a helper to unselect handle
    deselectHandle: function(name) {

        return this.toggleHandle(name, false);
    },

    // a helper to deselect all selected handles
    deselectAllHandles: function() {

        _.chain(this.handles).pluck('name').each(this.deselectHandle, this).value();

        return this;
    },

    onHandlePointerDown: function(evt) {

        this._action = $(evt.target).closest('.handle').attr('data-action');
        if (this._action) {

            evt.preventDefault();
            evt.stopPropagation();
            evt = joint.util.normalizeEvent(evt);

            this._clientX = evt.clientX;
            this._clientY = evt.clientY;
            this._startClientX = this._clientX;
            this._startClientY = this._clientY;

            this.triggerAction(this._action, 'pointerdown', evt);
        }
    },

    onPieTogglePointerDown: function(evt) {

        evt.stopPropagation();
        var $pieToggle = $(evt.target).closest('.pie-toggle');
        var toggleName = $pieToggle.attr('data-name');
        if (this.isOpen(toggleName)) {
            // The pie menu was opened with the same toggle button, toggle the state
            // for the same button which effectively closes the pie menu.
            this.toggleState(toggleName);
        } else if (this.isOpen()) {
            // If the pie menu was open by a different toggle button, close it first,
            // then open it for a different toggle button.
            this.toggleState();
            this.toggleState(toggleName);
        } else {
            // Otherwise, just open the pie menu for with that toggle button.
            this.toggleState(toggleName);
        }
    },

    // Trigger an action on the Halo object. `evt` is a DOM event, `eventName` is an abstracted
    // JointJS event name (pointerdown, pointermove, pointerup).
    triggerAction: function(action, eventName, evt) {

        var args = Array.prototype.slice.call(arguments, 2);
        args.unshift('action:' + action + ':' + eventName);
        this.trigger.apply(this, args);
    },

    startCloning: function(evt) {

        var options = this.options;

        options.graph.trigger('batch:start');

        var clone = options.clone(options.cellView.model, { clone: true });
        if (!(clone instanceof joint.dia.Cell)) {
            throw new Error('ui.Halo: option "clone" has to return a cell.');
        }

        clone.addTo(options.graph, { halo: this.cid });

        this._cloneView = clone.findView(options.paper);
        this._cloneView.pointerdown(evt, this._clientX, this._clientY);
    },

    startLinking: function(evt) {

        this.options.graph.trigger('batch:start');

        var cellView = this.options.cellView;
        var selector = $.data(evt.target, 'selector');
        var link = this.options.paper.getDefaultLink(cellView, selector && cellView.el.querySelector(selector));

        link.set('source', { id: cellView.model.id, selector: selector });
        link.set('target', { x: evt.clientX, y: evt.clientY });

        link.attr(this.options.linkAttributes);
        if (_.isBoolean(this.options.smoothLinks)) {
            link.set('smooth', this.options.smoothLinks);
        }

        // add link to graph but don't validate
        this.options.graph.addCell(link, { validation: false, halo: this.cid });

        link.set('target', this.options.paper.snapToGrid({ x: evt.clientX, y: evt.clientY }));

        this._linkView = this.options.paper.findViewByModel(link);
        this._linkView.startArrowheadMove('target', { whenNotAllowed: 'remove' });
    },

    startForking: function(evt) {

        var options = this.options;

        options.graph.trigger('batch:start');

        var clone = options.clone(options.cellView.model, { fork: true });
        if (!(clone instanceof joint.dia.Cell)) {
            throw new Error('ui.Halo: option "clone" has to return a cell.');
        }

        var link = options.paper.getDefaultLink(options.cellView).set({
            source: { id: options.cellView.model.id },
            target: { id: clone.id }
        });

        link.attr(options.linkAttributes);
        if (_.isBoolean(options.smoothLinks)) {
            link.set('smooth', options.smoothLinks);
        }

        options.graph.addCells([clone, link], { halo: this.cid });

        this._cloneView = clone.findView(options.paper);
        this._cloneView.pointerdown(evt, this._clientX, this._clientY);
    },

    startResizing: function(evt) {

        this.options.graph.trigger('batch:start');

        // determine whether to flip x,y mouse coordinates while resizing or not
        this._flip = [1, 0, 0, 1, 1, 0, 0, 1][
            Math.floor(g.normalizeAngle(this.options.cellView.model.get('angle')) / 45)
        ];
    },

    startRotating: function(evt) {

        this.options.graph.trigger('batch:start');

        var center = this.options.cellView.model.getBBox().center();
        var angle = g.normalizeAngle(this.options.cellView.model.get('angle'));
        var clientCoords = this.options.paper.snapToGrid({ x: evt.clientX, y: evt.clientY });

        this._center = center;
        this._rotationStartAngle = angle || 0;
        this._clientStartAngle = g.point(clientCoords).theta(center);
    },

    doResize: function(evt, dx, dy) {

        var size = this.options.cellView.model.get('size');

        var width = Math.max(size.width + ((this._flip ? dx : dy)), 1);
        var height = Math.max(size.height + ((this._flip ? dy : dx)), 1);

        this.options.cellView.model.resize(width, height, { absolute: true });
    },

    doRotate: function(evt) {

        // Calculate an angle between the line starting at mouse coordinates, ending at the centre
        // of rotation and y-axis and deduct the angle from the start of rotation.
        var clientCoords = this.options.paper.snapToGrid({ x: evt.clientX, y: evt.clientY });
        var theta = this._clientStartAngle - g.point(clientCoords).theta(this._center);
        var newAngle = g.snapToGrid(this._rotationStartAngle + theta, this.options.rotateAngleGrid);

        this.options.cellView.model.rotate(newAngle, true);
    },

    doClone: function(evt) {

        this._cloneView.pointermove(evt, this._clientX, this._clientY);
    },

    doFork: function(evt) {

        this._cloneView.pointermove(evt, this._clientX, this._clientY);
    },

    doLink: function(evt) {

        if (this._linkView) {

            var clientCoords = this.options.paper.snapToGrid({ x: evt.clientX, y: evt.clientY });

            this._linkView.pointermove(evt, clientCoords.x, clientCoords.y);
        }
    },

    stopLinking: function(evt) {

        if (this._linkView) {

            this._linkView.pointerup(evt);

            if (this._linkView.model.hasLoop()) {
                this.makeLoopLink(this._linkView.model);
            }

            this.stopBatch();
            this.triggerAction('link', 'add', this._linkView.model);
            this._linkView = null;
        }
    },

    stopForking: function(evt) {

        this._cloneView.pointerup(evt, this._clientX, this._clientY);
        this.stopBatch();
    },

    stopCloning: function(evt) {

        this._cloneView.pointerup(evt, this._clientX, this._clientY);
        this.stopBatch();
    },

    pointermove: function(evt) {

        if (!this._action) return;

        evt.preventDefault();
        evt.stopPropagation();
        evt = joint.util.normalizeEvent(evt);

        var clientCoords = this.options.paper.snapToGrid({ x: evt.clientX, y: evt.clientY });
        var oldClientCoords = this.options.paper.snapToGrid({ x: this._clientX, y: this._clientY });

        var dx = clientCoords.x - oldClientCoords.x;
        var dy = clientCoords.y - oldClientCoords.y;

        this.triggerAction(this._action, 'pointermove', evt, dx, dy, evt.clientX - this._startClientX, evt.clientY - this._startClientY);

        this._clientX = evt.clientX;
        this._clientY = evt.clientY;
    },

    pointerup: function(evt) {

        if (!this._action) return;

        this.triggerAction(this._action, 'pointerup', evt);
        this._action = null;
    },

    stopBatch: function() {

        this.options.graph.trigger('batch:stop');
    },

    onRemove: function() {

        $(document.body).off('mousemove touchmove', this.pointermove);
        $(document).off('mouseup touchend', this.pointerup);
    },

    removeElement: function(evt) {

        this.options.cellView.model.remove();
    },

    unlinkElement: function(evt) {

        this.options.graph.removeLinks(this.options.cellView.model);
    },

    toggleUnlink: function() {

        var canUnlink = this.options.graph.getConnectedLinks(this.options.cellView.model).length > 0;

        this.$handles.children('.unlink').toggleClass('hidden', !canUnlink);
    },

    toggleFork: function() {

        // temporary create a clone model and its view
        var clone = this.options.cellView.model.clone();
        var cloneView = this.options.paper.createViewForModel(clone);

        // if a connection after forking would not be valid, hide the fork icon
        var canFork = this.options.paper.options.validateConnection(this.options.cellView, null, cloneView, null, 'target');

        this.$handles.children('.fork').toggleClass('hidden', !canFork);

        cloneView.remove();
        clone = null;
    },

    // Toggles open/closed state of the halo.
    // `toggleName` is the name of the pie toggle button as defined in `options.pieToggles`.
    toggleState: function(toggleName) {

        var $el = this.$el;

        _.each(this.$pieToggles, function($pieToggle) {
            $pieToggle.removeClass('open');
        });

        if (this.isOpen()) {
            this.trigger('state:close', toggleName);
            $el.removeClass('open');
        } else {
            // Note that we trigger the `state:open` event BEFORE we add
            // the `'open'` class name to the halo. The reason
            // is to give the programmer a chance to add/remove/change handles
            // in the handler for the state:open event before the handles
            // are actually made visible in the DOM.
            this.trigger('state:open', toggleName);
            if (toggleName) {
                var pieToggle = _.findWhere(this.options.pieToggles, { name: toggleName });
                if (pieToggle) {
                    // Add the pie toggle position
                    // to the halo container so that we can position the handles
                    // based on the position of the toggle that opened it.
                    // Add also the pie toggle name so that handles can be styled
                    // differently based on the pie toggle that was used to open them.
                    $el.attr({
                        'data-pie-toggle-position': pieToggle.position,
                        'data-pie-toggle-name': pieToggle.name
                    });
                }
                this.$pieToggles[toggleName].addClass('open');
            }
            $el.addClass('open');
        }
    },

    // Return true if the Halo is open. This makes sense (similar to toggleState())
    // only for the 'pie' type of Halo.
    // If `toggleName` is passed, return true only if the halo was opened by that specific toggle button.
    isOpen: function(toggleName) {

        return toggleName ? this.$pieToggles[toggleName].hasClass('open') : this.$el.hasClass('open');
    },

    makeLoopLink: function(link) {

        var linkWidth = this.options.loopLinkWidth;
        var paperOpt = this.options.paper.options;
        var paperRect = g.rect({ x: 0, y: 0, width: paperOpt.width, height: paperOpt.height });
        var bbox = V(this.options.cellView.el).bbox(false, this.options.paper.viewport);
        var p1, p2;

        var sides = _.uniq([this.options.loopLinkPreferredSide, 'top', 'bottom', 'left', 'right']);
        var sideFound = _.find(sides, function(side) {

            var centre;
            var dx = 0;
            var dy = 0;

            switch (side) {

            case 'top':
                centre = g.point(bbox.x + bbox.width / 2, bbox.y - linkWidth);
                dx = linkWidth / 2;
                break;

            case 'bottom':
                centre = g.point(bbox.x + bbox.width / 2, bbox.y + bbox.height + linkWidth);
                dx = linkWidth / 2;
                break;

            case 'left':
                centre = g.point(bbox.x - linkWidth, bbox.y + bbox.height / 2);
                dy = linkWidth / 2;
                break;

            case 'right':
                centre = g.point(bbox.x + bbox.width + linkWidth, bbox.y + bbox.height / 2);
                dy = linkWidth / 2;
                break;
            };

            p1 = g.point(centre).offset(-dx, -dy);
            p2 = g.point(centre).offset(dx, dy);

            return paperRect.containsPoint(p1) && paperRect.containsPoint(p2);

        }, this);

        if (sideFound) link.set('vertices', [p1, p2]);
    }

}, {

    // removes a halo from a paper
    clear: function(paper) {

        paper.trigger('halo:create');
    }
});
