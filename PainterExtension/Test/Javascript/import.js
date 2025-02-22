const fs = require('fs')
const paths = require('path')

// This must eval'd
function test_import(path) {
    const code = fs.readFileSync(paths.join(__dirname, path))
    return code
}

module.exports = {
    test_import: test_import
}
