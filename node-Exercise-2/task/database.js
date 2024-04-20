const crypto = require('crypto');
const path = require("path");
const fs = require("fs").promises;

class Db {
    constructor() {
        this.recordsArray = [];
        this.recordsCount = 0;
    }

    async loadDatabase() {
        try {
            const data = await fs.readFile(path.join(__dirname, "input.json"), 'utf-8');

            this.recordsArray = [...this.recordsArray, ...JSON.parse(data)["input"]];
        } catch (e) {
            throw new Error("error loading database");
        }
    }

    async createDB() {
        try {
            await fs.access(path.join(__dirname, 'input.json'));
        } catch (error) {
            if (error.code === 'ENOENT') {
                await fs.writeFile(path.join(__dirname, 'input.json'), "");
                await this.populateData();
            } else {
                throw new Error("error creating database");
            }
        }
    }

    generateName(length, charactersLength, characters) {
        let result = '';
        for (let i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }

        return result;
    }

    generateId() {
        return crypto.randomBytes(16).toString('hex');
    }

    async populateData() {
        if (this.recordsCount === 2000) {
            try {
                const recordsObj = { input: this.recordsArray };
                await fs.writeFile(path.join(__dirname, 'input.json'), JSON.stringify(recordsObj));
            } catch (error) {
                throw new Error("Error populating database");
            }

            return;
        }

        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
        const charactersLength = characters.length;
        const lengthToGenerate = Math.floor(Math.random() * charactersLength) + 1;

        const name = this.generateName(lengthToGenerate, charactersLength, characters);
        const _id = this.generateId();

        const record = {
            _id: _id,
            name: name
        }
        this.recordsArray.push(record);
        this.recordsCount++;
        this.populateData();
    }
}

module.exports = { Db };
