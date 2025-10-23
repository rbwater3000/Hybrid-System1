const menuBtn = document.getElementById("menu-btn");
const sidebar = document.getElementById("sidebar");
const closeBtn = document.getElementById("close-btn");

menuBtn.addEventListener("click", () => {
  sidebar.classList.add("active");
});

closeBtn.addEventListener("click", () => {
  sidebar.classList.remove("active");
});

// Optional submenu toggle
const toggleProducts = document.getElementById("toggle-products");
const submenuProducts = document.getElementById("submenu-products");

toggleProducts.addEventListener("click", () => {
  if (submenuProducts.style.display === "none") {
    submenuProducts.style.display = "block";
    toggleProducts.textContent = "−";
  } else {
    submenuProducts.style.display = "none";
    toggleProducts.textContent = "+";
  }
});
