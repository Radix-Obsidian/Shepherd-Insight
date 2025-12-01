/**
 * Lemon Squeezy Checkout API Route
 * 
 * Creates a checkout URL for Pro subscription or Lifetime purchase.
 * Based on: https://docs.lemonsqueezy.com/guides/tutorials/nextjs-saas-billing
 */

import { NextRequest, NextResponse } from 'next/server'
import { createCheckoutURL, LEMONSQUEEZY_PRODUCTS } from '@/lib/lemonsqueezy'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, userEmail, tier, embed = true } = body

    if (!userId || !userEmail) {
      return NextResponse.json(
        { error: 'Missing userId or userEmail' },
        { status: 400 }
      )
    }

    // Get variant ID based on tier
    const product = tier === 'lifetime' 
      ? LEMONSQUEEZY_PRODUCTS.lifetime 
      : LEMONSQUEEZY_PRODUCTS.pro

    if (!product.variantId) {
      return NextResponse.json(
        { error: `Lemon Squeezy variant ID not configured for ${tier}. Set LEMONSQUEEZY_PRO_VARIANT_ID or LEMONSQUEEZY_LIFETIME_VARIANT_ID in env.` },
        { status: 500 }
      )
    }

    // Create checkout URL
    const checkoutUrl = await createCheckoutURL({
      userId,
      userEmail,
      variantId: product.variantId,
      embed,
    })

    if (!checkoutUrl) {
      return NextResponse.json(
        { error: 'Failed to create checkout URL' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      url: checkoutUrl,
    })
  } catch (error) {
    console.error('Checkout error:', error)
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}
