const faker = require('faker')
const level = require('level')
const util = require('util')
const fs = require('fs')

let debuglog = util.debuglog('query')
let levelStore = level('./levelStore')
let knex = require('knex')({
  client: 'mysql2',
  connection: {
    host: 'rm-m5ey56z8u9u1ai1a8.mysql.rds.aliyuncs.com',
    user: 'root',
    database: 'test',
    password: 'q$86mNXOG%Pyc6fK'
  }
})

async function getCount() {
  console.time('getCount')
  let rs = await knex('kv_store').count('key')
  console.timeEnd('getCount')
  return rs[0]['count(`key`)']
}

async function randomKey(count) {
  let offset = Math.floor(Math.random() * count)
  let rs = await knex.select('key').from('kv_store').offset(offset).limit(1)
  return rs[0].key
}

async function prepareKeys(count) {
  let allKeyCount = await getCount()
  let keys = []
  for (let i = 0; i < count; ++i) {
    keys.push(await randomKey(count))
  }
  return keys
}

function getValue(key) {
  return knex('kv_store').where({key}).select('*')
}

function generateDoc() {
  let key = faker.random.uuid()
  let value = faker.internet.url()
  return {key, value}
}

function writeTable(doc) {
  return knex('kv_store').insert(doc)
}

function writeTableBatchLevel(count) {
  let docs = []
  for (let i = 0; i < count; ++i) {
    let doc = generateDoc()
    doc.type = 'put'
    docs.push(doc)
  }
  return levelStore.batch(docs)
}

function writeTableBatch(count) {
  let docs = []
  for (let i = 0; i < count; ++i) {
    docs.push(generateDoc())
  }
  return knex('kv_store').insert(docs)
}

exports.testInsertMulti = async function testInsert(count, n) {
  let beginCount = await getCount()
  console.log('insert begin ...')
  console.time('insert')
  for (let i = 0; i < n; ++i) {
    let label = `insert ${count}: ${beginCount + count * i}`
    console.time(label)
    await writeTableBatch(count)
    console.timeEnd(label)
  }
  console.timeEnd('insert')
}

exports.testInsert = async function testInsert(count, n) {
  let beginCount = await getCount()
  console.log('insert begin ...')
  let label = `insert ${count}: ${beginCount}`
  console.time(label)
  let st = Date.now()
  await writeTableBatch(count)
  console.timeEnd(label)

  logToFile('insert', beginCount, Date.now() - st)
}

exports.testQuery = async function testQuery(n) {
  let beginCount = await getCount()
  let keys = await prepareKeys(n)
  console.log('query begin ...')
  console.time('query')
  let st = Date.now()
  let rs = await Promise.all(keys.map((key) => {
    return getValue(key)
  }))
  debuglog(rs)
  console.timeEnd('query')

  logToFile('query', beginCount, Date.now() - st)
}

let db = {
  query: [],
  insert: []
}

function logToFile(type, count, dt) {
  db[type].push({count, dt})
}

exports.db = db

/*
test(count).then(() => {
  console.log('ok')
}).catch(console.error)
*/
