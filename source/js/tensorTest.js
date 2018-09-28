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
    const currentPrediction = model.predict(currentState);
    var newTensorList = [];
    for (var i = 0; i < availableActions.length; i++) {
        if (i != action)
            newTensorList.push(prediction[i]);
        else
            newTensorList.push(prediction[action] + learningRate * (reward() + discountRate * currentPrediction.max() - prediction[action]));
    }
    prediction.dispose();
    currentPrediction.dispose();
    return tf.tensor(newTensorList, [1, availableActions.length]);

}


var oldState;
currentState = getCurrentState();

var lastDistanceBetweenFeet = getDistBetweenFeet();

//async function waitForFitting(newQ) {
//    var result = await model.fit(oldState, newQ);
//}
function waitForFitting(newQ) {

    return async () => {
        await model.fit(oldState,newQ).dispose()
};
    //result.dispose();
}




var promise = Promise.resolve(true);

setInterval(function () {

    console.log("1 " + tf.memory().numTensors);

    var shouldExplore = Math.random() < explorationRate;

    var newAction;
    var prediction = tf.tidy(() => {return model.predict(currentState)});
    console.log("2 " + tf.memory().numTensors);

    if (shouldExplore) {
        console.log("Exploring");
        newAction = randomizeAction();
    } else {
        console.log("Educated guess");
        newAction = prediction.argMax(1).dataSync()[0];
        console.log("Selecting action " + newAction + " for prediction " + prediction);
    }
    console.log("3 " + tf.memory().numTensors);

    // Calls game function to move
    updateKeyState(availableActions[newAction]);

    if (typeof oldState !== 'undefined')
        oldState.dispose();

    oldState = currentState;
    currentState.dispose();
    currentState = getCurrentState();
    console.log("4 " + tf.memory().numTensors);

    if (typeof newQ !== 'undefined')
        newQ.dispose();

    var newQ = newQforAction(prediction, newAction);

    console.log("5 " + tf.memory().numTensors);

    prediction.dispose();

    waitForFitting(newQ);
    newQ.dispose();
    console.log("6 " + tf.memory().numTensors);

    lastDistanceBetweenFeet = getDistBetweenFeet();
    lastStepDistance = totalDistTraveled;

    if (deathCount > lastDeathCount) {
        console.log("Lost :(");
        lastDeathCount = deathCount;
    }

    explorationRate = minExplorationRate + Math.exp(-decayRate * deathCount) * (maxExplorationRate - minExplorationRate);
    console.log("7 " + tf.memory().numTensors);



}, 100);


/*
*     promise = promise.then(function () {
        return new Promise(function (resolve) {
            playGame();
        });
    });
* */
