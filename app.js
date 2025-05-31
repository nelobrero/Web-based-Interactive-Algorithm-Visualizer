class Node {
  constructor(row, col) {
    this.row = row;
    this.col = col;
    this.isWall = false;
    this.isStart = false;
    this.isEnd = false;
    this.distance = Infinity;
    this.previous = null;
    this.visited = false;
  }
}

let grid = [];
let gridSize = 10;
let actionHistory = [];
let redoStack = [];
let startNode = null;
let endNode = null;
let currentMode = 'wall';
let isMouseDown = false;
let lastChangeTime = 0;
const changeDelay = 200; // milliseconds between color changes




function createGrid() {
  const gridContainer = document.getElementById('grid');
  gridContainer.innerHTML = '';
  grid = [];

  gridContainer.style.gridTemplateColumns = `repeat(${gridSize}, 1fr)`;
  gridContainer.style.gridTemplateRows = `repeat(${gridSize}, 1fr)`;

  for (let row = 0; row < gridSize; row++) {
    const currentRow = [];
    for (let col = 0; col < gridSize; col++) {
      const node = new Node(row, col);
      currentRow.push(node);

      const cell = document.createElement('div');
      cell.className = 'cell';

       const shapes = ['shape1', 'shape2', 'shape3', 'shape4'];
    const randomShape = shapes[Math.floor(Math.random() * shapes.length)];
    cell.classList.add(randomShape);

      cell.id = `cell-${row}-${col}`;
      cell.addEventListener('mousedown', () => {
        isMouseDown = true;
        handleCellClick(row, col);
      });

      cell.addEventListener('mouseover', () => {
        if (isMouseDown) handleCellClick(row, col);
      });

      cell.addEventListener('mouseup', () => {
        isMouseDown = false;
      });

      cell.onclick = () => handleCellClick(row, col);
      gridContainer.appendChild(cell);
    }
    grid.push(currentRow);
  }

  startNode = null;
  endNode = null;
  actionHistory = [];
  redoStack = [];
}


document.addEventListener('mouseup', () => {
  isMouseDown = false;
});
 
document.body.addEventListener('mousemove', (e) => {
  const now = Date.now();
  if (now - lastChangeTime < changeDelay) return; 
  lastChangeTime = now;

  const cells = document.querySelectorAll('.cell3');
  const color = colors[Math.floor(Math.random() * colors.length)];
  cells.forEach(cell => {
    cell.style.backgroundColor = color;
   
  });
});

document.body.addEventListener('mousemove', (e) => {
  const now = Date.now();
  if (now - lastChangeTime < changeDelay) return;
  lastChangeTime = now;

  const color = colors[Math.floor(Math.random() * colors.length)];
  document.querySelectorAll('svg').forEach(svg => {
    svg.querySelectorAll('rect, path, circle, polygon').forEach(shape => {
      shape.setAttribute('fill', color);
    });
  });
});


function updateGridSize() {
  const size = parseInt(document.getElementById('gridSize').value);
  gridSize = size;
  createGrid();
}


function setMode(mode) {
  currentMode = mode;
   if (mode === 'wall') {
    alert("Hold left click of the mouse and drag to set wall");
  }
}

function handleCellClick(row, col) {
  const node = grid[row][col];
  const cell = document.getElementById(`cell-${row}-${col}`);
  const previousState = { ...node };

  // Clear all special states and design
  cell.classList.remove('start', 'end', 'wall', 'clear-design');

  if (currentMode === 'start') {
    if (startNode) {
      const oldStart = document.getElementById(`cell-${startNode.row}-${startNode.col}`);
      oldStart.classList.remove('start', 'clear-design');
      startNode.isStart = false;
    }
    node.isStart = true;
    startNode = node;
    cell.classList.add('start', 'clear-design');
    startSound.currentTime = 0;
    startSound.play(); // Play start sound
  } else if (currentMode === 'end') {
    if (endNode) {
      const oldEnd = document.getElementById(`cell-${endNode.row}-${endNode.col}`);
      oldEnd.classList.remove('end', 'clear-design');
      endNode.isEnd = false;
    }
    node.isEnd = true;
    endNode = node;
    cell.classList.add('end', 'clear-design');
    endSound.currentTime = 0;
    endSound.play(); // Play end sound
  } else if (currentMode === 'wall') {
    node.isWall = !node.isWall;
    if (node.isWall) {
      cell.classList.add('wall', 'clear-design');
      wallSound.currentTime = 0;
      wallSound.play(); // Play wall sound
    } else {
      cell.classList.remove('wall', 'clear-design');
    }
  }

  actionHistory.push({ row, col, previous: previousState });
  redoStack = [];
}


