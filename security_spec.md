# FASHINERY Security Specification

## Data Invariants
1. **Orders**: 
    - Payment status 'Paid' can only be set via the trusted backend or admin.
    - Order total cannot be modified after creation.
    - Customer cannot change the status of another customer's order.
2. **Products**:
    - Catalog data (prices, stock, names) is only modifiable by authorized admins.
3. **RBAC**:
    - Admin status is derived from Firebase Custom Claims (`admin: true`) or the `admins` collection record with `isActive: true`.

## The "Dirty Dozen" Payloads (Deny Scenarios)
1. **Price Manipulation**: Create order with `price: 1` for a `5000` item.
2. **Payment Status Hijack**: Update order with `paymentStatus: 'Paid'` without payment.
3. **Role Escalation**: Update user profile with `isAdmin: true` or `role: 'admin'`.
4. **ID Poisoning**: Create a product with a 1MB string as the ID.
5. **PII Leak**: Anonymous user attempt to `get` a specific user profile.
6. **Cross-Customer Access**: Customer A attempt to `list` orders of Customer B.
7. **Bypass Verification**: Update order tracking info as a customer.
8. **Malicious Media**: Upload `.exe` file to `/products` folder.
9. **Shadow Update**: Update product `sellingPrice` while appearing to only update `stock`.
10. **Coupon Exhaustion**: Manually decrement `usedCount` on a coupon.
11. **Newsletter Spam**: Inject a script into the `newsletter` email field.
12. **Admin Impersonation**: Request admin API with a valid customer token but no admin claims.

## Implementation Plan
1. **Backend**: 
    - Use `helmet` for security headers.
    - `express-rate-limit` for all public and payment APIs.
    - `firebase-admin` to set custom claims for admins.
2. **Firestore Rules**:
    - Schema validation helpers.
    - `hasOnly` for every update.
    - `isValidId` checks.
3. **Storage Rules**:
    - `image/jpeg`, `image/png`, `image/webp` only.
    - Max 5MB.
