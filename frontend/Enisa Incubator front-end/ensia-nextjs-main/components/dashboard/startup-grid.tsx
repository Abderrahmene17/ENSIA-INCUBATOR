import StartupCard from "@/components/dashboard/startup-card"

// Mock data - in a real app, this would come from your API
const startups = [
  {
    id: 1,
    name: "EcoTech Solutions",
    cohort: "2023A",
    founders: 4,
    lastActive: "11/15/2023",
    funding: "$250,000",
    status: "Active" as const,
  },
  {
    id: 2,
    name: "MediConnect",
    cohort: "2023A",
    founders: 3,
    lastActive: "11/20/2023",
    funding: "$180,000",
    status: "Active" as const,
  },
  {
    id: 3,
    name: "LearnSmart",
    cohort: "2023B",
    founders: 2,
    lastActive: "11/18/2023",
    funding: "$120,000",
    status: "On Track" as const,
  },
  {
    id: 4,
    name: "UrbanFarm",
    cohort: "2023A",
    founders: 5,
    lastActive: "11/10/2023",
    funding: "$300,000",
    status: "Needs Help" as const,
  },
  {
    id: 5,
    name: "FinSecure",
    cohort: "2023B",
    founders: 3,
    lastActive: "11/12/2023",
    funding: "$210,000",
    status: "Active" as const,
  },
]

export default function StartupGrid() {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {startups.map((startup) => (
        <StartupCard
          key={startup.id}
          name={startup.name}
          cohort={startup.cohort}
          founders={startup.founders}
          lastActive={startup.lastActive}
          funding={startup.funding}
          status={startup.status}
        />
      ))}
    </div>
  )
}
