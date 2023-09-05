// On cible le formulaire

document.formLogin.addEventListener("submit", async function (e) {
  e.preventDefault();

  // user email et password
  const user = {
    email: this.email.value,
    password: this.password.value,
  };

  // fetch pour vérifier back

  const reponse = await fetch("http://localhost:5678/api/users/login", {
    method: "POST",
    headers: {
      accept: "application/json",
      "content-type": "application/json",
    },
    body: JSON.stringify(user),
  });

  // récupération des données si les identifiants sont bons alors la connexion se fait

  const data = await reponse.json();
  if (data.token) {
    window.localStorage.setItem("userToken", JSON.stringify(data));
    document.location.href = "index.html";
    alert("Bienvenue !");

    // si id faux, message erreur
  } else if (data.message) {
    alert("L'utilisateur n'est pas enregistré.");
  } else {
    alert("L'adresse mail ou le mot de passe ne correspond pas.");
  }
});
