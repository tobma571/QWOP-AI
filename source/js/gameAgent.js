
const goalDistance = 100;
var lastDeathCount = deathCount;
var n = 0;
const availableActions = [0, 1, 2, 4, 6, 8, 9];
const minExplorationRate = 0.01;
const maxExplorationRate = 1.0;
var explorationRate = maxExplorationRate;
const decayRate = 0.005;
var learningRate = 1.0;
var discountRate = 0.8;
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

function getDistBetweenFeet() {
    return getLeftFootX() - getRightFootX();
}

function getCurrentStateName() {
    return Math.round(getDistBetweenFeet() / 30) + " " + roundToDecimals(body.torso.GetAngle() / 5);
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
    //else if (body.torso.GetAngle() < -0.8 || body.torso.GetAngle() > 0.6) return -10;
    const dx = 5 * (totalDistTraveled - lastStepDistance);
    const feetReward = 0.01 * Math.abs(getDistBetweenFeet() - lastDistanceBetweenFeet);
    const angleReward = -Math.abs(body.torso.GetAngle());
    const closenessToGoal = totalDistTraveled / goalDistance;
    //console.log("Reward is " + dx + " " + feetReward + " " + angleReward + " " + closenessToGoal);
    return dx + feetReward + angleReward + closenessToGoal;
}

function getQValue(oldState, newState, action) {
    try {
        const newQValue = qTable[oldState][action] +
            learningRate * (reward() + discountRate * findMaxQ(newState) - qTable[oldState][action]);
        return newQValue;
    }
    catch(err) {
        console.log("Failed to get QValue. oldState: " + oldState + ", NewState: " + newState);
        return 0;
    }
}


var oldState;
currentState = getCurrentStateName();

var lastDistanceBetweenFeet = getDistBetweenFeet();

setInterval(function() {
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

    lastDistanceBetweenFeet = getDistBetweenFeet();
    lastStepDistance = totalDistTraveled;

    if (deathCount > lastDeathCount) {
        console.log("Lost :( Size of QTable: " + Object.keys(qTable).length + " exploration rate is: " + explorationRate);
        lastDeathCount = deathCount;
    }

    explorationRate = minExplorationRate + Math.exp(-decayRate * deathCount) * (maxExplorationRate - minExplorationRate);

}, 100);

