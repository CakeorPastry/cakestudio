/* Global Variables */
let messages = [];
let requestLogs = [];
let sessionStart = Date.now();
let isSending = false;

/* Initialize Chat Interface */
document.addEventListener("DOMContentLoaded", function() {
  /* Wait a moment for account.js to load */
  setTimeout(initializeChat, 100);
});

function initializeChat() {
  /* Get DOM elements */
  const questionInput = document.getElementById("questionInput");
  const sendButton = document.getElementById("sendButton");
  const chatContainer = document.getElementById("chatContainer");
  const profileDropdownToggle = document.getElementById("profileDropdownToggle");
  const profileDropdown = document.getElementById("profileDropdown");
  const logsToggle = document.getElementById("logsToggle");
  const logsPanel = document.getElementById("logsPanel");
  const clearHistoryButton = document.getElementById("clearHistoryButton");

  /* Load chat history from localStorage */
  loadMessagesFromLocalStorage();

  /* Enable input if logged in */
  if (loggedIn && jwtToken) {
    questionInput.disabled = false;
    sendButton.disabled = false;
  } else {
    questionInput.disabled = true;
    sendButton.disabled = true;
  }

  /* Set up event listeners */
  sendButton.addEventListener("click", sendMessage);

  questionInput.addEventListener("keypress", function(e) {
    if (e.key === "Enter" && !sendButton.disabled) {
      sendMessage();
    }
  });

  profileDropdownToggle.addEventListener("click", function() {
    profileDropdown.classList.toggle("hidden");
  });

  logsToggle.addEventListener("click", function() {
    logsPanel.classList.toggle("hidden");
  });

  clearHistoryButton.addEventListener("click", function() {
    if (confirm("Are you sure you want to clear all chat history?")) {
      messages = [];
      localStorage.removeItem("testgpt_messages");
      chatContainer.innerHTML = "";
      alert("Chat history cleared!");
    }
  });

  /* Start live counter */
  startLiveCounter();

  /* Load total time from localStorage */
  updateTotalTime();
}

