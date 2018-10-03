async function loadQnn() {
    // Files can't be named (1)
    const jsonUpload = document.getElementById('qnnJsonFile');
    const weightsUpload = document.getElementById('qnnWeightsFile');

    if (jsonUpload.length == 0 || weightsUpload.length == 0) {
        alert("No QNN files selected");
        return;
    }

    model = await tf.loadModel(
        tf.io.browserFiles([jsonUpload.files[0], weightsUpload.files[0]]));
}

async function downloadQnn() {
    //Only works in Chrome for some reason
    await model.save('downloads://my-model-1');
}
