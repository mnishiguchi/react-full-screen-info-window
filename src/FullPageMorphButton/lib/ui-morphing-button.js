// Ideas adopted from: https://github.com/codrops/ButtonComponentMorph/

import classie from 'classie'

const defaultOptions = {
    closeSelector: '',
    onBeforeOpen : () => { return false },
    onAfterOpen  : () => { return false },
    onBeforeClose: () => { return false },
    onAfterClose : () => { return false }
}

class UIMorphingButton {
  constructor(el, options) {
    this.el        = el
    this.options   = {...defaultOptions, ...options}
    this.expanded  = false

    this.button    = this.el.querySelector('button')
    this.contentEl = this.el.querySelector('.morph-content')

    this._initEvents()
  }


  // ---
  // PRIVATE METHODS
  // ---


  _initEvents() {

      // open
      this.button.addEventListener('click', () => {
          this.toggle()
      })

      // close
      if (this.options.closeSelector !== '') {
          const closeEl = this.el.querySelector(this.options.closeSelector)
          if (closeEl) {
              closeEl.addEventListener('click', () => {
                  this.toggle()
              })
          }
      }

      document.onkeydown = function(evt) {
          evt = evt || window.event
          if (this.options.closeSelector !== '') {
              const closeEl = this.el.querySelector(this.options.closeSelector)

              if (closeEl && this.expanded) {
                  this.toggle()
              }
          }
      }
  }


  // ---
  // PUBLIC METHODS
  // ---


  // TODO: Understand this code
  toggle() {
      if (this.isAnimating) return false

      // callback
      if (this.expanded) {
          this.options.onBeforeClose()
      } else {
          // add class active (solves z-index problem when more than one button is in the page)
          classie.addClass(this.el, 'active')
          this.options.onBeforeOpen()
      }

      this.isAnimating = true

      const self = this

      const onEndTransitionFn = function(ev) {
          if (ev.target !== this) return false

          // open:  first opacity then width/height/left/top
          // close: first width/height/left/top then opacity
          const opacityConds  = ev.propertyName !== 'opacity'
          const otherConds    = (ev.propertyName !== 'width') &&
                                (ev.propertyName !== 'height') &&
                                (ev.propertyName !== 'left') &&
                                (ev.propertyName !== 'top')
          const cond = (self.expanded) ? opacityConds && otherConds :
                                         otherConds && opacityConds

          if (cond) { return false }

          // NOTE: this is local this.
          this.removeEventListener('transitionend', onEndTransitionFn)

          self.isAnimating = false

          // callback
          if (self.expanded) {
              // remove class active (after closing)
              classie.removeClass(self.el, 'active')
              self.options.onAfterClose()
          } else {
              self.options.onAfterOpen()
          }

          self.expanded = !self.expanded
      }

      this.contentEl.addEventListener('transitionend', onEndTransitionFn)

      // set the left and top values of the contentEl (same like the button)
      const buttonPos = this.button.getBoundingClientRect()

      // need to reset
      classie.addClass(this.contentEl, 'no-transition')
      this.contentEl.style.left = 'auto'
      this.contentEl.style.top  = 'auto'

      // add/remove class "open" to the button wraper
      setTimeout(() => {
          this.contentEl.style.left = buttonPos.left + 'px'
          this.contentEl.style.top = buttonPos.top + 'px'

          if (this.expanded) {
              classie.removeClass(this.contentEl, 'no-transition')
              classie.removeClass(this.el, 'open')
          } else {
              setTimeout(() => {
                  classie.removeClass(this.contentEl, 'no-transition')
                  classie.addClass(this.el, 'open')
              }, 25)
          }
      }, 25)
  }

} // end class

export default UIMorphingButton
