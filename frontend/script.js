let score = 0;
let totalQuestions = 10;
let currentRole = "";
let completedQuestions = [];
let loadedQuestions = [];

async function generateQuestions() {
    const role = document.getElementById("role").value;
    currentRole = role;
    const container = document.getElementById("questions");

    score = 0;
    completedQuestions = [];
    document.getElementById("progress-bar").style.width = "0%";
    document.getElementById("progress-container").style.display = "none";
    totalQuestions = 10;
    document.getElementById("score").innerText = "Score: 0/10";
    document.getElementById("summary").innerText = "Performance: Not Started";
    document.getElementById("completed-count").innerText = "Questions Completed: 0";
    document.getElementById("feedback").innerHTML = "";

    container.innerHTML = "Loading questions...";

    try {
        const response = await fetch(
            `http://127.0.0.1:5000/questions/${encodeURIComponent(role)}`
        );

        if (!response.ok) throw new Error(`HTTP error ${response.status}`);

        const data = await response.json();
        loadedQuestions = data.questions || [];
        totalQuestions = loadedQuestions.length || 1;

        container.innerHTML = "";

        loadedQuestions.forEach(item => {
            const card = document.createElement("div");
            card.className = "question-card";

            card.innerHTML = `
                <h3>${item.question}</h3>
                <p>Difficulty: ${item.difficulty}</p>
                <button type="button" class="show-answer-btn">Show Answer</button>
                <p class="answer-text" style="display:none;">${item.answer}</p>
                <button type="button" class="complete-btn">Mark as Completed</button>
            `;

            const showAnswerButton = card.querySelector(".show-answer-btn");
            const answerText = card.querySelector(".answer-text");
            const completeButton = card.querySelector(".complete-btn");

            showAnswerButton.addEventListener("click", () => {
                const isVisible = answerText.style.display === "block";
                answerText.style.display = isVisible ? "none" : "block";
                showAnswerButton.textContent = isVisible ? "Show Answer" : "Hide Answer";
            });

            completeButton.addEventListener("click", () => {
                if (completeButton.disabled) {
                    return;
                }

                markCompleted(item.question);
                completeButton.disabled = true;
                completeButton.textContent = "Completed";
            });

            container.appendChild(card);
        });
    } catch (error) {
        container.innerHTML = "Failed to load questions.";
        console.error(error);
    }
}

function markCompleted(questionText) {
    document.getElementById("progress-container").style.display = "block";

    score++;
    completedQuestions.push(questionText);
    document.getElementById("score").innerText = "Score: " + score + "/10";
    document.getElementById("completed-count").innerText =
        "Questions Completed: " + score;

    const percentage =
        (score / totalQuestions) * 100;
    document.getElementById("progress-bar").style.width = percentage + "%";

    const summary =
        document.getElementById("summary");

    if(score >= 8){

        summary.innerText =
            "Performance: Excellent ⭐";

    }
    else if(score >= 5){

        summary.innerText =
            "Performance: Good 👍";

    }
    else{

        summary.innerText =
            "Performance: Keep Practicing 📚";

    }

    updateFeedback();
}

function updateFeedback() {
    const strengths = getStrengths(currentRole, completedQuestions);
    const areas = getAreasToImprove(currentRole, completedQuestions);
    const feedback = document.getElementById("feedback");

    feedback.innerHTML = `
        <div class="feedback-block">
            <strong>Strengths:</strong>
            <ul>${strengths.map(item => `<li>✓ ${item}</li>`).join("")}</ul>
        </div>
        <div class="feedback-block">
            <strong>Areas to Improve:</strong>
            <ul>${areas.map(item => `<li>• ${item}</li>`).join("")}</ul>
        </div>
    `;
}

function getStrengths(role, answers) {
    const completedText = answers.join(" ").toLowerCase();

    if (role === "Machine Learning Intern") {
        const strengths = [];

        if (completedText.includes("machine learning") || completedText.includes("overfitting")) {
            strengths.push("Machine Learning Basics");
        }
        if (completedText.includes("cross validation") || completedText.includes("confusion matrix")) {
            strengths.push("Model Evaluation");
        }

        return strengths.length ? strengths : ["Analytical Thinking"];
    }

    if (role === "Python Developer") {
        return completedText.includes("python")
            ? ["Python Fundamentals"]
            : ["Problem Solving"];
    }

    if (role === "Data Science Intern") {
        return completedText.includes("data")
            ? ["Data Handling"]
            : ["Analytical Thinking"];
    }

    if (role === "Frontend Developer") {
        return completedText.includes("dom") || completedText.includes("css")
            ? ["Frontend Fundamentals"]
            : ["UI Awareness"];
    }

    if (role === "DevOps Intern") {
        return completedText.includes("docker") || completedText.includes("ci/cd")
            ? ["DevOps Fundamentals"]
            : ["System Thinking"];
    }

    return completedText.includes("oop")
        ? ["Software Engineering Basics"]
        : ["Core Engineering Mindset"];
}

