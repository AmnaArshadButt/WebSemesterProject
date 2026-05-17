/**
 * Helper to build MongoDB query and options from request query parameters
 * Keeps route logic minimal and easier to test.
 */
function buildProductQuery(params) {
  const toList = (value) => {
    if (Array.isArray(value)) {
      return value
        .flatMap((item) => String(item || '').split(','))
        .map((item) => item.trim())
        .filter(Boolean);
    }

    if (typeof value === 'string') {
      return value
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean);
    }

    return [];
  };

  const filter = {};
  const searchTerm = params.q && String(params.q).trim();

  // Text search on product name (case-insensitive, partial match)
  if (searchTerm) {
    filter.name = { $regex: searchTerm, $options: 'i' };
  }

  // Category and price filters only apply when there is no text search.
  if (!searchTerm) {
    // Category filter (single or multi-select)
    const categories = toList(params.category);
    if (categories.length === 1) {
      filter.category = categories[0];
    } else if (categories.length > 1) {
      filter.category = { $in: categories };
    }

    // Price range
    const priceFilter = {};
    if (params.minPrice !== undefined && String(params.minPrice).trim() !== '') {
      const min = Number(params.minPrice);
      if (!Number.isNaN(min)) priceFilter.$gte = Math.max(0, min);
    }
    if (params.maxPrice !== undefined && String(params.maxPrice).trim() !== '') {
      const max = Number(params.maxPrice);
      if (!Number.isNaN(max)) priceFilter.$lte = max;
    }
    if (Object.keys(priceFilter).length) {
      filter.price = priceFilter;
    }
  }

  // Sorting
  // Supported values: price_asc, price_desc, rating_desc, rating_asc, name_asc, name_desc, newest
  let sort = { createdAt: -1 };
  switch ((params.sort || '').toLowerCase()) {
    case 'price_asc':
      sort = { price: 1 };
      break;
    case 'price_desc':
      sort = { price: -1 };
      break;
    case 'rating_asc':
      sort = { rating: 1 };
      break;
    case 'rating_desc':
      sort = { rating: -1 };
      break;
    case 'name_asc':
      sort = { name: 1 };
      break;
    case 'name_desc':
      sort = { name: -1 };
      break;
    case 'newest':
      sort = { createdAt: -1 };
      break;
    default:
      break;
  }

  return { filter, sort };
}

module.exports = { buildProductQuery };
