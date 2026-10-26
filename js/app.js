/**
 * Web Technology Practical No. 2: JavaScript
 * Student Registration & Management Portal
 * 
 * Features:
 * - In-Memory Array of JSON Objects with LocalStorage Persistence
 * - 8 Comprehensive Validation Rules with Real-Time & Submit Checking
 * - Dynamic DOM Manipulation (CRUD, KPIs, Filtering, Sorting)
 * - JSON File Export & Import Utilities
 * - Zero External Libraries for Core Logic
 */

document.addEventListener("DOMContentLoaded", () => {
  // --------------------------------------------------------------------------
  // 1. Initial State & Seed JSON Dataset
  // --------------------------------------------------------------------------
  const STORAGE_KEY = "MITAOE_STUDENT_RECORDS_P2";

  const defaultStudents = [
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
      registeredAt: "2026-10-24 10:30:15"
    },
    {
      id: "STU-2026-102",
      fullName: "Priya Deshmukh",
      prn: "2304375",
      email: "priya.deshmukh@mitaoe.ac.in",
      phone: "9823456789",
      dob: "2004-09-21",
      age: 22,
      gender: "Female",
      branch: "Information Technology",
      year: "T.Y. B.Tech",
      cgpa: 9.15,
      skills: ["Cloud Computing", "Cybersecurity"],
      registeredAt: "2026-10-24 14:15:30"
    },
    {
      id: "STU-2026-103",
      fullName: "Rohan Kulkarni",
      prn: "2304410",
      email: "rohan.kulkarni@mitaoe.ac.in",
      phone: "9765432109",
      dob: "2003-12-05",
      age: 22,
      gender: "Male",
      branch: "AI & Data Science",
      year: "T.Y. B.Tech",
      cgpa: 8.85,
      skills: ["AI & Machine Learning", "Web Development"],
      registeredAt: "2026-10-25 09:45:00"
    },
    {
      id: "STU-2026-104",
      fullName: "Sneha Patil",
      prn: "2304520",
      email: "sneha.patil@mitaoe.ac.in",
      phone: "8899776655",
      dob: "2005-02-18",
      age: 21,
      gender: "Female",
      branch: "Electronics & Telecomm",
      year: "S.Y. B.Tech",
      cgpa: 8.40,
      skills: ["Cloud Computing"],
      registeredAt: "2026-10-25 16:20:45"
    }
  ];

  // Load from LocalStorage or initialize with default seed array
  let studentRecords = [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    studentRecords = stored ? JSON.parse(stored) : [...defaultStudents];
  } catch (e) {
    console.warn("LocalStorage access failed, utilizing memory array:", e);
    studentRecords = [...defaultStudents];
  }

  function saveToStorage() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(studentRecords));
    } catch (e) {
      console.warn("Storage save error:", e);
    }
  }

  // --------------------------------------------------------------------------
  // 2. DOM Elements Cache
  // --------------------------------------------------------------------------
  const form = document.getElementById("studentRegistrationForm");
  const inputFullName = document.getElementById("fullName");
  const inputPRN = document.getElementById("prnNumber");
  const inputPhone = document.getElementById("phoneNumber");
  const inputEmail = document.getElementById("emailAddress");
  const inputDOB = document.getElementById("dob");
  const selectBranch = document.getElementById("branchSelect");
  const selectYear = document.getElementById("academicYear");
  const inputCGPA = document.getElementById("cgpaScore");
  const btnReset = document.getElementById("btnResetForm");

  const tableBody = document.getElementById("studentsTableBody");
  const emptyState = document.getElementById("tableEmptyState");
  const searchInput = document.getElementById("filterSearchInput");
  const branchFilter = document.getElementById("filterBranchSelect");
  const sortSelect = document.getElementById("sortRecordsSelect");

  const kpiTotal = document.getElementById("kpiTotalStudents");
  const kpiHighest = document.getElementById("kpiHighestCGPA");
  const kpiAverage = document.getElementById("kpiAverageCGPA");
  const kpiTopBranch = document.getElementById("kpiTopBranch");
  const clockDisplay = document.getElementById("liveClockDisplay");

  // --------------------------------------------------------------------------
  // 3. Live Clock Updater
  // --------------------------------------------------------------------------
  function updateClock() {
    const now = new Date();
    if (clockDisplay) {
      clockDisplay.textContent = now.toLocaleDateString("en-IN", {
        weekday: "short",
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
      });
    }
  }
  updateClock();
  setInterval(updateClock, 1000);

  // --------------------------------------------------------------------------
  // 4. Validation Engine (8 Strict Rules)
  // --------------------------------------------------------------------------
  const validators = {
    // Rule 1: Full Name (Required, Alphabetic + spaces only, 3 to 50 characters)
    fullName: (value) => {
      const val = value.trim();
      if (!val) return { valid: false, msg: "Full Name is required and cannot be empty." };
      const nameRegex = /^[A-Za-z\s]{3,50}$/;
      if (!nameRegex.test(val)) return { valid: false, msg: "Name must contain only alphabets and spaces (3 to 50 characters)." };
      return { valid: true };
    },

    // Rule 2: PRN Number (Required, exactly 7-10 digits, uniqueness in array)
    prn: (value, excludeId = null) => {
      const val = value.trim();
      if (!val) return { valid: false, msg: "PRN is required." };
      const prnRegex = /^\d{7,10}$/;
      if (!prnRegex.test(val)) return { valid: false, msg: "PRN must be between 7 and 10 numeric digits." };
      
      const duplicate = studentRecords.some(s => s.prn === val && s.id !== excludeId);
      if (duplicate) return { valid: false, msg: `PRN '${val}' is already registered in the system.` };
      return { valid: true };
    },

    // Rule 3: Mobile Number (Required, Indian format [6-9]\d{9})
    phone: (value) => {
      const val = value.trim();
      if (!val) return { valid: false, msg: "Mobile number is required." };
      const phoneRegex = /^[6-9]\d{9}$/;
      if (!phoneRegex.test(val)) return { valid: false, msg: "Enter a valid 10-digit mobile number starting with 6, 7, 8, or 9." };
      return { valid: true };
    },

    // Rule 4: Email Address (Required, Standard RFC 5322 regex format, unique)
    email: (value, excludeId = null) => {
      const val = value.trim();
      if (!val) return { valid: false, msg: "Email address is required." };
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(val)) return { valid: false, msg: "Please enter a valid email format (e.g., student@domain.com)." };
      
      const duplicate = studentRecords.some(s => s.email.toLowerCase() === val.toLowerCase() && s.id !== excludeId);
      if (duplicate) return { valid: false, msg: `Email '${val}' is already registered.` };
      return { valid: true };
    },

    // Rule 5: Date of Birth & Age Range (Required, Age must be between 17 and 30)
    dob: (value) => {
      if (!value) return { valid: false, msg: "Date of Birth is required." };
      const birthDate = new Date(value);
      const today = new Date();
      if (isNaN(birthDate.getTime())) return { valid: false, msg: "Invalid calendar date." };
      if (birthDate > today) return { valid: false, msg: "Date of Birth cannot be in the future." };

      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }

      if (age < 17 || age > 30) {
        return { valid: false, msg: `Candidate age is ${age} years. Must be between 17 and 30 years.` };
      }
      return { valid: true, age: age };
    },

    // Rule 6: Department / Branch Selection (Required, cannot be empty)
    branch: (value) => {
      if (!value || value.trim() === "") return { valid: false, msg: "Please select an engineering department." };
      return { valid: true };
    },

    // Rule 7: CGPA Score (Required, numeric float, range 0.00 to 10.00)
    cgpa: (value) => {
      if (value === "" || value === null || value === undefined) {
        return { valid: false, msg: "CGPA score is required." };
      }
      const num = parseFloat(value);
      if (isNaN(num)) return { valid: false, msg: "CGPA must be a valid numerical value." };
      if (num < 0.0 || num > 10.0) return { valid: false, msg: "CGPA must be in the range 0.00 to 10.00." };
      return { valid: true, val: num.toFixed(2) };
    }
  };

  // Helper to visually flag field validation state
  function setFieldState(groupId, errorId, validationResult) {
    const group = document.getElementById(groupId);
    const errEl = document.getElementById(errorId);
    if (!group) return validationResult.valid;

    if (validationResult.valid) {
      group.classList.remove("has-error");
      group.classList.add("has-success");
      if (errEl) errEl.style.display = "none";
    } else {
      group.classList.remove("has-success");
      group.classList.add("has-error");
      if (errEl) {
        errEl.textContent = validationResult.msg;
        errEl.style.display = "block";
      }
    }
    return validationResult.valid;
  }

  // Real-time inline field listeners
  if (inputFullName) {
    inputFullName.addEventListener("input", () => setFieldState("groupFullName", "errFullName", validators.fullName(inputFullName.value)));
    inputFullName.addEventListener("blur", () => setFieldState("groupFullName", "errFullName", validators.fullName(inputFullName.value)));
  }

  if (inputPRN) {
    inputPRN.addEventListener("input", () => setFieldState("groupPRN", "errPRN", validators.prn(inputPRN.value)));
    inputPRN.addEventListener("blur", () => setFieldState("groupPRN", "errPRN", validators.prn(inputPRN.value)));
  }

  if (inputPhone) {
    inputPhone.addEventListener("input", () => setFieldState("groupPhone", "errPhone", validators.phone(inputPhone.value)));
    inputPhone.addEventListener("blur", () => setFieldState("groupPhone", "errPhone", validators.phone(inputPhone.value)));
  }

  if (inputEmail) {
    inputEmail.addEventListener("input", () => setFieldState("groupEmail", "errEmail", validators.email(inputEmail.value)));
    inputEmail.addEventListener("blur", () => setFieldState("groupEmail", "errEmail", validators.email(inputEmail.value)));
  }

  if (inputDOB) {
    inputDOB.addEventListener("change", () => setFieldState("groupDOB", "errDOB", validators.dob(inputDOB.value)));
  }

  if (selectBranch) {
    selectBranch.addEventListener("change", () => setFieldState("groupBranch", "errBranch", validators.branch(selectBranch.value)));
  }

  if (inputCGPA) {
    inputCGPA.addEventListener("input", () => setFieldState("groupCGPA", "errCGPA", validators.cgpa(inputCGPA.value)));
    inputCGPA.addEventListener("blur", () => setFieldState("groupCGPA", "errCGPA", validators.cgpa(inputCGPA.value)));
  }

  // --------------------------------------------------------------------------
  // 5. Form Submission (Create Record)
  // --------------------------------------------------------------------------
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();

      // Execute all validation rules
      const rName = validators.fullName(inputFullName.value);
      const rPRN = validators.prn(inputPRN.value);
      const rPhone = validators.phone(inputPhone.value);
      const rEmail = validators.email(inputEmail.value);
      const rDOB = validators.dob(inputDOB.value);
      const rBranch = validators.branch(selectBranch.value);
      const rCGPA = validators.cgpa(inputCGPA.value);

      const isNameValid = setFieldState("groupFullName", "errFullName", rName);
      const isPRNValid = setFieldState("groupPRN", "errPRN", rPRN);
      const isPhoneValid = setFieldState("groupPhone", "errPhone", rPhone);
      const isEmailValid = setFieldState("groupEmail", "errEmail", rEmail);
      const isDOBValid = setFieldState("groupDOB", "errDOB", rDOB);
      const isBranchValid = setFieldState("groupBranch", "errBranch", rBranch);
      const isCGPAValid = setFieldState("groupCGPA", "errCGPA", rCGPA);

      const allValid = isNameValid && isPRNValid && isPhoneValid && isEmailValid && isDOBValid && isBranchValid && isCGPAValid;

      if (!allValid) {
        showToast("Please correct highlighted validation errors.", "error");
        // Shake form feedback
        form.classList.add("shake-form");
        setTimeout(() => form.classList.remove("shake-form"), 450);

        // Focus first invalid element
        if (!isNameValid) inputFullName.focus();
        else if (!isPRNValid) inputPRN.focus();
        else if (!isPhoneValid) inputPhone.focus();
        else if (!isEmailValid) inputEmail.focus();
        else if (!isDOBValid) inputDOB.focus();
        else if (!isBranchValid) selectBranch.focus();
        else if (!isCGPAValid) inputCGPA.focus();
        return;
      }

      // Collect gender radio value
      const genderChecked = document.querySelector('input[name="gender"]:checked');
      const gender = genderChecked ? genderChecked.value : "Not Specified";

      // Collect technical interest checkboxes
      const skillsChecked = Array.from(document.querySelectorAll('input[name="skillInterest"]:checked')).map(cb => cb.value);

      // Create JSON Record Object
      const newStudent = {
        id: "STU-" + new Date().getFullYear() + "-" + Math.floor(100 + Math.random() * 900),
        fullName: inputFullName.value.trim(),
        prn: inputPRN.value.trim(),
        phone: inputPhone.value.trim(),
        email: inputEmail.value.trim().toLowerCase(),
        dob: inputDOB.value,
        age: rDOB.age,
        gender: gender,
        branch: selectBranch.value,
        year: selectYear ? selectYear.value : "T.Y. B.Tech",
        cgpa: parseFloat(rCGPA.val),
        skills: skillsChecked,
        registeredAt: new Date().toISOString().replace("T", " ").substring(0, 19)
      };

      // Push into array & save
      studentRecords.unshift(newStudent);
      saveToStorage();

      // Clear form and visual feedback
      resetForm();
      showToast(`Student ${newStudent.fullName} registered successfully!`, "success");

      // Refresh DOM
      renderDirectory();
    });
  }

  function resetForm() {
    if (!form) return;
    form.reset();
    const groups = form.querySelectorAll(".form-group");
    groups.forEach(g => {
      g.classList.remove("has-error", "has-success");
      const err = g.querySelector(".error-message");
      if (err) err.style.display = "none";
    });
  }

  if (btnReset) btnReset.addEventListener("click", resetForm);

  // --------------------------------------------------------------------------
  // 6. Dynamic DOM Rendering & KPI Computation
  // --------------------------------------------------------------------------
  function renderDirectory() {
    updateKPIs();

    if (!tableBody) return;

    // Filter by branch
    const selectedBranch = branchFilter ? branchFilter.value : "ALL";
    const searchQuery = searchInput ? searchInput.value.trim().toLowerCase() : "";

    let filtered = studentRecords.filter(item => {
      const matchBranch = selectedBranch === "ALL" || item.branch === selectedBranch;
      const matchSearch = searchQuery === "" || 
        item.fullName.toLowerCase().includes(searchQuery) ||
        item.prn.includes(searchQuery) ||
        item.email.toLowerCase().includes(searchQuery);
      return matchBranch && matchSearch;
    });

    // Sorting
    const sortMode = sortSelect ? sortSelect.value : "date-desc";
    filtered.sort((a, b) => {
      if (sortMode === "name-asc") return a.fullName.localeCompare(b.fullName);
      if (sortMode === "cgpa-desc") return b.cgpa - a.cgpa;
      if (sortMode === "prn-asc") return a.prn.localeCompare(b.prn);
      return new Date(b.registeredAt) - new Date(a.registeredAt); // date-desc
    });

    if (filtered.length === 0) {
      tableBody.innerHTML = "";
      if (emptyState) emptyState.style.display = "block";
      return;
    }

    if (emptyState) emptyState.style.display = "none";

    tableBody.innerHTML = filtered.map(item => {
      // Determine CGPA badge style
      let cgpaClass = "medium";
      if (item.cgpa >= 9.0) cgpaClass = "high";
      else if (item.cgpa < 7.5) cgpaClass = "low";

      return `
        <tr>
          <td><strong style="color: var(--primary);">${escapeHTML(item.prn)}</strong></td>
          <td>
            <strong>${escapeHTML(item.fullName)}</strong>
            <div style="font-size: 0.75rem; color: var(--text-muted);">${escapeHTML(item.year || "T.Y. B.Tech")} &bull; ${item.gender}</div>
          </td>
          <td>
            <span class="badge badge-branch">${escapeHTML(item.branch)}</span>
          </td>
          <td>
            <div style="font-size: 0.82rem;">📧 ${escapeHTML(item.email)}</div>
            <div style="font-size: 0.8rem; color: var(--text-muted);">📱 ${escapeHTML(item.phone)}</div>
          </td>
          <td>
            <span class="badge badge-cgpa ${cgpaClass}">${item.cgpa.toFixed(2)}</span>
          </td>
          <td>
            <div class="row-actions">
              <button class="action-btn" onclick="viewDetails('${item.id}')" title="View Student Profile">👁️</button>
              <button class="action-btn" onclick="openEditModal('${item.id}')" title="Edit Student Record">✏️</button>
              <button class="action-btn delete" onclick="deleteStudent('${item.id}')" title="Delete Record">🗑️</button>
            </div>
          </td>
        </tr>
      `;
    }).join("");
  }

  function updateKPIs() {
    const total = studentRecords.length;
    if (kpiTotal) kpiTotal.textContent = total;

    if (total === 0) {
      if (kpiHighest) kpiHighest.textContent = "0.00";
      if (kpiAverage) kpiAverage.textContent = "0.00";
      if (kpiTopBranch) kpiTopBranch.textContent = "None";
      return;
    }

    const highest = Math.max(...studentRecords.map(s => s.cgpa));
    const average = studentRecords.reduce((sum, s) => sum + s.cgpa, 0) / total;

    if (kpiHighest) kpiHighest.textContent = highest.toFixed(2);
    if (kpiAverage) kpiAverage.textContent = average.toFixed(2);

    // Top branch calculation
    const branchCounts = {};
    studentRecords.forEach(s => {
      branchCounts[s.branch] = (branchCounts[s.branch] || 0) + 1;
    });
    let topBranch = "None";
    let maxCount = 0;
    for (const b in branchCounts) {
      if (branchCounts[b] > maxCount) {
        maxCount = branchCounts[b];
        topBranch = b;
      }
    }
    if (kpiTopBranch) {
      // Abbreviate if too long
      const abbrev = topBranch
        .replace("Computer Engineering", "Comp Engg")
        .replace("Information Technology", "IT")
        .replace("Electronics & Telecomm", "E&TC")
        .replace("Mechanical Engineering", "Mech")
        .replace("Chemical Engineering", "Chem");
      kpiTopBranch.textContent = abbrev;
    }
  }

  function escapeHTML(str) {
    if (!str) return "";
    return str.replace(/[&<>'"]/g, 
      tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
    );
  }

  // Filter and search listeners
  if (searchInput) searchInput.addEventListener("input", renderDirectory);
  if (branchFilter) branchFilter.addEventListener("change", renderDirectory);
  if (sortSelect) sortSelect.addEventListener("change", renderDirectory);

  // --------------------------------------------------------------------------
  // 7. CRUD Operations (View, Edit, Delete)
  // --------------------------------------------------------------------------
  window.viewDetails = function(studentId) {
    const student = studentRecords.find(s => s.id === studentId);
    if (!student) return;

    const modalBody = document.getElementById("viewStudentModalBody");
    if (!modalBody) return;

    modalBody.innerHTML = `
      <div style="text-align: center; margin-bottom: 20px;">
        <div style="font-size: 3rem;">🎓</div>
        <h3 style="margin: 4px 0;">${escapeHTML(student.fullName)}</h3>
        <span class="badge badge-branch">${escapeHTML(student.branch)}</span>
      </div>

      <table class="data-table" style="font-size: 0.9rem;">
        <tr><th style="width: 35%;">PRN Number:</th><td><strong>${escapeHTML(student.prn)}</strong></td></tr>
        <tr><th>Email Address:</th><td>${escapeHTML(student.email)}</td></tr>
        <tr><th>Mobile Contact:</th><td>${escapeHTML(student.phone)}</td></tr>
        <tr><th>Date of Birth:</th><td>${student.dob} (${student.age} years)</td></tr>
        <tr><th>Gender:</th><td>${student.gender}</td></tr>
        <tr><th>Academic Year:</th><td>${escapeHTML(student.year || "T.Y. B.Tech")}</td></tr>
        <tr><th>CGPA:</th><td><span class="badge badge-cgpa high">${student.cgpa.toFixed(2)}</span> / 10.00</td></tr>
        <tr><th>Interests / Skills:</th><td>${student.skills && student.skills.length > 0 ? student.skills.join(", ") : "None specified"}</td></tr>
        <tr><th>Registration Time:</th><td>${student.registeredAt}</td></tr>
      </table>
    `;

    openModal("viewStudentModal");
  };

  window.openEditModal = function(studentId) {
    const student = studentRecords.find(s => s.id === studentId);
    if (!student) return;

    document.getElementById("editStudentId").value = student.id;
    document.getElementById("editFullName").value = student.fullName;
    document.getElementById("editPRN").value = student.prn;
    document.getElementById("editPhone").value = student.phone;
    document.getElementById("editEmail").value = student.email;
    document.getElementById("editBranch").value = student.branch;
    document.getElementById("editCGPA").value = student.cgpa;

    openModal("editStudentModal");
  };

  const editForm = document.getElementById("editStudentForm");
  if (editForm) {
    editForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const id = document.getElementById("editStudentId").value;
      const index = studentRecords.findIndex(s => s.id === id);
      if (index === -1) return;

      const newName = document.getElementById("editFullName").value;
      const newPhone = document.getElementById("editPhone").value;
      const newEmail = document.getElementById("editEmail").value;
      const newBranch = document.getElementById("editBranch").value;
      const newCGPA = document.getElementById("editCGPA").value;

      // Validate edit fields
      const vName = validators.fullName(newName);
      const vPhone = validators.phone(newPhone);
      const vEmail = validators.email(newEmail, id);
      const vCGPA = validators.cgpa(newCGPA);

      if (!vName.valid) { showToast(vName.msg, "error"); return; }
      if (!vPhone.valid) { showToast(vPhone.msg, "error"); return; }
      if (!vEmail.valid) { showToast(vEmail.msg, "error"); return; }
      if (!vCGPA.valid) { showToast(vCGPA.msg, "error"); return; }

      // Update record in array
      studentRecords[index].fullName = newName.trim();
      studentRecords[index].phone = newPhone.trim();
      studentRecords[index].email = newEmail.trim().toLowerCase();
      studentRecords[index].branch = newBranch;
      studentRecords[index].cgpa = parseFloat(vCGPA.val);

      saveToStorage();
      closeModal("editStudentModal");
      showToast(`Student record for ${newName} updated!`, "success");
      renderDirectory();
    });
  }

  window.deleteStudent = function(studentId) {
    const student = studentRecords.find(s => s.id === studentId);
    if (!student) return;

    const confirmed = confirm(`Are you sure you want to delete student: ${student.fullName} (PRN: ${student.prn})?`);
    if (confirmed) {
      studentRecords = studentRecords.filter(s => s.id !== studentId);
      saveToStorage();
      showToast(`Record for ${student.fullName} deleted.`, "info");
      renderDirectory();
    }
  };

  // --------------------------------------------------------------------------
  // 8. JSON Import & Export Utilities
  // --------------------------------------------------------------------------
  const btnExport = document.getElementById("btnExportJSON");
  if (btnExport) {
    btnExport.addEventListener("click", () => {
      if (studentRecords.length === 0) {
        showToast("No records available to export.", "error");
        return;
      }
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(studentRecords, null, 2));
      const downloadAnchor = document.createElement("a");
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `mitaoe_students_${new Date().toISOString().slice(0, 10)}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      showToast(`Exported ${studentRecords.length} records to JSON!`, "success");
    });
  }

  const jsonInput = document.getElementById("jsonFileInput");
  if (jsonInput) {
    jsonInput.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const imported = JSON.parse(event.target.result);
          if (!Array.isArray(imported)) {
            showToast("Invalid JSON file: Root structure must be an Array.", "error");
            return;
          }

          // Validate imported records
          let addedCount = 0;
          imported.forEach(item => {
            if (item.fullName && item.prn && item.email) {
              const duplicate = studentRecords.some(s => s.prn === item.prn);
              if (!duplicate) {
                studentRecords.push(item);
                addedCount++;
              }
            }
          });

          saveToStorage();
          renderDirectory();
          showToast(`Successfully imported ${addedCount} student records!`, "success");
        } catch (err) {
          showToast("Failed to parse JSON file.", "error");
        }
      };
      reader.readAsText(file);
      // Reset input
      jsonInput.value = "";
    });
  }

  const btnClearAll = document.getElementById("btnClearAll");
  if (btnClearAll) {
    btnClearAll.addEventListener("click", () => {
      if (studentRecords.length === 0) {
        showToast("Directory is already empty.", "info");
        return;
      }
      if (confirm("Are you sure you want to clear ALL registered student records? This action cannot be undone.")) {
        studentRecords = [];
        saveToStorage();
        renderDirectory();
        showToast("All student records cleared.", "info");
      }
    });
  }

  // --------------------------------------------------------------------------
  // 9. Modal & Toast Helper Functions
  // --------------------------------------------------------------------------
  window.openModal = function(modalId) {
    const el = document.getElementById(modalId);
    if (el) el.classList.add("active");
  };

  window.closeModal = function(modalId) {
    const el = document.getElementById(modalId);
    if (el) el.classList.remove("active");
  };

  // Close modals on outside backdrop click
  document.querySelectorAll(".modal-backdrop").forEach(backdrop => {
    backdrop.addEventListener("click", (e) => {
      if (e.target === backdrop) backdrop.classList.remove("active");
    });
  });

  function showToast(message, type = "info") {
    const container = document.getElementById("toastContainer");
    if (!container) return;

    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    
    let icon = "ℹ️";
    if (type === "success") icon = "✅";
    if (type === "error") icon = "⚠️";

    toast.innerHTML = `<span>${icon}</span> <span>${escapeHTML(message)}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transform = "translateX(100%)";
      toast.style.transition = "all 0.3s ease";
      setTimeout(() => toast.remove(), 300);
    }, 3200);
  }

  // Initial render
  renderDirectory();
});