function randomizeStartEnd() {
  // Clear any existing start and end
  if (startNode) {
    const cell = document.getElementById(`cell-${startNode.row}-${startNode.col}`);
    cell.classList.remove('start', 'clear-design');
    startNode.isStart = false;
  }
  if (endNode) {
    const cell = document.getElementById(`cell-${endNode.row}-${endNode.col}`);
    cell.classList.remove('end', 'clear-design');
    endNode.isEnd = false;
  }

  // Random Start
  let startRow = Math.floor(Math.random() * gridSize);
  let startCol = Math.floor(Math.random() * gridSize);
  let endRow = Math.floor(Math.random() * gridSize);
  let endCol = Math.floor(Math.random() * gridSize);

  // Ensure start ≠ end
  while (startRow === endRow && startCol === endCol) {
    endRow = Math.floor(Math.random() * gridSize);
    endCol = Math.floor(Math.random() * gridSize);
  }

  const start = grid[startRow][startCol];
  const end = grid[endRow][endCol];

  start.isStart = true;
  end.isEnd = true;
  startNode = start;
  endNode = end;

  const startCell = document.getElementById(`cell-${start.row}-${start.col}`);
  const endCell = document.getElementById(`cell-${end.row}-${end.col}`);
  startCell.classList.add('start', 'clear-design');
  endCell.classList.add('end', 'clear-design');

  actionHistory.push({ row: start.row, col: start.col, previous: { ...start } });
  actionHistory.push({ row: end.row, col: end.col, previous: { ...end } });

  redoStack = [];
}

function randomizeWalls() {
  resetGrid(); 

  const wallCount = Math.floor((gridSize * gridSize) * 0.2); 
  for (let i = 0; i < wallCount; i++) {
    const row = Math.floor(Math.random() * gridSize);
    const col = Math.floor(Math.random() * gridSize);
    const node = grid[row][col];

    if (!node.isStart && !node.isEnd && !node.isWall) {
      node.isWall = true;
      const cell = document.getElementById(`cell-${row}-${col}`);
      cell.classList.add('wall', 'clear-design');

      actionHistory.push({ row, col, previous: { ...node, isWall: false } });
    }
  }

  redoStack = [];
}




function getUnvisitedNeighbors(node) {
  const neighbors = [];
  const { row, col } = node;
  if (row > 0) neighbors.push(grid[row - 1][col]);
  if (row < gridSize - 1) neighbors.push(grid[row + 1][col]);
  if (col > 0) neighbors.push(grid[row][col - 1]);
  if (col < gridSize - 1) neighbors.push(grid[row][col + 1]);
  return neighbors.filter(n => !n.visited);
}


async function findPath() {
  

  if (!startNode || !endNode) {
    alert("Please set both start and end points.");
    return;
  }

  pathfindingMusic.currentTime = 0; 
pathfindingMusic.play();

  const speed = parseInt(document.getElementById('speedControl').value);
  for (const row of grid) {
    for (const node of row) {
      node.distance = Infinity;
      node.visited = false;
      node.previous = null;
      const cell = document.getElementById(`cell-${node.row}-${node.col}`);
      cell.classList.remove('visited', 'path');
    }
  }

  const unvisitedNodes = grid.flat();
  startNode.distance = 0;

  while (unvisitedNodes.length) {
    unvisitedNodes.sort((a, b) => a.distance - b.distance);
    const closestNode = unvisitedNodes.shift();

    if (closestNode.isWall) continue;
    if (closestNode.distance === Infinity) break;

    closestNode.visited = true;
    if (!closestNode.isStart && !closestNode.isEnd) {
            const cell = document.getElementById(`cell-${closestNode.row}-${closestNode.col}`);


         const rotations = [-90, 180, 270, -90, -180, -270];
  const randomRotation = rotations[Math.floor(Math.random() * rotations.length)];
  cell.style.setProperty('--rotation', `${randomRotation}deg`);
      cell.classList.add('visited');
      await new Promise(resolve => setTimeout(resolve, speed));
    }

    if (closestNode === endNode) break;

    const neighbors = getUnvisitedNeighbors(closestNode);
    for (const neighbor of neighbors) {
      const tentativeDistance = closestNode.distance + 1;
      if (tentativeDistance < neighbor.distance) {
        neighbor.distance = tentativeDistance;
        neighbor.previous = closestNode;
      }
    }
  }

  // Backtrack
  let current = endNode;
  while (current.previous) {
    if (!current.isStart && !current.isEnd) {
      const cell = document.getElementById(`cell-${current.row}-${current.col}`);
      cell.classList.add('path');
      await new Promise(resolve => setTimeout(resolve, speed));
    }
    current = current.previous;
  }
  pathfindingMusic.pause();      // Stop the pathfinding music
successMusic.currentTime = 0;  // Reset to start
successMusic.play();           // Play the success sound

}

