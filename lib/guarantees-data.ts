// Guarantee data for the Our Guarantees page

export interface Guarantee {
  id: string
  title: string
  description: string
  additionalNote?: string
  icon: 'satisfaction' | 'lifetime' | 'showup' | 'pricematch'
}

export const guarantees: Guarantee[] = [
  {
    id: 'satisfaction',
    title: 'You are 100% happy, or you don\'t pay.',
    description: 'After we\'ve completed the work for the agreed upon price, if you aren\'t totally happy, we will continue working for free until you are. Otherwise, you don\'t pay. It\'s simple: we will only be happy with the work when you are.',
    icon: 'satisfaction',
  },
  {
    id: 'lifetime',
    title: 'Lifetime labor guarantee',
    description: 'If any defects with our workmanship ever (yes, ever) directly lead to future repairs or installations to resolve the defects, Brandenburg Plumbing will either provide a fix for free or refund the total cost of the service, whichever you prefer.',
    additionalNote: 'In short, we do it right or you don\'t pay.\n\n(We can only provide stated equipment and materials warranties as we don\'t totally control their quality.)',
    icon: 'lifetime',
  },
  {
    id: 'showup',
    title: 'We answer the phone, we show up.',
    description: 'We will answer the phone 24/7/365, and we will always show up within our given arrival window.',
    additionalNote: 'If we don\'t, just give us a call, and we will give you $200 off your next appointment no questions asked.',
    icon: 'showup',
  },
  {
    id: 'pricematch',
    title: 'We will beat any matching bid.',
    description: 'If another licensed plumbing company gives a bid for the same service, we will match their price. All you have to do is show us their bid, and if they are providing the same services with the same equipment and materials, we will match it.',
    additionalNote: 'Rest easy knowing that you will never have to pay more for the same thing.',
    icon: 'pricematch',
  },
]

export function getAllGuarantees(): Guarantee[] {
  return guarantees
}
