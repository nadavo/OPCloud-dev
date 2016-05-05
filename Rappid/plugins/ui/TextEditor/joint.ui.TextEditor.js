/*! Rappid v1.7.1 - HTML5 Diagramming Framework

Copyright (c) 2015 client IO

 2016-03-03 


This Source Code Form is subject to the terms of the Rappid Academic License
, v. 1.0. If a copy of the Rappid License was not distributed with this
file, You can obtain one at http://jointjs.com/license/rappid_academic_v1.txt
 or from the Rappid archive as was distributed by client IO. See the LICENSE file.*/


// ui.TextEditor
// =============

// Inline SVG text editing that is nearly identical to the native text
// editing inside the HTML textarea element.

// Features:
// ---------

// - Rich text editing.
// - Selections.
// - Caret.
// - Caret positioning left or right based on the distance to
//   the left/right edge of the clicked character.
// - Handles newlines seamlessly.
// - Selections, both all-text and portions of text.
// - Word selection by double-click.
// - Whole text selection by triple-click.
// - Keyboard navigation native to the underlying OS.
// - API for programmatic access (selections, caret, word boundary, ...).
// - Selections and caret can be styled in CSS.
// - Supports editing of a rotated text.
// - Supports editing of a scaled text.

// Important note: The ui.TextEditor assumes the SVG `<text>` element
// contains a `<tspan>` element for each line. Lines are ordered as they
// appear in the DOM. If a line is empty, it is assumed the `<tspan>`
// element contains a space character.
// This is in line with how Vectorizer renders text.

