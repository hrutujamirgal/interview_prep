/* eslint-disable react/prop-types */
import { useState, useEffect } from 'react';
import axios from 'axios';

const PDFViewer = ({ userId, selectedTopic, score, questions }) => {
  const [pdfUrl, setPdfUrl] = useState(null);

  useEffect(() => {
    // Prepare the data to send to the backend
    const data = {
      userId: userId,
      selectedTopic: selectedTopic,
      score: score,
      questions: questions, // Assuming it's in the same format as expected by backend
    };

    // Function to fetch the PDF from the backend
    const fetchPDF = async () => {
      try {
        const response = await axios.post('http://127.0.0.1:5000/get_mcq_report', data, {
          responseType: 'arraybuffer', // Make sure to get the raw binary data
        });
        
        // Create a Blob from the response data
        const blob = new Blob([response.data], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);

        // Set the PDF URL to display in iframe
        setPdfUrl(url);
      } catch (error) {
        console.error('Error fetching the PDF:', error);
      }
    };

    fetchPDF();
  }, [userId, selectedTopic, score, questions]);

  return (
    <div className="pdf-container">
      {pdfUrl ? (
        <iframe
          src={pdfUrl}
          width="100%"
          height="800px"
          style={{ border: 'none' }}
          title="MCQ Test Report"
        />
      ) : (
        <p>Loading PDF...</p>
      )}
    </div>
  );
};

export default PDFViewer;
