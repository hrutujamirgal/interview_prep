import tensorflow as tf
import cv2
import numpy as np
import os

import numpy as np
import cv2
import tensorflow as tf
import os

def analyze_confidence(video_path):
    """
    Analyzes the confidence level of an interviewee based on a video input.
    
    Args:
        video_path (str): Path to the video file for analysis.
    
    Returns:
        dict: Contains 'confidence' and 'message' with the interviewee's confidence analysis.
    """
    # Load the model
    model_path = "F:/Full stack projects/interview_prep/models/confidence_model.h5"
    if os.path.exists(model_path):
        model = tf.keras.models.load_model(model_path)
    else:
        return {"error": "Model file not found"}

    # Get the model input shape
    input_shape = model.input_shape  # e.g., (None, 114, 128, 128, 3)

    # Extract and process frames from the video
    cap = cv2.VideoCapture(os.path.abspath(video_path))
    frames = []
    sequence_length = 114  # Number of frames per sequence

    # Capture frames from the video
    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break

        # Resize frame dynamically to the model's expected input shape
        target_height, target_width = input_shape[2], input_shape[3]  # (height, width) from model input shape
        frame = cv2.resize(frame, (target_width, target_height))
        frames.append(frame)

    cap.release()

    # Check if frames were captured
    if len(frames) == 0:
        return {"error": "No frames captured from the video"}

    # If there are enough frames
    if len(frames) < sequence_length:
        print(f"Video has fewer frames ({len(frames)}) than the required {sequence_length}. Using available frames for prediction...")
        # If fewer frames, pad with black frames (zeros)
        padding = sequence_length - len(frames)
        frames.extend([np.zeros_like(frames[0])] * padding)

    # Convert frames to numpy array and reshape to match model input (batch_size, sequence_length, height, width, channels)
    frames = np.array(frames)
    frames = frames.reshape((1, sequence_length, input_shape[2], input_shape[3], 3))  # (1, 114, 128, 128, 3)

    frames = frames / 255.0  # Normalize frames to the range [0, 1]

    # Run the prediction
    confidence = model.predict(frames)[0][0] * 100

    # Generate the result message based on the confidence score
    if confidence > 40:
        message = f"The interviewee is confident with a confidence level of {confidence:.2f}% and is honest about provided skills."
    else:
        message = f"The interviewee has a confidence level of {confidence:.2f}%, suggesting improvement in soft skills and is not honest about provided skills."

    return {'confidence': confidence, 'message': message}
import numpy as np
import cv2
import tensorflow as tf
import os

def analyze_confidence(video_path):
    """
    Analyzes the confidence level of an interviewee based on a video input.
    
    Args:
        video_path (str): Path to the video file for analysis.
    
    Returns:
        dict: Contains 'confidence' and 'message' with the interviewee's confidence analysis.
    """
    # Load the model
    model_path = "F:/Full stack projects/interview_prep/models/confidence_model.h5"
    if os.path.exists(model_path):
        model = tf.keras.models.load_model(model_path)
    else:
        return {"error": "Model file not found"}

    # Get the model input shape
    input_shape = model.input_shape  # e.g., (None, 114, 128, 128, 3)

    # Extract and process frames from the video
    cap = cv2.VideoCapture(os.path.abspath(video_path))
    frames = []
    sequence_length = 114  # Number of frames per sequence

    # Capture frames from the video
    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break

        # Resize frame dynamically to the model's expected input shape
        target_height, target_width = input_shape[2], input_shape[3]  # (height, width) from model input shape
        frame = cv2.resize(frame, (target_width, target_height))
        frames.append(frame)

    cap.release()

    # Check if frames were captured
    if len(frames) == 0:
        return {"error": "No frames captured from the video"}

    # If there are enough frames
    if len(frames) < sequence_length:
        print(f"Video has fewer frames ({len(frames)}) than the required {sequence_length}. Using available frames for prediction...")
        # If fewer frames, pad with black frames (zeros)
        padding = sequence_length - len(frames)
        frames.extend([np.zeros_like(frames[0])] * padding)

    # Convert frames to numpy array and reshape to match model input (batch_size, sequence_length, height, width, channels)
    frames = np.array(frames)
    frames = frames.reshape((1, sequence_length, input_shape[2], input_shape[3], 3))  # (1, 114, 128, 128, 3)

    frames = frames / 255.0  # Normalize frames to the range [0, 1]

    # Run the prediction
    confidence = model.predict(frames)[0][0] * 100

    # Generate the result message based on the confidence score
    if confidence > 40:
        message = f"The interviewee is confident with a confidence level of {confidence:.2f}% and is honest about provided skills."
    else:
        message = f"The interviewee has a confidence level of {confidence:.2f}%, suggesting improvement in soft skills and is not honest about provided skills."

    return {'confidence': confidence, 'message': message}
