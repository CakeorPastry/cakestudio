window.onbeforeunload = function() {
    return "janko im sowwyy~ :(";
}
    
document.addEventListener("DOMContentLoaded", function() {

    // Elements
    const startButton = document.getElementById("startButton");
    const stopButton = document.getElementById("stopButton");
    const nextButton = document.getElementById("nextButton");
    const message = document.getElementById("message");
    
    // Configurations
    const defaultMessage = message.innerText;
    const defaultMessageStyle = message.style;
    let gameState = "notStarted";
    let canStart = true;
    let debounce = false;
    let stoppingGame = false;
    let debounceDuration = 3000; // In milliseconds
    let firstNumber = 10;
    let secondNumber = 40;
    let currentNumber = 0;
    
    // Configuring
    message.innerText = defaultMessage;
    refresh();
    
    // Start Button
    startButton.addEventListener("click", function() {
        if (gameState == "notStarted" && canStart) {
            gameState = "_stage_1";
            startButton.disabled = true;
            nextButton.disabled = false;
            stopButton.disabled = false;
            message.innerText = `Ok, think of a number between 1-9` || `Something broke. Please refresh the page.`;       
        }
        else {
            startButton.disabled = true;
            alert("Game already in progress");
            return;
        }
    });
    
    // Stop Button
    stopButton.addEventListener("click", function() {
        if (gameState!="notStarted") {
            gameState = "notStarted";
            stoppingGame = true;
            message.innerText = "Game Stopped.";
            stopButton.disabled = true;
            stopButton.innerText = "...";
            nextButton.disabled = true;
            setTimeout(() => {
                refresh(); 
                stoppingGame = false;
                stopButton.innerText = "Stop";       
            }, 3000);
        }
        else {
            alert("No game in progress.");
            stopButton.disabled = true;
            return;
        }
    });
    
    // Next Button
    nextButton.addEventListener("click", function() {
        const stageCheck = gameState.split("_");
        const stageState = stageCheck[1];
        const stageNumber = stageCheck[2];
        if (stageState!="stage") {
            nextButton.disabled = true;
            alert("You are not in a game right now. That's unexpected, manipur nibba.");
            return;
        }
        if (!debounce) {
            debounce = true;
            nextButton.disabled = true;
            nextButton.innerText = "...";
            stageHandler(stageNumber);
            setTimeout(() => {
                if (stageNumber!="5" && !stoppingGame) {
                    debounce = false;
                    nextButton.disabled = false; 
                    nextButton.innerText = "Next";         
                }
            }, debounceDuration)
        }
    });
    
    // Stage Handler
    function stageHandler(stageNumber) {
        if (stageNumber=="1") {
            gameState = "_stage_2";
            message.innerText = `Add ${firstNumber} to it.`;
        }
        else if (stageNumber=="2") {
            gameState = "_stage_3";
            message.innerText = `Hmm, now add ${secondNumber} to your current total.`;
            currentNumber += firstNumber;
        }
        else if (stageNumber=="3") {
            gameState = "_stage_4";
            message.innerText = `Now from your total, subtract the number you thought of at the beginning and click Next...`;
            currentNumber += secondNumber;
        }
        else if (stageNumber=="4") {
            gameState = "_stage_5";
            message.innerText = `Is your current number, ${currentNumber}..?`            
        }
        else if (stageNumber=="5") {
            gameState = "notStarted";
            canStart = false;
            nextButton.disabled = true;
            stopButton.disabled = true;
            startButton.disabled = true;
            message.innerText = `Lol sigma right?`;
            message.style = "color: lime;";
            setTimeout(() => {
                message.style = "color: #00ffff";
                message.innerText = `Restarting...`;
                setTimeout(() => {
                   refresh();             
                }, 2000)
            }, 3000)            
        }
    }
    
    // Refresh
    function refresh() {
        gameState = "notStarted";
        canStart = true;
        currentNumber = 0;
        debounce = false;
        firstNumber = randomNumber() || 10;
        secondNumber = randomNumber() || 40;
        if (firstNumber == secondNumber) {
           // console.error(`First Number and Second Number are the same. (${firstNumber} & ${secondNumber}), retrying random number generation...`);
            refresh();
            return;
        }
        nextButton.disabled = true;
        nextButton.innerText = "Next";
        stopButton.disabled = true;
        stopButton.innerText = "Stop";
        startButton.disabled = false;
        startButton.innerText = "Start";
        message.innerText = defaultMessage;
        message.style = defaultMessageStyle;
    }
    
    // Random Number
    function randomNumber() {
        let random = Math.random();
        let increasedRandom = random * 100;
        let result = Math.floor(increasedRandom);
        // console.log(`Result after floor : ${result}`);
        const min = 5;
        const max = 100;
        if (result<min) {
            result = min;
            // console.warn(`Less than minimum. New Result = ${result}`);
        }
        else if (result>max) {
            result = max;
            // console.warn(`More than maximum. New Result = ${result}`);
        }
        // console.log(`💢 Final Result : ${result}`);
        
        return result;
    }
});