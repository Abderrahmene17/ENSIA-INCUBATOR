import ProgressCard from "@/components/Dashboards/ProgressCard";
import WorkshopCard from "@/components/Dashboards/WorkshopCard";
import MentorCard from "@/components/Dashboards/MentorCard";
import Stage from "@/components/Dashboards/Stage";
import WorkshopStats from "@/components/Dashboards/WorkshopStats";
import TeamCard from "@/components/Dashboards/TeamCard";

const teamMembers = [
  { name: "Alice Johnson", role: "Team Lead" },
  { name: "Bob Smith", role: "Developer" },
  { name: "Charlie Brown", role: "Designer" },
  { name: "David Williams", role: "Tester" }
];

const stages: Stage[] = [
  { name: "Business Model Development", status: "done", description: "Finalizing the business concept" },
  { name: "Prototyping", status: "done", description: "Creating and testing initial prototypes" },
  { name: "Validation", status: "done", description: "Testing the product with potential users" },
  { name: "Execution", status: "current", description: "Developing the product" },
  { name: "Testing", status: "current", description: "Evaluating product performance and quality" }
];


const currentWorkshop = {
  location: "Room 204, ENSIA Building",
  time: "April 25, 10:00 AM - 12:00 PM",
  trainer: "Dr. Leila Rahmouni",
  content: "This workshop covers startup pitching essentials and how to effectively communicate value propositions."
};

const currentMentor = {
  name: "John Doe",
  description: "A seasoned entrepreneur with expertise in scaling tech startups.",
  email: "john.Doe@gmail.com"
};


const Page = () => {
  return (
    <div className="pt-28 px-0 pb-10 my-12 mx-10"> {/* No background color here */}
      <div className="bg-gray-100 md:px-12 max-w-7xl gap-x-18 mx-auto flex min-h-screen flex-col md:flex-row gap-8">
        {/* Left: Next Workshop */}
        <div className="flex flex-col w-130 gap-8 mx-10 my-8">
          <TeamCard teamName="My Team" members={teamMembers} />
          <ProgressCard percentage={60} stages={stages} ideaName="My Startup Idea" />
        </div>

        {/* Right: Startup Teams + Previous Workshops */}
        <div className="flex flex-col w-125 gap-8 gap-y-9b my-8">
          <WorkshopCard workshop={currentWorkshop} />
          <div className="flex flex-col gap-y-7 h-full">
            <MentorCard mentor={currentMentor}  userEmail="akram.miloudi@ensia.edu.dz" />
            <WorkshopStats workshop={currentWorkshop} />
            </div>
        </div>
      </div>
    </div>
  );
};

export default Page;