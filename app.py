import cv2
import os
from flask import Flask, request, render_template, redirect, url_for
from datetime import date, datetime
import numpy as np
from sklearn.neighbors import KNeighborsClassifier
import pandas as pd
import joblib
import time
import threading

app = Flask(__name__)

datetoday = date.today().strftime("%m_%d_%y")
datetoday2 = date.today().strftime("%d-%B-%Y")

# Initialize face detector
face_detector = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')

# Create necessary directories
if not os.path.isdir('Attendance'):
    os.makedirs('Attendance')
if not os.path.isdir('static/faces'):
    os.makedirs('static/faces')
if f'Attendance-{datetoday}.csv' not in os.listdir('Attendance'):
    with open(f'Attendance/Attendance-{datetoday}.csv', 'w') as f:
        f.write('Name,Roll,Time')

# Global variable for attendance status
attendance_status = {"running": False, "completed": False, "message": ""}

def totalreg():
    return len(os.listdir('static/faces'))

def extract_faces(img):
    try:
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        face_points = face_detector.detectMultiScale(gray, 1.3, 5)
        return face_points if len(face_points) > 0 else []
    except Exception as e:
        print("Face extraction error:", e)
        return []

def identify_face(facearray):
    try:
        model = joblib.load('static/face_recognition_model.pkl')
        return model.predict(facearray)
    except Exception as e:
        print("Model loading or prediction failed:", e)
        return ["unknown"]

def train_model():
    faces = []
    labels = []
    userlist = os.listdir('static/faces')
    for user in userlist:
        for imgname in os.listdir(f'static/faces/{user}'):
            img = cv2.imread(f'static/faces/{user}/{imgname}')
            if img is not None:
                resized_face = cv2.resize(img, (50, 50))
                faces.append(resized_face.ravel())
                labels.append(user)
    if len(faces) > 0:
        faces = np.array(faces)
        knn = KNeighborsClassifier(n_neighbors=5)
        knn.fit(faces, labels)
        joblib.dump(knn, 'static/face_recognition_model.pkl')
        return True
    return False

def extract_attendance():
    try:
        df = pd.read_csv(f'Attendance/Attendance-{datetoday}.csv')
        names = df['Name']
        rolls = df['Roll']
        times = df['Time']
        l = len(df)
        return names, rolls, times, l
    except Exception as e:
        print("Attendance extraction error:", e)
        return [], [], [], 0

def add_attendance(name):
    try:
        if '_' in name:
            username, userid = name.split('_')
        else:
            username, userid = "unknown", "000"
            
        current_time = datetime.now().strftime("%H:%M:%S")
        filepath = f'Attendance/Attendance-{datetoday}.csv'
        
        if os.path.exists(filepath):
            df = pd.read_csv(filepath)
            if str(userid) not in df['Roll'].astype(str).values:
                with open(filepath, 'a') as f:
                    f.write(f'\n{username},{userid},{current_time}')
                print(f"Attendance added for: {name}")
                return True
        else:
            with open(filepath, 'w') as f:
                f.write(f'{username},{userid},{current_time}')
            return True
    except Exception as e:
        print("Attendance addition error:", e)
    return False

def capture_attendance():
    global attendance_status
    attendance_status["running"] = True
    attendance_status["completed"] = False
    attendance_status["message"] = "Capturing attendance..."
    
    if 'face_recognition_model.pkl' not in os.listdir('static'):
        attendance_status["message"] = 'No trained model found. Please add faces first.'
        attendance_status["running"] = False
        return
    
    cap = cv2.VideoCapture(0)
    if not cap.isOpened():
        attendance_status["message"] = 'Error: Could not open camera.'
        attendance_status["running"] = False
        return
    
    df_existing = pd.read_csv(f'Attendance/Attendance-{datetoday}.csv')
    already_marked = set(df_existing['Roll'].astype(str).values)
    
    start_time = time.time()
    captured_faces = set()
    
    while time.time() - start_time < 5:  # Run for 5 seconds only
        ret, frame = cap.read()
        if not ret:
            continue
            
        faces = extract_faces(frame)
        
        for (x, y, w, h) in faces:
            face = cv2.resize(frame[y:y+h, x:x+w], (50, 50))
            identified_person = identify_face(face.reshape(1, -1))[0]
            
            if "_" in identified_person:
                userid = identified_person.split('_')[1]
                if userid not in already_marked and userid not in captured_faces:
                    if add_attendance(identified_person):
                        captured_faces.add(userid)
                        attendance_status["message"] = f"Marked: {identified_person}"
    
    cap.release()
    attendance_status["running"] = False
    attendance_status["completed"] = True
    attendance_status["message"] = f"Attendance completed. Marked {len(captured_faces)} students."

