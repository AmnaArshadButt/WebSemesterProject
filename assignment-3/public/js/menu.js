
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
        const productContainers = document.querySelectorAll(".div-img-container");
        const firstProductContainer = productContainers[0] || null;
        const secondProductContainer = productContainers[1] || null;
        const featuredGrid = $("#featured-deals-grid");

        if (!firstProductContainer && !secondProductContainer && !featuredGrid.length) {
            return;
        }

        const createQuickViewButton = (productIndex) =>
            `<button type="button" class="quick-view-btn" data-product-index="${productIndex}">Quick View</button>`;

        const ensureQuickViewModal = () => {
            let modal = document.getElementById("quick-view-modal");

            if (!modal) {
                const modalMarkup = `
                    <div class="quick-view-modal" id="quick-view-modal" aria-hidden="true">
                        <div class="quick-view-dialog" role="dialog" aria-modal="true" aria-labelledby="quick-view-title">
                            <button type="button" class="quick-view-close" aria-label="Close quick view">&times;</button>
                            <h3 id="quick-view-title">Product Details</h3>
                            <p class="quick-view-description"></p>
                            <p class="quick-view-rating"></p>
                        </div>
                    </div>
                `;
                document.body.insertAdjacentHTML("beforeend", modalMarkup);
                modal = document.getElementById("quick-view-modal");
            }

            const closeButton = modal.querySelector(".quick-view-close");

            closeButton.addEventListener("click", function () {
                modal.classList.remove("is-open");
                modal.setAttribute("aria-hidden", "true");
                document.body.classList.remove("quick-view-open");
            });

            modal.addEventListener("click", function (event) {
                if (event.target === modal) {
                    modal.classList.remove("is-open");
                    modal.setAttribute("aria-hidden", "true");
                    document.body.classList.remove("quick-view-open");
                }
            });

            return modal;
        };

        const quickViewModal = ensureQuickViewModal();

        const openQuickView = (product) => {
            const description = quickViewModal.querySelector(".quick-view-description");
            const rating = quickViewModal.querySelector(".quick-view-rating");

            description.textContent = product.description || "No description available.";

            if (product.rating) {
                rating.textContent = `Rating: ${product.rating.rate}/5 (${product.rating.count} reviews)`;
            } else {
                rating.textContent = "Rating: Not available";
            }

            quickViewModal.classList.add("is-open");
            quickViewModal.setAttribute("aria-hidden", "false");
            document.body.classList.add("quick-view-open");
        };

        const bindQuickViewButtons = (container, products) => {
            if (!container || !products.length) {
                return;
            }

            const buttons = container.querySelectorAll(".quick-view-btn");
            buttons.forEach(function (button) {
                button.addEventListener("click", function () {
                    const index = Number(button.dataset.productIndex || 0);
                    openQuickView(products[index % products.length]);
                });
            });
        };

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
                        .map(function (product, index) {
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
                                    ${createQuickViewButton(index % products.length)}
                                </div>
                            `;
                        })
                        .join("");

                    firstProductContainer.innerHTML = carouselCards;
                    bindQuickViewButtons(firstProductContainer, products);
                }

                if (secondProductContainer) {
                    const secondCards = secondProductContainer.querySelectorAll(".div-img-info");

                    secondCards.forEach(function (card, index) {
                        const existingButton = card.querySelector(".quick-view-btn");

                        if (existingButton) {
                            existingButton.dataset.productIndex = index % products.length;
                            return;
                        }

                        card.insertAdjacentHTML("beforeend", createQuickViewButton(index % products.length));
                    });

                    bindQuickViewButtons(secondProductContainer, products);
                }

                if (featuredGrid.length) {
                    const featuredCards = products
                        .map(function (product, index) {
                            return `
                                <article class="featured-deal-card">
                                    <img src="${product.image}" alt="${product.title}">
                                    <h3>${product.title}</h3>
                                    <p>$${product.price}</p>
                                    ${createQuickViewButton(index)}
                                </article>
                            `;
                        })
                        .join("");

                    featuredGrid.empty();
                    featuredGrid.html(featuredCards);
                    bindQuickViewButtons(featuredGrid[0], products);
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
