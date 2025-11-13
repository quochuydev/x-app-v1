# Error Codes - Source of Truth

This document defines all error codes that can occur in the application. Each error has:
- **errorId**: Unique nano ID (short identifier)
- **errorCode**: camelCase business logic error code (client-friendly)
- **errorMessage**: Human-readable error message

---

## Product Errors

| errorId | errorCode | errorMessage |
|---------|-----------|--------------|
| `prd001` | `productNotFound` | Product not found |
| `prd002` | `productOutOfStock` | Product is currently out of stock |
| `prd003` | `invalidProductPrice` | Product price must be greater than zero |
| `prd004` | `productNameRequired` | Product name is required |
| `prd005` | `productAlreadyExists` | Product with this name already exists |
| `prd006` | `invalidProductCategory` | Invalid product category |
| `prd007` | `productImageUploadFailed` | Failed to upload product image |
| `prd008` | `productDeleteFailed` | Cannot delete product with existing orders |
| `prd009` | `insufficientInventory` | Insufficient inventory for this product |
| `prd010` | `productUpdateFailed` | Failed to update product |

---

## Cart Errors

| errorId | errorCode | errorMessage |
|---------|-----------|--------------|
| `crt001` | `cartNotFound` | Shopping cart not found |
| `crt002` | `cartItemNotFound` | Item not found in cart |
| `crt003` | `cartEmpty` | Cart is empty |
| `crt004` | `invalidQuantity` | Quantity must be greater than zero |
| `crt005` | `maxQuantityExceeded` | Maximum quantity per item exceeded |
| `crt006` | `cartExpired` | Cart session has expired |
| `crt007` | `addToCartFailed` | Failed to add item to cart |
| `crt008` | `updateCartFailed` | Failed to update cart item |
| `crt009` | `removeFromCartFailed` | Failed to remove item from cart |
| `crt010` | `cartItemOutOfStock` | One or more cart items are out of stock |

---

## Order Errors

| errorId | errorCode | errorMessage |
|---------|-----------|--------------|
| `ord001` | `orderNotFound` | Order not found |
| `ord002` | `orderCreationFailed` | Failed to create order |
| `ord003` | `invalidOrderStatus` | Invalid order status |
| `ord004` | `orderAlreadyCancelled` | Order has already been cancelled |
| `ord005` | `orderAlreadyShipped` | Order has already been shipped |
| `ord006` | `cannotCancelOrder` | Cannot cancel order in current status |
| `ord007` | `orderUpdateFailed` | Failed to update order |
| `ord008` | `invalidOrderTransition` | Invalid order status transition |
| `ord009` | `orderItemNotFound` | Order item not found |
| `ord010` | `orderMinimumNotMet` | Order does not meet minimum amount |

---

## Payment Errors

| errorId | errorCode | errorMessage |
|---------|-----------|--------------|
| `pay001` | `paymentFailed` | Payment processing failed |
| `pay002` | `paymentMethodInvalid` | Invalid payment method |
| `pay003` | `paymentAlreadyProcessed` | Payment has already been processed |
| `pay004` | `insufficientFunds` | Insufficient funds for payment |
| `pay005` | `paymentDeclined` | Payment was declined |
| `pay006` | `paymentTimeout` | Payment processing timeout |
| `pay007` | `refundFailed` | Failed to process refund |
| `pay008` | `refundNotAllowed` | Refund not allowed for this order |
| `pay009` | `invalidPaymentAmount` | Invalid payment amount |
| `pay010` | `paymentGatewayError` | Payment gateway error |

---

## User/Authentication Errors

| errorId | errorCode | errorMessage |
|---------|-----------|--------------|
| `usr001` | `userNotFound` | User not found |
| `usr002` | `invalidCredentials` | Invalid email or password |
| `usr003` | `emailAlreadyExists` | Email address already registered |
| `usr004` | `unauthorizedAccess` | Unauthorized access |
| `usr005` | `insufficientPermissions` | Insufficient permissions |
| `usr006` | `accountDisabled` | Account has been disabled |
| `usr007` | `sessionExpired` | Session has expired |
| `usr008` | `invalidToken` | Invalid authentication token |
| `usr009` | `emailRequired` | Email address is required |
| `usr010` | `passwordTooWeak` | Password does not meet requirements |

---

## Promotion/Coupon Errors

| errorId | errorCode | errorMessage |
|---------|-----------|--------------|
| `prm001` | `couponNotFound` | Coupon code not found |
| `prm002` | `couponExpired` | Coupon has expired |
| `prm003` | `couponInactive` | Coupon is not active |
| `prm004` | `couponUsageLimitReached` | Coupon usage limit reached |
| `prm005` | `userCouponLimitReached` | User has reached coupon usage limit |
| `prm006` | `couponConditionsNotMet` | Cart does not meet coupon conditions |
| `prm007` | `invalidCouponCode` | Invalid coupon code format |
| `prm008` | `promotionNotActive` | Promotion is not currently active |
| `prm009` | `promotionNotFound` | Promotion not found |
| `prm010` | `cannotStackCoupons` | This coupon cannot be combined with others |
| `prm011` | `minimumAmountNotMet` | Cart total does not meet minimum amount |
| `prm012` | `promotionAlreadyApplied` | Promotion already applied to cart |

