const inquirer = require("inquirer");
const chalk = require("chalk");
const fs = require("fs");

Operation();

function Operation() {
    inquirer
        .prompt([
            {
                type: "list",
                name: "action",
                message: "O que você deseja fazer?",
                choices: [
                    "Criar conta",
                    "Consultar saldo",
                    "Depositar",
                    "Sacar",
                    "Sair",
                ],
            },
        ])
        .then((answers) => {
            const action = answers["action"];

            if (action === "Criar conta") {
                createAccount();
            } else if (action === "Consultar saldo") {
                getAccountBalance();
            } else if (action === "Depositar") {
                deposit();
            } else if (action === "Sacar") {
                withdraw();
            } else if (action === "Sair") {
                console.log(
                    chalk.bgBlue.black("Obrigado por usar o Accounts!"),
                );
                process.exit();
            }
        })
        .catch((err) => console.log(err));
}

function createAccount() {
    console.log(chalk.bgGreen.black("Parabéns por escolher nosso banco!"));
    console.log(chalk.green("Defina as opções da sua conta a seguir"));
    buildAccount();
}

function buildAccount() {
    inquirer
        .prompt([
            {
                name: "accountName",
                message: "Digite um nome para a sua conta:",
            },
        ])
        .then((answer) => {
            const accountName = answer["accountName"];

            if (!fs.existsSync("accounts")) {
                fs.mkdirSync("accounts");
            }
            if (fs.existsSync(`accounts/${accountName}.json`)) {
                console.log(
                    chalk.bgRed.black(
                        "Esta conta já existe, escolha outro nome!",
                    ),
                );
                buildAccount();
                return;
            }
            fs.writeFileSync(
                `accounts/${accountName}.json`,
                '{"balance": 0}',
                function (err) {
                    console.log(err);
                },
            );
            console.log(chalk.green("Parabéns, sua conta foi criada!"));
            Operation();
        })
        .catch((err) => console.log(err));
}

function deposit() {
    inquirer
        .prompt([
            {
                name: "accountName",
                message: "Qual o nome da sua conta?",
            },
        ])
        .then((answer) => {
            const accountName = answer["accountName"];

            if (!checkAccount(accountName)) {
                return deposit();
            }
            inquirer
                .prompt([
                    {
                        name: "amount",
                        message: "Quanto você deseja depositar?",
                    },
                ])
                .then((answer) => {
                    const amount = answer["amount"];

                    addAmount(accountName, amount);

                    Operation();
                })
                .catch((err) => console.log(err));
        })
        .catch((err) => console.log(err));
}

function checkAccount(accountName) {
    if (!fs.existsSync(`accounts/${accountName}.json`)) {
        console.log(
            chalk.bgRed.black("Esta conta não existe, escolha outro nome!"),
        );
        return false;
    }
    return true;
}

function addAmount(accountName, amount) {
    const accountData = getAccount(accountName);

    if (!amount) {
        console.log(chalk.bgRed.black("Ocorreu um erro, tente novamente!"));
        return deposit();
    }
    accountData.balance = parseFloat(amount) + accountData.balance;
    fs.writeFileSync(
        `accounts/${accountName}.json`,
        JSON.stringify(accountData),

        function (err) {
            console.log(err);
        },
    );
    console.log(
        chalk.green(`Foi depositado o valor de R$${amount} na sua conta!`),
    );
    Operation();
}

function getAccount(accountName) {
    const accountJSON = fs.readFileSync(`accounts/${accountName}.json`, {
        encoding: "utf8",
        flag: "r",
    });

    return JSON.parse(accountJSON);
}

function getAccountBalance() {
    inquirer
        .prompt([
            {
                name: "accountName",
                message: "Qual o nome da sua conta?",
            },
        ])
        .then((answer) => {
            const accountName = answer["accountName"];
            if (!checkAccount(accountName)) {
                return getAccountBalance();
            }
            const accountData = getAccount(accountName);
            console.log(
                chalk.bgBlue.black(
                    `Olá, o saldo da sua conta é de R$${accountData.balance}`,
                ),
            );
            Operation();
        })
        .catch((err) => console.log(err));
}

function withdraw() {
    inquirer
        .prompt([
            {
                name: "accountName",
                message: "Qual o nome da sua conta?",
            },
        ])
        .then((answer) => {
            const accountName = answer["accountName"];
            if (!checkAccount(accountName)) {
                return withdraw();
            }
            inquirer
                .prompt([
                    {
                        name: "amount",
                        message: "Quanto você deseja sacar?",
                    },
                ])
                .then((answer) => {
                    const amount = answer["amount"];
                    const accountData = getAccount(accountName);
                    if (parseFloat(amount) > accountData.balance) {
                        console.log(
                            chalk.bgRed.black("Saldo insuficiente!"),
                        );
                        return withdraw();
                    }
                    accountData.balance = accountData.balance - parseFloat(amount);
                    fs.writeFileSync(
                        `accounts/${accountName}.json`,
                        JSON.stringify(accountData),
                        function (err) {
                            console.log(err);
                        },
                    );
                    console.log(
                        chalk.green(`Foi sacado o valor de R$${amount} da sua conta!`),
                    );
                    Operation();
                })
                .catch((err) => console.log(err));
        })
        .catch((err) => console.log(err));
}

