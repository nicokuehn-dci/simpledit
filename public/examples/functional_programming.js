/**
 * Example file for the text editor
 * This file demonstrates various JavaScript concepts
 * including functional programming, lambda expressions,
 * recursion, and higher-order functions.
 */

// Example of a pure function
function add(a, b) {
  return a + b;
}

// Example of a higher-order function
function multiplier(factor) {
  // Returns a lambda function
  return (number) => number * factor;
}

// Using the higher-order function
const double = multiplier(2);
const triple = multiplier(3);

console.log(double(5));  // 10
console.log(triple(5));  // 15

// Example of recursion
function factorial(n) {
  // Base case
  if (n <= 1) {
    return 1;
  }
  
  // Recursive case
  return n * factorial(n - 1);
}

console.log(factorial(5));  // 120

// Array functions with lambdas
const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

const evenNumbers = numbers.filter(num => num % 2 === 0);
console.log(evenNumbers);  // [2, 4, 6, 8, 10]

const squaredNumbers = numbers.map(num => num * num);
console.log(squaredNumbers);  // [1, 4, 9, 16, 25, 36, 49, 64, 81, 100]

const sum = numbers.reduce((acc, num) => acc + num, 0);
console.log(sum);  // 55

// Functional composition
const compose = (...fns) => x => fns.reduceRight((val, fn) => fn(val), x);

const addOne = x => x + 1;
const square = x => x * x;
const divideByTwo = x => x / 2;

const computeValue = compose(divideByTwo, square, addOne);

console.log(computeValue(5));  // ((5 + 1) ^ 2) / 2 = 18

// Currying example
const curry = (fn) => {
  const arity = fn.length;
  return function curried(...args) {
    if (args.length >= arity) {
      return fn.apply(this, args);
    }
    return (...moreArgs) => {
      return curried.apply(this, args.concat(moreArgs));
    };
  };
};

const curriedAdd = curry((a, b, c) => a + b + c);
console.log(curriedAdd(1)(2)(3));  // 6
console.log(curriedAdd(1, 2)(3));  // 6
console.log(curriedAdd(1)(2, 3));  // 6

// Memoization for performance optimization
function memoize(fn) {
  const cache = {};
  return (...args) => {
    const key = JSON.stringify(args);
    if (key in cache) {
      console.log('Fetching from cache');
      return cache[key];
    }
    const result = fn.apply(this, args);
    cache[key] = result;
    return result;
  };
}

// Using memoization with expensive calculation
const memoizedFactorial = memoize(factorial);
console.log(memoizedFactorial(5));  // Calculated
console.log(memoizedFactorial(5));  // Fetched from cache

// Using lambdas with setTimeout
setTimeout(() => {
  console.log('This message appears after 1 second');
}, 1000);

// Immutable data structures
const original = { a: 1, b: 2 };
const modified = { ...original, c: 3 };  // Spread operator for immutability

console.log(original);  // { a: 1, b: 2 }
console.log(modified);  // { a: 1, b: 2, c: 3 }

// Function as first-class citizens
function applyOperation(a, b, operation) {
  return operation(a, b);
}

console.log(applyOperation(5, 3, (a, b) => a + b));  // 8
console.log(applyOperation(5, 3, (a, b) => a - b));  // 2
console.log(applyOperation(5, 3, (a, b) => a * b));  // 15
