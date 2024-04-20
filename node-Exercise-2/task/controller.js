const { Db } = require("./database");
const crypto = require("crypto");
const url = require('url');
const { errorHandler } = require("./errorHandler");

async function handleFetchAllRecords(req, res) {
    const selectedRecords = await getSomeRecords(1000);

    // return selectedRecords;

    res.setHeader('Content-Type', 'application/json');
    res.writeHead(200);
    res.end(JSON.stringify(selectedRecords));
}

async function handleFetchFixedRecords(req, res) {
    const selectedRecords = await getSomeRecords(80);

    populateData(selectedRecords, 0);
    populateDataWithPosition(selectedRecords);

    //remove name property from selectedRecords
    selectedRecords.map(obj => delete obj.name);

    // return selectedRecords;

    res.setHeader('Content-Type', 'application/json');
    res.writeHead(200);
    res.end(JSON.stringify(selectedRecords));
}

async function handleFetchRecordById(req, res) {
    const parsedUrl = url.parse(req.url, true);
    const { pathname, query } = parsedUrl;
    const id = query.id;

    const db = new Db();
    await db.loadDatabase();

    const recordsArray = db.recordsArray;
    // console.log(recordsArray);

    const selectedRecords = recordsArray.filter((obj) => {
        return obj._id == id;
    });
    // console.log(selectedRecords);

    if (!selectedRecords.length) {
        const err = { statusCode: 404, message: "record by id doesn't exists" };
        errorHandler(err, req, res);

        return;

        // throw new Error("record by id doesn't exists");
    }

    // return selectedRecords;
    
    res.setHeader('Content-Type', 'application/json');
    res.writeHead(200);
    res.end(JSON.stringify(selectedRecords));
}

function populateDataWithPosition(recordsArray) {
    const recordsSize = recordsArray.length;
    let idx = 0;
    const mp = new Map();

    while (idx < recordsSize) {
        const pos = Math.floor(Math.random() * 1000) + 1;
        if (mp.has(pos)) {
            continue;
        }

        recordsArray[idx]["position"] = pos;
        mp.set(pos, true);
        idx++;
    }
}

function shuffleArray(array) {
    const recordsSize = array.length - 1;
    for (let i = recordsSize; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }

    return array;
}

function generateId() {
    return crypto.randomBytes(16).toString('hex');
}

async function getSomeRecords(n) {
    const db = new Db();

    await db.loadDatabase();
    const recordsArray = db.recordsArray;

    const shuffledRecords = shuffleArray(recordsArray);
    const selectedRecords = shuffledRecords.slice(0, n);

    return selectedRecords;
}

function populateData(recordsArray, recordsCount) {
    if (recordsCount === 20) {
        return;
    }

    const _id = generateId();

    const record = {
        _id: _id,
    }
    recordsArray.push(record);
    recordsCount++;
    populateData(recordsArray, recordsCount);
}

module.exports = { handleFetchAllRecords, handleFetchFixedRecords, handleFetchRecordById };
