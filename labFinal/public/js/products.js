// products.js — handles instant filtering, debounced search, quick-view modal, and quantity modal add-to-cart UI
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

  // Quantity Selection Modal
  let quantityModal = null;
  let selectedProductData = null;

  function createQuantityModal() {
    quantityModal = document.createElement('div');
    quantityModal.className = 'quantity-modal';
    quantityModal.innerHTML = `
      <div class="quantity-modal-overlay"></div>
      <div class="quantity-modal-content">
        <button class="quantity-modal-close">&times;</button>
        <div class="quantity-modal-product">
          <img class="qm-image" src="" alt="" />
          <div class="qm-info">
            <h3 class="qm-title"></h3>
            <p class="qm-price"></p>
            <p class="qm-stock"></p>
            <div class="quantity-selector">
              <label for="qm-quantity">Select Quantity:</label>
              <div class="quantity-input-group">
                <button type="button" class="qty-btn qty-minus">−</button>
                <input type="number" id="qm-quantity" class="qty-input" value="1" min="1" />
                <button type="button" class="qty-btn qty-plus">+</button>
              </div>
            </div>
            <div class="quantity-modal-actions">
              <button class="btn-add-to-cart">Add to Cart</button>
              <button class="btn-cancel">Cancel</button>
            </div>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(quantityModal);

    const closeBtn = quantityModal.querySelector('.quantity-modal-close');
    const overlay = quantityModal.querySelector('.quantity-modal-overlay');
    const minusBtn = quantityModal.querySelector('.qty-minus');
    const plusBtn = quantityModal.querySelector('.qty-plus');
    const qtyInput = quantityModal.querySelector('#qm-quantity');
    const addBtn = quantityModal.querySelector('.btn-add-to-cart');
    const cancelBtn = quantityModal.querySelector('.btn-cancel');

    closeBtn.addEventListener('click', closeQuantityModal);
    overlay.addEventListener('click', closeQuantityModal);
    cancelBtn.addEventListener('click', closeQuantityModal);

    minusBtn.addEventListener('click', (e) => {
      e.preventDefault();
      let val = parseInt(qtyInput.value, 10) || 1;
      if (val > 1) qtyInput.value = val - 1;
    });

    plusBtn.addEventListener('click', (e) => {
      e.preventDefault();
      let val = parseInt(qtyInput.value, 10) || 1;
      qtyInput.value = val + 1;
    });

    addBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const quantity = parseInt(qtyInput.value, 10) || 1;
      if (selectedProductData) {
        addToCart(selectedProductData.id, quantity, null);
        closeQuantityModal();
        setTimeout(updateCartCount, 500);
      }
    });
  }

  function openQuantityModal(productData) {
    if (!quantityModal) createQuantityModal();
    selectedProductData = productData;

    const img = quantityModal.querySelector('.qm-image');
    const title = quantityModal.querySelector('.qm-title');
    const price = quantityModal.querySelector('.qm-price');
    const stock = quantityModal.querySelector('.qm-stock');
    const qtyInput = quantityModal.querySelector('#qm-quantity');

    img.src = productData.image || '';
    img.alt = productData.name || '';
    title.textContent = productData.name || '';
    price.textContent = `Price: $${Number(productData.price).toFixed(2)}`;
    stock.textContent = `Stock Available: ${productData.stock || 0} units`;
    qtyInput.value = 1;
    qtyInput.max = productData.stock || 100;

    quantityModal.classList.add('is-open');
  }

  function closeQuantityModal() {
    if (quantityModal) {
      quantityModal.classList.remove('is-open');
    }
  }

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
      image: card.dataset.image,
      stock: parseInt(card.dataset.stock, 10) || 0
    };

    // View button: open small quick-card popup near the product card
    if (viewBtn) viewBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      openQuickCard(card, data);
    });

    // Cart button: open quantity modal
    if (cartBtn) {
      cartBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        openQuantityModal(data);
      });
    }
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

  // Add to cart function
  function addToCart(productId, quantity, btnElement) {
    fetch('/api/cart/add', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        productId: productId,
        quantity: quantity
      })
    })
    .then(response => {
      return response.json().then(data => ({ ok: response.ok, data }));
    })
    .then(({ ok, data }) => {
      if (ok && data.success) {
        // Visual feedback
        if (btnElement) {
          btnElement.classList.add('added');
          const originalContent = btnElement.innerHTML;
          btnElement.innerHTML = '<span class="material-icons">check</span>';
          setTimeout(() => {
            btnElement.classList.remove('added');
            btnElement.innerHTML = originalContent;
          }, 900);
        }
        // Show success message
        showNotification(`${data.message}`, 'success');
      } else {
        showNotification(data.error || 'Failed to add item to cart', 'error');
      }
    })
    .catch(err => {
      console.error('Error adding to cart:', err);
      showNotification('Failed to add item to cart', 'error');
    });
  }

  // Update cart count
  function updateCartCount() {
    fetch('/api/cart')
      .then(response => response.json())
      .then(data => {
        const badge = document.getElementById('cart-count');
        if (badge) {
          badge.textContent = data.totalItems || 0;
        }
      })
      .catch(err => console.error('Error updating cart count:', err));
  }

  // Show notification function
  function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 15px 20px;
      background: ${type === 'success' ? '#4caf50' : '#f44336'};
      color: white;
      border-radius: 4px;
      z-index: 9999;
      animation: slideIn 0.3s ease-in-out;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.style.animation = 'slideOut 0.3s ease-in-out';
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }

  // Add CSS for animations and modals
  if (!document.querySelector('style[data-cart]')) {
    const style = document.createElement('style');
    style.setAttribute('data-cart', 'true');
    style.textContent = `
      @keyframes slideIn {
        from { transform: translateX(400px); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
      @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(400px); opacity: 0; }
      }
      @keyframes modalFadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      .product-card .cart-btn.added {
        background-color: #4caf50;
      }

      /* Quantity Modal Styles */
      .quantity-modal {
        display: none;
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 9998;
      }

      .quantity-modal.is-open {
        display: block;
      }

      .quantity-modal-overlay {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.6);
        animation: modalFadeIn 0.3s ease-in-out;
      }

      .quantity-modal-content {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: white;
        border-radius: 12px;
        padding: 40px;
        max-width: 500px;
        width: 90%;
        max-height: 90vh;
        overflow-y: auto;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
        animation: modalFadeIn 0.3s ease-in-out;
      }

      .quantity-modal-close {
        position: absolute;
        top: 15px;
        right: 15px;
        background: none;
        border: none;
        font-size: 28px;
        cursor: pointer;
        color: #666;
        width: 30px;
        height: 30px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: color 0.2s;
      }

      .quantity-modal-close:hover {
        color: #333;
      }

      .quantity-modal-product {
        display: flex;
        gap: 30px;
        align-items: flex-start;
      }

      .qm-image {
        width: 200px;
        height: 250px;
        object-fit: cover;
        border-radius: 8px;
        flex-shrink: 0;
      }

      .qm-info {
        flex: 1;
      }

      .qm-title {
        font-size: 22px;
        font-weight: bold;
        margin-bottom: 15px;
        color: #333;
      }

      .qm-price {
        font-size: 18px;
        color: #555;
        margin-bottom: 8px;
      }

      .qm-stock {
        font-size: 14px;
        color: #777;
        margin-bottom: 25px;
      }

      .quantity-selector {
        margin-bottom: 30px;
      }

      .quantity-selector label {
        display: block;
        font-weight: bold;
        margin-bottom: 12px;
        color: #333;
      }

      .quantity-input-group {
        display: flex;
        align-items: center;
        gap: 10px;
      }

      .qty-btn {
        width: 40px;
        height: 40px;
        border: 1px solid #ddd;
        background: white;
        cursor: pointer;
        font-size: 18px;
        border-radius: 4px;
        transition: all 0.2s;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .qty-btn:hover {
        background: #f0f0f0;
        border-color: #999;
      }

      .qty-input {
        width: 70px;
        height: 40px;
        border: 1px solid #ddd;
        border-radius: 4px;
        font-size: 16px;
        text-align: center;
        padding: 0;
      }

      .qty-input:focus {
        outline: none;
        border-color: #333;
        box-shadow: 0 0 0 2px rgba(51, 51, 51, 0.1);
      }

      .quantity-modal-actions {
        display: flex;
        gap: 12px;
      }

      .btn-add-to-cart,
      .btn-cancel {
        flex: 1;
        padding: 14px;
        border: none;
        border-radius: 6px;
        font-size: 16px;
        font-weight: bold;
        cursor: pointer;
        transition: all 0.2s;
      }

      .btn-add-to-cart {
        background: #333;
        color: white;
      }

      .btn-add-to-cart:hover {
        background: #555;
      }

      .btn-cancel {
        background: #f0f0f0;
        color: #333;
      }

      .btn-cancel:hover {
        background: #e0e0e0;
      }

      @media (max-width: 600px) {
        .quantity-modal-content {
          padding: 30px 20px;
        }

        .quantity-modal-product {
          flex-direction: column;
          gap: 20px;
        }

        .qm-image {
          width: 100%;
          height: auto;
          max-height: 300px;
        }
      }
    `;
    document.head.appendChild(style);
  }

 
});
