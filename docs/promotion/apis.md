# Promotion Service API Documentation

## Base URL
```
/api/v1/promotions
```

## Authentication
- **Admin APIs**: Require `admin` role
- **Public APIs**: No authentication required
- **User APIs**: Require authenticated user

---

## Promotion Management APIs

### 1. Create Promotion
Create a new promotion campaign.

```bash
curl -X POST "https://api.example.com/api/v1/promotions" \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Summer Sale 2025",
    "description": "Get 20% off on all products",
    "startDate": "2025-06-01T00:00:00Z",
    "endDate": "2025-08-31T23:59:59Z",
    "type": "percentage",
    "value": 20.0,
    "maxDiscountAmount": 100.0,
    "autoApply": true,
    "priority": 10,
    "stackable": true,
    "totalUsageLimit": 1000,
    "usagePerUserLimit": 1,
    "active": true,
    "conditions": [
      {
        "conditionType": "minCartTotal",
        "conditionValue": {
          "amount": 50.0
        }
      }
    ]
  }'
```

**Response:** `201 Created`
```json
{
  "id": "uuid-123",
  "name": "Summer Sale 2025",
  "description": "Get 20% off on all products",
  "startDate": "2025-06-01T00:00:00Z",
  "endDate": "2025-08-31T23:59:59Z",
  "type": "percentage",
  "value": 20.0,
  "maxDiscountAmount": 100.0,
  "autoApply": true,
  "priority": 10,
  "stackable": true,
  "totalUsageLimit": 1000,
  "usagePerUserLimit": 1,
  "currentUsageCount": 0,
  "active": true,
  "conditions": [
    {
      "id": "uuid-456",
      "conditionType": "minCartTotal",
      "conditionValue": {
        "amount": 50.0
      },
      "createdDate": "2025-01-13T10:00:00Z"
    }
  ],
  "createdDate": "2025-01-13T10:00:00Z",
  "updatedDate": "2025-01-13T10:00:00Z"
}
```

---

### 2. Get Promotion by ID
Retrieve a specific promotion.

```bash
curl -X GET "https://api.example.com/api/v1/promotions/uuid-123" \
  -H "Authorization: Bearer <admin_token>"
```

**Response:** `200 OK`
```json
{
  "id": "uuid-123",
  "name": "Summer Sale 2025",
  "description": "Get 20% off on all products",
  "startDate": "2025-06-01T00:00:00Z",
  "endDate": "2025-08-31T23:59:59Z",
  "type": "percentage",
  "value": 20.0,
  "maxDiscountAmount": 100.0,
  "autoApply": true,
  "priority": 10,
  "stackable": true,
  "totalUsageLimit": 1000,
  "usagePerUserLimit": 1,
  "currentUsageCount": 150,
  "active": true,
  "conditions": [...],
  "createdDate": "2025-01-13T10:00:00Z",
  "updatedDate": "2025-01-13T10:00:00Z"
}
```

---

### 3. List Promotions
Get all promotions with filtering and pagination.

**Query Parameters:**
- `page` (number, default: 1)
- `limit` (number, default: 20, max: 100)
- `active` (boolean, optional)
- `type` (string, optional: percentage|fixedAmount|freeShipping)
- `search` (string, optional: search by name)
- `sortBy` (string, default: createdDate)
- `sortOrder` (string, default: desc)

```bash
curl -X GET "https://api.example.com/api/v1/promotions?active=true&page=1&limit=20" \
  -H "Authorization: Bearer <admin_token>"
```

**Response:** `200 OK`
```json
{
  "data": [
    {
      "id": "uuid-123",
      "name": "Summer Sale 2025",
      "description": "Get 20% off on all products",
      "type": "percentage",
      "value": 20.0,
      "active": true,
      "startDate": "2025-06-01T00:00:00Z",
      "endDate": "2025-08-31T23:59:59Z",
      "currentUsageCount": 150,
      "totalUsageLimit": 1000,
      "createdDate": "2025-01-13T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "totalPages": 3
  }
}
```

---

### 4. Update Promotion
Update an existing promotion (partial update supported).

```bash
curl -X PUT "https://api.example.com/api/v1/promotions/uuid-123" \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Updated description",
    "active": false,
    "endDate": "2025-09-30T23:59:59Z"
  }'
```

