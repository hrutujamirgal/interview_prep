import pickle
import librosa
import numpy as np
import os
import joblib

# Load the SVM model and label encoder
model_path = "F:/Full stack projects/interview_prep/models/svm_model.pkl"
label_encoder_path = "F:/Full stack projects/interview_prep/models/label_encoder.pkl"

# Load the SVM model
def load_model_and_encoder():
    if os.path.exists(model_path):
        loaded_svm_model = joblib.load(model_path)
        print("SVM model loaded successfully")
    else:
        print("Model file not found at:", model_path)
        loaded_svm_model = None

    # Load the label encoder
    if os.path.exists(label_encoder_path):
        le = joblib.load(label_encoder_path)
        print("Label encoder loaded successfully")
    else:
        print("Label encoder file not found at:", label_encoder_path)
        le = None

    return loaded_svm_model, le


# Extract features from an audio file
def extract_features(file_name):
    # Load the audio file
    audio, sample_rate = librosa.load(file_name, res_type='kaiser_fast')

    # Extract MFCC features from the audio file
    mfccs = librosa.feature.mfcc(y=audio, sr=sample_rate, n_mfcc=13)  # Use 13 MFCC features

    # Compute the mean of the MFCC features across time axis
    mfccs_mean = np.mean(mfccs.T, axis=0)

    return mfccs_mean


# Function to predict confidence and fumbleness from an audio file
def predict_confidence_and_fumbleness(audio_file_path):
    # Load model and label encoder
    loaded_svm_model, le = load_model_and_encoder()
    
    if loaded_svm_model is None or le is None:
        print("Model or label encoder not loaded. Exiting...")
        return

    # Extract features from the audio file
    features = extract_features(audio_file_path)

    if features is not None:
        features = features.reshape(1, -1)  # Reshape for prediction
        
        # Predict the class and confidence using the loaded model
        prediction = loaded_svm_model.predict(features)
        confidence = loaded_svm_model.predict_proba(features)

        # Calculate confidence and fumbleness percentages
        confidence_percentage = confidence[0][1] * 100  # Adjust index based on your encoding
        fumbleness_percentage = 100 - confidence_percentage

        # Determine confidence label based on threshold
        if confidence_percentage > 75:
            confidence_label = "Unconfident"
        else:
            confidence_label = "Confident"

        return {
            'fumbling-percent': round(fumbleness_percentage, 2),
            'confidence': confidence_label
        }
    else:
        return ('Could not extract features. Please check the audio file.')



