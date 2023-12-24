
// Old code. use tetris-game.js instead

(() => {
  const gameScreen = document.getElementById('screen');
  const DEFAULT_CLOCK_SPEED = 300;
  const FAST_CLOCK_SPEED = 50;
  spawnBlock(gameScreen);

  function spawnBlock(screen) {
    let paused = false;
    let counter = DEFAULT_CLOCK_SPEED;
    let nextBlock = createNextBlockElement();
    screen.appendChild(nextBlock);
    let fallingState = animateFallingBlock();

    const keydownListener = (e) => {
      if (e.code === 'Space') {
        paused = !paused;
      }

      if (!nextBlock || paused || !fallingState) return;

      const left = parseInt(nextBlock.style.left);

      switch (e.code) {
        case 'ArrowLeft':
          e.preventDefault();
          if (left > 0) {
            nextBlock.style.left = `${left - 40}px`;
          }
          break;
        case 'ArrowRight':
          e.preventDefault();
          if (left < 720) {
            nextBlock.style.left = `${left + 40}px`;
          }
          break;
        case 'ArrowDown':
          e.preventDefault();
          if (counter === FAST_CLOCK_SPEED) return;
          clearInterval(fallingState);
          counter = FAST_CLOCK_SPEED;
          fallingState = animateFallingBlock();
          break;
        default:
          break;
      }
    };

    const keyupListener = (e) => {
      if (e.code === 'ArrowDown' && fallingState) {
        clearInterval(fallingState);
        counter = DEFAULT_CLOCK_SPEED;
        fallingState = animateFallingBlock();
      }
    }

    document.addEventListener('keydown', keydownListener);
    document.addEventListener('keyup', keyupListener);

    function animateFallingBlock() {
      return setInterval(() => {
        if (paused || !nextBlock) return;
        const top = parseInt(nextBlock.style.top);
        const blocks = document.getElementsByClassName('block');

        [...blocks].filter(block => block !== nextBlock).forEach(block => {
          if (isTouchingAnotherBlockBelow(top, block, nextBlock)) {
            stopFallingState(blocks);
            return;
          }
        });

        if (isAtBottomOfScreen(top, screen, nextBlock)) {
          stopFallingState(blocks);
          return;
        }

        if (nextBlock)
          nextBlock.style.top = `${top + 40}px`;
      }, counter);
    }

    function stopFallingState(blocks) {
      checkIfRowIsFull(blocks);
      nextBlock = null;
      spawnBlock(screen);
      clearInterval(fallingState);
    }
  }

})();

function checkIfRowIsFull(blocks) {
  const rows = {};

  [...blocks].forEach(block => {
    const top = parseInt(block.style.top);
    if (!rows[top]) {
      rows[top] = [];
    }
    rows[top].push(block);
  });

  for (let row in rows) {
    const currentRow = rows[row];
    const rowWidth = [...currentRow]
      .map(block => block.offsetWidth)
      .reduce((totalWidth, currentBlockWidth) => totalWidth + currentBlockWidth, 0);

    if (rowWidth >= 800) {
      updateScoreAndRemoveFullRow(currentRow, row);
    }
  }
}

function updateScoreAndRemoveFullRow(currentRow, row) {
  increaseScore();
  currentRow.forEach(block => block.classList.add('full-row'));
  setTimeout(() => {
    const blocksAbove = document.getElementsByClassName('block');
    currentRow.forEach(block => block.remove());
    [...blocksAbove].forEach(block => moveOneRowDown(block, row));
  }, 300);
}

function increaseScore() {
  const score = document.getElementById('score');
  const currentScore = parseInt(score.innerText);
  score.innerText = currentScore + 10;
}

function moveOneRowDown(block, row) {
  const top = parseInt(block.style.top);
  if (top < row) {
    block.style.top = `${top + 80}px`;
  }
}

function isAtBottomOfScreen(top, screen, nextBlock) {
  return nextBlock && top >= (screen.offsetHeight - nextBlock.offsetHeight);
}

function isTouchingAnotherBlockBelow(top, block, nextBlock) {
  if (!nextBlock) return false;
  const blockTop = parseInt(block.style.top);
  const blockLeft = parseInt(block.style.left);
  return blockTop === top + block.offsetHeight
    && ((parseInt(nextBlock.style.left) >= blockLeft && parseInt(nextBlock.style.left) < blockLeft + block.offsetWidth)
      || (parseInt(nextBlock.style.left) + nextBlock.offsetWidth > blockLeft && parseInt(nextBlock.style.left) < blockLeft));
}

function createNextBlockElement() {
  const left = getLeftValue();
  let nextBlock = document.createElement('div');
  nextBlock.classList.add('block');
  // randomly choose color
  const colors = ['variant1', 'variant2', 'variant3', 'variant4', 'variant5'];
  const color = colors[Math.floor(Math.random() * colors.length)];

  // randomly choose block type
  const blockTypes = ['square', 'line'];
  const blockType = blockTypes[Math.floor(Math.random() * blockTypes.length)];

  // not working as of now
  //nextBlock.classList.add(color, blockType);
  nextBlock.classList.add(color);
  nextBlock.style.top = '-40px';
  nextBlock.style.left = `${left}px`;
  return nextBlock;
}

function getLeftValue() {
  const possibleLeft = [0, 40, 80, 120, 160, 200, 240, 280, 320, 360, 400, 440, 480, 520, 560, 600, 640, 680, 720];
  return possibleLeft[Math.floor(Math.random() * possibleLeft.length)];
}

