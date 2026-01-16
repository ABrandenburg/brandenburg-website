import { getAllGuarantees } from '@/lib/guarantees-data'
import { GuaranteeCard } from '@/components/guarantee-card'

export function GuaranteesGrid() {
  const guarantees = getAllGuarantees()

  return (
    <section className="bg-[#D4DEE4] py-16 md:py-24 lg:py-32">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-gray-200">
          {guarantees.map((guarantee) => (
            <GuaranteeCard key={guarantee.id} guarantee={guarantee} />
          ))}
        </div>
      </div>
    </section>
  )
}