**Response:** `200 OK`
```json
{
  "id": "uuid-123",
  "name": "Summer Sale 2025",
  "description": "Updated description",
  "active": false,
  "endDate": "2025-09-30T23:59:59Z",
  "updatedDate": "2025-01-13T11:00:00Z",
  ...
}
```

---

### 5. Delete Promotion (Soft Delete)
Soft delete a promotion.

```bash
curl -X DELETE "https://api.example.com/api/v1/promotions/uuid-123" \
  -H "Authorization: Bearer <admin_token>"
```

**Response:** `204 No Content`

---

### 6. Activate/Deactivate Promotion
Toggle promotion active status.

```bash
curl -X PATCH "https://api.example.com/api/v1/promotions/uuid-123/status" \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "active": true
  }'
```

**Response:** `200 OK`
```json
{
  "id": "uuid-123",
  "active": true,
  "updatedDate": "2025-01-13T11:00:00Z"
}
```

---

## Promotion Condition APIs

### 7. Add Condition to Promotion
Add a new condition to an existing promotion.

```bash
curl -X POST "https://api.example.com/api/v1/promotions/uuid-123/conditions" \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "conditionType": "specificProducts",
    "conditionValue": {
      "productIds": ["prod-1", "prod-2", "prod-3"]
    }
  }'
```

**Response:** `201 Created`
```json
{
  "id": "uuid-789",
  "promotionId": "uuid-123",
  "conditionType": "specificProducts",
  "conditionValue": {
    "productIds": ["prod-1", "prod-2", "prod-3"]
  },
  "createdDate": "2025-01-13T10:00:00Z"
}
```

---

### 8. Update Promotion Condition
Update an existing condition.

```bash
curl -X PUT "https://api.example.com/api/v1/promotions/uuid-123/conditions/uuid-456" \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "conditionValue": {
      "productIds": ["prod-1", "prod-2", "prod-3", "prod-4"]
    }
  }'
```

**Response:** `200 OK`

---

### 9. Delete Promotion Condition
Remove a condition from a promotion.

```bash
curl -X DELETE "https://api.example.com/api/v1/promotions/uuid-123/conditions/uuid-456" \
  -H "Authorization: Bearer <admin_token>"
```

**Response:** `204 No Content`

---

## Coupon Management APIs

### 10. Create Coupon
Create a new coupon code.

```bash
curl -X POST "https://api.example.com/api/v1/coupons" \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "code": "SAVE20",
    "promotionId": "uuid-123",
    "usageLimit": 100,
    "usageLimitPerUser": 1,
    "startDate": "2025-06-01T00:00:00Z",
    "expiresAt": "2025-08-31T23:59:59Z",
    "active": true
  }'
```

**Response:** `201 Created`
```json
{
  "id": "uuid-coupon-1",
  "code": "SAVE20",
  "promotionId": "uuid-123",
  "usageLimit": 100,
  "usageLimitPerUser": 1,
  "usedCount": 0,
  "startDate": "2025-06-01T00:00:00Z",
  "expiresAt": "2025-08-31T23:59:59Z",
  "active": true,
  "createdDate": "2025-01-13T10:00:00Z"
}
```

---

### 11. Generate Bulk Coupons
Generate multiple unique coupon codes at once.

```bash
curl -X POST "https://api.example.com/api/v1/coupons/bulk" \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "promotionId": "uuid-123",
    "prefix": "SUMMER",
    "count": 100,
    "usageLimit": 1,
    "usageLimitPerUser": 1,
    "startDate": "2025-06-01T00:00:00Z",
    "expiresAt": "2025-08-31T23:59:59Z",
    "active": true
  }'
```

**Response:** `201 Created`
```json
{
  "generated": 100,
  "codes": [
    "SUMMER-A1B2C3",
    "SUMMER-D4E5F6",
    "..."
  ],
  "promotionId": "uuid-123"
}
```

---

### 12. Get Coupon by Code
Retrieve coupon details by code.

```bash
curl -X GET "https://api.example.com/api/v1/coupons/code/SAVE20" \
  -H "Authorization: Bearer <admin_token>"
```

**Response:** `200 OK`
```json
{
  "id": "uuid-coupon-1",
  "code": "SAVE20",
  "promotionId": "uuid-123",
  "promotion": {
    "name": "Summer Sale 2025",
    "type": "percentage",
    "value": 20.0,
    "description": "Get 20% off"
  },
  "usageLimit": 100,
  "usageLimitPerUser": 1,
  "usedCount": 45,
  "active": true,
  "startDate": "2025-06-01T00:00:00Z",
  "expiresAt": "2025-08-31T23:59:59Z"
}
```

