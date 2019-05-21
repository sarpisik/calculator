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
}
class Screen extends InitializeElement {
  constructor(screenType) {
    super('div', `screen ${screenType}`);
  }
}
class OutputScreen extends Screen {
  constructor() {
    super('output');
  }

  updateScreen(text) {
    this.element.innerText = text;
  }
}
class InputScreen extends Screen {
  constructor() {
    super('input');
    this.updateScreen(0);
  }

  updateScreen(text) {
    this.element.innerText = text;
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
    return this.element;
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
    return this.element;
  }

  onClick() {
    // this.operator;
    calculator.handleOperation(this.operator);
  }
}
const container = document.getElementById('main');

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
    this.inputScreen = new InputScreen();
    this.outputScreen = new OutputScreen();
    this.renderDom();
  }
  renderDom() {
    container.appendChild(this.inputScreen.element);
    container.appendChild(this.outputScreen.element);
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
  createMemory(data, action) {
    this.memory = {
      data,
      action
    };
  }
  handleCalculate(action, secondValue, nextAction) {
    const operator = this.operations[action].bind(this);
    const result = operator(secondValue);
    this.finishOperation(result, nextAction);
  }
  finishOperation(result, nextAction) {
    this.updateMemory('data', result);
    this.updateMemory('action', nextAction);
    this.updateDom(result);
  }
  addInput(input) {
    this.input += input;
    this.inputScreen.updateScreen(this.input);
  }
  updateMemory(property, value) {
    this.memory[property] = value;
  }
  updateOutputScreen(data) {
    this.outputScreen.updateScreen(data);
  }
  resetInput() {
    this.input = '';
    this.inputScreen.updateScreen(0);
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
  getResult(data) {
    return data;
  }
}
const calculator = new Calculator();
const newEls = [
  new NumericButton(1),
  new NumericButton(2),
  new NumericButton(3),
  new OperatorButton('+'),
  new OperatorButton('-'),
  new OperatorButton('÷'),
  new OperatorButton('x'),
  new OperatorButton('=')
];
newEls.forEach(function(el, i) {
  container.appendChild(el);
});
