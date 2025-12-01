/**
 * Lemon Squeezy Integration for ShepLight
 * 
 * Based on official docs: https://docs.lemonsqueezy.com/guides/tutorials/nextjs-saas-billing
 * 
 * Environment Variables Required:
 * - LEMONSQUEEZY_API_KEY: Your Lemon Squeezy API key
 * - LEMONSQUEEZY_STORE_ID: Your store ID
 * - LEMONSQUEEZY_WEBHOOK_SECRET: Webhook signing secret
 * - NEXT_PUBLIC_APP_URL: Your app URL for redirects
 */

import {
  lemonSqueezySetup,
  createCheckout,
  getSubscription,
  cancelSubscription as lsCancelSubscription,
  updateSubscription,
} from '@lemonsqueezy/lemonsqueezy.js'

// Configure Lemon Squeezy API
export function configureLemonSqueezy() {
  const apiKey = process.env.LEMONSQUEEZY_API_KEY
  if (!apiKey) {
    throw new Error('LEMONSQUEEZY_API_KEY is not configured')
  }
  
  lemonSqueezySetup({
    apiKey,
    onError: (error) => {
      console.error('Lemon Squeezy Error:', error)
    },
  })
}

// Product configuration - set these in Lemon Squeezy Dashboard
export const LEMONSQUEEZY_PRODUCTS = {
  pro: {
    name: 'ShepLight Pro',
    price: 29,
    interval: 'month',
    // Set this after creating product in Lemon Squeezy
    variantId: process.env.LEMONSQUEEZY_PRO_VARIANT_ID || '',
  },
  lifetime: {
    name: 'ShepLight Lifetime',
    price: 249,
    interval: 'once',
    variantId: process.env.LEMONSQUEEZY_LIFETIME_VARIANT_ID || '',
  },
}

export interface CheckoutParams {
  userId: string
  userEmail: string
  variantId: string
  embed?: boolean
}

/**
 * Create a checkout URL for a product variant
 * Based on: https://docs.lemonsqueezy.com/guides/tutorials/nextjs-saas-billing
 */
export async function createCheckoutURL({
  userId,
  userEmail,
  variantId,
  embed = true,
}: CheckoutParams): Promise<string | null> {
  configureLemonSqueezy()

  const storeId = process.env.LEMONSQUEEZY_STORE_ID
  if (!storeId) {
    throw new Error('LEMONSQUEEZY_STORE_ID is not configured')
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  const checkout = await createCheckout(storeId, variantId, {
    checkoutOptions: {
      embed,
      media: false,
      logo: !embed,
    },
    checkoutData: {
      email: userEmail,
      custom: {
        user_id: userId,
      },
    },
    productOptions: {
      redirectUrl: `${appUrl}/account?upgrade=success`,
      receiptButtonText: 'Go to Dashboard',
      receiptThankYouNote: 'Thank you for upgrading to ShepLight Pro! 🐑',
    },
  })

  return checkout.data?.data.attributes.url ?? null
}

/**
 * Get subscription details
 */
export async function getSubscriptionDetails(subscriptionId: string) {
  configureLemonSqueezy()
  
  try {
    const subscription = await getSubscription(subscriptionId)
    return subscription.data?.data ?? null
  } catch {
    return null
  }
}

/**
 * Cancel a subscription
 */
export async function cancelSubscription(subscriptionId: string) {
  configureLemonSqueezy()
  
  const result = await lsCancelSubscription(subscriptionId)
  return result.data?.data ?? null
}

/**
 * Pause a subscription
 */
export async function pauseSubscription(subscriptionId: string) {
  configureLemonSqueezy()
  
  const result = await updateSubscription(subscriptionId, {
    pause: {
      mode: 'void',
    },
  })
  return result.data?.data ?? null
}

/**
 * Resume a paused subscription
 */
export async function resumeSubscription(subscriptionId: string) {
  configureLemonSqueezy()
  
  const result = await updateSubscription(subscriptionId, {
    pause: null,
  })
  return result.data?.data ?? null
}

/**
 * Get customer portal URL
 * Note: Lemon Squeezy provides a customer portal via subscription.urls.customer_portal
 */
export async function getCustomerPortalURL(subscriptionId: string): Promise<string | null> {
  configureLemonSqueezy()
  
  try {
    const subscription = await getSubscription(subscriptionId)
    return subscription.data?.data.attributes.urls.customer_portal ?? null
  } catch {
    return null
  }
}