/* Send Message to API */
async function sendMessage() {
  const questionInput = document.getElementById("questionInput");
  const sendButton = document.getElementById("sendButton");
  const chatContainer = document.getElementById("chatContainer");

  const question = questionInput.value.trim();

  if (!question) {
    alert("Please enter a question");
    return;
  }

  if (!loggedIn || !jwtToken) {
    alert("Please log in to use TestGPT");
    return;
  }

  if (isSending) {
    return;
  }

  isSending = true;
  sendButton.disabled = true;
  questionInput.disabled = true;

  /* Add user message to chat */
  addMessage("user", question);
  questionInput.value = "";

  /* Scroll to bottom */
  scrollToBottom();

  /* Show loading indicator */
  const loadingId = addLoadingMessage();

  /* Start tracking request time */
  const startTime = Date.now();

  try {
    /* Send POST request to API */
    const response = await fetch(`${apiUrl}/testgpt`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${jwtToken}`
      },
      body: JSON.stringify({ question })
    });

    const elapsed = Date.now() - startTime;

    /* Remove loading indicator */
    removeLoadingMessage(loadingId);

    /* Handle errors */
    if (!response.ok) {
      let errorMessage = "An error occurred";

      if (response.status === 401) {
        errorMessage = "Your session has expired. Please log in again.";
      } else if (response.status === 403) {
        errorMessage = "You don't have permission to use this service.";
      } else if (response.status === 429) {
        errorMessage = "Slow down! You're being rate limited. Wait before trying again.";
      } else if (response.status >= 500) {
        errorMessage = "Server error. Please try again later.";
      }

      /* Log error */
      logRequest('error', response.status, elapsed, errorMessage);

      /* Show error message in chat */
      addMessage("error", `❌ ${errorMessage}`);

      scrollToBottom();

      /* Re-enable input after 3 seconds */
      setTimeout(() => {
        sendButton.disabled = false;
        questionInput.disabled = false;
        isSending = false;
      }, 3000);

      return;
    }

    /* Get AI response */
    const data = await response.json();
    const answer = data.reply || data.answer || "No response";

    /* Log success */
    logRequest('success', 200, elapsed);

    /* Add AI message to chat with animation */
    addMessage("assistant", answer, true);

    scrollToBottom();

  } catch (err) {
    const elapsed = Date.now() - startTime;

    /* Remove loading indicator */
    removeLoadingMessage(loadingId);

    /* Log error */
    logRequest('error', 0, elapsed, err.message);

    /* Show error in chat */
    addMessage("error", `❌ Network error: ${err.message}`);

    scrollToBottom();
  }

  /* Save messages to localStorage */
  saveMessagesToLocalStorage();

  /* Re-enable input after 3 seconds */
  setTimeout(() => {
    sendButton.disabled = false;
    questionInput.disabled = false;
    isSending = false;
  }, 3000);
}

/* Add Message to Chat */
function addMessage(role, content, animate = false) {
  const chatContainer = document.getElementById("chatContainer");

  const messageDiv = document.createElement("div");
  messageDiv.className = `message ${role === "user" ? "user-message" : role === "error" ? "ai-message" : "ai-message"}`;

  const contentDiv = document.createElement("div");
  contentDiv.className = "message-content";

  if (animate && role === "assistant") {
    /* Super fast word-by-word animation */
    animateText(contentDiv, content);
  } else {
    /* Render markdown for AI messages */
    if (role === "assistant") {
      contentDiv.innerHTML = renderMarkdown(content);
    } else {
      contentDiv.textContent = content;
    }
  }

  messageDiv.appendChild(contentDiv);

  /* Add copy button for AI messages */
  if (role === "assistant") {
    const copyBtn = document.createElement("button");
    copyBtn.className = "copy-btn";
    copyBtn.textContent = "📋 Copy";
    copyBtn.onclick = function() {
      copyToClipboard(content, copyBtn);
    };
    messageDiv.appendChild(copyBtn);
  }

  chatContainer.appendChild(messageDiv);

  /* Store message */
  messages.push({ role, content, timestamp: Date.now() });

  return messageDiv;
}

/* Animate Text Word by Word (Super Fast) */
function animateText(element, text) {
  const words = text.split(' ');
  let index = 0;
  let fullText = "";

  const interval = setInterval(() => {
    if (index < words.length) {
      fullText += words[index] + ' ';
      element.innerHTML = renderMarkdown(fullText);
      index++;
      scrollToBottom();
    } else {
      clearInterval(interval);
      /* Save to localStorage after animation completes */
      saveMessagesToLocalStorage();
    }
  }, 15); /* 15ms per word = super fast like ChatGPT */
}

/* Simple Markdown Renderer */
function renderMarkdown(text) {
  /* Bold */
  text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

  /* Italic */
  text = text.replace(/\*(.*?)\*/g, '<em>$1</em>');

  /* Inline code */
  text = text.replace(/`([^`]+)`/g, '<code>$1</code>');

  /* Code blocks */
  text = text.replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre><code>$2</code></pre>');

  /* Line breaks */
  text = text.replace(/\n/g, '<br>');

  return text;
}

/* Add Loading Message */
function addLoadingMessage() {
  const chatContainer = document.getElementById("chatContainer");

  const messageDiv = document.createElement("div");
  messageDiv.className = "message ai-message";
  messageDiv.id = "loading-message";

  const contentDiv = document.createElement("div");
  contentDiv.className = "message-content loading-dots";
  contentDiv.innerHTML = '<span>.</span><span>.</span><span>.</span>';

  messageDiv.appendChild(contentDiv);
  chatContainer.appendChild(messageDiv);

  scrollToBottom();

  return "loading-message";
}

/* Remove Loading Message */
function removeLoadingMessage(loadingId) {
  const loadingMsg = document.getElementById(loadingId);
  if (loadingMsg) {
    loadingMsg.remove();
  }
}

/* Copy to Clipboard */
function copyToClipboard(text, button) {
  const originalText = button.textContent;
  button.disabled = true;
  button.textContent = "✅ Copied!";

  navigator.clipboard.writeText(text).then(() => {
    setTimeout(() => {
      button.textContent = originalText;
      button.disabled = false;
    }, 2000);
  }).catch(err => {
    console.error('Copy failed:', err);
    button.textContent = originalText;
    button.disabled = false;
  });
}

/* Scroll Chat to Bottom */
function scrollToBottom() {
  const chatContainer = document.getElementById("chatContainer");
  chatContainer.scrollTop = chatContainer.scrollHeight;
}

/* Save Messages to localStorage */
function saveMessagesToLocalStorage() {
  localStorage.setItem("testgpt_messages", JSON.stringify(messages));
}

/* Load Messages from localStorage */
function loadMessagesFromLocalStorage() {
  const saved = localStorage.getItem("testgpt_messages");
  if (saved) {
    try {
      messages = JSON.parse(saved);

      /* Display all saved messages instantly (no animation) */
      messages.forEach(msg => {
        if (msg.role !== "error") {
          addMessage(msg.role, msg.content, false);
        }
      });

      scrollToBottom();
    } catch (err) {
      console.error('Failed to load messages:', err);
    }
  }
}

/* Log Request */
function logRequest(status, code, elapsed, error = null) {
  const log = {
    timestamp: Date.now(),
    status: status,
    code: code,
    elapsed: elapsed,
    error: error
  };

  requestLogs.push(log);
  updateLogsPanel();
}

/* Update Logs Panel */
function updateLogsPanel() {
  const logsContainer = document.getElementById("logsContainer");
  logsContainer.innerHTML = "";

  if (requestLogs.length === 0) {
    logsContainer.innerHTML = `
      <div class="log-entry">
        <span class="status-icon">⏳</span>
        <span class="status-text">No requests yet</span>
      </div>
    `;
    return;
  }

  /* Show last 10 logs */
  const recentLogs = requestLogs.slice(-10).reverse();

  recentLogs.forEach(log => {
    const logEntry = document.createElement("div");
    logEntry.className = "log-entry";

    const icon = log.status === 'success' ? '✅' : '❌';
    const statusText = log.status === 'success'
      ? `Request successful (${log.code})`
      : `Error: ${log.code || 'Network'}`;
    const timeText = `${(log.elapsed / 1000).toFixed(2)}s`;

    logEntry.innerHTML = `
      <span class="status-icon">${icon}</span>
      <span class="status-text">${statusText}</span>
      <span class="elapsed-time">${timeText}</span>
      ${log.error ? `<span class="error-msg">${log.error}</span>` : ''}
    `;

    logsContainer.appendChild(logEntry);
  });
}

/* Live Counter */
function startLiveCounter() {
  const liveCounter = document.getElementById("liveCounter");

  setInterval(() => {
    const liveTime = Math.floor((Date.now() - sessionStart) / 1000);
    const minutes = Math.floor(liveTime / 60);
    const seconds = liveTime % 60;
    liveCounter.textContent = minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;
  }, 1000);
}

/* Update Total Time Today */
function updateTotalTime() {
  const timeTodayElement = document.getElementById("timeToday");
  let totalTimeToday = parseInt(localStorage.getItem("timeToday") || "0");

  /* Update display */
  const totalMinutes = Math.floor(totalTimeToday / 1000 / 60);
  const totalSeconds = Math.floor((totalTimeToday / 1000) % 60);
  timeTodayElement.textContent = totalMinutes > 0 ? `${totalMinutes}m ${totalSeconds}s` : `${totalSeconds}s`;

  /* Save session time before page close */
  window.addEventListener("beforeunload", () => {
    const sessionTime = Date.now() - sessionStart;
    totalTimeToday += sessionTime;
    localStorage.setItem("timeToday", totalTimeToday.toString());
  });
}
