const level = require('level')

let db = level('./levelStore')

let count = 0

console.time('count')

db.createReadStream()
  .on('data', () => ++count)
  .on('end', () => {
    console.log(count)
    console.timeEnd('count')
  })
