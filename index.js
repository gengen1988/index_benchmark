const lib = require('./lib')
const fs = require('fs')

let count = 100000  // 十万
let queryCount = 1000

async function test(n) {
  for (let i = 0; i < n; ++i) {
    console.log('======= insert =======');
    let dt = await lib.testInsert(count)
    console.log('======= query =======');
    await lib.testQuery(queryCount)
  }
  console.log('done');
}

test(10).then(() => {
  console.log(lib.db);
  fs.writeFileSync('result.json', JSON.stringify(lib.db, null, 2))
})
