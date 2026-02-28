import Image from 'next/image'
import { TeamMember } from '@/lib/team-data'

interface TeamMemberCardProps {
  member: TeamMember
}

export function TeamMemberCard({ member }: TeamMemberCardProps) {
  return (
    <article className="group">
      {/* Portrait Image */}
      <div className="relative aspect-[4/5] mb-4 overflow-hidden rounded-lg">
        {member.photo ? (
          <Image
            src={member.photo}
            alt={`${member.name} - ${member.position}`}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover object-top transition-transform duration-500 ease-smooth group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 bg-brand-secondary flex items-center justify-center">
            <span className="text-4xl font-serif text-white/80">
              {member.name.split(' ').map(n => n[0]).join('')}
            </span>
          </div>
        )}
      </div>
      
      {/* Name */}
      <h3 className="text-xl font-serif text-text-primary mb-1">
        {member.name}
      </h3>
      
      {/* Position */}
      <p className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-3">
        {member.position}
      </p>
      
      {/* Bio */}
      {member.bio && (
        <p className="text-sm text-text-muted leading-relaxed">
          {member.bio}
        </p>
      )}
    </article>
  )
}
