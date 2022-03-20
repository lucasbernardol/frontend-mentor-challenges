const DOMNavigationOptions = document.querySelectorAll('.navigation__option');
const DOMActivitiesToRender = document.querySelector('.dashboard__activities');

const TRACKING_STATIC = [
  {
    title: 'Work',
    timeframes: {
      daily: {
        current: 5,
        previous: 7,
      },
      weekly: {
        current: 32,
        previous: 36,
      },
      monthly: {
        current: 103,
        previous: 128,
      },
    },
  },
  {
    title: 'Play',
    timeframes: {
      daily: {
        current: 1,
        previous: 2,
      },
      weekly: {
        current: 10,
        previous: 8,
      },
      monthly: {
        current: 23,
        previous: 29,
      },
    },
  },
  {
    title: 'Study',
    timeframes: {
      daily: {
        current: 0,
        previous: 1,
      },
      weekly: {
        current: 4,
        previous: 7,
      },
      monthly: {
        current: 13,
        previous: 19,
      },
    },
  },
  {
    title: 'Exercise',
    timeframes: {
      daily: {
        current: 1,
        previous: 1,
      },
      weekly: {
        current: 4,
        previous: 5,
      },
      monthly: {
        current: 11,
        previous: 18,
      },
    },
  },
  {
    title: 'Social',
    timeframes: {
      daily: {
        current: 1,
        previous: 3,
      },
      weekly: {
        current: 5,
        previous: 10,
      },
      monthly: {
        current: 21,
        previous: 23,
      },
    },
  },
  {
    title: 'Self Care',
    timeframes: {
      daily: {
        current: 0,
        previous: 1,
      },
      weekly: {
        current: 2,
        previous: 2,
      },
      monthly: {
        current: 7,
        previous: 11,
      },
    },
  },
];

class TrackingFilter {
  _avaliable_time_frames = ['daily', 'weekly', 'monthly'];

  /**
   * @param options {object} - Constructor options
   * @param options.tracking {TRACKING_STATIC} Trackings
   */
  constructor({ tracking = TRACKING_STATIC } = {}) {
    this.trackings = tracking;
  }

  _includesTileFrame(timeFramea) {
    return this._avaliable_time_frames.includes(timeFramea);
  }

  filter(timeFrame = 'daily') {
    const timeFrameParam = timeFrame.toLowerCase();

    const hasNotIncluedTimeFrame = !this._includesTileFrame(timeFrameParam);

    if (hasNotIncluedTimeFrame) return null;

    const trackingsMapped = this.trackings.map((tracking) => {
      const searched = tracking.timeframes[timeFrameParam];

      return {
        [timeFrameParam]: searched,
        title: tracking.title,
      };
    });

    return trackingsMapped;
  }
}

class Tracking {
  _initial_tracking_type = 'weekly';

  /**
   * @param options {Object} - Constructor options
   * @param options.navigations {HTMLElement[]} Buttons
   * @param options.trackingFilter {TrackingFilter} Filter
   * @param options.htmlRenderWrapper {HTMLElement}
   */
  constructor({ navigations, trackingFilter, htmlRenderWrapper } = {}) {
    this.navigations = [...navigations];
    this.trackingsFilder = trackingFilter;
    this.renderHtmlElement = htmlRenderWrapper;
  }

  init() {
    this.navigations.forEach((navigation) =>
      navigation.addEventListener('click', (event) => this.handle(event))
    );
  }

  load() {
    const trackingInitialType = this._initial_tracking_type;

    const trackings = this.trackingsFilder.filter(trackingInitialType);

    const template = this.createTemplate({
      trackingType: trackingInitialType,
      trackings,
    });

    this.render({ template });

    return this;
  }

  /** @param element {HTMLButtonElement} */
  _extractTrackingType(element, param = 'trackingType') {
    return element.dataset[param];
  }

  template({ tracking: { title, ...extras }, trackingType }) {
    const { current, previous } = extras[trackingType];

    const trackinModifier = title.toLowerCase().replace(' ', '-');

    const html = `
      <div class="activity__card activity__card--${trackinModifier}">
        <header class="activity__header"></header>
        <div class="activity__status">
          <div class="activity__status_header">
            <h3 class="activity__status_title">${title}</h3>
            <a href="#" class="activity__status_anchor">
              <i class="fa-solid fa-ellipsis"></i>
            </a>
          </div>

          <h2 class="activity__current">${current}hrs</h2>
          <span class="activity__previous">Previous - ${previous}hrs</span>
        </div>
      </div>
    `;

    return html;
  }

  createTemplate({ trackings, trackingType }) {
    const template = trackings.map((tracking) =>
      this.template({ tracking, trackingType })
    );

    const templateToHTMLString = template.join('');

    console.debug({
      message: `Create template: ${trackingType}`,
      template: templateToHTMLString,
    });

    return templateToHTMLString;
  }

  render({ htmlElementToRender = this.renderHtmlElement, template }) {
    htmlElementToRender.innerHTML = template;
  }

  updateView({ trackingType }) {
    const trackings = this.trackingsFilder.filter(trackingType);

    const htmlTemplate = this.createTemplate({ trackings, trackingType });

    this.render({
      htmlElementToRender: this.renderHtmlElement,
      template: htmlTemplate,
    });
  }

  /** @param element {HTMLButtonElement} */
  _disabledButton(element) {
    const hasNotConstationsDisabledAttribute =
      !element.hasAttribute('disabled');

    if (hasNotConstationsDisabledAttribute) {
      element.setAttribute('disabled', 'true');
    }
  }

  _enabledButtonElement(element) {
    element.removeAttribute('disabled');
  }

  _removeClassName(element, className) {
    element.classList.remove(className);
  }

  _setClassName(element, className) {
    element.classList.add(className);
  }

  /** @param element {HTMLButtonElement[]} */
  clearAllClassNamesAndActiveModifier({
    elements = this.navigations,
    current,
    className,
  }) {
    for (const element of elements) {
      this._enabledButtonElement(element);
      this._removeClassName(element, className);
    }

    /** Active element */
    this._setClassName(current, className);
  }

  execute({ trackingType, button }) {
    this.clearAllClassNamesAndActiveModifier({
      current: button,
      className: 'selected_navigation',
    });

    this.updateView({ trackingType });
    this._disabledButton(button);
  }

  handle(event) {
    let targedHTMLButtonElement = null;

    try {
      const { currentTarget: button } = event;

      const trackingType = this._extractTrackingType(button);

      this.execute({ button, trackingType });

      targedHTMLButtonElement = button;
    } catch (error) {
      console.debug(error);

      alert(error.name);
    } finally {
      if (targedHTMLButtonElement) {
        console.debug({
          message: `CLick button: ${targedHTMLButtonElement.tagName}`,
          button: targedHTMLButtonElement,
        });
      }
    }
  }
}

function applicationLifeClicle() {
  const trackingFilder = new TrackingFilter();

  const tracking = new Tracking({
    htmlRenderWrapper: DOMActivitiesToRender,
    trackingFilter: trackingFilder,
    navigations: DOMNavigationOptions,
  });

  /** Init */
  tracking.load().init();
}

window.addEventListener('load', () => applicationLifeClicle());
