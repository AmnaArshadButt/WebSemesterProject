// products.js — handles instant filtering, debounced search, quick-view modal, and add-to-cart UI
document.addEventListener('DOMContentLoaded', function () {
  const form = document.getElementById('filters-form');
  if (!form) return;

  // Auto-submit on select/change and debounced search input
  const debounce = (fn, wait) => {
    let t;
    return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), wait); };
  };

  const qInput = form.querySelector('input[name="q"]');
  const categoryInput = form.querySelector('select[name="category"]');
  const minPriceInput = form.querySelector('input[name="minPrice"]');
  const maxPriceInput = form.querySelector('input[name="maxPrice"]');
  const sortInput = form.querySelector('select[name="sort"]');

  const resetFilterInputs = () => {
    if (categoryInput) categoryInput.value = '';
    if (minPriceInput) minPriceInput.value = '0';
    if (maxPriceInput) maxPriceInput.value = '';
  };

  const resetSearchInput = () => {
    if (qInput) qInput.value = '';
  };

  if (qInput) {
    qInput.addEventListener('input', debounce(() => {
      resetFilterInputs();
      form.submit();
    }, 600));
  }

  [categoryInput, minPriceInput, maxPriceInput].forEach((el) => {
    if (!el) return;
    el.addEventListener('change', () => {
      resetSearchInput();
      form.submit();
    });
  });

  if (sortInput) {
    sortInput.addEventListener('change', () => {
      form.submit();
    });
  }

  // Reset filters button
  const resetBtn = document.getElementById('reset-filters');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      if (qInput) qInput.value = '';
      if (categoryInput) categoryInput.value = '';
      if (minPriceInput) minPriceInput.value = '0';
      if (maxPriceInput) maxPriceInput.value = '';
      if (sortInput) sortInput.value = '';
      form.submit();
    });
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
    if (modalColors) {
      modalColors.innerHTML = '';
      if (data.colors) {
        data.colors.split(',').forEach(c => {
          const span = document.createElement('span');
          span.className = 'color-swatch';
          span.textContent = c.trim();
          modalColors.appendChild(span);
        });
      }
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

    // View button: open small quick-card popup near the product card
    if (viewBtn) viewBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      openQuickCard(card, data);
    });

    if (cartBtn) cartBtn.addEventListener('click', () => {
      // simple visual confirmation
      cartBtn.classList.add('added');
      setTimeout(() => cartBtn.classList.remove('added'), 900);
    });
  });

  // Quick-card popup (small inline product card)
  let quickCardEl = null;
  function createQuickCard() {
    quickCardEl = document.createElement('div');
    quickCardEl.className = 'quick-card';
    quickCardEl.innerHTML = `
      <div class="quick-card-inner">
        <img class="qc-image" src="" alt="">
        <div class="qc-body">
          <h4 class="qc-title"></h4>
          <p class="qc-price"></p>
          <div class="qc-colors"></div>
          <div class="qc-actions">
            <button class="qc-add btn-small">Add</button>
            <button class="qc-more btn-small">View</button>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(quickCardEl);

    // close when clicking outside
    document.addEventListener('click', (ev) => {
      if (!quickCardEl) return;
      if (!quickCardEl.contains(ev.target)) hideQuickCard();
    });
  }

  function openQuickCard(cardEl, data) {
    if (!quickCardEl) createQuickCard();
    const img = quickCardEl.querySelector('.qc-image');
    const title = quickCardEl.querySelector('.qc-title');
    const price = quickCardEl.querySelector('.qc-price');
    const colors = quickCardEl.querySelector('.qc-colors');
    const addBtn = quickCardEl.querySelector('.qc-add');
    const moreBtn = quickCardEl.querySelector('.qc-more');

    img.src = data.image || '';
    img.alt = data.name || '';
    title.textContent = data.name || '';
    price.textContent = `$${Number(data.price).toFixed(2)}`;
    colors.innerHTML = '';
    if (data.colors) data.colors.split(',').forEach(c => {
      const s = document.createElement('span'); s.className = 'color-swatch'; s.textContent = c.trim(); colors.appendChild(s);
    });

    addBtn.onclick = (ev) => { ev.stopPropagation(); addBtn.textContent = 'Added'; setTimeout(() => addBtn.textContent = 'Add', 900); hideQuickCard(); };
    moreBtn.onclick = (ev) => { ev.stopPropagation(); openModal(data); hideQuickCard(); };

    // position near card
    const rect = cardEl.getBoundingClientRect();
    quickCardEl.style.top = `${window.scrollY + rect.top + 10}px`;
    quickCardEl.style.left = `${rect.right + 12}px`;
    quickCardEl.classList.add('is-open');
  }

  function hideQuickCard() {
    if (!quickCardEl) return;
    quickCardEl.classList.remove('is-open');
  }

 
});
