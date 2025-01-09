//each envelope has 2 properties concern (str) and budget (number)

const { log } = require("console");

const envelopes = [];
const income = 2000;
let envelopeIdCounter = 1;
const monthlyFinances = {
    income: income,
    envelopes: envelopes,
    totalExpenses() {
        let totalExpenses = 0;
        envelopes.forEach((envelope) => {
            totalExpenses += envelope.budget;
        });
        if (totalExpenses) {
            return totalExpenses;
        }
        else return 0;
    },
    //takes in a new envelope and checks if there is any money left over if this envelope is added
    leftOver(envelope) {
        const totalExpenses = envelope.budget + this.totalExpenses();
        const leftOver = this.income - totalExpenses;
        if (leftOver >= 0)
            return true;
        else return false;
    }
}
//takes in 2 params concern and budget, checks for validity and returns an envelope objs
function createEnvelope(concern, budget) {
    if (!concern || isNaN(budget) || !budget) {
        return null;
    }
    concern = String(concern);
    budget = Number(budget);
    const envelopeObject = {
        concern: concern,
        budget: budget,
        _remaining: budget,
        spend(money) {
            this._remaining -= money;
        }
    }
    return envelopeObject;

};

//sets the monthly income property of monthlyFinances
function setIncome(income) {
    if (isNaN(income) || income <= 0) {
        return null;
    }
    monthlyFinances.income = income;
    return true;
};

//checks if an envelope is valid, ie it checks if we can add the envelope to the db by making sure that 
// there is enough money(input) to cover the all the envelopes and this one;
function isValidEnvelope(envelope) {
    const valid = monthlyFinances.leftOver(envelope);
    if (valid && envelope)
        return true;
    else return false;
};

function addEnvelopeToDB(envelope) {
    if (isValidEnvelope(envelope)) {
        envelope.id = envelopeIdCounter++;
        envelopes.push(envelope);
        return true;
    }
    return null;
};

function getEnvelopeById(idToFind) {
    const envelopeToFind = envelopes.find((envelope) => {
        return envelope.id === idToFind;
    });
    if (envelopeToFind) {
        return envelopeToFind;
    }
    else return null;
}

function getAllEnvelopes() {
    let toString = "";
    for (let i in envelopes) {
        let j = Number(i) + 1;
        let arr = Object.entries(envelopes[i]);
        toString += `Envelope ${j}: ${arr[0].join(": ")}, ${arr[1].join(": ")}, ${arr[2].join(": ")}, ${arr[4].join(": ")} \n`;
    }
    return toString;
}


function updateEnvelope(id, property, newValue) {
    const envelopeToUpdate = getEnvelopeById(id);
    switch (property) {
        case "concern": envelopeToUpdate.concern = String(newValue);
            break;
        case "budget": envelopeToUpdate.budget = Number(newValue);
            envelopeToUpdate._remaining = Number(newValue);
            break;
        case "spend": envelopeToUpdate.spend(Number(newValue));
            break;

    }
}

function deleteEnvelope(id) {
    const envelopeToDeleteIndex = envelopes.findIndex((envelope) => {
        return envelope.id === id;
    })
    if (envelopeToDeleteIndex !== -1) {
        envelopes.splice(envelopeToDeleteIndex, 1);
        return true;
    }
    else {
        return null;

    }
}

module.exports = {
    monthlyFinances,
    createEnvelope,
    setIncome,
    isValidEnvelope,
    addEnvelopeToDB,
    getEnvelopeById,
    getAllEnvelopes,
    updateEnvelope,
    deleteEnvelope
}
