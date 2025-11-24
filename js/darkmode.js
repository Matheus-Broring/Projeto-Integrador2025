const toggle = document.querySelector("#darkToggle, #dark-mode-toggle");

if (localStorage.getItem("dark-mode") === "true") {
  document.body.classList.add("dark-mode");
  if (toggle) toggle.checked = true;
}

if (toggle) {
  toggle.addEventListener("change", () => {
    const ativo = toggle.checked;
    document.body.classList.toggle("dark-mode", ativo);
    localStorage.setItem("dark-mode", ativo);
  });
}
