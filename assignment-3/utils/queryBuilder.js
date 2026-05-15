/**
 * Helper to build MongoDB query and options from request query parameters
 * Keeps route logic minimal and easier to test.
 */
function buildProductQuery(params) {
  const filter = {};

  // Text search on product name (case-insensitive, partial match)
  if (params.q) {
    filter.name = { $regex: params.q.trim(), $options: 'i' };
  }

  // Category filter (exact match)
  if (params.category) {
    filter.category = params.category.trim();
  }

  // Price range
  const priceFilter = {};
  if (params.minPrice !== undefined) {
    const min = Number(params.minPrice);
    if (!Number.isNaN(min)) priceFilter.$gte = min;
  }
  if (params.maxPrice !== undefined) {
    const max = Number(params.maxPrice);
    if (!Number.isNaN(max)) priceFilter.$lte = max;
  }
  if (Object.keys(priceFilter).length) {
    filter.price = priceFilter;
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
