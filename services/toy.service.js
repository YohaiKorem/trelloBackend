const fs = require('fs')
const gToys = require('../data/toy.json')
module.exports = {
  query,
  getById,
  remove,
  save,
}

const PAGE_SIZE = 100

function query(filterBy = { txt: '', price: 0 }, paging = {}) {
  let { pageIdx, PAGE_SIZE } = paging

  const regex = new RegExp(filterBy.txt, 'i')
  var toys = gToys.filter((toy) => regex.test(toy.name))
  if (filterBy.price) {
    toys = toys.filter((toy) => {
      return toy.price < filterBy.price
    })
  }

  if (pageIdx >= Math.ceil(toys.length / PAGE_SIZE)) {
    pageIdx = 0
  }
  if (pageIdx <= 0) {
    pageIdx = Math.ceil(toys.length / PAGE_SIZE) - 1
  }
  let startFrom = pageIdx * PAGE_SIZE
  toys = toys.slice(startFrom, startFrom + PAGE_SIZE)

  return Promise.resolve(toys)
}

function getById(toyId) {
  const toy = gToys.find((toy) => toy._id === toyId)
  if (!toy) return Promise.reject('Unknonwn toy')
  return Promise.resolve(toy)
}

function remove(toyId, loggedinUser) {
  const idx = gToys.findIndex((toy) => toy._id === toyId)
  if (idx === -1) return Promise.reject('Unknonwn toy')
  //   if (gToys[idx].owner._id !== loggedinUser._id)
  //     return Promise.reject('Not your toy')

  gToys.splice(idx, 1)
  return _saveToysToFile()
}

function save(toy, loggedinUser) {
  var savedToy
  if (toy._id) {
    savedToy = gToys.find((currToy) => currToy._id === toy._id)
    if (!savedToy) return Promise.reject('Unknonwn toy')
    // if (savedToy.owner._id !== loggedinUser._id)
    // return Promise.reject('Not your toy')

    savedToy.name = toy.name
    savedToy.price = toy.price
    savedToy.labels = toy.labels
    savedToy.createdAt = toy.createdAt
    savedToy.inStock = toy.inStock
  } else {
    savedToy = {
      _id: _makeId(),
      owner: loggedinUser,
      name: toy.name,
      price: toy.price,
      labels: toy.labels,
      createdAt: Date.now(),
      inStock: true,
    }
    gToys.push(savedToy)
  }
  return _saveToysToFile().then(() => {
    return savedToy
  })
}

function _makeId(length = 5) {
  var txt = ''
  var possible =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  for (let i = 0; i < length; i++) {
    txt += possible.charAt(Math.floor(Math.random() * possible.length))
  }
  return txt
}

function _saveToysToFile() {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(gToys, null, 2)

    fs.writeFile('data/toy.json', data, (err) => {
      if (err) return reject(err)
      resolve()
    })
  })
}
