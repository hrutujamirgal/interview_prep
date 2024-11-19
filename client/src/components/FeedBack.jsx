import { Button, Rate, Input, notification } from 'antd';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useComponent } from '../context/ComponentContext';
import { useCookies } from 'react-cookie';

const { TextArea } = Input;

const FeedBack = () => {
  const navigate = useNavigate();
  const [rate, setRate] = useState(0);
  const [feedback, setFeedback] = useState('');
  const { sendFeedback } = useComponent();
  const [cookies] = useCookies(['userData']);

  const handleFeedback = async () => {
    if (!rate || !feedback.trim()) {
      notification.warning({
        message: 'Incomplete Feedback',
        description: 'Please provide both a rating and your feedback before submitting.',
      });
      return;
    }

    try {
      const userId = cookies?.userData?.id;
      if (!userId) {
        throw new Error('User ID not found in cookies. Please log in again.');
      }

      await sendFeedback(rate, feedback, userId);

      

      navigate('/report');
    } catch (error) {
      console.error('Error submitting feedback:', error);
      notification.error({
        message: 'Submission Failed',
        description: error.message || 'An unexpected error occurred. Please try again.',
      });
    }
  };

  return (
    <div className="bg-last w-screen h-fit flex justify-center items-center">
      <div className="bg-mid w-3/4 md:w-2/3 lg:w-1/3 h-fit mt-5 shadow-2xl rounded-xl p-5 md:p-5 lg:p-10 items-center space-x-3 space-y-5">
        <p className="p-2 font-serif text-xl md:text-2xl lg:text-3xl text-black">
          How was the Interview?
        </p>
        <Rate
          allowHalf
          value={rate}
          className="text-2xl md:text-3xl lg:text-4xl text-main"
          onChange={setRate}
        />
        <TextArea
          rows={4}
          className="w-3/4 md:w-2/3 lg:w-full"
          maxLength={100}
          placeholder="Feedback"
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
        />
        <Button type="primary" onClick={handleFeedback}>
          Submit
        </Button>
      </div>
    </div>
  );
};

export default FeedBack;
