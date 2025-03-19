const apiUrl = "https://cakestudio.onrender.com/";

document.addEventListener("DOMContentLoaded", function () {

    // Elements
    const linkInput = document.getElementById("linkInput");
    const checkButton = document.getElementById("checkButton");
    const checkServerButton = document.getElementById("checkServerButton");
    const checkServerP = document.getElementById("checkServerP");
    const terminateCheckServerButton = document.getElementById("terminateCheckServerButton");
    const terminateCheckButton = document.getElementById("terminateCheckButton");

    // Config
    let checkingLink = false;
    let controller;

    document.querySelectorAll('.terminatorButton').forEach((button, index) => {
        button.addEventListener('click', () => {
            // Start a different fetch depending on which button was clicked
            /*const url = `https://jsonplaceholder.typicode.com/posts/${index + 1}`;
            startFetchRequest(url);*/
            if (controller) {
                controller.abort("Terminated Checking Server.");
                // console.log("Terminated Checking Server Process."); 
            };
        });
    });

    /* terminateCheckServerButton.addEventListener("click", () => {
        if (controller) {
            controller.abort("Terminated Server Checking Process.");
            // console.log("Terminated Checking Server Process.");
        }
    }); */

    checkServerButton.addEventListener("click", async function () {
        if (checkingLink || controller) {
            checkServerP.innerHTML = "<b>A task is going on right now. Wait for it to finish first or terminate it before starting another one.</b>";
            return;
        };
        checkServerButton.disabled = true;
        terminateCheckServerButton.disabled = false;
        const originalBtnText = checkServerButton.innerText;
        const originalPText = checkServerP.innerText;
        checkServerButton.innerText = "...";
        checkServerP.innerHTML = "<b>Checking if server is alive or dead...</b>";

        controller = new AbortController();
        const signal = controller.signal;

        try {
            const response = await fetch(apiUrl, { signal });

            if (response.ok) {
                checkServerP.innerHTML = "<b>Server is alive.</b>";
                checkServerButton.innerText = originalBtnText;
                terminateCheckServerButton.disabled = true;
                setTimeout(() => {
                    checkServerP.innerHTML = `<b>${originalPText}</b>`;
                    checkServerButton.disabled = false;
                    terminateCheckServerButton.disabled = true;
                    controller = null;
                }, 5000);
            } else {
                throw new Error(`Response isn't OK. HTTP Code: ${response.status}`);
            }
        } catch (err) {
            /*
            if (err instanceof DOMException) {
                console.warn(err.message);
                return;
            };
            */
            console.error(err);
            checkServerP.innerHTML = "<b>Server is down or the request was aborted.</b>";
            checkServerButton.innerText = originalBtnText;
            checkServerButton.disabled = false;
            terminateCheckServerButton.disabled = true;
            controller = null;
        };
    });

    checkButton.addEventListener("click", function () {
        checkLink();
    });

    async function checkLink() {
        controller = new AbortController();
        const signal = controller.signal;
        checkButton.disabled = true;
        linkInput.disabled = true;
        terminateCheckButton.disabled = false;
        checkingLink = true;

        try {
            const response = await fetch(apiUrl, { signal });

            if (response.status === 200) {
                throw {
                    status: response.status,
                    message: "The resource is being rate-limited.\nTry again later."
                };
            }

            const data = await response.json();

        } catch (err) {
            if (typeof(err) == "string") {
                console.error(err);
                minorErrorMessageHandler(err);    
            }
            else {
                minorErrorMessageHandler(`${err.message}\nHTTP Code: ${err.status}`);
                errorIndicatorImageHandler();
            };
            terminateCheckButton.disabled = true;
            controller = null;
        }
        checkingLink = false;
        checkButton.disabled = false;
        linkInput.disabled = false;
    }

    // Ignored: Link input handler for enabling/disabling the check button
    linkInput.addEventListener("input", function () {
        if (checkingLink) {
            return;
        }
        checkButton.disabled = linkInput.value.trim() === "";
    });

    /*
    setInterval(() => {
        if (linkInput.value !== "" && !checkingLink) {
            checkButton.disabled = false;
        } else {
            checkButton.disabled = true;
        }
    }, 16);
    */

});

// COMMENTS :

// Video download functionality (ignored part that can be used separately)
/*

let controller;
const url = "video.mp4";

const downloadBtn = document.querySelector(".download");
const abortBtn = document.querySelector(".abort");

downloadBtn.addEventListener("click", fetchVideo);

abortBtn.addEventListener("click", () => {
    if (controller) {
        controller.abort();
        console.log("Download aborted");
    }
});

async function fetchVideo() {
    controller = new AbortController();
    const signal = controller.signal;

    try {
        const response = await fetch(url, { signal });
        console.log("Download complete", response);
        // process response further
    } catch (err) {
        console.error(`Download error: ${err.message}`);
    }
}
*/

/*
TRUE KEKMA ERROR HANDLING THAT'S NOT USED ANYMORE :
            // Check if the error is a DOMException (abort error)
            if (err instanceof DOMException) {
                minorErrorMessageHandler(err.message);
                terminateCheckButton.disabled = true;
                return;
            }
        
            // Check for custom error object (rate-limiting or others)
            if (err && err.status && err.message) {
                minorErrorMessageHandler(`${err.message}\n(HTTP Code: ${err.status})`);
                errorIndicatorImageHandler();
                terminateCheckButton.disabled = true;
                return;
                // Handle any other unexpected errors
           console.warn("Unexpected error type:", typeof(err));
            minorErrorMessageHandler(`An unexpected error occurred: ${err.message || err}`);
            errorIndicatorImageHandler();
            terminateCheckButton.disabled = true;   
        }
    }
*/