---

### 13. List Coupons
Get all coupons with filtering.

**Query Parameters:**
- `page` (number)
- `limit` (number)
- `active` (boolean)
- `promotionId` (uuid)
- `code` (string, partial match)

```bash
curl -X GET "https://api.example.com/api/v1/coupons?active=true&page=1&limit=20" \
  -H "Authorization: Bearer <admin_token>"
```

**Response:** `200 OK`
```json
{
  "data": [
    {
      "id": "uuid-coupon-1",
      "code": "SAVE20",
      "promotionId": "uuid-123",
      "usedCount": 45,
      "usageLimit": 100,
      "active": true,
      "expiresAt": "2025-08-31T23:59:59Z"
    }
  ],
  "pagination": {...}
}
```

---

### 14. Update Coupon
Update coupon details.

```bash
curl -X PUT "https://api.example.com/api/v1/coupons/uuid-coupon-1" \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "active": false,
    "expiresAt": "2025-09-30T23:59:59Z"
  }'
```

**Response:** `200 OK`

---

### 15. Delete Coupon (Soft Delete)
Soft delete a coupon.

```bash
curl -X DELETE "https://api.example.com/api/v1/coupons/uuid-coupon-1" \
  -H "Authorization: Bearer <admin_token>"
```

**Response:** `204 No Content`

---

## Public/Customer APIs

### 16. Validate Coupon Code
Check if a coupon code is valid for the current user and cart.

```bash
curl -X POST "https://api.example.com/api/v1/coupons/validate" \
  -H "Authorization: Bearer <user_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "code": "SAVE20",
    "userId": "user-123",
    "cartTotal": 150.0,
    "cartItems": [
      {
        "productId": "prod-1",
        "quantity": 2,
        "price": 50.0
      },
      {
        "productId": "prod-2",
        "quantity": 1,
        "price": 50.0
      }
    ]
  }'
```

**Response:** `200 OK` (Valid)
```json
{
  "valid": true,
  "coupon": {
    "code": "SAVE20",
    "promotion": {
      "name": "Summer Sale 2025",
      "type": "percentage",
      "value": 20.0,
      "description": "Get 20% off"
    }
  },
  "discount": {
    "amount": 30.0,
    "breakdown": [
      {
        "productId": "prod-1",
        "originalPrice": 100.0,
        "discountAmount": 20.0,
        "finalPrice": 80.0
      },
      {
        "productId": "prod-2",
        "originalPrice": 50.0,
        "discountAmount": 10.0,
        "finalPrice": 40.0
      }
    ]
  },
  "finalTotal": 120.0
}
```

**Response:** `400 Bad Request` (Invalid)
```json
{
  "valid": false,
  "error": "COUPON_EXPIRED",
  "message": "This coupon has expired"
}
```

**Error Codes:**
- `COUPON_NOT_FOUND` - Coupon code doesn't exist
- `COUPON_EXPIRED` - Coupon has passed expiration date
- `COUPON_INACTIVE` - Coupon is deactivated
- `COUPON_USAGE_LIMIT_REACHED` - Global usage limit reached
- `USER_USAGE_LIMIT_REACHED` - User has reached their limit
- `CONDITIONS_NOT_MET` - Cart doesn't meet promotion conditions
- `PROMOTION_INACTIVE` - Associated promotion is inactive

---

### 17. Calculate Cart Discounts
Get all applicable promotions for a cart (auto-apply + manual).

```bash
curl -X POST "https://api.example.com/api/v1/promotions/calculate" \
  -H "Authorization: Bearer <user_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user-123",
    "cartTotal": 200.0,
    "cartItems": [
      {
        "productId": "prod-1",
        "categoryId": "cat-1",
        "quantity": 2,
        "price": 50.0
      },
      {
        "productId": "prod-2",
        "categoryId": "cat-2",
        "quantity": 2,
        "price": 50.0
      }
    ],
    "couponCodes": ["SAVE20"]
  }'
```

