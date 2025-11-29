const input = document.getElementById("searchInput");
const searchArea = document.getElementById("searchArea");
const openSearch = document.getElementById("openSearch");
const barra = document.querySelector(".barra");

openSearch.addEventListener("click", () => {
  const open = searchArea.classList.toggle("show-search");
  barra.classList.toggle("move-down", open);
});

const rotas = {
  "chevrolet": "/components/chevrolet.html",
  "mitsubishi": "/components/mit.html",
  "fiat": "/components/fiat.html",
  "audi": "/components/audi.html"
};

input.addEventListener("input", () => {
  const termo = input.value.toLowerCase();
  document.querySelectorAll(".botao").forEach(btn => {
    const img = btn.querySelector("img");
    const nome = img.alt.toLowerCase();
    btn.style.display = nome.includes(termo) ? "block" : "none";
  });
});

document.getElementById("searchBtn").addEventListener("click", () => {
  const termo = input.value.toLowerCase();
  if (rotas[termo]) {
    window.location.href = rotas[termo];
  } else {
    alert("Marca não encontrada.");
  }
});
