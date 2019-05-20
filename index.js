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
    this.memory;
    this.input = '';
    this.operations = {
      '+': this.getSum
    };
    this.inputScreen = new InputScreen();
    this.outputScreen = new OutputScreen();
    this.renderDom();
  }
  renderDom() {
    container.appendChild(this.inputScreen.element);
    container.appendChild(this.outputScreen.element);
  }
  handleOperation(operatorType) {
    if (this.memory === undefined) {
      this.finishOperation();
    } else {
      const operator = this.operations[operatorType].bind(this);
      const result = operator(Number(this.input));
      this.finishOperation(result);
    }
  }
  finishOperation(result = this.input) {
    this.updateMemory(result);
    this.updateOutputScreen(result);
    this.resetInput();
  }
  addInput(input) {
    this.input += input;
    this.inputScreen.updateScreen(this.input);
  }
  updateMemory(data) {
    this.memory = Number(data);
  }
  updateOutputScreen(data) {
    this.outputScreen.updateScreen(data);
  }
  resetInput() {
    this.input = '';
    this.inputScreen.updateScreen(this.input);
  }
  getSum(data) {
    return this.memory + data;
  }
}
const calculator = new Calculator();
function handleCalculation(operator) {
  if (memory === undefined) {
    updateMemory(input);
    newEls[0].updateScreen(input);
  }

  const operationHandler = operations[operator];
  const result = operationHandler(memory, input);
  updateMemory(result);
  newEls[0].updateScreen(result);
  console.log(result);
}
function updateMemory(data = 0) {
  memory = data;
  resetInput();
}
function getSum(memory, input) {
  return memory + input;
}
function resetInput() {
  input = 0;
  newEls[1].updateScreen(input);
}
const newEls = [
  new NumericButton(1),
  new NumericButton(2),
  new NumericButton(3),
  new OperatorButton('+')
];
newEls.forEach(function(el, i) {
  container.appendChild(el);
});
