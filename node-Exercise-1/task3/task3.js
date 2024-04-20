const path = require("path");
const fs = require("fs");
const zlib = require("zlib");

const dirMap = new Map();

(async () => {
    await getAllDirSize(path.join(__dirname, "node_modules"));

    //convert size to kb
    // for (const [key, value] of dirMap.entries()) {
    //     dirMap.set(key, convertBytes(value));
    // }

    await createAndPopulateCSV();
    await compressCsv();
})();

// get size of every dir in a map
async function getAllDirSize(dirPath) {
    const files = await fs.promises.readdir(dirPath);
    dirMap.set(dirPath, 0);

    for (const file of files) {
        if ((await fs.promises.lstat(path.join(dirPath, file))).isDirectory()) {
            await getAllDirSize(path.join(dirPath, file));
            dirMap.set(dirPath, dirMap.get(path.join(dirPath)) + dirMap.get(path.join(dirPath, file)));
        } else {
            const fileSize = (await fs.promises.lstat(path.join(dirPath, file))).size;
            dirMap.set(dirPath, dirMap.get(dirPath) + fileSize);
        }
    }
}

//create zip file from csv
async function compressCsv() {
    try {
        const csvFilename = 'Output.csv';
        const zipFilename = 'Output.gzip';

        const gzip = zlib.createGzip();

        const inp = fs.createReadStream(path.join(__dirname, csvFilename));
        const out = fs.createWriteStream(path.join(__dirname, zipFilename));

        inp.pipe(gzip).pipe(out);
    }
    catch (e) {
        throw new Error(e);
    }
}

// create csv file and populate it with data
async function createAndPopulateCSV() {
    const csvFilename = 'Output.csv';
    let csvContent = "Directory,Size\n";

    for (const [key, value] of dirMap.entries()) {
        csvContent += `${key},${value}\n`;
    }

    try {
        await fs.promises.writeFile(path.join(__dirname, csvFilename), csvContent);
    } catch (error) {
        throw new Error(error);
    }
}

//convert bytes to kb size format
const convertBytes = function (bytes) {
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"]

    if (bytes == 0) {
        return "n/a"
    }
    const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)))
    if (i == 0) {
        return bytes + " " + sizes[i]
    }

    return (bytes / Math.pow(1024, i)).toFixed(1) + " " + sizes[i]
}
