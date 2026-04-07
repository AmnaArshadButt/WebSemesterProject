
const menuToggle = document.querySelector(".menu-toggle");
const navMenu = document.querySelector(".nav-menu");
const navLinks = document.querySelectorAll(".nav-menu a");
const MOBILE_NAV_BREAKPOINT = 1300;

if (menuToggle && navMenu) {
    const closeMenu = () => {
        navMenu.classList.remove("active");
        menuToggle.classList.remove("is-open");
        menuToggle.setAttribute("aria-expanded", "false");
    };

    menuToggle.addEventListener("click", () => {
        const isOpen = navMenu.classList.toggle("active");
        menuToggle.classList.toggle("is-open", isOpen);
        menuToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });

    navLinks.forEach((link) => {
        link.addEventListener("click", () => {
            if (window.innerWidth <= MOBILE_NAV_BREAKPOINT) {
                closeMenu();
            }
        });
    });

    window.addEventListener("resize", () => {
        if (window.innerWidth > MOBILE_NAV_BREAKPOINT) {
            closeMenu();
        }
    });
}

if (window.jQuery) {
    $(function () {
        const grid = $("#featured-deals-grid");

        if (!grid.length) {
            return;
        }

        $.ajax({
            url: "https://fakestoreapi.com/products?limit=4",
            method: "GET",
            dataType: "json",
        })
            .done(function (products) {
                const cards = products
                    .map(function (product) {
                        return `
                            <article class="featured-deal-card">
                                <img src="${product.image}" alt="${product.title}">
                                <h3>${product.title}</h3>
                                <p>$${product.price}</p>
                            </article>
                        `;
                    })
                    .join("");

                grid.html(cards);
            })
            .fail(function () {
                grid.html('<p class="featured-deals-error">Unable to load featured deals.</p>');
            });
    });
}
