const ADD = '+',
  SUBTRACT = '-',
  MULTIPLY = 'x',
  DIVIDE = '÷',
  EQUAL = '=',
  DECIMAL = '.',
  ALL_CLEAR = 'ac',
  CLEAR_ENTRY = 'ce';

const buttons = {
  operators: [
    {
      value: ADD,
      indexes: [107]
    },
    {
      value: SUBTRACT,
      indexes: [109]
    },
    {
      value: MULTIPLY,
      indexes: [106]
    },
    {
      value: DIVIDE,
      indexes: [111]
    },
    {
      value: EQUAL,
      indexes: [13]
    },
    {
      value: ALL_CLEAR,
      indexes: [46]
    }
  ],
  numerics: []
};
// Init numeric numbers objects
const digitNumLayout = [7, 8, 9, 4, 5, 6, 1, 2, 3, 0];

for (
  let num = 9, digitCode = 57, numPadCode = 105;
  num >= 0;
  num--, digitCode--, numPadCode--
) {
  const digitNumLayoutIndex = digitNumLayout.indexOf(num);
  buttons.numerics[digitNumLayoutIndex] = {
    value: num,
    indexes: [digitCode, numPadCode]
  };
}
buttons.numerics.push({
  value: DECIMAL,
  indexes: [110, 190]
});

const keyIndexList = {};

class InitializeElement {
  constructor(type, classes) {
    this.createElementWithClass(type, classes);
  }

  createElementWithClass(type, classes) {
    this.createElement(type);
    this.element.setAttribute('class', classes);
  }

  createElement(type) {
    this.element = document.createElement(type);
  }

  setParent(parent) {
    parent.appendChild(this.element);
  }
}
class Container extends InitializeElement {
  constructor(classes) {
    super('div', classes);
  }

  updateScreen(text) {
    this.element.innerText = text;
  }
}
class OutputScreen extends Container {
  constructor() {
    super('output-screen');
    this.updateScreen(0);
  }
}
class InputScreen extends Container {
  constructor() {
    super('input-screen');
    this.updateScreen(0);
  }
}
class Button extends InitializeElement {
  constructor(value, keyIndex, buttonType) {
    super('button', `btn f-1 ${buttonType}`);
    this.element.keyCode = keyIndex;
    this.element.innerText = value;
    this.element.addEventListener('click', this.onClick);
  }

  onClick({ target }) {
    calculator.addEntry(target);
  }
}
class NumericButton extends Button {
  constructor(value, keyIndex) {
    super(value, keyIndex, 'numeric');
  }
}
class OperatorButton extends Button {
  constructor(operator, keyIndex) {
    super(operator, keyIndex, 'operator');
    this.operator = operator;
    this.operator === EQUAL && this.element.classList.add('equal');
  }
}
class RemoveButton extends Button {
  constructor() {
    super(ALL_CLEAR.toUpperCase(), null, 'numeric remove');
    this.toggleRemoveType();

    // Override inherited onClick event handler
    this.element.onClick = this.onClick;
  }

  onClick() {
    this.dataset.removeType === ALL_CLEAR
      ? calculator.clearAll()
      : calculator.clearEntry();
  }

