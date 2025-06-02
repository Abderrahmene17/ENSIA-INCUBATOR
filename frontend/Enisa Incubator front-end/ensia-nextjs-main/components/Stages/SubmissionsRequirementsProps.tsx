type SubmissionRequirementsProps = {
  submission: string
  driveLink?: string
}

const SubmissionRequirements = ({ submission, driveLink }: SubmissionRequirementsProps) => (
  <div className="rounded-xl bg-gray-50 dark:bg-[#1d1d1d] p-6 shadow-sm border-l-4 border-primary space-y-5 hover:scale-[1.005]">
    <div className="flex items-center gap-3">
      <div className="bg-primary rounded-full" />
      <h2 className="text-xl font-semibold text-primary dark:text-white">Submission Requirements</h2>
    </div>
    <div className="prose dark:prose-invert max-w-none text-gray-700 dark:text-gray-300">{submission}</div>

    <div className="pt-4">
      {driveLink ? (
        <a
          href={driveLink}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block px-5 py-2 bg-primary text-white rounded-md text-sm font-medium hover:bg-primary/90 transition"
        >
          Submit Work on Google Drive
        </a>
      ) : (
        <button
          disabled
          className="px-5 py-2 bg-muted text-muted-foreground cursor-not-allowed rounded-md text-sm font-medium"
        >
          Submission link not available yet
        </button>
      )}
    </div>
  </div>
)

export default SubmissionRequirements
