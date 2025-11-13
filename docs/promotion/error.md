# Promotion Service Error Codes - Source of Truth

This document defines all error codes for the Promotion Service. Each error has:
- **errorId**: Unique nano ID (short identifier)
- **errorCode**: camelCase business logic error code (client-friendly)
- **errorMessage**: Human-readable error message

---

## Promotion Management Errors

| errorId | errorCode | errorMessage |
|---------|-----------|--------------|
| `prm001` | `promotionNotFound` | Promotion not found |
| `prm002` | `promotionNameRequired` | Promotion name is required |
| `prm003` | `promotionAlreadyExists` | Promotion with this name already exists |
| `prm004` | `invalidPromotionType` | Invalid promotion type |
| `prm005` | `invalidPromotionValue` | Promotion value must be greater than zero |
| `prm006` | `invalidDateRange` | End date must be after start date |
| `prm007` | `promotionCreateFailed` | Failed to create promotion |
| `prm008` | `promotionUpdateFailed` | Failed to update promotion |
| `prm009` | `promotionDeleteFailed` | Failed to delete promotion |
| `prm010` | `promotionInUse` | Cannot delete promotion with active coupons or applications |
| `prm011` | `maxDiscountExceeded` | Discount exceeds maximum allowed amount |
| `prm012` | `invalidPriority` | Promotion priority must be a positive number |

---

## Promotion Status Errors

| errorId | errorCode | errorMessage |
|---------|-----------|--------------|
| `prs001` | `promotionNotActive` | Promotion is not currently active |
| `prs002` | `promotionExpired` | Promotion has expired |
| `prs003` | `promotionNotStarted` | Promotion has not started yet |
| `prs004` | `promotionDisabled` | Promotion has been disabled |
| `prs005` | `promotionPaused` | Promotion is temporarily paused |
| `prs006` | `cannotActivateExpired` | Cannot activate an expired promotion |
| `prs007` | `cannotDeactivateInUse` | Cannot deactivate promotion with pending applications |

---

## Promotion Condition Errors

| errorId | errorCode | errorMessage |
|---------|-----------|--------------|
| `prc001` | `conditionNotFound` | Promotion condition not found |
| `prc002` | `invalidConditionType` | Invalid condition type |
| `prc003` | `invalidConditionValue` | Invalid condition value |
| `prc004` | `conditionCreateFailed` | Failed to create promotion condition |
| `prc005` | `conditionUpdateFailed` | Failed to update promotion condition |
| `prc006` | `conditionDeleteFailed` | Failed to delete promotion condition |
| `prc007` | `minCartTotalRequired` | Minimum cart total is required for this condition |
| `prc008` | `invalidProductList` | Invalid product list in condition |
| `prc009` | `invalidCategoryList` | Invalid category list in condition |
| `prc010` | `conflictingConditions` | Promotion has conflicting conditions |

---

## Promotion Validation Errors

| errorId | errorCode | errorMessage |
|---------|-----------|--------------|
| `prv001` | `conditionsNotMet` | Cart does not meet promotion conditions |
| `prv002` | `minimumAmountNotMet` | Cart total does not meet minimum amount |
| `prv003` | `requiredProductsMissing` | Required products not in cart |
| `prv004` | `requiredCategoriesMissing` | Required categories not in cart |
| `prv005` | `customerGroupMismatch` | Customer is not in eligible group |
| `prv006` | `notFirstOrder` | Promotion is for first-time customers only |
| `prv007` | `geographicRestriction` | Promotion not available in your location |
| `prv008` | `userNotEligible` | User is not eligible for this promotion |
| `prv009` | `orderTypeMismatch` | Promotion not applicable to this order type |
| `prv010` | `paymentMethodRestriction` | Promotion not valid with selected payment method |

---

## Promotion Usage/Limit Errors

| errorId | errorCode | errorMessage |
|---------|-----------|--------------|
| `pru001` | `totalUsageLimitReached` | Promotion usage limit has been reached |
| `pru002` | `userUsageLimitReached` | You have reached the usage limit for this promotion |
| `pru003` | `dailyLimitReached` | Daily usage limit reached for this promotion |
| `pru004` | `promotionBudgetExhausted` | Promotion budget has been exhausted |
| `pru005` | `concurrentUsageExceeded` | Too many concurrent uses of this promotion |
| `pru006` | `cooldownPeriodActive` | Promotion is in cooldown period |

