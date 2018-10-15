var lastDeathCount = deathCount;
var n = 0;
var lastStepDistance = totalDistTraveled;
var currentState = getCurrentState();
var numLoops = 0;

function getDistBetweenFeet() {
    return getLeftFootX() - getRightFootX();
}

function randomizeAction() {
    return Math.round(Math.random() * (availableActions.length - 1));
}

function getCurrentState2() {
    return tf.tensor([getDistBetweenFeet(), body.torso.GetAngle()], [1, 2]);
}

function getCurrentState() {
    return tf.tensor([l_kneeAngle, r_kneeAngle, l_hipAngle, r_hipAngle, body.torso.GetAngle()], [1, 5]);
}

function reward() {
    if (deathCount > lastDeathCount) return -10;
    switch (rewardFunction) {
        case 1:
            return reward1();
        case 2:
            return reward2();
        case 3:
            return reward3();
        case 4:
            return reward4();
        case 5:
            return reward5();
        case 6:
            return reward6();
        default:
            return reward1();
    }
}

function reward1() {
    const dx = 5 * (totalDistTraveled - lastStepDistance);
    const feetReward = 0.01 * Math.abs(getDistBetweenFeet() - lastDistanceBetweenFeet) + 0.1 * totalStepsTraveled;
    const angleReward = -Math.abs(body.torso.GetAngle());
    const closenessToGoal = totalDistTraveled / goalDistance;
    return dx + feetReward + angleReward + closenessToGoal;
}

function reward2() {
    return totalDistTraveled / goalDistance;
}

function reward3() {
    return totalDistTraveled - lastStepDistance;
}

function reward4() {
    return totalDistTraveled / numLoops;
}

function reward5() {
    const dx = 5 * (totalDistTraveled - lastStepDistance);
    const feetReward = 0.01 * Math.abs(getDistBetweenFeet() - lastDistanceBetweenFeet) + 0.1 * totalStepsTraveled;
    const closenessToGoal = totalDistTraveled / goalDistance;
    return dx + feetReward + closenessToGoal;
}

var lastTotalStepsTraveled;

function reward6() {
    const dx = 5 * (totalDistTraveled - lastStepDistance);
    const feetReward = totalStepsTraveled - lastTotalStepsTraveled;
    lastTotalStepsTraveled = totalStepsTraveled;
    const closenessToGoal = totalDistTraveled / goalDistance;
    return dx + feetReward + closenessToGoal;
}

function newQforAction(prediction, action) {
   return tf.tidy(() => {
        const currentPrediction = model.predict(currentState);
        var newTensorList = [];
        for (var i = 0; i < availableActions.length; i++) {
            if (i != action)
                newTensorList.push(prediction.dataSync()[i]);
            else
                newTensorList.push(prediction.dataSync()[action] + learningRate * (reward() + discountRate * Math.max.apply(null, currentPrediction.dataSync()) - prediction.dataSync()[action]));
        }
        prediction.dispose();
        currentPrediction.dispose();
        const newQ = tf.tensor(newTensorList, [1, availableActions.length]);
        return newQ;
    });
}


var oldState;
currentState = getCurrentState();

var lastDistanceBetweenFeet = getDistBetweenFeet();

function waitForFitting(newQ) {
    return async () => {
        await model.fit(oldState,newQ).dispose()
    };
}


function playGame() {
    var promise = Promise.resolve(true);

    var gameLoop = setInterval(function () {
        // Keep on top to avoid division by 0 in reward function
        numLoops += 1;

        var shouldExplore = Math.random() < explorationRate;

        var newAction;
        var prediction = tf.tidy(() => {return model.predict(currentState)});

        if (shouldExplore) {
            console.log("Exploring");
            newAction = randomizeAction();
        } else {
            console.log("Educated guess");
            newAction = tf.tidy(() => {return prediction.argMax(1).dataSync()[0]});
        }

        // Calls game function to move
        updateKeyState(availableActions[newAction]);

        if (typeof oldState !== 'undefined')
            oldState.dispose();

        oldState = currentState;
        currentState.dispose();
        currentState = getCurrentState();

        if (typeof newQ !== 'undefined')
            newQ.dispose();

        var newQ = newQforAction(prediction, newAction);

        prediction.dispose();

        waitForFitting(newQ);
        newQ.dispose();

        lastDistanceBetweenFeet = getDistBetweenFeet();
        lastStepDistance = totalDistTraveled;

        if (deathCount > lastDeathCount) {
            console.log("Lost :(");
            lastDeathCount = deathCount;
        }

        if (explorationRate != minExplorationRate)
            explorationRate = minExplorationRate + Math.exp(-decayRate * deathCount) * (maxExplorationRate - minExplorationRate);


    }, 100);
}
