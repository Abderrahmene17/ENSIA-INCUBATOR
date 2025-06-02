"use client";
import SidebarLink from "@/components/Docs/SidebarLink";
import Header from "@/components/Header";
import { useEffect } from "react";
import { Metadata } from "next";

// The metadata needs to be in a separate file for server components
// since we're using "use client" directive here

export default function DocsPage() {
  // Add any client-side logic you need here

  return (
    <>
      <Header />
      
      <section className="pb-16 pt-24 md:pb-20 md:pt-28 lg:pb-24 lg:pt-32">
        <div className="container mx-auto">
          <div className="-mx-4 flex flex-wrap">
            
            {/* Sidebar could go here if needed */}
            
            <div className="w-full px-4 lg:w-3/4">
              <div className="blog-details blog-details-docs shadow-three dark:bg-gray-dark rounded-xs bg-white px-8 py-11 sm:p-[55px] lg:mb-5 lg:px-8 xl:p-[55px]">
                <h1>Student Incubation Process</h1>

                <h2 className="text-2xl font-semibold mt-6">1️⃣ Application Submission</h2>
                <p>Startups must submit their application, which includes:</p>
                <ul className="list-disc pl-6">
                  <li>Problem statement</li>
                  <li>MVP (if available)</li>
                  <li>Team details & roles</li>
                  <li>Current status & expected outcomes</li>
                </ul>
                <p>Once submitted, your application will be reviewed, and you will be notified about the next steps.</p>

                <h2 className="text-2xl font-semibold mt-6">2️⃣ Preselection & Evaluation</h2>
                <p>Your application will be evaluated based on:</p>
                <ul className="list-disc pl-6">
                  <li>Innovation, feasibility, and impact of the idea.</li>
                  <li>Clarity and completeness of the application.</li>
                </ul>
                <p>If successful, you'll be selected for the incubation program and given access to your dashboard.</p>

                <h2 className="text-2xl font-semibold mt-6">3️⃣ Dashboard Access</h2>
                <p>Once accepted into the program, you'll have access to a dedicated dashboard, where you can:</p>
                <ul className="list-disc pl-6">
                  <li>Track your milestones and deliverables.</li>
                  <li>Submit progress reports and receive feedback.</li>
                  <li>Access resources and schedules for upcoming events and workshops.</li>
                </ul>

                <h2 className="text-2xl font-semibold mt-6">4️⃣ Progress Tracking</h2>
                <p>Your progress will be tracked based on set milestones, including:</p>
                <ul className="list-disc pl-6">
                  <li>Business model creation</li>
                  <li>Prototype development</li>
                  <li>Market research and customer validation</li>
                </ul>
                <p>These milestones will be visible on your dashboard, allowing you to stay on track and receive feedback from mentors.</p>

                <h2 className="text-2xl font-semibold mt-6">5️⃣ Workshops & Mentorship</h2>
                <p>You will have the opportunity to attend:</p>
                <ul className="list-disc pl-6">
                  <li>Workshops on business development, pitching, and technical skills.</li>
                  <li>Mentorship sessions with experienced industry professionals to guide your startup's growth.</li>
                </ul>

                <h2 className="text-2xl font-semibold mt-6">6️⃣ Final Pitch Day</h2>
                <p>At the end of the program, you'll be required to present your startup to a panel. This is your chance to showcase your progress and plan for the future:</p>
                <ul className="list-disc pl-6">
                  <li>Present your business plan and progress made.</li>
                  <li>Receive feedback and recommendations from the jury.</li>
                  <li>Successful startups will be recognized and may receive further support.</li>
                </ul>

                <h2 className="text-2xl font-semibold mt-6">7️⃣ Graduation & Beyond</h2>
                <p>Upon successful completion of the program, you will graduate with:</p>
                <ul className="list-disc pl-6">
                  <li>Recognition and certification.</li>
                  <li>Access to further funding and networking opportunities.</li>
                  <li>Opportunities for partnerships and collaborations to scale your startup.</li>
                </ul>
                <p>Graduates will be eligible to continue receiving mentorship and additional resources for a set period, depending on their progress and needs.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}