---

## Inventory/Warehouse Errors

| errorId | errorCode | errorMessage |
|---------|-----------|--------------|
| `inv001` | `inventoryNotFound` | Inventory record not found |
| `inv002` | `warehouseNotFound` | Warehouse not found |
| `inv003` | `insufficientStock` | Insufficient stock available |
| `inv004` | `inventoryUpdateFailed` | Failed to update inventory |
| `inv005` | `invalidStockQuantity` | Invalid stock quantity |
| `inv006` | `stockReservationFailed` | Failed to reserve stock |
| `inv007` | `stockAllocationFailed` | Failed to allocate stock |

---

## Review Errors

| errorId | errorCode | errorMessage |
|---------|-----------|--------------|
| `rev001` | `reviewNotFound` | Review not found |
| `rev002` | `reviewAlreadyExists` | Review already exists for this order |
| `rev003` | `cannotReviewUnpurchased` | Cannot review unpurchased products |
| `rev004` | `invalidRating` | Rating must be between 1 and 5 |
| `rev005` | `reviewContentRequired` | Review content is required |
| `rev006` | `orderNotShipped` | Can only review after order is shipped |

---

## Refund Errors

| errorId | errorCode | errorMessage |
|---------|-----------|--------------|
| `rfd001` | `refundRequestNotFound` | Refund request not found |
| `rfd002` | `refundAlreadyProcessed` | Refund already processed |
| `rfd003` | `refundNotEligible` | Order not eligible for refund |
| `rfd004` | `refundPeriodExpired` | Refund period has expired |
| `rfd005` | `refundReasonRequired` | Refund reason is required |
| `rfd006` | `refundAmountInvalid` | Invalid refund amount |
| `rfd007` | `partialRefundNotAllowed` | Partial refunds not allowed |

---

## Validation Errors

| errorId | errorCode | errorMessage |
|---------|-----------|--------------|
| `val001` | `validationFailed` | Validation failed |
| `val002` | `requiredFieldMissing` | Required field is missing |
| `val003` | `invalidEmailFormat` | Invalid email format |
| `val004` | `invalidPhoneFormat` | Invalid phone number format |
| `val005` | `invalidDateFormat` | Invalid date format |
| `val006` | `invalidUuidFormat` | Invalid UUID format |
| `val007` | `stringTooLong` | Input exceeds maximum length |
| `val008` | `stringTooShort` | Input does not meet minimum length |
| `val009` | `numberOutOfRange` | Number is out of valid range |
| `val010` | `invalidJsonFormat` | Invalid JSON format |

---

## System Errors

| errorId | errorCode | errorMessage |
|---------|-----------|--------------|
| `sys001` | `internalServerError` | Internal server error occurred |
| `sys002` | `databaseConnectionFailed` | Database connection failed |
| `sys003` | `databaseQueryFailed` | Database query failed |
| `sys004` | `serviceUnavailable` | Service temporarily unavailable |
| `sys005` | `rateLimitExceeded` | Rate limit exceeded |
| `sys006` | `timeoutError` | Request timeout |
| `sys007` | `externalServiceError` | External service error |
| `sys008` | `fileUploadFailed` | File upload failed |
| `sys009` | `invalidRequestFormat` | Invalid request format |
| `sys010` | `resourceNotFound` | Resource not found |

---

## Usage Example

```typescript
// Error response format
interface ErrorResponse {
  errorId: string;      // e.g., "prd001"
  errorCode: string;    // e.g., "productNotFound"
  errorMessage: string; // e.g., "Product not found"
  timestamp: string;    // ISO 8601 timestamp
  path?: string;        // Request path where error occurred
  details?: any;        // Additional error details
}

// Example error response
{
  "errorId": "prd001",
  "errorCode": "productNotFound",
  "errorMessage": "Product not found",
  "timestamp": "2025-01-13T10:30:00Z",
  "path": "/api/v1/products/abc123",
  "details": {
    "productId": "abc123"
  }
}
```

---

## Error Handling Guidelines

1. **Always use errorId** for internal tracking and logging
2. **Return errorCode** to clients for programmatic error handling
3. **Use errorMessage** for user-facing error displays
4. **Add context** in the details field when applicable
5. **Log all errors** with errorId for debugging
6. **Never expose** internal system details in error messages
7. **Keep messages** concise and actionable
8. **Maintain consistency** in error code naming (camelCase)

---

## Adding New Error Codes

When adding new error codes:

1. Choose appropriate domain prefix (3 letters)
2. Use sequential numbering within domain
3. Use camelCase for errorCode
4. Write clear, user-friendly messages
5. Update this document
6. Update error type definitions in codebase

---

## HTTP Status Code Mapping

| Error Category | HTTP Status |
|---------------|-------------|
| Product Errors | 404, 400, 409 |
| Cart Errors | 404, 400, 410 |
| Order Errors | 404, 400, 409 |
| Payment Errors | 400, 402, 500 |
| User/Auth Errors | 401, 403, 404, 409 |
| Promotion Errors | 404, 400, 422 |
| Validation Errors | 400, 422 |
| System Errors | 500, 503, 504 |
