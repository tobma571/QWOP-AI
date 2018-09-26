const model = tf.sequential();

const lRate = 0.99;
var expRate = 0.1;
var dead = false;


const hiddenLayer = tf.layers.dense({
    units: 10,
    inputShape: [5],
    activation: 'relu'

});

const outputLayer = tf.layers.dense({
    units: 4
});

model.add(hiddenLayer);
model.add(outputLayer);

model.compile({ loss: 'meanSquaredError', optimizer: 'sgd' });

model.fit();

