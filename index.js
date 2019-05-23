// Application
let calculator;

// Keyboard Indexes
let keyIndexList = {};

// Digit numbers layout in the calculator
const digitNumLayout = [7, 8, 9, 4, 5, 6, 1, 2, 3, 0];

// Operators
const ADD = '+',
  SUBTRACT = '-',
  MULTIPLY = 'x',
  DIVIDE = '÷',
  EQUAL = '=',
  POINT = '.',
  ALL_CLEAR = 'ac',
  CLEAR_ENTRY = 'ce';

/*
 * Calculator buttons objects list.
 * value = button inner text
 * indexes = [keyCode numbers]
 */
const buttons = {
  // Operator buttons objects
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
  // Numeric buttons objects
  numerics: []
};

/*
 * We do loop from 9 to 0 over the numbers,
 * instead of hard coding to define
 * each number's values and keyCode numbers
 */

for (
  let num = 9, digitCode = 57, numPadCode = 105;
  num >= 0;
  num--, digitCode--, numPadCode--
) {
  // Get layout index
  const digitNumLayoutIndex = digitNumLayout.indexOf(num);

  // Use layout index to locate the created object
  // in numerics list
  buttons.numerics[digitNumLayoutIndex] = {
    // Button value
    value: num,
    // KeyCode numbers for keydown events
    indexes: [digitCode, numPadCode]
  };
}
// Point button object
buttons.numerics.push({
  value: POINT,
  indexes: [110, 190]
});

// Class definitions
class InitializeElement {
  constructor(type, classes, content = '') {
    this.createElementWithClass(type, classes);
    this.updateContent(content);
  }
  createElementWithClass(type, classes) {
    this.createElement(type);
    this.element.setAttribute('class', classes);
  }
  createElement(type) {
    this.element = document.createElement(type);
  }
  updateContent(content) {
    this.element.innerText = content;
  }
  setParent(parent) {
    parent.appendChild(this.element);
  }
}
class Container extends InitializeElement {
  constructor(classes, content) {
    super('div', classes, content);
  }
}
class OutputScreen extends Container {
  constructor() {
    super('output-screen', 0);
  }
}
class InputScreen extends Container {
  constructor() {
    super('input-screen', 0);
  }
}
class Button extends InitializeElement {
  constructor(value, keyIndex, buttonType) {
    super('button', `btn ${buttonType}`, value);
    this.element.keyCode = keyIndex;
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
    operator === EQUAL && this.element.classList.add('equal');
  }
}
class RemoveButton extends Button {
  constructor() {
    super(ALL_CLEAR.toUpperCase(), null, 'numeric remove');
    // Set button init content 'AC'
    this.toggleRemoveType();

    // Override inherited onClick event handler
    this.element.onClick = this.onClick;
  }
  onClick() {
    // If the button content is 'AC', clear everything.
    // Else, clear input screen only.
    this.dataset.removeType === ALL_CLEAR
      ? calculator.resetCalculator()
      : calculator.clearEntry();
  }
  toggleRemoveType(type = ALL_CLEAR) {
    this.element.dataset.removeType = type;
    this.updateContent(type.toUpperCase());
  }
}

/*
 * The calculation class is the brain of the application.
 * It overcomes taking the inputs, calculating the output
 * and displaying the result.
 * -------------------------------------------------
 * It initializes all the above class instances and
 * manages these classes to manipulate DOM:
 * Screens managements => InputScreen, OutputScreen.
 * Input managements => NumericButton, OperatorButton
 * and RemoveButton.
 */
