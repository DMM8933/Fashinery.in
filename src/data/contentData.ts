import { FAQItem, Policy } from '../types';

export const INITIAL_FAQS: FAQItem[] = [
  {
    id: 'faq-1',
    category: 'Orders',
    question: 'How can I place an order on Fashinery?',
    answer: 'Browse our collection, select your desired size and color, click "Add to Cart", and proceed to Checkout. You can complete your purchase using secure UPI, Credit/Debit Cards, Net Banking, or Cash on Delivery (COD). No mandatory registration is needed to place an order.',
    sortOrder: 1,
    isActive: true,
  },
  {
    id: 'faq-2',
    category: 'Orders',
    question: 'Can I modify or cancel my order after placing it?',
    answer: 'You can request cancellation directly from your "My Orders" dashboard or by reaching out to our WhatsApp support (+91 93720 85090) as long as your order has not been dispatched. Once dispatched, orders cannot be cancelled in transit, but you can initiate a return upon delivery.',
    sortOrder: 2,
    isActive: true,
  },
  {
    id: 'faq-3',
    category: 'Shipping',
    question: 'Is shipping free on Fashinery?',
    answer: 'Yes! Fashinery proudly offers 100% FREE standard express shipping on ALL domestic orders across India, with no minimum order value required.',
    sortOrder: 3,
    isActive: true,
  },
  {
    id: 'faq-4',
    category: 'Shipping',
    question: 'How long does delivery take and how can I track it?',
    answer: 'Orders are typically processed within 1–2 business days. Estimated delivery is 2–4 business days for metropolitan cities and 3–6 business days for the rest of India. You will receive an SMS and email with live tracking details, and you can track your package anytime on our "Track Your Order" page.',
    sortOrder: 4,
    isActive: true,
  },
  {
    id: 'faq-5',
    category: 'Returns',
    question: 'How do I request a return or exchange?',
    answer: 'To initiate a return: 1. Log in to your Fashinery account. 2. Go to "My Orders". 3. Select the delivered order and click "Request Return". 4. Choose your reason and submit. Our support team will review your request and arrange an authorized reverse doorstep pickup. Alternatively, you can contact us directly on WhatsApp (+91 93720 85090) or email care.fashinery@gmail.com.',
    sortOrder: 5,
    isActive: true,
  },
  {
    id: 'faq-6',
    category: 'Returns',
    question: 'Where should I send my return parcel? Can I ship it to your business address?',
    answer: 'In-person drop-offs and direct parcel shipments cannot be accepted at our corporate office. All returns must be initiated through the website under My Orders.',
    sortOrder: 6,
    isActive: true,
  },
  {
    id: 'faq-7',
    category: 'Refunds',
    question: 'How long does it take to receive my refund?',
    answer: 'Once the returned item reaches our fulfillment center and passes quality inspection (within 24–48 hours of receipt), refunds are initiated. For prepaid orders, refunds reflect in your original payment method in 5–7 business days. For COD orders, refunds are credited directly to your bank account via UPI or NEFT upon receiving your bank details.',
    sortOrder: 7,
    isActive: true,
  },
  {
    id: 'faq-8',
    category: 'Exchanges',
    question: 'Can I exchange my garment for another size or color?',
    answer: 'Yes, eligible items can be exchanged for an alternate size or color within the 7-day return window, subject to inventory availability. Submit an exchange request through "My Orders" or message our WhatsApp concierge.',
    sortOrder: 8,
    isActive: true,
  },
  {
    id: 'faq-9',
    category: 'Products',
    question: 'What if I receive a damaged, defective, or incorrect product?',
    answer: 'If you receive a defective, damaged, or incorrect item, please notify us within 48 hours of delivery with photos/unboxing video via WhatsApp (+91 93720 85090) or email care.fashinery@gmail.com. We will immediately arrange a complimentary priority replacement or full refund.',
    sortOrder: 9,
    isActive: true,
  },
  {
    id: 'faq-10',
    category: 'Payments',
    question: 'What payment methods do you accept?',
    answer: 'We accept all major payment methods including UPI (Google Pay, PhonePe, Paytm), Credit Cards (Visa, MasterCard, RuPay, Amex), Debit Cards, Net Banking, and Cash on Delivery (COD).',
    sortOrder: 10,
    isActive: true,
  },
  {
    id: 'faq-11',
    category: 'Account',
    question: 'Do I need an account to place an order?',
    answer: 'No, you can check out quickly as a guest. However, creating an account makes it effortless to track your orders, view order history, save delivery addresses, and initiate return or exchange requests.',
    sortOrder: 11,
    isActive: true,
  },
  {
    id: 'faq-12',
    category: 'Account',
    question: 'How can I contact Fashinery customer support?',
    answer: 'You can reach us by email at care.fashinery@gmail.com, phone at 93720 85090, or via instant WhatsApp support at +91 93720 85090. Our concierge is available Monday to Saturday, 10:00 AM to 7:00 PM IST.',
    sortOrder: 12,
    isActive: true,
  },
];

