// products.js — handles instant filtering, debounced search, quick-view modal, and add-to-cart UI
document.addEventListener('DOMContentLoaded', function () {
  const form = document.getElementById('filters-form');
  if (!form) return;

  // Auto-submit on select/change and debounced search input
  const debounce = (fn, wait) => {
    let t;
    return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), wait); };
  };

  const submitForm = () => { form.submit(); };

  form.querySelectorAll('select, input[type="number"]').forEach(el => {
    el.addEventListener('change', submitForm);
  });

  const qInput = form.querySelector('input[name="q"]');
  if (qInput) {
    qInput.addEventListener('input', debounce(() => { form.submit(); }, 400));
  }

  // Quick-view modal
  const modal = document.getElementById('product-modal');
  const modalImage = document.getElementById('modal-image');
  const modalTitle = document.getElementById('modal-title');
  const modalPrice = document.getElementById('modal-price');
  const modalDesc = document.getElementById('modal-desc');
  const modalColors = document.getElementById('modal-colors');
  const modalClose = document.getElementById('modal-close');
  let lastProductData = null;

  function openModal(data) {
    lastProductData = data;
    modalImage.src = data.image || '';
    modalImage.alt = data.name || '';
    modalTitle.textContent = data.name || '';
    modalPrice.textContent = `$${Number(data.price).toFixed(2)}`;
    modalDesc.textContent = data.description || '';
    modalColors.innerHTML = '';
    if (data.colors) {
      data.colors.split(',').forEach(c => {
        const span = document.createElement('span');
        span.className = 'color-swatch';
        span.textContent = c.trim();
        modalColors.appendChild(span);
      });
    }
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
  }

  function closeModal() {
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
  }

  modalClose.addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });

  // Bind card buttons
  document.querySelectorAll('.product-card').forEach(card => {
    const viewBtn = card.querySelector('.view-btn');
    const cartBtn = card.querySelector('.cart-btn');
    const data = {
      id: card.dataset.id,
      name: card.dataset.name,
      price: card.dataset.price,
      description: card.dataset.description,
      colors: card.dataset.colors,
      image: card.dataset.image
    };

    if (viewBtn) viewBtn.addEventListener('click', () => openModal(data));

    if (cartBtn) cartBtn.addEventListener('click', () => {
      // simple visual confirmation
      cartBtn.classList.add('added');
      setTimeout(() => cartBtn.classList.remove('added'), 900);
    });
  });

  // modal add to cart
  const modalAdd = document.getElementById('modal-add-cart');
  if (modalAdd) modalAdd.addEventListener('click', () => {
    // visual feedback
    modalAdd.textContent = 'Added';
    setTimeout(() => modalAdd.textContent = 'Add to cart', 900);
    closeModal();
  });
});
