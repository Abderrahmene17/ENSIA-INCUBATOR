"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

const SubmitProjectForm = () => {
  const [formData, setFormData] = useState({
    timestamp: "",
    projectID: "",
    teamLeaderName: "",
    teamLeaderYear: "",
    teamLeaderEmail: "",
    teamLeaderPhone: "",
    teamMembers: "",
    projectTitle: "",
    projectDomain: "",
    isAIProject: "",
    projectSummary: "",
    devStage: "",
    demoLink: "",
    projectVideo: "",
    keyMilestones: "",
    currentChallenges: "",
    problemStatement: "",
    targetAudience: "",
    expectedImpact: "",
    additionalMotivation: "",
    supportingDocuments: "",
    confirmation: false,
  });

  const [showToast, setShowToast] = useState(false);
  const router = useRouter();

  const submit = async () => {
    try {
      // Transform field names to match backend
      const backendData = {
        project_id: formData.projectID,
        team_leader_name: formData.teamLeaderName,
        team_leader_email: formData.teamLeaderEmail,
        team_leader_phone: formData.teamLeaderPhone,
        team_members: formData.teamMembers,
        project_title: formData.projectTitle,
        project_summary: formData.projectSummary,
        demo_link: formData.demoLink,
        key_milestones: formData.keyMilestones,
        current_challenges: formData.currentChallenges,
        problem_statement: formData.problemStatement,
        target_audience: formData.targetAudience,
        expected_impact: formData.expectedImpact,
        confirmation: formData.confirmation,
        timestamp: new Date().toISOString()
      };
      const token = localStorage.getItem("access_token");  // or sessionStorage

      const response = await fetch("http://localhost:8000/incubation-form/my-submissions/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        
        body: JSON.stringify(backendData),
      });
      
  
      if (response.ok) {
        setShowToast(true);
        setTimeout(() => router.push("/"), 2300);
      } else {
        const errorData = await response.json();
        console.log("Token used for auth:", token);

        console.error("Submission error:", errorData);
        alert(`Submission failed: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error("Network error:", error);
      alert("Network error - please try again");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submit();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, confirmation: e.target.checked });
  };

  return (
    <section className="min-h-screen bg-white px-6 py-24 dark:bg-blacksection">
      <div className="mx-auto max-w-4xl rounded-2xl border border-stroke bg-white p-10 shadow-lg dark:border-strokedark dark:bg-blackho">
        <h2 className="mb-10 text-3xl font-semibold text-black dark:text-white text-center">
          ➕ Submit Your Startup Project
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-white">
              Project ID
            </label>
            <input
              required
              type="text"
              name="projectID"
              placeholder="Unique Project ID"
              value={formData.projectID}
              onChange={handleChange}
              className="w-full rounded-lg border border-stroke px-5 py-3 dark:border-strokedark dark:bg-blackho dark:text-white"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-white">
              Team Leader: Full Name
            </label>
            <input
              required
              type="text"
              name="teamLeaderName"
              placeholder="Team Leader Full Name"
              value={formData.teamLeaderName}
              onChange={handleChange}
              className="w-full rounded-lg border border-stroke px-5 py-3 dark:border-strokedark dark:bg-blackho dark:text-white"
            />
          </div>

          <div className="flex flex-col gap-6 md:flex-row">
            <div className="w-full">
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-white">
                Team Leader: Year of Study
              </label>
              <input
                required
                type="text"
                name="teamLeaderYear"
                placeholder="Year of Study"
                value={formData.teamLeaderYear}
                onChange={handleChange}
                className="w-full rounded-lg border border-stroke px-5 py-3 dark:border-strokedark dark:bg-blackho dark:text-white"
              />
            </div>
            <div className="w-full">
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-white">
                Team Leader: Email Address
              </label>
              <input
                required
                type="email"
                name="teamLeaderEmail"
                placeholder="Email Address"
                value={formData.teamLeaderEmail}
                onChange={handleChange}
                className="w-full rounded-lg border border-stroke px-5 py-3 dark:border-strokedark dark:bg-blackho dark:text-white"
              />
            </div>
          </div>

          <div className="flex flex-col gap-6 md:flex-row">
            <div className="w-full">
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-white">
                Team Leader: Phone Number
              </label>
              <input
                required
                type="tel"
                name="teamLeaderPhone"
                placeholder="Phone Number"
                value={formData.teamLeaderPhone}
                onChange={handleChange}
                className="w-full rounded-lg border border-stroke px-5 py-3 dark:border-strokedark dark:bg-blackho dark:text-white"
              />
            </div>
            <div className="w-full">
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-white">
                Team Members (if applicable)
              </label>
              <textarea
                required
                rows={4}
                name="teamMembers"
                placeholder="List each member's name and year of study"
                value={formData.teamMembers}
                onChange={handleChange}
                className="w-full rounded-lg border border-stroke px-5 py-3 dark:border-strokedark dark:bg-blackho dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-white">
              Project Title
            </label>
            <input
              required
              type="text"
              name="projectTitle"
              placeholder="Project Title"
              value={formData.projectTitle}
              onChange={handleChange}
              className="w-full rounded-lg border border-stroke px-5 py-3 dark:border-strokedark dark:bg-blackho dark:text-white"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-white">
              Project Summary
            </label>
            <textarea
              required
              rows={4}
              name="projectSummary"
              placeholder="Project Summary (100-150 words)"
              value={formData.projectSummary}
              onChange={handleChange}
              className="w-full rounded-lg border border-stroke px-5 py-3 dark:border-strokedark dark:bg-blackho dark:text-white"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-white">
              Demo/Working Application Link
            </label>
            <input
              
              type="url"
              name="demoLink"
              placeholder="Demo/Working Application Link"
              value={formData.demoLink}
              onChange={handleChange}
              className="w-full rounded-lg border border-stroke px-5 py-3 dark:border-strokedark dark:bg-blackho dark:text-white"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-white">
              Key Milestones Achieved
            </label>
            <textarea
              required
              rows={4}
              name="keyMilestones"
              placeholder="Briefly list major accomplishments"
              value={formData.keyMilestones}
              onChange={handleChange}
              className="w-full rounded-lg border border-stroke px-5 py-3 dark:border-strokedark dark:bg-blackho dark:text-white"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-white">
              Current Challenges
            </label>
            <textarea
              required
              rows={4}
              name="currentChallenges"
              placeholder="List the challenges you're encountering"
              value={formData.currentChallenges}
              onChange={handleChange}
              className="w-full rounded-lg border border-stroke px-5 py-3 dark:border-strokedark dark:bg-blackho dark:text-white"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-white">
              Problem Statement
            </label>
            <textarea
              required
              rows={4}
              name="problemStatement"
              placeholder="Define the problem your project aims to solve"
              value={formData.problemStatement}
              onChange={handleChange}
              className="w-full rounded-lg border border-stroke px-5 py-3 dark:border-strokedark dark:bg-blackho dark:text-white"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-white">
              Expected Impact
            </label>
            <textarea
              required
              rows={4}
              name="expectedImpact"
              placeholder="Describe how your solution will benefit the target audience"
              value={formData.expectedImpact}
              onChange={handleChange}
              className="w-full rounded-lg border border-stroke px-5 py-3 dark:border-strokedark dark:bg-blackho dark:text-white"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-white">
              Supporting Documents
            </label>
            <input
              
              type="file"
              name="supportingDocuments"
              className="w-full rounded-lg border border-stroke px-5 py-3 dark:border-strokedark dark:bg-blackho dark:text-white"
            />
          </div>

          <div className="flex items-center gap-3">
            <input
              required
              type="checkbox"
              name="confirmation"
              checked={formData.confirmation}
              onChange={handleCheckboxChange}
              className="w-5 h-5"
            />
            <label className="text-sm text-gray-700 dark:text-white">
              I confirm that the provided information is accurate and complete.
            </label>
          </div>

          <button
            type="submit"
            className="w-full rounded-lg bg-primary py-3 text-white transition hover:bg-opacity-90 cursor-pointer"
            disabled={!formData.confirmation}
          >
            ✅ Submit Project
          </button>
          </form>
        <br />
        {showToast && (
          <div className="mb-6 rounded-md bg-green-100 px-4 py-3 text-sm text-green-800 dark:bg-green-900 dark:text-green-200">
            ✅ Project submitted successfully! Redirecting...
          </div>
        )}
      </div>
    </section>
  );
};

export default SubmitProjectForm;
