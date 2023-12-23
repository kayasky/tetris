class TetrisGame extends HTMLElement {
  static DEFAULT_CLOCK_SPEED = 300
  static FAST_CLOCK_SPEED = 50;
  currentClockSpeed = this.DEFAULT_CLOCK_SPEED;
  paused = false;
  nextBlock;

  constructor() {
    super();
  }
  connectedCallback() {
    const shadow = this.attachShadow({ mode: "open" });
    const styles = document.createElement("link");
    styles.setAttribute("rel", "stylesheet");
    styles.setAttribute("href", "./tetris-component.css");
    shadow.appendChild(styles);
    const gameArea = document.createElement("div");
    const gameScreen = document.createElement("div");
    gameScreen.classList.add('screen');
    gameArea.innerHTML = `
      <h1 class="game-title">TETRIS</h1>
      <h1 class="score-label">Score <span id="score">0</span></h1>`;
    shadow.appendChild(gameArea);
    shadow.appendChild(gameScreen);
    this.spawnBlock(gameScreen);
  }

  spawnBlock(screen) {
    this.nextBlock = this.createNextBlockElement();
    screen.appendChild(this.nextBlock);
    this.fallingStateInterval = this.animateFallingBlock();

    const keydownListener = (e) => {
      if (e.code === 'Space') {
        this.paused = !this.paused;
      }

      if (!this.nextBlock || this.paused || !this.fallingStateInterval) return;

      const left = parseInt(this.nextBlock.style.left);

      switch (e.code) {
        case 'ArrowLeft':
          e.preventDefault();
          if (left > 0) {
            this.nextBlock.style.left = `${left - 40}px`;
          }
          break;
        case 'ArrowRight':
          e.preventDefault();
          if (left < 720) {
            this.nextBlock.style.left = `${left + 40}px`;
          }
          break;
        case 'ArrowDown':
          e.preventDefault();
          if (this.currentClockSpeed === this.FAST_CLOCK_SPEED) return;
          clearInterval(this.fallingStateInterval);
          this.currentClockSpeed = this.FAST_CLOCK_SPEED;
          this.fallingStateInterval = this.animateFallingBlock();
          break;
        default:
          break;
      }
    };

    const keyupListener = (e) => {
      if (e.code === 'ArrowDown' && this.fallingStateInterval) {
        clearInterval(this.fallingStateInterval);
        this.currentClockSpeed = this.DEFAULT_CLOCK_SPEED;
        this.fallingStateInterval = this.animateFallingBlock();
      }
    }

    document.addEventListener('keydown', keydownListener);
    document.addEventListener('keyup', keyupListener);
  }

  animateFallingBlock() {
    return setInterval(() => {
      if (this.paused || !this.nextBlock) return;
      const top = parseInt(this.nextBlock.style.top);
      const blocks = document.getElementsByClassName('block');

      [...blocks].filter(block => block !== this.nextBlock).forEach(block => {
        if (this.isTouchingAnotherBlockBelow(top, block, this.nextBlock)) {
          this.stopFallingState(blocks);
          return;
        }
      });

      if (this.isAtBottomOfScreen(top, screen, this.nextBlock)) {
        this.stopFallingState(blocks);
        return;
      }

      if (this.nextBlock)
        this.nextBlock.style.top = `${top + 40}px`;
    }, this.currentClockSpeed);
  }

  stopFallingState(blocks) {
    this.checkIfRowIsFull(blocks);
    this.nextBlock = null;
    this.spawnBlock(screen);
    clearInterval(this.fallingStateInterval);
  }

  checkIfRowIsFull(blocks) {
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
        this.updateScoreAndRemoveFullRow(currentRow, row);
      }
    }
  }

  updateScoreAndRemoveFullRow(currentRow, row) {
    this.increaseScore();
    currentRow.forEach(block => block.classList.add('full-row'));
    setTimeout(() => {
      const blocksAbove = document.getElementsByClassName('block');
      currentRow.forEach(block => block.remove());
      [...blocksAbove].forEach(block => this.moveOneRowDown(block, row));
    }, 300);
  }

  increaseScore() {
    const score = document.getElementById('score');
    const currentScore = parseInt(score.innerText);
    score.innerText = currentScore + 10;
  }

  moveOneRowDown(block, row) {
    const top = parseInt(block.style.top);
    if (top < row) {
      block.style.top = `${top + 80}px`;
    }
  }

  isAtBottomOfScreen(top, screen, nextBlock) {
    return nextBlock && top >= (screen.offsetHeight - nextBlock.offsetHeight);
  }

  isTouchingAnotherBlockBelow(top, block, nextBlock) {
    if (!nextBlock) return false;
    const blockTop = parseInt(block.style.top);
    const blockLeft = parseInt(block.style.left);
    return blockTop === top + block.offsetHeight
      && ((parseInt(nextBlock.style.left) >= blockLeft && parseInt(nextBlock.style.left) < blockLeft + block.offsetWidth)
        || (parseInt(nextBlock.style.left) + nextBlock.offsetWidth > blockLeft && parseInt(nextBlock.style.left) < blockLeft));
  }

  createNextBlockElement() {
    const left = this.getLeftValue();
    let newBlock = document.createElement('div');
    newBlock.classList.add('block');
    // randomly choose color
    const colors = ['variant1', 'variant2', 'variant3', 'variant4', 'variant5'];
    const color = colors[Math.floor(Math.random() * colors.length)];

    // randomly choose block type
    const blockTypes = ['square', 'line'];
    const blockType = blockTypes[Math.floor(Math.random() * blockTypes.length)];

    // not working as of now
    //nextBlock.classList.add(color, blockType);
    newBlock.classList.add(color);
    newBlock.style.top = '-40px';
    newBlock.style.left = `${left}px`;
    return newBlock;
  }

  getLeftValue() {
    const possibleLeft = [0, 40, 80, 120, 160, 200, 240, 280, 320, 360, 400, 440, 480, 520, 560, 600, 640, 680, 720];
    return possibleLeft[Math.floor(Math.random() * possibleLeft.length)];
  }

}

customElements.define("tetris-game", TetrisGame);
