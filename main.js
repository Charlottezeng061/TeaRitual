/* 
  PROJECT CONTEXT AND INTERACTION

  Tea Ritual explores dragging through a simplified Chinese tea-making ritual.
  The prototype focuses on picking up an illustrated tool, moving it towards
  another object, releasing it, and receiving feedback. It is an interaction
  study rather than a complete commercial website or an accurate tea ceremony
  simulation. Six short stages provide a context for repeating this fundamental
  action with different tools. The sequence moves leaves from canister to tongs,
  then scoop, then gaiwan, before water and serving actions become available.
*/
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

/* 
 VISUAL DESIGN

  The surrounding HTML and CSS use my hand-drawn tea tools, muted natural
  colours, and a tabletop composition. This script switches between prepared
  illustration states instead of drawing realistic liquid. Brief pauses and
  stepped CSS movement suggest stop-motion animation. 
*/
const stepNumber = document.querySelector("#step-number");
const stepTitle = document.querySelector("#step-title");
const stepInstruction = document.querySelector("#step-instruction");
const progressDots = document.querySelectorAll(".progress li");
const scene = document.querySelector(".scene");
const tongs = document.querySelector(".tongs");
const canister = document.querySelector(".canister");
const scoop = document.querySelector(".scoop");
const heldLeaves = document.querySelector(".held-leaves");
const gaiwan = document.querySelector(".gaiwan");
const kettle = document.querySelector(".kettle");
const pitcher = document.querySelector(".pitcher");

let isDragging = false;
let startX = 0;
let startY = 0;
let moveX = 0;
let moveY = 0;

/*
  GUIDANCE AND USABILITY

  One short instruction explains the current action, while numbered steps and
  circles indicate progress. Only the required tool receives the can-drag class.
  This reduces accidental actions and prevents transparent areas of inactive
  PNG images from blocking the intended tool. The guide also uses aria-current
  to identify the active step. 
*/
function updateGuide() {
  const step = steps[currentStep];

  const displayNumber = String(currentStep + 1).padStart(2, "0");
  const totalSteps = String(steps.length).padStart(2, "0");

  stepNumber.textContent = `${displayNumber} / ${totalSteps}`;
  stepTitle.textContent = step.title;
  stepInstruction.textContent = step.instruction;

  const tools = [tongs, scoop, kettle, gaiwan, pitcher];

  tools.forEach(function (tool) {
    tool.classList.remove("can-drag");
  });

  const stepTools = [
    tongs,
    tongs,
    scoop,
    kettle,
    gaiwan,
    pitcher
  ];

  stepTools[currentStep].classList.add("can-drag");

  progressDots.forEach(function (dot, index) {
    const isCurrentStep = index === currentStep;

    dot.classList.toggle("current", isCurrentStep);

    if (isCurrentStep) {
      dot.setAttribute("aria-current", "step");
    } else {
      dot.removeAttribute("aria-current");
    }
  });
}

function nextStep() {
  if (currentStep < steps.length - 1) {
    currentStep += 1;
    updateGuide();
  }
}

/* DRAGGING REFERENCES

  JavaScript.info, "Drag'n'Drop with mouse events":
  https://javascript.info/mouse-drag-and-drop
  This tutorial explains the press, move, and release pattern. This prototype
  uses pointer events rather than the tutorial's mouse-event implementation.

  MDN Web Docs, "Pointer events":
  https://developer.mozilla.org/en-US/docs/Web/API/Pointer_events
  Reference for handling mouse, touch, and pen through pointer events.

  MDN Web Docs, "Element: setPointerCapture() method":
  https://developer.mozilla.org/en-US/docs/Web/API/Element/setPointerCapture
  Reference for keeping pointer events attached to a dragged element after
  the pointer leaves its image boundary.
*/
tongs.addEventListener("pointerdown", function (event) {
  if (currentStep > 1 || isDragging || busy || event.button !== 0) return;
  event.preventDefault();

  isDragging = true;
  startX = event.clientX;
  startY = event.clientY;

  tongs.classList.add("dragging");

  if (currentStep === 0) {
    canister.classList.add("drop-target");
  } else {
    scoop.classList.add("drop-target");
  }

  tongs.setPointerCapture(event.pointerId);
});

tongs.addEventListener("pointermove", function (event) {
  if (!isDragging) return;

  moveX = event.clientX - startX;
  moveY = event.clientY - startY;

  tongs.style.transform = `translate(${moveX}px, ${moveY}px)`;

  if (!heldLeaves.hidden) {
    heldLeaves.style.transform = `translate(${moveX}px, ${moveY}px)`;
  }
});

