const $ = id => document.getElementById(id);

let quiz = [];
let current = 0;
let score = 0;
let answered = false;
let missed = [];

function uniqueValues(key) {
  return [...new Set(questions.map(q => q[key]))].sort();
}

function fillSubjects() {
  const subjects = ["All", ...uniqueValues("subject")];
  $("subjectSelect").innerHTML = subjects.map(s => `<option>${s}</option>`).join("");
  updateModules();
}

function updateModules() {
  const subject = $("subjectSelect").value;
  const modules = [...new Set(
    questions.filter(q => subject === "All" || q.subject === subject).map(q => q.module)
  )].sort();
  $("moduleSelect").innerHTML = ["All", ...modules].map(m => `<option>${m}</option>`).join("");
}

$("subjectSelect").addEventListener("change", updateModules);

function shuffle(array) {
  return [...array].sort(() => Math.random() - 0.5);
}

$("startBtn").addEventListener("click", startQuiz);
$("againBtn").addEventListener("click", () => {
  $("resultScreen").classList.add("hidden");
  $("setupScreen").classList.remove("hidden");
});
$("restartBtn").addEventListener("click", () => location.reload());

function startQuiz() {
  const subject = $("subjectSelect").value;
  const module = $("moduleSelect").value;
  const count = Number($("countSelect").value);

  const pool = questions.filter(q =>
    (subject === "All" || q.subject === subject) &&
    (module === "All" || q.module === module)
  );

  quiz = shuffle(pool).slice(0, Math.min(count, pool.length));
  if (!quiz.length) {
    alert("No questions match those filters yet.");
    return;
  }

  current = 0;
  score = 0;
  missed = [];
  $("setupScreen").classList.add("hidden");
  $("resultScreen").classList.add("hidden");
  $("quizScreen").classList.remove("hidden");
  showQuestion();
}

function showQuestion() {
  answered = false;
  const q = quiz[current];

  $("progressText").textContent = `Question ${current + 1} / ${quiz.length}`;
  $("scoreText").textContent = `Score: ${score}`;
  $("progressBar").style.width = `${(current / quiz.length) * 100}%`;
  $("subjectBadge").textContent = `${q.subject} • ${q.module}`;
  $("difficultyBadge").textContent = q.difficulty;
  $("questionText").textContent = q.question;
  $("feedback").classList.add("hidden");
  $("nextBtn").classList.add("hidden");

  $("options").innerHTML = q.options.map((option, i) =>
    `<button class="option" data-index="${i}">
      <b>${String.fromCharCode(65 + i)}.</b> ${option}
    </button>`
  ).join("");

  document.querySelectorAll(".option").forEach(btn =>
    btn.addEventListener("click", () => chooseAnswer(Number(btn.dataset.index)))
  );
}

function chooseAnswer(selected) {
  if (answered) return;
  answered = true;

  const q = quiz[current];
  const buttons = document.querySelectorAll(".option");
  buttons.forEach(b => b.classList.add("disabled"));

  if (selected === q.answer) {
    score++;
    buttons[selected].classList.add("correct");
    $("feedback").innerHTML = `<b>Correct!</b><br>${q.explanation}<br><br><b>Reference:</b> ${q.reference}`;
  } else {
    buttons[selected].classList.add("wrong");
    buttons[q.answer].classList.add("correct");
    missed.push({ q, selected });
    $("feedback").innerHTML =
      `<b>Incorrect.</b><br><b>Correct answer:</b> ${q.options[q.answer]}<br><br>${q.explanation}<br><br><b>Reference:</b> ${q.reference}`;
  }

  $("feedback").classList.remove("hidden");
  $("nextBtn").textContent = current === quiz.length - 1 ? "See Results" : "Next Question";
  $("nextBtn").classList.remove("hidden");
  $("scoreText").textContent = `Score: ${score}`;
  $("progressBar").style.width = `${((current + 1) / quiz.length) * 100}%`;
}

$("nextBtn").addEventListener("click", () => {
  if (current < quiz.length - 1) {
    current++;
    showQuestion();
  } else {
    showResults();
  }
});

function showResults() {
  $("quizScreen").classList.add("hidden");
  $("resultScreen").classList.remove("hidden");

  const percent = Math.round((score / quiz.length) * 100);
  $("finalPercent").textContent = `${percent}%`;
  $("resultSummary").textContent =
    `You scored ${score} out of ${quiz.length}. ${missed.length} question(s) need review.`;

  $("reviewList").innerHTML = missed.length
    ? `<h3>Review incorrect questions</h3>` + missed.map(({q}) =>
        `<div class="review-item">
          <b>${q.question}</b><br>
          <span>Correct: ${q.options[q.answer]}</span><br>
          <small>${q.explanation}</small>
        </div>`
      ).join("")
    : "<p>Excellent — you got every question correct!</p>";
}

fillSubjects();