**Response:** `200 OK`
```json
{
  "originalTotal": 200.0,
  "discounts": [
    {
      "promotionId": "uuid-123",
      "promotionName": "Summer Sale 2025",
      "type": "percentage",
      "discountAmount": 40.0,
      "autoApplied": true,
      "stackable": true
    },
    {
      "promotionId": "uuid-456",
      "promotionName": "Free Shipping",
      "type": "freeShipping",
      "discountAmount": 10.0,
      "autoApplied": true,
      "stackable": true
    }
  ],
  "totalDiscount": 50.0,
  "finalTotal": 150.0,
  "appliedItems": [
    {
      "productId": "prod-1",
      "originalPrice": 100.0,
      "discountAmount": 20.0,
      "finalPrice": 80.0,
      "appliedPromotions": ["uuid-123"]
    },
    {
      "productId": "prod-2",
      "originalPrice": 100.0,
      "discountAmount": 20.0,
      "finalPrice": 80.0,
      "appliedPromotions": ["uuid-123"]
    }
  ]
}
```

---

### 18. Get Available Promotions
Get all active promotions available to the customer.

**Query Parameters:**
- `userId` (optional) - for personalized promotions
- `categoryId` (optional) - filter by category
- `productId` (optional) - filter by product

```bash
curl -X GET "https://api.example.com/api/v1/promotions/available?userId=user-123&categoryId=cat-1"
```

**Response:** `200 OK`
```json
{
  "autoApply": [
    {
      "id": "uuid-123",
      "name": "Summer Sale 2025",
      "description": "Get 20% off on all products",
      "type": "percentage",
      "value": 20.0,
      "startDate": "2025-06-01T00:00:00Z",
      "endDate": "2025-08-31T23:59:59Z"
    }
  ],
  "requiresCoupon": [
    {
      "id": "uuid-456",
      "name": "First Order Discount",
      "description": "Get $10 off your first order",
      "type": "fixedAmount",
      "value": 10.0,
      "message": "Use code FIRST10 at checkout"
    }
  ]
}
```

---

## Promotion Application APIs

### 19. Apply Promotion to Order
Record promotion application when order is created.

```bash
curl -X POST "https://api.example.com/api/v1/promotions/applications" \
  -H "Authorization: Bearer <service_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": "order-123",
    "userId": "user-123",
    "promotionId": "uuid-123",
    "couponId": "uuid-coupon-1",
    "originalAmount": 200.0,
    "discountAmount": 40.0,
    "finalAmount": 160.0,
    "appliedItems": [
      {
        "orderItemId": "item-1",
        "productId": "prod-1",
        "productName": "Product 1",
        "originalPrice": 100.0,
        "discountAmount": 20.0,
        "finalPrice": 80.0,
        "quantity": 2
      },
      {
        "orderItemId": "item-2",
        "productId": "prod-2",
        "productName": "Product 2",
        "originalPrice": 100.0,
        "discountAmount": 20.0,
        "finalPrice": 80.0,
        "quantity": 2
      }
    ]
  }'
```

**Response:** `201 Created`
```json
{
  "id": "uuid-app-1",
  "orderId": "order-123",
  "promotionId": "uuid-123",
  "couponId": "uuid-coupon-1",
  "originalAmount": 200.0,
  "discountAmount": 40.0,
  "finalAmount": 160.0,
  "appliedItems": [...],
  "createdDate": "2025-01-13T10:00:00Z"
}
```

---

### 20. Get Promotion Applications by Order
Get all promotions applied to a specific order.

```bash
curl -X GET "https://api.example.com/api/v1/orders/order-123/promotions" \
  -H "Authorization: Bearer <user_token>"
```

**Response:** `200 OK`
```json
{
  "orderId": "order-123",
  "applications": [
    {
      "id": "uuid-app-1",
      "promotion": {
        "id": "uuid-123",
        "name": "Summer Sale 2025",
        "type": "percentage",
        "value": 20.0
      },
      "coupon": {
        "id": "uuid-coupon-1",
        "code": "SAVE20"
      },
      "discountAmount": 40.0,
      "appliedItems": [...]
    }
  ],
  "totalDiscount": 40.0
}
```

---

### 21. Get User Coupon Usage History
Get all coupons used by a user.

**Query Parameters:**
- `page` (number)
- `limit` (number)

```bash
curl -X GET "https://api.example.com/api/v1/users/user-123/coupons?page=1&limit=20" \
  -H "Authorization: Bearer <user_token>"
```

