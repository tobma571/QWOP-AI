
var n = 0;
const availableStates = [0, 1, 2, 4, 6, 8, 9]

setInterval(function() {
    updateKeyState(availableStates[n]);
    n = (n + 1) % availableStates.length;
}, 500);
