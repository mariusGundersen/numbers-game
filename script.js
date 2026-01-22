const gameContainer = document.getElementById("game-container");

let level = 1;
let numbers = [];
let currentIndex = 1;
let mistakes = 0;

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

function createBoxes() {
  currentIndex = 1;
  numbers = Array.from({ length: level }, (_, i) => i + 1);
  shuffleArray(numbers);

  const direction = Math.random() * 360;

  gameContainer.innerHTML = "";
  numbers.forEach((num) => {
    const box = document.createElement("div");
    box.classList.add("box");
    box.dataset.index = num;

    for (let i = 0; i < 6; i++) {
      const side = document.createElement("div");
      side.classList.add("side");
      side.textContent = num;
      side.style.transform = `rotateX(${(i < 4 ? i : 0) * 90}deg) rotateY(${(i < 4 ? 0 : (i - 4) * 2 - 1) * 90}deg) translateZ(30px)`;
      side.style.setProperty("--mix", `${i * 10}%`);
      box.appendChild(side);
    }

    box.style.setProperty("--hue", Math.random() * 360);
    const dir = Math.random() * Math.PI * 2;
    const x = (Math.sin(dir) * num) / level;
    const y = (Math.cos(dir) * num) / level;

    box.style.left = `calc(round(down, ${x} * calc(50vw - 100px), 60px) + 50vw + 20px)`;
    box.style.top = `calc(round(down, ${y} * calc(50vh - 100px), 60px) + 50vh + 20px)`;
    // Set initial position off-screen
    box.style.transform = `rotateZ(${direction}deg) translateX(100vmax) translateZ(-50px) rotateX(${Math.random() * 3 + 2}turn) rotateY(${Math.random() * 3 + 2}turn) rotateZ(0deg)`;
    box.style.zIndex = level - num + 10;

    box.addEventListener("pointerdown", (e) => {
      e.preventDefault();
      handleBoxClick(num);
    });

    gameContainer.appendChild(box);
  });

  // Animate boxes rolling onto the screen
  setTimeout(() => {
    const boxes = document.querySelectorAll(".box");
    boxes.forEach((box, index) => {
      setTimeout(() => {
        box.style.transform = `rotateZ(${direction}deg) translateX(0) translateZ(0) rotateX(0turn) rotateY(0turn) rotateZ(${-direction + Math.random() * 20 - 10}deg)`;
      }, index * 150); // Delay each box to create a rolling effect
    });
  }, 500);
}

function handleBoxClick(index) {
  if (index === currentIndex) {
    currentIndex++;
    const box = document.querySelector(`.box[data-index="${index}"]`);
    box.classList.add("jump");
    box.addEventListener(
      "animationend",
      () => {
        box.remove();
        if (index === numbers.length) {
          if (mistakes === 0) {
            level++;
          }
          mistakes = 0;
          createBoxes();
        }
      },
      { once: true },
    );
  } else {
    mistakes++;
    const box = document.querySelector(`.box[data-index="${index}"]`);
    box.classList.add("wobble");
    setTimeout(() => {
      box.classList.remove("wobble");
    }, 500);
    if (mistakes % 3 === 0) {
      setTimeout(() => {
        const box = document.querySelector(
          `.box[data-index="${currentIndex}"]`,
        );
        box.classList.add("hint");
        setTimeout(() => {
          box.classList.remove("hint");
        }, 500);
      }, 500);
    }
  }
}

createBoxes();

// Register Service Worker
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .then((registration) => {
        console.log(
          "Service Worker registered with scope:",
          registration.scope,
        );
      })
      .catch((error) => {
        console.error("Service Worker registration failed:", error);
      });
  });
}
