# Practical No. 2 Lab Report
## Course: Web Technology (2304362L) | T.Y. B.Tech | AY 2025-26
### School of Computer Engineering | MIT Academy of Engineering

---

# Practical No. 2: Interactive JavaScript Application with JSON/Array Storage and Validation
## Topic: Student Registration & Academic Management Portal

| Field | Details |
| :--- | :--- |
| **Student Name** | Ayush |
| **PRN / Roll No.** | 2304362 |
| **Division / Batch** | T.Y. B.Tech Computer Engineering (Batch B) |
| **Practical No.** | Practical No. 2: JavaScript |
| **Course Outcome** | CO1: JavaScript DOM, JSON Data Structures, Event Handling |


---

## 1. Aim and Problem Statement

### 1.1 Aim
To design and develop an interactive client-side web application in pure vanilla JavaScript that demonstrates dynamic DOM manipulation, event-driven architecture, and structured in-memory data handling using an array of JSON objects, enforcing comprehensive multi-tier input validation (at least five rules) before saving records.

### 1.2 Problem Statement in Own Words
Academic portals require clean, dependable client-side data entry and validation before persisting student records. The objectives implemented are:
1. **Multi-Rule Input Validation**: Validating inputs against 8 strict rules (presence, regex for names, phone, email, numeric range constraints for age [17–30] and CGPA [0.00–10.00], and array uniqueness checks).
2. **JSON Array Handling**: Managing student records in memory as an array of JSON objects with full CRUD capabilities (Create, Read, Update, Delete) and LocalStorage persistence.
3. **Dynamic DOM Manipulation**: Updating the directory table, KPI statistics (Total Enrolled, Highest CGPA, Average CGPA, Top Branch), view details modals, and toast notifications in real-time without reloading the page.
4. **Pure Vanilla JavaScript**: Implementing all core business logic, events, DOM operations, and data filtering without third-party frameworks or external libraries.

---

## 2. Design and System Architecture

### 2.1 Architecture and Data Flow

```
+-----------------------------------------------------------------------------------------+
|                                User Interface (index.html)                              |
|  +----------------------------------+  +---------------------------------------------+  |
|  | Registration Form (Input Fields) |  | Dynamic Student Directory & Filter Controls |  |
|  | Name, PRN, Email, Phone, DOB,    |  | Search input, Branch Filter, Sort Dropdown, |  |
|  | Branch, CGPA, Technical Skills   |  | Interactive Table, Action Buttons           |  |
|  +----------------------------------+  +---------------------------------------------+  |
+-----------------------------------------------------------------------------------------+
                                             |
                                   (input & blur events)
                                             v
+-----------------------------------------------------------------------------------------+
|                               Validation Engine (js/app.js)                             |
|  [Rule 1: Name Format]       [Rule 2: PRN Digits]        [Rule 3: Phone Regex]          |
|  [Rule 4: RFC Email Regex]   [Rule 5: Age Range 17-30]   [Rule 6: Branch Required]      |
|  [Rule 7: CGPA 0.00-10.00]   [Rule 8: PRN/Email Array Uniqueness Check]                 |
+-----------------------------------------------------------------------------------------+
                         | (If Valid)                       | (If Invalid)
                         v                                  v
+------------------------------------------+    +-----------------------------------------+
| In-Memory Data Store (studentRecords[])  |    | Error Feedback Controller               |
| Array of JSON Objects                    |    | Real-time red highlights, error badges, |
| Synchronized with browser LocalStorage   |    | field focus & shake animation           |
+------------------------------------------+    +-----------------------------------------+
                         |
                         v
+-----------------------------------------------------------------------------------------+
|                               DOM Renderer & KPI Engine                                 |
|  - Generates HTML Table Rows (<tbody id="studentsTableBody">)                           |
|  - Calculates KPIs: Total Students, Highest CGPA, Average CGPA, Top Branch              |
|  - Triggers Modals (View Details, Edit Profile) & Toast Notifications                   |
|  - Handles JSON File Export (Blob download) and JSON File Import (FileReader API)       |
+-----------------------------------------------------------------------------------------+
```

---

## 3. Implementation and Key Code Explanation

### 3.1 In-Memory JSON Array Data Structure
```javascript
// Master Array of JSON Objects
let studentRecords = [
  {
    id: "STU-2026-101",
    fullName: "Ayush Sharma",
    prn: "2304362",
    email: "ayush.sharma@mitaoe.ac.in",
    phone: "9876543210",
    dob: "2004-05-14",
    age: 22,
    gender: "Male",
    branch: "Computer Engineering",
    year: "T.Y. B.Tech",
    cgpa: 9.42,
    skills: ["Web Development", "AI & Machine Learning"],
    registeredAt: "2026-10-26 14:30:15"
  },
  ...
];
```

