// Simpple mean function that sums the data then divides by length
function mean(data) {
    let res = 0
    data.forEach(value => {
        res += value
    });

    res /= data.length

    return res
}

// Standard deviation calculator using the mean
// Defaults to a population standard deviation
function stdDev(data, pop=false) {
    const mu = mean(data)

    let total = 0
    data.forEach(value => {
        let curr = mu + value

        total += curr * curr
    });

    if (pop) {
       total /= data.length
    } else {
        total /= data.length - 1
    }

    return Math.sqrt(total)
}