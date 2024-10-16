import hr from "./hr.jpg";
import mcq from "./mcq.jpg";
import coding from "./coding.jpg";
import report from "./report.jpg";
import interview from "./interview.jpg";


const feature = [
    {
      title: "Subjective MCQ",
      img: mcq,
      description:
        "The set of multiple-choice questions (MCQs) focused on subjective topics relevant to the user's field of study or job role. Users can practice answering questions that require critical thinking and in-depth knowledge.",
    },
    {
      title: "Coding Test",
      img: coding,
      description:
        "A dedicated area for users to improve their coding skills with hands-on programming challenges. Users can select problems based on difficulty levels and programming languages. The feature includes a code editor, testing environment, and instant feedback on code correctness. Users can also view solutions and explanations after attempting the problems.",
    },
    {
      title: "FeedBack Report",
      img: report,
      description:
        "fter completing practice sessions or mock interviews, users receive a comprehensive feedback report. This report highlights strengths and areas for improvement, offering insights into performance metrics such as time taken, accuracy, and confidence level. Users can track their progress over time, allowing them to identify trends and focus on specific areas that need enhancement.",
    },
    {
      title: "HR Round Practice",
      img: hr,
      description:
        " A typical HR interview round, where users can practice common HR interview questions. It includes scenarios related to teamwork, conflict resolution, and career goals. Users can record their answers and receive feedback on their responses, body language, and communication skills. This helps in preparing for real-life HR interactions.",
    },
    {
      title: "Full Mock Interview ",
      img:interview,
      description:
        " The Full Mock Interview feature is designed to provide users with a comprehensive and realistic interview experience. This feature integrates multiple formats of questioning, allowing users to simulate an actual interview environment and practice various aspects of the interview process.",
    },
  ];



const titles = feature.map((item) => item.title);

export { feature, titles }; 
