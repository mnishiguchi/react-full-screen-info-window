/**
 * Adopted from:
 *   uiMorphingButton_fixed.js v1.0.0
 *   http://www.codrops.com
 */
;
(function(window) {

    /**
     * Merges a hash into another hash.
     */
    function extend(a, b) {
        for (var key in b) {
            if (b.hasOwnProperty(key)) {
                a[key] = b[key];
            }
        }
        return a;
    }

    // This is a class-like function.
    function UIMorphingButton(el, options) {
        this.el = el;
        this.options = extend({}, this.options);
        extend(this.options, options);
        this._init();
    }

    UIMorphingButton.prototype.options = {
        closeEl: '',
        onBeforeOpen: function() {
            return false;
        },
        onAfterOpen: function() {
            return false;
        },
        onBeforeClose: function() {
            return false;
        },
        onAfterClose: function() {
            return false;
        }
    }

    UIMorphingButton.prototype._init = function() {
        // the button
        this.button = this.el.querySelector('button');
        // state
        this.expanded = false;
        // content el
        this.contentEl = this.el.querySelector('.morph-content');
        // init events
        this._initEvents();
    }

    UIMorphingButton.prototype._initEvents = function() {
        var self = this;
        // open
        this.button.addEventListener('click', function() {
            self.toggle();
        });
        // close
        if (this.options.closeEl !== '') {
            var closeEl = this.el.querySelector(this.options.closeEl);
            if (closeEl) {
                closeEl.addEventListener('click', function() {
                    self.toggle();
                });
            }
        }
        document.onkeydown = function(evt) {
            evt = evt || window.event;
            if (self.options.closeEl !== '') {
                var closeEl = self.el.querySelector(self.options.closeEl);
                if (closeEl && self.expanded) {
                    self.toggle();
                }
            }
        };
    }

    UIMorphingButton.prototype.toggle = function() {
        if (this.isAnimating) return false;

        // callback
        if (this.expanded) {
            this.options.onBeforeClose();
        } else {
            // add class active (solves z-index problem when more than one button is in the page)
            classie.addClass(this.el, 'active');
            this.options.onBeforeOpen();
        }

        this.isAnimating = true;

        var self = this,
            onEndTransitionFn = function(ev) {
                if (ev.target !== this) return false;

                // open: first opacity then width/height/left/top
                // close: first width/height/left/top then opacity
                if (self.expanded && ev.propertyName !== 'opacity' || !self.expanded && ev.propertyName !== 'width' && ev.propertyName !== 'height' && ev.propertyName !== 'left' && ev.propertyName !== 'top') {
                    return false;
                }
                this.removeEventListener('transitionend', onEndTransitionFn);

                self.isAnimating = false;

                // callback
                if (self.expanded) {
                    // remove class active (after closing)
                    classie.removeClass(self.el, 'active');
                    self.options.onAfterClose();
                } else {
                    self.options.onAfterOpen();
                }

                self.expanded = !self.expanded;
            };


        this.contentEl.addEventListener('transitionend', onEndTransitionFn);

        // set the left and top values of the contentEl (same like the button)
        var buttonPos = this.button.getBoundingClientRect();
        // need to reset
        classie.addClass(this.contentEl, 'no-transition');
        this.contentEl.style.left = 'auto';
        this.contentEl.style.top = 'auto';

        // add/remove class "open" to the button wraper
        setTimeout(function() {
            self.contentEl.style.left = buttonPos.left + 'px';
            self.contentEl.style.top = buttonPos.top + 'px';

            if (self.expanded) {
                classie.removeClass(self.contentEl, 'no-transition');
                classie.removeClass(self.el, 'open');
            } else {
                setTimeout(function() {
                    classie.removeClass(self.contentEl, 'no-transition');
                    classie.addClass(self.el, 'open');
                }, 25);
            }
        }, 25);
    }

    // add to global namespace
    window.UIMorphingButton = UIMorphingButton;

})(window);