  toggleRemoveType(type = ALL_CLEAR) {
    this.element.dataset.removeType = type;
    this.element.innerText = type.toUpperCase();
  }
}
class Calculator {
  constructor() {
    this.input = '';

    // Create visual calculator
    initApp.call(this);

    // Keyboard inputs event listener
    window.addEventListener('keydown', this.addEntry.bind(this));
  }
  updateDom(result) {
    this.updateOutputScreen(result);
    this.resetInput();
  }
  addEntry({ keyCode }) {
    const action = this.getActionTypeByKeyCode(keyCode);
    if (isNaN(action)) {
      if (action === DECIMAL) return this.addInput(action);
      if (action === ALL_CLEAR) return this.removeButton.element.onClick();
      return this.handleOperatorInput(action);
    }

    return this.addInput(action);
  }
  handleOperatorInput(operator) {
    const inputNumber = parseFloat(this.input);
    switch (true) {
      // If this is initial operation...
      case !this.memory:
        // Create new memory.
        this.initOperation(inputNumber || 0, operator);
        break;

      // If this is repeat of 'equal operator'...
      case !this.memory.operator && operator === EQUAL:
        // Use the last operator and input to calculate.
        this.handleCalculate(
          this.memory.lastAction,
          inputNumber || this.memory.lastInput,
          null
        );
        break;

      // If the last operator was 'equal operator'...
      case !this.memory.operator:
        // Remove the last operator because this is not a repeat operation.
        this.memory.lastAction = null;
        // Save the new operator to use on calculate in next operation.
        this.memory.operator = operator;
        break;

      // If this is 'equal operator'...
      case operator === EQUAL:
        // Save the last operator and last input in case repeating the 'equal operation'
        this.updateMemory('lastAction', this.memory.operator);
        this.updateMemory('lastInput', inputNumber);
        // Calculate and display
        this.handleCalculate(
          this.memory.operator,
          inputNumber || this.memory.data,
          null
        );
        break;

      // The default calculate operation.
      default:
        this.handleCalculate(
          this.memory.operator,
          inputNumber || this.memory.data,
          operator
        );
        break;
    }
  }
  getActionTypeByKeyCode(keyCode) {
    return keyIndexList[keyCode];
  }
  initOperation(inputNumber, action) {
    this.createMemory(inputNumber, action);
    this.updateDom(inputNumber);
  }
  // Memory
  createMemory(data, operator) {
    this.memory = {
      data,
      operator
    };
  }
  updateMemory(property, value) {
    this.memory[property] = value;
  }
  handleCalculate(operator, secondValue, nextOperator) {
    const decimalValue = this.getResult(operator, secondValue);
    const result = Math.round(decimalValue * 100) / 100;
    this.finishOperation(result, nextOperator);
  }
  finishOperation(result, nextOperator) {
    this.updateMemory('data', result);
    this.updateMemory('operator', nextOperator);
    this.updateDom(result);
  }
  addInput(input) {
    const initialInput = !this.input;
    switch (true) {
      case input === '.' && initialInput:
        this.input = '0' + input;
        break;

      case input === '.' && this.input.includes('.'):
        null;
        break;

      default:
        this.input += input;
        break;
    }
    // Toggle 'AC' button to 'CE'
    this.toggleRemoveType(CLEAR_ENTRY);
    this.updateInputScreen(this.input);
  }
  updateInputScreen(data) {
    this.inputScreen.updateScreen(data);
  }
  updateOutputScreen(data) {
    this.outputScreen.updateScreen(data);
  }
  toggleRemoveType(type) {
    this.removeButton.toggleRemoveType(type);
  }
  clearEntry() {
    this.resetInput();
  }
  clearAll() {
    this.memory = null;
    this.resetInput();
    this.updateOutputScreen(0);
  }
  resetInput() {
    this.input = '';
    this.toggleRemoveType(ALL_CLEAR);
    this.updateInputScreen(0);
  }
  // Math Operations
  getResult(operator, data) {
    switch (operator) {
      case ADD:
        return this.memory.data + data;
      case SUBTRACT:
        return this.memory.data - data;
      case MULTIPLY:
        return this.memory.data * data;
      case DIVIDE:
        return this.memory.data / data;

      default:
        return data;
    }
  }
  getSum(data) {
    return this.memory.data + data;
  }
  getSubtraction(data) {
    return this.memory.data - data;
  }
  getDivision(data) {
    return this.memory.data / data;
  }
  getMultiply(data) {
    return this.memory.data * data;
  }
  // getResult(data) {
  //   return data;
  // }
}
const calculator = new Calculator();

function initApp() {
  this;
  const container = document.getElementById('main');
  renderScreens.call(this, container);
  renderButtons.call(this, container);
}
function renderScreens(container) {
  this;
  const ScreensContainer = new Container('screens');
  this.inputScreen = new InputScreen();
  this.outputScreen = new OutputScreen();

  renderDom(ScreensContainer, container);
  renderDom(this.inputScreen, ScreensContainer.element);
  renderDom(this.outputScreen, ScreensContainer.element);
}
function renderButtons(container) {
  const that = this;
  const ButtonsContainer = new Container('buttons');
  renderDom(ButtonsContainer, container);

  for (const key in buttons) {
    if (buttons.hasOwnProperty(key)) {
      // Set button constructor class
      const ButtonType = key === 'operators' ? OperatorButton : NumericButton;

      /*
       * Loop over each button object to create a button element
       * and update keyIndexList as:
       * - keyboard key numbers as key
       * - button value as value
       */
      buttons[key].forEach(function({ value, indexes }) {
        // create button element
        let button;
        if (value === ALL_CLEAR) {
          // We need remove button in calculator class
          // to manipulate its content and functionality
          that.removeButton = new RemoveButton();
          button = that.removeButton;
        } else {
          button = new ButtonType(value, indexes[0]);
        }
        renderDom(button, ButtonsContainer.element);

        // update keyIndexList
        indexes.forEach(function(keyboardKey) {
          setKeyIndexList(keyboardKey, value);
        });
      });
    }
  }
}

function renderDom(child, parent) {
  child.setParent(parent);
}
function setKeyIndexList(key, value) {
  keyIndexList[key] = value;
}
