window.onload = () => {
  const TILE_SIZE = 90;
  const COLS = 10;
  const ROWS = 10;
  const GAME_DURATION = 180; // seconds
  let IS_PAUSED = false;
  
  // Flower colors
  const FLOWER_COLORS = {
    none: null,
    rose: '#ff0000',
    tulip: 'deeppink',
    violet: '#800080',
    daisy: '#ffffff',
    sunflower: '#ffff00'
  };
  
  const FLOWER_PETALS = {
    none: null,
    rose: 1,
    tulip: 1,
    violet: 5,
    daisy: 10,
    sunflower: 10
  }
  
  const FLOWER_CENTER = {
    violet: "#fff",
    daisy: "#0f0",
    sunflower: "#5A3803"
  }
  
  // Game state
  let tiles = [];
  let selectedTile = { x: 0, y: 0 };
  let timeLeft = GAME_DURATION;
  let gameInterval;
  let gameOver = false;
  
  // DOM elements
  const canvas = document.getElementById('canvas');
  const ctx = canvas.getContext('2d');
  const timerElement = document.getElementById('timer');
  const messageElement = document.getElementById('message');
  const upBtn = document.getElementById('upBtn');
  const downBtn = document.getElementById('downBtn');
  const leftBtn = document.getElementById('leftBtn');
  const rightBtn = document.getElementById('rightBtn');
  const breakBtn = document.getElementById('breakBtn');
  const waterBtn = document.getElementById('waterBtn');
  const roseBtn = document.getElementById('rose');
  const tulipBtn = document.getElementById('tulip');
  const violateBtn = document.getElementById('violate');
  const daisyBtn = document.getElementById('daisy');
  const sunBtn = document.getElementById('sunflower');
  const pauseBtn = document.getElementById('pause');
  const restartBtn = document.getElementById('restart');
  
  // Initialize tiles
  function initTiles() {
    tiles = [];
    for (let y = 0; y < ROWS; y++) {
      tiles[y] = [];
      for (let x = 0; x < COLS; x++) {
        const isGrass = Math.random() > 0.7;
        tiles[y][x] = {
          x,
          y,
          isSelected: false,
          isGrass,
          isDry: !isGrass,
          isWatered: false,
          flower: 'none'
        };
      }
    }
    // Select the starting tile
    tiles[0][0].isSelected = true;
    selectedTile = { x: 0, y: 0 };
  }
  
  // Draw the game
  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // First draw all tile backgrounds
    for (let y = 0; y < ROWS; y++) {
      for (let x = 0; x < COLS; x++) {
        const tile = tiles[y][x];
        
        // Draw tile background
        if (tile.isWatered) {
          ctx.fillStyle = '#44911B';
        } else if (tile.isGrass) {
          ctx.fillStyle = 'mediumseagreen';
        } else if (tile.isDry) {
          ctx.fillStyle = 'mediumseagreen';
        } else {
          ctx.fillStyle = '#44911B'
        }
        
        ctx.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
        
        // Draw tile border
        ctx.lineWidth = 1;
        ctx.strokeStyle = '#000';
        ctx.strokeRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
      }
    }
    
    for (let y = 0; y < ROWS; y++) {
      for (let x = 0; x < COLS; x++) {
        const tile = tiles[y][x];
        
        //grass if present
        if (tile.isGrass) {
          drawGrass(x, y);
        }
      }
    }
    
    // draw all flowers
    for (let y = 0; y < ROWS; y++) {
      for (let x = 0; x < COLS; x++) {
        const tile = tiles[y][x];
        
        //flower if present
        if (tile.flower !== 'none') {
          drawFlower(x, y, tile.flower);
        }
      }
    }
    
    //draw selection markers on top of everything
    for (let y = 0; y < ROWS; y++) {
      for (let x = 0; x < COLS; x++) {
        const tile = tiles[y][x];
        
        if (tile.isSelected) {
          drawSelectionMarker(x, y);
        }
      }
    }
  }
  
  // Helper function to draw a flower
  function drawFlower(x, y, flowerType) {
    let centerX = x * TILE_SIZE + TILE_SIZE / 2;
    let centerY = y * TILE_SIZE + TILE_SIZE / 2;
    const petalCount = FLOWER_PETALS[flowerType];
    const centerRadius = TILE_SIZE / 10;
    
    // Draw petals
    ctx.fillStyle = FLOWER_COLORS[flowerType];
    
if (petalCount === 1) {
    centerY = y * TILE_SIZE + TILE_SIZE / 1.5;
    const dropHeight = TILE_SIZE / 1.5;
    const dropWidth = TILE_SIZE / 2.5;
    
    // Top point of the drop
    const topX = centerX;
    const topY = centerY - dropHeight;
    
    // Control points for the curves
    const cp1x = centerX - dropWidth;
    const cp1y = centerY - dropHeight * 0.3;
    const cp2x = centerX - dropWidth * 0.4;
    const cp2y = centerY + dropHeight * 0.2;
    
    const cp3x = centerX + dropWidth * 0.4;
    const cp3y = centerY + dropHeight * 0.2;
    const cp4x = centerX + dropWidth;
    const cp4y = centerY - dropHeight * 0.3;
    
    // Draw the water drop shape
    ctx.beginPath();
    ctx.moveTo(topX, topY);  // Start at top point
    // Curve down left side
    ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, centerX, centerY);
    // Curve up right side
    ctx.bezierCurveTo(cp3x, cp3y, cp4x, cp4y, topX, topY);
    ctx.fill();
}else {
      // Multi-petal flowers (unchanged)
      const petalLength = TILE_SIZE / 3;
      const petalWidth = TILE_SIZE / 4;
      
      // Adjust petal roundness based on petal count (lower count = more rounded)
      const roundnessFactor = Math.max(0.1, 1 - (petalCount / 20));
      const angleOffset = Math.PI / (petalCount * roundnessFactor * 2);
      
      for (let i = 0; i < petalCount; i++) {
        const angle = (i * 2 * Math.PI / petalCount) - Math.PI / 2;
        const petalTipX = centerX + Math.cos(angle) * petalLength;
        const petalTipY = centerY + Math.sin(angle) * petalLength;
        
        const cp1x = centerX + Math.cos(angle + angleOffset) * petalWidth * (1 + roundnessFactor);
        const cp1y = centerY + Math.sin(angle + angleOffset) * petalWidth * (1 + roundnessFactor);
        const cp2x = centerX + Math.cos(angle - angleOffset) * petalWidth * (1 + roundnessFactor);
        const cp2y = centerY + Math.sin(angle - angleOffset) * petalWidth * (1 + roundnessFactor);
        
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.quadraticCurveTo(cp1x, cp1y, petalTipX, petalTipY);
        ctx.quadraticCurveTo(cp2x, cp2y, centerX, centerY);
        ctx.fill();
      }
    }
    
    // Draw center (for all flower types except single-petal)
    if (petalCount != 1) {
      ctx.beginPath();
      ctx.arc(centerX, centerY, centerRadius, 0, 2 * Math.PI);
      ctx.fillStyle = FLOWER_CENTER[flowerType];
      ctx.fill();
      ctx.strokeStyle = '#8B4513';
      ctx.lineWidth = 1;
      ctx.stroke();
    }
}
  
  //helper function to draw grass
  function drawGrass(x, y) {
    ctx.strokeStyle = 'green';
    ctx.fillStyle = ''
    ctx.lineWidth = 10;
    
    //first grass 
    ctx.beginPath();
    ctx.moveTo(x * TILE_SIZE + 30, y * TILE_SIZE + 70);
    ctx.lineTo(x * TILE_SIZE + 30, y * TILE_SIZE + 50);
    ctx.lineTo(x * TILE_SIZE + 15, y * TILE_SIZE + 50);
    ctx.stroke();
    
    //second grass
    ctx.beginPath();
    ctx.moveTo(x * TILE_SIZE + 50, y * TILE_SIZE + 70);
    ctx.lineTo(x * TILE_SIZE + 50, y * TILE_SIZE + 10);
    ctx.stroke();
    
    //3rd grass
    ctx.beginPath();
    ctx.moveTo(x * TILE_SIZE + 70, y * TILE_SIZE + 70);
    ctx.lineTo(x * TILE_SIZE + 70, y * TILE_SIZE + 40);
    ctx.lineTo(x * TILE_SIZE + 78, y * TILE_SIZE + 40);
    ctx.stroke();
  }
  
  // Helper function to draw selection marker
  function drawSelectionMarker(x, y) {
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 10;
    
    // Top-left corner
    ctx.beginPath();
    ctx.moveTo(x * TILE_SIZE + 30, y * TILE_SIZE);
    ctx.lineTo(x * TILE_SIZE, y * TILE_SIZE);
    ctx.lineTo(x * TILE_SIZE, y * TILE_SIZE + 30);
    ctx.stroke();
    
    // Bottom-left corner
    ctx.beginPath();
    ctx.moveTo(x * TILE_SIZE + 30, y * TILE_SIZE + TILE_SIZE);
    ctx.lineTo(x * TILE_SIZE, y * TILE_SIZE + TILE_SIZE);
    ctx.lineTo(x * TILE_SIZE, y * TILE_SIZE + TILE_SIZE - 30);
    ctx.stroke();
    
    // Top-right corner
    ctx.beginPath();
    ctx.moveTo(x * TILE_SIZE + TILE_SIZE - 30, y * TILE_SIZE);
    ctx.lineTo(x * TILE_SIZE + TILE_SIZE, y * TILE_SIZE);
    ctx.lineTo(x * TILE_SIZE + TILE_SIZE, y * TILE_SIZE + 30);
    ctx.stroke();
    
    // Bottom-right corner
    ctx.beginPath();
    ctx.moveTo(x * TILE_SIZE + TILE_SIZE - 30, y * TILE_SIZE + TILE_SIZE);
    ctx.lineTo(x * TILE_SIZE + TILE_SIZE, y * TILE_SIZE + TILE_SIZE);
    ctx.lineTo(x * TILE_SIZE + TILE_SIZE, y * TILE_SIZE + TILE_SIZE - 30);
    ctx.stroke();
  }
  
  // Update selected tile
  function updateSelectedTile(x, y) {
    if (gameOver || IS_PAUSED) return;
    
    // Deselect current tile
    tiles[selectedTile.y][selectedTile.x].isSelected = false;
    
    // Clamp values to stay within bounds
    const newX = Math.max(0, Math.min(COLS - 1, x));
    const newY = Math.max(0, Math.min(ROWS - 1, y));
    
    // Select new tile
    selectedTile = { x: newX, y: newY };
    tiles[newY][newX].isSelected = true;
    
    // Redraw everything
    draw();
  }
  
  // Break grass on selected tile
  function breakGrass() {
    if (gameOver || IS_PAUSED) return;
    
    const tile = tiles[selectedTile.y][selectedTile.x];
    if (tile.isGrass) {
      tile.isGrass = false;
      tile.isDry = true;
      showMessage('Grass broken! Now you can plant here.');
      draw();
    } else {
      showMessage('No grass to break here!');
    }
  }
  
  // Water the selected tile
  function waterTile() {
    if (gameOver || IS_PAUSED) return;
    
    const tile = tiles[selectedTile.y][selectedTile.x];
    if (tile.isDry) {
      tile.isWatered = true;
      tile.isDry = false;
      showMessage('Tile watered! Ready for planting.');
      draw();
    } else if (tile.isGrass) {
      showMessage('Break the grass first before watering!');
    } else {
      showMessage('This tile is already watered!');
    }
  }
  
  // Plant selected flower
  function plantFlower(flower) {
    if (gameOver || IS_PAUSED) return;
    
    const tile = tiles[selectedTile.y][selectedTile.x];
    
    if (flower === 'none') {
      showMessage('Please select a flower first!');
      return;
    }
    
    if (tile.isGrass) {
      showMessage('Break the grass first before planting!');
      return;
    }
    
    if (!tile.isWatered) {
      showMessage('Water the tile first before planting!');
      return;
    }
    
    tile.flower = flower;
    showMessage(`Planted a ${flower}!`);
    draw();
  }
  
  // Show temporary message
  function showMessage(msg) {
    messageElement.textContent = msg;
    messageElement.style.opacity = '1';
    messageElement.style.animation = 'pop 0.5s forwards';
    setTimeout(() => {
      if (messageElement.textContent === msg) {
        messageElement.textContent = '';
        messageElement.style.opacity = '0';
        messageElement.style.animation = 'none';
      }
    }, 2000);
  }
  
  // Start the game timer
  function startTimer() {
    // Clear any existing timer first
    if (gameInterval) {
      clearInterval(gameInterval);
    }
    
    timeLeft = GAME_DURATION;
    timerElement.textContent = `Spring comes in: ${timeLeft}s`;
    gameOver = false;
    
    gameInterval = setInterval(() => {
      if (!IS_PAUSED) {
        timeLeft--;
        timerElement.textContent = `Spring comes in: ${timeLeft}s`;
        
        if (timeLeft <= 0) {
          endGame();
        }
      }
    }, 1000);
  }
  
  // Toggle pause state
  function togglePause() {
    IS_PAUSED = !IS_PAUSED;
    
    if (!IS_PAUSED) {
      showMessage('Game Resumed');
      pauseBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 26 26">
      <path fill="currentColor" d="M7 5c-.551 0-1 .449-1 1v14c0 .551.449 1 1 1h3c.551 0 1-.449 1-1V6c0-.551-.449-1-1-1H7zm9 0c-.551 0-1 .449-1 1v14c0 .551.449 1 1 1h3c.551 0 1-.449 1-1V6c0-.551-.449-1-1-1h-3z"/>
    </svg>`;
    } else {
      showMessage('Game Paused');
      pauseBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 26 26">
    <path fill="currentColor" d="M20.208 11.857L6.902 5.26a1.312 1.312 0 0 0-1.268.052a1.272 1.272 0 0 0-.619 1.09V19.6c0 .443.233.856.619 1.089a1.316 1.316 0 0 0 1.269.052l13.306-6.599c.438-.218.716-.658.716-1.143s-.279-.924-.717-1.142z"/>
</svg>`;
    }
  }
  
  // End the game
  function endGame() {
    clearInterval(gameInterval);
    gameOver = true;
    
    // Show all flowers in their full colors
    for (let y = 0; y < ROWS; y++) {
      for (let x = 0; x < COLS; x++) {
        tiles[y][x].isSelected = false;
        tiles[y][x].isWatered = false;
      }
    }
    
    draw();
    showMessage('Time is up! Your garden is complete.');
    setTimeout(() => {
      showMessage('Spring is here!')
    }, 2500)
  }
  
  // Event listeners
  upBtn.addEventListener('click', () => updateSelectedTile(selectedTile.x, selectedTile.y - 1));
  downBtn.addEventListener('click', () => updateSelectedTile(selectedTile.x, selectedTile.y + 1));
  leftBtn.addEventListener('click', () => updateSelectedTile(selectedTile.x - 1, selectedTile.y));
  rightBtn.addEventListener('click', () => updateSelectedTile(selectedTile.x + 1, selectedTile.y));
  breakBtn.addEventListener('click', breakGrass);
  waterBtn.addEventListener('click', waterTile);
  roseBtn.onclick = () => plantFlower('rose');
  tulipBtn.onclick = () => plantFlower('tulip');
  violateBtn.onclick = () => plantFlower('violet');
  daisyBtn.onclick = () => plantFlower('daisy');
  sunBtn.onclick = () => plantFlower('sunflower');
  pauseBtn.onclick = togglePause;
  restartBtn.onclick = initGame;
  
  // Keyboard controls
  document.addEventListener('keydown', (e) => {
    if (gameOver || IS_PAUSED) return;
    
    switch (e.key) {
      case 'ArrowUp':
        updateSelectedTile(selectedTile.x, selectedTile.y - 1);
        break;
      case 'ArrowDown':
        updateSelectedTile(selectedTile.x, selectedTile.y + 1);
        break;
      case 'ArrowLeft':
        updateSelectedTile(selectedTile.x - 1, selectedTile.y);
        break;
      case 'ArrowRight':
        updateSelectedTile(selectedTile.x + 1, selectedTile.y);
        break;
      case 'b':
        breakGrass();
        break;
      case 'w':
        waterTile();
        break;
      case 'p':
        togglePause();
        break;
      case '1':
        plantFlower('rose');
        break;
      case '2':
        plantFlower('tulip');
        break;
      case '3':
        plantFlower('violet');
        break;
      case '4':
        plantFlower('daisy');
        break;
      case '5':
        plantFlower('sunflower');
        break;
      case 'r':
        initGame()
        break;
    }
  });
  
  // Initialize and start the game
  function initGame() {
    initTiles();
    draw();
    startTimer();
    IS_PAUSED = false;
    pauseBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 26 26">
      <path fill="currentColor" d="M7 5c-.551 0-1 .449-1 1v14c0 .551.449 1 1 1h3c.551 0 1-.449 1-1V6c0-.551-.449-1-1-1H7zm9 0c-.551 0-1 .449-1 1v14c0 .551.449 1 1 1h3c.551 0 1-.449 1-1V6c0-.551-.449-1-1-1h-3z"/>
    </svg>`;
  }
  
  // Start the game
  initGame();
}