/*
  DROP DETECTION AND ERROR RECOVERY

  MDN Web Docs, getBoundingClientRect() method:
  https://developer.mozilla.org/en-US/docs/Web/API/Element/getBoundingClientRect
  Reference for measuring element positions relative to the viewport.

  The prototype compares the dragged image centre with the target rectangle.
  A rectangular target is deliberately forgiving because precise placement is
  less important than understanding the ritual. An unsuccessful drop returns
  the tool without advancing the guide or displaying a warning. However,
  transparent margins can make the hit area differ from the visible drawing.
  Future refinement should use carefully aligned assets or custom target zones.
*/
tongs.addEventListener("pointerup", function () {
  if (!isDragging) return;

  const target = currentStep === 0 ? canister : scoop;
  const tongsBox = tongs.getBoundingClientRect();
  const targetBox = target.getBoundingClientRect();

  const centreX = tongsBox.left + tongsBox.width / 2;
  const centreY = tongsBox.top + tongsBox.height / 2;

  const isInside =
    centreX >= targetBox.left &&
    centreX <= targetBox.right &&
    centreY >= targetBox.top &&
    centreY <= targetBox.bottom;

  returnTongs();

  if (!isInside) return;

  if (currentStep === 0) {
    heldLeaves.hidden = false;
    positionLeaves();
  } else {
    heldLeaves.hidden = true;
    scoop.src = "assets/tea-scoop-filled.png";
    scoop.alt = "Tea scoop with leaves";
  }

  nextStep();
});

tongs.addEventListener("pointercancel", returnTongs);
tongs.addEventListener("lostpointercapture", returnTongs);

/* Return the tongs and remove target highlights. */
function returnTongs() {
  isDragging = false;
  moveX = 0;
  moveY = 0;

  tongs.style.transform = "";
  heldLeaves.style.transform = "";

  tongs.classList.remove("dragging");
  canister.classList.remove("drop-target");
  scoop.classList.remove("drop-target");
}

/*
  LEAF POSITIONING

  Keeping export dimensions consistent would make future state changes easier
  to maintain. The resize and image-load handlers recalculate the leaf position,
  although different viewport sizes still require practical visual testing.
*/
function positionLeaves() {
  heldLeaves.style.left =
    `${tongs.offsetLeft + tongs.offsetWidth * 0.12 -
    heldLeaves.offsetWidth * 0.5}px`;

  heldLeaves.style.top =
    `${tongs.offsetTop + tongs.offsetHeight * 0.55 -
    heldLeaves.offsetHeight * 0.57}px`;
}

window.addEventListener("resize", function () {
  if (isDragging) returnTongs();

  if (!heldLeaves.hidden) {
    positionLeaves();
  }
});

heldLeaves.addEventListener("load", function () {
  if (!heldLeaves.hidden) {
    positionLeaves();
  }
});

const cups = [
  document.querySelector(".cup-one"),
  document.querySelector(".cup-two"),
  document.querySelector(".cup-three")
];
let busy = false;
const filledCups = new Set();

/* Keep the restart option inside the guide. */
const restartButton = document.createElement("button");
restartButton.textContent = "Make tea again";
restartButton.className = "restart";
restartButton.hidden = true;

document.querySelector(".guide-box").appendChild(restartButton);

[
  "tea-scoop-empty",
  "gaiwan-with-leaves",
  "gaiwan-with-tea",
  "gaiwan-closed",
  "gaiwan-open",
  "gaiwan-pouring",
  "kettle",
  "kettle-pouring",
  "fairness-pitcher-empty",
  "fairness-pitcher-filled",
  "fairness-pitcher-pouring",
  "tea-cup-filled",
  "tea-cup-decorated-filled"
].forEach(function (name) {
  const image = new Image();
  image.src = `assets/${name}.png`;
});

function wait(time) {
  return new Promise(function (resolve) {
    setTimeout(resolve, time);
  });
}

function changeImage(element, file, description) {
  element.src = `assets/${file}.png`;
  element.alt = description;
}

