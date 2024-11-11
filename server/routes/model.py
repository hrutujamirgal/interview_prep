import tensorflow as tf
import cv2
import numpy as np
import os

# Load the model
model_path = "F:/Full stack projects/interview_prep/models/confidence_model.h5"
if os.path.exists(model_path):
    model = tf.keras.models.load_model(model_path)
else:
    print("Model file not found at:", model_path)

# Extract and process frames from video
input_path = "F:/Full stack projects/interview_prep/models/sample.mp4"
cap = cv2.VideoCapture(input_path)
frames = []
sequence_length = 114

while cap.isOpened():
    ret, frame = cap.read()
    if not ret:
        break
    # Resize frame to match model's expected input shape
    frame = cv2.resize(frame, (128, 128))
    frames.append(frame)

cap.release()

# Convert frames to numpy array and ensure correct shape
frames = np.array(frames)
frames = frames[:sequence_length * (len(frames) // sequence_length)]  
frames = frames.reshape((-1, sequence_length, 128, 128, 3))  

frames = frames / 255.0

# Run the prediction
confidence = model.predict(frames)[0][0] * 100 

if confidence >40:
    print(f"The interviewee is confident with a confidence level of {confidence:.2f}% and is honest to provided skills.")
else:
    print(f"The interviewee has a confidence level of {confidence:.2f}%, suggesting improvement in soft skills and is not honest to provided skills.")

