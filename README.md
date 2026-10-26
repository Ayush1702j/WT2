# Web Technology Practical No. 2: JavaScript
## Interactive Student Registration Portal with JSON Storage & Validation

**Course**: Web Technology (2304362L) | T.Y. B.Tech | AY 2025-26  
**Institution**: MIT Academy of Engineering, Pune  
**Practical No. 2**: JavaScript  

---

## 🚀 Quick Access

### 1. Run in Browser
Double-click `index.html` to open in any web browser.

### 2. Run via Apache Tomcat
Tomcat is deployed and serving the app at:
```
http://localhost:8081/student-registration/
```

---

## 📦 What to Upload on Moodle

### 1. Submission ZIP: `PRN_Name_P2_Registration.zip`
To regenerate with your exact PRN and Name:
```powershell
python create_submission_zip.py "<YOUR_PRN>" "<YOUR_NAME>"
```
Example:
```powershell
python create_submission_zip.py "2304362" "Ayush"
# Outputs: 2304362_Ayush_P2_Registration.zip
```

### 2. Submission PDF Report: `PRN_Name_P2_Report.pdf`
1. Open `PRN_Name_P2_Report.html` in Chrome or Edge.
2. Capture the 3 screenshots:
   - **Screenshot 1**: Portal overview with valid record added to the table.
   - **Screenshot 2**: Invalid input form with red validation error messages.
   - **Screenshot 3**: View Details profile modal or dynamic search filter in action.
3. Save them into `screenshots/` or paste them into the report.
4. Press <kbd>Ctrl</kbd> + <kbd>P</kbd> -> Select **"Save as PDF"** -> Save as `2304362_Ayush_P2_Report.pdf`.

---

## 🛠️ Validation Rules Implemented (8 Rules)

1. **Full Name**: Required, alphabets and spaces only (`^[A-Za-z\s]{3,50}$`), min 3 characters.
2. **PRN Number**: Required, exactly 7-10 numeric digits (`^\d{7,10}$`), unique in array.
3. **Contact Phone**: Required, 10-digit Indian mobile number (`^[6-9]\d{9}$`).
4. **Email Address**: Required, RFC 5322 standard regex format, unique in array.
5. **Date of Birth & Age**: Required, calculated age must be between 17 and 30 years.
6. **Department / Branch**: Required, cannot be default unselected option.
7. **CGPA Score**: Required, numerical float between 0.00 and 10.00.
8. **Array Uniqueness**: Checks existing JSON array to prevent duplicate PRNs and Emails.
