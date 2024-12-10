document.addEventListener("DOMContentLoaded", function() {
    
    // Elements
    const colorInput = document.getElementById("colorInput");
    const colorButton = document.getElementById("colorButton");
    const radialGradientPositionInput = document.getElementById("radialGradientPositionInput");
    const resetButton = document.getElementById("resetButton");
    const fullBody = document.getElementById("fullBody");
    const encodeURIComponentInput = document.getElementById("encodeURIComponentInput");
    const encodeURIComponentButton = document.getElementById("encodeURIComponentButton");
    const encodeURIComponentResult = document.getElementById("encodeURIComponentResult");
    const encodeURIComponentError = document.getElementById("encodeURIComponentError");
    const decodeURIComponentInput = document.getElementById("decodeURIComponentInput");
    const decodeURIComponentButton = document.getElementById("decodeURIComponentButton");
    const decodeURIComponentResult = document.getElementById("decodeURIComponentResultInput");
    const decodeURIComponentError = document.getElementById("decodeURIComponentError");
        
    let radialGradientPosition;
    const defaultBodyStyle = document.body.style;
    // Configuring
    refresh();
    paramsChecker();
    
    resetButton.onclick = function() {
        refresh();
    }
    
    colorButton.addEventListener("click", function() {
        if (colorInput.value.includes(',') && radialGradientPositionInput.value == "") {
            radialGradientPosition = "circle at top left";
            radialGradientPositionInput.value = "circle at top left";
            color();
        }
        radialGradientPosition = radialGradientPositionInput.value;
        color();
    });
    
    encodeURIComponentButton.addEventListener("click", function() {
        const textToEncode = encodeURIComponentInput.value || "Text goes here ⭐";
        encodeURIComponentInput.value = textToEncode;
        
        try {
            const encodedText = encodeURIComponent(textToEncode);
            encodeURIComponentResult.value = encodedText;
            encodeURIComponentError.innerText = "";
        }
        catch (err) {
            encodeURIComponentError.innerText = `Error : "${err}"`;
        }
    });

decodeURIComponentButton.addEventListener("click", function() {
        const textToDecode = decodeURIComponentInput.value || "Text%20goes%20here%20%E2%AD%90";
        decodeURIComponentInput.value = textToDecode;
        
        try {
            const decodedText = decodeURIComponent(textToDecode);
            decodeURIComponentResult.value = decodedText;
            decodeURIComponentError.innerText = "";
        }
        catch (err) {
            decodeURIComponentError.innerText = `Error : "${err}"`;
        }
    });

    
    function color(color) {
        const colorName = colorInput.value || color;
        
        if (radialGradientPosition && colorName && !colorName.includes(',')) {
            radialGradientPosition = "";
        }
        
        if (radialGradientPosition) {
            document.body.style = `background: radial-gradient(${radialGradientPosition}, ${colorName})`;
        }
        else {
            document.body.style = `background: ${colorName}`;
        }
    }
    
    function refresh() {
        document.body.style = defaultBodyStyle;
        colorInput.value = "";
        radialGradientPositionInput.value = "";
        colorInput.disabled = false;
        colorButton.disabled = false;
        
        encodeURIComponentInput.value = "";
        encodeURIComponentResult.value = "";
        encodeURIComponentError.innerText = "";
        decodeURIComponentInput.value = "";
        decodeURIComponentResult.value = "";
        decodeURIComponentError.innerText = "";
    }
    
    function paramsChecker() {
       const urlParams = new URLSearchParams(window.location.search);
       const colorParam = urlParams.get('color');
       const radialGradientPositionParam = urlParams.get('radialgradientposition');
       const hideuiParam = urlParams.get('hideui');
      // alert(`${hideuiParam}, ${colorParam}, ${radialGradientPositionParam}`);
       if (radialGradientPositionParam) {
           radialGradientPosition = radialGradientPositionParam;
       }
       
       if (colorParam && colorParam.includes(',') && !radialGradientPositionParam) {
            radialGradientPosition = "circle at top left";
            radialGradientPositionInput.value = "circle at top left";
            color();
        }
        
        if (colorParam && !colorParam.includes(',') && radialGradientPositionParam) {
            color(colorParam);
        }

       if (colorParam) {
           color(colorParam);
       }
       
       if (hideuiParam=="true") {
           fullBody.style = "display: none;";
       }
    }  
});

// const x = "sigma!";
// x.includes("!"); (Returns a true or false value)
// ---
// let y = "50";
// y = parseInt(y, 10); (Changes it into a number, returns NaN if failed)
// ---
// for(x=1;x<=5;x++){
//   console.log(x);
//}
// 1
// 2
// 3
// 4
// 5
// ---