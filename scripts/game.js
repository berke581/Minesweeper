"use strict";

const game = {
  // Default difficulty level denoting beginner
  difficulty: { level: 1, rowsCount: 9, colsCount: 9, mines: 10 },
  isFirstClick: true,
  isGameOver: false,
  activeCount: 0,
  table: [],
};

createTable();
renderUI();
renderTable();
addEventHandlers();

function createTable() {
  for (let i = 0; i < game.difficulty.rowsCount; ++i) {
    let row = [];
    for (let j = 0; j < game.difficulty.colsCount; ++j) {
      row.push({
        target: null,
        isMine: false,
        isClicked: false,
        isFlagged: false,
      });
    }
    game.table.push(row);
  }

  placeMines();
}

function placeMines() {
  let mineCount = game.difficulty.mines;
  while (mineCount) {
    const x = Math.floor(Math.random() * game.difficulty.rowsCount);
    const y = Math.floor(Math.random() * game.difficulty.colsCount);

    if (!game.table[x][y].isMine) {
      game.table[x][y].isMine = true;
      --mineCount;
    }
  }
}

function renderTable() {
  const table = document
    .querySelector(".minesweeper-container")
    .appendChild(document.createElement("table"));

  table.classList.add("game-table");

  const tBody = table.appendChild(document.createElement("tbody"));

  for (let i = 0; i < game.difficulty.rowsCount; ++i) {
    let row = document.createElement("tr");

    for (let j = 0; j < game.difficulty.colsCount; ++j) {
      let cell = document.createElement("td");
      cell.classList.add("table-item");
      cell.dataset["cellId"] = `${i}-${j}`;
      row.appendChild(cell);

      game.table[i][j].target = cell;
    }

    tBody.appendChild(row);
  }

  const menu = document.querySelector(".game-menu");
  menu.style.width = `${table.offsetWidth - 2}px`;
}

function renderUI() {
  const container = document.querySelector(".minesweeper-container");
  let menu = document.createElement("div");
  menu.classList.add("game-menu");

  let restart = document.createElement("button");
  restart.className = "restart smile";
  restart.addEventListener("click", restartGame);
  menu.appendChild(restart);

  container.appendChild(menu);
}

function addEventHandlers() {
  game.table.map((row) =>
    row.map((el) => {
      el.target.addEventListener("click", onCellClick);
      el.target.addEventListener("contextmenu", onCellRightClick);
    })
  );
}

function onCellClick(e) {
  e.stopPropagation();

  if (game.isGameOver) return;

  const [x, y] = this.dataset["cellId"].split("-").map((el) => +el);

  if (game.table[x][y].isClicked || game.table[x][y].isFlagged) return;

  if (game.table[x][y].isMine) {
    if (game.isFirstClick) {
      // If first click is on a mine
      // That mine gets removed, this way
      // First clicked cell cannot be a mine
      game.table[x][y].target.classList.add("active");
      game.table[x][y].isMine = false;
      --game.difficulty.mines;
      walkGrid(x, y);
    } else {
      game.isGameOver = true;
      document.querySelector(".restart").className = "restart game-over";
      revealMines();
    }

    game.isFirstClick = false;
    return;
  }

  game.isFirstClick = false;

  game.table[x][y].target.classList.add("active");
  walkGrid(x, y);

  checkWin();
}

function onCellRightClick(e) {
  e.stopPropagation();
  e.preventDefault();

  if (game.isGameOver) return;

  const [x, y] = this.dataset["cellId"].split("-").map((el) => +el);

  if (game.table[x][y].isClicked) return;

  // Place flag
  if (!game.table[x][y].isFlagged) {
    game.table[x][y].isFlagged = true;
    game.table[x][y].target.classList.add("flagged");
  } else {
    game.table[x][y].isFlagged = false;
    game.table[x][y].target.classList.remove("flagged");
  }

  return false;
}

function revealMines() {
  game.table.map((row) =>
    row.map((el) => {
      if (el.isMine) {
        el.isClicked = true;
        el.target.classList.add("active");
        el.target.classList.add("mine");
      }
    })
  );
}

function restartGame() {
  for (let i = 0; i < game.difficulty.rowsCount; ++i) {
    for (let j = 0; j < game.difficulty.colsCount; ++j) {
      Object.assign(game.table[i][j], {
        isMine: false,
        isClicked: false,
        isFlagged: false,
      });

      game.table[i][j].target.className = "table-item";
      game.table[i][j].target.innerHTML = "";
    }
  }

  Object.assign(game, {
    difficulty: { level: 1, rowsCount: 9, colsCount: 9, mines: 10 },
    isFirstClick: true,
    isGameOver: false,
    activeCount: 0,
  });

  document.querySelector(".restart").className = "restart smile";

  placeMines();
}

function checkWin() {
  if (
    game.activeCount ===
    game.difficulty.rowsCount * game.difficulty.colsCount -
      game.difficulty.mines
  ) {
    document.querySelector(".restart").className = "restart win";
    revealMines();
    game.isGameOver = true;
  }
}

function walkGrid(x, y) {
  if (
    x < 0 ||
    y < 0 ||
    x > game.difficulty.rowsCount - 1 ||
    y > game.difficulty.colsCount - 1 ||
    game.table[x][y].isMine === true ||
    game.table[x][y].isClicked === true
  )
    return;

  game.table[x][y].isClicked = true;
  game.table[x][y].target.classList.add("active");
  ++game.activeCount;

  const colors = [
    null,
    "#0000FF",
    "#008200",
    "#FF0000",
    "#000084",
    "#840000",
    "#008284",
    "#840084",
    "#757575",
  ];
  if (countAdjacent(x, y)) {
    const adj = countAdjacent(x, y);
    const item = game.table[x][y].target;
    item.classList.add("active");
    item.isClicked = true;
    item.style.color = colors[adj];
    item.innerHTML = adj;
    return;
  }

  walkGrid(x - 1, y);
  walkGrid(x, y - 1);
  walkGrid(x + 1, y);
  walkGrid(x, y + 1);
  walkGrid(x - 1, y - 1);
  walkGrid(x + 1, y - 1);
  walkGrid(x + 1, y + 1);
  walkGrid(x - 1, y + 1);
}

function countAdjacent(x, y) {
  let count = 0;

  if (x > 0 && game.table[x - 1][y].isMine === true) ++count;
  if (y > 0 && game.table[x][y - 1].isMine === true) ++count;
  if (x < game.difficulty.rowsCount - 1 && game.table[x + 1][y].isMine === true)
    ++count;
  if (y < game.difficulty.colsCount - 1 && game.table[x][y + 1].isMine === true)
    ++count;
  if (
    x < game.difficulty.rowsCount - 1 &&
    y > 0 &&
    game.table[x + 1][y - 1].isMine === true
  )
    ++count;
  if (
    x > 0 &&
    y < game.difficulty.colsCount - 1 &&
    game.table[x - 1][y + 1].isMine === true
  )
    ++count;
  if (
    x < game.difficulty.rowsCount - 1 &&
    y < game.difficulty.colsCount - 1 &&
    game.table[x + 1][y + 1].isMine === true
  )
    ++count;
  if (x > 0 && y > 0 && game.table[x - 1][y - 1].isMine === true) ++count;

  return count;
}
