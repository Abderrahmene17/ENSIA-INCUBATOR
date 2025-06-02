import { CalendarDays, MapPin, User2, BookOpen } from "lucide-react";

interface WorkshopDetails {
  location: string;
  time: string;
  trainer: string;
  content: string;
}

interface Props {
  workshop: WorkshopDetails;
}

const WorkshopCard = ({ workshop }: Props) => {
  return (
    <div className="bg-white min-h-100 shadow-xl rounded-2xl p-6 space-y-5 border border-gray-200">
      <h2 className="text-xl font-semibold text-blue-700 mb-2">Next Workshop</h2>

      <div className="flex items-start gap-3">
        <MapPin className="text-blue-500 mt-1" />
        <div>
          <p className="text-sm text-gray-500">Location</p>
          <p className="text-base text-gray-800 font-medium">{workshop.location}</p>
        </div>
      </div>

      <div className="flex items-start gap-3">
        <CalendarDays className="text-green-500 mt-1" />
        <div>
          <p className="text-sm text-gray-500">Time</p>
          <p className="text-base text-gray-800 font-medium">{workshop.time}</p>
        </div>
      </div>

      <div className="flex items-start gap-3">
        <User2 className="text-purple-500 mt-1" />
        <div>
          <p className="text-sm text-gray-500">Trainer</p>
          <p className="text-base text-gray-800 font-medium">{workshop.trainer}</p>
        </div>
      </div>

      <div className="flex items-start gap-3">
        <BookOpen className="text-orange-500 mt-1" />
        <div>
          <p className="text-sm text-gray-500">Content</p>
          <p className="text-base text-gray-800 font-medium">{workshop.content}</p>
        </div>
      </div>
    </div>
  );
};

export default WorkshopCard;