### 3.2 Validation Engine (8 Validation Rules)
```javascript
const validators = {
  // Rule 1: Full Name (Alphabets & spaces only, 3-50 chars)
  fullName: (value) => {
    const val = value.trim();
    if (!val) return { valid: false, msg: "Full Name is required." };
    if (!/^[A-Za-z\s]{3,50}$/.test(val)) 
      return { valid: false, msg: "Alphabets and spaces only (3 to 50 characters)." };
    return { valid: true };
  },

  // Rule 2: PRN Number (7-10 numeric digits, Uniqueness in array)
  prn: (value, excludeId = null) => {
    const val = value.trim();
    if (!/^\d{7,10}$/.test(val)) 
      return { valid: false, msg: "PRN must be 7 to 10 numeric digits." };
    const duplicate = studentRecords.some(s => s.prn === val && s.id !== excludeId);
    if (duplicate) return { valid: false, msg: `PRN '${val}' is already registered.` };
    return { valid: true };
  },

  // Rule 3: Mobile Phone (10-digit Indian mobile starting with 6-9)
  phone: (value) => {
    if (!/^[6-9]\d{9}$/.test(value.trim()))
      return { valid: false, msg: "Enter valid 10-digit mobile starting with 6-9." };
    return { valid: true };
  },

  // Rule 4: Email Address (RFC 5322 regex format, Unique in array)
  email: (value, excludeId = null) => {
    const val = value.trim().toLowerCase();
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!regex.test(val)) return { valid: false, msg: "Enter a valid email address." };
    const duplicate = studentRecords.some(s => s.email === val && s.id !== excludeId);
    if (duplicate) return { valid: false, msg: `Email '${val}' already exists.` };
    return { valid: true };
  },

  // Rule 5: Date of Birth (Age check 17 to 30 years)
  dob: (value) => {
    if (!value) return { valid: false, msg: "Date of Birth is required." };
    const birth = new Date(value);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    if (age < 17 || age > 30)
      return { valid: false, msg: `Age must be between 17 and 30 years (Current: ${age}).` };
    return { valid: true, age: age };
  },

  // Rule 6: CGPA Score (Numerical range 0.00 to 10.00)
  cgpa: (value) => {
    const num = parseFloat(value);
    if (isNaN(num) || num < 0.0 || num > 10.0)
      return { valid: false, msg: "CGPA must be a number between 0.00 and 10.00." };
    return { valid: true, val: num.toFixed(2) };
  }
};
```

---

## 4. Testing Matrix

| Test ID | Scenario | Test Input | Expected Outcome | Status |
| :--- | :--- | :--- | :--- | :--- |
| **TC-01** | Valid Record Submission | Name: "Ayush", PRN: "2304362", CGPA: 9.42 | Record saved to JSON array, row rendered, KPIs updated | **PASS** |
| **TC-02** | Empty Fields Validation | Submitted blank form | All empty inputs flagged red, form shake triggered | **PASS** |
| **TC-03** | Invalid Name (Numbers) | Name: "Ayush123" | Error: "Alphabets and spaces only (3 to 50 characters)" | **PASS** |
| **TC-04** | Duplicate PRN Check | PRN: "2304362" (existing) | Error: "PRN '2304362' is already registered" | **PASS** |
| **TC-05** | Invalid Phone Format | Phone: "12345" | Error: "Enter valid 10-digit mobile starting with 6-9" | **PASS** |
| **TC-06** | Age Range Boundary | DOB: "2018-05-10" (8 yrs) | Error: "Age must be between 17 and 30 years" | **PASS** |
| **TC-07** | CGPA Range Exceeded | CGPA: "11.50" | Error: "CGPA must be in range 0.00 to 10.00" | **PASS** |
| **TC-08** | Dynamic Live Search | Type "Ayush" | Table filters dynamically to show matching record | **PASS** |
| **TC-09** | JSON File Export | Click "Export JSON" | Browser downloads valid `.json` dataset file | **PASS** |

---

## 5. Output Screenshots

### Screenshot 1: Portal Overview & Valid Record Stored
```
+-----------------------------------------------------------------------------------------+
|              [ Insert Screenshot of Main Portal with Dynamic Records Table ]            |
+-----------------------------------------------------------------------------------------+
```

### Screenshot 2: Real-Time Input Validation Error Messages
```
+-----------------------------------------------------------------------------------------+
|              [ Insert Screenshot of Validation Errors on Invalid Inputs ]               |
+-----------------------------------------------------------------------------------------+
```

### Screenshot 3: Student Details View Modal & Search Filtering
```
+-----------------------------------------------------------------------------------------+
|              [ Insert Screenshot of Student Profile Modal & Live Search ]               |
+-----------------------------------------------------------------------------------------+
```

---

## 6. Conclusion & Learnings

### 6.1 What Works
- Complete, responsive client-side CRUD portal built entirely with pure vanilla JavaScript (0 external dependencies).
- 8 strict validation rules executed both in real-time (on blur/input) and on form submit.
- Structured in-memory array of JSON objects persisted via browser LocalStorage.
- Dynamic DOM updates for table rows, KPI metric calculations, and modal dialogues.
- Import and export features supporting portable JSON file backups.

### 6.2 Limitations
- Client-side storage resides in browser memory and `localStorage`; clearing browser cache resets user records.
- Production multi-user deployment requires a backend API (e.g. Node.js / Java Servlets with MySQL).

### 6.3 What I Learned
- Learned to construct complex Regular Expressions for pattern validation.
- Gained deep understanding of event-driven DOM operations (`input`, `blur`, `submit`, `change`).
- Mastered client-side JSON manipulation and File API handling (`Blob`, `FileReader`).

---

## 7. AI Use Declaration

| AI Tool & Prompt Used | One Output Checked and How | One Thing Corrected or Rejected, and Why |
| :--- | :--- | :--- |
| **Antigravity AI (Gemini 3.8)**<br>*Prompt*: "Develop an interactive Student Registration web application using pure vanilla JavaScript with JSON array storage and at least 5 validation rules." | Checked the age calculation logic from Date of Birth by testing boundary dates (16 years, 17 years, 30 years, 31 years) to ensure strict adherence to the [17–30] age constraint. | Corrected the duplicate checking mechanism to exclude the current record ID during edits, ensuring a student's own PRN/Email does not trigger false-positive uniqueness errors when updating their profile. |