joint.ui.TextEditor = joint.mvc.View.extend({

    options: {
        text: undefined, // The SVG text element on which we want to enable inline text editing.
        newlineCharacterBBoxWidth: 10, // The width of the new line character. Used for selection of a newline.
        placeholder: undefined,  // The placeholder in case the text gets emptied.
        focus: true, // Determines if the textarea should gain focus. In some cases, this is not intentional - e.g. if we use the ui.TextEditor for displaying remote cursor.
        debug: false,
        useNativeSelection: true,
        annotateUrls: false,
        urlAnnotation: {
            attrs: {
                'class': 'url-annotation',
                fill: 'lightblue',
                'text-decoration': 'underline'
            }
        },
        textareaAttributes: {
            autocorrect: 'off',
            autocomplete: 'off',
            autocapitalize: 'off',
            spellcheck: 'false',
            tabindex: '0'
        }
    },

    className: 'text-editor',

    events: {
        'keyup textarea': 'onKeyup',
        'input textarea': 'onInput',
        'copy textarea': 'onCopy',
        'cut textarea': 'onCut',
        'paste textarea': 'onPaste',
        'mousedown .char-selection-box': 'onMousedown',
        'dblclick .char-selection-box': 'onDoubleClick',
        'click .char-selection-box': 'onTripleClick'
    },

    selection: {
        start: null,
        end: null
    },

    selecting: false,

    init: function() {

        _.bindAll(this, 'onMousedown', 'onMousemove', 'onMouseup', 'onDoubleClick', 'onTripleClick', 'onKeydown', 'onAfterPaste', 'onAfterKeydown');

        this.setTextElement(this.options.text);

        $(document.body).on('mousemove', this.onMousemove);
        $(document.body).on('mouseup', this.onMouseup);
        $(document.body).on('keydown', this.onKeydown);

        if (this.options.cellView) {
            this.$viewport = $(this.options.cellView.paper.viewport);
        } else {
            // If cellView is not passed, the viewport (text-selectable area) is the text element itself.
            // If $viewport is not set, Chrome prints a warning about "Discontiguous Selection" and selections are not rendered.
            this.$viewport = $(this.options.text);
        }

        if (this.options.annotations) {
            this.setAnnotations(this.options.annotations);
        }
    },

    setTextElement: function(textElement) {

        if (this.$elText) {
            this.unbindTextElement();
        }

        this.options.text = textElement;

        this.$elText = $(textElement);
        this.$elText.on('mousedown', this.onMousedown);
        this.$elText.on('dblclick', this.onDoubleClick);
        this.$elText.on('click', this.onTripleClick);
    },

    // @public
    render: function(root) {

        // The caret (cursor), displayed as a thin <div> styled in CSS.
        this.$caret = $('<div>', { 'class': 'caret' });

        // The container for selection boxes.
        this.$selection = $('<div>');
        // One selection box covering one character.
        this.$selectionBox = $('<div>', { 'class': 'char-selection-box' });
        this.$el.append(this.$caret, this.$selection);

        this.$textareaContainer = $('<div>', { 'class': 'textarea-container' });

        this.$textarea = $('<textarea>', this.options.textareaAttributes);
        this.textarea = this.$textarea[0];
        this._textContent = this.textarea.value = this.getTextContent();

        this._textareaValueBeforeInput = this.textarea.value;
        this.$textareaContainer.append(this.textarea);

        if (this.options.focus) {
            this.$el.append(this.$textareaContainer);
        }

        // First add the container element to the `<body>`, otherwise
        // the `focus()` called afterwords would not work.
        $(root || document.body).append(this.$el);

        var bbox = V(this.options.text).bbox();

        this.$textareaContainer.css({
            left: bbox.x,
            top: bbox.y
        });

        this.focus();

        // TODO: This should be optional?
        V(this.options.text).attr('cursor', 'text');

        this.selectAll();

        return this;
    },

    annotateURLBeforeCaret: function(selectionStart) {

        // If whitespace character was added, check if there is not a URL
        // before the inserted text. If yes, annotate it.
        var urlBoundary = this.getURLBoundary(Math.max(selectionStart - 1, 0));
        if (urlBoundary) {

            var annotations = this.getAnnotations();
            annotations = this.annotateURL(annotations || [], urlBoundary[0], urlBoundary[1]);
            return true;
        }

        return false;
    },

    hasSelection: function() {

        return _.isNumber(this.selection.start) &&
                _.isNumber(this.selection.end) &&
                this.selection.start !== this.selection.end;
    },

    textContentHasChanged: function() {

        return this._textContent !== this.textarea.value;
    },

    restoreTextAreaSelectionDirection: function() {

        if (this._selectionDirection) {
            this.textarea.selectionDirection = this._selectionDirection;
        }
    },

    storeSelectionDirection: function() {

        this._selectionDirection = this.textarea.selectionDirection;
    },

    onKeydown: function(evt) {

        if (this.options.debug) {
            console.log('onKeydown(): ', evt.keyCode);
        }

        if (this.hasSelection()) {
            this.deselect();
            // Restore the textarea.selectionDirection so that the textarea knows in what direction
            // it should select in case Shift+Arrow keys are used.
            this.restoreTextAreaSelectionDirection();
        }

        // The stream of events when typing something to the textarea is:
        // keydown -> keypress/paste -> letter typed in textarea -> keyup.
        // Therefore, in keydown, we can store the selectionStart
        // value of the textarea before it is adjusted based on the input.
        // Also note that we use keydown and not keypress because
        // e.g. BACKSPACE key is not handled in keypress.

        // We want the navigation keys to be reflected in the UI immediately on keydown.
        // However, at that time, the textarea's selectionStart/End does not yet
        // take into account this very keydown action. Hence we need to
        // defer the `setCaret()` to the next turn. Note that there is no other way
        // as keypress is not triggered for arrow keys and when keyup is triggered, it's too late.
        setTimeout(this.onAfterKeydown, 0);

        this._copied = false;
        this._selectionStartBeforeInput = this.textarea.selectionStart;
        this._selectionEndBeforeInput = this.textarea.selectionEnd;
    },

    // Called after the textarea handled the keydown. Remember the order of events:
    // onKeydown -> textarea receives keydown -> onAfterKeydown
    onAfterKeydown: function() {

        if (this.$textarea.is(':focus')) {

            // Remember the textarea.selectionDirection because select() wipes it out (by clearning selections).
            // We will restore it just before the keydown is received by the textarea so that the
            // textarea selects in the right direction (using the Shift+Arrow keys).
            this.storeSelectionDirection();

            if (this.textarea.selectionStart === this.textarea.selectionEnd) {
                this.setCaret(this.textarea.selectionStart);
            } else {
                this.select(this.textarea.selectionStart, this.textarea.selectionEnd);
            }
        }
    },

    onKeyup: function(evt) {

        if (this.textContentHasChanged()) {
            this.onInput(evt);
        }
    },

    onCopy: function(evt) {

        if (!this._copied) {
            this.copyToClipboard();
        }
    },

    onCut: function(evt) {

        if (!this._copied) {
            this.copyToClipboard();
        }
    },

    copyToClipboard: function() {

        var copySupported = document.queryCommandSupported && document.queryCommandSupported('copy');

        if (copySupported) {
            this._copied = true;
            var successful = document.execCommand('copy');
        }
    },

    onInput: function(evt) {

        if (!this.textContentHasChanged()) return;

        var diffLength = this.textarea.value.length - this._textareaValueBeforeInput.length;

        var selectionBeforeInput = {
            start: this._selectionStartBeforeInput,
            end: this._selectionEndBeforeInput
        };

        var selectionAfterInput = {
            start: this.textarea.selectionStart,
            end: this.textarea.selectionEnd
        };

        if (this.options.debug) {
            console.log('onInput()', evt, 'selectionBeforeInput', selectionBeforeInput, 'selectionAfterInput', selectionAfterInput, 'diffLength', diffLength);
        }

        var opType = this.inferTextOperationType(selectionBeforeInput, selectionAfterInput, diffLength);
        var annotated = false;

        var annotations = this.getAnnotations();

        // If URL annotation is enabled and the user inserts a whitespace character,
        // try to detect a URL before the whitespace character. If one was found,
        // annotate it using the `urlAnnotation` option.
        if (this.options.annotateUrls && opType === 'insert') {

            var insertedText = this.textarea.value.substr(selectionBeforeInput.start, diffLength);
            if (this.options.debug) {
                console.log('onInput()', 'inserted text', insertedText);
            }

            if (/\s/.test(insertedText)) {

                annotated = this.annotateURLBeforeCaret(selectionBeforeInput.start);
                if (annotated) {
                    // Now we have to shift all the annotations after the inserted whitespace by one to the right.
                    annotations = this.shiftAnnotations(annotations, selectionAfterInput.end, diffLength);
                }
            }
        }

        if (annotations) {

            // Annotate only if it wasn't already annotated. This can happen if
            // URL annotation is enabled and we did indeed detect a URL. In this case,
            // the annotation is handed over to `annotateURL()` and not to the
            // generic annotation mechanism - based on the previous character.
            if (!annotated) {

                annotations = this.annotate(annotations, selectionBeforeInput, selectionAfterInput, diffLength);
            }

            if (this.options.debug) {
                console.log('onInput()', 'modified annotations', annotations);
            }

            // Take into account annotation attributes set from outside the text editor.
            // For example, if the user changes text to bold in the toolbar, the programmer
            // should call `setCurrentAnnotation()`. Then when the user starts typing ('insert' operation),
            // we want to create a new annotation with the desired attributes.
            if (this._currentAnnotationAttributes) {

                if (opType === 'insert') {

                    var insertAnnotation = {
                        start: selectionBeforeInput.start,
                        end: selectionAfterInput.end,
                        attrs: this._currentAnnotationAttributes
                    };
                    annotations.push(insertAnnotation);

                    // Current annotations are removed right after the very next input which is now.
                    // This is because the annotation already become part of the `annotations` array
                    // and so if the user continues typing, the next characters will inherit
                    // attributes of the previous one (which has our `insertAnnotation` applied).
                    this._currentAnnotationAttributes = undefined;

                    if (this.options.debug) {
                        console.log('onInput()', 'insert annotation', insertAnnotation, 'final annotations', annotations);
                    }
                }
            }
        }

        this._annotations = annotations;

        this.trigger('text:change', this.textarea.value, this._textareaValueBeforeInput, annotations, selectionBeforeInput, selectionAfterInput);

        // Store the previous textarea value.
        this._selectionBeforeInput = selectionAfterInput;
        this._textareaValueBeforeInput = this.textarea.value;
        this._textContent = this.textarea.value;
    },

    onPaste: function(evt) {

        if (this.options.debug) {
            console.log('onPaste()');
        }

        this._textareaValueBeforeInput = this.textarea.value;

        // Give chance to react on when the text was actually pasted to the textarea
        // and the textarea adjusted its selectionStart/End.
        setTimeout(this.onAfterPaste, 0);
    },

    // Called after the textarea handled the paste. Remember the order of events:
    // onPaste -> textarea receives paste -> onAfterPaste
    onAfterPaste: function() {

        this.setCaret(this.textarea.selectionStart);
    },

    onMousedown: function(evt) {

        // Do not deselect the text if it is a triple-click in order to prevent
        // the "blinking effect" (deselect all -> select all). See `onTripleClick()`.
        if (evt.originalEvent.detail === 3) return;

        if (this.options.debug) {
            console.log('onMousedown()');
        }

        var selectionStart = this.getCharNumFromEvent(evt);

        this.startSelecting();
        this.select(selectionStart);

        // Prevent default action that could set focus
        // on the text element and therefore the textarea
        // inside the editor would loose it.
        evt.preventDefault();
        // Stop propagation, the active text editor takes over mousedown.
        evt.stopPropagation();
    },

    onMousemove: function(evt) {

        if (this.selectionInProgress()) {

            if (this.options.debug) {
                console.log('onMousemove()');
            }

            var selectionEnd = this.getCharNumFromEvent(evt);

            // Remember the textarea.selectionDirection so that we can restore it later.
            // The reason is that select() internally clears the selection (removes all ranges)
            // which then wipes out the selectionDirection. To make sure that
            // Shift+Arrow keys select in the right direction, we have to remember it and
            // restore it later.
            this.storeSelectionDirection();

            // This will keep the start of the selection and change only the end.
            this.select(null, selectionEnd);

            // The active text editor takes over mousemove during selection.
            evt.preventDefault();
            evt.stopPropagation();
        }
    },

    onMouseup: function(evt) {

        if (this.selectionInProgress()) {

            if (this.options.debug) {
                console.log('onMouseup()');
            }

            this.stopSelecting();
            this.trigger('select:changed', this.selection.start, this.selection.end);
        }
    },

    onDoubleClick: function(evt) {

        if (this.options.debug) {
            console.log('onDoubleClick()');
        }

        var charNum = this.getCharNumFromEvent(evt);
        var wordBoundary = this.getWordBoundary(charNum);
        this.select(wordBoundary[0], wordBoundary[1]);

        evt.preventDefault();
        evt.stopPropagation();
    },

    onTripleClick: function(evt) {

        if (evt.originalEvent.detail !== 3) return;

        if (this.options.debug) {
            console.log('onTripleClick()');
        }

        this.hideCaret();
        this.selectAll();

        evt.preventDefault();
        evt.stopPropagation();
    },

    // @public
    // Find all the annotations in the `annotations` array that the
    // cursor at `selectionStart` position falls into.
    findAnnotationsUnderCursor: function(annotations, selectionStart) {

        return V.findAnnotationsAtIndex(annotations, selectionStart);
    },

    // @public
    // Find all the annotations that fall into the selection range specified by `selectionStart` and `selectionEnd`.
    // This method assumes the selection range is normalized.
    findAnnotationsInSelection: function(annotations, selectionStart, selectionEnd) {

        return V.findAnnotationsBetweenIndexes(annotations, selectionStart, selectionEnd);
    },

    // @private
    // This function infers the type of a text operation based solely on the selection indices
    // before and after the text input changed.
    inferTextOperationType: function(selectionBeforeInput, selectionAfterInput, diffLength) {

        if (selectionBeforeInput.start === selectionBeforeInput.end && selectionAfterInput.start === selectionAfterInput.end && diffLength > 0) {

            return 'insert';

        } else if (selectionBeforeInput.start === selectionBeforeInput.end && selectionAfterInput.start === selectionAfterInput.end && diffLength <= 0) {

            return 'delete-single';

        } else if (selectionBeforeInput.start !== selectionBeforeInput.end && selectionAfterInput.start === selectionAfterInput.end && selectionAfterInput.start === selectionBeforeInput.start) {

            return 'delete';

        } else if (selectionBeforeInput.start !== selectionBeforeInput.end && selectionAfterInput.start !== selectionBeforeInput.start) {

            // Delete followed by insert. The user might have selected a range and then started typing or pasting.
            return 'delete-insert';
        }

        return undefined;
    },

    // @private
    // Modify `annotations` (indices of all the affected annotations)
    // based on the user action defined by `selectionBeforeInput`, `selectionAfterInput` and `diffLength`.
    // For example, when the user inserts a new character, we want the new character to inherit
    // styling attributes (annotation) from the previous character (extend the affected annotation end index) and shift
    // all the following annotations by one to the right.
    // Note that this function modifies the original `annotations` array and returns it.
    annotate: function(annotations, selectionBeforeInput, selectionAfterInput, diffLength) {

        var newAnnotations = [];

        var opType = this.inferTextOperationType(selectionBeforeInput, selectionAfterInput, diffLength);

        _.each(annotations, function(annotation) {

            switch (opType) {

                case 'insert':
                    if (annotation.start < selectionBeforeInput.start && selectionBeforeInput.start <= annotation.end) {
                        annotation.end += diffLength;
                    } else if (annotation.start >= selectionBeforeInput.start) {
                        // We're writting before the annotated portion, move the
                        // all the following annotations to the right.
                        annotation.start += diffLength;
                        annotation.end += diffLength;
                    }
                    break;

                case 'delete-single':
                    // TODO: backspace and delete are two different operations.
                    // It depends on the selectionAfterInput which one was used.
                    if (annotation.start < selectionBeforeInput.start && selectionBeforeInput.start <= annotation.end && selectionBeforeInput.start !== selectionAfterInput.start) {
                        // Backspace.
                        annotation.end += diffLength;
                    } else if (annotation.start <= selectionBeforeInput.start && selectionBeforeInput.start < annotation.end && selectionBeforeInput.start === selectionAfterInput.start) {
                        // Delete.
                        annotation.end += diffLength;
                    } else if (annotation.start >= selectionBeforeInput.start) {
                        // We're deleting before the annotated portion, move
                        // all the following annotations by diff length.
                        annotation.start += diffLength;
                        annotation.end += diffLength;
                    }
                    break;

                case 'delete':
                    if (annotation.start <= selectionBeforeInput.start && selectionBeforeInput.start <= annotation.end) {
                        if (selectionBeforeInput.end <= annotation.end) {
                            annotation.end += diffLength;
                        } else {
                            annotation.end += selectionAfterInput.start - annotation.end;
                        }
                    } else if (annotation.start >= selectionBeforeInput.start && annotation.start < selectionBeforeInput.end) {

                        // Part of the annotation is deleted.
                        var inAnnotation = annotation.end - annotation.start;
                        var removedInAnnotation = selectionBeforeInput.end - annotation.start;
                        annotation.start = selectionBeforeInput.start;
                        annotation.end = annotation.start + inAnnotation - removedInAnnotation;

                    } else if (annotation.start >= selectionBeforeInput.end) {
                        // Shift all the following annotations by the diff length.
                        annotation.start += diffLength;
                        annotation.end += diffLength;
                    }
                    break;


                case 'delete-insert':
                    // Delete followed by insert. The user might have selected a range and then started typing or pasting.

                    if (annotation.start <= selectionBeforeInput.start && selectionBeforeInput.start <= annotation.end) {
                        // If we're deleting something AFTER the annotation, we do now
                        // want the inserting characters to inherit the annotated properties.
                        // aBC[d]e -> aBCe   (not aBCE)
                        if (selectionBeforeInput.start < annotation.end) {

                            if (selectionBeforeInput.end > annotation.end) {
                                annotation.end = selectionAfterInput.end;
                            } else {
                                annotation.end = selectionAfterInput.end + (annotation.end - selectionBeforeInput.end);
                            }
                        }
                    } else if (annotation.start >= selectionBeforeInput.start && annotation.start <= selectionBeforeInput.end) {

                        // Part of the annotation is affected.
                        var addedChars = selectionAfterInput.start - selectionBeforeInput.start;
                        var removedInAnnotation = selectionBeforeInput.end - annotation.start;
                        var inAnnotation = annotation.end - annotation.start;
                        annotation.start = selectionBeforeInput.start + addedChars;
                        annotation.end = annotation.start + inAnnotation - removedInAnnotation;

                    } else if (annotation.start >= selectionBeforeInput.start && annotation.end <= selectionBeforeInput.end) {

                        // This annotation will be removed.
                        annotation.start = annotation.end = 0;

                    } else if (annotation.start >= selectionBeforeInput.end) {
                        // Shift all the following annotations by the diff length.
                        annotation.start += diffLength;
                        annotation.end += diffLength;
                    }
                    break;

                default:
                    // Unknown operation. Should never happen!
                    if (this.options.debug) {
                        console.log('ui.TextEditor: Unknown text operation.');
                    }
                    break;
            }

            if (annotation.end > annotation.start) {
                newAnnotations.push(annotation);
            }

        }, this);

        return newAnnotations;
    },

    shiftAnnotations: function(annotations, selectionStart, offset) {

        return V.shiftAnnotations(annotations, selectionStart, offset);
    },

    // @public
    // This method stores annotation attributes that will be used for the very next insert operation.
    // This is useful, for example, when we have a toolbar and the user changes text to e.g. bold.
    // At this point, we can just call `setCurrentAnnotation({ 'font-weight': 'bold' })` and let the
    // text editor know that once the user starts typing, the text should be bold.
    // Note that the current annotation will be removed right after the first text operation to come.
    // This is becase after that, the next inserted character will already inherit properties
    // from the previous character which is our 'bold' text.
    setCurrentAnnotation: function(attrs) {

        this._currentAnnotationAttributes = attrs;
    },

    // @public
    // Set annotations of the text inside the text editor.
    // These annotations will be modified during the course of using the text editor.
    setAnnotations: function(annotations) {

        this._annotations = annotations;
    },

    // @public
    getAnnotations: function() {

        return this._annotations;
    },

    // @public
    // Get the combined (merged) attributes for a character at the position `selectionStart`
    // taking into account all the `annotations` that apply.
    getCombinedAnnotationAttrsAtIndex: function(selectionStart, annotations) {

        var attrs = {};
        _.each(annotations, function(annotation) {
            if (_.isUndefined(annotation.start && _.isUndefined(annotation.end))) {
                // The annotation does not have `start` and `end`. Assume it spans
                // the whole text. This allows us to pass default annotations
                // for text that is not spanned by any regular annotation.
                V.mergeAttrs(attrs, annotation.attrs);
            } else if (selectionStart >= annotation.start && selectionStart < annotation.end) {
                V.mergeAttrs(attrs, annotation.attrs);
            }
        });
        return attrs;
    },

    // @public
    // Find a common annotation among all the `annotations` that fall into the
    // `range` (an object with `start` and `end` properties - *normalized*).
    // For characters that don't fall into any of the `annotations`, assume
    // `defaultAnnotation` (default annotation does not need `start` and `end` properties).
    // The common annotation denotes the attributes that all the characters in the `range` share.
    // If any of the attributes for any character inside `range` differ, `undefined` is returned.
    // This is useful e.g. when your toolbar needs to reflect the text attributes of a selection.
    getSelectionAttrs: function(range, annotations) {

        var start = range.start;
        var end = range.end;

        if (start === end && start === 0) {
            // If the cursor is right at the beginning of the text (and there is *some* text), take
            // attributes from the first character.
            return this.getCombinedAnnotationAttrsAtIndex(start, annotations);

        } else if (start === end) {
            // Nothing is selected. We take attributes of the character before the current caret position.
            return this.getCombinedAnnotationAttrsAtIndex(start - 1, annotations);

        } else {

            var commonAttrs;
            for (var i = start; i < end; i++) {
                var attrs = this.getCombinedAnnotationAttrsAtIndex(i, annotations);
                if (commonAttrs && !_.isEqual(commonAttrs, attrs)) {
                    // Attributes differ. Remove those that differ from commonAttrs.
                    commonAttrs = joint.util.flattenObject(V.mergeAttrs({}, commonAttrs));
                    attrs = joint.util.flattenObject(V.mergeAttrs({}, attrs));
                    var result = {};
                    _.each(attrs, function(value, key) {
                        if (commonAttrs[key] === attrs[key]) {
                            joint.util.setByPath(result, key, value);
                        }
                    });
                    commonAttrs = result;
                } else {
                    commonAttrs = attrs;
                }
            }
            return commonAttrs;
        }
    },

    // @public
    // Return the text content (including new line characters) inside the `<text>` SVG element.
    // We assume that each <tspan> represents a new line in the order in which
    // they were added to the DOM.
    getTextContent: function() {

        // Add a newline character for every <tspan> that is a line. Such
        // tspans must be marked with the `line` class.
        var elText = this.options.text;
        var tspans = V(elText).find('.v-line');
        return tspans.length === 0 ? elText.textContent : _.reduce(tspans, function(memo, tspan, i, tspans) {
            var line = tspan.node.textContent;
            // Empty lines are assumed to be marked with the `empty-line` class.
            if (tspan.hasClass('v-empty-line')) line = '';
            // Last line does not need a new line (\n) character at the end.
            return (i === tspans.length - 1) ? memo + line : memo + line + '\n';
        }, '');
    },

    startSelecting: function() {

        this.selecting = true;
    },

    stopSelecting: function() {

        this.selecting = false;
    },

    selectionInProgress: function() {

        return this.selecting === true;
    },

    // @public
    // Select the whole text.
    selectAll: function() {

        return this.select(0, this.getNumberOfChars());
    },

    // @public
    // Select a portion of the text starting at `startCharNum`
    // character position ending at `selectionEnd` character position.
    // This method automatically swaps `startCharNum` and `endCharNum`
    // if they are in the wrong order.
    select: function(startCharNum, endCharNum) {

        if (this.options.debug) {
            console.log('select(', startCharNum, endCharNum, ')');
        }

        if (_.isUndefined(endCharNum)) {
            endCharNum = startCharNum;
        }

        if (_.isNumber(startCharNum)) {
            this.selection.start = startCharNum;
        }

        if (_.isNumber(endCharNum)) {
            this.selection.end = endCharNum;
        }

        if (!_.isNumber(this.selection.end)) {
            this.selection.end = this.selection.start;
        }

        if (_.isNumber(this.selection.start) && _.isNumber(this.selection.end)) {

            if (this.selection.start === this.selection.end) {
                this.clearSelection();
                this.focus();
                this.setCaret(this.selection.start);
            } else {
                this.hideCaret();
                this.renderSelection(this.selection.start, this.selection.end);
            }

            this.trigger('select:change', this.selection.start, this.selection.end);
        }

        return this;
    },

    setTextAreaSelection: function(start, end) {

        var selection = {
            start: start,
            end: end
        };

        selection = this.normalizeSelectionRange(selection);

        this.textarea.focus();
        this.textarea.selectionStart = selection.start;
        this.textarea.selectionEnd = selection.end;
    },

    renderSelection: function(start, end) {

        if (this.options.debug) {
            console.log('renderSelection()');
        }

        var selection = {
            start: start,
            end: end
        };

        selection = this.normalizeSelectionRange(selection);

        this.clearSelection();

        if (this.options.useNativeSelection) {

            // Use native selection.

            // Allow selection of elements in the paper.
            if (this.$viewport) {

                // Save this so that it can be reverted later.
                this._viewportUserSelectBefore = this.$viewport.css('user-select');

                this.$viewport.css({
                    '-webkit-user-select': 'all',
                    '-moz-user-select': 'all',
                    'user-select': 'all'
                });
            }

            var length = (selection.end - selection.start);

            this.selectTextInElement(this.options.text, selection.start, length);

        } else {

            // Fallback to the old method of rendering the selection box using a <div> for each character.

            this.renderSelectionBoxes(selection.start, selection.end);
        }
    },

    normalizeSelectionStartAndLength: function(text, start, length) {

        var textBefore = text.substr(0, start);
        var textSelected = text.substr(start, length);

        // Linebreaks aren't counted by the selectSubString() method.
        var numLineBreaksBefore = this.countLineBreaks(textBefore);
        var numLineBreaksInSelection = this.countLineBreaks(textSelected);

        start -= numLineBreaksBefore;
        length -= numLineBreaksInSelection;

        // "Empty lines" contain a hidden hyphen symbol, which are counted.
        var numEmptyLinesBefore = this.countEmptyLines(textBefore);
        var numEmptyLinesInSelection = this.countEmptyLines(textSelected);

        start += numEmptyLinesBefore;
        length += numEmptyLinesBefore;
        length -= numEmptyLinesBefore;
        length += numEmptyLinesInSelection;

        return {
            start: start,
            length: length
        };
    },

    selectTextInElement: function(element, start, length) {

        if (_.isFunction(element.selectSubString)) {

            // Try using selectSubString().
            this.selectTextInElementUsingSelectSubString(element, start, length);
        }

        // Is the expected selected content is different from the actual selected content?
        if (!this.actualSelectionMatchesExpectedSelection(start, length)) {

            // Fallback to using ranges.

            try {

                this.selectTextInElementUsingRanges(element, start, length);

            } catch (error) {

                if (this.options.debug) {
                    console.log(error);
                }

                if (_.isFunction(element.selectSubString)) {
                    // Try again using selectSubString().
                    this.selectTextInElementUsingSelectSubString(element, start, length);
                }
            }
        }
    },

    selectTextInElementUsingSelectSubString: function(element, start, length) {

        // Note:
        // When using this method, Firefox doesn't do well when the selection spans multiple <tspan> elements.
        // In that case only the first <tspan> is selected.

        var normalized = this.normalizeSelectionStartAndLength(this.getTextContent(), start, length);

        try {

            element.selectSubString(normalized.start, normalized.length);

        } catch (error) {

            if (this.options.debug) {
                console.log(error);
            }
        }
    },

    selectTextInElementUsingRanges: function(element, start, length) {

        // Some browsers (Chrome) don't allow "discontiguous" ranges.
        // A "discontiguous" range is a range that includes multiple elements.
        // This isn't a problem for Firefox.

        var selection = window.getSelection();

        selection.removeAllRanges();

        var normalized = this.normalizeSelectionStartAndLength(this.getTextContent(), start, length);

        start = 0 + normalized.start;
        length = 0 + normalized.length;

        var textNodes = this.getTextNodesFromDomElement(element);
        var textNode;
        var range;
        var textNodeStart;
        var textNodeEnd;
        var setStart;
        var setEnd;
        var offset = 0;
        var end = start + length;

        while (length > 0 && textNodes.length > 0) {

            textNode = textNodes.shift();
            textNodeStart = offset;
            textNodeEnd = offset + textNode.length;

            if (
                (textNodeStart >= start && textNodeStart < end) ||
                (textNodeEnd > start && textNodeEnd <= end) ||
                (start >= textNodeStart && start < textNodeEnd) ||
                (end > textNodeStart && end <= textNodeEnd)
            ) {

                setStart = Math.max(start - textNodeStart, 0);
                setEnd = Math.min(setStart + Math.min(length, textNode.length), textNodeEnd);
                range = document.createRange();
                range.setStart(textNode, setStart);
                range.setEnd(textNode, setEnd);
                selection.addRange(range);
                length -= (setEnd - setStart);
            }

            offset += textNode.length;
        }
    },

    actualSelectionMatchesExpectedSelection: function(start, length) {

        var selection = window.getSelection();
        var actualSelectedContent = selection.toString();
        var expectedSelectedContent = this.getExpectedSelectedContent(start, length);

        // Replace tab characters with space characters.
        actualSelectedContent = actualSelectedContent.replace(/\s/g, ' ');

        return expectedSelectedContent === actualSelectedContent;
    },

    getExpectedSelectedContent: function(start, length) {

        var textContent = this.getTextContent();
        var expectedSelectedContent = textContent.substr(start, length);

        // Replace empty lines with a hyphen character.
        expectedSelectedContent = expectedSelectedContent.replace(/(\n\r|\r|\n){2,}/g, '-');

        // Remove single line break characters.
        expectedSelectedContent = expectedSelectedContent.replace(/\n\r|\r|\n/g, '');

        // Replace tab characters with space characters.
        expectedSelectedContent = expectedSelectedContent.replace(/\s/g, ' ');

        return expectedSelectedContent;
    },

    getTextNodesFromDomElement: function(element) {

        var textNodes = [];

        _.each(element.childNodes, function(childNode) {

            if (!_.isUndefined(childNode.tagName)) {

                // Not a text node.

                textNodes = textNodes.concat(this.getTextNodesFromDomElement(childNode));

            } else {

                textNodes.push(childNode);
            }

        }, this);

        return textNodes;
    },

    renderSelectionBoxes: function(start, end) {

        if (this.options.debug) {
            console.log('renderSelectionBoxes()');
        }

        this.$selection.empty();

        var fontSize = this.getFontSize();
        var t = this.getTextTransforms();
        var angle = t.rotation;

        // Cache of a previous selection box element.
        var $prevBox;
        // Cache for a bounding box of a previous character.
        var prevBbox;

        var bbox;
        for (var i = start; i < end; i++) {

            var $box = this.$selectionBox.clone();

            // `getCharBBox()` can throw an exception in situations where
            // the character position is outside the range where
            // the `getStartPositionOfChar()` and `getEndPositionOfChar()`
            // methods can operate. An example of this is a text along a path
            // that is shorter than that of the text. In this case,
            // we fail silently. This is safe because the result of this
            // is selection boxes not being rendered for characters
            // outside of the visible text area - which is actually desired.
            try {
                bbox = this.getCharBBox(i);
            } catch (e) {
                this.trigger('select:out-of-range', start, end);
                break;
            }

            // A small optimization for the number of char-selection-box div elements.
            // If one box is right after the other, there is no need to render them both.
            // Instead, simply adjust the width of the previous one.
            if (prevBbox && angle === 0 && Math.round(bbox.y) === Math.round(prevBbox.y) &&
                Math.round(bbox.height) === Math.round(prevBbox.height) &&
                Math.round(bbox.x) === Math.round(prevBbox.x + prevBbox.width)) {

                $prevBox.css({ width: '+=' + bbox.width });

            } else {

                // Using font size instead of bbox.height makes the bounding box
                // of the character more precise. Unfortunately, getting an accurate
                // bounding box of a character in SVG is not easy.
                $box.css({
                    left: bbox.x,
                    top: bbox.y - bbox.height,
                    width: bbox.width,
                    height: bbox.height,
                    '-webkit-transform': 'rotate(' + angle + 'deg)',
                    '-webkit-transform-origin': '0% 100%',
                    '-moz-transform': 'rotate(' + angle + 'deg)',
                    '-moz-transform-origin': '0% 100%'
                });
                this.$selection.append($box);
                $prevBox = $box;
            }
            prevBbox = bbox;
        }

        if (bbox) {

            this.$textareaContainer.css({
                left: bbox.x,
                top: bbox.y - fontSize * t.scaleY
            });
        }
    },

    clearSelection: function() {

        if (this.options.debug) {
            console.log('clearSelection()');
        }

        this.$selection.empty();

        if (this.options.text.selectSubString) {

            if (this.$viewport && this._viewportUserSelectBefore) {
                this.$viewport.css({
                    '-webkit-user-select': this._viewportUserSelectBefore,
                    '-moz-user-select': this._viewportUserSelectBefore,
                    'user-select': this._viewportUserSelectBefore
                });
            }

            window.getSelection().removeAllRanges();
        }

        return this;
    },

    // @public
    // Cancel selection of the text.
    deselect: function() {

        if (this.options.debug) {
            console.log('deselect()');
        }

        this.stopSelecting();
        this.clearSelection();
        this.setTextAreaSelection(this.selection.start, this.selection.end);

        return this;
    },

    // @public
    // Return the start character position of the current selection.
    getSelectionStart: function() {

        return this.selection.start;
    },

    // @public
    // Return the end character position of the current selection.
    getSelectionEnd: function() {

        return this.selection.end;
    },

    // @public
    // Return an object with `start` and `end` properties describing
    // the *normalized* selection range.
    getSelectionRange: function() {

        return this.normalizeSelectionRange(this.selection);
    },

    normalizeSelectionRange: function(selection) {

        var selection = _.clone(selection);

        // Normalize.
        if (selection.start > selection.end) {
            selection.end = [selection.start, selection.start = selection.end][0];
        }

        return selection;
    },

    // @public
    // Return the length of the selection.
    getSelectionLength: function() {

        var range = this.getSelectionRange();
        return range.end - range.start;
    },

    // @public
    // Return the selected text.
    getSelection: function() {

        var range = this.getSelectionRange();
        return this.getTextContent().slice(range.start, range.end);
    },

    // @public
    // Return the start and end character positions for a word
    // under `charNum` character position.
    getWordBoundary: function(charNum) {

        var text = this.textarea.value;
        var re = /\W/;

        var start = charNum;
        while (start) {
            if (re.test(text[start])) {
                start += 1;
                break;
            }
            start -= 1;
        }

        var numberOfChars = this.getNumberOfChars();
        var end = charNum;
        while (end <= numberOfChars) {
            if (re.test(text[end])) {
                break;
            }
            end += 1;
        }

        // Normalize before returning.
        return (start < end) ? [start, end] : [end, start];
    },

    getURLBoundary: function(charNum) {

        var text = this.textarea.value;

        var whitespaceRegEx = /\s/;
        var weburlRegEx = /[-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?/;
        var start = charNum;
        while (start) {
            if (whitespaceRegEx.test(text[start])) {
                start += 1;
                break;
            }
            start -= 1;
        }

        var numberOfChars = this.getNumberOfChars();
        var end = charNum;
        while (end <= numberOfChars) {
            if (whitespaceRegEx.test(text[end])) {
                break;
            }
            end += 1;
        }

        if (weburlRegEx.test(text.substring(start, end))) {
            return [start, end];
        }
        return undefined;
    },

    annotateURL: function(annotations, selectionStart, selectionEnd) {

        // Include the actual URL with the annotation object. This is very useful to
        // have for cases where the text does not reflect the URL but rather only the title of the URL.
        // In this case, we still want to know what was the original URL.
        var url = this.textarea.value.substring(selectionStart, selectionEnd);
        var urlAnnotation = _.extend({ url: url }, this.options.urlAnnotation);

        urlAnnotation.start = selectionStart;
        urlAnnotation.end = selectionEnd;
        // Do not add the annotation if there was the exact same
        // one at the end already.
        if (!_.isEqual(urlAnnotation, _.last(annotations))) {
            annotations.push(urlAnnotation);
        }

        return annotations;
    },

    // Get the bounding box (in screen coordinates) of the character
    // under `charNum` position (the real one, not the SVG one).
    getCharBBox: function(charNum) {

        // For a newline character (line ending), return a bounding box
        // that is derived from the previous - non newline - character
        // and move it to the right of that character.
        if (this.isLineEnding(charNum)) {
            var bbox = this.getCharBBox(charNum - 1);
            //bbox.x = bbox.x + bbox.width + -7;
            bbox.x = bbox.x2;
            bbox.y = bbox.y2;
            bbox.width = this.options.newlineCharacterBBoxWidth || 10;
            return bbox;
        }

        var svgCharNum = this.realToSvgCharNum(charNum);
        var elText = this.options.text;
        var startPosition = elText.getStartPositionOfChar(svgCharNum);
        var endPosition = elText.getEndPositionOfChar(svgCharNum);
        var extent = elText.getExtentOfChar(svgCharNum);

        startPosition = this.localToScreenCoordinates(startPosition);
        endPosition = this.localToScreenCoordinates(endPosition);

        var t = this.getTextTransforms();
        var x = startPosition.x;
        var y = startPosition.y;
        var w = extent.width * t.scaleX;
        var h = extent.height * t.scaleY;

        return { x: x, y: y, width: w, height: h, x2: endPosition.x, y2: endPosition.y };
    },

    realToSvgCharNum: function(charNum) {
        // Calculate the position of the character in the SVG `<text>` element.
        // The reason why those two don't match (`charNum` and `svgCharNum`) is
        // because in the SVG `<text>` element, there are no newline characters.
        var lineEndings = 0;
        for (var i = 0; i <= charNum; i++) {
            if (this.isLineEnding(i)) {
                lineEndings += 1;
            }
        }

        return charNum - lineEndings;
    },

    selectionStartToSvgCharNum: function(selectionStart) {

        return selectionStart - this.nonEmptyLinesBefore(selectionStart);
    },

    // Return `true` if the character at the position `charNum` is
    // a newline character but does not denote an empty line.
    // In other words, the newline character under `charNum` is
    // ending a non-empty line.
    isLineEnding: function(charNum) {

        var text = this.textarea.value;

        return text[charNum] === '\n' && charNum > 0 && text[charNum - 1] !== '\n';
    },

    svgToRealCharNum: function(svgCharNum) {

        var text = this.textarea.value;
        var newLinesBefore = 0;
        for (var i = 0; i <= svgCharNum + newLinesBefore; i++) {
            if (this.isLineEnding(i)) {
                newLinesBefore += 1;
            }
        }
        return svgCharNum + newLinesBefore;
    },

    localToScreenCoordinates: function(p) {

        // [IE fix] The text element must be visible, otherwise getCTM() doesn't work.
        // See:
        // http://stackoverflow.com/questions/10714779/svgs-node-getscreenctm-method-failing-in-ie-9/10731378#10731378
        $(this.options.text).show();

        return V.transformPoint(p, this.options.text.getCTM());
    },

    // @public
    // Return the number of characters in the text.
    getNumberOfChars: function() {

        return this.getTextContent().length;
    },

    // @public
    // Return the character position (the real one) the user clicked on.
    // If there is no such a position found, return the last one.
    getCharNumFromEvent: function(evt) {

        var elText = this.options.text;
        var clientX = evt.clientX;
        var clientY = evt.clientY;
        var localClientPoint = V(elText).toLocalPoint(clientX, clientY);
        var svgCharNum = elText.getCharNumAtPosition(localClientPoint);

        // The user clicked somewhere outside, always return the last char num.
        if (svgCharNum < 0) {

            return this.getNumberOfChars();
        }

        var clientScreen = this.localToScreenCoordinates(localClientPoint);

        // If the user clicked on the "left" side of the character,
        // return the character position of the clicked character, otherwise
        // return the character position of the character after the clicked one.
        var bbox = this.getCharBBox(this.svgToRealCharNum(svgCharNum));
        if (Math.abs(bbox.x - clientScreen.x) < Math.abs(bbox.x + bbox.width - clientScreen.x)) {

            return this.svgToRealCharNum(svgCharNum);
        }

        return this.svgToRealCharNum(svgCharNum) + 1;
    },

    lineNumber: function(selectionStart) {

        var text = this.textarea.value.substr(0, selectionStart);

        return this.countLineBreaks(text);
    },

    emptyLinesBefore: function(selectionStart) {

        var lines = this.textarea.value.split(/\n\r|\r|\n/g);
        var lineNumber = this.lineNumber(selectionStart);
        var n = 0;
        for (var i = lineNumber - 1; i >= 0; i--) {
            if (!lines[i]) {
                n += 1;
            }
        }
        return n;
    },

    countLineBreaks: function(text) {

        return (text.match(/\n\r|\r|\n/g) || []).length;
    },

    countEmptyLines: function(text) {

        return (text.match(/(\n\r|\r|\n){2,}/g) || []).length;
    },

    nonEmptyLinesBefore: function(selectionStart) {

        return this.lineNumber(selectionStart) - this.emptyLinesBefore(selectionStart);
    },

    isEmptyLine: function(lineNumber) {

        var lines = this.textarea.value.split(/\n\r|\r|\n/g);
        return !lines[lineNumber];
    },

    isEmptyLineUnderSelection: function(selectionStart) {

        var lineNumber = this.lineNumber(selectionStart);
        return this.isEmptyLine(lineNumber);
    },

    getTextTransforms: function() {

        var screenCTM = this.options.text.getCTM();
        return V.decomposeMatrix(screenCTM);
    },

    getFontSize: function() {

        return parseInt(V(this.options.text).attr('font-size'), 10);
    },

    getTextAnchor: function() {

        return V(this.options.text).attr('text-anchor') || '';
    },

    // @public
    // Set the caret position based on the selectionStart of the textarea unless
    // `charNum` is provided in which case the caret will be set just before the
    // character at `charNum` position (starting from 0).
    setCaret: function(charNum, opt) {

        if (_.isObject(charNum)) {
            opt = charNum;
            charNum = undefined;
        }

        opt = opt || {};

        var elText = this.options.text;
        var numberOfChars = this.getNumberOfChars();
        var selectionStart = this.selection.start;
        var text = this.textarea.value;

        if (typeof charNum !== 'undefined') {

            // Keep the character number within the valid range of characters.
            charNum = Math.min(Math.max(charNum, 0), numberOfChars);

            selectionStart = this.selection.start = this.selection.end = charNum;
        }

        if (!opt.silent) {
            this.trigger('caret:change', selectionStart);
        }

        this.setTextAreaSelection(selectionStart, selectionStart);

        if (this.options.debug) {
            console.log('setCaret(', charNum, opt, ')', 'selectionStart', selectionStart, 'isLineEnding', this.isLineEnding(selectionStart), 'isEmptyLineUnderSelection', this.isEmptyLineUnderSelection(selectionStart), 'svgCharNum', this.selectionStartToSvgCharNum(selectionStart), 'nonEmptyLinesBefore', this.nonEmptyLinesBefore(selectionStart));
        }

        var caretPosition;

        // `getStartPositionOfChar()` or `getEndPositionOfChar()` can throw an exception
        // in situations where the character position is outside the range of
        // the visible text area. In this case, we just hide the caret altogether -
        // which is desired because the user is editing a text that is not visible.
        // An example of this is a text along a path that is shorter than that of the text.
        try {

            var charIndex;

            // - If we're on an empty line, always take the start position of the
            //   SVG space character on that line.
            // - If we're at the end of the line, take the end position of the SVG character before.
            // - If we're at the end of the text, also take the end position of the character before.
            // - For all other cases, take the start position of the SVG character before the selection.
            if (!this.isEmptyLineUnderSelection(selectionStart) && (this.isLineEnding(selectionStart) || text.length === selectionStart)) {

                charIndex = this.selectionStartToSvgCharNum(selectionStart) - 1;

                caretPosition = elText.getEndPositionOfChar(charIndex);

            } else {

                charIndex = this.selectionStartToSvgCharNum(selectionStart);

                caretPosition = elText.getStartPositionOfChar(charIndex);
            }

        } catch (e) {

            this.trigger('caret:out-of-range', selectionStart);

            caretPosition = {
                x: 0,
                y: 0
            };
        }

        // Convert the caret local position (in the coordinate system of the SVG `<text>`)
        // into screen coordinates.
        var caretScreenPosition = this.localToScreenCoordinates(caretPosition);

        // Set the position of the caret. If the number of characters is zero, the caretPosition
        // is `{ x: 0, y: 0 }`, therefore it is not the the bottom right corner of the character but
        // the top left. Therefore, we do not want to shift the caret up using the `margin-top` property.
        var t = this.getTextTransforms();
        var angle = t.rotation;
        // TODO: fontSize should be based on the actual font size of the character
        // under the cursor, not the text global font size. This will improve
        // UX for rich text.
        var fontSize = this.getFontSize() * t.scaleY;

        if (this.options.placeholder) {
            this.$caret.toggleClass('placeholder', numberOfChars === 0);
        }

        this.$caret.css({
            left: caretScreenPosition.x,
            top: caretScreenPosition.y + (numberOfChars ? -fontSize : 0),
            height: fontSize,
            'line-height': fontSize + 'px',
            'font-size': fontSize + 'px',
            '-webkit-transform': 'rotate(' + angle + 'deg)',
            '-webkit-transform-origin': '0% 100%',
            '-moz-transform': 'rotate(' + angle + 'deg)',
            '-moz-transform-origin': '0% 100%'
        }).attr({
            'text-anchor': this.getTextAnchor()
        }).show();

        this.$textareaContainer.css({
            left: caretScreenPosition.x,
            top: caretScreenPosition.y + (numberOfChars ? -fontSize  : 0)
        });

        // Always focus. If the caret was set as a reaction on
        // mouse click, the textarea looses focus in FF.
        this.focus();

        return this;
    },

    focus: function() {

        if (this.options.debug) {
            console.log('focus()');
        }

        this.showCaret();

        return this;
    },

    blur: function() {

        if (this.options.debug) {
            console.log('blur()');
        }

        this.hideCaret();

        return this;
    },

    showCaret: function() {

        if (this.options.debug) {
            console.log('showCaret()');
        }

        this.$caret.show();

        return this;
    },

    // @public
    // Hide the caret (cursor).
    hideCaret: function() {

        if (this.options.debug) {
            console.log('hideCaret()');
        }

        this.$caret.hide();

        return this;
    },

    unbindTextElement: function() {

        this.$elText.off('mousedown', this.onMousedown);
        this.$elText.off('dblclick', this.onDoubleClick);
        this.$elText.off('click', this.onTripleClick);
    },

    onRemove: function() {

        this.unbindTextElement();

        $(document.body).off('mousemove', this.onMousemove);
        $(document.body).off('mouseup', this.onMouseup);
        $(document.body).off('keydown', this.onKeydown);

        // TODO: Optional?
        V(this.options.text).attr('cursor', '');
    }

}, _.extend({

    // A tiny helper that checks if `el` is an SVG `<text>` or `<tspan>` element
    // and returns it if yes, otherwise it returns `undefined`.
    // Especially useful when working with events, e.g.:
    // $(document.body).on('click', function(evt) {
    //     var t = joint.ui.TextEditor.getTextElement(evt.target);
    //     if (t) { ... } else { ... }
    // })
    getTextElement: function(el) {

        var tagName = el.tagName.toUpperCase();

        if (tagName === 'TEXT' || tagName === 'TSPAN' || tagName === 'TEXTPATH') {

            if (tagName === 'TEXT') return el;
            return this.getTextElement(el.parentNode);
        }

        return undefined;
    },

    // @public
    // Start inline editing an SVG text element. Therefore, `el` should always
    // be either an SVG `<text>` element directly or any of its descendants
    // `<tspan>` or `<textpath>` in which case the text editor automatically
    // finds the nearest `<text>` element climbing up the DOM tree.
    // If it can't find any `<text>` element, an error is printed to the console
    // and `undefined` is returned. Otherwise, the instance of the `ui.TextEditor`
    // is returned.
    // Options:
    // `opt.placeholder` ... Placeholder that will be passed to the `ui.TextEditor` instance.
    // `opt.annotations` ... Annotations that will be set on the `ui.TextEditor` instance.
    // `opt.cellView` ... For simplicity, we add direct support for JointJS cells.
    // `opt.annotationsProperty` ... If `opt.cellView` is used, annotations will be looked up and set from/to the cellView model by this property name.
    // `opt.textProperty` ... If `opt.cellView` is used, text will be set to the cellView model to this property name.
    edit: function(el, opt) {

        opt = opt || {};

        // By default, the text editor automatically updates either the cellView text string
        // and annotations (if `opt.cellView` is used) or the SVG text element via Vectorizer.
        // This behaviour can be supressed by passing `update: false` in the options.
        // In that case, it is the responsibility of the programmer to update the text and annotations.
        var update = opt.update !== false;

        this.options = _.extend({}, opt, { update: update });

        var textElement = this.getTextElement(el);

        if (!textElement) {

            if (this.options.debug) {
                console.log('ui.TextEditor: cannot find a text element.');
            }

            return undefined;
        }

        // If there was another active text editor open, close it first.
        this.close();

        this.ed = new joint.ui.TextEditor(_.extend({ text: textElement }, opt));

        // Proxy all events triggered by the `ui.TextEditor` to all the listeners
        // on the `ui.TextEditor` class singleton.
        this.ed.on('all', this.trigger, this);

        // The target container to render the `ui.TextEditor` instance into.
        // If `opt.cellView` is used, the `paper.el` will be used, otherwise the parent node
        // of the SVG document which our `textElement` resides will be used.
        var target;

        // Add support for JointJS cells to make integration easier.
        if (opt.cellView) {

            target = opt.cellView.paper.el;

            this.cellViewUnderEdit = opt.cellView;
            // Prevent dragging during inline editing.
            this.cellViewUnderEditInteractiveOption = this.cellViewUnderEdit.options.interactive;
            this.cellViewUnderEdit.options.interactive = false;

            // Set annotations by the property name. Look them up from the cellView model.
            if (opt.annotationsProperty && !this.ed.getAnnotations()) {

                var annotations = this.cellViewUnderEdit.model.prop(opt.annotationsProperty);
                if (annotations) {
                    // Note that we have to deep clone the annotations so that
                    // all the backbone `changed` mechanism works. This is because
                    // the text editor modifies the `annotations` array in-place.
                    this.ed.setAnnotations(this.deepCloneAnnotations(annotations));
                }
            }

        } else {

            var svg = V(textElement).svg();
            target = svg.parentNode;
        }

        if (update) {

            this.ed.on('text:change', function(newText, oldText, annotations) {

                if (opt.cellView) {

                    // The index of a link label in the DOM. The problem with links is that
                    // when we update through prop() below, all the old labels are removed from DOM
                    // and replaced with new SVG text elements. This, however, causes the text editor
                    // to hold (and work with) the old SVG text element. To solve this, we remember
                    // the index of the label under edit and reset the text element on the text
                    // editor to point to the newly rendered label SVG text. (see below)
                    var originalLabelIndex = null;

                    // If `opt.cellView` is used, we automatically set the new text and
                    // annotations to the property defined in our options.
                    if (opt.textProperty) {

                        if (opt.cellView.model.isLink() && opt.textProperty.substr(0, 'labels'.length) === 'labels') {
                            originalLabelIndex = V($(V(textElement).node).closest('.label')[0]).index();
                        }

                        opt.cellView.model.prop(opt.textProperty, newText, { textEditor: this.ed.cid });

                    }
                    if (opt.annotationsProperty) {
                        // Note that we have to deep clone the annotations so that
                        // all the backbone `changed` mechanism works. This is because
                        // the text editor modifies the `annotations` array in-place.
                        opt.cellView.model.prop(opt.annotationsProperty, this.deepCloneAnnotations(annotations), { rewrite: true, textEditor: this.ed.cid });
                    }

                    if (originalLabelIndex !== null) {
                        // Now we replace the text element stored in the text editor with the
                        // newly rendered SVG text element.
                        var labelElements = V(opt.cellView.el).find('.label');
                        textElement = labelElements[originalLabelIndex].findOne('text');
                        this.ed.setTextElement(textElement.node);
                    }

                } else {

                    V(textElement).text(newText, annotations);
                }
            }, this);
        }

        this.ed.render(target);

        return this;
    },

    close: function() {

        if (this.ed) {

            if (this.ed.options.annotateUrls) {
                // If there is a URL detected before we leave the text-editing,
                // annotate it. The only exception is if there was already a URL annotation
                // at the cursor. In this case, we don't create another one.
                var selectionStart = this.ed.getSelectionStart();
                var annotationsUnderCursor = this.findAnnotationsUnderCursor();
                var containsURLAnnotation = _.find(annotationsUnderCursor, function(annotation) {
                    if (annotation.url) return annotation;
                    return false;
                });
                if (!containsURLAnnotation) {
                    var annotated = this.ed.annotateURLBeforeCaret(selectionStart);
                    if (annotated) {
                        this.applyAnnotations(this.getAnnotations());
                    }
                }
            }

            this.ed.remove();

            if (this.cellViewUnderEdit) {
                // Re-enable dragging after inline editing.
                this.cellViewUnderEdit.options.interactive = this.cellViewUnderEditInteractiveOption;
            }
            this.ed = this.cellViewUnderEdit = this.cellViewUnderEditInteractiveOption = undefined;
        }
    },

    applyAnnotations: function(annotations) {

        var opt = this.options;

        if (this.ed && opt.update) {

            if (opt.cellView && opt.annotationsProperty) {

                // Note that we have to deep clone the annotations so that
                // all the backbone `changed` mechanism works. This is because
                // the text editor modifies the `annotations` array in-place.
                opt.cellView.model.prop(opt.annotationsProperty, this.deepCloneAnnotations(annotations), { rewrite: true });
                this.ed.setAnnotations(annotations);

            } else {

                V(this.ed.options.text).text(this.ed.getTextContent(), annotations);
            }

            // Refresh the selection boxes or the caret position after
            // the annotations are applied.
            var range = this.getSelectionRange();
            var selectionLength = this.getSelectionLength();
            if (selectionLength > 0) {
                this.ed.select(range.start, range.end);
            } else {
                this.ed.setCaret();
            }
        }
    },

    // @private
    deepCloneAnnotations: function(annotations) {

        // JSON.parse/stringify is still the fastest
        // way of deep cloning objects. See http://jsperf.com/lodash-deepclone-vs-jquery-extend-deep/5.
        try {
            return JSON.parse(JSON.stringify(annotations));
        } catch (e) {
            return undefined;
        }
    },

    // Proxy useful methods to the active `ui.TextEditor` instance.

    proxy: function(method, args) {

        if (this.ed) {
            return this.ed[method].apply(this.ed, args);
        }
    },

    setCurrentAnnotation: function(attributes) {

        return this.proxy('setCurrentAnnotation', arguments);
    },

    getAnnotations: function() {

        return this.proxy('getAnnotations', arguments);
    },

    setCaret: function() {

        return this.proxy('setCaret', arguments);
    },

    deselect: function() {

        return this.proxy('deselect', arguments);
    },

    selectAll: function() {

        return this.proxy('selectAll', arguments);
    },

    select: function() {

        return this.proxy('select', arguments);
    },

    getNumberOfChars: function() {

        return this.proxy('getNumberOfChars', arguments);
    },

    getCharNumFromEvent: function() {

        return this.proxy('getCharNumFromEvent', arguments);
    },

    getWordBoundary: function() {

        return this.proxy('getWordBoundary', arguments);
    },

    // A proxy to our active `ui.TextEditor` instance.
    findAnnotationsUnderCursor: function() {

        return this.proxy('findAnnotationsUnderCursor', [this.ed.getAnnotations(), this.ed.getSelectionStart()]);
    },

    findAnnotationsInSelection: function() {

        if (!this.ed) return;

        // Get the *normalized* selection range.
        var range = this.ed.getSelectionRange();
        return this.proxy('findAnnotationsInSelection', [this.ed.getAnnotations(), range.start, range.end]);
    },

    getSelectionAttrs: function(annotations) {

        if (!this.ed) return;
        var range = this.ed.getSelectionRange();
        return this.proxy('getSelectionAttrs', [range, annotations]);
    },

    getSelectionLength: function() {

        return this.proxy('getSelectionLength', arguments);
    },

    getSelectionRange: function() {

        return this.proxy('getSelectionRange', arguments);
    }

}, Backbone.Events));
