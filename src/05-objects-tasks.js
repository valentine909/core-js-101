/* ************************************************************************************************
 *                                                                                                *
 * Please read the following tutorial before implementing tasks:                                   *
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Object_initializer *
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object        *
 *                                                                                                *
 ************************************************************************************************ */


/**
 * Returns the rectangle object with width and height parameters and getArea() method
 *
 * @param {number} width
 * @param {number} height
 * @return {Object}
 *
 * @example
 *    const r = new Rectangle(10,20);
 *    console.log(r.width);       // => 10
 *    console.log(r.height);      // => 20
 *    console.log(r.getArea());   // => 200
 */
function Rectangle(width, height) {
  this.width = width;
  this.height = height;
  this.getArea = () => this.width * this.height;
  return this;
}


/**
 * Returns the JSON representation of specified object
 *
 * @param {object} obj
 * @return {string}
 *
 * @example
 *    [1,2,3]   =>  '[1,2,3]'
 *    { width: 10, height : 20 } => '{"height":10,"width":20}'
 */
function getJSON(obj) {
  return JSON.stringify(obj);
}


/**
 * Returns the object of specified type from JSON representation
 *
 * @param {Object} proto
 * @param {string} json
 * @return {object}
 *
 * @example
 *    const r = fromJSON(Circle.prototype, '{"radius":10}');
 *
 */
function fromJSON(proto, json) {
  const obj = JSON.parse(json);
  const values = Object.values(obj);
  return new proto.constructor(...values);
}


/**
 * Css selectors builder
 *
 * Each complex selector can consists of type, id, class, attribute, pseudo-class
 * and pseudo-element selectors:
 *
 *    element#id.class[attr]:pseudoClass::pseudoElement
 *              \----/\----/\----------/
 *              Can be several occurrences
 *
 * All types of selectors can be combined using the combination ' ','+','~','>' .
 *
 * The task is to design a single class, independent classes or classes hierarchy
 * and implement the functionality to build the css selectors using the provided cssSelectorBuilder.
 * Each selector should have the stringify() method to output the string representation
 * according to css specification.
 *
 * Provided cssSelectorBuilder should be used as facade only to create your own classes,
 * for example the first method of cssSelectorBuilder can be like this:
 *   element: function(value) {
 *       return new MySuperBaseElementSelector(...)...
 *   },
 *
 * The design of class(es) is totally up to you, but try to make it as simple,
 * clear and readable as possible.
 *
 * @example
 *
 *  const builder = cssSelectorBuilder;
 *
 *  builder.id('main').class('container').class('editable').stringify()
 *    => '#main.container.editable'
 *
 *  builder.element('a').attr('href$=".png"').pseudoClass('focus').stringify()
 *    => 'a[href$=".png"]:focus'
 *
 *  builder.combine(
 *      builder.element('div').id('main').class('container').class('draggable'),
 *      '+',
 *      builder.combine(
 *          builder.element('table').id('data'),
 *          '~',
 *           builder.combine(
 *               builder.element('tr').pseudoClass('nth-of-type(even)'),
 *               ' ',
 *               builder.element('td').pseudoClass('nth-of-type(even)')
 *           )
 *      )
 *  ).stringify()
 *    => 'div#main.container.draggable + table#data ~ tr:nth-of-type(even)   td:nth-of-type(even)'
 *
 *  For more examples see unit tests.
 */

class MyBuilder {
  constructor() {
    this.selector = {
      element: '',
      id: '',
      class: [],
      attr: [],
      pseudoClass: [],
      pseudoElement: '',
    };
    this.currentOrder = 0;
  }

  setValue(parameter, value) {
    if (['element', 'id', 'pseudoElement'].indexOf(parameter) >= 0) {
      this.selector[parameter] = value;
    } else {
      this.selector[parameter].push(value);
    }
    this.currentOrder = ['element', 'id', 'class', 'attr', 'pseudoClass', 'pseudoElement'].indexOf(parameter) + 1;
  }

  element(value) {
    if (this.selector.element) MyBuilder.uniqueError();
    if (this.currentOrder > 1) MyBuilder.orderError();
    else {
      this.selector.element = value;
      this.currentOrder = 1;
    }
    return this;
  }

  id(value) {
    if (this.selector.id) MyBuilder.uniqueError();
    if (this.currentOrder > 2) MyBuilder.orderError();
    else {
      this.selector.id = value;
      this.currentOrder = 2;
    }
    return this;
  }

  class(value) {
    if (this.currentOrder > 3) MyBuilder.orderError();
    else {
      this.selector.class.push(value);
      this.currentOrder = 3;
    }
    return this;
  }

  attr(value) {
    if (this.currentOrder > 4) MyBuilder.orderError();
    else {
      this.selector.attr.push(value);
      this.currentOrder = 4;
    }
    return this;
  }

  pseudoClass(value) {
    if (this.currentOrder > 5) MyBuilder.orderError();
    else {
      this.selector.pseudoClass.push(value);
      this.currentOrder = 5;
    }
    return this;
  }

  pseudoElement(value) {
    if (this.selector.pseudoElement) MyBuilder.uniqueError();
    else {
      this.selector.pseudoElement = value;
      this.currentOrder = 6;
    }
    return this;
  }

  stringify() {
    let result = '';
    if (this.selector.element) result += this.selector.element;
    if (this.selector.id) result += `#${this.selector.id}`;
    if (this.selector.class.length > 0) result += `.${this.selector.class.join('.')}`;
    if (this.selector.attr.length > 0) {
      this.selector.attr.map((attribute) => {
        result += `[${attribute}]`;
        return attribute;
      });
    }
    if (this.selector.pseudoClass.length > 0) result += `:${this.selector.pseudoClass.join(':')}`;
    if (this.selector.pseudoElement) result += `::${this.selector.pseudoElement}`;
    return result;
  }

  static uniqueError() {
    throw new Error('Element, id and pseudo-element should not occur more then one time inside the selector');
  }

  static orderError() {
    throw new Error('Selector parts should be arranged in the following order: element, id, class, attribute, pseudo-class, pseudo-element');
  }
}

const cssSelectorBuilder = {
  combinedText: '',

  element(value) {
    const myBuilder = new MyBuilder();
    myBuilder.setValue('element', value);
    return myBuilder;
  },

  id(value) {
    const myBuilder = new MyBuilder();
    myBuilder.setValue('id', value);
    return myBuilder;
  },

  class(value) {
    const myBuilder = new MyBuilder();
    myBuilder.setValue('class', value);
    return myBuilder;
  },

  attr(value) {
    const myBuilder = new MyBuilder();
    myBuilder.setValue('attr', value);
    return myBuilder;
  },

  pseudoClass(value) {
    const myBuilder = new MyBuilder();
    myBuilder.setValue('pseudoClass', value);
    return myBuilder;
  },

  pseudoElement(value) {
    const myBuilder = new MyBuilder();
    myBuilder.setValue('pseudoElement', value);
    return myBuilder;
  },

  combine(selector1, combinator, selector2) {
    const string1 = this.componentToString(selector1);
    const string2 = this.componentToString(selector2);
    this.combinedText = `${string1} ${combinator} ${string2}`;
    return this;
  },

  componentToString(component) {
    let str;
    if (component instanceof MyBuilder) {
      str = component.stringify();
    } else if (typeof component === 'object') {
      str = component.combinedText;
    } else {
      str = component;
    }
    return str;
  },

  stringify() {
    return this.combinedText;
  },
};

module.exports = {
  Rectangle,
  getJSON,
  fromJSON,
  cssSelectorBuilder,
};
