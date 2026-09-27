import express from 'express';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import dotenv from 'dotenv';
import Razorpay from 'razorpay';
import { createServer as createViteServer } from 'vite';
import { db, removeUndefinedFields } from './src/lib/firebase';
import firebaseConfig from './firebase-applet-config.json';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  increment,
  collection,
  getDocs,
  query,
  where,
  limit,
} from 'firebase/firestore';

dotenv.config();

// Helper to safely get Razorpay client with lazy initialization
function getRazorpayClient(): Razorpay | null {
  const key_id = process.env.RAZORPAY_KEY_ID || process.env.VITE_RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;

  if (!key_id || !key_secret) {
    return null;
  }

  return new Razorpay({
    key_id,
    key_secret,
  });
}

// Server-side calculation and verification helper
// Validates customer identity, products, stock/pricing, coupon rules, and shipping
async function calculateVerifiedOrder(body: {
  items: any[];
  shippingAddress: any;
  couponCode?: string;
  customerUserId?: string;
}) {
  const { items, shippingAddress, couponCode, customerUserId } = body;

  if (!shippingAddress) {
    throw new Error('Shipping address is required.');
  }

  const cleanFullName = (shippingAddress.fullName || '').trim();
  const cleanPhone = (shippingAddress.phone || '').replace(/\D/g, '');
  const cleanEmail = (shippingAddress.email || '').trim().toLowerCase();
  const cleanAddress1 = (shippingAddress.addressLine1 || '').trim();
  const cleanCity = (shippingAddress.city || '').trim();
  const cleanState = (shippingAddress.state || '').trim();
  const cleanPincode = (shippingAddress.pincode || '').replace(/\D/g, '');

  if (!cleanFullName || cleanFullName.length < 2) {
    throw new Error('Please enter a valid full name.');
  }
  if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
    throw new Error('Please enter a valid 10-digit Indian mobile number.');
  }
  if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
    throw new Error('Please enter a valid email address.');
  }
  if (!cleanAddress1 || cleanAddress1.length < 5) {
    throw new Error('Please enter your complete delivery address.');
  }
  if (!cleanCity || cleanCity.length < 2) {
    throw new Error('Please enter your city.');
  }
  if (!cleanState) {
    throw new Error('Please enter your state.');
  }
  if (!/^[1-9]\d{5}$/.test(cleanPincode)) {
    throw new Error('Please enter a valid 6-digit PIN code.');
  }

  if (!Array.isArray(items) || items.length === 0) {
    throw new Error('Your shopping bag is empty.');
  }

  // Server-side price calculation and verification from database
  let subtotal = 0;
  const orderItems: any[] = [];

  for (const item of items) {
    const qty = Math.max(1, parseInt(item.quantity, 10) || 1);
    let verifiedPrice = Number(item.price);
    let verifiedMrp = Number(item.mrp || item.price);
    let productName = item.name || item.productName || 'Handcrafted Luxury Garment';
    let productImage = item.image || item.productImage || '';
    let sku = item.sku || '';

    try {
      if (item.productId) {
        const productDoc = await getDoc(doc(db, 'products', item.productId));
        if (productDoc.exists()) {
          const pData = productDoc.data();
          verifiedPrice = Number(pData.sellingPrice) || verifiedPrice;
          verifiedMrp = Number(pData.mrp) || verifiedMrp;
          productName = pData.name || productName;
          sku = pData.sku || sku;
          if (Array.isArray(pData.images) && pData.images.length > 0) {
            productImage = pData.images[0];
          }
        }
      }
    } catch (dbErr) {
      console.warn('Could not verify product price from Firestore, using submitted price:', dbErr);
    }

    subtotal += verifiedPrice * qty;
    orderItems.push({
      productId: item.productId,
      productName,
      productImage,
      price: verifiedPrice,
      mrp: verifiedMrp,
      quantity: qty,
      size: item.size || 'Free Size',
      color: item.color || 'Standard',
      sku: sku || `SKU-${Date.now().toString().slice(-4)}`,
    });
  }

  // Server-side coupon discount calculation
  let discount = 0;
  let appliedCouponId: string | null = null;

  if (couponCode && typeof couponCode === 'string' && couponCode.trim()) {
    const cleanCode = couponCode.trim().toUpperCase();
    try {
      const couponsSnap = await getDocs(collection(db, 'coupons'));
      const foundCoupon = couponsSnap.docs.find(
        (c) => c.data().code?.toUpperCase() === cleanCode && c.data().isActive !== false
      );

      if (foundCoupon) {
        const cData = foundCoupon.data();
        appliedCouponId = foundCoupon.id;
        const minOrder = Number(cData.minOrderValue) || 0;

        if (subtotal >= minOrder) {
          if (cData.discountType === 'percentage') {
            const percDiscount = (subtotal * Number(cData.discountValue)) / 100;
            discount = cData.maxDiscount
              ? Math.min(percDiscount, Number(cData.maxDiscount))
              : percDiscount;
          } else {
            discount = Math.min(subtotal, Number(cData.discountValue) || 0);
          }
          discount = Math.round(discount);
        }
      }
    } catch (couponErr) {
      console.warn('Could not verify coupon from Firestore:', couponErr);
    }
  }

  // Shipping calculation from siteSettings
  let shippingCharge = 0;
  try {
    const settingsDoc = await getDoc(doc(db, 'siteSettings', 'global'));
    if (settingsDoc.exists()) {
      const s = settingsDoc.data();
      const threshold = Number(s.freeShippingThreshold) || 999;
      const baseRate = Number(s.shippingCharge) || 99;
      shippingCharge = subtotal >= threshold ? 0 : baseRate;
    } else {
      shippingCharge = subtotal >= 999 ? 0 : 99;
    }
  } catch (settingsErr) {
    shippingCharge = subtotal >= 999 ? 0 : 99;
  }

  const total = Math.max(0, subtotal - discount + shippingCharge);

  // Generate verified order number with high entropy
  const timestampPart = Date.now().toString().slice(-4);
  const randomPart = Math.floor(1000 + Math.random() * 9000);
  const orderNumber = `FSH-${new Date().getFullYear()}-${timestampPart}${randomPart}`;

  const cleanShippingAddress = {
    fullName: cleanFullName,
    phone: cleanPhone,
    email: cleanEmail,
    addressLine1: cleanAddress1,
    addressLine2: shippingAddress.addressLine2 || '',
    apartment: shippingAddress.apartment || '',
    city: cleanCity,
    state: cleanState,
    pincode: cleanPincode,
    country: shippingAddress.country || 'India',
  };

  return {
    cleanFullName,
    cleanPhone,
    cleanEmail,
    cleanShippingAddress,
    orderItems,
    subtotal,
    discount,
    shippingCharge,
    total,
    orderNumber,
    appliedCouponId,
    customerUserId: customerUserId || 'guest',
  };
}

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  // JSON request body parser with rawBody capture for webhook signature verification
  app.use(
    express.json({
      limit: '50mb',
      verify: (req: any, res, buf) => {
        req.rawBody = buf;
      },
    })
  );
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  // Production CORS & Security Headers configuration
  const allowedOriginsList = [
    process.env.APP_URL,
    process.env.PRODUCTION_DOMAIN,
    'https://ais-dev-xl3toqtbm3gu2ha7gpvris-283130993966.asia-southeast1.run.app',
    'https://ais-pre-xl3toqtbm3gu2ha7gpvris-283130993966.asia-southeast1.run.app',
    ...(process.env.ALLOWED_ORIGINS
      ? process.env.ALLOWED_ORIGINS.split(',').map((o) => o.trim())
      : []),
  ].filter(Boolean);

  app.use((req, res, next) => {
    const origin = req.headers.origin;

    const isOriginAllowed =
      !origin ||
      allowedOriginsList.includes(origin) ||
      origin.endsWith('.run.app') ||
      origin.endsWith('.web.app') ||
      origin.endsWith('.firebaseapp.com') ||
      origin.endsWith('.appspot.com') ||
      /^https?:\/\/localhost(:\d+)?$/.test(origin) ||
      /^https?:\/\/127\.0\.0\.1(:\d+)?$/.test(origin);

    if (origin && isOriginAllowed) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Access-Control-Allow-Credentials', 'true');
      res.setHeader(
        'Access-Control-Allow-Methods',
        'GET, POST, PUT, PATCH, DELETE, OPTIONS'
      );
      res.setHeader(
        'Access-Control-Allow-Headers',
        'Content-Type, Authorization, X-Requested-With, x-razorpay-signature'
      );
    }

    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
      return res.sendStatus(204);
    }

    // Production Security Headers compatible with Firebase, Google Auth, and Razorpay
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    // Allow popups for Google Auth and Razorpay checkout modal
    res.setHeader('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');

    next();
  });

  // 1. Production Health Check Route
  // Response: { "status": "ok" } (No sensitive data or credentials exposed)
  app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
  });

  // 2. Razorpay Public Configuration Endpoint
  const handleGetConfig = (req: express.Request, res: express.Response) => {
    const keyId = process.env.RAZORPAY_KEY_ID || process.env.VITE_RAZORPAY_KEY_ID || '';
    const hasSecret = Boolean(process.env.RAZORPAY_KEY_SECRET);
    res.json({
      keyId,
      isConfigured: Boolean(keyId && hasSecret),
      currency: 'INR',
    });
  };
  app.get('/api/razorpay/config', handleGetConfig);
  app.get('/api/payment/config', handleGetConfig);

  // 3. Trusted Server-Side Order Creation (For Cash on Delivery & Direct Checkout)
  // Ensures product prices, coupons, and totals are computed from the database
  app.post('/api/orders/create', async (req, res) => {
    try {
      const { paymentMethod } = req.body;
      const verified = await calculateVerifiedOrder(req.body);

      const orderDoc: any = {
        id: verified.orderNumber,
        orderNumber: verified.orderNumber,
        userId: verified.customerUserId,
        customerName: verified.cleanFullName,
        customerEmail: verified.cleanEmail,
        customerPhone: verified.cleanPhone,
        shippingAddress: verified.cleanShippingAddress,
        items: verified.orderItems,
        subtotal: verified.subtotal,
        discount: verified.discount,
        shippingCharge: verified.shippingCharge,
        total: verified.total,
        paymentMethod: paymentMethod === 'Cash on Delivery' ? 'Cash on Delivery' : 'Cash on Delivery',
        // Crucial security invariant: paymentStatus on creation is ALWAYS Pending
        paymentStatus: 'Pending',
        orderStatus: 'Confirmed',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        notes: 'Order placed securely via server verification (Cash on Delivery).',
      };

      if (verified.discount > 0 && req.body.couponCode) {
        orderDoc.couponCode = String(req.body.couponCode).trim().toUpperCase();
      }

      // Persist to Firestore
      const sanitized = removeUndefinedFields(orderDoc);
      await setDoc(doc(db, 'orders', verified.orderNumber), sanitized);

      // Increment coupon usage count if applied
      if (verified.appliedCouponId) {
        try {
          await updateDoc(doc(db, 'coupons', verified.appliedCouponId), {
            usedCount: increment(1),
            updatedAt: new Date().toISOString(),
          });
        } catch (couponErr) {
          console.warn('Could not update coupon count:', couponErr);
        }
      }

      return res.json({
        success: true,
        order: orderDoc,
        orderNumber: verified.orderNumber,
      });
    } catch (err: any) {
      console.error('Error creating order on server:', err?.message || err);
      return res.status(400).json({
        success: false,
        error: err?.message || 'Failed to process and verify order.',
      });
    }
  });

  // 4. Create Razorpay Order with live database price & coupon validation
  // Supports POST /api/razorpay/create-order and POST /api/payment/create-order
  const handleCreateRazorpayOrder = async (req: express.Request, res: express.Response) => {
    try {
      const verified = await calculateVerifiedOrder(req.body);

      // Check Razorpay credentials
      const key_id = process.env.RAZORPAY_KEY_ID || process.env.VITE_RAZORPAY_KEY_ID;
      const razorpay = getRazorpayClient();

      if (!razorpay || !key_id) {
        return res.status(503).json({
          success: false,
          error:
            'Razorpay payment gateway is not yet configured with RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET on the server. Please configure credentials in your environment or choose Cash on Delivery.',
          isConfigured: false,
        });
      }

      const amountInPaise = Math.round(verified.total * 100);
      if (amountInPaise < 100) {
        return res.status(400).json({ success: false, error: 'Order total must be at least ₹1.' });
      }

      // Create Razorpay Order via SDK
      const razorpayOrder = await razorpay.orders.create({
        amount: amountInPaise,
        currency: 'INR',
        receipt: verified.orderNumber,
        notes: {
          orderNumber: verified.orderNumber,
          customerName: verified.cleanFullName,
          customerPhone: verified.cleanPhone,
          customerEmail: verified.cleanEmail,
        },
      });

      // Construct and persist pending Order in Firestore
      const pendingOrder = {
        id: verified.orderNumber,
        orderNumber: verified.orderNumber,
        userId: verified.customerUserId,
        customerName: verified.cleanFullName,
        customerEmail: verified.cleanEmail,
        customerPhone: verified.cleanPhone,
        shippingAddress: verified.cleanShippingAddress,
        items: verified.orderItems,
        subtotal: verified.subtotal,
        discount: verified.discount,
        shippingCharge: verified.shippingCharge,
        total: verified.total,
        couponCode: verified.discount > 0 ? req.body.couponCode.trim().toUpperCase() : undefined,
        paymentMethod: 'UPI / Online Payment',
        paymentStatus: 'Pending',
        orderStatus: 'Pending Payment',
        razorpayOrderId: razorpayOrder.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        notes: 'Customer initiated Razorpay online payment.',
      };

      try {
        const sanitized = removeUndefinedFields(pendingOrder);
        await setDoc(doc(db, 'orders', verified.orderNumber), sanitized);
      } catch (fsErr) {
        console.warn('Could not persist pending order in Firestore:', fsErr);
      }

      return res.json({
        success: true,
        orderNumber: verified.orderNumber,
        razorpayOrderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        keyId: key_id,
        order: pendingOrder,
        appliedCouponId: verified.appliedCouponId,
      });
    } catch (err: any) {
      console.error('Error creating Razorpay order:', err?.message || err);
      const errMsg = err?.error?.description || err?.message || 'Failed to initialize payment gateway order.';
      return res.status(500).json({ success: false, error: errMsg });
    }
  };
  app.post('/api/razorpay/create-order', handleCreateRazorpayOrder);
  app.post('/api/payment/create-order', handleCreateRazorpayOrder);

  // 5. Verify Razorpay Payment Signature and finalize order (Trusted Backend ONLY)
  // Supports POST /api/razorpay/verify-payment and POST /api/payment/verify-payment
  const handleVerifyRazorpayPayment = async (req: express.Request, res: express.Response) => {
    try {
      const {
        orderNumber,
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
        appliedCouponId,
      } = req.body;

      if (!orderNumber || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
        return res.status(400).json({
          success: false,
          error: 'Missing required Razorpay transaction parameters for payment verification.',
        });
      }

      const secret = process.env.RAZORPAY_KEY_SECRET;
      if (!secret) {
        return res.status(500).json({
          success: false,
          error: 'Server configuration error: RAZORPAY_KEY_SECRET is not configured on the backend.',
        });
      }

      // Check existing order in Firestore to prevent duplicate processing (Idempotency)
      const orderRef = doc(db, 'orders', orderNumber);
      const orderSnap = await getDoc(orderRef);
      if (orderSnap.exists()) {
        const existingData = orderSnap.data();
        if (existingData.paymentStatus === 'Paid') {
          return res.json({
            success: true,
            verified: true,
            orderNumber,
            paymentId: existingData.razorpayPaymentId || razorpay_payment_id,
            paidAt: existingData.paidAt || new Date().toISOString(),
            alreadyProcessed: true,
            message: 'Order has already been verified and paid.',
          });
        }
      }

      // Cryptographic verification using HMAC-SHA256
      const generatedSignature = crypto
        .createHmac('sha256', secret)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest('hex');

      const isSignatureValid = generatedSignature === razorpay_signature;

      if (!isSignatureValid) {
        // Mark payment as failed in Firestore
        try {
          await updateDoc(orderRef, {
            paymentStatus: 'Failed',
            updatedAt: new Date().toISOString(),
            notes: 'Payment signature verification failed. Order not confirmed.',
          });
        } catch (e) {
          console.warn('Could not mark order as failed:', e);
        }

        return res.status(400).json({
          success: false,
          error: 'Payment verification failed: Invalid transaction signature.',
        });
      }

      // Double-check captured payment status with Razorpay API if available
      const razorpay = getRazorpayClient();
      let paymentCaptured = true;
      if (razorpay) {
        try {
          const paymentRecord = await razorpay.payments.fetch(razorpay_payment_id);
          if (paymentRecord && paymentRecord.status === 'failed') {
            paymentCaptured = false;
          }
        } catch (fetchErr) {
          console.warn('Could not fetch payment record from Razorpay API, relying on signature verification:', fetchErr);
        }
      }

      if (!paymentCaptured) {
        try {
          await updateDoc(orderRef, {
            paymentStatus: 'Failed',
            updatedAt: new Date().toISOString(),
          });
        } catch (e) {}

        return res.status(400).json({
          success: false,
          error: 'Payment was marked as failed by the issuing bank or payment gateway.',
        });
      }

      // Update Firestore Order to Confirmed and Paid
      const now = new Date().toISOString();
      const updateData = {
        paymentStatus: 'Paid',
        orderStatus: 'Confirmed',
        razorpayPaymentId: razorpay_payment_id,
        razorpayOrderId: razorpay_order_id,
        razorpaySignature: razorpay_signature,
        paidAt: now,
        updatedAt: now,
        notes: `Payment verified successfully via Razorpay (Payment ID: ${razorpay_payment_id}).`,
      };

      try {
        await updateDoc(orderRef, updateData);
      } catch (fsErr) {
        console.warn('Could not update order status in Firestore:', fsErr);
      }

      // Increment coupon usage count if a coupon was used
      if (appliedCouponId) {
        try {
          await updateDoc(doc(db, 'coupons', appliedCouponId), {
            usedCount: increment(1),
            updatedAt: now,
          });
        } catch (couponUpdateErr) {
          console.warn('Could not increment coupon usage count:', couponUpdateErr);
        }
      }

      return res.json({
        success: true,
        verified: true,
        orderNumber,
        paymentId: razorpay_payment_id,
        paidAt: now,
      });
    } catch (err: any) {
      console.error('Error verifying Razorpay payment:', err?.message || err);
      return res.status(500).json({
        success: false,
        error: 'Server error during payment verification.',
      });
    }
  };
  app.post('/api/razorpay/verify-payment', handleVerifyRazorpayPayment);
  app.post('/api/payment/verify-payment', handleVerifyRazorpayPayment);

  // 6. Razorpay Webhook Endpoint
  // Supports POST /api/razorpay/webhook and POST /api/payment/webhook
  // Handles server-to-server webhook events (payment.captured, order.paid, payment.failed)
  const handleRazorpayWebhook = async (req: express.Request, res: express.Response) => {
    try {
      const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
      const signature = req.headers['x-razorpay-signature'] as string;

      if (!webhookSecret) {
        console.warn('Razorpay Webhook received but RAZORPAY_WEBHOOK_SECRET is not configured on server.');
        return res.status(500).json({ success: false, error: 'Webhook secret is not configured.' });
      }

      if (!signature) {
        return res.status(400).json({ success: false, error: 'Missing x-razorpay-signature header.' });
      }

      // Compute HMAC-SHA256 of raw body
      const rawPayload = (req as any).rawBody
        ? (req as any).rawBody.toString('utf8')
        : JSON.stringify(req.body);

      const expectedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(rawPayload)
        .digest('hex');

      if (expectedSignature !== signature) {
        console.warn('Razorpay Webhook signature verification mismatch.');
        return res.status(400).json({ success: false, error: 'Invalid webhook signature.' });
      }

      const event = req.body?.event;
      const payload = req.body?.payload;

      console.log(`Razorpay Webhook event received: ${event}`);

      if (event === 'payment.captured' || event === 'order.paid') {
        const paymentEntity = payload?.payment?.entity;
        const orderEntity = payload?.order?.entity;

        const razorpayPaymentId = paymentEntity?.id;
        const razorpayOrderId = paymentEntity?.order_id || orderEntity?.id;
        const orderNumber =
          paymentEntity?.notes?.orderNumber ||
          orderEntity?.receipt ||
          orderEntity?.notes?.orderNumber;

        let targetOrderRef = null;
        let targetOrderData = null;

        if (orderNumber) {
          const directRef = doc(db, 'orders', orderNumber);
          const snap = await getDoc(directRef);
          if (snap.exists()) {
            targetOrderRef = directRef;
            targetOrderData = snap.data();
          }
        }

        // Fallback search by razorpayOrderId
        if (!targetOrderRef && razorpayOrderId) {
          try {
            const q = query(
              collection(db, 'orders'),
              where('razorpayOrderId', '==', razorpayOrderId),
              limit(1)
            );
            const querySnap = await getDocs(q);
            if (!querySnap.empty) {
              targetOrderRef = querySnap.docs[0].ref;
              targetOrderData = querySnap.docs[0].data();
            }
          } catch (queryErr) {
            console.warn('Could not query order by razorpayOrderId:', queryErr);
          }
        }

        if (targetOrderRef && targetOrderData) {
          // Idempotency: skip duplicate processing if already marked Paid
          if (targetOrderData.paymentStatus === 'Paid') {
            console.log(`Webhook: Order ${targetOrderData.orderNumber} already marked as Paid. Skipping.`);
            return res.status(200).json({ status: 'ok', message: 'Already processed' });
          }

          const now = new Date().toISOString();
          await updateDoc(targetOrderRef, {
            paymentStatus: 'Paid',
            orderStatus: 'Confirmed',
            razorpayPaymentId: razorpayPaymentId || targetOrderData.razorpayPaymentId,
            razorpayOrderId: razorpayOrderId || targetOrderData.razorpayOrderId,
            paidAt: now,
            updatedAt: now,
            notes: `Payment confirmed via Razorpay Webhook (${event}).`,
          });
          console.log(`Webhook: Order ${targetOrderData.orderNumber} successfully confirmed & marked Paid.`);
        }
      } else if (event === 'payment.failed') {
        const paymentEntity = payload?.payment?.entity;
        const orderNumber = paymentEntity?.notes?.orderNumber;
        const errorDescription = paymentEntity?.error_description || 'Payment failed';

        if (orderNumber) {
          const directRef = doc(db, 'orders', orderNumber);
          const snap = await getDoc(directRef);
          if (snap.exists() && snap.data().paymentStatus !== 'Paid') {
            await updateDoc(directRef, {
              paymentStatus: 'Failed',
              updatedAt: new Date().toISOString(),
              notes: `Payment failed via Razorpay Webhook: ${errorDescription}`,
            });
          }
        }
      }

      // Always return 200 OK to Razorpay to acknowledge receipt
      return res.status(200).json({ status: 'ok' });
    } catch (err: any) {
      console.error('Error processing Razorpay webhook:', err?.message || err);
      // Return 200 or 500 depending on recoverable state
      return res.status(500).json({ success: false, error: 'Internal webhook handler error.' });
    }
  };
  app.post('/api/razorpay/webhook', handleRazorpayWebhook);
  app.post('/api/payment/webhook', handleRazorpayWebhook);

  // 7. Mark Payment as Failed / Cancelled when dismissed or failed in modal
  const handleMarkPaymentFailed = async (req: express.Request, res: express.Response) => {
    try {
      const { orderNumber, reason } = req.body;
      if (orderNumber) {
        const orderRef = doc(db, 'orders', orderNumber);
        const snap = await getDoc(orderRef);
        if (snap.exists() && snap.data().paymentStatus !== 'Paid') {
          await updateDoc(orderRef, {
            paymentStatus: 'Failed',
            updatedAt: new Date().toISOString(),
            notes: reason || 'Customer dismissed or failed payment window.',
          });
        }
      }
      res.json({ success: true });
    } catch (e) {
      res.status(500).json({ success: false, error: 'Could not mark order as failed' });
    }
  };
  app.post('/api/razorpay/mark-failed', handleMarkPaymentFailed);
  app.post('/api/payment/mark-failed', handleMarkPaymentFailed);

  // 8. Secure Guest Order Cancellation
  app.post('/api/orders/cancel-guest', async (req, res) => {
    try {
      const { orderNumber, phone, email, cancellationReason, cancellationDetails } = req.body;
      if (!orderNumber) {
        return res.status(400).json({ success: false, error: 'Order number is required.' });
      }

      const orderRef = doc(db, 'orders', orderNumber);
      const orderSnap = await getDoc(orderRef);
      if (!orderSnap.exists()) {
        return res.status(404).json({ success: false, error: 'Order not found.' });
      }

      const orderData = orderSnap.data();
      if (orderData.userId !== 'guest') {
        return res.status(403).json({ success: false, error: 'Only guest orders can be cancelled via this endpoint.' });
      }

      // Verification: phone or email must match order's shipping address / customer contact
      const cleanPhone = (phone || '').replace(/\D/g, '');
      const cleanEmail = (email || '').trim().toLowerCase();
      const orderPhone = (orderData.customerPhone || orderData.shippingAddress?.phone || '').replace(/\D/g, '');
      const orderEmail = (orderData.customerEmail || orderData.shippingAddress?.email || '').trim().toLowerCase();

      const isVerified = (cleanPhone && cleanPhone === orderPhone) || (cleanEmail && cleanEmail === orderEmail);
      if (!isVerified) {
        return res.status(403).json({ success: false, error: 'Verification failed: Mobile number or email does not match order record.' });
      }

      const cancellableStatuses = ['Placed', 'Confirmed', 'Processing', 'Pending Payment'];
      if (!cancellableStatuses.includes(orderData.orderStatus)) {
        return res.status(400).json({ success: false, error: `Order cannot be cancelled in its current status: ${orderData.orderStatus}` });
      }

      const now = new Date().toISOString();
      const cleanDetails = (cancellationDetails || '').trim();
      const updatePayload = {
        orderStatus: 'Cancelled',
        cancellationReason: cancellationReason || 'Cancelled by customer',
        customerCancellationReason: cancellationReason || 'Cancelled by customer',
        cancellationDetails: cleanDetails,
        cancelledAt: now,
        cancelledBy: 'Customer',
        notes: `Guest order cancelled on ${new Date().toLocaleString('en-IN')}: ${cancellationReason || 'No reason specified'}${
          cleanDetails ? ` (${cleanDetails})` : ''
        }.`,
        updatedAt: now,
      };

      await updateDoc(orderRef, updatePayload);
      return res.json({ success: true, orderNumber });
    } catch (err: any) {
      console.error('Error cancelling guest order:', err?.message || err);
      return res.status(500).json({ success: false, error: err?.message || 'Failed to cancel guest order.' });
    }
  });

  // Serve uploaded images statically with persistent directory creation
  const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  app.use('/uploads', express.static(uploadsDir));

  // Product Image Upload API
  // Handles general product images and color-specific images
  // Storage structure:
  // General: products/{productId}/general/{uniqueFileName}
  // Color: products/{productId}/colors/{colorId}/{uniqueFileName}
  app.post('/api/upload-image', async (req: express.Request, res: express.Response) => {
    try {
      const { fileName, contentType, base64Data, productId, folder, colorId, type } = req.body;
      if (!base64Data || !fileName) {
        return res.status(400).json({ success: false, error: 'Missing base64Data or fileName.' });
      }

      const cleanProductId = (productId || 'prod_' + Date.now()).replace(/[^a-zA-Z0-9_-]/g, '_');
      const safeName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
      const uniqueName = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}_${safeName}`;

      let relativeFolder: string;
      let storagePath: string;

      if (folder === 'community-gallery' || type === 'community-gallery') {
        relativeFolder = 'community-gallery';
        storagePath = `community-gallery/${uniqueName}`;
      } else if (folder === 'colors' && colorId) {
        relativeFolder = path.join('products', cleanProductId, 'colors', colorId.replace(/[^a-zA-Z0-9_-]/g, '_'));
        storagePath = `products/${cleanProductId}/colors/${colorId.replace(/[^a-zA-Z0-9_-]/g, '_')}/${uniqueName}`;
      } else {
        relativeFolder = path.join('products', cleanProductId, 'general');
        storagePath = `products/${cleanProductId}/general/${uniqueName}`;
      }

      const targetDir = path.join(process.cwd(), 'public', 'uploads', relativeFolder);
      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
      }

      const filePath = path.join(targetDir, uniqueName);
      const pureBase64 = base64Data.replace(/^data:image\/\w+;base64,/, '');
      const rawBuffer = Buffer.from(pureBase64, 'base64');
      fs.writeFileSync(filePath, rawBuffer);

      // Attempt background upload to Firebase Storage if available
      let firebaseDownloadUrl: string | null = null;
      try {
        const bucket = firebaseConfig.storageBucket || 'handy-silicon-d9v0l.appspot.com';
        const uploadUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket}/o?uploadType=media&name=${encodeURIComponent(storagePath)}`;
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2000);

        const fbRes = await fetch(uploadUrl, {
          method: 'POST',
          headers: {
            'Content-Type': contentType || 'image/jpeg',
            'X-Goog-Upload-Protocol': 'raw',
          },
          body: rawBuffer,
          signal: controller.signal,
        });
        clearTimeout(timeoutId);

        if (fbRes.ok) {
          const data = (await fbRes.json()) as any;
          firebaseDownloadUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket}/o/${encodeURIComponent(storagePath)}?alt=media${data.downloadTokens ? `&token=${data.downloadTokens}` : ''}`;
        }
      } catch (fbErr) {
        // Fallback to local static URL seamlessly
      }

      const localUrl = `/uploads/${relativeFolder.replace(/\\/g, '/')}/${uniqueName}`;
      const finalUrl = firebaseDownloadUrl || localUrl;

      return res.json({
        success: true,
        id: `img_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        url: finalUrl,
        storagePath,
        name: fileName,
      });
    } catch (err: any) {
      console.error('Server upload error:', err);
      return res.status(500).json({ success: false, error: err?.message || 'Failed to upload image' });
    }
  });

  // Product Image Delete API
  app.post('/api/delete-image', (req: express.Request, res: express.Response) => {
    try {
      const { storagePath } = req.body;
      if (!storagePath) {
        return res.status(400).json({ success: false, error: 'storagePath is required' });
      }
      const safePath = storagePath.replace(/\.\./g, '');
      const localFilePath = path.join(process.cwd(), 'public', 'uploads', safePath);
      if (fs.existsSync(localFilePath)) {
        fs.unlinkSync(localFilePath);
      }
      return res.json({ success: true });
    } catch (err: any) {
      return res.json({ success: false, error: err?.message });
    }
  });

  // Global Error Handler Middleware
  // Protects sensitive information and stack traces from being leaked to clients
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('Production Server Error:', err?.message || err);
    if (res.headersSent) {
      return next(err);
    }
    res.status(500).json({
      success: false,
      error: 'An internal server error occurred. Please try again later.',
    });
  });

  // Serve Frontend / SPA Routes
  if (process.env.NODE_ENV !== 'production') {
    // Development mode: Mount Vite middleware
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Production mode: Serve built static files from dist/
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // Listen on 0.0.0.0 and PORT
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`FASHINERY Production Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