@app.route('/')
def home():
    names, rolls, times, l = extract_attendance()
    return render_template('home.html', names=names, rolls=rolls, times=times, l=l,
                         totalreg=totalreg(), datetoday2=datetoday2, 
                         attendance_status=attendance_status)

@app.route('/teacher')
def teacher_dashboard():
    names, rolls, times, l = extract_attendance()
    return render_template('teacher_dashboard.html', names=names, rolls=rolls, times=times, l=l,
                         totalreg=totalreg(), datetoday2=datetoday2,
                         attendance_status=attendance_status)

@app.route('/student/<student_id>')
def student_dashboard(student_id):
    df = pd.read_csv(f'Attendance/Attendance-{datetoday}.csv')
    student_data = df[df['Roll'].astype(str) == str(student_id)]
    return render_template('student_dashboard.html', student_data=student_data, 
                         student_id=student_id, datetoday2=datetoday2)

@app.route('/update_attendance', methods=['POST'])
def update_attendance():
    roll = request.form['roll']
    status = request.form['status']
    filepath = f'Attendance/Attendance-{datetoday}.csv'
    
    df = pd.read_csv(filepath)
    idx = df[df['Roll'].astype(str) == roll].index
    if not idx.empty:
        df.at[idx[0], 'Time'] = f'{status}-{datetime.now().strftime("%H:%M:%S")}'
        df.to_csv(filepath, index=False)

    return redirect(url_for('teacher_dashboard'))

@app.route('/start_attendance', methods=['GET'])
def start_attendance():
    global attendance_status
    if attendance_status["running"]:
        return redirect(url_for('teacher_dashboard'))
    
    # Start attendance capture in a separate thread
    thread = threading.Thread(target=capture_attendance)
    thread.start()
    
    return redirect(url_for('teacher_dashboard'))

@app.route('/add', methods=['POST'])
def add():
    newusername = request.form['newusername']
    newuserid = request.form['newuserid']
    userimagefolder = f'static/faces/{newusername}_{newuserid}'
    if not os.path.isdir(userimagefolder):
        os.makedirs(userimagefolder)

    cap = cv2.VideoCapture(0)
    i, j = 0, 0

    while i < 30:  # Reduced from 50 to 30 for faster enrollment
        ret, frame = cap.read()
        if not ret:
            break

        faces = extract_faces(frame)
        for (x, y, w, h) in faces:
            cv2.rectangle(frame, (x, y), (x + w, y + h), (255, 0, 20), 2)
            cv2.putText(frame, f'Images Captured: {i}/30', (30, 30),
                       cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 0, 20), 2)

            if j % 5 == 0:
                img_name = f"{newusername}_{i}.jpg"
                img_path = os.path.join(userimagefolder, img_name)
                face_crop = frame[y:y + h, x:x + w]
                if face_crop.size > 0:
                    cv2.imwrite(img_path, face_crop)
                    i += 1
            j += 1

        cv2.imshow('Adding New User', frame)
        if cv2.waitKey(10) & 0xFF == 27:
            break

    cap.release()
    cv2.destroyAllWindows()

    if train_model():
        return redirect(url_for('teacher_dashboard'))
    else:
        return render_template('teacher_dashboard.html', 
                             message='Training failed. No faces found.',
                             totalreg=totalreg(), datetoday2=datetoday2)

@app.route('/check_attendance_status', methods=['GET'])
def check_attendance_status():
    return attendance_status

if __name__ == '__main__':
    app.run(debug=True)