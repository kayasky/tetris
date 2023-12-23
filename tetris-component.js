
(function (w) {
  var oldST = w.setTimeout;
  var oldSI = w.setInterval;
  var oldCI = w.clearInterval;
  var timers = [];
  w.timers = timers;
  w.setTimeout = function (fn, delay) {
    var id = oldST(function () {
      fn && fn();
      removeTimer(id);
    }, delay);
    timers.push(id);
    return id;
  };
  w.setInterval = function (fn, delay) {
    var id = oldSI(fn, delay);
    timers.push(id);
    return id;
  };
  w.clearInterval = function (id) {
    oldCI(id);
    removeTimer(id);
  };
  w.clearTimeout = w.clearInterval;

  function removeTimer(id) {
    var index = timers.indexOf(id);
    if (index >= 0)
      timers.splice(index, 1);
  }
}(window));

class TetrisGame extends HTMLElement {
  currentClockSpeed = 300;
  paused = false;
  isAccelerating = false;
  nextBlock;
  gameCanvas;
  shadow;
  fallingStateInterval;

  constructor() {
    super();
  }

  connectedCallback() {
    console.log('connected')
    this.shadow = this.attachShadow({ mode: "open" });
    const styles = document.createElement("link");
    styles.setAttribute("rel", "stylesheet");
    styles.setAttribute("href", "./tetris-component.css");
    this.shadow.appendChild(styles);
    const gameContainer = document.createElement("div");
    this.gameCanvas = document.createElement("div");
    this.gameCanvas.classList.add('game-canvas');
    gameContainer.innerHTML = `
      <h1 class="game-title">TETRIS</h1>
      <h1 class="score-label">Score <span id="score">0</span></h1>`;
    this.shadow.appendChild(gameContainer);
    this.shadow.appendChild(this.gameCanvas);
    this.spawnBlock();
    document.addEventListener('keydown', this.keydownListener.bind(this));
    document.addEventListener('keyup', this.keyupListener.bind(this));
  }

  spawnBlock() {
    this.nextBlock = this.createNextBlockElement();
    this.gameCanvas.appendChild(this.nextBlock);
    this.fallingStateInterval = this.animateFallingBlock(300);
  }

  keydownListener(e) {
    if (e.code === 'Space') {
      this.paused = !this.paused;
    }

    if (!this.nextBlock || this.paused) return;

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
        if (this.isAccelerating) return;
        console.log({ intervalId: this.fallingStateInterval });
        clearInterval(this.fallingStateInterval);
        this.isAccelerating = true;
        this.fallingStateInterval = this.animateFallingBlock(50);
        break;
      default:
        break;
    }
  };

  keyupListener(e) {
    if (e.code === 'ArrowDown') {
      console.log({ intervalId: this.fallingStateInterval });
      clearInterval(this.fallingStateInterval);
      this.isAccelerating = false
      this.fallingStateInterval = this.animateFallingBlock(300);
    }
  }

  animateFallingBlock(clockSpeed) {
    return setInterval(() => {
      if (this.paused || !this.nextBlock) return;
      const top = parseInt(this.nextBlock.style.top);
      const blocks = this.shadow.querySelectorAll('.block');
      [...blocks].filter(block => block !== this.nextBlock).forEach(block => {
        if (this.isTouchingAnotherBlockBelow(top, block, this.nextBlock)) {
          this.stopFallingState(blocks);
          return;
        }
      });

      if (this.isAtBottomOfGameCanvas(top, this.nextBlock)) {
        this.stopFallingState(blocks);
        return;
      }

      if (this.nextBlock)
        this.nextBlock.style.top = `${top + 40}px`;
    }, clockSpeed);
  }

  stopFallingState(blocks) {
    this.nextBlock = null;
    clearInterval(this.fallingStateInterval);
    this.checkIfRowIsFull(blocks);
    this.spawnBlock();
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
      const blocksAbove = this.shadowRoot.querySelectorAll('.block');
      currentRow.forEach(block => block.remove());
      [...blocksAbove].forEach(block => this.moveOneRowDown(block, row));
    }, 300);
  }

  increaseScore() {
    const score = this.shadowRoot.querySelectorAll('#score');
    const currentScore = parseInt(score.innerText);
    score.innerText = currentScore + 10;
  }

  moveOneRowDown(block, row) {
    const top = parseInt(block.style.top);
    if (top < row) {
      block.style.top = `${top + 80}px`;
    }
  }

  isAtBottomOfGameCanvas(top, nextBlock) {
    return nextBlock && top >= (this.gameCanvas.offsetHeight - nextBlock.offsetHeight);
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