function getAreasToImprove(role) {
    const roleAreas = {
        "Machine Learning Intern": ["Cross Validation", "Regularization"],
        "Data Science Intern": ["Hypothesis Testing", "Normalization"],
        "Python Developer": ["Decorators", "Context Managers"],
        "Software Engineering Intern": ["RESTful APIs", "Design Patterns"],
        "Frontend Developer": ["Event Delegation", "HTML5"],
        "DevOps Intern": ["Infrastructure as Code", "Monitoring and Logging"]
    };

    return roleAreas[role] || ["Advanced Problem Solving", "System Design"];
}

function exportQuestionsToPDF() {
    if (!loadedQuestions.length) {
        alert("Generate questions first before downloading the PDF.");
        return;
    }

    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF();
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 14;
    const contentWidth = pageWidth - margin * 2;
    let y = 16;

    const summaryText = document.getElementById("summary").innerText;
    const scoreText = `Score: ${score}/${totalQuestions}`;
    const completedText = `Questions Completed: ${score}`;

    const writeLine = (text, options = {}) => {
        const lines = pdf.splitTextToSize(text, contentWidth);
        pdf.text(lines, margin, y, options);
        y += lines.length * 7;
    };

    const addFooter = (pageNumber) => {
        pdf.setFontSize(9);
        pdf.setTextColor(120, 120, 120);
        pdf.text(`Generated by AI Interview Assistant`, margin, pageHeight - 8);
        pdf.text(`Page ${pageNumber}`, pageWidth - margin, pageHeight - 8, { align: "right" });
        pdf.setTextColor(0, 0, 0);
    };

    const addPageHeader = (title, subtitle) => {
        pdf.setFillColor(31, 111, 235);
        pdf.rect(0, 0, pageWidth, 28, "F");
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(15);
        pdf.text(title, margin, 12);
        pdf.setFontSize(10);
        pdf.text(subtitle, margin, 20);
        pdf.setTextColor(0, 0, 0);
        y = 38;
    };

    // Cover page
    pdf.setFillColor(248, 251, 255);
    pdf.rect(0, 0, pageWidth, pageHeight, "F");
    pdf.setFillColor(31, 111, 235);
    pdf.roundedRect(18, 24, pageWidth - 36, 44, 4, 4, "F");
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(20);
    pdf.text("AI Interview Assistant", pageWidth / 2, 42, { align: "center" });
    pdf.setFontSize(11);
    pdf.text("Interview Study Pack", pageWidth / 2, 52, { align: "center" });
    pdf.setTextColor(0, 0, 0);

    pdf.setFontSize(13);
    pdf.text("Interview Summary", margin, 90);
    pdf.setDrawColor(31, 111, 235);
    pdf.setLineWidth(0.8);
    pdf.line(margin, 94, pageWidth - margin, 94);

    pdf.setFontSize(12);
    y = 108;
    writeLine(`Role: ${currentRole}`);
    writeLine(scoreText);
    writeLine(`Performance: ${summaryText}`);
    writeLine(completedText);

    pdf.addPage();
    addPageHeader("Questions and Answers", `Role: ${currentRole}`);

    pdf.setFontSize(11);
    loadedQuestions.forEach((item, index) => {
        const questionLines = pdf.splitTextToSize(`${index + 1}. ${item.question}`, contentWidth);
        const answerLines = pdf.splitTextToSize(item.answer, contentWidth);
        const blockHeight = questionLines.length * 5 + answerLines.length * 5 + 28;

        if (y + blockHeight > pageHeight - 18) {
            pdf.addPage();
            addPageHeader("Questions and Answers", `Role: ${currentRole}`);
        }

        pdf.setFillColor(238, 245, 255);
        pdf.roundedRect(margin, y - 4, contentWidth, blockHeight - 4, 3, 3, "F");

        pdf.setFillColor(31, 111, 235);
        pdf.roundedRect(margin + 3, y, contentWidth - 6, 7, 2, 2, "F");
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(10);
        pdf.text(`Question ${index + 1}`, margin + 6, y + 5);

        y += 14;
        pdf.setTextColor(0, 0, 0);
        pdf.setFontSize(11);
        pdf.text(`Difficulty: ${item.difficulty}`, margin + 4, y);
        y += 8;

        pdf.setFont(undefined, "bold");
        pdf.text(questionLines, margin + 4, y);
        y += questionLines.length * 5 + 4;

        pdf.setFont(undefined, "normal");
        pdf.setTextColor(60, 60, 60);
        pdf.text("Answer:", margin + 4, y);
        y += 6;
        pdf.text(answerLines, margin + 4, y);
        y += answerLines.length * 5 + 12;

        pdf.setTextColor(0, 0, 0);
    });

    const pageCount = pdf.getNumberOfPages();
    for (let pageNumber = 1; pageNumber <= pageCount; pageNumber++) {
        pdf.setPage(pageNumber);
        addFooter(pageNumber);
    }

    pdf.save(`${currentRole || "interview"}-questions.pdf`);
}
