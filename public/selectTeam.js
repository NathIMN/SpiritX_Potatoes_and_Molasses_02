const playerDataElement = document.getElementById("player-data");

const players = {
  Batsmen: JSON.parse(playerDataElement.getAttribute("data-batsmen") || "[]"),
  Bowlers: JSON.parse(playerDataElement.getAttribute("data-bowlers") || "[]"),
  "All-rounders": JSON.parse(
    playerDataElement.getAttribute("data-allrounders") || "[]"
  ),
};

let selectedPlayers = [];
let budget = 9000000;

function showTab(tab) {
  document.getElementById("create-team").style.display =
    tab === "create-team" ? "block" : "none";
  document.getElementById("team").style.display =
    tab === "team" ? "block" : "none";
  if (tab === "team") updateTeamTab();
}

function loadPlayers(category) {
  const playerList = document.getElementById("player-list");
  playerList.innerHTML = "";

  players[category].forEach((player) => {
    const div = document.createElement("div");
    div.classList.add("player-card");
    let expr1, expr2, expr3, expr4;
    if (player.ballsFaced > 0) {
      expr1 = (player.totalRuns * 20) / player.ballsFaced;
    } else {
      expr1 = 0;
    }
    if (player.inningsPlayed > 0) {
      expr2 = (player.totalRuns * 0.8) / player.inningsPlayed;
    } else {
      expr2 = 0;
    }
    if (player.oversBowled > 0) {
      expr3 = (500 * player.wickets) / (6 * player.oversBowled);
    } else {
      expr3 = 0;
    }
    if (player.runsConceded > 0) {
      expr4 = (140 * player.oversBowled) / player.runsConceded;
    } else {
      expr4 = 0;
    }
    player.points = expr1 + expr2 + expr3 + expr4;
    player.cost = (9 * player.points + 100) * 1000;
    player.cost = Math.round(player.cost);
    div.innerHTML = `<p>${player.name}</p><p>${player.university}</p><p>Rs. ${player.cost}</p>`;
    const btn = document.createElement("button");
    btn.textContent = "Add";
    btn.onclick = () => addPlayer(player);
    div.appendChild(btn);
    playerList.appendChild(div);
  });
}

function addPlayer(player) {
  // Prevent duplicate selection
  if (selectedPlayers.some((p) => p._id === player._id)) {
    alert("Player already selected!");
    return;
  }

  // Check budget and player count
  if (budget - player.cost >= 0 && selectedPlayers.length < 11) {
    //if(1){
    selectedPlayers.push(player);
    budget -= player.cost;
    updateUI();
  } else {
    alert("Cannot add more players or exceed budget!");
  }
}

function removePlayer(player) {
  selectedPlayers = selectedPlayers.filter((p) => p._id !== player._id);
  budget += player.cost;
  updateUI();
}

function updateUI() {
  document.querySelector(
    ".budget"
  ).textContent = `Rs. ${budget.toLocaleString()}`;
  document.querySelector(
    ".players-selected"
  ).textContent = `Players Selected: ${selectedPlayers.length}/11`;

  const selectedList = document.getElementById("selected-players");
  selectedList.innerHTML = ""; // Clear previous list

  selectedPlayers.forEach((player) => {
    const div = document.createElement("div");
    div.classList.add("player-card");
    div.innerHTML = `<p>${player.name}</p><p>${player.university}</p><p>Rs. ${player.cost}</p>`;

    const btn = document.createElement("button");
    btn.classList.add("remove");
    btn.textContent = "Remove";
    btn.onclick = () => removePlayer(player);

    div.appendChild(btn);
    selectedList.appendChild(div);
  });
}

function updateTeamTab() {
  const teamList = document.getElementById("team-players");
  teamList.innerHTML = "";
  let totalPoints = 0;
  selectedPlayers.forEach((player) => {
    totalPoints += player.points;
    const div = document.createElement("div");
    div.classList.add("player-card");
    div.innerHTML = `<p>${player.name}</p><p>${player.university}</p>`;
    teamList.appendChild(div);
  });
  if (selectedPlayers.length === 11) {
    document.getElementById(
      "total-points"
    ).textContent = `Total Team Points: ${totalPoints}`;
    document.getElementById("total-points").style.display = "block";
  } else {
    document.getElementById("total-points").style.display = "none";
  }
}

function submitTeam() {
  // Check if we have exactly 11 players
  if (selectedPlayers.length !== 11) {
      alert("You must select exactly 11 players!");
      return;
  }

  // Get player IDs for the backend
  const playerIds = selectedPlayers.map(player => player._id);

  // Make the API call using axios (since you're including it)
  axios.post("http://localhost:3000/api/v1/teams", {
      playerIds: playerIds
  })
  .then(response => {
      if (response.data.success) {
          alert("Team created successfully!");
          // Redirect to team page or show team tab
          showTab("team");
      } else {
          alert(response.data.msg || "Error creating team");
      }
  })
  .catch(error => {
      console.error("Error:", error);
      alert(error.response?.data?.msg || "Something went wrong!");
  });
}
  