---

## Promotion Application Errors

| errorId | errorCode | errorMessage |
|---------|-----------|--------------|
| `pra001` | `applicationNotFound` | Promotion application not found |
| `pra002` | `applicationFailed` | Failed to apply promotion |
| `pra003` | `promotionAlreadyApplied` | Promotion already applied to this order |
| `pra004` | `cannotRemoveApplication` | Cannot remove promotion application |
| `pra005` | `invalidDiscountAmount` | Invalid discount amount calculated |
| `pra006` | `applicationRecordFailed` | Failed to record promotion application |
| `pra007` | `promotionMismatch` | Promotion does not match order criteria |

---

## Promotion Stacking Errors

| errorId | errorCode | errorMessage |
|---------|-----------|--------------|
| `pst001` | `cannotStackPromotions` | This promotion cannot be combined with others |
| `pst002` | `stackingLimitReached` | Maximum number of stackable promotions reached |
| `pst003` | `conflictingPromotions` | Promotions conflict and cannot be stacked |
| `pst004` | `exclusivePromotionActive` | An exclusive promotion is already applied |
| `pst005` | `stackingRulesViolated` | Promotion stacking rules violated |

---

## Coupon Management Errors

| errorId | errorCode | errorMessage |
|---------|-----------|--------------|
| `cpn001` | `couponNotFound` | Coupon code not found |
| `cpn002` | `couponCodeRequired` | Coupon code is required |
| `cpn003` | `couponAlreadyExists` | Coupon code already exists |
| `cpn004` | `invalidCouponFormat` | Invalid coupon code format |
| `cpn005` | `couponCreateFailed` | Failed to create coupon |
| `cpn006` | `couponUpdateFailed` | Failed to update coupon |
| `cpn007` | `couponDeleteFailed` | Failed to delete coupon |
| `cpn008` | `bulkCouponGenerationFailed` | Failed to generate bulk coupons |
| `cpn009` | `couponPrefixInvalid` | Invalid coupon prefix |
| `cpn010` | `couponCountInvalid` | Invalid coupon count for bulk generation |

---

## Coupon Status Errors

| errorId | errorCode | errorMessage |
|---------|-----------|--------------|
| `cps001` | `couponInactive` | Coupon is not active |
| `cps002` | `couponExpired` | Coupon has expired |
| `cps003` | `couponNotStarted` | Coupon is not valid yet |
| `cps004` | `couponRevoked` | Coupon has been revoked |
| `cps005` | `couponSuspended` | Coupon has been suspended |

---

## Coupon Validation Errors

| errorId | errorCode | errorMessage |
|---------|-----------|--------------|
| `cpv001` | `couponValidationFailed` | Coupon validation failed |
| `cpv002` | `couponUsageLimitReached` | Coupon usage limit has been reached |
| `cpv003` | `userCouponLimitReached` | You have reached the usage limit for this coupon |
| `cpv004` | `couponNotApplicable` | Coupon is not applicable to your cart |
| `cpv005` | `couponAlreadyUsed` | You have already used this coupon |
| `cpv006` | `couponSingleUseOnly` | This coupon can only be used once |
| `cpv007` | `couponAccountRequired` | An account is required to use this coupon |
| `cpv008` | `couponNewCustomersOnly` | This coupon is for new customers only |

---

## Coupon Application Errors

| errorId | errorCode | errorMessage |
|---------|-----------|--------------|
| `cpa001` | `couponApplicationFailed` | Failed to apply coupon |
| `cpa002` | `couponRemovalFailed` | Failed to remove coupon |
| `cpa003` | `couponAlreadyApplied` | Coupon already applied to cart |
| `cpa004` | `multipleCouponsNotAllowed` | Only one coupon allowed per order |
| `cpa005` | `couponCombinationInvalid` | This coupon cannot be combined with others |
| `cpa006` | `autoCouponConflict` | Coupon conflicts with auto-applied promotion |

---

## Coupon User Tracking Errors

| errorId | errorCode | errorMessage |
|---------|-----------|--------------|
| `cut001` | `userTrackingFailed` | Failed to track coupon usage |
| `cut002` | `usageHistoryNotFound` | Coupon usage history not found |
| `cut003` | `usageRecordFailed` | Failed to record coupon usage |
| `cut004` | `usageUpdateFailed` | Failed to update coupon usage |
| `cut005` | `userNotFound` | User not found for coupon tracking |

