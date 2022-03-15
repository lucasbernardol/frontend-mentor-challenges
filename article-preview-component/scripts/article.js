const tolltip = document.querySelector('.share_tooltip');

const openTolltipButton = document.querySelector('.tooltip_button');
const closeTolltipButton = document.querySelector('.tooltip_button_close');

const adapts = document.querySelectorAll('[data-adapt]');

const CASCADING_CLASS_NAMES = {
  adapt: 'responsive_adapt',

  button: {
    hidden: 'hidden',
  },
};

class Tooltip {
  _width = window.innerWidth;

  constructor({ tolltip, adapts }) {
    this.toolTipElement = tolltip;
    this.adapts = [...adapts];
  }

  get width() {
    return this._width;
  }

  set width(innerWidth) {
    this._width = innerWidth;
  }

  isValidScreenWidth() {
    return this.width <= 600;
  }

  addClassName(element, className) {
    const classNameNotExists = !this._containsClassName(element, className);

    if (classNameNotExists) {
      element.classList.add(className);
    }
  }

  removeClassName(element, className) {
    element.classList.remove(className);
  }

  /** @param element {HTMLElement} */
  toggleClassName(element, className) {
    const htmlElement = element ? element : this.toolTipElement;

    htmlElement.classList.toggle(className);
  }

  /** @param element {HTMLElement} */
  _containsClassName(element, className) {
    return element.classList.contains(className);
  }

  clearAdapts(adapts, className) {
    adapts.forEach((adapt) => this.removeClassName(adapt, className));
  }

  fixResponsiveAdapt(options = {}) {
    const { adapts, className, clearAdapts } = options;

    if (clearAdapts) this.clearAdapts(adapts, className);

    for (const adaptElement of adapts) {
      const screenWidthIsValid = this.isValidScreenWidth();

      if (screenWidthIsValid) {
        this.toggleClassName(adaptElement, className);
      }
    }
  }

  execute(options = {}) {
    const { toogleClassName = true, adapts = this.adapts } = options;

    const { hidden } = CASCADING_CLASS_NAMES.button;

    const tooltipCompoenentElement = this.toolTipElement;

    toogleClassName
      ? this.toggleClassName(tooltipCompoenentElement, hidden)
      : this.addClassName(tooltipCompoenentElement, hidden);

    this.clearAdapts(adapts, CASCADING_CLASS_NAMES.adapt);
  }

  handle(event) {
    /** adapts[]  */
    const adapts = this.adapts;

    this.execute();

    this.fixResponsiveAdapt({
      adapts,
      className: CASCADING_CLASS_NAMES.adapt,
      clearAdapts: false,
    });
  }
}

function application() {
  const tooltipManipulation = new Tooltip({ tolltip, adapts });

  /**
   * - Current width
   */
  window.addEventListener('resize', ({ target }) => {
    tooltipManipulation.width = target?.innerWidth;

    tooltipManipulation.execute({ toogleClassName: false });
  });

  openTolltipButton.addEventListener('click', (event) =>
    tooltipManipulation.handle(event)
  );

  closeTolltipButton.addEventListener('click', () =>
    tooltipManipulation.execute()
  );
}

window.addEventListener('load', () => application());
