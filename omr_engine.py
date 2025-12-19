import cv2, numpy as np

CHOICES = ["A","B","C","D"]

def grade_omr(image_path, answers, num_questions):
    img = cv2.imread(image_path)
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    blur = cv2.GaussianBlur(gray,(5,5),0)
    thresh = cv2.threshold(
        blur,0,255,cv2.THRESH_BINARY_INV+cv2.THRESH_OTSU
    )[1]

    cnts,_ = cv2.findContours(
        thresh,cv2.RETR_EXTERNAL,cv2.CHAIN_APPROX_SIMPLE
    )

    bubbles=[]
    for c in cnts:
        x,y,w,h=cv2.boundingRect(c)
        if 20<w<60 and 0.85<w/h<1.15:
            bubbles.append(c)

    bubbles=sorted(bubbles,key=lambda c:cv2.boundingRect(c)[1])

    correct=0
    detail={}

    for q in range(num_questions):
        row=sorted(
            bubbles[q*4:(q+1)*4],
            key=lambda c:cv2.boundingRect(c)[0]
        )

        maxv=0
        ans=None
        for i,c in enumerate(row):
            mask=np.zeros(thresh.shape,dtype="uint8")
            cv2.drawContours(mask,[c],-1,255,-1)
            v=cv2.countNonZero(
                cv2.bitwise_and(thresh,thresh,mask=mask)
            )
            if v>maxv:
                maxv=v
                ans=CHOICES[i]

        detail[q+1]=ans
        if ans==answers.get(str(q+1)):
            correct+=1

    score=round(correct/num_questions*10,2)
    return score, detail