class Calculator {
  constructor() {
    // Store the input value of click or keydown events
    this.input = '';

    // Create visual calculator
    initApp.call(this);

    // Keyboard inputs event listener
    window.addEventListener('keydown', this.addEntry.bind(this));
  }
  addEntry({ keyCode }) {
    // Define the pressed / clicked button by its keyCode
    const button = this.getActionTypeByKeyCode(keyCode);

    // If button is not numeric and...
    if (isNaN(button)) {
      // If it is point button, save input.
      if (button === POINT) return this.addInput(button);
      // If it is clear button, remove all or entry by its data set attribute.
      if (button === ALL_CLEAR) return this.removeButton.element.onClick();
      // Else it is an operator button, do the math.
      return this.handleOperatorInput(button);
    }
    // Else, it is a numeric button, save the input.
    return this.addInput(button);
  }
  getActionTypeByKeyCode(keyCode) {
    return keyIndexList[keyCode];
  }
  addInput(input) {
    // Handle the numeric num inputs
    switch (true) {
      // If this is first point, use with 0.
      case input === POINT && !this.input:
        this.input = '0' + input;
        break;
      // If point already used, do nothing.
      case input === POINT && this.input.includes(POINT):
        null;
        break;
      // Merge and print input
      default:
        this.input += input;
        break;
    }
    // Toggle 'AC' button to 'CE'
    this.toggleRemoveType(CLEAR_ENTRY);
    // Display the input
    this.updateInputScreen(this.input);
  }
  updateInputScreen(data) {
    this.inputScreen.updateContent(data);
  }
  handleOperatorInput(operator) {
    // Convert from string number input
    const inputNumber = parseFloat(this.input);

    switch (true) {
      // If this is initial operation...
      case !this.memory:
        // Create new memory.
        this.initOperation(inputNumber || 0, operator);
        break;

      // If this is repeat of 'equal operator'...
      case !this.memory.operator && operator === EQUAL:
        // Use the...
        this.handleCalculate(
          // last saved operator with...
          this.memory.lastAction,
          // current or last saved input.
          inputNumber || this.memory.lastInput,
          // This is a repeat action, so there is no new operator.
          null
        );
        break;

      // If the last operator was 'equal operator'
      // and this is not a repeat of the same action...
      case !this.memory.operator:
        // Remove the last operator
        this.memory.lastAction = null;
        // Save the new operator to use on next action.
        this.memory.operator = operator;
        break;

      // If this is 'equal operator', in case of repeating
      // the same action...
      case operator === EQUAL:
        // Save the last operator and...
        this.updateMemory('lastAction', this.memory.operator);
        // Save the current input.
        this.updateMemory('lastInput', inputNumber);
        // Calculate and display the current action.
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
  initOperation(inputNumber, operator) {
    this.createMemory(inputNumber, operator);
    this.updateDomAfterCalculation(inputNumber);
  }
  createMemory(data, operator) {
    this.memory = {
      data,
      operator
    };
  }
  updateDomAfterCalculation(result) {
    this.updateOutputScreen(result);
    this.resetInputAndScreen();
  }
  updateOutputScreen(data) {
    this.outputScreen.updateContent(data);
  }
  handleCalculate(operator, latestNumber, nextOperator) {
    // Do math and return value
    const decimalNum = this.getResult(operator, latestNumber);
    // Round decimal number by 2
    const result = round(decimalNum, 2);

    // Save the result for next math action
    this.updateMemory('data', result);
    // Save the latest used operator in case of the same action will be repeated
    this.updateMemory('operator', nextOperator);
    // Display the result
    this.updateDomAfterCalculation(result);
  }
  updateMemory(property, value) {
    this.memory[property] = value;
  }
  toggleRemoveType(type) {
    this.removeButton.toggleRemoveType(type);
  }
  clearEntry() {
    this.resetInputAndScreen();
  }
  resetCalculator() {
    this.memory = null;
    this.resetInputAndScreen();
    this.updateOutputScreen(0);
  }
  resetInputAndScreen() {
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
}
calculator = new Calculator();

// Application Initializer
// This = calculator class

function initApp() {
  const container = document.getElementById('main');
  // Create screens, buttons and merge with calculator class
  renderScreens.call(this, container);
  renderButtons.call(this, container);
}
function renderScreens(container) {
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

  // Loop over each button type(operator buttons and numeric buttons)
  for (const key in buttons) {
    // Set button constructor class
    const ButtonType = key === 'operators' ? OperatorButton : NumericButton;

    /*
     * Loop over each button object of button type
     * to create the button element and update
     * keyIndexList as:
     * - key = keyboard keyCodes
     * - value = button value
     */
    buttons[key].forEach(function({ value, indexes }) {
      let button;
      if (value === ALL_CLEAR) {
        // We need remove button in calculator class
        // to manipulate its content and functionality
        that.removeButton = new RemoveButton();
        button = that.removeButton;
      } else {
        // Initialize button class
        button = new ButtonType(value, indexes[0]);
      }
      // Display the created button.
      renderDom(button, ButtonsContainer.element);

      /*
       * Save keyCode and value of created button.
       * This list will be used to define the
       * clicked or pressed button in calculator class
       */
      indexes.forEach(function(keyboardKey) {
        setKeyIndexList(keyboardKey, value);
      });
    });
  }
}

// Helpers
function renderDom(child, parent) {
  child.setParent(parent);
}
function setKeyIndexList(key, value) {
  keyIndexList[key] = value;
}
function round(value, decimals) {
  return Number(Math.round(value + 'e' + decimals) + 'e-' + decimals);
}