export const COMPREHENSIVE_POLICIES: Policy[] = [
  {
    id: 'policy-shipping',
    slug: 'shipping',
    title: 'Shipping Policy',
    subtitle: 'Transparent, reliable doorstep delivery with 100% free shipping across India.',
    status: 'published',
    updatedAt: '2026-09-10T12:00:00Z',
    seoTitle: 'Shipping Policy | Fashinery - Free Pan-India Delivery',
    seoDescription: 'Read the official shipping policy of Fashinery. 100% Free shipping on all orders, reliable courier partners, and live tracking updates.',
    content: `
# Shipping Policy

At **Fashinery**, we are dedicated to delivering our hand-curated garments with maximum care, speed, and transparency. This Shipping Policy explains how orders are processed, dispatched, and delivered to your doorstep.

---

### 1. Free Shipping on All Orders
- **100% Complimentary Shipping:** Fashinery provides **FREE Standard Shipping on ALL orders** across India.
- There is **no minimum order value** required to qualify for free delivery.
- Whether you order a single kurti or an opulent bridal lehenga set, you will never be charged an unexpected shipping fee at checkout.

---

### 2. Order Confirmation & Processing
- Once your order is successfully placed, you will immediately receive an automated confirmation email and SMS containing your unique Order ID (e.g., FSH-2026-XXXXX).
- Standard orders are processed and packed at our central fulfillment facility within **1 to 2 business days** (Monday through Saturday, excluding gazetted national holidays).
- For made-to-measure, customized alterations, or bespoke bridal couture, crafting and tailored fitting requires an additional 4 to 7 crafting days before dispatch.

---

### 3. Dispatch & Delivery Timelines
- Orders are dispatched via trusted, insured premier logistics partners (including BlueDart, Delhivery, DTDC, and Shiprocket).
- **Estimated Delivery Timelines:**
  - **Metropolitan Cities (Mumbai, Delhi NCR, Bengaluru, Hyderabad, Chennai, Kolkata, Pune, Ahmedabad):** 2 to 4 business days post-dispatch.
  - **Rest of India (Tier 2 & Tier 3 Cities):** 3 to 6 business days post-dispatch.
  - **Remote, Northeast & Special Service Areas:** 5 to 8 business days post-dispatch.
- *Please Note:* Delivery timelines may vary depending on the customer's geographic location, local courier routing, weather conditions, or unforeseen regional disruptions beyond our reasonable control.

---

### 4. Consignment Tracking
- As soon as your parcel is handed over to the courier partner, you will receive an SMS and email notification with your live consignment tracking number (AWB) and carrier link.
- You can also monitor your live delivery progress anytime using the **Track Your Order** page on our website by entering your Order ID and contact number.

---

### 5. Delivery Attempts & Security
- Our delivery personnel will attempt delivery up to **3 consecutive times** before returning the consignment to our hub.
- Please ensure an authorized individual is present to receive the parcel and verify package seal integrity.
- If a delivery attempt fails due to an incorrect phone number or unreachable premises, our logistics team will notify you via SMS/WhatsApp to coordinate a convenient re-delivery window.

---

### 6. Accurate Shipping Address
- Customers are responsible for providing complete and accurate shipping information, including flat/house number, street, landmark, city, state, and a valid 6-digit postal pincode.
- Fashinery cannot be held liable for delivery delays or failed deliveries arising from erroneous, incomplete, or outdated address inputs.

---

### 7. Damaged, Tampered, or Missing Packages
- If your parcel appears visibly damaged, crushed, cut, or tampered with at the time of delivery, please take clear photos before opening, or politely refuse acceptance from the courier executive and note "Damaged on Arrival".
- Please report any damage, defect, or missing items to our support team within **48 hours of delivery** with unboxing photos/video.

---

### 8. Unforeseen Delays & Support Assistance
- In rare events of natural calamities, severe weather, regional transport strikes, or festive peak volume delays, our operations team actively intervenes to expedite delivery.
- If your consignment is delayed or requires urgent routing assistance, please reach out directly:
  - **Email:** care.fashinery@gmail.com
  - **WhatsApp Helpline:** +91 93720 85090
  - **Hours:** Monday to Saturday, 10:00 AM – 7:00 PM IST
`.trim(),
  },
  {
    id: 'policy-return-refund',
    slug: 'return-refund',
    title: 'Return & Refund Policy',
    subtitle: 'Clear, transparent guidelines on product returns, open delivery inspection, and refund processing.',
    status: 'published',
    updatedAt: '2026-09-27T02:50:00Z',
    seoTitle: 'Return & Refund Policy | Fashinery',
    seoDescription: 'Read the official Return & Refund Policy for Fashinery. Learn how to initiate a return, open delivery inspection, and refund details.',
    content: `
# Return & Refund Policy

At **FASHINERY**, we want you to love every purchase you receive. If your order is eligible for a return, you can easily initiate a return request directly through your FASHINERY account.

---

### 1. How to Request a Return
All return requests must be initiated through the **FASHINERY website**.

**Go to:**  
**My Account → My Orders → Select Order → Request Return**

Select the applicable reason, provide the required details, and submit your request.

> **Please Note:** Please do not send any product back before your return request has been submitted and the return instructions have been provided by FASHINERY.

---

### 2. Open Delivery & Delivery Inspection
Whenever the **"Open Delivery"** option is available, we strongly recommend choosing it.

Please inspect the package and product carefully at the time of delivery, preferably in the presence of the delivery representative.

If the product appears damaged, defective, incorrect, or incomplete, please take clear photographs and/or a video of:
- **The product**
- **The outer packaging**
- **The shipping label**
- **The visible damage or defect**

This information may be required to help us review your request.

---

### 3. Damaged or Defective Products
If you receive a product that is damaged or appears to have a manufacturing defect, please report it to FASHINERY as soon as possible.

Please provide:
- **Order ID**
- **Customer name**
- **Registered mobile number**
- **Clear photos/videos of the product**
- **Photos of the packaging and shipping label**
- **A brief description of the issue**

You may share the required information through our official FASHINERY WhatsApp support or email:

- **WhatsApp:** [+91 93720 85090](https://wa.me/919372085090)
- **Email:** [care.fashinery@gmail.com](mailto:care.fashinery@gmail.com)

*Please mention your Order ID whenever contacting our support team.*

---

### 4. Return Review & Approval
Once a return request is submitted, our team will review the request and verify the details provided.

If the request meets the applicable return conditions, FASHINERY will provide the next steps for the return.

Return approval is subject to product eligibility and the condition of the item.

---

### 5. Product Condition for Return
For an eligible return, the product should generally be:
- **Unused and unworn**
- **In its original condition**
- **Returned with original packaging** where applicable
- **Accompanied by original tags, labels, and accessories** where applicable

Products showing signs of use, washing, alteration, damage after delivery, or missing original tags/packaging may be subject to return rejection, depending on the circumstances.

---

### 6. Refund
Once an approved return is received and successfully reviewed, the applicable refund will be processed according to the original order/payment method and FASHINERY's applicable refund process.

The time taken for the refund to appear in your account may vary depending on the payment method and financial institution.

For **Cash on Delivery** orders, any eligible refund will be processed using the refund method communicated by FASHINERY after the return has been approved.

---

### 7. Important Return Instructions
Please do not courier or send a return package to any FASHINERY address on your own.

Always create a return request through the website first and wait for the return instructions. FASHINERY will guide you through the applicable return process.

---

### 8. Customer Support
For return-related assistance, contact FASHINERY:

- **WhatsApp:** [+91 93720 85090](https://wa.me/919372085090)
- **Email:** [care.fashinery@gmail.com](mailto:care.fashinery@gmail.com)

Please keep your **Order ID** ready so our support team can assist you more efficiently.

---

### Important Notice
Return eligibility, approval, and refund are subject to the applicable product condition and return requirements.

FASHINERY reserves the right to review each return request based on the condition of the product and the information provided.
`.trim(),
  },
  {
    id: 'policy-cancellation',
    slug: 'cancellation',
    title: 'Cancellation Policy',
    subtitle: 'Clear rules on order cancellations before dispatch and refund settlements.',
    status: 'published',
    updatedAt: '2026-09-10T12:00:00Z',
    seoTitle: 'Cancellation Policy | Fashinery - Order Cancellations & Guidelines',
    seoDescription: 'Understand Fashinery cancellation policy for prepaid and COD fashion orders. Quick cancellations before dispatch.',
    content: `
# Cancellation Policy

At Fashinery, we understand that you may occasionally need to cancel an order after placing it. We strive to accommodate cancellations as smoothly as possible.

---

### 1. Cancellation Before Processing & Dispatch
- You can cancel any standard order free of charge **before it has been packed and dispatched** from our Mumbai fulfillment atelier.
- **How to Cancel:**
  1. Go to **My Account > My Orders**.
  2. If the order status is currently *Pending*, *Confirmed*, or *Processing*, click the **"Cancel Order"** button.
  3. Select your cancellation reason and confirm.
  4. Alternatively, message us immediately on WhatsApp at **+91 93720 85090** or email **care.fashinery@gmail.com** with your Order ID.

---

### 2. Cancellation After Dispatch
- Once an order has been packed, assigned a courier tracking AWB, and dispatched from our facility, **it cannot be intercepted or cancelled while in transit**.
- If your parcel is already dispatched:
  - You may politely refuse acceptance at your doorstep when the courier executive attempts delivery.
  - Once the courier marks the shipment as "Returned to Origin (RTO)", your cancellation and refund will be processed.
  - Alternatively, you can accept delivery and initiate an easy 7-day return request through the website.

---

### 3. Cancellation After Delivery
- An order that has already been delivered cannot be cancelled under this cancellation policy.
- Instead, please refer to our **Return & Refund Policy** to submit a return request within 7 calendar days of delivery.

---

### 4. Prepaid Order Cancellations & Refunds
- For orders paid online via Credit/Debit Card, UPI, or Net Banking that are successfully cancelled prior to dispatch:
  - A **100% full refund** will be automatically initiated to your original payment method.
  - Refunds typically reflect in your account statement within **5 to 7 business days**, subject to your issuing bank's clearing timeline.

---

### 5. Cash on Delivery (COD) Cancellations
- For COD orders cancelled before dispatch, the order is cancelled immediately with zero cancellation fees or financial obligations.

---

### 6. Situations Where Cancellation May Not Be Possible
- Customized garments, tailored blouse alterations, or custom-measured bridal ensembles once fabric cutting or bespoke stitching has commenced.
- Orders already handed over to the courier partner for scheduled delivery.
- Promotional flash sale items where orders are flagged for immediate expedited dispatch.
`.trim(),
  },
  {
    id: 'policy-refund',
    slug: 'refund',
    title: 'Refund Policy',
    subtitle: 'Comprehensive breakdown of refund eligibility, payment modes, and bank timelines.',
    status: 'published',
    updatedAt: '2026-09-10T12:00:00Z',
    seoTitle: 'Refund Policy | Fashinery - Timelines, Processing & Methods',
    seoDescription: 'Read the comprehensive Refund Policy of Fashinery. Learn when refunds are issued, how COD refunds work, and banking timelines.',
    content: `
# Refund Policy

Fashinery is committed to transparent and ethical customer care. This Refund Policy provides clear insights into how, when, and through which payment channels your refunds are executed.

---

### 1. When Does a Refund Become Eligible?
A refund is triggered under any of the following verified conditions:
- An authorized return has been picked up from your doorstep, received at our warehouse, and passed physical quality inspection.
- An order was successfully cancelled before dispatch.
- An order was undelivered and returned to origin (RTO) by the courier service.
- An ordered item is out of stock or cannot be fulfilled.
- A defective, damaged, or incorrect item was verified and approved for refund.

---

### 2. Return Approval & Product Inspection
- All returned garments undergo an objective quality check (QC) within **24 to 48 hours** of reaching our warehouse.
- Items must pass verification: unworn, unwashed, unaltered, free of perfumes/makeup, with all original tags and security ribbons intact.
- Once the QC team approves the return, the refund is immediately approved and queued in our payment gateway system.

---

### 3. Refund Initiation & Payment Methods
- **Prepaid Transactions (Credit Card, Debit Card, Net Banking, UPI):**
  - The refund is routed directly back to the original bank card, account, or UPI handle utilized during checkout.
  - Gateway refunds are processed through RBI-authorized, PCI-compliant payment partners.
- **Cash on Delivery (COD) Transactions:**
  - Because cash payments are collected by courier personnel, refunds cannot be paid out in physical cash.
  - Our customer support team will send you a secure digital verification link or contact you from care.fashinery@gmail.com / +91 93720 85090 to obtain your **UPI Virtual Payment Address (VPA)** or **Bank NEFT Details** (Account Holder Name, Bank Name, Account Number, and IFSC Code).
  - COD refunds are transferred within 2 to 4 business days of receiving valid bank coordinates.

---

### 4. Configurable Refund Timelines
- **Refund Initiation by Fashinery:** Within 24 to 48 business hours of quality approval.
- **Bank Settlement Time:**
  - **UPI Transfers:** Typically instantaneous to 24 hours.
  - **Net Banking & Debit Cards:** 3 to 5 business days.
  - **Credit Cards:** 5 to 7 business days (depending on your card issuer's billing cycle).

---

### 5. Partial Refunds & Special Circumstances
- If an order with multiple items is partially returned, the refund will strictly correspond to the net price paid for the returned items after proportional discount adjustments.
- If a coupon code had a minimum threshold condition that is no longer satisfied following a partial return, the refund amount may be adjusted to reflect the revised cart value.

---

### 6. Failed Refunds & Banking Delays
- In the rare circumstance where a refund fails due to an expired credit card, closed bank account, or bank server timeout, our finance team will promptly contact you to arrange an alternative direct NEFT transfer.
- For questions regarding refund status, please provide your Order ID to **care.fashinery@gmail.com** or WhatsApp **+91 93720 85090**.
`.trim(),
  },
  {
    id: 'policy-exchange',
    slug: 'exchange',
    title: 'Exchange Policy',
    subtitle: 'Convenient size and color exchanges for the perfect drape and fit.',
    status: 'published',
    updatedAt: '2026-09-10T12:00:00Z',
    seoTitle: 'Exchange Policy | Fashinery - Size & Style Exchanges',
    seoDescription: 'Find out how to exchange your Fashinery outfit for a different size or color. Hassle-free doorstep exchange assistance.',
    content: `
# Exchange Policy

At Fashinery, we understand that getting the perfect silhouette, shoulder fall, and waist fitting is essential for feeling confident in your attire. Our Exchange Policy is crafted to make size and color swaps seamless.

---

### 1. Eligible Products for Exchange
- Garments eligible for return (such as standard sized Sarees, Kurti sets, Lehengas, and Dresses) can be exchanged for an alternate size or available color variant.
- Exchanges are subject to real-time stock availability in our warehouse.
- If the requested size or color is unfortunately out of stock, you may choose another design or opt for a 100% full refund under our Return Policy.

---

### 2. Exchange Window & Product Condition
- Exchange requests must be submitted within **7 calendar days** of the delivery date.
- The product must remain **unworn, unwashed, unaltered**, and in its original pristine packaging with all brand tags and designer ribbons securely attached.
- Garments showing signs of wear, body scent, makeup stains, or detached labels cannot be accepted for exchange.

---

### 3. Non-Exchangeable Merchandise
- Customized orders, custom-tailored lehenga cholis, or altered hem lengths.
- Products sold during clearance sales designated as "Final Sale".
- Accessories, jewelry, or intimate apparel due to hygienic safety standards.

---

### 4. Step-by-Step Exchange Process
1. Navigate to **My Account > My Orders** on our website.
2. Select the order and click **"Request Return / Exchange"**.
3. Choose **"Size Exchange"** or **"Color Exchange"** and specify the replacement size/color desired.
4. Our team will verify inventory and reserve your replacement piece.
5. Our courier partner will visit your address to pick up the original item.
6. Once the returned garment passes quality inspection at our atelier, your newly sized garment is dispatched with complimentary express shipping.

*Assistance:* You can also coordinate your exchange directly with our fashion stylists via WhatsApp at **+91 93720 85090** or email **care.fashinery@gmail.com**.
`.trim(),
  },
  {
    id: 'policy-privacy',
    slug: 'privacy',
    title: 'Privacy Policy',
    subtitle: 'Your privacy, personal data security, and confidentiality commitments.',
    status: 'published',
    updatedAt: '2026-09-10T12:00:00Z',
    seoTitle: 'Privacy Policy | Fashinery - Data Security & Protection',
    seoDescription: 'Fashinery official privacy policy detailing data collection, processing, customer rights, and security measures.',
    content: `
# Privacy Policy

**Effective Date:** September 2026  
**Brand:** FASHINERY  
**Contact Email:** care.fashinery@gmail.com  

---

### 1. Introduction
Welcome to Fashinery ("we", "our", or "us"). We value the trust you place in us and take your privacy seriously. This Privacy Policy outlines our transparent practices concerning the collection, storage, utilization, and protection of your personal information when you visit our website (fashinery.com) and utilize our services.

---

### 2. Information We Collect
We collect personal information that you provide directly to us when creating an account, browsing collections, purchasing garments, interacting with customer support, or subscribing to our newsletters.

---

### 3. Name and Contact Information
We collect your full name, telephone / mobile number, and email address so that we can communicate regarding your orders, send status updates, and assist with sizing inquiries.

---

### 4. Shipping & Delivery Address
To deliver your ordered items, we collect complete delivery addresses, including apartment details, street, city, state, postal pincode, and optional delivery landmark instructions.

---

### 5. Account Information
If you create a customer profile or sign in using authorized providers (such as Google Authentication), we store your profile identifier, email, and preferences to facilitate convenient checkout and order history viewing.

---

### 6. Order Information
We maintain records of products purchased, quantities, sizes, payment methods, transaction timestamps, order notes, return requests, and delivery milestones.

---

### 7. Payment Information
All electronic transactions are processed through certified, PCI-DSS compliant payment gateways. **Fashinery does not capture, store, or have access to your sensitive financial credentials**, such as credit card numbers, CVV codes, or net banking passwords.

---

### 8. Device and Website Information
When you browse our website, we may automatically collect non-personally identifiable technical information such as your IP address, browser type, operating system, device screen resolution, referring URLs, and pages viewed to optimize site rendering.

---

### 9. How We Use Information
We use your information exclusively for legitimate, fashion-commerce operational purposes:
- Fulfilling orders and delivering items.
- Processing secure payments and refunds.
- Sending transactional SMS, email, and WhatsApp delivery alerts.
- Providing responsive customer support.
- Preventing fraudulent transactions and maintaining website security.

---

### 10. Order Processing
Your information is utilized to verify inventory, dispatch garments from our Mumbai fulfillment atelier, and produce shipping labels and invoices.

---

### 11. Customer Support
When you submit an inquiry through our Contact Us form, email us, or message us on WhatsApp, we use your contact details and order references to address your questions effectively.

---

### 12. Marketing Communications
With your consent, we may send occasional previews of new seasonal collections, festive capsules, or special offers. You may opt out or unsubscribe from promotional messages at any time using the unsubscribe link or by contacting us.

---

### 13. Cookies
We utilize cookies and similar browser storage mechanisms to maintain your shopping cart items, remember your view preferences, and facilitate smooth navigation. See our Cookie Policy for detailed information.

---

### 14. Analytics
We may utilize aggregated, anonymized analytical tools to understand customer browsing patterns, improve navigation fluidity, and optimize our catalog curation.

---

### 15. Data Sharing
We do not sell, rent, trade, or monetize your personal information to third-party marketing companies. Data is shared strictly with authorized service providers who require it to perform essential business functions on our behalf.

---

### 16. Service Providers
We partner with verified technology and cloud infrastructure providers (such as Google Cloud / Firebase) who host our database under rigorous confidentiality standards.

---

### 17. Payment Providers
We securely transmit order values to RBI-authorized, encrypted payment gateways to authorize debit/credit card, UPI, and net banking transactions.

---

### 18. Shipping and Courier Partners
To deliver garments to your residence and execute doorstep returns, necessary details (name, delivery address, and phone number) are transmitted to logistics partners such as BlueDart, Delhivery, DTDC, and Shiprocket.

---

### 19. Data Security
We take reasonable measures to protect personal information against unauthorized access, loss, misuse, or alteration. We utilize SSL/TLS encryption for all data in transit, restricted-access databases, and continuous operational auditing.

---

### 20. Data Retention
We retain your personal information for as long as your customer account remains active or as required to fulfill orders, process warranties and returns, resolve disputes, and satisfy statutory tax and accounting regulations.

---

### 21. Customer Rights
You have the right to:
- Access and review the personal information we hold about you.
- Request corrections to erroneous contact or shipping details.
- Request the closure of your account and deletion of non-statutory records.
- Opt out of promotional newsletters.

---

### 22. Children's Privacy
Fashinery does not intentionally target, collect, or solicit personal information from individuals under the age of 18 without parental consent.

---

### 23. Third-Party Links
Our website may contain links to external partner services (e.g., WhatsApp, payment providers). We are not responsible for the privacy practices of external third-party applications.

---

### 24. Policy Changes
We may update this Privacy Policy from time to time to reflect operational or regulatory updates. Any revisions will be published on this page with an updated revision date.

---

### 25. Contact Information
If you have questions, feedback, or data privacy requests, please contact our Data Care Representative:
- **Brand:** FASHINERY
- **Email:** care.fashinery@gmail.com
- **Helpline / WhatsApp:** +91 93720 85090
- **Address:** Kurar Village, Shivaji Nagar, Malad East, Mumbai, Maharashtra, India - 400997
`.trim(),
  },
  {
    id: 'policy-terms',
    slug: 'terms',
    title: 'Terms & Conditions',
    subtitle: 'General conditions governing website usage, orders, and commercial transactions.',
    status: 'published',
    updatedAt: '2026-09-10T12:00:00Z',
    seoTitle: 'Terms & Conditions | Fashinery - Terms of Service',
    seoDescription: 'Official Terms & Conditions of Fashinery. Review customer rights, pricing, orders, intellectual property, and governing legal frameworks.',
    content: `
# Terms & Conditions

Welcome to **Fashinery** (fashinery.com). These Terms & Conditions constitute a legally binding agreement between you ("Customer", "Visitor", or "User") and Fashinery ("Brand", "we", "us"). By accessing our website, browsing our catalog, or placing an order, you agree to comply with these terms.

---

### 1. Website Usage & Eligibility
- You must be at least 18 years old, or possess parental/guardian consent, to engage in transactions on this website.
- You agree to use our website only for lawful, personal consumer purposes in accordance with applicable laws.

---

### 2. Account Registration & Responsibilities
- You are responsible for maintaining the confidentiality of your account credentials and restricting unauthorized access to your devices.
- You agree to provide accurate, current, and complete information during checkout and registration.

---

### 3. Product Information & Visual Representation
- We take utmost care to accurately describe fabric compositions, embroidery techniques, silhouettes, and dimensions.
- **Product Photography:** While our photography utilizes high-fidelity color standards, minor chromatic variations may occur across various mobile and computer screens. Furthermore, handwoven textiles and artisanal embroideries naturally exhibit subtle variations that testify to their authentic handmade origin.

---

### 4. Pricing, Taxes & Invoicing
- All prices displayed on the website are quoted in Indian Rupees (₹ / INR).
- Prices are inclusive of applicable Goods and Services Tax (GST) unless explicitly indicated otherwise.
- We reserve the right to modify prices, launch promotional discounts, or correct typographic errors without prior notice.

---

### 5. Offers, Discounts & Coupons
- Promotional coupons and discount vouchers are valid only within their stated eligibility criteria, expiration periods, and usage limits.
- Coupons cannot be combined with conflicting promotional discounts unless explicitly permitted.

---

### 6. Orders & Order Confirmation
- Submitting an order constitutes an offer to purchase.
- An order is considered confirmed when Fashinery issues an official electronic confirmation with an Order ID via email or SMS.
- We reserve the right to refuse or cancel orders due to unavailability of stock, payment discrepancies, or suspected fraudulent activity.

---

### 7. Payments & Security
- We support secure payments via authorized payment gateways, UPI, Net Banking, Credit/Debit Cards, and Cash on Delivery (COD).
- By providing payment details, you confirm that you are authorized to utilize the designated payment method.

---

### 8. Shipping & Delivery
- Fashinery provides free shipping on all orders across India.
- Delivery timelines are estimates and subject to regional courier operations. Please refer to our detailed **Shipping Policy** for terms regarding processing, transit times, and delivery attempts.

---

### 9. Returns, Refunds & Exchanges
- All returns, refunds, and exchanges are governed by our dedicated **Return & Refund Policy**, **Refund Policy**, and **Exchange Policy**.
- **Crucial Rule:** Return parcels must never be dispatched directly to our registered business address without an authorized return request and reverse courier pickup booking.

---

### 10. Intellectual Property Rights
- All content on this website—including the Fashinery brand name, logo, photographic imagery, garment designs, product descriptions, website graphics, and code—is the intellectual property of Fashinery and protected by applicable copyright and trademark laws.
- You may not copy, reproduce, distribute, or exploit any website content without our prior written consent.

---

### 11. Prohibited Activities
You agree not to:
- Introduce viruses, trojans, malicious code, or scrape data using automated tools.
- Disrupt the security or performance of the website or servers.
- Transmit abusive, defamatory, or unlawful communications through our contact channels.

---

### 12. Limitation of Liability
- To the maximum extent permitted by law, Fashinery shall not be liable for any indirect, incidental, or consequential damages resulting from the use or inability to use our services or products.
- In any circumstance, our aggregate liability shall be limited to the actual net purchase price paid by the customer for the specific garment order in dispute.

---

### 13. Changes to Terms
- We reserve the right to revise or update these Terms & Conditions at any time. Your continued use of the website following the posting of changes constitutes acceptance of those revisions.

---

### 14. Governing Law & Jurisdiction
- These Terms & Conditions shall be governed by and construed in accordance with the laws of India.
- Any disputes arising in connection with these terms shall be subject to the exclusive jurisdiction of the competent courts located in Mumbai, Maharashtra, India.

---

### 15. Contact Information
If you have any questions concerning these Terms & Conditions, please contact:
- **Email:** care.fashinery@gmail.com
- **Phone / WhatsApp:** +91 93720 85090
- **Address:** Kurar Village, Shivaji Nagar, Malad East, Mumbai, Maharashtra, India - 400997
`.trim(),
  },
  {
    id: 'policy-cookies',
    slug: 'cookies',
    title: 'Cookie Policy',
    subtitle: 'How we utilize cookies and local browser storage to enrich your shopping experience.',
    status: 'published',
    updatedAt: '2026-09-10T12:00:00Z',
    seoTitle: 'Cookie Policy | Fashinery - Browser Storage & Privacy',
    seoDescription: 'Learn about the essential, functional, and analytical cookies used on Fashinery to preserve your cart and enhance your browsing journey.',
    content: `
# Cookie Policy

This Cookie Policy explains what cookies are, how Fashinery utilizes cookies and local browser storage technologies, and how you can manage your cookie preferences.

---

### 1. What Are Cookies?
Cookies are small alphanumeric text files stored on your browser or device when you visit websites. They allow websites to remember your device, preferences, and session state over time to deliver a more seamless browsing and shopping experience.

---

### 2. Categories of Cookies We Use

#### A. Essential & Session Cookies
- These cookies and local storage entries are strictly necessary for the core functionality of our ecommerce website.
- They enable you to navigate pages, maintain items inside your shopping cart, preserve your wishlist, and proceed through our multi-step checkout securely.
- Disabling these cookies will prevent the shopping cart and checkout mechanisms from functioning properly.

#### B. Functional Cookies
- Functional storage remembers your view preferences, category filters, and user account status across visits so you do not need to re-enter your choices every time you load the site.

#### C. Performance & Analytics Cookies
- These cookies gather aggregated, anonymous data regarding how visitors navigate the catalog, which garment categories are most visited, and whether error pages occur.
- They help us refine site responsiveness, page loading speed, and mobile usability.

---

### 3. Shopping Cart & Local Storage
- In addition to standard browser cookies, Fashinery uses **HTML5 Local Storage** to safely retain:
  - Your active Cart items and quantities (\`fashinery_cart\`).
  - Your curated Wishlist selections (\`fashinery_wishlist\`).
  - Your cookie consent preferences.
- This data remains stored locally on your device and is not shared with unauthorized third parties.

---

### 4. Third-Party Cookies
- When interacting with external features on our website (such as Google Authentication or our WhatsApp integration), those third-party providers may set their own cookies in accordance with their respective privacy policies.

---

### 5. Managing Your Cookie Preferences
- Most web browsers allow you to control or delete cookies through your browser settings.
- You can configure your browser to reject all cookies or notify you when a cookie is being placed.
- *Note:* If you choose to disable essential cookies, certain features such as your persistent shopping bag, wishlist, and checkout will not operate as intended.

---

### 6. Contact Us
For inquiries regarding our cookie practices, please write to:
- **Email:** care.fashinery@gmail.com
- **WhatsApp:** +91 93720 85090
`.trim(),
  },
  {
    id: 'policy-about',
    slug: 'about',
    title: 'About Fashinery',
    subtitle: 'Elegance in Every Look — Curated contemporary & timeless Indian women’s apparel.',
    status: 'published',
    updatedAt: '2026-09-10T12:00:00Z',
    seoTitle: 'About Us | Fashinery - Elegance in Every Look',
    seoDescription: 'Discover the Fashinery story. Elegance in Every Look — Thoughtfully curated Indian women’s fashion blending elegance, comfort, and contemporary style.',
    content: `
# Elegance in Every Look

Discover thoughtfully curated styles designed to bring confidence, comfort, and elegance to every occasion.

---

### The Fashinery Story
Fashinery is a fashion-focused ecommerce brand created for women who love contemporary style, elegant designs, and effortless fashion. We believe that clothing should celebrate individuality, flatter diverse silhouettes, and feel as exquisite as it looks.

Born in Mumbai, the vibrant epicentre of Indian fashion and textiles, Fashinery brings together stylish clothing, seasonal trends, and timeless pieces in one convenient online destination. From fluid everyday kurtis to celebratory silks and statement dresses, every piece is chosen to inspire grace and joy in your daily wardrobe.

---

### Our Vision
We want fashion to be easy to discover, easy to shop, and enjoyable to wear. 

Fashinery aims to offer modern styles while keeping quality, value, and customer experience at the heart of the shopping journey. Whether dressing for an intimate family celebration, festive gathering, work milestone, or casual weekend, we want every woman to discover garments that resonate with her authentic self.

---

### What We Believe
- **01 QUALITY:** Every style is selected with attention to fabric, finish, and overall value. We examine stitching integrity, drape, and comfort so each piece stands the test of time.
- **02 STYLE:** From everyday essentials to statement looks, we bring styles for every mood and occasion.
- **03 CUSTOMER FIRST:** We believe shopping should feel simple, transparent, and comfortable—backed by free shipping on all orders and respectful support.
- **04 CONFIDENCE:** Fashion is personal. We want every Fashinery piece to help you feel confident in your own style.

---

### Why Fashinery
- **Curated Fashion:** Hand-selected designs emphasizing aesthetic balance and superior drape.
- **Contemporary Styles:** Blending modern silhouettes with rich Indian textile traditions.
- **Easy Online Shopping:** Clean, intuitive navigation with fast loading and mobile optimization.
- **Secure Checkout:** Encrypted payment pathways and convenient Cash on Delivery.
- **Customer Support:** Friendly, dedicated assistance via phone, email, and WhatsApp.
- **Easy Return Request Process:** Transparent 7-day doorstep return pickup right from your account.

---

### Our Promise
*"Elegance in Every Look — Your Style. Your Confidence. Your Fashinery."*

We are committed to making your online fashion experience simple, transparent, and enjoyable—from discovering a product to receiving it at your doorstep.
`.trim(),
  },
];
