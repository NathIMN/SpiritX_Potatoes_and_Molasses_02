const playerData = {
  Messi: { age: 36, team: "Inter Miami", goals: 800, assists: 350 },
  Ronaldo: { age: 39, team: "Al-Nassr", goals: 850, assists: 250 },
  Mbappe: { age: 25, team: "PSG", goals: 250, assists: 100 },
  Neymar: { age: 32, team: "Al-Hilal", goals: 400, assists: 250 },
};

// Function to get player stats
function getPlayerStats(playerName) {
  const player = playerData[playerName];
  if (!player) return "I don’t have enough knowledge to answer that question.";

  return `Player: ${playerName} | Age: ${player.age} | Team: ${player.team} | Goals: ${player.goals} | Assists: ${player.assists}`;
}

// Function to suggest the best team (based on goals + assists)
function getBestTeam() {
  const sortedPlayers = Object.keys(playerData).sort((a, b) => {
    const aPoints = playerData[a].goals + playerData[a].assists;
    const bPoints = playerData[b].goals + playerData[b].assists;
    return bPoints - aPoints;
  });

  return "Best Team: " + sortedPlayers.slice(0, 11).join(", ");
}

// Handle user input
function handleUserQuery(query) {
  query = query.toLowerCase();

  if (query.includes("best team")) {
    return getBestTeam();
  }

  for (const player in playerData) {
    if (query.includes(player.toLowerCase())) {
      return getPlayerStats(player);
    }
  }

  return "I don’t have enough knowledge to answer that question.";
}

// async function sendMessage() {
//   const userInput = document.getElementById("userInput").value.trim();
//   if (userInput === "") return;

//   const chatbox = document.getElementById("chatbox");
//   chatbox.innerHTML += `<p class="user">${userInput}</p>`;

//   try {
//     // Send request to backend
//     const response = await fetch("http://localhost:3000/api/v1/spiriter/chat", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ prompt: userInput }),
//     });

//     const data = await response.json();
//     let botResponse =
//       data.reply || "I'm sorry, but I couldn't process your request.";

//     // Display bot response
//     setTimeout(() => {
//       chatbox.innerHTML += `<p class="bot">${botResponse}</p>`;
//       chatbox.scrollTop = chatbox.scrollHeight;
//     }, 500);
//   } catch (error) {
//     console.error("Error communicating with chatbot:", error);
//     chatbox.innerHTML += `<p class="bot">Error processing request. Try again later.</p>`;
//   }

//   document.getElementById("userInput").value = "";
// }

// Handle enter key

async function sendMessage() {
  const userInput = document.getElementById("userInput").value.trim();
  if (userInput === "") return;

  const chatbox = document.getElementById("chatbox");
  chatbox.innerHTML += `<p class="user">${userInput}</p>`;

  try {
    const response = await fetch("http://localhost:3000/api/v1/spiriter/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: userInput }),
    });

    const data = await response.json();
    let botResponse = data.reply || "I couldn't process your request.";

    setTimeout(() => {
      chatbox.innerHTML += `<p class="bot">${botResponse}</p>`;
      chatbox.scrollTop = chatbox.scrollHeight;
    }, 500);
  } catch (error) {
    console.error("Error:", error);
    chatbox.innerHTML += `<p class="bot">Error processing request.</p>`;
  }

  document.getElementById("userInput").value = "";
}

function handleKeyPress(event) {
  if (event.key === "Enter") {
    sendMessage();
  }
}

// Handle enter key
function handleKeyPress(event) {
  if (event.key === "Enter") {
    sendMessage();
  }
}
