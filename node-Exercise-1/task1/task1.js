const fs = require('fs');
const path = require('path');
const { Readable } = require('stream');

const letterCount = {};

// create output dir
(async function handleCreateOutputDir() {
    try {
        const dirName = './Output';
        if (!await checkExists(path.join(__dirname, dirName))) {
            await fs.promises.mkdir(path.join(__dirname, dirName));
        } else {
            fs.rmdirSync(path.join(__dirname, dirName), { recursive: true, force: true });
            await fs.promises.mkdir(path.join(__dirname, dirName));
        }
    } catch (e) {
        throw new Error(e);
    }
})();

//create Output.json
(async function handleCreateOutputJson() {
    const jsonFilename = 'Output.json';

    try {
        if (!await checkExists(path.join(__dirname, jsonFilename))) {
            await fs.promises.writeFile(path.join(__dirname, jsonFilename), "");
        } else {
            // await fs.promises.rm(path.join(__dirname, jsonFilename), { recursive: true, force: true });
            await fs.promises.writeFile(path.join(__dirname, jsonFilename), "");
        }
    } catch (err) {
        throw new Error('Error creating file:', err);
    }
})();

// read content from input.txt, create file and update output.json
(async function readContenFromInputNdCreateFiles() {
    const inputFilename = "input.txt";

    //using stream
    try {
        let string = '';
        const readableStream = fs.createReadStream(path.join(__dirname, inputFilename));

        await new Promise((resolve, reject) => {
            readableStream.on('data', function (data) {
                string += data.toString();
            });

            readableStream.on('end', function () {
                resolve();
            });

            readableStream.on('error', function (error) {
                reject(error);
            });
        });

        createLetterCountMap(string);

        // iterate through the input file characters
        for (const key in letterCount) {
            //check if folder already exists inside Output dir
            if (!await checkExists(path.join(__dirname, "Output/", letterCount[key].toString()))) {
                await fs.promises.mkdir(path.join(__dirname, "Output/", letterCount[key].toString()));
            }
            await createFile(key);
        }

        await updateOutputJson(letterCount);

        // const data = await fs.promises.readFile(path.join(__dirname, inputFilename), 'utf-8');
        // createLetterCountMap(string);

        // // iterate through the input file characters
        // for (const key of letterCount) {
        //     //check if folder already exists inside Output dir
        //     if (!await checkExists(path.join(__dirname, "Output/", letterCount[key].toString()))) {
        //         await fs.promises.mkdir(path.join(__dirname, "Output/", letterCount[key].toString()));
        //     }
        //     await createFile(key);
        // }

        // await updateOutputJson(letterCount);
    } catch (error) {
        throw new Error(`Got an error trying to read the file: ${error.message}`);
    }
})();

// update the output json file
async function updateOutputJson(letterCount) {
    // using stream
    try {
        const jsonObj = { "Output": {} };

        for (const key in letterCount) {
            const content = path.relative(__dirname, path.join(__dirname, "Output", letterCount[key].toString(), `${key}.txt`));
            if (!jsonObj["Output"][letterCount[key]]) {
                jsonObj["Output"][letterCount[key]] = {};
            }
            jsonObj["Output"][letterCount[key]][key + ".txt"] = content;
        }

        const readableStream = Readable.from(JSON.stringify(jsonObj));
        const writableStream = fs.createWriteStream(path.join(__dirname, "Output.json"));

        readableStream.on('error', function (error) {
            console.error(`Error reading from string: ${error.message}`);
        });

        writableStream.on('error', function (error) {
            console.error(`Error writing to file: ${error.message}`);
        });

        readableStream.pipe(writableStream);
    }
    catch (e) {
        throw new Error(e);
    }

    // try {
    //     const jsonObj = { "Output": {} };
    //     for (const key in letterCount) {
    //         const content = path.relative(__filename, path.join(__dirname, "Output", letterCount[key].toString(), `${key}.txt`));
    //         if (!jsonObj["Output"][letterCount[key]]) {
    //             jsonObj["Output"][letterCount[key]] = {};
    //         }
    //         jsonObj["Output"][letterCount[key]][key + ".txt"] = content;
    //     }

    //     await fs.promises.writeFile(path.join(__dirname, "Output.json"), JSON.stringify(jsonObj));
    // } catch (e) {
    //     throw new Error(e);
    // }
}

// keep count of every letter
function createLetterCountMap(str) {
    str = str.toLowerCase();

    for (let char of str) {
        if (/[a-z]/.test(char)) {
            letterCount[char] = (letterCount[char] || 0) + 1;
        }
    }
}

// creates nested files
async function createFile(key) {
    const content = path.relative(__dirname, path.join(__dirname, "Output", letterCount[key].toString(), `${key}.txt`));
    const pathName = path.join(__dirname, "Output", letterCount[key].toString(), `${key}.txt`);

    try {
        await fs.promises.writeFile(pathName, content);
    } catch (err) {
        console.error('Error creating file:', err);
        throw new Error(err);
    }
}

// check if file/dir exists
async function checkExists(path) {
    try {
        await fs.promises.access(path);
        return true;
    }
    catch (error) {
        if (error.code === 'ENOENT') {
            return false;
        } else {
            throw new Error("error creating database");
        }
    }
}
