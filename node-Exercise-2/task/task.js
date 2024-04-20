const http = require('http');
require('dotenv').config();
const url = require('url');
const { handleRequest } = require('./routeHandler');
const { errorHandler } = require("./errorHandler");
const { Db } = require("./database");
const fs = require("fs").promises;
const path = require("path")

async function onStart() {
    const db = new Db();

    //create db
    await db.createDB();

    //create server
    const server = http.createServer((req, res) => {
        const parsedUrl = url.parse(req.url, true);

        if (parsedUrl.pathname.startsWith('/data') && req.method === "GET") {
            handleRequest(req, res);
        } else {
            const err = { statusCode: 404, message: "can't find api" }
            errorHandler(err, req, res);
        }
    });

    const PORT = process.env.PORT || 3000;

    server.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });

    //task steps execution
    await startStepsExecution();
};

async function startStepsExecution() {
    try {
        const allRecordsOptions = {
            hostname: 'localhost',
            port: 3000,
            path: '/data/all/',
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        };

        const fixedRecordsOptions = {
            hostname: 'localhost',
            port: 3000,
            path: '/data/fixed/',
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        }

        const recordOptions = {
            hostname: 'localhost',
            port: 3000,
            path: '',
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        }
        const allRecords = await sendReq(allRecordsOptions);
        const fixedRecords = await sendReq(fixedRecordsOptions);

        //sort fixedRecords by position
        fixedRecords.sort(function (a, b) {
            return a.position - b.position;
        })

        const finalRecords = [];

        let idx = 0;
        const allRecordsSize = allRecords.length;
        const fixedRecordsSize = fixedRecords.length;
        let pos = 1;

        for (let i = 0; i < allRecordsSize; ++i) {
            if (idx < fixedRecordsSize && fixedRecords[idx]["position"] == pos) {
                const index = allRecords.findIndex(function (element) {
                    return element._id == fixedRecords[idx]._id;
                });
                if (index != -1) {
                    fixedRecords[idx]["name"] = allRecords[index]["name"];
                }
                else {
                    recordOptions.path = `/data/_id?id=${fixedRecords[idx]._id}`;
                    try {
                        const record = await sendReq(recordOptions);
                        fixedRecords[idx]["name"] = record[0]["name"];
                    }
                    catch (e) {
                        i--;
                        idx++;
                        continue;
                    }
                }
                finalRecords.push(fixedRecords[idx]);
                idx++;
                i--;
                pos++;
            }
            else if (fixedRecords.findIndex(function (element) {
                return element._id == allRecords[i]._id;
            }) != -1) {
                continue;
            }
            else {
                finalRecords.push(allRecords[i]);
                pos++;
            }
        }

        while (idx < fixedRecordsSize) {
            const index = allRecords.findIndex(function (element) {
                return element._id == fixedRecords[idx]._id;
            });
            if (index != -1) {
                fixedRecords[idx]["name"] = allRecords[index]["name"];
            }
            else {
                recordOptions.path = `/data/_id?id=${fixedRecords[idx]._id}`;
                try {
                    const record = await sendReq(recordOptions);
                    fixedRecords[idx]["name"] = record[0]["name"];
                }
                catch (e) {
                    idx++;
                    console.log(e);
                    continue;
                }
            }
            finalRecords.push(fixedRecords[idx]);
            idx++;
        }

        await createOutput(finalRecords);
    } catch (e) {
        console.log(e);
    }
}

function sendReq(options) {
    return new Promise((resolve, reject) => {
        const req = http.request(options, (res) => {
            let data = '';

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                try {
                    const userData = JSON.parse(data);
                    if (res.statusCode == 200) {
                        resolve(userData);
                    } else {
                        reject(`Request failed with status code ${res.statusCode}`);
                    }
                } catch (error) {
                    reject(error);
                }
            });
        });

        req.on('error', (error) => {
            reject(error);
        });

        req.end();
    });
}

async function createOutput(finalRecords) {
    const finalObj = { output: finalRecords };

    try {
        const finalObj = { output: finalRecords };
        await fs.access(path.join(__dirname, 'output.json'));

        await fs.rm(path.join(__dirname, "output.json"), { recursive: true, force: true });
        await fs.writeFile(path.join(__dirname, 'output.json'), JSON.stringify(finalObj));
    } catch (error) {
        if (error.code === 'ENOENT') {
            await fs.writeFile(path.join(__dirname, 'output.json'), JSON.stringify(finalObj));
        } else {
            throw new Error("error creating database");
        }
    }
}

onStart();
