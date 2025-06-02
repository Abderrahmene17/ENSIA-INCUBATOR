type StageOverviewProps = {
  description: string
}

const StageOverview = ({ description }: StageOverviewProps) => (
  <div className="rounded-xl bg-gray-50 dark:bg-[#1d1d1d] p-6 shadow-sm border-l-4 border-primary space-y-4 transition-transform hover:scale-[1.005]">
    <div className="flex items-center gap-3">
      <div className="bg-primary rounded-full" />
      <h2 className="text-xl font-semibold text-primary dark:text-white">Stage Overview</h2>
    </div>
    <div className="prose dark:prose-invert max-w-none text-gray-700 dark:text-gray-300">{description}</div>
  </div>
)

export default StageOverview
