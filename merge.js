const r1 = require('./result1')
const r2 = require('./result2')
const r3 = require('./result3')
const fs = require('fs')

const insert = []
const query = []

function transfer(target) {
  return function(doc) {
    target.push(doc)
  }
}

r1.insert.forEach(transfer(insert))
r2.insert.forEach(transfer(insert))
r3.insert.forEach(transfer(insert))

r1.query.forEach(transfer(query))
r2.query.forEach(transfer(query))
r3.query.forEach(transfer(query))

fs.writeFileSync('insert.json', JSON.stringify(insert, null, 2))
fs.writeFileSync('query.json', JSON.stringify(query, null, 2))
