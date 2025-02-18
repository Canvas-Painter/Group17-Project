const math = require("../../GradeBook/math")

const sample1 = [1, 2, 3]
const sample2 = [-3, 2, 2, 5, -1, -1, -1, -4, 6, -1]
const sample3 = [-33, 0, -46, -34, 2, 11, -32, 14, -22, -18, -16, -58, -44, -56, -41, -42, -14, 9, 25, 20, -58, -51, -36, -37, -35]

test('Mean Test 1', () => {
    expect(math.mean(sample1))
        .toBeCloseTo(2)
})

test('Mean Test 2', () => {
    expect(math.mean(sample2))
        .toBeCloseTo(0.4)
})

test('Mean Test 3', () => {
    expect(math.mean(sample3))
        .toBeCloseTo(-23.68)
})

