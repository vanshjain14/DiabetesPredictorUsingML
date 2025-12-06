# Diabetes Predictor

A machine-learning–powered web application that predicts the likelihood of diabetes using standard medical inputs.

---

## 🎥 Project Demo

> A short demonstration showcasing the complete workflow of the application, including user input, prediction results, and database storage.


https://github.com/user-attachments/assets/71a25b63-8764-438e-a398-8f4b74eee435

---





## 🖥️ User Interface Overview

The web application provides a clean and intuitive graphical interface designed for ease of use.

### Input Form
- Users enter medical details such as glucose level, BMI, blood pressure, and age
- Input validation ensures realistic and complete values

### Prediction View
- The prediction result is displayed instantly after submission
- The output clearly indicates whether the user is **Diabetic** or **Non-Diabetic**

### Data Management
- Each prediction is securely stored in the database
- Logged-in users can view their past predictions

---

## Overview

The Diabetes Predictor assists in early risk assessment of diabetes using a trained machine learning model.  
It follows a client–server architecture where a web interface communicates with a backend prediction service.

---

## Features

- Simple and responsive web interface  
- Real-time diabetes prediction  
- Machine learning–based decision system  
- Secure user authentication  
- Persistent data storage using Supabase  
- Scalable backend architecture  

---

## Dataset

- **PIMA Indians Diabetes Dataset**
- **Target Variable**
  - `1` – Diabetic
  - `0` – Non-Diabetic

**Input Parameters**
- Pregnancies  
- Glucose Level  
- Blood Pressure  
- Skin Thickness  
- Insulin  
- BMI  
- Diabetes Pedigree Function  
- Age  

---

## Tech Stack

### Backend & ML
- Python  
- Scikit-learn  
- NumPy, Pandas  

### Web Application
- Flask / FastAPI  
- HTML, CSS, JavaScript  

### Database
- **Supabase (PostgreSQL)**
  - User authentication  
  - Medical input storage  
  - Prediction history  

---

## Workflow

1. User inputs medical data via the web interface  
2. Data is validated and preprocessed  
3. Machine learning model performs prediction  
4. Prediction results are displayed visually  
5. Data is securely stored in Supabase  

---

## How to Run

```bash
git clone https://github.com/your-username/diabetes-predictor.git
cd diabetes-predictor
pip install -r requirements.txt
python app.py
```
## Limitations

Dataset size is limited

Predictions depend on input quality

Not intended for clinical decision-making

## Future Enhancements

Interactive dashboards for prediction history

Model explainability (SHAP/LIME)

Mobile responsiveness improvements

Cloud deployment

## Disclaimer

This project is intended for educational purposes only and should not be used as a substitute for professional medical diagnosis.
