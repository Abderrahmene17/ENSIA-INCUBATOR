'use client'

import React from 'react';

interface MentorCardProps {
  mentor: {
    name: string;
    description: string;
    email: string; // Mentor's email
  };
  userEmail: string; // User's email from the DB or props
}

const MentorCard: React.FC<MentorCardProps> = ({ mentor, userEmail }) => {
  return (
    <div className="bg-blue-400 max-h-65 text-white p-6 rounded-lg w-full">
      {/* Title */}
      <h2 className="text-3xl font-bold mb-4">My Mentor</h2>

      {/* Mentor Name */}
      <h3 className="text-2xl font-semibold mb-4">{mentor.name}</h3>

      {/* Mentor Description */}
      <p className="text-lg mb-6">{mentor.description}</p>

      {/* Email Display */}
      <div className="text-center">
        <p className="text-lg text-white">
          Email: <a href={`mailto:${mentor.email}`} className="underline">{mentor.email}</a>
        </p>
      </div>

      {/* Commented out button part */}
      {/* <div className="text-center">
        <button
          onClick={handleScheduleMeeting}
          className="bg-green-400 text-white py-2 px-4 rounded-lg hover:bg-green-500 transition duration-200 ease-in-out"
        >
          Schedule Meeting
        </button>
      </div> */}
    </div>
  );
};

export default MentorCard;