---

## Promotion Analytics Errors

| errorId | errorCode | errorMessage |
|---------|-----------|--------------|
| `pan001` | `analyticsDataNotFound` | Analytics data not found |
| `pan002` | `analyticsGenerationFailed` | Failed to generate analytics |
| `pan003` | `invalidDateRangeForAnalytics` | Invalid date range for analytics |
| `pan004` | `analyticsExportFailed` | Failed to export analytics data |
| `pan005` | `insufficientDataForAnalytics` | Insufficient data for analytics |

---

## Free Shipping Errors

| errorId | errorCode | errorMessage |
|---------|-----------|--------------|
| `fsh001` | `freeShippingNotApplicable` | Free shipping not applicable to this order |
| `fsh002` | `shippingMethodNotEligible` | Selected shipping method not eligible for free shipping |
| `fsh003` | `freeShippingRegionRestricted` | Free shipping not available in your region |
| `fsh004` | `freeShippingMinimumNotMet` | Order does not meet minimum for free shipping |

---

## Discount Calculation Errors

| errorId | errorCode | errorMessage |
|---------|-----------|--------------|
| `dsc001` | `discountCalculationFailed` | Failed to calculate discount |
| `dsc002` | `invalidDiscountPercentage` | Discount percentage must be between 0 and 100 |
| `dsc003` | `invalidDiscountAmount` | Invalid fixed discount amount |
| `dsc004` | `discountExceedsTotal` | Discount cannot exceed order total |
| `dsc005` | `negativeDiscountNotAllowed` | Negative discount not allowed |
| `dsc006` | `maxDiscountReached` | Maximum discount amount reached |
| `dsc007` | `roundingErrorInDiscount` | Rounding error in discount calculation |

---

## Promotion Schedule Errors

| errorId | errorCode | errorMessage |
|---------|-----------|--------------|
| `sch001` | `scheduleConflict` | Promotion schedule conflicts with another promotion |
| `sch002` | `invalidSchedule` | Invalid promotion schedule |
| `sch003` | `scheduleUpdateFailed` | Failed to update promotion schedule |
| `sch004` | `promotionEndedEarly` | Promotion ended earlier than scheduled |
| `sch005` | `scheduleOverlapNotAllowed` | Schedule overlap not allowed for this promotion type |

---

## Integration Errors

| errorId | errorCode | errorMessage |
|---------|-----------|--------------|
| `int001` | `orderServiceUnavailable` | Order service is unavailable |
| `int002` | `productServiceUnavailable` | Product service is unavailable |
| `int003` | `userServiceUnavailable` | User service is unavailable |
| `int004` | `syncFailed` | Promotion sync failed |
| `int005` | `webhookDeliveryFailed` | Failed to deliver promotion webhook |

---

## Permission Errors

| errorId | errorCode | errorMessage |
|---------|-----------|--------------|
| `prm101` | `unauthorizedPromotionAccess` | Unauthorized to access promotions |
| `prm102` | `cannotCreatePromotion` | You do not have permission to create promotions |
| `prm103` | `cannotUpdatePromotion` | You do not have permission to update promotions |
| `prm104` | `cannotDeletePromotion` | You do not have permission to delete promotions |
| `prm105` | `cannotManageCoupons` | You do not have permission to manage coupons |
| `prm106` | `adminAccessRequired` | Admin access required for this operation |

---

## Usage Example

