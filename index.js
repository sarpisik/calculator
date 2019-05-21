let input = 0,
  memory;
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
  constructor(value, buttonType) {
    super('button', `btn f-1 ${buttonType}`);
    this.element.value = value;
    this.element.innerText = value;
  }
}
class NumericButton extends Button {
  constructor(value) {
    super(value, 'numeric');
    this.element.addEventListener('click', this.onClick.bind(this));
  }

  onClick() {
    calculator.addInput(this.element.value);
  }
}
class OperatorButton extends Button {
  constructor(operator) {
    super(operator, 'operator');
    this.operator = operator;
    this.element.addEventListener('click', this.onClick.bind(this));
  }

  onClick() {
    calculator.handleOperation(this.operator);
  }
}
class RemoveButton extends Button {
  constructor() {
    super('AC', 'numeric');
    this.removeType = 'ac';
    this.element.addEventListener('click', this.onClick.bind(this));
  }

  onClick() {
    this.removeType === 'ac' ? calculator.clearAll() : calculator.clearEntry();
  }

  toggleRemoveType(type = 'ac') {
    this.removeType = type;
    this.element.innerText = type.toUpperCase();
  }
}
class Calculator {
  constructor() {
    this.input = '';
    this.operations = {
      '+': this.getSum,
      '-': this.getSubtraction,
      '÷': this.getDivision,
      x: this.getMultiply,
      '=': this.getResult
    };
    this.container = document.getElementById('main');
    this.screensContainer = new Container('screens');
    this.screensContainer.setParent(this.container);
    this.buttonsContainer = new Container('buttons');
    this.buttonsContainer.setParent(this.container);

    this.inputScreen = new InputScreen();
    this.outputScreen = new OutputScreen();
    this.removeButton = new RemoveButton();

    this.screens = [this.inputScreen, this.outputScreen];
    this.buttons = [
      new OperatorButton('+'),
      new OperatorButton('-'),
      new OperatorButton('x'),
      new OperatorButton('÷'),
      new OperatorButton('='),
      new NumericButton(0),
      new NumericButton(1),
      new NumericButton(2),
      new NumericButton(3),
      new NumericButton(4),
      new NumericButton(5),
      new NumericButton(6),
      new NumericButton(7),
      new NumericButton(8),
      new NumericButton(9),
      new NumericButton('.'),
      this.removeButton
    ];
    this.renderDom(this.screens, this.screensContainer.element);
    this.renderDom(this.buttons, this.buttonsContainer.element);
  }
  renderDom(children, parent) {
    children.forEach(function({ element }) {
      parent.appendChild(element);
    });
  }
  updateDom(result) {
    this.updateOutputScreen(result);
    this.resetInput();
  }
  handleOperation(action) {
    const inputNumber = parseFloat(this.input);
    switch (true) {
      // If this is initial operation...
      case !this.memory:
        // Create new memory.
        this.initOperation(inputNumber || 0, action);
        break;

      // If this is repeat of 'equal operator'...
      case !this.memory.action && action === '=':
        // Use the last operator and input to calculate.
        this.handleCalculate(
          this.memory.lastAction,
          inputNumber || this.memory.lastInput,
          null
        );
        break;

      // If the last operator was 'equal operator'...
      case !this.memory.action:
        // Remove the last operator because this is not a repeat operation.
        this.memory.lastAction = null;
        // Save the new operator to use on calculate in next operation.
        this.memory.action = action;
        break;

      // If this is 'equal operator'...
      case action === '=':
        // Save the last operator and last input in case repeating the 'equal operation'
        this.updateMemory('lastAction', this.memory.action);
        this.updateMemory('lastInput', inputNumber);
        // Calculate and display
        this.handleCalculate(
          this.memory.action,
          inputNumber || this.memory.data,
          null
        );
        break;

      // The default calculate operation.
      default:
        this.handleCalculate(
          this.memory.action,
          inputNumber || this.memory.data,
          action
        );
        break;
    }
  }
  initOperation(inputNumber, action) {
    this.createMemory(inputNumber, action);
    this.updateDom(inputNumber);
  }
  // Memory
  createMemory(data, action) {
    this.memory = {
      data,
      action
    };
  }
  updateMemory(property, value) {
    this.memory[property] = value;
  }
  handleCalculate(action, secondValue, nextAction) {
    const operator = this.operations[action].bind(this);

    const result = Math.round(operator(secondValue) * 100) / 100;
    this.finishOperation(result, nextAction);
  }
  finishOperation(result, nextAction) {
    this.updateMemory('data', result);
    this.updateMemory('action', nextAction);
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
    this.toggleRemoveType('ce');
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
    this.toggleRemoveType('ac');
    this.updateInputScreen(0);
  }
  // Math Operations
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
  getResult(data) {
    return data;
  }
}
const calculator = new Calculator();
