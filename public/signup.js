document.addEventListener("DOMContentLoaded", () => {
  const signUpBtn = document.getElementById("signUpBtn");
  const usernameInput = document.getElementById("username");
  const passwordInput = document.getElementById("pw");
  const confirmPasswordInput = document.getElementById("repw");

  const errorAuth = document.querySelector(".error-auth");
  const errorUsername = document.querySelector(".error-un");
  const errorPassword = document.querySelector(".error-pw");
  const errorConfirmPassword = document.querySelector(".error-repw");

  const passwordStrengthDiv = document.getElementById("pw-strength");

  const passwordRegEx = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*]).{8,}$/; // Password regex

  // Function to check username uniqueness
  const checkUsernameUnique = async (username) => {
    try {
      const response = await axios.get("http://localhost:3000/api/v1/users");
      const users = Array.isArray(response.data.users)
        ? response.data.users
        : [];

      const usernameExists = users.some((user) => user.username === username);
      if (usernameExists) {
        errorUsername.textContent =
          "* Username is already taken. Please choose a different one.";
        errorUsername.classList.remove("d-none");
        errorUsername.classList.add("d-block");
        return false;
      } else {
        errorUsername.classList.remove("d-block");
        errorUsername.classList.add("d-none");
        return true;
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      return false;
    }
  };

  // Real-time validation for username
  usernameInput.addEventListener("input", async () => {
    const usernameValue = usernameInput.value;

    if (usernameValue.length < 8) {
      errorUsername.textContent =
        "* Username must be at least 8 characters long";
      errorUsername.classList.remove("d-none");
      errorUsername.classList.add("d-block");
    } else {
      const isUnique = await checkUsernameUnique(usernameValue);
      if (!isUnique) {
        errorUsername.classList.remove("d-none");
        errorUsername.classList.add("d-block");
      } else {
        errorUsername.classList.remove("d-block");
        errorUsername.classList.add("d-none");
      }
    }
  });

  // Real-time validation for password
  passwordInput.addEventListener("input", () => {
    const passwordValue = passwordInput.value;
    const passwordStrengthIcons = document.querySelectorAll("#pw-strength i");

    // Initial state
    passwordStrengthIcons.forEach((icon) => {
      icon.classList.remove("text-success");
      icon.classList.add("text-danger");
      icon.classList.remove("bi-check-circle-fill");
      icon.classList.add("bi-x-circle-fill");
    });

    if (passwordValue.length >= 8) {
      passwordStrengthIcons[0].classList.remove("text-danger");
      passwordStrengthIcons[0].classList.add("text-success");
      passwordStrengthIcons[0].classList.remove("bi-x-circle-fill");
      passwordStrengthIcons[0].classList.add("bi-check-circle-fill");
    }

    if (/[a-z]/.test(passwordValue)) {
      passwordStrengthIcons[1].classList.remove("text-danger");
      passwordStrengthIcons[1].classList.add("text-success");
      passwordStrengthIcons[1].classList.remove("bi-x-circle-fill");
      passwordStrengthIcons[1].classList.add("bi-check-circle-fill");
    }

    if (/[A-Z]/.test(passwordValue)) {
      passwordStrengthIcons[2].classList.remove("text-danger");
      passwordStrengthIcons[2].classList.add("text-success");
      passwordStrengthIcons[2].classList.remove("bi-x-circle-fill");
      passwordStrengthIcons[2].classList.add("bi-check-circle-fill");
    }

    if (/[!@#$%^&*]/.test(passwordValue)) {
      passwordStrengthIcons[3].classList.remove("text-danger");
      passwordStrengthIcons[3].classList.add("text-success");
      passwordStrengthIcons[3].classList.remove("bi-x-circle-fill");
      passwordStrengthIcons[3].classList.add("bi-check-circle-fill");
    }

    if (!passwordRegEx.test(passwordValue)) {
      errorPassword.textContent =
        "* Must be at least 8 characters in length containing at least one lowercase letter, uppercase letter and special character";
      errorPassword.classList.remove("d-none");
      errorPassword.classList.add("d-block");

      passwordStrengthDiv.classList.remove("d-none");
      passwordStrengthDiv.classList.add("d-block");
    } else {
      errorPassword.classList.remove("d-block");
      errorPassword.classList.add("d-none");
    }
  });

  // Real-time validation for confirm password
  confirmPasswordInput.addEventListener("input", () => {
    const passwordValue = passwordInput.value;
    const confirmPasswordValue = confirmPasswordInput.value;

    if (passwordValue !== confirmPasswordValue) {
      errorConfirmPassword.textContent = "* Passwords do not match";
      errorConfirmPassword.classList.remove("d-none");
      errorConfirmPassword.classList.add("d-block");
    } else {
      errorConfirmPassword.classList.remove("d-block");
      errorConfirmPassword.classList.add("d-none");
    }
  });

  // Handle form submission
  signUpBtn.addEventListener("click", async (e) => {
    e.preventDefault();

    const username = usernameInput.value;
    const password = passwordInput.value;
    const confirmPassword = confirmPasswordInput.value;

    // Validate fields before submission
    if (!username || !password || !confirmPassword) {
      if (!username) errorUsername.textContent = "* Username is required";
      if (!password) errorPassword.textContent = "* Password is required";
      if (!confirmPassword)
        errorConfirmPassword.textContent = "* Confirm Password is required";

      errorUsername.classList.toggle("d-none", !!username);
      errorPassword.classList.toggle("d-none", !!password);
      errorConfirmPassword.classList.toggle("d-none", !!confirmPassword);

      return;
    }

    if (username.length < 8) {
      errorUsername.textContent =
        "* Username must be at least 8 characters long";
      errorUsername.classList.remove("d-none");
      errorUsername.classList.add("d-block");
      return;
    }

    const isUnique = await checkUsernameUnique(username);
    if (!isUnique) {
      return;
    }

    if (!passwordRegEx.test(password)) {
      errorPassword.textContent =
        "* Password must have at least one lowercase letter, one uppercase letter, and one special character";
      errorPassword.classList.remove("d-none");
      errorPassword.classList.add("d-block");
      return;
    }

    if (password !== confirmPassword) {
      errorConfirmPassword.textContent = "* Passwords do not match";
      errorConfirmPassword.classList.remove("d-none");
      errorConfirmPassword.classList.add("d-block");
      return;
    }

    try {
      // create user
      const response = await axios.post("http://localhost:3000/api/v1/users", {
        username,
        password,
      });

      if (response.status === 201) {
        console.log("User registered successfully", response.data);
        const successMessage = document.createElement("div");
        successMessage.classList.add("alert", "alert-success", "text-center");
        successMessage.textContent =
          "User Registered Successfully! Redirecting to sign-in page...";
        document.body.appendChild(successMessage);
        //window.alert("User Registered Successfully!");
        setTimeout(() => {
          successMessage.style.display = 'none';
          window.location.href = "/signin";
        }, 2000);
      }
    } catch (error) {
      if (
        error.response &&
        error.response.data.msg === "Username already taken"
      ) {
        errorAuth.textContent =
          "Username is already taken. Please choose a different one.";
        errorAuth.classList.remove("d-none");
        errorAuth.classList.add("d-block");
      }
      console.error("Signup error:", error);
    }
  });
});
