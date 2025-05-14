# **Beforest Bespoke Engine Documentation**

## **Overview**

The Beforest Bespoke Engine is a web-based communication assessment platform designed to evaluate employee interactions with prospects through scenario-based questions. It integrates with Supabase for backend data management and external webhooks for automated operations, all aligned with the Business Model Canvas (BMC).

## **1\. Functionality**

### **Workflow**

1. **Session Creation**:

   * Employee initiates an assessment via the UI.

   * A new session is created in Supabase.

   * A webhook (QUESTION\_GENERATOR\_WEBHOOK) is triggered to generate custom questions.

2. **Assessment Execution**:

   * A single timer starts when the session begins.

   * Questions are presented one at a time.

   * Employees respond via text or video, with responses saved in Supabase.

3. **Completion**:

   * Assessment submission stops the timer.

   * Session is marked as completed.

   * EMAIL\_WEBHOOK sends results to the employee's email.

   * Manager reviews data and provides feedback.

## **2\. Database Schema (Supabase)**

### **Tables**

#### **Users**

* `id`: UUID, Primary Key

* `name`: Text

* `email`: Text (unique)

* `role`: Text (e.g., employee, manager)

* `team`: Text

#### **Sessions**

* `id`: UUID, Primary Key

* `user_id`: UUID (FK to Users)

* `start_time`: Timestamp

* `end_time`: Timestamp (nullable)

* `status`: Text (e.g., in\_progress, completed)

* `questions`: JSONB

* `answers`: JSONB

* `total_time`: Integer (nullable)

* `email_sent_to`: Text (nullable)

#### **Feedback**

* `id`: UUID, Primary Key

* `session_id`: UUID (FK to Sessions)

* `feedback`: Text

* `feedback_by`: UUID (FK to Users)

* `feedback_at`: Timestamp

### **Features**

* **Supabase Auth**: Handles secure login and authentication.

* **Supabase Storage**: Stores video answers.

* **Realtime**: Notifies frontend when new questions are available.

* **Row-Level Security (RLS)**: Ensures proper access control.

## **3\. Webhooks**

### **Question Generator Webhook**

* **Trigger**: INSERT on `sessions`

**Payload**:

 {  
  "session\_id": "NEW.id",  
  "user\_id": "NEW.user\_id"  
}

*   
* **Action**: External agent generates questions and updates `sessions.questions` via API.

### **Email Webhook**

* **Trigger**: UPDATE on `sessions` when `status` \= 'completed'

**Payload**:

 {  
  "session\_id": "NEW.id",  
  "email": "(SELECT email FROM users WHERE id \= NEW.user\_id)",  
  "answers": NEW.answers,  
  "total\_time": NEW.total\_time  
}

*   
* **Action**: Sends results to employee and logs `email_sent_to`.

## **4\. UI Design**

### **Pages & Components**

### **🧑‍💼 1\. User Info Step**

* The user types their **name**, **email**, and **team**.

* When they click **“Start Assessment”**, the form disappears and the questions appear.

* A **timer** starts counting how long they take.

  ### **❓ 2\. Question Navigation**

* There are multiple questions.

* The user sees **numbered buttons** (1, 2, 3…) to jump between questions.

* The current question number is highlighted.

  ### **📝 3\. Answering Questions**

* Each question is shown with a **text box**.

* The user types their answer in the box.

* Their answer is **saved** as they type.

  ### **👉 4\. Next and Submit Buttons**

* If it's **not the last question**, they click **“Next”** to go to the next one.

* On the **last question**, a **“Submit”** button appears.

  ### **⏱️ 5\. Timer**

* A clock shows how much time has passed.

* It starts when the user begins the test and stops when they submit.

  ### **✅ 6\. Summary**

* After submission, the screen shows:

  * The user’s **name, email, team**, and **total time taken**.

  * All the **questions** and the **answers** they gave.

## **5\. Tech Stack**

### **Frontend**

* **React**: SPA framework

* **Tailwind CSS**: Styling

* **React Router**: Navigation

* **html2pdf.js**: PDF generation

