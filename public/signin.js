document.getElementById("signInBtn").addEventListener("click", async function (e) {
  e.preventDefault();

  const username = document.getElementById("username").value;
  const pw = document.getElementById("pw").value;

  // Clear previous error messages
  document.querySelector(".error-auth").classList.add("d-none");
  document.querySelector(".error-un").classList.add("d-none");
  document.querySelector(".error-pw").classList.add("d-none");

  // Validate inputs
  if (!username || !pw) {
    if (!username) {
      document.querySelector(".error-un").classList.remove("d-none");
      document.querySelector(".error-un p").textContent = "Username is required!";
    }
    if (!pw) {
      document.querySelector(".error-pw").classList.remove("d-none");
      document.querySelector(".error-pw p").textContent = "Password is required!";
    }
    return;
  }

  // Make the API request to authenticate the user
  try {
    const response = await axios.post("http://localhost:3000/api/v1/users/auth", { username, password: pw });

    if (response.status === 200) {
      window.location.href = "/index";
    }
  } catch (error) {
    if (error.response) {
      const errorMessage = error.response.data.msg;

      if (errorMessage.includes("username")) {
        document.querySelector(".error-auth").classList.remove("d-none");
        document.querySelector(".error-auth p").textContent = errorMessage;
      } else if (errorMessage.includes("password")) {
        document.querySelector(".error-auth").classList.remove("d-none");
        document.querySelector(".error-auth p").textContent = errorMessage;
      } else {
        document.querySelector(".error-auth").classList.remove("d-none");
        document.querySelector(".error-auth p").textContent = "Authentication failed. Please try again.";
      }
    } else {
      document.querySelector(".error-auth").classList.remove("d-none");
      document.querySelector(".error-auth p").textContent = "Something went wrong. Please try again.";
    }
  }
});
