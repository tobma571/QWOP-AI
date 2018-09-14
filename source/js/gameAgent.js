
const goalDistance = 100;
var lastDeathCount = deathCount;
var n = 0;
const availableActions = [0, 1, 2, 4, 6, 8, 9];
const minExplorationRate = 0.01;
const maxExplorationRate = 1.0;
var explorationRate = maxExplorationRate;
const decayRate = 0.05;
var learningRate = 1.0;
var discountRate = 0.9;
var lastStepDistance = totalDistTraveled;
var currentState = getCurrentStateName();

function createEmptyQRow() {
    return Array.apply(null, Array(availableActions.length)).map(Number.prototype.valueOf, 0);
}

var qTable = {};
qTable[[currentState]] = createEmptyQRow();

function roundToDecimals(number) {
    return Math.round(number * 10) / 10;
}

function getCurrentStateName() {
    return roundToDecimals(l_kneeAngle) + " " + roundToDecimals(r_kneeAngle) + " "
        + roundToDecimals(l_hipAngle)  + " " + roundToDecimals(r_hipAngle);
}

function randomizeAction() {
    return Math.round(Math.random() * (availableActions.length - 1));
}

function findMaxQ(state) {
    const qRow = qTable[state];
    return Math.max.apply(null, qRow);
}

function findIndexOfMaxQ(state) {
    const qRow = qTable[state];
    const index = qRow.indexOf(findMaxQ(state));
    if (index < 0) return randomizeAction();
    return index;
}

function reward() {
    if (deathCount > lastDeathCount) return -10;
    else if (body.torso.GetAngle() < -0.8 || body.torso.GetAngle() > 0.6) return -10;
    return totalDistTraveled - lastStepDistance;
}

function getQValue(oldState, newState, action) {
    const newQValue =  qTable[oldState][action] +
        learningRate * (reward() + discountRate * findMaxQ(newState) - qTable[oldState][action]);
    return newQValue;
}


var oldState;

setInterval(function() {
    currentState = getCurrentStateName();

    var shouldExplore = Math.random() < explorationRate;

    var newAction;

    if (shouldExplore) {
        console.log("Exploring");
        newAction = randomizeAction();
    } else {
        console.log("Educated guess");
        newAction = findIndexOfMaxQ(currentState);
    }

    // Calls game function to move
    updateKeyState(availableActions[newAction]);

    oldState = currentState;
    currentState = getCurrentStateName();

    if (!qTable.hasOwnProperty(currentState)) {
        qTable[[currentState]] = createEmptyQRow();
    }

    qTable[oldState][newAction] = getQValue(oldState, currentState, newAction);

    lastStepDistance = totalDistTraveled;

    if (deathCount > lastDeathCount) {
        console.log("Lost :(");
        lastDeathCount = deathCount;
    }

    explorationRate = minExplorationRate + Math.exp(-decayRate * deathCount) * (maxExplorationRate - minExplorationRate);

}, 100);

