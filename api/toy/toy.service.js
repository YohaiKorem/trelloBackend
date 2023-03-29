const dbService = require('../../services/db.service')
const logger = require('../../services/logger.service')
const utilService = require('../../services/util.service')
const { ObjectId } = require('mongodb')

async function query(filterBy = { txt: '' }, paging = {}) {
  try {
    const criteria = {
      title: { $regex: filterBy.txt, $options: 'i' },
    }
    let { pageIdx, PAGE_SIZE } = paging
    const collection = await dbService.getCollection('board')
    const totalBoards = await collection.countDocuments()
    const lastPage = Math.ceil(totalBoards / PAGE_SIZE) - 1
    const totalPages = Math.ceil(totalBoards / PAGE_SIZE)
    if (pageIdx >= totalPages) pageIdx = 0
    else if (pageIdx < 0) pageIdx = lastPage
    var boards = await collection
      .find(criteria)
      .skip(pageIdx * PAGE_SIZE)
      .limit(PAGE_SIZE)
      .toArray()
    return boards
  } catch (err) {
    logger.error('cannot find boards', err)
    throw err
  }
}

async function getById(boardId) {
  console.log(boardId)
  try {
    const collection = await dbService.getCollection('board')
    const board = collection.findOne({ _id: new ObjectId(boardId) })
    return board
  } catch (err) {
    logger.error(`while finding board ${boardId}`, err)
    throw err
  }
}

async function remove(boardId) {
  try {
    const collection = await dbService.getCollection('board')
    await collection.deleteOne({ _id: new ObjectId(boardId) })
  } catch (err) {
    logger.error(`cannot remove board ${boardId}`, err)
    throw err
  }
}

async function add(board) {
  try {
    const collection = await dbService.getCollection('board')
    await collection.insertOne(board)
    return board
  } catch (err) {
    logger.error('cannot insert board', err)
    throw err
  }
}

async function update(board) {
  try {
    const boardToSave = {
      title: board.title,
      groups: board.groups,
      members: board.members,
      activities: board.activities,
      isStarred: board.isStarred,
      labels: board.labels,
      archivedAt: board.archivedAt,
      createdBy: board.createdBy,
      style: board.style,
    }
    const collection = await dbService.getCollection('board')
    await collection.updateOne(
      { _id: new ObjectId(board._id) },
      { $set: boardToSave }
    )
    return board
  } catch (err) {
    logger.error(`cannot update board ${board._id}`, err)
    throw err
  }
}

async function updateBoardMsg(msg, boardId) {
  try {
    await removeBoardMsg(boardId, msg.id)
    await addBoardMsg(boardId, msg)
    return msg
  } catch (err) {
    console.log(err, `cannot update board with msg ${msg}`)
    throw err
  }
}

async function addBoardMsg(boardId, msg) {
  try {
    if (!msg.id) msg.id = utilService.makeId()
    console.log(boardId)
    const collection = await dbService.getCollection('board')
    await collection.updateOne(
      { _id: new ObjectId(boardId) },
      { $push: { msgs: msg } }
    )
    return msg
  } catch (err) {
    logger.error(`cannot add board msg ${msg}`, err)
    throw err
  }
}

async function removeBoardMsg(boardId, msgId) {
  try {
    const collection = await dbService.getCollection('board')
    await collection.updateOne(
      { _id: new ObjectId(boardId) },
      { $pull: { msgs: { id: msgId } } }
    )
    return msgId
  } catch (err) {
    logger.error(`cannot remove board msg ${msgId}`, err)
    throw err
  }
}

module.exports = {
  remove,
  query,
  getById,
  add,
  update,
  updateBoardMsg,
  addBoardMsg,
  removeBoardMsg,
}
