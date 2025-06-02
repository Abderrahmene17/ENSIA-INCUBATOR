import image1 from "@/public/images/user/user-01.png";
import image2 from "@/public/images/user/user-02.png";
import { Testimonial } from "@/types/testimonial";

export const testimonialData: Testimonial[] = [
  {
    id: 1,
    name: "Sarah Johnson",
    designation: "Founder @TechVentures",
    image: image1,
    content:
      "The incubator platform has been incredibly helpful in guiding us through the early stages of our startup. The mentorship and resources have accelerated our progress significantly.",
  },
  {
    id: 2,
    name: "Ahmed Ali",
    designation: "Founder @FinDev Solutions",
    image: image2,
    content:
      "With the seamless access to coaches and trainers, our team has been able to sharpen our skills and refine our business model. The structured feedback has been a game changer.",
  },
  {
    id: 3,
    name: "Maria Gonzalez",
    designation: "Founder @HealthInnovate",
    image: image1,
    content:
      "Being able to track our progress through the platform’s milestone system has kept us focused. We can clearly see our achievements and know exactly where we need to improve.",
  },
  {
    id: 4,
    name: "David Lee",
    designation: "Founder @GreenTech",
    image: image2,
    content:
      "The resources provided by the incubator have been indispensable. From access to funding to strategic advice, we feel supported in every aspect of our growth journey.",
  },
];
