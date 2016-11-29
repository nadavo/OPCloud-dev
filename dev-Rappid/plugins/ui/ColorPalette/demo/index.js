/*! Rappid v1.7.1 - HTML5 Diagramming Framework

Copyright (c) 2015 client IO

 2016-03-03 


This Source Code Form is subject to the terms of the Rappid Academic License
, v. 1.0. If a copy of the Rappid License was not distributed with this
file, You can obtain one at http://jointjs.com/license/rappid_academic_v1.txt
 or from the Rappid archive as was distributed by client IO. See the LICENSE file.*/


var cp = new joint.ui.ColorPalette({
    options: [
        { content: '#000000' },
        { content: '#FFFFFF' },
        { content: 'transparent', icon: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGoAAABrCAYAAACffRcyAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAABPxJREFUeNrsnc9rU1kUx+/LS2LTBtI4VMiqjYjiQgQ3IoIUuhvGUmYzUBgV8SdWLS7sooLgxm0XgjKg0P+gMDC7ggjDzGwGOt1psS2WBptioiYVmrbxnviiSc17eaPvvdzz7vcLlyTk5vVyPtzzzv3mtDWq1arYrVwuNyAfxuUYkaNfQEFoWY4ZOaYymczS7jeNRlASUC9NlOMs4tZRTdNGkcCKX4GyID2V4yjipITm5Bisw4oAkrIiFk8tNp9AWekOkNSENVVLfaurq1Q4LCImSisbtao7R5mmWTQMYxPx8l6yRohvb2/3tpk2HrVKcFtA6XT6WSwWKyOk/qlSqfQUCoVTDsBGIk7nJEAKRhRjirXDlP6I024CpGBhUczt3rcFhXtS8HKKeQTh4aHot35Q3vyObW1tpdvNSyQSi8lk8iWu1yFQtGg59rWbJyuZNVzv+4XUx0QABVCa68+/0mJi8oj4/Y99Xlwuioj6BOn8lSHx4UOs9vr0j2vYUYrJ/G++6zOkRKIihn9aQepTzV14viB6Lo5lP0N68mhWnDxRACjFIP1w9YYwNjZMryEBlNeQSmVR7e7e9hoSib44rLasMqLRtb6+vlm7D5ZKpf3ycNfj4qCY2tnZ2dM2t5tmSY4NbtejexKlO9pJBOndbw/ym4cPtd0ArRyMfD4/ZHeo/uaqz61N4vTDGxWPx9dSqdQ8q+tRdXfhGhUOtXRnPH44u3nwwDE/HAykPi9KcB/uSQDFEBJAMYEEUEwgAdT3OA4BQgIoBRwHgGLiOAAUE8fBrXzvmaATPR0W3TgEdPhU5Xo1x+Hy9WbHQR5m5QnZk/XJOa8DAeW2h0A3x8Ht+pD6GJfgAMUcEkDZQSLdmfhbFUgAZQfp9q1/xK+jKyotUXtQTY5DHdLYlZeqrVNrUE2Og8KQtAbV5DgoDklbUI2OAwdIJO16Jhp7HOh1eXLizcbPw1tBrw89E24dB2snSUjZTqwPPRP/pwRXPN3pB4o5JD1AhQBS+EGFBFKoQXFxHLQGxclx0BYUN8dBS1CR9yWRuneflePgVqHpmTCKb83kxWvZyOJSV4PjkJUn0KwK62txgNawZyKfj4vRc0Pi1UpXpx0H9EzYRzAuRn4hSL1hS3fhAaUJJN6gNILEF5RmkFiCoupON0jsQNE5KXnmQlY3SKxAEaS9V2+K+jlJJ0hsQNUhxV4sCB0h1VK+6j0TNcdBprtdjkPgPQ7omQiZ46Bfz4SGJTg/UIDEABQgMQAFSOqD0tVxYAVKZ8eBDSjdHQcWoOA4uFfHeia49Tjo2TMRYschPD0TKMEZgAIkBqAAiQEoQFIfFBwHBqDgODAABceBASg4Dj7cQrzumQhrj0O4eibgODDomUAJzuAeBUhMQF0aOw5IHECVy3FA8lfe/HvXu5P/1h4V+husANVKAMTXmYAACqnPD9EJ3M3hzm0PgW7XCwyU29/6wPWQ+nCPghQAVa1W4whPsHKKuS0oeUPsrVQqPQhfMKJYU8ydQC3bvVkoFE4BVjCQKNYOU5ap6puR46bdrlpfXx82TbNoGMYmQupPunPaSZZm6BveAflkESFTWtlIJpNZkk+mEQtlNU2M6sXEuBxziIlymrPYfKr6JLGifBgELOUgDVpsvpTnDbCQBhVId42QSIasOr6alcvlBqwtNyJHP+IWiJatCnzKqhua1BIUpJ4+CjAAVnYzLhKE5pcAAAAASUVORK5CYII=' },
        { content: '#B3B3B3' },
        { content: '#808080' },
        { content: '#4D4D4D' },
        { content: '#E6E6E6' },
        { content: '#FFC7C9' },
        { content: '#FFA0A4' },
        { content: '#E3686D' },
        { content: '#D71920' },
        { content: '#FFE3D1' },
        { content: '#FFCBA8' },
        { content: '#FFAB73' },
        { content: '#F58235' }
    ]
});
cp.on('option:hover', function(option, index) {
    console.log('option', option, 'at index', index, 'hovered');
});
cp.on('option:select', function(option, index) {
    console.log('option', option, 'at index', index, 'selected');
});
$('.color-palettes').append(cp.render().el);


var cp2 = new joint.ui.ColorPalette({
    selected: -1,
    placeholder: '<img height="24" width="34" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGwAAAA4CAYAAAAYeR0sAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAvRJREFUeNrs3Ftu2kAUBuDxYG7iDk9+6w7aJbCELiFL6xKyhCyh7KBP8AS43O/UPzUqilKD8TnDTDi/ZEUiinM4n8Bjezze8XhUlxkMBt+iH91oayrJIxNG21sQBD8vX/TOYDHUj2j7Kr2yKr1oeznDncBirLdoa0h/rMxvfOsBzev3+/jq+yVYTqB90fi4CZYTgdELwL5LL5xJV0sPnErTT/pttVpNvUcMYpbLpTocDqSVFotFlc/nyfbHVafv+6pUKt399/v9/lTXf/ef9Me1Wi3VP8ObH41G5E2o1+uqUqmQ7Y+rznK5rJrNbKevm80mEUxTN2G73ZI3gQOLo86sWLdEP1MTXMciARMsc1gkYIJl9pJrJrAwDAWLOOv1mgcMWEmjGcFKH/RzNpslnzYIlh1Y8/lcTSaT6+d5nxELwZunxsKJOwdWmp7qz4jFUSew2u32Q7FSgQlWW2mtH17rTRVMp1PBsgDrJrBbRi6CZa5WfQ0LOxcse2pNrGaxWAiWZbUau4FZKBQEi6BWI2BoQqvVEiyCaBNY1E3gGLXmcjnrsdjBOLA4Rq2e552+AWzHYgXjwqIetQKr0+mQzhfhwmIDEyweLBYwweLDIgcTLF4sUjDB4sdCfMHKFq4bpWyfMMEyh5UZjANrtVo9NRamerOAcWDhzVNjIY1Gwwks1Ihp6eRgXFjD4VC9f+Y6a3DBGXcJXMBCT/FtQAomWHxYt/Q0Vdc5rrkJVroPgE6DhQM3rmoL1uPOXXUaLMoDt2Ddd2jRguUO1tUrHdihYNFiYapElnFAIhj1bf1nx6KYhGRsEg6aMB6PybHw4PyzYBkDOzcBT8hTNyHtg/MuYxkBk0dqaevUguXWs2SJgw5MJ7s3nAuX4OQ9S23vsVAn9bH13jqvHTYSwaink1Fkt9tZWZepOmWtKccCsFdpgzN5lQUu3cnfBS6DIMAt3m78gsReLCwhG56OYfECwEDrSW+sSy/G+rdI82VkGXRr8uEy6H8EGAAODxITciG+ZgAAAABJRU5ErkJggg=="/>',
    options: [
        { content: '#000000' },
        { content: '#FFFFFF' },
        { content: 'transparent', icon: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGoAAABrCAYAAACffRcyAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAABPxJREFUeNrsnc9rU1kUx+/LS2LTBtI4VMiqjYjiQgQ3IoIUuhvGUmYzUBgV8SdWLS7sooLgxm0XgjKg0P+gMDC7ggjDzGwGOt1psS2WBptioiYVmrbxnviiSc17eaPvvdzz7vcLlyTk5vVyPtzzzv3mtDWq1arYrVwuNyAfxuUYkaNfQEFoWY4ZOaYymczS7jeNRlASUC9NlOMs4tZRTdNGkcCKX4GyID2V4yjipITm5Bisw4oAkrIiFk8tNp9AWekOkNSENVVLfaurq1Q4LCImSisbtao7R5mmWTQMYxPx8l6yRohvb2/3tpk2HrVKcFtA6XT6WSwWKyOk/qlSqfQUCoVTDsBGIk7nJEAKRhRjirXDlP6I024CpGBhUczt3rcFhXtS8HKKeQTh4aHot35Q3vyObW1tpdvNSyQSi8lk8iWu1yFQtGg59rWbJyuZNVzv+4XUx0QABVCa68+/0mJi8oj4/Y99Xlwuioj6BOn8lSHx4UOs9vr0j2vYUYrJ/G++6zOkRKIihn9aQepTzV14viB6Lo5lP0N68mhWnDxRACjFIP1w9YYwNjZMryEBlNeQSmVR7e7e9hoSib44rLasMqLRtb6+vlm7D5ZKpf3ycNfj4qCY2tnZ2dM2t5tmSY4NbtejexKlO9pJBOndbw/ym4cPtd0ArRyMfD4/ZHeo/uaqz61N4vTDGxWPx9dSqdQ8q+tRdXfhGhUOtXRnPH44u3nwwDE/HAykPi9KcB/uSQDFEBJAMYEEUEwgAdT3OA4BQgIoBRwHgGLiOAAUE8fBrXzvmaATPR0W3TgEdPhU5Xo1x+Hy9WbHQR5m5QnZk/XJOa8DAeW2h0A3x8Ht+pD6GJfgAMUcEkDZQSLdmfhbFUgAZQfp9q1/xK+jKyotUXtQTY5DHdLYlZeqrVNrUE2Og8KQtAbV5DgoDklbUI2OAwdIJO16Jhp7HOh1eXLizcbPw1tBrw89E24dB2snSUjZTqwPPRP/pwRXPN3pB4o5JD1AhQBS+EGFBFKoQXFxHLQGxclx0BYUN8dBS1CR9yWRuneflePgVqHpmTCKb83kxWvZyOJSV4PjkJUn0KwK62txgNawZyKfj4vRc0Pi1UpXpx0H9EzYRzAuRn4hSL1hS3fhAaUJJN6gNILEF5RmkFiCoupON0jsQNE5KXnmQlY3SKxAEaS9V2+K+jlJJ0hsQNUhxV4sCB0h1VK+6j0TNcdBprtdjkPgPQ7omQiZ46Bfz4SGJTg/UIDEABQgMQAFSOqD0tVxYAVKZ8eBDSjdHQcWoOA4uFfHeia49Tjo2TMRYschPD0TKMEZgAIkBqAAiQEoQFIfFBwHBqDgODAABceBASg4Dj7cQrzumQhrj0O4eibgODDomUAJzuAeBUhMQF0aOw5IHECVy3FA8lfe/HvXu5P/1h4V+husANVKAMTXmYAACqnPD9EJ3M3hzm0PgW7XCwyU29/6wPWQ+nCPghQAVa1W4whPsHKKuS0oeUPsrVQqPQhfMKJYU8ydQC3bvVkoFE4BVjCQKNYOU5ap6puR46bdrlpfXx82TbNoGMYmQupPunPaSZZm6BveAflkESFTWtlIJpNZkk+mEQtlNU2M6sXEuBxziIlymrPYfKr6JLGifBgELOUgDVpsvpTnDbCQBhVId42QSIasOr6alcvlBqwtNyJHP+IWiJatCnzKqhua1BIUpJ4+CjAAVnYzLhKE5pcAAAAASUVORK5CYII=' },
        { content: '#B3B3B3' },
        { content: '#808080' },
        { content: '#4D4D4D' },
        { content: '#E6E6E6' },
        { content: '#FFC7C9' },
        { content: '#FFA0A4' },
        { content: '#E3686D' },
        { content: '#D71920' },
        { content: '#FFE3D1' },
        { content: '#FFCBA8' },
        { content: '#FFAB73' },
        { content: '#F58235' }
    ]
});
$('.color-palettes').append('<br/><h4>Invalid option + placeholder:</h4>', cp2.render().el);

var cp3 = new joint.ui.ColorPalette(_.extend({}, cp.options, { target: '.target' }));
$('.target').prepend('<p><strong>joint.ui.ColorPalette</strong> inside a target element with a scrollbar</p>', cp3.render().el, '<div style="height: 200px"></div>');
