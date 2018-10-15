const goalDistance = 100;
const availableActions = [0, 1, 2, 4, 6, 8, 9];
const minExplorationRate = 0.01;
const maxExplorationRate = 1.0;
var explorationRate = maxExplorationRate;
const decayRate = 0.001;
var learningRate = 1.0;
var discountRate = 0.8;
var rewardFunction = 0;

var model = 0;

function createModel() {
    var model = tf.sequential();

    const hiddenLayer1 = tf.layers.dense({
        units: 10,
        inputShape: [5],
        activation: 'relu'
    });

    const hiddenLayer2 = tf.layers.dense({
        units: 10,
        activation: 'relu'
    });

    const outputLayer = tf.layers.dense({
        units: availableActions.length
    });

    model.add(hiddenLayer1);
    model.add(hiddenLayer2);
    model.add(outputLayer);

    model.compile({loss: 'meanSquaredError', optimizer: 'sgd'});
    return model;
}

function changeReward() {
    rewardFunction = parseInt(document.getElementById("rewardFunctionDecision").value);
}

function startGame() {
    if (model === 0) model = createModel();
    playGame();
}
