(() => {
  const nextBlock = document.createElement('div');
  nextBlock.classList.add('block');
  nextBlock.style.top = '0px';

  const screen = document.getElementById('screen');
  screen.appendChild(nextBlock);

  const fallingState = setInterval(() => {
    const top = parseInt(nextBlock.style.top);
    console.log(screen.style);
    if (top >= (screen.offsetHeight - nextBlock.offsetHeight)) {
      clearInterval(fallingState);
      return;
    }

    nextBlock.style.top = `${top + 40}px`;
  }, 500);
})();
