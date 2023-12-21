(() => {
  const gameScreen = document.getElementById('screen');
  spawnBlock(gameScreen);

  function spawnBlock(screen) {
    let paused = false;
    let nextBlock = createNextBlockElement();
    screen.appendChild(nextBlock);

    const fallingState = setInterval(() => {
      if (paused) return;
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
    }, 100);

    //listen to the keyboard input for moving the block
    const keydownListener = (e) => {
      if (e.code === 'Space') {
        // pause the falling
        paused = !paused;
      }

      if (!nextBlock || paused) return;

      const left = parseInt(nextBlock.style.left);
      if (e.code === 'ArrowLeft') {
        if (left > 0) {
          nextBlock.style.left = `${left - 40}px`;
        }
      } else if (e.code === 'ArrowRight') {
        if (left < 720) {
          nextBlock.style.left = `${left + 40}px`;
        }
      }
    };

    document.addEventListener('keydown', keydownListener);

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
  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i];
    const top = parseInt(block.style.top);
    if (!rows[top]) {
      rows[top] = [];
    }
    rows[top].push(block);
  }

  for (let row in rows) {
    if (rows[row].length > 9) {
      increaseScore();
      const blocksAbove = document.getElementsByClassName('block');
      rows[row].forEach(block => block.remove());
      [...blocksAbove].forEach(block => moveOneRowDown(block, row));
    }
  }
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
  nextBlock.style.top = '0px';
  nextBlock.style.left = `${left}px`;
  return nextBlock;
}

function getLeftValue() {
  const possibleLeft = [0, 40, 80, 120, 160, 200, 240, 280, 320, 360, 400, 440, 480, 520, 560, 600, 640, 680, 720];
  return possibleLeft[Math.floor(Math.random() * possibleLeft.length)];
}

