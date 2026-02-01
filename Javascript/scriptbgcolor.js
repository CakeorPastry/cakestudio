document.addEventListener("DOMContentLoaded", function() {
  /* Get DOM elements */
  const colorInput = document.getElementById("colorInput");
  const colorButton = document.getElementById("colorButton");
  const radialGradientPositionInput = document.getElementById("radialGradientPositionInput");
  const resetButton = document.getElementById("resetButton");
  const saveButton = document.getElementById("saveButton");
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
  const defaultBodyStyle = document.body.style.cssText;

  /* Initialize: Load saved colors or check URL params */
  loadSavedBackground();
  paramsChecker();

  /* Apply Color Button */
  colorButton.addEventListener("click", function() {
    if (colorInput.value.includes(',') && radialGradientPositionInput.value === "") {
      radialGradientPosition = "circle at top left";
      radialGradientPositionInput.value = "circle at top left";
    }
    radialGradientPosition = radialGradientPositionInput.value;
    applyColor();
  });

  /* Save Background to localStorage */
  if (saveButton) {
    saveButton.addEventListener("click", function() {
      const colorValue = colorInput.value.trim();
      const gradientValue = radialGradientPositionInput.value.trim();

      if (!colorValue) {
        alert("Please enter a color first!");
        return;
      }

      /* Save to localStorage */
      localStorage.setItem("bgcolor_color", colorValue);
      localStorage.setItem("bgcolor_gradient", gradientValue);

      alert("Background saved! It will load automatically next time you visit.");
    });
  }

  /* Reset Button */
  resetButton.addEventListener("click", function() {
    /* Clear localStorage */
    localStorage.removeItem("bgcolor_color");
    localStorage.removeItem("bgcolor_gradient");

    /* Reset to default */
    refresh();

    alert("Background reset to default!");
  });

  /* URI Encode */
  encodeURIComponentButton.addEventListener("click", function() {
    const textToEncode = encodeURIComponentInput.value || "Text goes here ⭐";
    encodeURIComponentInput.value = textToEncode;

    try {
      const encodedText = encodeURIComponent(textToEncode);
      encodeURIComponentResult.value = encodedText;
      encodeURIComponentError.innerText = "";
    } catch (err) {
      encodeURIComponentError.innerText = `Error: "${err}"`;
    }
  });

  /* URI Decode */
  decodeURIComponentButton.addEventListener("click", function() {
    const textToDecode = decodeURIComponentInput.value || "Text%20goes%20here%20%E2%AD%90";
    decodeURIComponentInput.value = textToDecode;

    try {
      const decodedText = decodeURIComponent(textToDecode);
      decodeURIComponentResult.value = decodedText;
      decodeURIComponentError.innerText = "";
    } catch (err) {
      decodeURIComponentError.innerText = `Error: "${err}"`;
    }
  });

  /* Apply Color to Background */
  function applyColor(color) {
    const colorName = colorInput.value || color;

    if (radialGradientPosition && colorName && !colorName.includes(',')) {
      radialGradientPosition = "";
    }

    if (radialGradientPosition) {
      document.body.style.background = `radial-gradient(${radialGradientPosition}, ${colorName})`;
    } else {
      document.body.style.background = colorName;
    }
  }

  /* Load Saved Background from localStorage */
  function loadSavedBackground() {
    const savedColor = localStorage.getItem("bgcolor_color");
    const savedGradient = localStorage.getItem("bgcolor_gradient");

    if (savedColor) {
      colorInput.value = savedColor;

      if (savedGradient) {
        radialGradientPositionInput.value = savedGradient;
        radialGradientPosition = savedGradient;
      }

      /* Apply saved background */
      applyColor(savedColor);
    }
  }

  /* Reset to Default */
  function refresh() {
    document.body.style.cssText = defaultBodyStyle;
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

  /* Check URL Parameters */
  function paramsChecker() {
    const urlParams = new URLSearchParams(window.location.search);
    const colorParam = urlParams.get('color');
    const radialGradientPositionParam = urlParams.get('radialgradientposition');
    const hideuiParam = urlParams.get('hideui');

    if (radialGradientPositionParam) {
      radialGradientPosition = radialGradientPositionParam;
      radialGradientPositionInput.value = radialGradientPositionParam;
    }

    if (colorParam && colorParam.includes(',') && !radialGradientPositionParam) {
      radialGradientPosition = "circle at top left";
      radialGradientPositionInput.value = "circle at top left";
    }

    if (colorParam) {
      colorInput.value = colorParam;
      applyColor(colorParam);
    }

    if (hideuiParam === "true") {
      fullBody.style.display = "none";
    }
  }
});
