let tableWorks;
let tableCategories;

async function fetchWorks() {
  let url = "http://localhost:5678/api/works";
  try {
    let res = await fetch(url);
    tableWorks = await res.json();
    return tableWorks;
  } catch (error) {
    console.log(error);
  }
}

async function fetchCategories() {
  let url = "http://localhost:5678/api/categories";
  try {
    let res = await fetch(url);
    let tableCategories = await res.json();
    return tableCategories;
  } catch (error) {
    console.log(error);
  }
}

async function displayWorks() {
  tableWorks = await fetchWorks();
  let galleryDiv = document.querySelector(".gallery");
  galleryDiv.innerHTML = "";


  for (i = 0; i < tableWorks.length; i++) {
    let figure = document.createElement("figure");
    let image = document.createElement("img");
    let caption = document.createElement("figcaption");
    galleryDiv.appendChild(figure);
    figure.append(image, caption);

    image.src = tableWorks[i].imageUrl;
    caption.innerText = tableWorks[i].title;
  }
}

async function displayCategories() {
  tableCategories = await fetchCategories();
  let filtersDiv = document.querySelector(".filters");

  for (i = 0; i < tableCategories.length; i++) {
    let btn = document.createElement("button");
    btn.className = "btnFilter";
    btn.value = tableCategories[i].name;
    btn.innerText = btn.value;
    filtersDiv.appendChild(btn);
  }
}

async function displayAll() {
  try {
    await displayWorks();
    await displayCategories();
  } catch (error) {
    console.log(error);
  }
}

displayAll().then(async () => {
  try {
    let galleryDiv = document.querySelector(".gallery");
    let btns = document.querySelectorAll(".btnFilter");
    let worksFiltered = new Set();

    function filterWorks() {
      btns.forEach(function (btn) {
        btn.addEventListener("click", function (event) {
          if (event.target.value == "All") {
            worksFiltered.clear();
            worksFiltered.add(tableWorks);
          } else {
            let filteredTableWorks = tableWorks.filter(
              (cat) => cat.category.name == event.target.value
            );
            worksFiltered.clear();
            worksFiltered.add(filteredTableWorks);
          }
          galleryDiv.innerHTML = "";

          let filterArray = Array.from(worksFiltered);

          for (i = 0; i < filterArray[0].length; i++) {
            let figure = document.createElement("figure");
            let image = document.createElement("img");
            let caption = document.createElement("figcaption");
            galleryDiv.appendChild(figure);
            figure.append(image, caption);

            image.src = filterArray[0][i]["imageUrl"];
            caption.innerText = filterArray[0][i]["title"];
          }
        });
      });
    }

    filterWorks();
  } catch (error) {
    console.log(error);
  }
});

let btnModify = document.querySelector(".btnModify");
let header = document.querySelector("header");
let adminHeader = document.querySelector(".admin_header");
let logDiv = document.querySelector("#log_gestion a");

if (localStorage.getItem("token")) {
  btnModify.hidden = false;
  adminHeader.hidden = false;
  logDiv.href = "#";
  logDiv.innerText = "logout";
  logDiv.setAttribute("onclick", "logout()");
  header.style.flexDirection = "column";
  adminHeader.style.display = "flex";
} else {
  btnModify.hidden = true;
  adminHeader.hidden = true;
}

function logout() {
  localStorage.removeItem("token");
  location.reload();
}

function openModal() {
  let modal = document.querySelector(".modal");
  let overlay = document.querySelector(".overlay");

  overlay.style.display = "block";
  modal.style.display = "block";

  let modal1 = document.querySelector(".modal__1");
  modal1.style.display = "block";

  let modal2 = document.querySelector(".modal__2");
  modal2.style.display = "none";

  let modalBody = document.querySelector(".modal__body");
  modalBody.innerHTML = "";
  tableWorks.forEach((item) => {
    let figure = document.createElement("figure");
    figure.className = "modal__figure";
    figure.id = item.id;
    let image = document.createElement("img");
    let icon = document.createElement("i");
    icon.className = "fa-solid fa-trash-can fa-sm";
    icon.setAttribute("onclick", "deleteWork(event)");
    let caption = document.createElement("figcaption");

    modalBody.append(figure);
    figure.append(image, icon, caption);

    image.src = item.imageUrl;
    caption.innerText = "éditer";
  });
}

function closeModal() {
  let modal = document.querySelector(".modal");
  let overlay = document.querySelector(".overlay");

  overlay.style.display = "none";
  modal.style.display = "none";

  let containerData = document.querySelector(".modal__data");
  containerData.style.display = "flex";
}

async function deleteWork(event) {
  let positionFig = Array.from(
    event.target.parentNode.parentNode.children
  ).indexOf(event.target.parentNode);

  try {
    await fetch(
      "http://localhost:5678/api/works/" + event.target.parentNode.id,
      {
        method: "DELETE",
        headers: {
          Authorization: "Bearer " + localStorage.token,
        },
      }
    )
      .then((res) => res.status)
      .then((res) => {
        if (res == "401" || res == "500") {
          alert("Erreur, veuillez vous reconnecter");
        } else {
          let figure = document.querySelector(".gallery").childNodes;
          figure[positionFig].remove();
          event.target.parentNode.remove();
          delete tableWorks[positionFig];
        }
      });
  } catch (error) {
    console.log(error);
  }
}

function changeModal() {
  let modal1 = document.querySelector(".modal__1");
  let modal2 = document.querySelector(".modal__2");
  let select = document.querySelector("#category");
  let containerImg = document.querySelector(".image__display");
  let containerData = document.querySelector(".modal__data");

  if ((modal1.style.display = "block")) {
    modal1.style.display = "none";
    modal2.style.display = "block";

    select.innerHTML = "";

    tableCategories.forEach((item) => {
      let option = document.createElement("option");
      option.value = item.id;
      option.innerText = item.name;
      select.appendChild(option);
    });

    containerImg.style.display = "none";
    containerData.style.display = "flex";
  } else {
    openModal();
  }
}

function addWork(event) {
  let title = document.querySelector("#title").value;
  let category = document.querySelector("#category").value;
  let file = document.querySelector("#imageFile");

  const formData = new FormData();
  formData.append("image", file.files[0]);
  formData.append("title", title);
  formData.append("category", category);

  event.preventDefault();

  fetch("http://localhost:5678/api/works", {
    method: "POST",
    headers: {
      Authorization: "Bearer " + localStorage.token,
    },
    body: formData,
  })
    .then((res) => res.status)
    .then((res) => {
      if (res == "201") {
        event.preventDefault();
        let msg = document.createElement("p");
        msg.className = "msg";
        msg.innerText = "L'oeuvre a bien été ajoutée";

        modal = document.querySelector(".modal");
        modal.innerHTML = "";
        modal.appendChild(msg);

        displayWorks();
      } else {
        alert("Erreur, un champs est manquant");
      }
    });
}

function showPreview(event) {
  if (event.target.files.length > 0) {
    let src = URL.createObjectURL(event.target.files[0]);
    let preview = document.getElementById("imgPreview");
    let containerImg = document.querySelector(".image__display");
    containerImg.style.display = "block";
    preview.src = src;

    let containerData = document.querySelector(".modal__data");
    containerData.style.display = "none";
  }
}

let iconBackModal = document.querySelector(".modal__change");

iconBackModal.addEventListener("click", () => {
  openModal();
});