/*
  REUSABLE INTERACTION AND FEEDBACK

  The remaining tools share one drag function, but each receives its own target
  and successful-drop action. A busy flag prevents new actions during the illustration changes.
  Pointer cancellation returns the tool, reducing the chance of a stranded drag.
  The common pouring offset is approximate and may need separate calibration
  for each illustration. Delays communicate progression; they do not represent
  real brewing times.
*/
function addDrag(element, stepIndex, getTargets, onSuccess) {
  let dragging = false;
  let pointerId = null;
  let startX = 0;
  let startY = 0;
  let x = 0;
  let y = 0;

  function returnHome() {
    dragging = false;
    pointerId = null;
    x = 0;
    y = 0;

    element.style.transform = "";
    element.classList.remove("dragging", "tipping", "pouring");

    document.querySelectorAll(".drop-target").forEach(function (target) {
      target.classList.remove("drop-target");
    });
  }

  element.addEventListener("pointerdown", function (event) {
    if (
      currentStep !== stepIndex ||
      busy ||
      dragging ||
      event.button !== 0
    ) {
      return;
    }

    event.preventDefault();

    dragging = true;
    pointerId = event.pointerId;
    startX = event.clientX;
    startY = event.clientY;

    element.classList.add("dragging");

    getTargets().forEach(function (target) {
      target.classList.add("drop-target");
    });

    element.setPointerCapture(pointerId);
  });

  element.addEventListener("pointermove", function (event) {
    if (!dragging || event.pointerId !== pointerId) return;

    x = event.clientX - startX;
    y = event.clientY - startY;

    element.style.transform = `translate(${x}px, ${y}px)`;
  });

  element.addEventListener("pointerup", async function (event) {
    if (!dragging || event.pointerId !== pointerId) return;

    const box = element.getBoundingClientRect();
    const centreX = box.left + box.width / 2;
    const centreY = box.top + box.height / 2;

    const target = getTargets().find(function (item) {
      const targetBox = item.getBoundingClientRect();

      return (
        centreX >= targetBox.left &&
        centreX <= targetBox.right &&
        centreY >= targetBox.top &&
        centreY <= targetBox.bottom
      );
    });

    dragging = false;
    pointerId = null;

    document.querySelectorAll(".drop-target").forEach(function (item) {
      item.classList.remove("drop-target");
    });

    if (!target) {
      returnHome();
      return;
    }

    busy = true;

    if (stepIndex >= 3) {
      const targetBox = target.getBoundingClientRect();

      const pourX =
        x + targetBox.left + targetBox.width * 0.5 -
        (box.left + box.width * 0.8);

      const pourY =
        y + targetBox.top + targetBox.height * 0.45 -
        (box.top + box.height * 0.85);

      element.style.transform = `translate(${pourX}px, ${pourY}px)`;
    }

    try {
      await onSuccess(target);
    } finally {
      returnHome();
      busy = false;
    }
  });

  element.addEventListener("pointercancel", function () {
    if (dragging) returnHome();
  });

  element.addEventListener("lostpointercapture", function () {
    if (dragging) returnHome();
  });

  window.addEventListener("resize", function () {
    if (dragging) returnHome();
  });
}

/* Step three: transfer leaves into the gaiwan. */
addDrag(scoop, 2, function () {
  return [gaiwan];
}, async function () {
  scoop.classList.add("tipping");
  await wait(500);

  changeImage(scoop, "tea-scoop-empty", "Empty tea scoop");
  changeImage(gaiwan, "gaiwan-with-leaves", "Gaiwan with tea leaves");

  nextStep();
});

/* Step four: pour water and briefly steep the tea. */
addDrag(kettle, 3, function () {
  return [gaiwan];
}, async function () {
  changeImage(kettle, "kettle-pouring", "Kettle pouring water");
  kettle.classList.add("pouring");

  await wait(850);

  changeImage(kettle, "kettle", "Kettle");
  changeImage(gaiwan, "gaiwan-with-tea", "Gaiwan with tea");

  await wait(350);

  changeImage(gaiwan, "gaiwan-closed", "Covered gaiwan");
  stepInstruction.textContent = "Let the tea steep for a moment.";

  await wait(1200);

  changeImage(gaiwan, "gaiwan-with-tea", "Steeped tea in the gaiwan");

  nextStep();
});

/* Step five: transfer the brewed tea to the pitcher. */
addDrag(gaiwan, 4, function () {
  return [pitcher];
}, async function () {
  changeImage(gaiwan, "gaiwan-pouring", "Gaiwan pouring tea");
  gaiwan.classList.add("pouring");

  await wait(850);

  changeImage(gaiwan, "gaiwan-open", "Open gaiwan");
  changeImage(
    pitcher,
    "fairness-pitcher-filled",
    "Fairness pitcher with tea"
  );

  nextStep();
});

/* Step six: fill each cup once, preserving the patterned cup. */
addDrag(pitcher, 5, function () {
  return cups.filter(function (cup) {
    return !filledCups.has(cup);
  });
}, async function (cup) {
  changeImage(
    pitcher,
    "fairness-pitcher-pouring",
    "Fairness pitcher pouring tea"
  );

  pitcher.classList.add("pouring");
  await wait(850);

  if (cup === cups[2]) {
    changeImage(
      cup,
      "tea-cup-decorated-filled",
      "Filled bamboo-patterned tea cup"
    );
  } else {
    changeImage(cup, "tea-cup-filled", "Filled tea cup");
  }

  filledCups.add(cup);

  if (filledCups.size === cups.length) {
    changeImage(pitcher, "fairness-pitcher-empty", "Empty fairness pitcher");
    finishTea();
  } else {
    changeImage(
      pitcher,
      "fairness-pitcher-filled",
      "Fairness pitcher with tea"
    );

    stepInstruction.textContent =
      `${filledCups.size} of 3 cups filled. Pour tea into the next cup.`;
  }
});

