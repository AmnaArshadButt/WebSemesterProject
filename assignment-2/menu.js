
const menuIcon = document.querySelector( ".navdiv-icons i");
const navMenu = document.querySelector(".nav-menu");

menuIcon.addEventListener("click", function() {

    navMenu.classList.toggle("active");

    if(menuIcon.classList.contains("menu")) {
        menuIcon.classList.remove("menu");
        menuIcon.classList.add("cross");
    } else {
        menuIcon.classList.remove("cross");
        menuIcon.classList.add("menu");
    }

});
