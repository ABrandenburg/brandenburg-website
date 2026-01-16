"use client"

export function openScheduler() {
    if (typeof window !== 'undefined' && window._scheduler) {
        window._scheduler.show({ schedulerId: 'sched_iznsrydnu074jzax2stfqht5' });
    } else {
        // Fallback if scheduler isn't loaded yet? 
        // Usually it loads in layout, but we could log or alert if critical.
        console.warn('ServiceTitan scheduler not loaded');
        // Optionally default to the contact page
        window.location.href = '/contact';
    }
}
