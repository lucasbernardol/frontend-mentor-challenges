const DOMAdviceIdElement = document.querySelector('[data-id="advice-id"]');
const DOMTextElement = document.querySelector('[data-id="advice-text"]');

const shuffleButtonElement = document.querySelector(
  '[data-id="shuffle-button"]'
);

const ADVICE_API_URL = 'https://api.adviceslip.com/advice';

class AdviceConnection {
  constructor() {}

  /** @param headers {Headers}  */
  _decodeHeaders(headers) {
    const headersArray = [...headers.entries()];

    const headersReduced = headersArray.reduce((accumulator, [key, value]) => {
      accumulator[key] = value;

      return accumulator;
    }, {});

    return headersReduced;
  }

  async fetch(fullURL = ADVICE_API_URL, options = {}) {
    const mergedAdviceApiReqOptions = Object.assign(options, { method: 'GET' });

    const adviceRequestResponse = await fetch(
      fullURL,
      mergedAdviceApiReqOptions
    );

    const adviceResponseToJson = await adviceRequestResponse.json();

    /** End connection */
    const headers = this._decodeHeaders(adviceRequestResponse.headers);

    this._connectionEndDebugLog(headers);

    return {
      adviceResponseToJson,
    };
  }

  _connectionEndDebugLog(headers) {
    console.debug({
      status: 'Fetch: fetch OK!',
      headers,
    });
  }
}

class StorageMapper {
  _namespace_key = 'advice_app';

  _createFullNameSpace(key) {
    return `${this._namespace_key}:${key}`;
  }

  set(key, data) {
    const localStorageKey = this._createFullNameSpace(key);

    const parseDataToJSONString = this._serializeJSON(data);

    localStorage.setItem(localStorageKey, parseDataToJSONString);

    return {
      parseDataToJSONString,
      data,
    };
  }

  get(key) {
    const localStorageFullKey = this._createFullNameSpace(key);

    const json = localStorage.getItem(localStorageFullKey);

    return this._deserializeJSON(json);
  }

  _serializeJSON(object) {
    return JSON.stringify(object);
  }

  _deserializeJSON(string) {
    return JSON.parse(string);
  }
}

class Advice {
  _timeout = 1800;

  _timeout_class_name_divider = 2;
  _timeout_class_name_remove = this._timeout / this._timeout_class_name_divider;

  _storage_key = 'last_advice';

  /**
   * @param options {{
   *  DOMButtonElement: HTMLButtonElement,
   *  DOMIdentifierElement: HMTLElement,
   *  DOMTextElement: HTMLElement,
   *  connection: AdviceConnection
   *  storage: StorageMapper
   * }}
   **/
  constructor({
    DOMButtonElement,
    DOMIdentifierElement,
    DOMTextElement,
    connection,
    storage,
  }) {
    this.buttonElement = DOMButtonElement;
    this.identifierElement = DOMIdentifierElement;
    this.textElement = DOMTextElement;

    this.connection = connection;
    this.storage = storage;
  }

  init() {
    this.buttonElement.addEventListener('click', (event) => this.handle(event));
  }

  /** @param options {{ element: HTMLElement }} */
  _removeClassName({ element, className, useTimeout = true }) {
    const hasHTMLClassNameElement = element.classList.contains(className);

    if (hasHTMLClassNameElement) {
      const execInstruction = () => element.classList.remove(className);

      if (useTimeout) {
        const timeInMillisecondsToRemoveClass = this._timeout_class_name_remove;

        setTimeout(() => execInstruction(), timeInMillisecondsToRemoveClass);
      } else {
        execInstruction(); // OK
      }
    }
  }

  _addClassName(element, className) {
    element.classList.add(className);
  }

  /** @param element {HTMLElement} */
  hasHTMLAttribute(element, attributeName = 'disabled') {
    return element.hasAttribute(attributeName);
  }

  _disabledShuffleButton(button) {
    const hasNotDisabledAttribute = !this.hasHTMLAttribute(button, 'disabled');

    if (hasNotDisabledAttribute) {
      button.setAttribute('disabled', 'true');
    }
  }

  _enableShuffleButton(button) {
    const hasDisabledAttribute = this.hasHTMLAttribute(button, 'disabled');

    if (hasDisabledAttribute) {
      const expiredTimeInMilliseconds = this._timeout;

      const execInstruction = () => button.removeAttribute('disabled');

      setTimeout(() => execInstruction(), expiredTimeInMilliseconds);
    }
  }

  _makeIdentifier(id) {
    return `#${id}`;
  }

  _setRederedState({ id, adviceText, button = null }) {
    const textElement = this.textElement;

    this.identifierElement.textContent = id;
    textElement.textContent = adviceText;

    // Enable: new request
    if (button) this._enableShuffleButton(button);

    this._addClassName(textElement, 'text_animated');
    this._removeClassName({ element: textElement, className: 'text_animated' });
  }

  /** wrapper */
  render({ identifierPlainId, adviceText, button }) {
    const identifierId = this._makeIdentifier(identifierPlainId);

    this._setRederedState({
      id: identifierId,
      adviceText,
      button,
    });
  }

  async execute({ button = this.buttonElement }) {
    let sharedAdviceToStoreInApp = null;

    try {
      const { adviceResponseToJson } = await this.connection.fetch();

      const { id, advice } = adviceResponseToJson.slip;

      this.render({
        identifierPlainId: id,
        adviceText: advice,
        button,
      });

      sharedAdviceToStoreInApp = { id, advice };
    } catch (error) {
      console.error(error);

      return alert(error.name);
    } finally {
      const adviceStorageKey = this._storage_key;

      if (sharedAdviceToStoreInApp) {
        this.storage.set(adviceStorageKey, sharedAdviceToStoreInApp);

        console.debug({
          status: 'Data: save advice (localStorage)!',
          data: sharedAdviceToStoreInApp,
        });
      }
    }
  }

  async handle(event) {
    const { currentTarget: button } = event;

    this._disabledShuffleButton(button);

    await this.execute({ button });
  }

  load() {
    const adviceStorageKey = this._storage_key;

    const localStorageSavedLastAdvice = this.storage.get(adviceStorageKey);

    if (localStorageSavedLastAdvice) {
      const { id, advice } = localStorageSavedLastAdvice;

      /** load from localStorage  */
      this.render({
        identifierPlainId: id,
        adviceText: advice,
      });

      console.debug({
        status: 'Load: start application (load localStorage)!',
      });
    }

    return this;
  }
}

async function application() {
  const storage = new StorageMapper();

  const connection = new AdviceConnection();

  const advice = new Advice({
    DOMIdentifierElement: DOMAdviceIdElement,
    DOMButtonElement: shuffleButtonElement,
    DOMTextElement,
    storage,
    connection,
  });

  /** Application life cicle */
  advice.load().init();
}

window.addEventListener('load', () => application());
