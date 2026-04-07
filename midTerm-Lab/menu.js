
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
        const firstProductContainer = document.querySelector(".div-img-container");
        const featuredGrid = $("#featured-deals-grid");

        if (!firstProductContainer && !featuredGrid.length) {
            return;
        }

        if (firstProductContainer) {
            firstProductContainer.innerHTML = '<p class="carousel-loading">Loading products...</p>';
        }

        $.ajax({
            url: "https://fakestoreapi.com/products?limit=4",
            method: "GET",
            dataType: "json",
        })
            .done(function (products) {
                if (firstProductContainer) {
                    const repeatedProducts = products.concat(products, products);
                    const carouselCards = repeatedProducts
                        .map(function (product) {
                            return `
                                <div class="div-img-info">
                                    <div class="heart-icon-div">
                                        <img class="heart-icon" src="icons/heart-svgrepo-com.svg" alt="Heart Icon" />
                                        <img class="heart-icon-filled" src="icons/filledheart.svg" alt="Heart Filled" />
                                    </div>
                                    <img src="${product.image}" alt="${product.title}">
                                    <span>
                                        <h5>${product.category}</h5>
                                        <h2>${product.title}</h2>
                                        <p>$${product.price}</p>
                                        <p>NEW</p>
                                    </span>
                                </div>
                            `;
                        })
                        .join("");

                    firstProductContainer.innerHTML = carouselCards;
                }

                if (featuredGrid.length) {
                    const featuredCards = products
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

                    featuredGrid.empty();
                    featuredGrid.html(featuredCards);
                }
            })
            .fail(function () {
                if (firstProductContainer) {
                    firstProductContainer.innerHTML = '<p class="carousel-loading">Unable to load products.</p>';
                }

                if (featuredGrid.length) {
                    featuredGrid.html('<p class="featured-deals-error">Unable to load featured deals.</p>');
                }
            });
    });
}
