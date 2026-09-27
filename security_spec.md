# Fashinery Atelier Security Specification & Access Control Matrix

## 1. Data & Access Invariants
1. **Admin Gating**: Authentication alone does NOT grant admin access. A user must exist in `/admins/{uid}` with `isActive == true` or match the bootstrap owner email (`dheeraj8933@gmail.com`).
2. **Super Admin Exclusivity**: Only a Super Admin (`role == 'superadmin'` and `isActive == true`, or verified owner email) can add, modify, disable, or delete admin documents in `/admins/{adminId}`.
3. **No Self-Promotion**: Standard customer accounts or unauthenticated users can NEVER create, edit, or elevate any document in `/admins/{adminId}`.
4. **Catalog & Settings Protection**: Collections `/products`, `/categories`, `/banners`, `/siteSettings`, `/policies`, `/coupons`, and `/faqs` can only be modified (create, update, delete) by an authorized active Administrator (`isAdmin()`).
5. **Customer Privacy**: Users in `/users/{userId}` can only be read or written by the document owner (`request.auth.uid == userId`) or an authorized administrator.
6. **Order Confidentiality**: Orders in `/orders/{orderId}` can only be read by the placing user (`resource.data.userId == request.auth.uid`) or an authorized administrator. Deletion is restricted to Administrators only.
7. **Contact & Newsletter Confidentiality**: Submissions in `/contacts` and `/newsletter` can only be read, inspected, or managed by an authorized administrator.

## 2. The "Dirty Dozen" Vulnerability Payloads (All MUST return PERMISSION_DENIED)
1. **Payload 1 (Self-Promotion to Admin)**: Unauthenticated visitor attempts `setDoc(doc(db, 'admins', 'intruder'), { role: 'superadmin', isActive: true })`.
2. **Payload 2 (Customer Elevating Self to Admin)**: Authenticated regular customer `UID: cust_42` attempts `setDoc(doc(db, 'admins', 'cust_42'), { role: 'admin', isActive: true })`.
3. **Payload 3 (Disabled Admin Modification)**: Authenticated user who is in `/admins` but with `isActive: false` attempts to write to `/products/p1`.
4. **Payload 4 (Customer Updating Product Catalog)**: Customer `UID: cust_42` attempts `updateDoc(doc(db, 'products', 'saree-1'), { sellingPrice: 10 })`.
5. **Payload 5 (Customer Modifying Coupon Discount)**: Customer attempts `updateDoc(doc(db, 'coupons', 'FLAT50'), { discountValue: 9999, discountType: 'flat' })`.
6. **Payload 6 (Unauthorized Banner Overwrite)**: Non-admin attempts to replace hero banners in `/banners/banner-1`.
7. **Payload 7 (Store Settings Hijack)**: Non-admin attempts `setDoc(doc(db, 'siteSettings', 'global'), { whatsapp: '+1234567890' })`.
8. **Payload 8 (Customer Deleting Other Customer's Order)**: Customer `UID: cust_42` attempts `deleteDoc(doc(db, 'orders', 'FSH-2026-99999'))`.
9. **Payload 9 (Customer Reading Another's Order Details)**: Customer `UID: cust_42` attempts `getDoc(doc(db, 'orders', 'FSH-2026-secret'))` where `userId: 'cust_88'`.
10. **Payload 10 (Non-Admin Listing Admin Collection)**: Regular customer attempts `getDocs(collection(db, 'admins'))` to harvest admin emails.
11. **Payload 11 (Non-Admin Reading Private Contact Submissions)**: Non-admin user attempts `getDocs(collection(db, 'contacts'))`.
12. **Payload 12 (Non-Admin Modifying Policies CMS)**: Non-admin user attempts `setDoc(doc(db, 'policies', 'terms'), { content: 'Hacked' })`.
