const readline = require('readline');
const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');
const util = require('util');

const pbkdf2Async = util.promisify(crypto.pbkdf2);

class Task2 {
    constructor(inputs) {
        this.userName = inputs[1];
        this.password = inputs[2];
        this.usersObj = {};
    }

    async createDatabase() {
        try {
            await fs.access(path.join(__dirname, 'database.json'));
            const data = await fs.readFile(path.join(__dirname, "database.json"), 'utf-8');

            if (!data) {
                await fs.writeFile(path.join(__dirname, 'database.json'), "{}");
            }
        } catch (error) {
            if (error.code === 'ENOENT') {
                await fs.writeFile(path.join(__dirname, 'database.json'), "{}");
            } else {
                throw new Error("error creating database");
            }
        }
    }

    validateAction(action) {
        if (action.toLowerCase() != "login" && action.toLowerCase() != "signup") {
            throw new Error("please enter valid action(either login or signup)");
        }
    }

    validateUsername(username) {
        if (!(username.trim() !== '' && !/\d/.test(username))) {
            throw new Error("please enter valid username(should not be empty and should not contain numbers)");
        }
    }

    validatePassword(password) {
        if (!(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(password)) || !password) {
            throw new Error("please enter valid password(should be greater than 8 characters and contain atleast one uppercase and one lowercase letter)");

        }
    }

    validateInputLength(inputs) {
        if (inputs.length < 3) {
            throw new Error("please provide 3 single space separated inputs only");
        }
    }

    validateEmptyInput(inputs) {
        if (!inputs[0] || !inputs[1] || !inputs[2]) {
            throw new Error("please enter single space separated values only");
        }
    }

    async validateDuplicateUser(username) {
        await this.loadDatabase();

        if (this.usersObj.hasOwnProperty(username)) {
            throw new Error("Username already exists(please choose a different username)");
        }
    }

    async loadDatabase() {
        try {
            const data = await fs.readFile(path.join(__dirname, "database.json"), 'utf-8');
            this.usersObj = JSON.parse(data);
        } catch (e) {
            throw new Error("error loading database");
        }
    }

    async validateInputs(inputs) {
        this.validateInputLength(inputs);
        this.validateEmptyInput(inputs);
        this.validateAction(inputs[0]);
        this.validateUsername(inputs[1]);
        this.validatePassword(inputs[2]);
    }

    async login() {
        await this.loadDatabase();

        const hashedPassword = this.usersObj[this.userName];
        if (!hashedPassword) {
            throw new Error('User not found');
        }

        const isValid = await this.comparePasswords(hashedPassword);
        if (!isValid) {
            throw new Error('Incorrect password');
        }
        console.log('\n', 'Welcome,', this.userName, '\n');
    }

    async comparePasswords(hashedPassword) {
        const [salt, originalHash] = hashedPassword.split(':');

        try {
            const tempHash = await pbkdf2Async(this.password, salt, 1000, 64, 'sha512');
            const hash = tempHash.toString('hex');
            return hash === originalHash;
        } catch (error) {
            throw new Error("error hashing password");
        }
    }

    async saveDatabase() {
        try {
            await fs.writeFile(path.join(__dirname, "database.json"), JSON.stringify(this.usersObj));
        } catch (e) {
            throw new Error("error updating database");
        }
    }

    async signup() {
        await this.loadDatabase();

        const hashedPassword = await this.hashPassword();
        this.usersObj[this.userName] = hashedPassword;

        await this.saveDatabase();
        console.log('\n', 'Congratulations! Sign up complete', '\n');
    }

    async hashPassword() {
        const salt = crypto.randomBytes(16).toString('hex');

        try {
            const tempHash = await pbkdf2Async(this.password, salt, 1000, 64, 'sha512');
            const hash = tempHash.toString('hex');
            return `${salt}:${hash}`;
        } catch (error) {
            throw new Error('Error hashing password');
        }
    }
};

(async function startExecution() {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    rl.question('Enter action, username, and password(please enter single space separated values for action, username and password and hit enter. For action you could either choose login or signup): ', async (input) => {
        const inputs = input.split(' ');

        const task = new Task2(inputs);

        await task.validateInputs(inputs);
        await task.createDatabase();

        if (inputs[0].toLowerCase() == "login") {
            await task.login();
        }
        else {
            await task.validateDuplicateUser(inputs[1]);
            await task.signup();
        }

        rl.close();

        startExecution();
    });
})()