**Response:** `200 OK`
```json
{
  "data": [
    {
      "coupon": {
        "id": "uuid-coupon-1",
        "code": "SAVE20",
        "promotion": {
          "name": "Summer Sale 2025"
        }
      },
      "usedCount": 1,
      "lastUsedDate": "2025-01-13T10:00:00Z",
      "orders": ["order-123"]
    }
  ],
  "pagination": {...}
}
```

---

## Analytics & Reporting APIs

### 22. Get Promotion Statistics
Get usage statistics for a promotion.

```bash
curl -X GET "https://api.example.com/api/v1/promotions/uuid-123/stats" \
  -H "Authorization: Bearer <admin_token>"
```

**Response:** `200 OK`
```json
{
  "promotionId": "uuid-123",
  "promotionName": "Summer Sale 2025",
  "totalApplications": 150,
  "totalDiscount": 6000.0,
  "averageDiscount": 40.0,
  "uniqueUsers": 120,
  "totalRevenue": 18000.0,
  "conversionRate": 0.35,
  "topProducts": [
    {
      "productId": "prod-1",
      "productName": "Product 1",
      "applications": 50,
      "totalDiscount": 2000.0
    }
  ],
  "usageByDay": [
    {
      "date": "2025-06-01",
      "applications": 10,
      "discount": 400.0
    }
  ]
}
```

---

### 23. Get Coupon Statistics
Get usage statistics for a coupon.

```bash
curl -X GET "https://api.example.com/api/v1/coupons/uuid-coupon-1/stats" \
  -H "Authorization: Bearer <admin_token>"
```

**Response:** `200 OK`
```json
{
  "couponId": "uuid-coupon-1",
  "code": "SAVE20",
  "totalUsage": 45,
  "uniqueUsers": 45,
  "totalDiscount": 1800.0,
  "averageDiscount": 40.0,
  "usageLimit": 100,
  "remainingUses": 55,
  "topUsers": [
    {
      "userId": "user-1",
      "usageCount": 1,
      "totalDiscount": 40.0
    }
  ]
}
```

---

### 24. Get Overall Promotion Analytics
Get system-wide promotion analytics.

**Query Parameters:**
- `startDate` (datetime)
- `endDate` (datetime)
- `promotionId` (optional)
- `type` (optional)

```bash
curl -X GET "https://api.example.com/api/v1/promotions/analytics?startDate=2025-06-01T00:00:00Z&endDate=2025-08-31T23:59:59Z" \
  -H "Authorization: Bearer <admin_token>"
```

**Response:** `200 OK`
```json
{
  "period": {
    "startDate": "2025-06-01T00:00:00Z",
    "endDate": "2025-08-31T23:59:59Z"
  },
  "summary": {
    "totalPromotions": 5,
    "activePromotions": 3,
    "totalApplications": 500,
    "totalDiscount": 20000.0,
    "totalRevenue": 80000.0,
    "averageOrderValue": 160.0,
    "promotionPenetration": 0.42
  },
  "byType": {
    "percentage": {
      "applications": 300,
      "discount": 12000.0
    },
    "fixedAmount": {
      "applications": 150,
      "discount": 7000.0
    },
    "freeShipping": {
      "applications": 50,
      "discount": 1000.0
    }
  }
}
```

---

## Error Responses

All APIs follow standard error response format:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request parameters",
    "details": [
      {
        "field": "value",
        "message": "Value must be greater than 0"
      }
    ]
  }
}
```

**HTTP Status Codes:**
- `200` - Success
- `201` - Created
- `204` - No Content
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `422` - Unprocessable Entity
- `500` - Internal Server Error

---

## Rate Limiting

- **Admin APIs**: 100 requests per minute
- **Public APIs**: 60 requests per minute
- **Validation APIs**: 120 requests per minute (higher for checkout flow)

**Rate Limit Headers:**
```
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 45
X-RateLimit-Reset: 1673600000
```

---

## Webhooks (Optional)

### Events
- `promotion.created`
- `promotion.updated`
- `promotion.activated`
- `promotion.deactivated`
- `promotion.expired`
- `coupon.created`
- `coupon.used`
- `coupon.expired`
- `promotion.applied`

**Webhook Payload Example:**
```json
{
  "event": "promotion.applied",
  "timestamp": "2025-01-13T10:00:00Z",
  "data": {
    "promotionId": "uuid-123",
    "orderId": "order-123",
    "userId": "user-123",
    "discountAmount": 40.0
  }
}
```
