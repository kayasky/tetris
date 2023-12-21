(() => {
  const possibleLeft = [0, 40, 80, 120, 160, 200, 240, 280, 320, 360, 400, 440, 480, 520, 560, 600, 640, 680, 720];

  const screen = document.getElementById('screen');

  spawnBlock();

  function spawnBlock() {
    const left = possibleLeft[Math.floor(Math.random() * possibleLeft.length)];
    let nextBlock = document.createElement('div');
    nextBlock.classList.add('block');
    nextBlock.style.top = '0px';
    nextBlock.style.left = `${left}px`;
    screen.appendChild(nextBlock);

    const fallingState = setInterval(() => {
      const top = parseInt(nextBlock.style.top);
      // check if there is a block below
      const blocks = document.getElementsByClassName('block');
      for (let i = 0; i < blocks.length; i++) {
        const block = blocks[i];
        if (block === nextBlock) continue;
        const blockTop = parseInt(block.style.top);
        const blockLeft = parseInt(block.style.left);
        if (blockTop === top + block.offsetHeight
          && ((parseInt(nextBlock.style.left) >= blockLeft && parseInt(nextBlock.style.left) < blockLeft + block.offsetWidth)
            || (parseInt(nextBlock.style.left) + nextBlock.offsetWidth > blockLeft && parseInt(nextBlock.style.left) < blockLeft))) {
          nextBlock = null;
          spawnBlock();
          clearInterval(fallingState);
          return;
        }
      }
      if (top >= (screen.offsetHeight - nextBlock.offsetHeight)) {
        nextBlock = null;
        spawnBlock();
        clearInterval(fallingState);
        return;
      }
      nextBlock.style.top = `${top + 40}px`;
    }, 100);

    //listen to the keyboard input for moving the block
    const keydownListener = (e) => {
      if (!nextBlock) return;

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
  }

})();
