// Seleciona qualquer toggle que exista na página
const toggle = document.querySelector("#darkToggle, #dark-mode-toggle");

// Aplica o tema salvo
if (localStorage.getItem("dark-mode") === "true") {
  document.body.classList.add("dark-mode");
  if (toggle) toggle.checked = true;
}

// Listener para qualquer página
if (toggle) {
  toggle.addEventListener("change", () => {
    const ativo = toggle.checked;
    document.body.classList.toggle("dark-mode", ativo);
    localStorage.setItem("dark-mode", ativo);
  });
}
