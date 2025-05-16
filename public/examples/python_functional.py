# Example Python script demonstrating functional programming concepts

def factorial(n):
    """
    Calculate factorial using recursion
    A pure function example
    """
    if n <= 1:
        return 1
    return n * factorial(n - 1)

# Higher-order function example
def apply_twice(func, value):
    """Apply a function twice to a value"""
    return func(func(value))

def add_five(x):
    """Add 5 to a number"""
    return x + 5

# Using the higher-order function
result = apply_twice(add_five, 10)
print(f"After applying add_five twice to 10: {result}")  # Should print 20

# Lambda expressions
numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
even_numbers = list(filter(lambda x: x % 2 == 0, numbers))
squared_numbers = list(map(lambda x: x * x, numbers))

print(f"Even numbers: {even_numbers}")
print(f"Squared numbers: {squared_numbers}")

# Function composition
def compose(*functions):
    """
    Create a new function that is the composition of the given functions
    The rightmost function is applied first
    """
    def inner(x):
        result = x
        for func in reversed(functions):
            result = func(result)
        return result
    return inner

# Example functions to compose
def double(x):
    return x * 2

def increment(x):
    return x + 1

def square(x):
    return x * x

# Compose functions: first square, then increment, then double
composed_function = compose(double, increment, square)
print(f"composed_function(5) = {composed_function(5)}")  # ((5^2) + 1) * 2 = 52

# List comprehensions (a functional programming feature in Python)
cubes = [n**3 for n in range(1, 11)]
print(f"Cubes of numbers 1-10: {cubes}")

# Using reduce (a functional programming concept)
from functools import reduce

# Sum all numbers using reduce
sum_of_numbers = reduce(lambda x, y: x + y, numbers)
print(f"Sum of {numbers} = {sum_of_numbers}")

# Product of all numbers using reduce
product_of_numbers = reduce(lambda x, y: x * y, numbers)
print(f"Product of {numbers} = {product_of_numbers}")

# Immutable data structures
original_tuple = (1, 2, 3)
new_tuple = original_tuple + (4, 5)

print(f"Original tuple: {original_tuple}")
print(f"New tuple: {new_tuple}")

# Memoization example
def memoize(func):
    """
    Memoization decorator
    Caches the results of function calls to avoid recalculation
    """
    cache = {}
    def wrapper(*args):
        if args in cache:
            print(f"Fetching {args} from cache")
            return cache[args]
        result = func(*args)
        cache[args] = result
        return result
    return wrapper

@memoize
def fibonacci(n):
    """Calculate the nth Fibonacci number recursively"""
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)

# This will calculate fibonacci(10) efficiently using memoization
print(f"Fibonacci of 10: {fibonacci(10)}")
print(f"Fibonacci of 5: {fibonacci(5)}")  # This should use the cache
