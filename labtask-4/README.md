# Labtask 4 API

This project now exposes a JSON API under `/api/v1` alongside the existing server-rendered routes.

## Environment

Create a `.env` file in `labtask-4` with at least:

```env
MONGODB_URI=mongodb://localhost:27017/khadi-replica
SESSION_SECRET=your-session-secret
JWT_SECRET=your-long-random-jwt-secret
PORT=3000
```

## Public API

- `GET /api/v1/products`
- `GET /api/v1/products/:id`
- `POST /api/v1/auth/login`

### Product list query params

- `page`
- `q`
- `category`
- `minPrice`
- `maxPrice`
- `sort`

## Protected API

Protected routes require `Authorization: Bearer <token>`.

- `POST /api/v1/orders`
- `GET /api/v1/user/profile`

## Login example

```json
{
  "email": "user@example.com",
  "password": "secret123"
}
```

## Order example

```json
{
  "shippingAddress": "123 Main Street",
  "items": [
    {
      "productId": "66f000000000000000000001",
      "quantity": 2
    }
  ]
}
```