class TetrisGame extends HTMLElement {
  paused = false;
  isAccelerating = false;
  nextBlock;
  gameCanvas;
  shadow;
  blockFallAnimationLoop;
  currentScore = 0;

  constructor() {
    super();
  }

  connectedCallback() {
    this.shadow = this.attachShadow({ mode: "open" });
    this.attachStyles();
    this.attachGameContainer();
    this.attachGameCanvas();
    this.attachUserInputListeners();
    this.spawnBlock();
  }

  attachUserInputListeners() {
    document.addEventListener('keydown', this.keydownListener.bind(this));
    document.addEventListener('keyup', this.keyupListener.bind(this));
  }

  attachGameCanvas() {
    this.gameCanvas = document.createElement("div");
    this.gameCanvas.classList.add('game-canvas');
    this.shadow.appendChild(this.gameCanvas);
  }

  attachGameContainer() {
    const gameContainer = document.createElement("div");
    gameContainer.innerHTML = `
      <h1 class="game-title">TETRIS</h1>
      <h1 class="score-label">Score <span class="score">${this.currentScore}</span></h1>`;
    this.shadow.appendChild(gameContainer);
  }

  attachStyles() {
    const styles = document.createElement("link");
    styles.setAttribute("rel", "stylesheet");
    styles.setAttribute("href", "./tetris-game.css");
    this.shadow.appendChild(styles);
  }

  spawnBlock() {
    this.nextBlock = this.createNextBlockElement();
    this.gameCanvas.appendChild(this.nextBlock);
    this.blockFallAnimationLoop = this.animateFallingBlock(this.isAccelerating ? 50 : 300);
  }

  keydownListener(e) {
    if (e.code === 'Space') {
      this.paused = !this.paused;
    }

    if (!this.nextBlock || this.paused) return;

    const left = parseInt(this.nextBlock.style.left);

    switch (e.code) {
      case 'ArrowLeft':
        this.moveBlockLeft(e, left);
        break;
      case 'ArrowRight':
        this.moveBlockRight(e, left);
        break;
      case 'ArrowDown':
        this.accelerateBlockFall(e);
        break;
    }
  }

  keyupListener(e) {
    if (e.code === 'ArrowDown') {
      this.decelerateBlockFall();
    }
  }

  decelerateBlockFall() {
    clearInterval(this.blockFallAnimationLoop);
    this.isAccelerating = false;
    this.blockFallAnimationLoop = this.animateFallingBlock(300);
  }

  accelerateBlockFall(e) {
    e.preventDefault();
    if (this.isAccelerating) return;
    clearInterval(this.blockFallAnimationLoop);
    this.isAccelerating = true;
    this.blockFallAnimationLoop = this.animateFallingBlock(50);
  }

  moveBlockRight(e, left) {
    e.preventDefault();
    if (left < 720) {
      this.nextBlock.style.left = `${left + 40}px`;
    }
  }

  moveBlockLeft(e, left) {
    e.preventDefault();
    if (left > 0) {
      this.nextBlock.style.left = `${left - 40}px`;
    }
  }

  animateFallingBlock(clockSpeed) {
    return setInterval(() => {
      if (this.paused || !this.nextBlock) return;

      const top = parseInt(this.nextBlock.style.top);
      const allBlocksOnGameCanvas = this.shadow.querySelectorAll('.block');

      if (this.isTouchingAnyBlock(allBlocksOnGameCanvas, top)) {
        this.stopFallingState(allBlocksOnGameCanvas);
        return;
      }

      if (this.nextBlock && this.isAtBottomOfGameCanvas(top)) {
        this.stopFallingState(allBlocksOnGameCanvas);
        return;
      }

      this.nextBlock.style.top = `${top + 40}px`;
    }, clockSpeed);
  }

  isTouchingAnyBlock(allBlocksOnGameCanvas, top) {
    return [...allBlocksOnGameCanvas]
      .filter(block => block !== this.nextBlock
        && this.isTouchingOtherBlockBelow(top, block)).length > 0;
  }

  stopFallingState(blocks) {
    this.nextBlock = undefined;
    clearInterval(this.blockFallAnimationLoop);
    this.checkIfRowIsFull(blocks);
    this.spawnBlock();
  }

  checkIfRowIsFull(blocks) {
    const rows = this.getRows(blocks);
    for (let row in rows) {
      const currentRow = rows[row];
      if (this.getRowWidth(currentRow) >= 800) {
        this.updateScoreAndRemoveFullRow(currentRow, row);
      }
    }
  }

  getRows(blocks) {
    const rows = {};
    [...blocks].forEach(block => {
      const top = parseInt(block.style.top);
      if (!rows[top]) {
        rows[top] = [];
      }
      rows[top].push(block);
    });
    return rows;
  }

  getRowWidth(currentRow) {
    return [...currentRow]
      .map(block => block.offsetWidth)
      .reduce((totalWidth, currentBlockWidth) => totalWidth + currentBlockWidth, 0);
  }

  updateScoreAndRemoveFullRow(currentRow, row) {
    this.incrementScore();
    currentRow.forEach(block => block.classList.add('full-row'));
    setTimeout(() => {
      const blocksAbove = this.shadowRoot.querySelectorAll('.block');
      currentRow.forEach(block => block.remove());
      [...blocksAbove].forEach(block => this.moveOneRowDown(block, row));
    }, 300);
  }

  incrementScore() {
    const score = this.shadowRoot.querySelectorAll('.score')[0];
    this.currentScore += 10;
    score.textContent = this.currentScore;
  }

  moveOneRowDown(block, row) {
    const top = parseInt(block.style.top);
    if (top < row) {
      block.style.top = `${top + 80}px`;
    }
  }

  isAtBottomOfGameCanvas(top) {
    return this.nextBlock && top >= (this.gameCanvas.offsetHeight - this.nextBlock.offsetHeight);
  }

  isTouchingOtherBlockBelow(top, otherBlock) {
    if (!this.nextBlock) return false;

    const blockTop = parseInt(otherBlock.style.top);
    const blockLeft = parseInt(otherBlock.style.left);
    return blockTop === top + otherBlock.offsetHeight
      && ((parseInt(this.nextBlock.style.left) >= blockLeft && parseInt(this.nextBlock.style.left) < blockLeft + otherBlock.offsetWidth)
        || (parseInt(this.nextBlock.style.left) + this.nextBlock.offsetWidth > blockLeft && parseInt(this.nextBlock.style.left) < blockLeft));
  }

  createNextBlockElement() {
    const left = this.getLeftValue();
    const newBlock = document.createElement('div');
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