function undo() {
  if (actionHistory.length === 0) return;

  const lastAction = actionHistory.pop();
  const { row, col, previous } = lastAction;
  const node = grid[row][col];
  const cell = document.getElementById(`cell-${row}-${col}`);
  


  redoStack.push({
    row,
    col,
    previous: { ...node }

    
  }


);
  

  node.isStart = previous.isStart;
  node.isEnd = previous.isEnd;
  node.isWall = previous.isWall;


  cell.className = 'cell';
   const shapes = ['shape1', 'shape2', 'shape3', 'shape4'];
    const randomShape = shapes[Math.floor(Math.random() * shapes.length)];
    cell.classList.add(randomShape);
  
  if (node.isStart) {
    startNode = node;
    cell.classList.add('start');
  }
  if (node.isEnd) {
    endNode = node;
    cell.classList.add('end');
  }
  if (node.isWall) {
    cell.classList.add('wall');
  }
  
}

function redo() {
  if (redoStack.length === 0) return;

  const lastUndone = redoStack.pop();
  const { row, col, previous } = lastUndone;
  const node = grid[row][col];
  const cell = document.getElementById(`cell-${row}-${col}`);
  

  actionHistory.push({
    row,
    col,
    previous: { ...node }
  });

  node.isStart = previous.isStart;
  node.isEnd = previous.isEnd;
  node.isWall = previous.isWall;


  cell.className = 'cell';

     const shapes = ['shape1', 'shape2', 'shape3', 'shape4'];
    const randomShape = shapes[Math.floor(Math.random() * shapes.length)];
    cell.classList.add(randomShape);
  if (node.isStart) {
    startNode = node;
    cell.classList.add('start');
  }
  if (node.isEnd) {
    endNode = node;
    cell.classList.add('end');
  }
  if (node.isWall) {
    cell.classList.add('wall');
  }
}

function resetGrid() {
  for (const row of grid) {
    for (const node of row) {
      node.isWall = false;
      node.isStart = false;
      node.isEnd = false;
      node.distance = Infinity;
      node.previous = null;
      node.visited = false;
      const cell = document.getElementById(`cell-${node.row}-${node.col}`);
      cell.className = 'cell';

       const shapes = ['shape1', 'shape2', 'shape3', 'shape4'];
    const randomShape = shapes[Math.floor(Math.random() * shapes.length)];
    cell.classList.add(randomShape);
    }
  }

  startNode = null;
  endNode = null;
  actionHistory = [];
  redoStack = [];
}
const colors = ['#090a0d', '#a9b0c8','#414b6d', '#6877ab'];
    let colorIndex = 0;
    let rotation = 0;
    document.body.addEventListener('mousemove', () => {
      colorIndex = (colorIndex + 1) % colors.length;
      document.body.style.background = colors[colorIndex];
      rotation = (rotation + 5) % 360;
      document.querySelectorAll('.cell3').forEach(cell => {
        cell.style.transform = `rotate(${rotation}deg)`;
      });
    });

window.onload = createGrid;

 
const pathfindingMusic = new Audio('pathfinding.mp3'); // Replace with your MP3 path
const successMusic = new Audio('success.mp3');         // Replace with your MP3 path
const startSound = new Audio('bg.mp3');    // Replace with your start sound file
const endSound = new Audio('bg.mp3');        // Replace with your end sound file
const wallSound = new Audio('bg.mp3');      // Replace with your wall sound file

