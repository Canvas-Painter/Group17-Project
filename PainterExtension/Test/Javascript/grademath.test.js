const imp = require('./import.js')

// This is how you import
// I don't know a better way
eval(imp.test_import('../../GradeBook/math.js'))

// Smaple distributions to calculate stuff on
const sample1 = [1, 2, 3]
const sample2 = [-3, 2, 2, 5, -1, -1, -1, -4, 6, -1]
const sample3 = [-33, 0, -46, -34, 2, 11, -32, 14, -22, -18, -16, -58, -44, -56, -41, -42, -14, 9, 25, 20, -58, -51, -36, -37, -35]
const sample4 = [-1, -2, -3]


// These check that the means are valid
test('Mean Test 1', () => {
    expect(mean(sample1))
        .toBeCloseTo(2)
})

test('Mean Test 2', () => {
    expect(mean(sample2))
        .toBeCloseTo(0.4)
})

test('Mean Test 3', () => {
    expect(mean(sample3))
        .toBeCloseTo(-23.68)
})

test('Mean Test 4', () => {
    expect(mean(sample4))
        .toBeCloseTo(-2)
})

// These check both the population and sample std. dev. of the distributions
test('StdDev Test 1', () => {
    expect(stdDev(sample1, false))
        .toBeCloseTo(1)
    expect(stdDev(sample1, true))
        .toBeCloseTo(0.816496580927726)
})

test('StdDev Test 2', () => {
    expect(stdDev(sample2, false))
        .toBeCloseTo(3.272783388968954)
    expect(stdDev(sample2, true))
        .toBeCloseTo(3.104834939252005)
})

test('StdDev Test 3', () => {
    expect(stdDev(sample3, false))
        .toBeCloseTo(25.64943144269154)
    expect(stdDev(sample3, true))
        .toBeCloseTo(25.131207690837304)
})

test('StdDev Test 4', () => {
    expect(stdDev(sample1, false))
        .toBeCloseTo(1)
    expect(stdDev(sample1, true))
        .toBeCloseTo(0.816496580927726)
})