### **Backend**

* **Supabase**: Auth, database, storage, real-time

### **Other Tools**

* **JavaScript (ES6+)**

* **Babel**: Transpilation

* **CDN Hosting**: jsDelivr for external packages

## **6\. Webhook SQL Setup**

\-- QUESTION\_GENERATOR\_WEBHOOK  
CREATE TRIGGER question\_generator\_webhook  
AFTER INSERT ON sessions  
FOR EACH ROW  
EXECUTE FUNCTION supabase\_functions.http\_request(  
  'https://your-agent.com/generate-questions',  
  'POST',  
  '{"Content-Type": "application/json"}',  
  '{"session\_id": NEW.id, "user\_id": NEW.user\_id}',  
  1000  
);

\-- EMAIL\_WEBHOOK  
CREATE TRIGGER email\_webhook  
AFTER UPDATE ON sessions  
FOR EACH ROW  
WHEN (NEW.status \= 'completed')  
EXECUTE FUNCTION supabase\_functions.http\_request(  
  'https://your-email-service.com/send-email',  
  'POST',  
  '{"Content-Type": "application/json"}',  
  '{"session\_id": NEW.id, "email": (SELECT email FROM users WHERE id \= NEW.user\_id), "answers": NEW.answers, "total\_time": NEW.total\_time}',  
  1000  
);

## **7\. Challenges and Mitigations**

| Challenge | Mitigation |
| ----- | ----- |
| Webhook security | Use API keys or JWTs in headers. |
| Agent reliability | Add retries and error-handling in external services. |
| Real-time updates | Use Supabase Realtime for live data sync. |
| Email integration | Ensure JSON payload compatibility with email service. |

## **Conclusion**

The Beforest Bespoke Engine provides a structured, secure, and scalable platform for assessing and improving employee communication through real-world simulation and timely feedback. Its integration with Supabase and minimal tech stack allows rapid deployment and reliable operations.

## **Appendix: Sample Standalone Assessment Page (HTML Only)**

\<\!DOCTYPE html\>  
\<html lang="en"\>  
\<head\>  
  \<meta charset="UTF-8"\>  
  \<title\>Sales Rep Assessment\</title\>  
  \<meta name="viewport" content="width=device-width, initial-scale=1"\>  
  \<style\>  
    :root {  
      \--dark-green: \#2E7D32;  
      \--medium-green: \#66BB6A;  
      \--light-green: \#A5D6A7;  
      \--background-green: \#E8F5E9;  
      \--text-color: \#1B5E20;  
      \--button-hover: \#388E3C;  
    }  
    body {  
      font-family: 'Segoe UI', Arial, sans-serif;  
      background: var(--background-green);  
      margin: 0;  
      color: var(--text-color);  
    }  
    .container {  
      max-width: 600px;  
      margin: 40px auto;  
      background: \#fff;  
      border-radius: 10px;  
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);  
      padding: 32px 24px;  
    }  
    h2 {  
      text-align: center;  
      margin-bottom: 24px;  
      color: var(--dark-green);  
      font-weight: 700;  
      letter-spacing: 1px;  
    }  
    .timer {  
      text-align: right;  
      margin-bottom: 18px;  
      font-weight: 500;  
      color: var(--medium-green);  
      letter-spacing: 1px;  
      font-size: 1.1em;  
    }  
    .question-nav {  
      text-align: center;  
      margin-bottom: 24px;  
    }  
    .question-nav button {  
      margin: 0 6px;  
      padding: 8px 16px;  
      border: none;  
      border-radius: 50%;  
      background: var(--light-green);  
      color: var(--text-color);  
      font-size: 1em;  
      font-weight: 500;  
      cursor: pointer;  
      transition: background 0.3s, color 0.3s;  
    }  
    .question-nav button.active,  
    .question-nav button:focus {  
      background: var(--dark-green);  
      color: \#fff;  
      outline: none;  
    }  
    .question-card {  
      background: \#fff;  
      border-radius: 8px;  
      padding: 20px 16px;  
      margin-bottom: 24px;  
      border-left: 6px solid var(--medium-green);  
    }  
    .question-title {  
      font-weight: 600;  
      margin-bottom: 12px;  
      font-size: 1.1em;  
      color: var(--text-color);  
    }  
    .options textarea {  
      width: 100%;  
      padding: 12px;  
      border-radius: 5px;  
      border: 1px solid var(--medium-green);  
      font-size: 1em;  
      background: \#fff;  
      transition: border 0.3s;  
    }  
    .options textarea:focus {  
      border: 1.5px solid var(--dark-green);  
      outline: none;  
    }  
    .submit-btn, .next-btn {  
      width: 100%;  
      padding: 14px;  
      background: var(--dark-green);  
      color: \#fff;  
      border: none;  
      border-radius: 6px;  
      font-size: 1.1em;  
      font-weight: 600;  
      cursor: pointer;  
      margin-top: 12px;  
      letter-spacing: 1px;  
      transition: background 0.3s;  
    }  
    .submit-btn:disabled, .next-btn:disabled {  
      background: \#b6c6e3;  
      cursor: not-allowed;  
    }  
    .submit-btn:hover, .next-btn:hover {  
      background: var(--button-hover);  
    }  
    .summary {  
      background: var(--light-green);  
      padding: 20px;  
      border-radius: 8px;  
      margin-top: 20px;  
      color: var(--text-color);  
      font-size: 1.05em;  
      border-left: 6px solid var(--medium-green);  
    }  
    .user-info input {  
      width: 100%;  
      padding: 10px;  
      margin: 12px 0 18px 0;  
      border-radius: 5px;  
      border: 1px solid var(--medium-green);  
      font-size: 1em;  
      background: \#f8fafc;  
    }  
    .user-info label {  
      font-weight: 500;  
      color: var(--text-color);  
    }  
    @media (max-width: 600px) {  
      .container { padding: 16px; }  
      .question-nav button { padding: 8px 12px; }  
      .question-card { padding: 16px 8px; }  
    }  
  \</style\>  
