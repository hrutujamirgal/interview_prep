const fullMockInterviewInstructions = {
    introduction: "Welcome to the Full Mock Interview! This session consists of three components: MCQ, Coding, and Interview. Follow the instructions carefully for the best experience.",
    
    generalGuidelines: [
      "Each section must be completed in the order specified: MCQ > Coding > Interview.",
      "To proceed to the next section, you must score at least 75% in the current section.",
      "Ensure you are in a quiet environment with minimal distractions.",
      "The platform uses AI monitoring tools, so stay focused and follow the rules.",
    ],
  
    components: [
      {
        title: "MCQ Section",
        instructions: [
          "You will be presented with multiple-choice questions based on the topics you selected during setup.",
          "Each question will have four options, and only one will be correct.",
          "You have a fixed amount of time to complete the MCQ section.",
          "To proceed to the Coding section, you must score at least 75%. Your results will be displayed immediately after completing the section.",
        ],
      },
      {
        title: "Coding Section",
        precondition: "You must score 75% or above in the MCQ section to access this section.",
        instructions: [
          "You will solve programming challenges designed to test your coding skills and problem-solving abilities.",
          "Use the built-in code editor to write your solutions. You can choose from multiple programming languages.",
          "Each problem will have a set of requirements and constraints that must be met.",
          "You can run test cases to validate your solutions before submission.",
          "Your solutions will be evaluated on correctness, efficiency, and code readability.",
          "You need to score at least 75% in this section to proceed to the Interview section.",
        ],
      },
      {
        title: "Interview Section",
        precondition: "You must score 75% or above in the Coding section to access this section.",
        instructions: [
          "This section consists of video-recorded interview questions.",
          "The questions will be a mix of behavioral, situational, and technical queries.",
          "Record your response for each question using the 'Start Video' and 'Stop Video' buttons.",
          "Provide detailed answers, explaining your reasoning and thought process clearly.",
          "Once you have submitted your response for a question, you cannot go back to modify it.",
        ],
      },
    ],
  
    progressTracking: {
      title: "Progress Tracking",
      details: [
        "Your progress will be tracked across all sections.",
        "You can view your performance and detailed feedback in the dashboard after completing the session.",
        "Use this feedback to identify your strengths and areas for improvement.",
      ],
    },
  
    conclusion: "Best of luck with your mock interview! Remember, consistent practice is the key to success.",
  };
  
  export default fullMockInterviewInstructions;
  