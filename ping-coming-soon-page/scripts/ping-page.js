const InputHTMLElementGroup = document.querySelectorAll('input');

const textErrorElement = document.querySelector('.input__error_text');
const formElement = document.querySelector('form');

const CASCADING_CSS_CLASS = {
  input: 'invalid',
  text_visible: 'visible',
};

class ValidationFieldMapper {
  _initial_state = {
    hasValidationError: false,
  };

  _state = {};

  _error_messages = {
    email: {
      patternMismatch: 'Error: invalid email address!',
      typeMismatch: 'Error: invalid email address, please try again leter!',
      valueMissing: 'Error: empty email address!',
    },

    default: 'Invalid params',
  };

  constructor() {}

  /** @param field {HTMLInputElement}  */
  validation(field) {
    const validityState = field.validity;

    for (const validityStateKey in validityState) {
      const validityStateValue = validityState[validityStateKey];

      const hasValidationError = validityStateValue && !validityState.valid;

      if (hasValidationError) {
        const complete = {
          [validityStateKey]: validityStateValue,
        };

        /** Error Object */
        const error = { complete, validityStateKey, validityStateValue };

        this._setState({ error, hasValidationError });
        break;
      } else {
        this._setState(); // initial state
      }
    }

    const ValidatioErrorMapper = this.state;

    console.debug({
      message: 'Validation error',
      error: ValidatioErrorMapper,
    });

    return ValidatioErrorMapper;
  }

  errorMessage({ fieldType = 'email', errorName }) {
    const fieldsErrors = this._error_messages;

    const hasErrorFieldType = Object.keys(fieldsErrors).includes(fieldType);

    if (hasErrorFieldType) {
      /** Add error messges */
      const messages = fieldsErrors[fieldType];

      const stringMessage = messages[errorName]
        ? messages[errorName]
        : fieldsErrors.default;

      return stringMessage;
    } else {
      throw new Error(`Invalid input field: '${fieldType}'`);
    }
  }

  get state() {
    return this._state;
  }

  _setState({ error = null, hasValidationError = false } = {}) {
    const initial = { ...this._initial_state };

    const mergedStates = Object.assign(initial, { error, hasValidationError });

    this._state = mergedStates;
  }
}

class ValidationError {
  /**
   * @param options {Object}
   * @param options.fieldMapper {ValidationFieldMapper}
   * @param options.errorTextElement {HTMLElement}
   **/
  constructor({ fieldMapper, errorTextElement }) {
    this.fieldMapper = fieldMapper;
    this.errorText = errorTextElement;
  }

  _addClassName(element, className) {
    const hasNotClassName = !element.classList.contains(className);

    if (hasNotClassName) {
      element.classList.add(className);
    }
  }

  _removeClassName(element, className) {
    element.classList.remove(className);
  }

  setClassName(element, className = 'invalid') {
    element.classList.add(className);
  }

  setState({ inputElment, errorTextElement, message }) {
    errorTextElement.textContent = message;

    this._addClassName(errorTextElement, CASCADING_CSS_CLASS.text_visible);

    this._addClassName(inputElment, CASCADING_CSS_CLASS.input);
  }

  clearState({ errorText = this.errorText, input }) {
    this._removeClassName(errorText, CASCADING_CSS_CLASS.text_visible);

    this._removeClassName(input, CASCADING_CSS_CLASS.input);
  }

  /**
   * @param options {Object} - Update view options
   * @param options.error {{ validityStateKey: string, validityStateValue: boolean }}
   * @param options.input {HTMLInputElement}
   */
  updateView({ error, input }) {
    const { validityStateKey } = error;

    const errorTextElement = this.errorText;

    const message = this.fieldMapper.errorMessage({
      fieldType: input.type,
      errorName: validityStateKey,
    });

    this.setState({ errorTextElement, inputElment: input, message });
  }

  handle(event) {
    const { target: input } = event;

    const { hasValidationError, error } = this.fieldMapper.validation(input);

    if (hasValidationError) {
      this.updateView({ input, error });

      console.debug({
        message: `Update view: call "updateView()" function`,
      });
    } else {
      this.clearState({
        input,
      });
    }
  }
}

function application() {
  const validationMapper = new ValidationFieldMapper();

  const validation = new ValidationError({
    fieldMapper: validationMapper,
    errorTextElement: textErrorElement,
  });

  InputHTMLElementGroup.forEach((input) => {
    input.addEventListener('invalid', (event) => {
      /** form Submit */
      event.preventDefault();

      validation.handle(event);
    });

    input.addEventListener('blur', (event) => validation.handle(event));
    input.addEventListener('input', (event) => validation.handle(event));
  });

  formElement.addEventListener('submit', (event) => {
    event.preventDefault();

    const childElements = [...event.target.elements];

    childElements.forEach((element) => {
      const tagName = element.tagName.toLowerCase();

      switch (tagName) {
        case 'input':
          element.value = null;
      }
    });

    alert('OK');
  });
}

window.addEventListener('load', () => application());
