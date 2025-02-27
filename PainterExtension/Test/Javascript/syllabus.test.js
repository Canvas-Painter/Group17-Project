// This won't run on a chrome extension and if it is modified to do that it will
//  have to be imported like grademath
const fs = require('fs')

// This does not work as it is implemented as a module which should be fixed soon
// const test_mod = require('../../SideMenu/pdf_syllabus_scraper.js')

// This is going to be a sample test file because I don't understand how most of the functions
//  are supposed to work. Somebody more familiar will have to write the testsmodule

// Test that a pdf can be converted to text
test('To Text Test', () => {
    const file_data = fs.readFileSync('Test/Javascript/samples/2020_Adow_The Climate Debt.pdf')
    const bytes = new Uint8Array(file_data)
    //test_mod.pdfToText(bytes)
})
