import PDFViewer from './PDFViewer';

const SomeComponent = () => {
  // Example of what data might look like
  const userId = "user123"; // Your user ID from your state or props
  const selectedTopic = "JavaScript Basics";
  const score = 80;
  const questions = [
    {
      question: "What is JavaScript?",
      options: ["Language", "Library", "Framework", "None of the above"],
      answer: "Language",
      selected_option: "Language"
    },
    // Add more questions here
  ];

  return (
    <div>
      <h1>MCQ Test Report</h1>
      <PDFViewer 
        userId={userId} 
        selectedTopic={selectedTopic} 
        score={score} 
        questions={questions} 
      />
    </div>
  );
};

export default SomeComponent;
