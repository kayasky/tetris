class TetrisGame extends HTMLElement {
  paused = false;
  isAccelerating = false;
  nextBlock;
  nextBlock1;
  gameCanvas;
  gameContainer;
  shadow;
  blockFallAnimationLoop;
  currentScore = 0;
  baseUrl;

  constructor() {
    super();
  }

  connectedCallback() {
    this.baseUrl = this.getAttribute("base-url") || "tetris-game";
    this.shadow = this.attachShadow({ mode: "open" });
    this.attachStyles();
    this.attachGameContainer();
    this.attachGameCanvas();
    this.attachUserInputListeners();
    this.spawnBlock();
  }

  attachUserInputListeners() {
    document.addEventListener("keydown", this.keydownListener.bind(this));
    document.addEventListener("keyup", this.keyupListener.bind(this));
  }

  attachGameCanvas() {
    this.gameCanvas = document.createElement("div");
    this.gameCanvas.classList.add("game-canvas");
    this.gameContainer.appendChild(this.gameCanvas);
  }

  attachGameContainer() {
    this.gameContainer = document.createElement("div");
    this.gameContainer.classList.add("game-container");
    this.gameContainer.innerHTML = `
      <div>
        <h1 class="game-title">TETRIS</h1>
        <h1 class="score-label">SCORE <span class="score">${this.currentScore}</span></h1>
      </div>`;
    this.shadow.appendChild(this.gameContainer);
  }

  attachStyles() {
    const fontFaceStylesTemplate = document.createElement('template');
    fontFaceStylesTemplate.innerHTML = this.getFontFaceStyles();
    document.head.appendChild(fontFaceStylesTemplate.content.cloneNode(true));

    const styles = document.createElement("link");
    styles.setAttribute("rel", "stylesheet");
    styles.setAttribute("href", `${this.baseUrl}/tetris-game.css`);
    this.shadow.appendChild(styles);
  }

  spawnBlock() {
    this.nextBlock = this.createNextBlockElement();
    this.gameCanvas.append(this.getNextBlock());
    this.blockFallAnimationLoop = this.animateFallingBlock(this.isAccelerating ? 50 : 300);
  }

  keydownListener(e) {
    if (e.code === "Space") {
      this.paused = !this.paused;
    }

    if (!this.getNextBlock() || this.paused) return;

    const left = parseInt(this.getNextBlock().style.left);

    switch (e.code) {
      case "ArrowLeft":
        this.moveBlockLeft(e, left);
        break;
      case "ArrowRight":
        this.moveBlockRight(e, left);
        break;
      case "ArrowDown":
        this.accelerateBlockFall(e);
        break;
    }
  }

  keyupListener(e) {
    if (e.code === "ArrowDown") {
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
      this.getNextBlock().style.left = `${left + 80}px`;
    }
  }

  moveBlockLeft(e, left) {
    e.preventDefault();
    if (left > 0) {
      this.getNextBlock().style.left = `${left - 80}px`;
    }
  }

  animateFallingBlock(clockSpeed) {
    return setInterval(() => {
      if (this.paused || !this.getNextBlock()) return;

      const top = parseInt(this.getNextBlock().style.top);
      const allBlocksOnGameCanvas = this.shadow.querySelectorAll(".block:not(.falling)");

      if (this.isTouchingAnyBlock(allBlocksOnGameCanvas, top)) {
        this.stopFallingState(allBlocksOnGameCanvas);
        return;
      }

      if (this.getNextBlock() && this.isAtBottomOfGameCanvas(top)) {
        this.stopFallingState(allBlocksOnGameCanvas);
        return;
      }

      this.getNextBlock().style.top = `${top + 80}px`;
    }, clockSpeed);
  }

  isTouchingAnyBlock(allBlocksOnGameCanvas, top) {
    return [...allBlocksOnGameCanvas]
      .filter(block => this.isTouchingOtherBlockBelow(top, block)).length > 0;
  }

  stopFallingState(blocks) {
    [...this.nextBlock.childNodes].filter(block => block.outerHTML).forEach((block, i) => {
      block.style.top = `${parseInt(block.style.top) + parseInt(this.nextBlock.style.top)}px`;
      block.style.left = `${parseInt(block.style.left) + parseInt(this.nextBlock.style.left)}px`;
      block.classList.remove("falling");
    });
    this.nextBlock.outerHTML = this.nextBlock.innerHTML;
    //this.nextBlock = undefined;
    clearInterval(this.blockFallAnimationLoop);
    //this.checkIfRowIsFull(blocks);
    this.spawnBlock();

  }

  checkIfRowIsFull(blocks) {
    const rows = this.getRows(blocks);
    for (let row in rows) {
      const currentRow = rows[row];
      if (currentRow.length > 9) {
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
    console.log(rows);
    return rows;
  }

  getRowWidth(currentRow) {
    return [...currentRow]
      .map(block => block.offsetWidth)
      .reduce((totalWidth, currentBlockWidth) => totalWidth + currentBlockWidth, 0);
  }

  updateScoreAndRemoveFullRow(currentRow, row) {
    this.incrementScore();
    currentRow.forEach(block => block.classList.add("full-row"));
    setTimeout(() => {
      const blocksAbove = this.shadowRoot.querySelectorAll(".block");
      currentRow.forEach(block => block.remove());
      [...blocksAbove].forEach(block => this.moveOneRowDown(block, row));
    }, 300);
  }

  incrementScore() {
    const score = this.shadowRoot.querySelectorAll(".score")[0];
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
    return this.getNextBlock() && top >= (this.gameCanvas.offsetHeight - this.getNextBlock().offsetHeight);
  }

  isTouchingOtherBlockBelow(top, otherBlock) {
    if (!this.getNextBlock()) return false;

    const blockTop = parseInt(otherBlock.style.top);
    const blockLeft = parseInt(otherBlock.style.left);

    return blockTop === top + otherBlock.offsetHeight
      && ((parseInt(this.getNextBlock().style.left) >= blockLeft && parseInt(this.getNextBlock().style.left) < blockLeft + otherBlock.offsetWidth)
        || (parseInt(this.getNextBlock().style.left) + this.getNextBlock().offsetWidth > blockLeft && parseInt(this.getNextBlock().style.left) + this.getNextBlock().offsetWidth <= blockLeft + otherBlock.offsetWidth));
  }

  createNextBlockElement() {
    const left = this.getLeftValue();


    const blockContainer = document.createElement("div");
    blockContainer.classList.add("block-container");
    blockContainer.style.left = `${left}px`;
    blockContainer.style.top = "-80px";
    blockContainer.style.height = "160px";


    const newBlock = document.createElement("div");
    newBlock.classList.add("block", "falling");
    // randomly choose color
    const colors = ["variant1", "variant2", "variant3", "variant4", "variant5"];
    const color = colors[Math.floor(Math.random() * colors.length)];

    // randomly choose block type
    const blockTypes = ["square", "line"];
    const blockType = blockTypes[Math.floor(Math.random() * blockTypes.length)];

    // not working as of now
    //nextBlock.classList.add(color, blockType);
    newBlock.classList.add(color);
    blockContainer.innerHTML = `
      <div class="block ${color}" style="top: 80px; left: 80px"></div>
      <div class="block ${color}" style="top: 80px; left: 0px"></div>
      <div class="block ${color}" style="top: 0px; left: 80px"></div>
      <div class="block ${color}" style="top: 0px; left: 0px"></div>
    `;
    // newBlock.style.top = "-80px";
    // newBlock.style.left = `${left}px`;
    return blockContainer;
  }

  getNextBlock() {
    return this.nextBlock;
  }

  getLeftValue() {
    const possibleLeft = [0, 160, 240, 320, 400, 480, 560, 640];
    return possibleLeft[Math.floor(Math.random() * possibleLeft.length)];
  }

  getFontFaceStyles() {
    return `
      <style>
      @font-face {
        font-family: "Pixeloid Sans";
        src: url("https://db.onlinewebfonts.com/t/44edad438331a44bf2c79f9b7be0cd1a.eot");
        src: url("https://db.onlinewebfonts.com/t/44edad438331a44bf2c79f9b7be0cd1a.eot?#iefix")format("embedded-opentype"),
          url("https://db.onlinewebfonts.com/t/44edad438331a44bf2c79f9b7be0cd1a.woff2")format("woff2"),
          url("https://db.onlinewebfonts.com/t/44edad438331a44bf2c79f9b7be0cd1a.woff")format("woff"),
          url("https://db.onlinewebfonts.com/t/44edad438331a44bf2c79f9b7be0cd1a.ttf")format("truetype"),
          url("https://db.onlinewebfonts.com/t/44edad438331a44bf2c79f9b7be0cd1a.svg#Pixeloid Sans")format("svg");
      }
      </style>
    `;
  }

}

customElements.define("tetris-game", TetrisGame);