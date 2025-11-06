//Menu on small size (burger icon)
const menuToggle = document.getElementById('menu-toggle');
const sidebar = document.getElementById('sidebar');
const closeBtn = document.getElementById('close-btn');

menuToggle.addEventListener('click', () => {
  sidebar.classList.add('active');
});
closeBtn.addEventListener('click', () => {
  sidebar.classList.remove('active');
}); 

// submenu toggle
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

//Vasnish Container2
window.addEventListener("scroll", () => {
  const fadeElement = document.querySelector(".container2");
  const opacity = 1 - window.scrollY / 700;
  fadeElement.style.opacity = Math.max(opacity, 0);
});