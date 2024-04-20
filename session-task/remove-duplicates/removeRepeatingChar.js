// 1. streams - read files make new file such that each work on seperate line
// (() => {
//     const fs = require("fs");
//     const { join } = require("path");

//     const readFileName = "SIMPLETEXTFILE.txt";
//     const writeFileName = "ONEWORD.txt";

//     const readableStream = fs.createReadStream(join(__dirname, readFileName), {
//         highWaterMark: 1024,
//     });
//     const writableStream = fs.createWriteStream(join(__dirname, writeFileName));

//     let incompleteLine = "";

//     readableStream.on("data", (chunk) => {
//         console.log("***********************chunk received**********************");

//         const currentData = incompleteLine + chunk.toString();
//         const lines = currentData.split("\n");
//         incompleteLine = lines.pop();
//         console.log({ currentData, incompleteLine });
//         for (let line of lines) {
//             line = line.replace(/[,.]/g, '')
//             writableStream.write(`${line.split(' ').join('\n')}`);
//         }
//     });
// })();

// 2. create duplicate of a directory
// (async () => {
//     const fs = require("fs").promises;
//     const { existsSync } = require("fs");
//     const { join } = require("path");

//     try {
//         await copyDirectory(
//             join(__dirname, "TESTDIR"),
//             join(__dirname, "TESTDIR-COPY")
//         );
//     } catch (error) {
//         console.log(error)
//     }

//     async function copyDirectory(sourcePath, targetPath) {
//         if (!existsSync(targetPath)) {
//             await fs.mkdir(targetPath);
//         }

//         const directoryContent = await fs.readdir(sourcePath);

//         for (const file of directoryContent) {
//             const sourceDir = join(sourcePath, file);
//             const targetDir = join(targetPath, file);
//             const stat = await fs.lstat(sourceDir);

//             if (stat.isDirectory()) {
//                 await copyDirectory(sourceDir, targetDir);
//             } else {
//                 await fs.copyFile(sourceDir, targetDir);
//             }
//         }
//     }
// })();

// 3. encrypt and decrypt file
// (async () => {
//     const crypto = require("crypto");
//     const { promisify } = require("util");
//     const pbkdf2 = promisify(crypto.pbkdf2);
//     const fs = require("fs");

//     try {
//         const userPassword = "admin1234";
//         const salt = crypto.randomBytes(16);
//         const key = await pbkdf2(userPassword, salt, 100000, 32, "sha512");
//         const iv = crypto.randomBytes(16);
//         const algo = "aes-256-cbc";

//         await encryptFile({ algo, key, iv });
//         await decryptFile({ algo, key, iv });
//     } catch (error) {
//         console.error(error);
//     }

//     function encryptFile({ algo, key, iv }) {
//         return new Promise((resolve, reject) => {
//             const cipher = crypto.createCipheriv(algo, key, iv);
//             const input = fs.createReadStream("SIMPLETEXTFILE.txt");
//             const output = fs.createWriteStream("./OUTPUT/encrypted.enc");
//             // Idea is that you can create a chain of pipe if the output of the pipe is readable, duplex or transform stream.
//             input.pipe(cipher).pipe(output); // piped to a cryptographic transform stream

//             output.on("finish", () => {
//                 console.log("Encryption completed");
//                 resolve();
//             });

//             output.on("error", () => {
//                 console.log("Error while encryting");
//                 console.log(err);
//                 reject(err);
//             });
//         });
//     }

//     function decryptFile({ algo, key, iv }) {
//         return new Promise((resolve, reject) => {
//             const decipher = crypto.createDecipheriv(algo, key, iv);
//             const encryptedInput = fs.createReadStream("./OUTPUT/encrypted.enc");
//             const decryptedOutput = fs.createWriteStream("./OUTPUT/decrypted.txt");

//             encryptedInput.pipe(decipher).pipe(decryptedOutput);

//             decryptedOutput.on("finish", () => {
//                 console.log("Decryption completed");
//                 resolve();
//             });

//             decryptedOutput.on("error", () => {
//                 console.log("Error while decryption");
//                 reject(err)
//             });
//         });
//     }
// })()

// 4. additional question
const fs = require("fs").promises;
const { join } = require("path");
const fileName = "json.json"
const names = [
    "abc",
    "xyz",
    "pqr",
    "mno",
    "pqr",
    "abc",
    "pqr",
    "xyz",
    "pqr",
    "mno",
    "pqr",
    "abc",
    "mno",
    "pqr",
    "mno",
    "pqr",
    "xyz",
    "abc",
    "xyz",
    "pqr",
    "pqr",
    "def",
    "zew",
    "def",
    "zew",
    "pqr",
    "mno",
    "pqr",
    "abc",
    "mno",
    "xyz",
    "pqr",
    "mno",
    "pqr",
    "abc",
    "pqr",
    "xyz",
    "pqr",
    "mno",
    "pqr",
    "abc",
    "mno",
    "pqr",
    "mno",
    "pqr",
    "xyz",
    "abc",
    "xyz",
    "pqr",
    "pqr",
    "def",
    "zew",
    "def",
    "zew",
    "pqr",
    "mno",
    "pqr",
    "abc",
    "mno",
];
const newData = [];

async function fun(name) {
    try {
        const data = JSON.parse(
            (await fs.readFile(join(__dirname, fileName))).toString()
        );
        if (!data.find((ele) => ele.name === name)) {
            newData.push({
                id: Math.random(),
                name,
            });
            await fs.writeFile(
                join(__dirname, fileName),
                JSON.stringify(newData)
            );
        }
    } catch (e) {
        throw new Error(e)
    }
}

(async function () {
    try {
        await fs.writeFile(join(__dirname, fileName), JSON.stringify(newData));
        for (const name of names) {
            await fun(name);
        }
    } catch (error) {
        console.log(error)
    }
})();
