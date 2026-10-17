/* Tea-making steps shown in the guide. */
const steps = [
  {
    title: "Pick tea leaves",
    instruction: "Drag the tea tongs to the canister to pick up leaves."
  },
  {
    title: "Fill scoop",
    instruction: "Place the tea leaves from the tongs into the tea scoop."
  },
  {
    title: "Add tea",
    instruction: "Drag the filled tea scoop to the gaiwan to tip in the leaves."
  },
  {
    title: "Pour water",
    instruction: "Drag the kettle towards the gaiwan."
  },
  {
    title: "Pour tea",
    instruction: "Drag the gaiwan towards the fairness pitcher."
  },
  {
    title: "Serve",
    instruction: "Drag the pitcher to each of the three tea cups."
  }
];

let currentStep = 0;

const stepNumber = document.querySelector("#step-number");
const stepTitle = document.querySelector("#step-title");
const stepInstruction = document.querySelector("#step-instruction");
const progressDots = document.querySelectorAll(".progress li");

/* Update the guide text and highlight the current step. */
function updateGuide() {
  const step = steps[currentStep];

  const displayNumber = String(currentStep + 1).padStart(2, "0");
  const totalSteps = String(steps.length).padStart(2, "0");

  stepNumber.textContent = `${displayNumber} / ${totalSteps}`;
  stepTitle.textContent = step.title;
  stepInstruction.textContent = step.instruction;

  progressDots.forEach((dot, index) => {
    const isCurrentStep = index === currentStep;

    dot.classList.toggle("current", isCurrentStep);

    /* Mark the active step for screen readers. */
    if (isCurrentStep) {
      dot.setAttribute("aria-current", "step");
    } else {
      dot.removeAttribute("aria-current");
    }
  });
}

/* This will be called after a successful drop. */
function nextStep() {
  if (currentStep < steps.length - 1) {
    currentStep += 1;
    updateGuide();
  }
}

/* Show the first step when the page loads. */
updateGuide();