\</head\>  
\<body\>  
  \<div class="container" id="main-container"\>  
    \<\!-- User Info Form \--\>  
    \<div id="user-info-section"\>  
      \<h2\>Sales Rep Assessment\</h2\>  
      \<form id="user-info-form" autocomplete="off"\>  
        \<div class="user-info"\>  
          \<label for="name"\>Name\</label\>  
          \<input type="text" id="name" placeholder="Your Name" required\>  
          \<label for="email"\>Email\</label\>  
          \<input type="email" id="email" placeholder="Your Email" required\>  
          \<label for="team"\>Team\</label\>  
          \<input type="text" id="team" placeholder="Your Team" required\>  
        \</div\>  
        \<button type="submit" class="submit-btn"\>Start Assessment\</button\>  
      \</form\>  
    \</div\>  
    \<\!-- Assessment Section \--\>  
    \<div id="assessment-section" style="display:none;"\>  
      \<div class="timer" id="timer-text"\>Elapsed Time: 00:00\</div\>  
      \<div class="question-nav" id="question-nav"\>\</div\>  
      \<form id="assessment-form" autocomplete="off"\>  
        \<div class="question-card" id="question-block"\>\</div\>  
        \<button type="button" class="next-btn" id="next-btn"\>Next\</button\>  
        \<button type="submit" class="submit-btn" id="submit-btn" style="display:none;"\>Submit\</button\>  
      \</form\>  
      \<div id="summary"\>\</div\>  
    \</div\>  
  \</div\>  
  \<script\>  
    // \--- Questions \---  
    const questions \= \[  
      { text: "Describe the capital of France." },  
      { text: "Explain why Jupiter is the largest planet." },  
      { text: "Discuss the significance of 'Hamlet'." },  
      { text: "What happens at the boiling point of water?" },  
      { text: "Describe the properties of the element with the chemical symbol 'O'." }  
    \];  
    let answers \= Array(questions.length).fill('');  
    let currentQ \= 0;  
    let timerInterval;  
    let elapsedSeconds \= 0;

    // \--- User Info Form Logic \---  
    document.getElementById('user-info-form').onsubmit \= function(e) {  
      e.preventDefault();  
      document.getElementById('user-info-section').style.display \= 'none';  
      document.getElementById('assessment-section').style.display \= '';  
      renderQuestionNav();  
      renderQuestion();  
      updateTimer();  
      timerInterval \= setInterval(() \=\> {  
        elapsedSeconds++;  
        updateTimer();  
      }, 1000);  
    };

    // \--- Assessment Logic \---  
    function renderQuestionNav() {  
      const nav \= document.getElementById('question-nav');  
      nav.innerHTML \= '';  
      questions.forEach((q, i) \=\> {  
        const btn \= document.createElement('button');  
        btn.textContent \= i \+ 1;  
        btn.className \= (i \=== currentQ) ? 'active' : '';  
        btn.onclick \= (ev) \=\> {  
          ev.preventDefault();  
          currentQ \= i;  
          renderQuestion();  
          renderQuestionNav();  
        };  
        nav.appendChild(btn);  
      });  
    }

    function renderQuestion() {  
      const q \= questions\[currentQ\];  
      let html \= \`\<div class="question-title"\>${currentQ \+ 1}. ${q.text}\</div\>\<div class="options"\>\`;  
      html \+= \`\<textarea rows="4" oninput="updateAnswer(this.value)"\>${answers\[currentQ\]}\</textarea\>\`;  
      html \+= \`\</div\>\`;  
      document.getElementById('question-block').innerHTML \= html;  
      document.getElementById('next-btn').style.display \= (currentQ \< questions.length \- 1\) ? '' : 'none';  
      document.getElementById('submit-btn').style.display \= (currentQ \=== questions.length \- 1\) ? '' : 'none';  
    }

    // Update answer  
    window.updateAnswer \= function(value) {  
      answers\[currentQ\] \= value;  
    };

    // Timer logic  
    function updateTimer() {  
      let min \= String(Math.floor(elapsedSeconds / 60)).padStart(2, '0');  
      let sec \= String(elapsedSeconds % 60).padStart(2, '0');  
      document.getElementById('timer-text').textContent \= \`Elapsed Time: ${min}:${sec}\`;  
    }

    // Next button logic  
    document.getElementById('next-btn').onclick \= function() {  
      if (currentQ \< questions.length \- 1\) {  
        currentQ++;  
        renderQuestion();  
        renderQuestionNav();  
      }  
    };

    // Assessment submission  
    document.getElementById('assessment-form').onsubmit \= function(e) {  
      e.preventDefault();  
      clearInterval(timerInterval);  
      showSummary();  
    };

    function showSummary() {  
      document.getElementById('assessment-form').style.display \= 'none';  
      let name \= document.getElementById('name').value;  
      let email \= document.getElementById('email').value;  
      let team \= document.getElementById('team').value;  
      let min \= String(Math.floor(elapsedSeconds / 60)).padStart(2, '0');  
      let sec \= String(elapsedSeconds % 60).padStart(2, '0');  
      let summary \= \`\<div class="summary"\>\<h3\>Assessment Submitted\</h3\>\`;  
      summary \+= \`\<strong\>Name:\</strong\> ${name}\<br\>\`;  
      summary \+= \`\<strong\>Email:\</strong\> ${email}\<br\>\`;  
      summary \+= \`\<strong\>Team:\</strong\> ${team}\<br\>\`;  
      summary \+= \`\<strong\>Total Time Taken:\</strong\> ${min}:${sec}\<br\>\<br\>\`;  
      questions.forEach((q, i) \=\> {  
        summary \+= \`\<b\>Q${i \+ 1}:\</b\> ${q.text}\<br\>\<b\>Your Answer:\</b\> ${answers\[i\] || "\<span style='color:\#8B3A2B'\>Not answered\</span\>"}\<br\>\<br\>\`;  
      });  
      summary \+= \`\</div\>\`;  
      document.getElementById('summary').innerHTML \= summary;  
    }  
  \</script\>  
\</body\>  
\</html\>

