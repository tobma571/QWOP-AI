
const goalDistance = 100;
var lastDeathCount = deathCount;
var n = 0;
const availableActions = [0, 1, 2, 4, 6, 8, 9];
const minExplorationRate = 0.01;
const maxExplorationRate = 1.0;
var explorationRate = maxExplorationRate;
const decayRate = 0.005;
var learningRate = 1.0;
var discountRate = 0.9;
var lastStepDistance = totalDistTraveled;
var currentState = getCurrentStateName();

function createEmptyQRow() {
    return Array.apply(null, Array(availableActions.length)).map(Number.prototype.valueOf, 0);
}

var qTable = {currentState: createEmptyQRow()};

function getCurrentStateName() {
    return l_kneeAngle + " " + r_kneeAngle + " " + l_hipAngle  + " " + r_hipAngle;
}

function findMaxQ(state) {
    const qRow = qTable.state;
    return Math.max.apply(null, qRow);
}

function findIndexOfMaxQ(state) {
    const qRow = qTable.state;
    return qRow.indexOf(findMaxQ(state));
}

function reward() {
    return totalDistTraveled - lastStepDistance;
}

function getQValue(oldState, newState, action) {
    return qTable[oldState][action] +
        learningRate * (reward() + discountRate * findMaxQ(newState) - qTable[oldState][action]);
}


var oldState;

setInterval(function() {
    currentState = getCurrentStateName();

    var shouldExplore = Math.random() < explorationRate;

    var newAction;

    if (shouldExplore) {
        newAction = Math.round(Math.random() * (availableActions.length - 1));
    } else {
        newAction = findIndexOfMaxQ(currentState);
    }

    // Calls game function to move
    updateKeyState(availableActions[newAction]);

    oldState = currentState;
    currentState = getCurrentStateName();

    qTable[oldState][newAction] = getQValue(oldState, currentState, newAction);

    if (!qTable.hasOwnProperty(currentState)) {
        //TODO: Never gets here, fix
        console.log("Adding new row to qtable");
        qTable[currentState] = createEmptyQRow();
    }

    if (deathCount > lastDeathCount) {
        console.log("Lost :(");
        lastDeathCount = deathCount;
    }

    explorationRate = minExplorationRate + Math.exp(-decayRate * deathCount) * (maxExplorationRate - minExplorationRate);

}, 500);

