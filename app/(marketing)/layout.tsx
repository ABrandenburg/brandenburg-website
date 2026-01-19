
import { SkipLink } from '@/components/skip-link'
import { BackToTop } from '@/components/back-to-top'
import { MobilePhoneCTA } from '@/components/mobile-phone-cta'
import { DNILoader } from '@/components/dni-loader'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'

export default function MarketingLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <>
            <SkipLink />
            <Header />
            <div id="main-content">
                {children}
            </div>
            <Footer />
            <BackToTop />
            <MobilePhoneCTA />
            <DNILoader />
        </>
    )
}
