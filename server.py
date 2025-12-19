from flask import Flask, request, jsonify
from flask_cors import CORS
import cv2, numpy as np, os, json

app = Flask(__name__)
CORS(app)  # Cho phép HTML truy cập online

UPLOAD = "uploads"
os.makedirs(UPLOAD, exist_ok=True)

ANSWER_KEY = {
  "30": {...},
  "40": {...},
  "50": {...},
  "60": {...}
}

def grade(image_path, key, n):
    img = cv2.imread(image_path)
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    blur = cv2.GaussianBlur(gray, (5,5), 0)
    thresh = cv2.threshold(
        blur, 0, 255,
        cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU
    )[1]

    cnts, _ = cv2.findContours(
        thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE
    )

    bubbles = []
    for c in cnts:
        x,y,w,h = cv2.boundingRect(c)
        if 20 < w < 60 and 0.8 < w/h < 1.2:
            bubbles.append(c)

    bubbles = sorted(bubbles, key=lambda c: cv2.boundingRect(c)[1])
    choices = ["A","B","C","D"]

    correct = 0
    detail = {}

    for q in range(n):
        row = sorted(
            bubbles[q*4:(q+1)*4],
            key=lambda c: cv2.boundingRect(c)[0]
        )

        bubbled = None
        maxv = 0
        for i,c in enumerate(row):
            mask = np.zeros(thresh.shape, dtype="uint8")
            cv2.drawContours(mask,[c],-1,255,-1)
            v = cv2.countNonZero(
                cv2.bitwise_and(thresh, thresh, mask=mask)
            )
            if v > maxv:
                maxv = v
                bubbled = choices[i]

        detail[str(q+1)] = bubbled
        if bubbled == key.get(str(q+1)):
            correct += 1

    score = round(correct / n * 10, 2)
    return score, detail

@app.route("/scan", methods=["POST"])
def scan():
    img = request.files["image"]
    num = request.form["num_questions"]

    path = os.path.join(UPLOAD, img.filename)
    img.save(path)

    score, detail = grade(path, ANSWER_KEY[num], int(num))
    return jsonify({"score": score, "detail": detail})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)