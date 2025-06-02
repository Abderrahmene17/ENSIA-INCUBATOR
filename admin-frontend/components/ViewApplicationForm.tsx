"use client"
import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { useToast } from "@/components/ui/use-toast"

interface ApplicationData {
  id: number
  project_id: string
  team_leader_name: string
  team_leader_year: string
  team_leader_email: string
  team_leader_phone: string
  team_members: string
  project_title: string
  project_domain: string
  is_ai_project: boolean
  project_summary: string
  dev_stage: string
  demo_link: string
  project_video: string
  key_milestones: string
  current_challenges: string
  problem_statement: string
  target_audience: string
  expected_impact: string
  additional_motivation: string
  supporting_documents: string
  status: string
  created_at: string
  updated_at: string
}

interface ScoreData {
  problem_understanding: number
  solution_fit: number
  technical_soundness: number
}

const ViewApplicationForm = () => {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState<ApplicationData | null>(null)
  const [scores, setScores] = useState<ScoreData>({
    problem_understanding: 0,
    solution_fit: 0,
    technical_soundness: 0,
  })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const fetchApplicationData = async () => {
      if (!params.id) return

      try {
        setLoading(true)
        const response = await fetch(`http://localhost:8000/incubation-form/${params.id}/`, {
          headers: {
            "Content-Type": "application/json",
          },
        })

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data = await response.json()
        setFormData(data)

        // Try to get scores from localStorage
        const savedScores = localStorage.getItem(`form_scores_${params.id}`)
        if (savedScores) {
          try {
            const parsedScores = JSON.parse(savedScores)
            setScores({
              problem_understanding: parsedScores.problem_understanding || 0,
              solution_fit: parsedScores.solution_fit || 0,
              technical_soundness: parsedScores.technical_soundness || 0,
            })
          } catch (e) {
            console.error("Error parsing saved scores:", e)
          }
        }
      } catch (error) {
        console.error("Error fetching application data:", error)
        toast({
          title: "Error",
          description: "Failed to load application data",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchApplicationData()
  }, [params.id, toast])

  const handleScoreChange = (criterion: keyof ScoreData, value: number[]) => {
    setScores((prev) => ({
      ...prev,
      [criterion]: value[0],
    }))
  }

  const handleSubmitScores = async () => {
    if (!formData) return

    try {
      setSubmitting(true)

      // Save scores to localStorage
      localStorage.setItem(`form_scores_${formData.id}`, JSON.stringify(scores))

      toast({
        title: "Success",
        description: "Scores saved successfully",
      })

      // Navigate back to applications list
      router.push("/admin/applications")
    } catch (error) {
      console.error("Error saving scores:", error)
      toast({
        title: "Error",
        description: "Failed to save scores",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const getTotalScore = () => {
    return scores.problem_understanding + scores.solution_fit + scores.technical_soundness
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!formData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h2 className="text-2xl font-bold mb-4">Application Not Found</h2>
        <Button onClick={() => router.push("/admin/applications")}>Back to Applications</Button>
      </div>
    )
  }

  return (
    <section className="min-h-screen bg-white px-6 py-12 dark:bg-blacksection">
      <div className="mx-auto max-w-4xl rounded-2xl border border-stroke bg-white p-10 shadow-lg dark:border-strokedark dark:bg-blackho">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-semibold text-black dark:text-white">Application Review</h2>
          <Button variant="outline" onClick={() => router.push("/admin/applications")}>
            Back to Applications
          </Button>
        </div>

        <div className="space-y-8">
          {/* Application Details */}
          <div className="space-y-6">
            <h3 className="text-xl font-semibold border-b pb-2">Project Information</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Project ID</p>
                <p className="text-base font-medium">{formData.project_id}</p>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Project Title</p>
                <p className="text-base font-medium">{formData.project_title}</p>
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Project Summary</p>
              <p className="text-base whitespace-pre-line">{formData.project_summary}</p>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Problem Statement</p>
              <p className="text-base whitespace-pre-line">{formData.problem_statement}</p>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Expected Impact</p>
              <p className="text-base whitespace-pre-line">{formData.expected_impact}</p>
            </div>

            {formData.demo_link && (
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Demo Link</p>
                <a
                  href={formData.demo_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  {formData.demo_link}
                </a>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <h3 className="text-xl font-semibold border-b pb-2">Team Information</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Team Leader</p>
                <p className="text-base font-medium">{formData.team_leader_name}</p>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Email</p>
                <p className="text-base">{formData.team_leader_email}</p>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Phone</p>
                <p className="text-base">{formData.team_leader_phone}</p>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Year of Study</p>
                <p className="text-base">{formData.team_leader_year}</p>
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Team Members</p>
              <p className="text-base whitespace-pre-line">{formData.team_members}</p>
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-xl font-semibold border-b pb-2">Project Details</h3>

            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Key Milestones</p>
              <p className="text-base whitespace-pre-line">{formData.key_milestones}</p>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Current Challenges</p>
              <p className="text-base whitespace-pre-line">{formData.current_challenges}</p>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Target Audience</p>
              <p className="text-base whitespace-pre-line">{formData.target_audience}</p>
            </div>
          </div>

          {/* Scoring Section */}
          <Card>
            <CardHeader>
              <CardTitle>Evaluation Criteria</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium">Problem Understanding (0-8 points)</label>
                  <span className="font-bold text-lg">{scores.problem_understanding}</span>
                </div>
                <Slider
                  value={[scores.problem_understanding]}
                  max={8}
                  step={1}
                  onValueChange={(value) => handleScoreChange("problem_understanding", value)}
                />
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium">Solution Fit (0-6 points)</label>
                  <span className="font-bold text-lg">{scores.solution_fit}</span>
                </div>
                <Slider
                  value={[scores.solution_fit]}
                  max={6}
                  step={1}
                  onValueChange={(value) => handleScoreChange("solution_fit", value)}
                />
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium">Technical Soundness (0-6 points)</label>
                  <span className="font-bold text-lg">{scores.technical_soundness}</span>
                </div>
                <Slider
                  value={[scores.technical_soundness]}
                  max={6}
                  step={1}
                  onValueChange={(value) => handleScoreChange("technical_soundness", value)}
                />
              </div>

              <div className="pt-4 border-t">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Total Score:</span>
                  <span className="font-bold text-xl">{getTotalScore()} / 20</span>
                </div>
              </div>

              <Button className="w-full mt-4" onClick={handleSubmitScores} disabled={submitting}>
                {submitting ? "Submitting..." : "Submit Evaluation"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}

export default ViewApplicationForm
