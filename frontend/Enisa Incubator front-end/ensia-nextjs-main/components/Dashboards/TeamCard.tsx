import { LucideUserPlus2, User2Icon, UserPlus2, Users, Users2Icon, UserSearch, UsersRoundIcon } from 'lucide-react'; // A more modern icon for the title

interface TeamMember {
  name: string;
  role: string;
}

interface TeamCardProps {
  teamName: string;
  members: TeamMember[];
}

const TeamCard = ({ teamName, members }: TeamCardProps) => {
  return (
    <div className="bg-gradient-to-r w-120 from-blue-50 to-blue-100 p-6 rounded-lg shadow-sm border border-gray-300">
      <div className="flex items-center mb-4">
        {/* Updated icon */}
        <Users className="h-8 w-8 text-blue-600 mr-4" />
        <h2 className="text-2xl font-semibold text-blue-600">{teamName}</h2>
      </div>

      <div className="space-y-4">
        {members.map((member, index) => (
          <div key={index} className="flex items-center gap-4 hover:bg-blue-50 p-2 rounded-md transition-all">
            <div className="h-10 w-10 rounded-full bg-blue-500 text-white flex items-center justify-center mr-4">
              {member.name[0]} {/* Display first letter of member's name */}
            </div>
            <div>
              <h3 className="font-semibold text-lg text-gray-800">{member.name}</h3>
              <p className="text-sm text-gray-500">{member.role}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TeamCard;