```typescript
// Error response format
interface PromotionErrorResponse {
  errorId: string;      // e.g., "prm001"
  errorCode: string;    // e.g., "promotionNotFound"
  errorMessage: string; // e.g., "Promotion not found"
  timestamp: string;    // ISO 8601 timestamp
  path?: string;        // Request path where error occurred
  details?: {
    promotionId?: string;
    couponCode?: string;
    conditionType?: string;
    [key: string]: any;
  };
}

// Example error responses

// 1. Promotion not found
{
  "errorId": "prm001",
  "errorCode": "promotionNotFound",
  "errorMessage": "Promotion not found",
  "timestamp": "2025-01-13T10:30:00Z",
  "path": "/api/v1/promotions/abc123",
  "details": {
    "promotionId": "abc123"
  }
}

// 2. Coupon validation failed
{
  "errorId": "cpv001",
  "errorCode": "couponValidationFailed",
  "errorMessage": "Coupon validation failed",
  "timestamp": "2025-01-13T10:35:00Z",
  "path": "/api/v1/coupons/validate",
  "details": {
    "couponCode": "SAVE20",
    "reason": "minimumAmountNotMet",
    "requiredAmount": 50.00,
    "currentAmount": 30.00
  }
}

// 3. Conditions not met
{
  "errorId": "prv001",
  "errorCode": "conditionsNotMet",
  "errorMessage": "Cart does not meet promotion conditions",
  "timestamp": "2025-01-13T10:40:00Z",
  "path": "/api/v1/promotions/calculate",
  "details": {
    "promotionId": "xyz789",
    "failedConditions": [
      {
        "conditionType": "minCartTotal",
        "required": 100.00,
        "current": 75.00
      },
      {
        "conditionType": "specificProducts",
        "required": ["prod-1", "prod-2"],
        "missing": ["prod-2"]
      }
    ]
  }
}
```

---

## Error Handling Guidelines

### For Promotion Management
1. **Validate dates** before creating/updating promotions
2. **Check for conflicts** when scheduling promotions
3. **Verify dependencies** before deleting promotions
4. **Log all changes** with errorId for audit trail

### For Coupon Operations
1. **Validate format** before generating coupons
2. **Check uniqueness** when creating coupon codes
3. **Verify limits** before applying coupons
4. **Track usage** accurately for reporting

### For Discount Calculations
1. **Handle rounding** consistently
2. **Validate amounts** before applying
3. **Check limits** for maximum discounts
4. **Test edge cases** with zero/negative values

### For Validation
1. **Fail fast** on invalid conditions
2. **Provide context** in error details
3. **Return specific** failure reasons
4. **Help users** understand requirements

---

## HTTP Status Code Mapping

| Error Category | HTTP Status | Examples |
|---------------|-------------|----------|
| Promotion Management | 404, 400, 409 | promotionNotFound, invalidPromotionType |
| Promotion Status | 400, 422 | promotionExpired, promotionNotActive |
| Coupon Management | 404, 400, 409 | couponNotFound, couponAlreadyExists |
| Validation | 400, 422 | conditionsNotMet, minimumAmountNotMet |
| Usage Limits | 429, 400 | usageLimitReached, dailyLimitReached |
| Permissions | 401, 403 | unauthorizedPromotionAccess, adminAccessRequired |
| Integration | 502, 503 | orderServiceUnavailable, syncFailed |
| Analytics | 404, 500 | analyticsDataNotFound, analyticsGenerationFailed |

---

## Adding New Error Codes

When adding new promotion error codes:

1. **Choose domain prefix**:
   - `prm` - Promotion management
   - `prs` - Promotion status
   - `prc` - Promotion conditions
   - `prv` - Promotion validation
   - `pru` - Promotion usage
   - `pra` - Promotion application
   - `pst` - Promotion stacking
   - `cpn` - Coupon management
   - `cps` - Coupon status
   - `cpv` - Coupon validation
   - `cpa` - Coupon application
   - `cut` - Coupon user tracking
   - `pan` - Promotion analytics
   - `fsh` - Free shipping
   - `dsc` - Discount calculation
   - `sch` - Schedule
   - `int` - Integration

2. **Use sequential numbering** within each prefix
3. **Follow camelCase** for errorCode
4. **Write clear messages** that explain the problem
5. **Update this document** immediately
6. **Update type definitions** in codebase
7. **Add to tests** if applicable

---

## Common Error Patterns

### Time-based Errors
- Check current time against `startDate` and `endDate`
- Consider timezone handling
- Account for server time vs client time

### Limit-based Errors
- Check both global and per-user limits
- Consider concurrent usage
- Handle race conditions

### Condition-based Errors
- Validate all conditions before applying
- Return specific failed conditions
- Suggest remediation when possible

### Stacking Errors
- Check compatibility before combining
- Respect priority ordering
- Handle exclusive promotions

---

## Testing Checklist

- [ ] All error codes have unique errorIds
- [ ] Error messages are user-friendly
- [ ] HTTP status codes are appropriate
- [ ] Error responses include helpful details
- [ ] Edge cases are covered
- [ ] Integration points are handled
- [ ] Permission checks are enforced
- [ ] Analytics errors are tracked
