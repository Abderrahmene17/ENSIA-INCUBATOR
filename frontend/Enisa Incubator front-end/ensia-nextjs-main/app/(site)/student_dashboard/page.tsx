"use client"

import type React from "react"

import { useState } from "react"
import { FiUser, FiUsers, FiUpload, FiFileText, FiMapPin, FiClock, FiInfo, FiCheckCircle, FiX } from "react-icons/fi"
import { useEvents } from "@/hooks/useEvent"
import { useMentors } from "@/hooks/useMentors"
import { useResourceRequests } from "@/hooks/useResources"
import { useStages } from "@/hooks/useStages"
import { useDeliverables } from "@/hooks/useDeliverables"
import { useStartup } from "@/hooks/useStartups"
import { useUser } from "@/hooks/useUsers"

interface Event {
  id: number
  title: string
  description: string
  start_time: string
  end_time: string
  location: string
  user: number
}

interface Mentor {
  id: number
  full_name: string
  email: string
  role_name: string
}

const StudentProfile = () => {
  const [activeTab, setActiveTab] = useState<"overview" | "project" | "requestMentor" | "requestResources">("overview")
  const userId = 1 // This would normally come from authentication context

  // Form states for mentor and resources requests
  const [mentorRequest, setMentorRequest] = useState({
    project: "",
    problemDescription: "",
    mentorSkills: "",
    availability: "",
  })

  const [resourceRequest, setResourceRequest] = useState({
    resourcesNeeded: "",
    quantity: "",
    purpose: "",
  })

  // Fetch data using hooks
  const { user, loading: userLoading } = useUser(userId)
  const { startup, teamMembers, loading: startupLoading } = useStartup(1) // Assuming startup ID 1 for demo
  const { stages, loading: stagesLoading } = useStages()
  const { deliverables, loading: deliverablesLoading } = useDeliverables()
  const { mentors, loading: mentorsLoading } = useMentors()
  const { events, loading: eventsLoading } = useEvents()
  const { createRequest } = useResourceRequests()

  // Stats for the overview page
  const stats = {
    totalWorkshops: events?.length || 0,
    deliverablesMade: deliverables?.filter((d) => d.status === "submitted").length || 0,
    missedDeliverables:
      deliverables?.filter((d) => d.status === "pending" && new Date(d.due_date) < new Date()).length || 0,
  }

  const handleMentorRequestChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setMentorRequest((prev) => ({ ...prev, [name]: value }))
  }

  const handleResourceRequestChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setResourceRequest((prev) => ({ ...prev, [name]: value }))
  }

  const handleUploadDeliverable = (stageId: number) => {
    // In a real app, this would open a file picker and upload to Google Drive
    const googleDriveUrl = "https://drive.google.com/drive/folders/14hvg1Nndegbw0vqM7S9iO87i8qJVn3ow?usp=drive_link"
    window.open(googleDriveUrl, "_blank")
  }

  const handleSubmitMentorRequest = async () => {
    // This would be implemented to call the appropriate API endpoint
    alert("Mentor request submitted successfully!")
    setMentorRequest({
      project: "",
      problemDescription: "",
      mentorSkills: "",
      availability: "",
    })
  }

  const handleSubmitResourceRequest = async () => {
    try {
      // This would call the API to create a resource request
      await createRequest({
        quantity_requested: Number.parseInt(resourceRequest.quantity) || 1,
        resource: 1, // Assuming resource ID 1 for demo
        startup: 1, // Assuming startup ID 1 for demo
      })
      alert("Resource request submitted successfully!")
      setResourceRequest({
        resourcesNeeded: "",
        quantity: "",
        purpose: "",
      })
    } catch (error) {
      console.error("Error submitting resource request:", error)
      alert("Failed to submit resource request. Please try again.")
    }
  }

  // Get the next upcoming event/workshop
  const nextWorkshop =
    events && events.length > 0
      ? events.sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())[0]
      : null

  // Get a random mentor for demo purposes
  const mentor = mentors && mentors.length > 0 ? mentors[0] : null

  // Loading state
  const isLoading =
    userLoading || startupLoading || stagesLoading || deliverablesLoading || mentorsLoading || eventsLoading

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Removed the duplicate top navigation bar */}

      <section className="pb-16 pt-8 md:pb-20 md:pt-12 lg:pb-24 lg:pt-16 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="w-full space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">Student Dashboard</h1>
                <p className="text-gray-600 dark:text-gray-300">Welcome back, {user?.full_name || "Student"}</p>
              </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200 dark:border-gray-700">
              <nav className="-mb-px flex space-x-8 overflow-x-auto">
                <button
                  onClick={() => setActiveTab("overview")}
                  className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === "overview" ? "border-primary text-primary dark:text-primary-400" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"}`}
                >
                  Overview
                </button>

                <button
                  onClick={() => setActiveTab("project")}
                  className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === "project" ? "border-primary text-primary dark:text-primary-400" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"}`}
                >
                  Project
                </button>

                <button
                  onClick={() => setActiveTab("requestMentor")}
                  className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === "requestMentor" ? "border-primary text-primary dark:text-primary-400" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"}`}
                >
                  Request Mentor
                </button>

                <button
                  onClick={() => setActiveTab("requestResources")}
                  className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === "requestResources" ? "border-primary text-primary dark:text-primary-400" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"}`}
                >
                  Request Resources
                </button>
              </nav>
            </div>

            {/* Tab Content */}
            <div className="pt-4">
              {/* Overview Tab */}
              {activeTab === "overview" && (
                <div className="space-y-8">
                  {/* Stats Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 flex items-center">
                      <div className="rounded-full bg-green-100 dark:bg-green-900/30 p-3 mr-4">
                        <FiCheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Workshops</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalWorkshops}</p>
                      </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 flex items-center">
                      <div className="rounded-full bg-amber-100 dark:bg-amber-900/30 p-3 mr-4">
                        <FiFileText className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Deliverables Made</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.deliverablesMade}</p>
                      </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 flex items-center">
                      <div className="rounded-full bg-red-100 dark:bg-red-900/30 p-3 mr-4">
                        <FiX className="h-6 w-6 text-red-600 dark:text-red-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Missed Deliverables</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.missedDeliverables}</p>
                      </div>
                    </div>
                  </div>

                  {/* Team and Mentor Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Team Card */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                        <FiUsers className="mr-2" /> My Team
                      </h3>
                      <div className="space-y-4">
                        {teamMembers && teamMembers.length > 0 ? (
                          teamMembers.map((member) => (
                            <div key={member.id} className="flex items-center">
                              <div className="flex-shrink-0">
                                <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center">
                                  {member.user_details?.full_name?.charAt(0) || "U"}
                                </div>
                              </div>
                              <div className="ml-3">
                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                  {member.user_details?.full_name || "Team Member"}
                                </p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{member.role_in_team}</p>
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-gray-500 dark:text-gray-400">No team members found.</p>
                        )}
                      </div>
                    </div>

                    {/* Mentor Card */}
                    <div className="bg-primary text-white rounded-lg shadow-sm p-6">
                      <h3 className="text-lg font-semibold mb-4">My Mentor</h3>
                      {mentor ? (
                        <>
                          <p className="text-xl font-bold mb-2">{mentor.full_name}</p>
                          <p className="mb-4">A seasoned entrepreneur with expertise in scaling tech startups.</p>
                          <p className="text-sm">
                            Email:{" "}
                            <a href={`mailto:${mentor.email}`} className="underline">
                              {mentor.email}
                            </a>
                          </p>
                        </>
                      ) : (
                        <p>No mentor assigned yet. Request one using the "Request Mentor" tab.</p>
                      )}
                    </div>
                  </div>

                  {/* Next Workshop Card */}
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Next Workshop</h3>

                    {nextWorkshop ? (
                      <div className="space-y-4">
                        <div className="flex items-start gap-3">
                          <FiMapPin className="flex-shrink-0 mt-1 text-gray-500 dark:text-gray-400" />
                          <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Location</p>
                            <p className="text-gray-900 dark:text-white">{nextWorkshop.location}</p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3">
                          <FiClock className="flex-shrink-0 mt-1 text-gray-500 dark:text-gray-400" />
                          <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Time</p>
                            <p className="text-gray-900 dark:text-white">
                              {new Date(nextWorkshop.start_time).toLocaleDateString("en-US", {
                                month: "long",
                                day: "numeric",
                              })}
                              ,{" "}
                              {new Date(nextWorkshop.start_time).toLocaleTimeString("en-US", {
                                hour: "numeric",
                                minute: "numeric",
                              })}{" "}
                              -{" "}
                              {new Date(nextWorkshop.end_time).toLocaleTimeString("en-US", {
                                hour: "numeric",
                                minute: "numeric",
                              })}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3">
                          <FiUser className="flex-shrink-0 mt-1 text-gray-500 dark:text-gray-400" />
                          <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Trainer</p>
                            <p className="text-gray-900 dark:text-white">Dr. Leila Rahmouni</p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3">
                          <FiInfo className="flex-shrink-0 mt-1 text-gray-500 dark:text-gray-400" />
                          <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Content</p>
                            <p className="text-gray-900 dark:text-white">{nextWorkshop.description}</p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <p className="text-gray-500 dark:text-gray-400">No upcoming workshops scheduled.</p>
                    )}
                  </div>
                </div>
              )}

              {/* Project Tab */}
              {activeTab === "project" && (
                <div className="space-y-6">
                  {/* Project Details */}
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                          {startup?.name || "Project Name"}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          Team Leader • Started{" "}
                          {startup
                            ? new Date(startup.created_at).toLocaleDateString("en-US", {
                                month: "long",
                                day: "numeric",
                                year: "numeric",
                              })
                            : ""}
                        </p>
                      </div>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                        {startup?.status || "Active"}
                      </span>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 mb-6">
                      {startup?.description || "Project description"}
                    </p>
                  </div>

                  {/* Project Stages */}
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Project Stages</h3>

                    <div className="space-y-8">
                      {stages && stages.length > 0 ? (
                        stages.map((stage) => {
                          const stageDeliverables = deliverables?.filter((d) => d.stage === stage.id) || []

                          return (
                            <div key={stage.id} className="border-l-4 border-primary pl-4 py-2">
                              <h4 className="font-medium text-lg text-gray-900 dark:text-white mb-2">
                                Stage {stage.sequence_order}: {stage.name}
                              </h4>
                              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                                Duration: {stage.duration_months} {stage.duration_months === 1 ? "month" : "months"}
                              </p>

                              {/* Deliverables for this stage */}
                              {stageDeliverables.length > 0 ? (
                                <div className="space-y-4 mb-4">
                                  <h5 className="font-medium text-gray-800 dark:text-gray-200">Deliverables:</h5>
                                  {stageDeliverables.map((deliverable) => (
                                    <div key={deliverable.id} className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-md">
                                      <div className="flex justify-between items-start">
                                        <div>
                                          <h6 className="font-medium text-gray-900 dark:text-white">
                                            {deliverable.title}
                                          </h6>
                                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                            Due:{" "}
                                            {new Date(deliverable.due_date).toLocaleDateString("en-US", {
                                              year: "numeric",
                                              month: "long",
                                              day: "numeric",
                                            })}
                                          </p>
                                          <p className="text-sm text-gray-700 dark:text-gray-300 mt-2">
                                            {deliverable.description}
                                          </p>
                                        </div>
                                        <span
                                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                            deliverable.status === "submitted"
                                              ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                                              : deliverable.status === "reviewed"
                                                ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                                                : "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"
                                          }`}
                                        >
                                          {deliverable.status.charAt(0).toUpperCase() + deliverable.status.slice(1)}
                                        </span>
                                      </div>

                                      {/* Upload button */}
                                      <div className="mt-4 flex justify-end">
                                        <button
                                          onClick={() => handleUploadDeliverable(stage.id)}
                                          className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                                        >
                                          <FiUpload className="mr-2" /> Upload Deliverable
                                        </button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                                  No deliverables for this stage yet.
                                </div>
                              )}

                              {/* Upload button for new deliverables */}
                              <button
                                onClick={() => handleUploadDeliverable(stage.id)}
                                className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
                              >
                                <FiUpload className="mr-2" /> Upload New Deliverable
                              </button>
                            </div>
                          )
                        })
                      ) : (
                        <p className="text-gray-500 dark:text-gray-400">No stages defined for this project.</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Request Mentor Tab */}
              {activeTab === "requestMentor" && (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Request a Mentor</h3>
                  <form
                    className="space-y-6"
                    onSubmit={(e) => {
                      e.preventDefault()
                      handleSubmitMentorRequest()
                    }}
                  >
                    <div>
                      <label
                        htmlFor="project"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                      >
                        Project Name
                      </label>
                      <input
                        type="text"
                        id="project"
                        name="project"
                        value={mentorRequest.project}
                        onChange={handleMentorRequestChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        placeholder="Enter your project name"
                        required
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="problemDescription"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                      >
                        Problem Description
                      </label>
                      <textarea
                        id="problemDescription"
                        name="problemDescription"
                        rows={4}
                        value={mentorRequest.problemDescription}
                        onChange={handleMentorRequestChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        placeholder="Describe the problem or area where you need guidance..."
                        required
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="mentorSkills"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                      >
                        Desired Mentor Skills/Expertise
                      </label>
                      <input
                        type="text"
                        id="mentorSkills"
                        name="mentorSkills"
                        value={mentorRequest.mentorSkills}
                        onChange={handleMentorRequestChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        placeholder="e.g., Machine Learning, Business Development, UI/UX Design"
                        required
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="availability"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                      >
                        Your Availability
                      </label>
                      <input
                        type="text"
                        id="availability"
                        name="availability"
                        value={mentorRequest.availability}
                        onChange={handleMentorRequestChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        placeholder="e.g., Weekdays after 3pm, Flexible weekends"
                        required
                      />
                    </div>

                    <div className="flex justify-end">
                      <button
                        type="submit"
                        className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                      >
                        Submit Request
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Request Resources Tab */}
              {activeTab === "requestResources" && (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Request Resources</h3>
                  <form
                    className="space-y-6"
                    onSubmit={(e) => {
                      e.preventDefault()
                      handleSubmitResourceRequest()
                    }}
                  >
                    <div>
                      <label
                        htmlFor="resourcesNeeded"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                      >
                        Resources Needed
                      </label>
                      <input
                        type="text"
                        id="resourcesNeeded"
                        name="resourcesNeeded"
                        value={resourceRequest.resourcesNeeded}
                        onChange={handleResourceRequestChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        placeholder="e.g., 3D printer, Laptop, Arduino kit"
                        required
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="quantity"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                      >
                        Quantity
                      </label>
                      <input
                        type="text"
                        id="quantity"
                        name="quantity"
                        value={resourceRequest.quantity}
                        onChange={handleResourceRequestChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        placeholder="e.g., 2 units, 5 packs"
                        required
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="purpose"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                      >
                        Purpose
                      </label>
                      <textarea
                        id="purpose"
                        name="purpose"
                        rows={3}
                        value={resourceRequest.purpose}
                        onChange={handleResourceRequestChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        placeholder="Describe what you need these resources for..."
                        required
                      />
                    </div>

                    <div className="flex justify-end">
                      <button
                        type="submit"
                        className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                      >
                        Submit Request
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default StudentProfile
