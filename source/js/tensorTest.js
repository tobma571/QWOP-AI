const model = tf.sequential();

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
var currentState = getCurrentState();


const hiddenLayer = tf.layers.dense({
    units: 10,
    inputShape: [2],
    activation: 'relu'
});

const outputLayer = tf.layers.dense({
    units: availableActions.length
});

model.add(hiddenLayer);
model.add(outputLayer);

model.compile({loss: 'meanSquaredError', optimizer: 'sgd'});


function getDistBetweenFeet() {
    return getLeftFootX() - getRightFootX();
}

function randomizeAction() {
    return Math.round(Math.random() * (availableActions.length - 1));
}

function getCurrentState() {
    return tf.tensor([getDistBetweenFeet(), body.torso.GetAngle()], [1, 2]);
}

function reward() {
    if (deathCount > lastDeathCount) return -10;
    const dx = 5 * (totalDistTraveled - lastStepDistance);
    const feetReward = 0.01 * Math.abs(getDistBetweenFeet() - lastDistanceBetweenFeet) + 0.1 * totalStepsTraveled;
    const angleReward = -Math.abs(body.torso.GetAngle());
    const closenessToGoal = totalDistTraveled / goalDistance;
    return dx + feetReward + angleReward + closenessToGoal;
}

function newQforAction(prediction, action) {
    //TODO fix syntax
    const currentPrediction = model.predict(currentState);
    prediction[action] = prediction[action] + learningRate * (reward() + discountRate * currentPrediction.max() - prediction[action]);
    return prediction;
}


var oldState;
currentState = getCurrentState();

var lastDistanceBetweenFeet = getDistBetweenFeet();

async function waitForFitting(newQ) {
    var result = await model.fit(oldState, newQ);
}


var promise = Promise.resolve(true);

setInterval(function () {
    var shouldExplore = Math.random() < explorationRate;

    var newAction;
    var prediction = model.predict(currentState);

    if (shouldExplore) {
        console.log("Exploring");
        newAction = randomizeAction();
    } else {
        console.log("Educated guess");
        newAction = prediction.argMax(1).dataSync()[0];
        console.log("Selecting action " + newAction + " for prediction " + prediction);
    }

    // Calls game function to move
    updateKeyState(availableActions[newAction]);

    oldState = currentState;
    currentState = getCurrentState();

    const newQ = newQforAction(prediction, newAction);

    waitForFitting(newQ);

    lastDistanceBetweenFeet = getDistBetweenFeet();
    lastStepDistance = totalDistTraveled;

    if (deathCount > lastDeathCount) {
        console.log("Lost :(");
        lastDeathCount = deathCount;
    }

    explorationRate = minExplorationRate + Math.exp(-decayRate * deathCount) * (maxExplorationRate - minExplorationRate);

}, 100);


/*
*     promise = promise.then(function () {
        return new Promise(function (resolve) {
            playGame();
        });
    });
* */
