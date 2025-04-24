import cv2
import os
from flask import Flask, request, render_template, redirect, url_for
from datetime import date, datetime
import numpy as np
from sklearn.neighbors import KNeighborsClassifier
import pandas as pd
import joblib

app = Flask(__name__)

datetoday = date.today().strftime("%m_%d_%y")
datetoday2 = date.today().strftime("%d-%B-%Y")

face_detector = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')

if not os.path.isdir('Attendance'):
    os.makedirs('Attendance')
if not os.path.isdir('static/faces'):
    os.makedirs('static/faces')
if f'Attendance-{datetoday}.csv' not in os.listdir('Attendance'):
    with open(f'Attendance/Attendance-{datetoday}.csv', 'w') as f:
        f.write('Name,Roll,Time')

def totalreg():
    return len(os.listdir('static/faces'))

def extract_faces(img):
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    face_points = face_detector.detectMultiScale(gray, 1.3, 5)
    return face_points if len(face_points) > 0 else []

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
            resized_face = cv2.resize(img, (50, 50))
            faces.append(resized_face.ravel())
            labels.append(user)
    faces = np.array(faces)
    knn = KNeighborsClassifier(n_neighbors=5)
    knn.fit(faces, labels)
    joblib.dump(knn, 'static/face_recognition_model.pkl')

def extract_attendance():
    df = pd.read_csv(f'Attendance/Attendance-{datetoday}.csv')
    names = df['Name']
    rolls = df['Roll']
    times = df['Time']
    l = len(df)
    return names, rolls, times, l

def add_attendance(name):
    username, userid = name.split('_')
    current_time = datetime.now().strftime("%H:%M:%S")
    filepath = f'Attendance/Attendance-{datetoday}.csv'
    if os.path.exists(filepath):
        df = pd.read_csv(filepath)
        if str(userid) in df['Roll'].astype(str).values:
            return
    with open(filepath, 'a') as f:
        f.write(f'\n{username},{userid},{current_time}')
    print(f"Attendance added for: {name}")

@app.route('/')
def home():
    names, rolls, times, l = extract_attendance()
    return render_template('home.html', names=names, rolls=rolls, times=times, l=l,
                           totalreg=totalreg(), datetoday2=datetoday2)

@app.route('/teacher')
def teacher_dashboard():
    names, rolls, times, l = extract_attendance()
    return render_template('teacher_dashboard.html', names=names, rolls=rolls, times=times, l=l,
                           totalreg=totalreg(), datetoday2=datetoday2)

@app.route('/student/<student_id>')
def student_dashboard(student_id):
    df = pd.read_csv(f'Attendance/Attendance-{datetoday}.csv')
    student_data = df[df['Roll'].astype(str) == str(student_id)]
    return render_template('student_dashboard.html', student_data=student_data, student_id=student_id, datetoday2=datetoday2)

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
@app.route('/start', methods=['GET'])
def start():
    if 'face_recognition_model.pkl' not in os.listdir('static'):
        return render_template('teacher_dashboard.html', totalreg=totalreg(), datetoday2=datetoday2,
                               mess='No trained model found. Please add a new face to continue.')

    cap = cv2.VideoCapture(0)
    df_existing = pd.read_csv(f'Attendance/Attendance-{datetoday}.csv')
    already_marked = set(df_existing['Roll'].astype(str).values)
    recognized = False

    while True:
        ret, frame = cap.read()
        if not ret:
            break

        faces = extract_faces(frame)

        for (x, y, w, h) in faces:
            face = cv2.resize(frame[y:y + h, x:x + w], (50, 50))
            identified_person = identify_face(face.reshape(1, -1))[0]
            userid = identified_person.split('_')[1] if "_" in identified_person else "Unknown"

            if userid != "Unknown" and userid not in already_marked:
                add_attendance(identified_person)
                already_marked.add(userid)
                recognized = True
                break

        if recognized:
            break

    cap.release()
    cv2.destroyAllWindows()

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

    while i < 50:
        ret, frame = cap.read()
        if not ret:
            break

        faces = extract_faces(frame)
        for (x, y, w, h) in faces:
            cv2.rectangle(frame, (x, y), (x + w, y + h), (255, 0, 20), 2)
            cv2.putText(frame, f'Images Captured: {i}/50', (30, 30),
                        cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 0, 20), 2)

            if j % 5 == 0:
                img_name = f"{newusername}_{i}.jpg"
                img_path = os.path.join(userimagefolder, img_name)
                face_crop = frame[y:y + h, x:x + w]
                cv2.imwrite(img_path, face_crop)
                i += 1
            j += 1

        cv2.imshow('Adding New User', frame)
        if cv2.waitKey(10) & 0xFF == 27:
            break

    cap.release()
    cv2.destroyAllWindows()

    train_model()

    names, rolls, times, l = extract_attendance()
    return render_template('home.html', names=names, rolls=rolls, times=times, l=l,
                           totalreg=totalreg(), datetoday2=datetoday2)

if __name__ == '__main__':
    app.run(debug=True)