/*
  COMPLETION AND FUTURE DEVELOPMENT

  The finished setting remains visible, and restarting is offered within the
  existing guide. This preserves continuity instead of moving to a separate
  ending page. Challenges would include reliable
  pouring alignment, smaller touch targets, keyboard controls, asset loading,
  and testing with people unfamiliar with gaiwans. Short user sessions could
  reveal whether the highlighted targets and instructions are understandable.

*/
function finishTea() {
  currentStep = steps.length;
  pitcher.classList.remove("can-drag");
  stepNumber.textContent = "06 / 06";
  stepTitle.textContent = "Your tea is ready";
  stepInstruction.textContent = "Take a moment to enjoy it.";

  progressDots.forEach(function (dot) {
    dot.classList.remove("current");
    dot.classList.add("done");
    dot.removeAttribute("aria-current");
  });

  restartButton.hidden = false;
}

/* Restore the starting illustrations and guide. */
restartButton.addEventListener("click", function () {
  if (busy) return;

  returnTongs();
  heldLeaves.hidden = true;
  filledCups.clear();
  currentStep = 0;

  changeImage(scoop, "tea-scoop-empty", "Empty tea scoop");
  changeImage(gaiwan, "gaiwan-open", "Open gaiwan");
  changeImage(kettle, "kettle", "Kettle");
  changeImage(pitcher, "fairness-pitcher-empty", "Empty fairness pitcher");

  changeImage(cups[0], "tea-cup-empty", "Empty tea cup one");
  changeImage(cups[1], "tea-cup-empty", "Empty tea cup two");
  changeImage(
    cups[2],
    "tea-cup-decorated",
    "Empty bamboo-patterned tea cup"
  );

  progressDots.forEach(function (dot) {
    dot.classList.remove("done");
  });

  restartButton.hidden = true;
  updateGuide();
});

updateGuide();

/*
  Background music:
  "Chinese Bamboo Flute & Guzheng – Relaxing Zen Music"
  by ChineseZenMusic, via Pixabay.
  Used under the Pixabay Content License.

  https://pixabay.com/music/china-chinese-bamboo-flute-amp-guzheng-relaxing-zen-music-618302/
*/

const backgroundMusic = document.querySelector("#background-music");
const musicButton = document.querySelector(".music-button");
const musicIcon = document.querySelector("#music-icon");

const musicDialog = document.querySelector(".music-dialog");
const enterMusic = document.querySelector("#enter-music");
const enterQuiet = document.querySelector("#enter-quiet");

backgroundMusic.volume = 0.15;

/* Match the icon and accessible label to the playback state. */
function updateMusicControl() {
  const isPlaying = !backgroundMusic.paused;

  musicIcon.src = isPlaying
    ? "assets/music.png"
    : "assets/music-off.png";

  musicButton.setAttribute("aria-pressed", String(isPlaying));
  musicButton.setAttribute(
    "aria-label",
    isPlaying ? "Pause background music" : "Play background music"
  );
}

/* Start music after the visitor chooses to enter with sound. */
enterMusic.addEventListener("click", async function () {
  try {
    await backgroundMusic.play();
    musicDialog.close();
  } catch (error) {
    enterMusic.textContent = "Try music again";
    console.error("Background music could not play:", error);
  }
});

/* Enter without sound and leave the music control available. */
enterQuiet.addEventListener("click", function () {
  backgroundMusic.pause();
  musicDialog.close();
});

/* Allow music to be switched on or off after entering. */
musicButton.addEventListener("click", async function () {
  if (backgroundMusic.paused) {
    try {
      await backgroundMusic.play();
    } catch (error) {
      console.error("Background music could not play:", error);
    }
  } else {
    backgroundMusic.pause();
  }
});

backgroundMusic.addEventListener("play", updateMusicControl);
backgroundMusic.addEventListener("pause", updateMusicControl);

/* Return focus to the music control after the welcome message closes. */
musicDialog.addEventListener("close", function () {
  musicButton.focus();
});

updateMusicControl();
musicDialog.showModal();

const infoButton = document.querySelector(".info-button");
const infoDialog = document.querySelector("#info-dialog");
const infoClose = document.querySelector(".info-close");

/* Display the introduction when the info icon is selected. */
infoButton.addEventListener("click", function () {
  infoDialog.showModal();
});

/* Close the introduction without changing the tea-making progress. */
infoClose.addEventListener("click", function () {
  infoDialog.close();
});

/* Return focus to the icon after closing the panel. */
infoDialog.addEventListener("close", function () {
  infoButton.focus();
});