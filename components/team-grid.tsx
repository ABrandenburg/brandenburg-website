import { getAllTeamMembers } from '@/lib/team-data'
import { TeamMemberCard } from '@/components/team-member-card'

export function TeamGrid() {
  const teamMembers = getAllTeamMembers()
  
  return (
    <section className="py-16 md:py-24 lg:py-32 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12 md:gap-y-16">
          {teamMembers.map((member) => (
            <TeamMemberCard key={member.slug} member={member} />
          ))}
        </div>
      </div>
    </section>
  )
}
