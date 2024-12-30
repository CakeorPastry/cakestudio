document.addEventListener("DOMContentLoaded", async function() {

    window.addEventListener('ipProcessed', async () => {
        
        const questionInput = document.getElementById("questionInput");
        const sendButton = document.getElementById("sendButton");
        const responseContainer = document.getElementById("responseContainer");
        const copyResponseToClipboard = document.getElementById("copyResponseToClipboard");
        const statusCodeSymbol = document.getElementById("statusCodeSymbol");
        const statusCode = document.getElementById("statusCode");
        const statusImage = document.getElementById("statusImage");
        const statusMessage = document.getElementById("statusMessage");
        const minorErrorMessage = document.getElementById("minorErrorMessage");
        const errorIndicatorImage = document.getElementById("errorIndicatorImage");
        
        sendButton.disabled = false;
        statusMessage.innerText = "Waiting for user's question...";
        statusImage.src = "https://cakeorpastry.netlify.app/Assets/Icons/Info.png";
        
        sendButton.addEventListener("click", async function() {
            const question = questionInput.value;
            
            if (!question) {
                minorErrorMessageHandler("Question value cannot be empty");
                return;
            }
            
            if (!jwtToken || !loggedIn) {
                minorErrorMessageHandler("You are not logged in");
                return;
            }
             
            sendButton.disabled = true;
         // sendButton.innerText = "...";
            statusMessage.innerText = " Waiting for API's response...";
            statusImage.src = "/Assets/Icons/Waiting.png";
            
            try {
                const response = await fetch(`${apiUrl}/testgpt?question=${encodeURIComponent(question)}&token=${encodeURIComponent(jwtToken)}`);
                
               if (response.status === 401) {
                   throw {
                       status: response.status,
                       message: "Your login session has expired."
                   };
               }
               else if (response.status === 403) {
                   throw {
                       status: response.status,
                       message: "You are not allowed to use this service."
                   }
               }
               else if (response.status === 429) {
                   throw {
                       status: response.status,
                       message: "The resource is being rate limited. Try again later."
                   }
               }
               else if (!response.ok) {
                   throw {
                       status: response.status, 
                       message: "An error has occured. This is usually an error on our end. Try again later"
                   }
               } 
                
               const data = await response.json();
               await sendWebhook("Question Asked",`
**Question:** ${question}
**Response:** ${data.reply}
${userInfoDescription}`, Math.floor(Math.random() * 16777215));
              responseContainer.innerText = data.reply;
              statusMessage.innerText = "The API is all good.";
              statusImage.src = "https://cakeorpastry.netlify.app/Assets/Icons/Check.png";
              statusCode.innerText = response.status;
              statusCodeSymbol.setAttribute("fill", "lime");
            }
            catch (err) {
                await sendWebhook("Fetch Error",`
**Question:** ${question}
**Error Message:** ${err.message}
**HTTP Status Code:** ${err.status}
${userInfoDescription}`, 16711680);
                statusMessage.innerText = err.message;
                statusImage.src = "https://cakeorpastry.netlify.app/Assets/Icons/Error.png";
                statusCode.innerText = err.status;
                statusCodeSymbol.setAttribute("fill", "red");
                errorIndicatorImageHandler();
           }
           
           setTimeout(() => {
              sendButton.disabled = false;
              sendButton.innerText = "Send"; 
           }, 3000);
                
        });
    });
});

function minorErrorMessageHandler(message) {
    minorErrorMessage.innerText = message;
    minorErrorMessage.parentNode.parentNode.style.display = "flex"
    sendButton.disabled = true;
    setTimeout(() => {
        sendButton.disabled = false;
        minorErrorMessage.parentNode.parentNode.style.display = "none";
    }, 3000)
}

function errorIndicatorImageHandler() {
    // Step 1: Make the element visible and start fading in
    errorIndicatorImage.style.display = "inline-block";  
    setTimeout(() => {  
        errorIndicatorImage.style.opacity = 1; // Fade-in
    }, 10);

    // Step 2: After some time, start fading it out
    setTimeout(() => {
        errorIndicatorImage.style.opacity = 0; // Fade-out
    }, 1500); // This will happen 1.5 seconds after fade-in starts

    // Step 3: After the fade-out is complete (after 2.5 seconds), hide the element
    setTimeout(() => {
        errorIndicatorImage.style.display = "none"; // Hide after fade-out
    }, 2500); // Match this to the fade-out duration (opacity transition time)
}

function copyTextToClipboard(copyFrom, copyBtn) {
    const textToCopy = document.getElementById(copyFrom).innerText || "";
    const copyButton = copyBtn || this;
    
    if (textToCopy) {
        copyButton.disabled = true;
        const originalText = copyButton.innerText;
        copyButton.innerText = "Copied!";
        
        navigator.clipboard.writeText(textToCopy).then(() => {
            setTimeout(() => {
                copyButton.innerText = originalText;
                copyButton.disabled = false;
            }, 3000);
        }).catch(err => {
            console.error('Could not copy text: ', err);
            copyButton.innerText = originalText;
            copyButton.disabled = false;
        });
    } else {
        alert('No response to copy.');
    }
}
    