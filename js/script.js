$(document).ready(function() {
    console.clear();
    $("#start-game").click(startGame);
    //$(".grid-cell-wrapper").click(gameLoop());
});

$(window).resize(function() {
  $("#gameArea").height($("#gameArea").width());
  $("#gameArea").width(Math.round($("#gameArea").height()));
  $(".grid-cell-wrapper").width($("#gameArea").width()/3);
  $(".grid-cell-wrapper").height($(".grid-cell").eq(0).outerWidth());
});

function init(crossImg, zeroImg, gridImg) {
  $("#gameArea").css("background-image", "url(" + gridImg + ")");
  $(".grid-cell_cross").css("background-image", "url(" + crossImg + ")");
  $(".grid-cell_zero").css("background-image", "url(" + zeroImg + ")");
}

function startGame(restart) {
  if (restart) {
    $("#popupWindowWrapper").removeClass("active");
  }
  $("main").empty();
  $("main").append("<div class='control-panel control-panel_choose-side'></div>");
  for (let i = 0; i < 3; i++) {
    $(".control-panel_choose-side").append("<button id="+i+"></button>");
  }
  $("button").eq(0).text("Крестики");
  $("button").eq(1).text("Нолики");
  $("button").eq(2).text("Случайно");
  chooseSide();
}

function chooseSide() {
  let gameSide;
  let measurement = 3; // измерение(по горизонтали и вертикали), так как строится квадрат
  $("#0").click(function() {
    gameSide = 2; // комп играет ноликами
    let gameArea = createGameArea(measurement);
    init("img/cross.png","img/zero.png","img/grid.png");
    gameLoop(gameSide, gameArea);
  });
  $("#1").click(function() {
    gameSide = 1; // комп играет крестиками
    let gameArea = createGameArea(measurement);
    init("img/cross.png","img/zero.png","img/grid.png");
    gameLoop(gameSide, gameArea);
  });
  $("#2").click(function() {
    gameSide = Math.floor(Math.random()*2+1); // комп играет случайной стороной
    let gameArea = createGameArea(measurement);
    init("img/cross.png","img/zero.png","img/grid.png");
    gameLoop(gameSide, gameArea);
  });
}

function createGameArea(measurement) {
  let grid = $('<div/>', {
    id:     'gameArea',
    class:  'game-area'
  });
  grid.data("data-measurement", measurement);
  $("main").empty();
  $("main").append(grid);
  grid.height(grid.width());
  grid.width(grid.height());
  for(let i=0; i<Math.pow(measurement, 2); i++) {
    let gridCellWrapper = $('<div/>', {
      id: i,
      class: "grid-cell-wrapper"
    });
    gridCellWrapper.width(grid.width()/3);
    gridCellWrapper.height(gridCellWrapper.width());
    gridCellWrapper.append("<div class='grid-cell grid-cell_free'></div>");
    grid.append(gridCellWrapper);
  };
  return grid;
}

function createPopupWindow(gameside, winner) {
  let popupWindowWrapper = $("#popupWindowWrapper");
  let notificationBlock = popupWindowWrapper.find(".popup-window__notification").eq(0);
  notificationBlock.removeClass("popup-window__notification_lose popup-window__notification_win popup-window__notification_draw");
  console.log(notificationBlock);
  if (winner==gameside) { // Вы проиграли
    notificationBlock.addClass("popup-window__notification_lose");
    notificationBlock.text("Вы проиграли :(");
  }
  else if (winner!=gameside && winner!=0) { // Вы победили
    notificationBlock.addClass("popup-window__notification_win");
    notificationBlock.text("Вы победили!");
  }
  else { // Ничья
    notificationBlock.addClass("popup-window__notification_draw");
    notificationBlock.text("Ничья");
  }
  popupWindowWrapper.addClass("active");
  $("#restart-game").click(true, startGame);
}

function gameLoop(gameSide, gameArea) {
  let winner;
  let coordsArrayOfWinner;
  let measurement = gameArea.data("data-measurement");
  let cellsToCapture = 3;
  let cells = $(".grid-cell");
  let matrixArea = []; // двумерный массив игрового поля
  for (let i=0; i<measurement; i++) {
    matrixArea[i] = [];
  }
  let area = []; // массив игрового поля ( 0-пустая клетка, 1-крестики, 2-нолики )
  // заполнить нулями оба массива
  for (let i=0; i<Math.pow(measurement, 2); i++) {
    area[i] = 0;
  }
  let areaCellId = 0;
  for (let i=0; i<measurement; i++) {
    for (let j=0; j<measurement; j++) {
      matrixArea[i][j] = area[areaCellId];
      areaCellId++;
    }
  }
  console.log(matrixArea);
  let targetCellNumber = Math.floor(Math.random()*8); // целевая клетка для хода компа (случайная клетка для 1 хода)
  if (gameSide==1) { // если выпали крестики, то ход компа
    targetCellNumber = cpuTurn(gameSide, area, matrixArea, cellsToCapture);
    cells.eq(targetCellNumber).removeClass("grid-cell_free").addClass("grid-cell_cross");
    cells.eq(targetCellNumber).parent().unbind("click");
    area[targetCellNumber] = 1;
  }
  switch (gameSide) {
    case 2: // комп - нолики, игрок - крестики
      $(".grid-cell-wrapper").click(function() {
        $(this).unbind("click");
        $(this).children().eq(0).removeClass("grid-cell_free").addClass("grid-cell_cross"); // ход игрока
        area[$(this).attr("id")] = 1;
        winner = checkForWinner(gameSide, measurement, area, matrixArea, cellsToCapture);
        if (winner==undefined) {
          targetCellNumber = cpuTurn(gameSide, area, matrixArea, cellsToCapture);
          cells.eq(targetCellNumber).removeClass("grid-cell_free").addClass("grid-cell_zero");
          cells.eq(targetCellNumber).parent().unbind("click");
          area[targetCellNumber] = 2;
        }
        else {
          createPopupWindow(gameSide, winner);
        }
        winner = checkForWinner(gameSide, measurement, area, matrixArea, cellsToCapture);
        if (winner!=undefined) {
          createPopupWindow(gameSide, winner);
        }
      });
      break;
    case 1: // комп - крестики, игрок - нолики
      $(".grid-cell-wrapper").click(function() {
        $(this).unbind("click");
        $(this).children().eq(0).removeClass("grid-cell_free").addClass("grid-cell_zero");
        area[$(this).attr("id")] = 2;
        winner = checkForWinner(gameSide, measurement, area, matrixArea, cellsToCapture);
        if (winner==undefined) {
          targetCellNumber = cpuTurn(gameSide, area, matrixArea, cellsToCapture);
          cells.eq(targetCellNumber).removeClass("grid-cell_free").addClass("grid-cell_cross");
          cells.eq(targetCellNumber).parent().unbind("click");
          area[targetCellNumber] = 1;
        }
        else {
          createPopupWindow(gameSide, winner);
        }
        winner = checkForWinner(gameSide, measurement, area, matrixArea, cellsToCapture);
        if (winner!=undefined) {
          createPopupWindow(gameSide, winner);
        }
      });
      break;
  }

  function checkForWinner(gameside, measurement, area, matrixArea, cellsToCapture) {
    console.log("cторона, за которую играет комп: ", gameside);
    //console.log("кол-во захваченных клеток в варианте для победы: ", cellsToCapture);
    let winner;
    let winningComboPower = 0;
    let areaCellId = 0;
    for (let i=0; i<measurement; i++) {
      for (let j=0; j<measurement; j++) {
        matrixArea[i][j] = area[areaCellId];
        areaCellId++;
      }
    }
    console.log("матрица клеток: ", matrixArea);
    let variantsArrays = [],
        variantsArraysCellsCoords = [];
    // создать четырехмерный массив из комбинаций символов по горизонтали, вертикали и диагоналям для каждой клетки сетки
    for (let i = 0; i<matrixArea[0].length; i++) { // для каждой ячейки матрицы клеток
      variantsArrays[i] = [];
      variantsArraysCellsCoords[i] = [];
      for (let j = 0; j<matrixArea[0].length; j++) {
        variantsArrays[i][j] = [];
        variantsArraysCellsCoords[i][j] = [];
        for (let q = 0; q < 8; q++) { // заполняем 7 массивов (7 вариантов выигрыша)
          variantsArrays[i][j][q] = [];
          variantsArraysCellsCoords[i][j][q] = [];
          for (let matrixrow = i-cellsToCapture+1; matrixrow<i+cellsToCapture; matrixrow++) { // a для этого снова перебираем матрицу клеток вокруг текущей клетки по часовой стрелке на расстоянии длины комбинации символов, необходимой для выигрыша
            for (let matrixcol = j-cellsToCapture+1; matrixcol<j+cellsToCapture; matrixcol++) {
              if (matrixrow>=0 && matrixcol>=0 && matrixrow<=matrixArea.length-1 && matrixcol<=matrixArea.length-1) {
                if (matrixcol==j && matrixrow<=i && q==0) { // вертикаль сверху
                  variantsArrays[i][j][q].push(matrixArea[matrixrow][matrixcol]);
                  variantsArraysCellsCoords[i][j][q].push([matrixrow,matrixcol]);
                }
                else if (matrixcol<=j+cellsToCapture-1 && matrixrow>=i-cellsToCapture+1 && matrixcol>=j && matrixrow<=i && q==1) { // квадрат сверху справа от целевой ячейки
                  if (matrixrow==i && matrixcol==j) {
                    for (let k=0; k<cellsToCapture; k++) {
                      if (matrixrow-k>=0 && matrixcol+k<=matrixArea[0].length-1) { // диагональ вверх-вправо
                        variantsArrays[i][j][q].push(matrixArea[matrixrow-k][matrixcol+k]);
                        variantsArraysCellsCoords[i][j][q].push([matrixrow-k,matrixcol+k]);
                      }
                    }
                  }
                }
                else if (matrixrow==i && matrixcol>=j && q==2) { // горизонталь справа
                  variantsArrays[i][j][q].push(matrixArea[matrixrow][matrixcol]);
                  variantsArraysCellsCoords[i][j][q].push([matrixrow,matrixcol]);
                }
                else if (matrixcol<=j+cellsToCapture-1 && matrixrow<=i+cellsToCapture-1 && matrixcol>=j && matrixrow>=i && q==3) { // квадрат снизу справа от целевой ячейки
                  if (matrixrow==i && matrixcol==j) {
                    for (let k=0; k<cellsToCapture; k++) {
                      if (matrixrow+k<=matrixArea[0].length-1 && matrixcol+k<=matrixArea[0].length-1) { // диагональ вниз-вправо
                        variantsArrays[i][j][q].push(matrixArea[matrixrow+k][matrixcol+k]);
                        variantsArraysCellsCoords[i][j][q].push([matrixrow+k,matrixcol+k]);
                      }
                    }
                  }
                }
                else if (matrixcol==j && matrixrow>=i && q==4) { // вертикаль снизу
                  variantsArrays[i][j][q].push(matrixArea[matrixrow][matrixcol]);
                  variantsArraysCellsCoords[i][j][q].push([matrixrow,matrixcol]);
                }
                else if (matrixcol>=j-cellsToCapture && matrixrow<=i+cellsToCapture && matrixcol<=j && matrixrow>=i && q==5) { // квадрат снизу слева от целевой ячейки
                  if (matrixrow==i && matrixcol==j) {
                    for (let k=0; k<cellsToCapture; k++) {
                      if (matrixrow+k<=matrixArea[0].length-1 && matrixcol-k>=0) { // диагональ вниз-влево
                        variantsArrays[i][j][q].push(matrixArea[matrixrow+k][matrixcol-k]);
                        variantsArraysCellsCoords[i][j][q].push([matrixrow+k,matrixcol-k]);
                      }
                    }
                  }
                }
                else if (matrixrow==i && matrixcol<=j && q==6) { // горизонталь cлева
                  variantsArrays[i][j][q].push(matrixArea[matrixrow][matrixcol]);
                  variantsArraysCellsCoords[i][j][q].push([matrixrow,matrixcol]);
                }
                else if (matrixrow>=i-cellsToCapture && matrixcol>=j-cellsToCapture && matrixrow<=i && matrixcol<=j && q==7) { // квадрат сверху слева от целевой ячейки
                  if (matrixrow==i && matrixcol==j) {
                    for (let k=0; k<cellsToCapture; k++) {
                      if (matrixrow-k>=0 && matrixcol-k>=0) { // диагональ вверх-влево
                        variantsArrays[i][j][q].push(matrixArea[matrixrow-k][matrixcol-k]);
                        variantsArraysCellsCoords[i][j][q].push([matrixrow-k,matrixcol-k]);
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
    //инвертировать некоторые массивы variantsArrays
    for (let i = 0; i<matrixArea[0].length; i++) {
      for (let j = 0; j<matrixArea[0].length; j++) {
        for (let q = 0; q < 8; q++) {
          if (q==0 || q==6) {
           variantsArrays[i][j][q].reverse();
           variantsArraysCellsCoords[i][j][q].reverse();
          }
        }
      }
    }
    console.log("варианты: ", variantsArrays);
    console.log("координаты клеток в вариантах: ", variantsArraysCellsCoords);
    // определить победителя, если он есть
    for (let i=0; i<variantsArrays[0].length; i++) {
      for (let j=0; j<variantsArrays[0].length; j++) {
        for (let q=0; q<8; q++) {
          if (variantsArrays[i][j][q].length==cellsToCapture && Math.abs(winningComboPower)!=cellsToCapture) {
            for (let k=0; k<cellsToCapture; k++) {
              if (variantsArrays[i][j][q][k]==gameside) {
                winningComboPower<=0 ? winningComboPower-- : winningComboPower = 0;
              }
              else if (variantsArrays[i][j][q][k]!=gameside && variantsArrays[i][j][q][k]!=0) {
                winningComboPower>=0 ? winningComboPower++ : winningComboPower = 0;
              }
              else {
                winningComboPower = 0;
              }
            }

            if (Math.abs(winningComboPower)==cellsToCapture) {
              if (winningComboPower==-1*cellsToCapture) {
                winner = gameside;
                coordsArrayOfWinner = variantsArraysCellsCoords[i][j][q];
              }
              else if (winningComboPower==cellsToCapture) {
                (gameside==1) ? winner = 2 : winner = 1;
                coordsArrayOfWinner = variantsArraysCellsCoords[i][j][q];
              }
              else {
                winningComboPower=0;
              }
            }
            else {
              winningComboPower=0;
            }
          }
        }
      }
    }
    // определить, имеет ли смысл продолжение игры(не возникла ли ничейная позиция)
    let comboLength = 0;
    let comboStatus = true;
    let draw = true;
    if (winner==undefined) {
      for (let i=0; i<variantsArrays[0].length; i++) {
        for (let j=0; j<variantsArrays[0].length; j++) {
          for (let q=0; q<8; q++) {
            if (variantsArrays[i][j][q].length==cellsToCapture) {
              comboStatus = true;
              comboLength = 0;
              for (let k=0; k<cellsToCapture; k++) {
                if (comboStatus) {
                  if (variantsArrays[i][j][q][k]==0) {
                    comboLength++;
                    comboStatus = true;
                  }
                  else if (variantsArrays[i][j][q][k]==gameside) {
                     if (comboStatus==gameside || comboStatus===true) {
                      comboLength++;
                      comboStatus = gameside;
                     }
                     else {
                      comboStatus = false;
                      comboLength = 0;
                     }
                  }
                  else if (variantsArrays[i][j][q][k]!=gameside) {
                    if (comboStatus!=gameside || comboStatus===true) {
                      comboLength++;
                      (gameside==1) ? comboStatus = 2 : comboStatus = 1;
                    }
                    else {
                      comboStatus = false;
                      comboLength = 0;
                    }
                  }
                }
              }
              if (Math.abs(comboLength)==3) {
                draw = false;
              }
            }
          }
        }
      }
    }
    if (draw && winner==undefined) {
      winner = 0;
    }
    console.log("длина комбинации победителя: ", winningComboPower);
    console.log("координаты клеток выигрышной комбинации: ", coordsArrayOfWinner);
    console.log("победитель: ", winner);
    return winner;
  }
}

function cpuTurn(gameSide, area, matrixArea, cellsToCapture) { // area - массив игрового поля ( 0-пустая клетка, 1-крестики, 2-нолики )
  let targetCellNumber = 0, // целевая клетка для хода компа
      targetCellPriority = 0; // здесь хранится максимальное значение массива приоритетов клеток ( по его номеру определяется, куда сделать ход )
  let variantsArrays = [], // массив вариантов выигрыша
      variantsArraysCellsCoords = [], // координаты ячеек в массиве вариантов
      prioritiesOfVariants; // приоритеты вариантов
  // заполняем матрицу значениями из массива игрового поля(area)
  let areaCellId = 0;
  for (let i=0; i<matrixArea[0].length; i++) {
    for (let j=0; j<matrixArea[0].length; j++) {
      matrixArea[i][j] = area[areaCellId];
      areaCellId++;
    }
  }
  areaCellId = 0;
  // создать четырехмерный массив из комбинаций символов по горизонтали, вертикали и диагоналям для каждой клетки сетки
  for (let i = 0; i<matrixArea[0].length; i++) { // для каждой ячейки матрицы клеток
    variantsArrays[i] = [];
    variantsArraysCellsCoords[i] = [];
    for (let j = 0; j<matrixArea[0].length; j++) {
      variantsArrays[i][j] = [];
      variantsArraysCellsCoords[i][j] = [];
      for (let q = 0; q < 8; q++) { // заполняем 7 массивов (7 вариантов выигрыша)
        variantsArrays[i][j][q] = [];
        variantsArraysCellsCoords[i][j][q] = [];
        for (let matrixrow = i-cellsToCapture+1; matrixrow<i+cellsToCapture; matrixrow++) { // a для этого снова перебираем матрицу клеток вокруг текущей клетки по часовой стрелке на расстоянии длины комбинации символов, необходимой для выигрыша
          for (let matrixcol = j-cellsToCapture+1; matrixcol<j+cellsToCapture; matrixcol++) {
            if (matrixrow>=0 && matrixcol>=0 && matrixrow<=matrixArea.length-1 && matrixcol<=matrixArea.length-1) {
              if (matrixcol==j && matrixrow<=i && q==0) { // вертикаль сверху
                variantsArrays[i][j][q].push(matrixArea[matrixrow][matrixcol]);
                variantsArraysCellsCoords[i][j][q].push([matrixrow,matrixcol]);
              }
              else if (matrixcol<=j+cellsToCapture-1 && matrixrow>=i-cellsToCapture+1 && matrixcol>=j && matrixrow<=i && q==1) { // квадрат сверху справа от целевой ячейки
                if (matrixrow==i && matrixcol==j) {
                  for (let k=0; k<cellsToCapture; k++) {
                    if (matrixrow-k>=0 && matrixcol+k<=matrixArea[0].length-1) { // диагональ вверх-вправо
                      variantsArrays[i][j][q].push(matrixArea[matrixrow-k][matrixcol+k]);
                      variantsArraysCellsCoords[i][j][q].push([matrixrow-k,matrixcol+k]);
                    }
                  }
                }
              }
              else if (matrixrow==i && matrixcol>=j && q==2) { // горизонталь справа
                variantsArrays[i][j][q].push(matrixArea[matrixrow][matrixcol]);
                variantsArraysCellsCoords[i][j][q].push([matrixrow,matrixcol]);
              }
              else if (matrixcol<=j+cellsToCapture-1 && matrixrow<=i+cellsToCapture-1 && matrixcol>=j && matrixrow>=i && q==3) { // квадрат снизу справа от целевой ячейки
                if (matrixrow==i && matrixcol==j) {
                  for (let k=0; k<cellsToCapture; k++) {
                    if (matrixrow+k<=matrixArea[0].length-1 && matrixcol+k<=matrixArea[0].length-1) { // диагональ вниз-вправо
                      variantsArrays[i][j][q].push(matrixArea[matrixrow+k][matrixcol+k]);
                      variantsArraysCellsCoords[i][j][q].push([matrixrow+k,matrixcol+k]);
                    }
                  }
                }
              }
              else if (matrixcol==j && matrixrow>=i && q==4) { // вертикаль снизу
                variantsArrays[i][j][q].push(matrixArea[matrixrow][matrixcol]);
                variantsArraysCellsCoords[i][j][q].push([matrixrow,matrixcol]);
              }
              else if (matrixcol>=j-cellsToCapture && matrixrow<=i+cellsToCapture && matrixcol<=j && matrixrow>=i && q==5) { // квадрат снизу слева от целевой ячейки
                if (matrixrow==i && matrixcol==j) {
                  for (let k=0; k<cellsToCapture; k++) {
                    if (matrixrow+k<=matrixArea[0].length-1 && matrixcol-k>=0) { // диагональ вниз-влево
                      variantsArrays[i][j][q].push(matrixArea[matrixrow+k][matrixcol-k]);
                      variantsArraysCellsCoords[i][j][q].push([matrixrow+k,matrixcol-k]);
                    }
                  }
                }
              }
              else if (matrixrow==i && matrixcol<=j && q==6) { // горизонталь cлева
                variantsArrays[i][j][q].push(matrixArea[matrixrow][matrixcol]);
                variantsArraysCellsCoords[i][j][q].push([matrixrow,matrixcol]);
              }
              else if (matrixrow>=i-cellsToCapture && matrixcol>=j-cellsToCapture && matrixrow<=i && matrixcol<=j && q==7) { // квадрат сверху слева от целевой ячейки
                if (matrixrow==i && matrixcol==j) {
                  for (let k=0; k<cellsToCapture; k++) {
                    if (matrixrow-k>=0 && matrixcol-k>=0) { // диагональ вверх-влево
                      variantsArrays[i][j][q].push(matrixArea[matrixrow-k][matrixcol-k]);
                      variantsArraysCellsCoords[i][j][q].push([matrixrow-k,matrixcol-k]);
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
  //инвертировать некоторые массивы variantsArrays
  for (let i = 0; i<matrixArea[0].length; i++) {
    for (let j = 0; j<matrixArea[0].length; j++) {
      for (let q = 0; q < 8; q++) {
        if (q==0 || q==6) {
         variantsArrays[i][j][q].reverse();
         variantsArraysCellsCoords[i][j][q].reverse();
        }
      }
    }
  }
  //console.log("варианты: ", variantsArrays);
  //console.log("координаты клеток в вариантах: ", variantsArraysCellsCoords);
  // определить приоритеты выбора каждого из вариантов
  if (prioritiesOfVariants==undefined) {
    prioritiesOfVariants = [];
  }
  for (let i=0; i<variantsArrays[0].length; i++) {
    if (prioritiesOfVariants[i]==undefined) {
      prioritiesOfVariants[i] = [];
    }
    for (let j=0; j<variantsArrays[0].length; j++) {
      if (prioritiesOfVariants[i][j]==undefined) {
        prioritiesOfVariants[i][j] = [];
      }
      for (let q=0; q<8; q++) {
        if (variantsArrays[i][j][q].length == cellsToCapture) {
          let variantPriority = 1;
          for (let k=0; k<variantsArrays[i][j][q].length; k++) {
            if (variantsArrays[i][j][q][k]==gameSide) {
              if (variantPriority==k) { // вариант, в котором все ячейки до текущей пустые, а текущая занята компом
                variantPriority=-1-k-3;
              }
              else if (variantPriority<-1-k) { // вариант, в котором одна из предыдущих ячеек занята компом и текущая занята компом
                variantPriority-=Math.pow(4,cellsToCapture);
              }
              else if (variantPriority>1+k) { // вариант, в котором одна из предыдущих ячеек занята игроком, а текущая занята компом
                variantPriority = 0;
              }
              else { // вариант, в котором текущая ячейка является единственной и занята компом
                variantPriority = -3;
              }
              /*if (variantPriority<=-3) {
                variantPriority-=Math.pow(4, cellsToCapture);
              }
              else {
                if (k==0) {
                  variantPriority=-3;
                }
                else {
                  variantPriority=-3-variantPriority;
                }
              }*/
            }
            else if (variantsArrays[i][j][q][k]!=gameSide && variantsArrays[i][j][q][k]!=0) {
              if (variantPriority==k) { // вариант, в котором все ячейки до текущей пустые, а текущая занята игроком
                variantPriority=k+3;
              }
              else if (variantPriority<-1-k) { // вариант, в котором одна из предыдущих ячеек занята компом, а текущая занята игроком
                variantPriority = 0;
              }
              else if (variantPriority>1+k) { // вариант, в котором одна из предыдущих ячеек занята игроком и текущая занята игроком
                variantPriority+=Math.pow(3,cellsToCapture);
              }
              else { // вариант, в котором текущая ячейка является единственной и занята игроком
                variantPriority = 3;
              }
              /*if (variantPriority>=4) {
                variantPriority+=Math.pow(3, cellsToCapture);
              }
              else {
                if (k==0) {
                  variantPriority=4;
                }
                else {
                  variantPriority=4+variantPriority;
                }
              }*/
            }
            else if (variantsArrays[i][j][q][k]==0 && variantPriority<0) { // вариант, в котором текущая ячейка пустая, а одна из предыдущих занята компом
              variantPriority-=1;
              /*if (k==0) {
                variantPriority=-1;
              }
              else {
                variantPriority-=1;
              }*/
            }
            else if (variantsArrays[i][j][q][k]==0 && variantPriority>0) { // вариант, в котором текущая ячейка пустая, а одна из предыдущих занята игроком
              if (k!=0) {
                variantPriority+=1;
              }
              else {
                variantPriority=1;
              }
              /*if (k==0) {
                variantPriority=1;
              }
              else {
                variantPriority+=1;
              }*/
            }
          }
          prioritiesOfVariants[i][j][q] = variantPriority;
          variantPriority=0;
        }
        else {
          prioritiesOfVariants[i][j][q] = 0;
        }
      }
    }
  }
  console.log("приоритеты вариантов без учета приоритетов клеток: ", prioritiesOfVariants);
  // по матрице приоритетов вариантов найти ячейки с максимальным приоритетом
  let cellsPriorities = [];
  for (let i=0; i<matrixArea[0].length; i++) {
    cellsPriorities[i] = [];
    for (let j=0; j<matrixArea[0].length; j++) {
      cellsPriorities[i][j]=0;
    }
  }
  //console.log("пустой массив приоритетов клеток: ", cellsPriorities);
  for (let i=0; i<variantsArrays[0].length; i++) {
    for (let j=0; j<variantsArrays[0].length; j++) {
      for (let q=0; q<8; q++) {
        if (variantsArrays[i][j][q].length == cellsToCapture) {
          //if (matrixArea[i][j]==0) {
            for(let k=0; k<variantsArrays[i][j][q].length; k++) {
              if (variantsArrays[i][j][q][k]==0) {
                switch (q) {
                  case 0:
                    cellsPriorities[i-k][j]+=Math.abs(prioritiesOfVariants[i][j][q]);
                  break;
                  case 1:
                    cellsPriorities[i-k][j+k]+=Math.abs(prioritiesOfVariants[i][j][q]);
                  break;
                  case 2:
                    cellsPriorities[i][j+k]+=Math.abs(prioritiesOfVariants[i][j][q]);
                  break;
                  case 3:
                    cellsPriorities[i+k][j+k]+=Math.abs(prioritiesOfVariants[i][j][q]);
                  break;
                  case 4:
                    cellsPriorities[i+k][j]+=Math.abs(prioritiesOfVariants[i][j][q]);
                  break;
                  case 5:
                    cellsPriorities[i+k][j-k]+=Math.abs(prioritiesOfVariants[i][j][q]);
                  break;
                  case 6:
                    cellsPriorities[i][j-k]+=Math.abs(prioritiesOfVariants[i][j][q]);
                  break;
                  case 7:
                    cellsPriorities[i-k][j-k]+=Math.abs(prioritiesOfVariants[i][j][q]);
                  break;
                }
              }
            //}
            //cellsPriorities[i][j]+=Math.abs(prioritiesOfVariants[i][j][q]);
          }
        }
      }
    }
  }
  console.log("приоритеты клеток: ", cellsPriorities);
   // найти приоритеты вариантов с учетом приоритетов клеток
   let resultPrioritiesOfVariants = [];
   let maxPriorityVariants = [];
   let maxPriorityOfVariants = 0;
   let maxPriorityVariantsQuantity = 0;
   let maxPriorityVariantId = 0;
   let negativeMaxPriority = false;
   for (let i=0; i<variantsArrays[0].length; i++) {
    resultPrioritiesOfVariants[i] = [];
     for (let j=0; j<variantsArrays[0].length; j++) {
      resultPrioritiesOfVariants[i][j] = [];
       for(let q=0; q<8; q++) {
         if (variantsArrays[i][j][q].length == cellsToCapture) {
            let currentVariantPriority = 0;
            for(let k=0; k<variantsArrays[i][j][q].length; k++) {
              switch (q) {
                case 0:
                  currentVariantPriority+=cellsPriorities[i-k][j];
                break;
                case 1:
                  currentVariantPriority+=cellsPriorities[i-k][j+k];
                break;
                case 2:
                  currentVariantPriority+=cellsPriorities[i][j+k];
                break;
                case 3:
                  currentVariantPriority+=cellsPriorities[i+k][j+k];
                break;
                case 4:
                  currentVariantPriority+=cellsPriorities[i+k][j];
                break;
                case 5:
                  currentVariantPriority+=cellsPriorities[i+k][j-k];
                break;
                case 6:
                  currentVariantPriority+=cellsPriorities[i][j-k];
                break;
                case 7:
                  currentVariantPriority+=cellsPriorities[i-k][j-k];
                break;
              }
            }
            resultPrioritiesOfVariants[i][j][q] = currentVariantPriority;
          }
       }
     }
   }
   console.log("приоритеты вариантов с учетом приоритетов клеток: ", resultPrioritiesOfVariants);
   // найти максимальный приоритет варианта
   for (let i=0; i<resultPrioritiesOfVariants[0].length; i++) {
     for (let j=0; j<resultPrioritiesOfVariants[0].length; j++) {
       for(let q=0; q<8; q++) {
         if (resultPrioritiesOfVariants[i][j][q] > maxPriorityOfVariants) {
            maxPriorityOfVariants = resultPrioritiesOfVariants[i][j][q];
         }
       }
     }
   }
   console.log("максимальный приоритет варианта: ", maxPriorityOfVariants);
   // найти варианты с максимальным приоритетом
   for (let i=0; i<resultPrioritiesOfVariants[0].length; i++) {
     maxPriorityVariants[i] = []
     for (let j=0; j<resultPrioritiesOfVariants[0].length; j++) {
       maxPriorityVariants[i][j] = [];
       for(let q=0; q<8; q++) {
         maxPriorityVariants[i][j][q] = [];
         if (resultPrioritiesOfVariants[i][j][q] == maxPriorityOfVariants) {
           for (let k=0; k<variantsArrays[i][j][q].length; k++) {
               maxPriorityVariants[i][j][q].push(variantsArrays[i][j][q][k]);
           }
           maxPriorityVariantsQuantity++;
         }
       }
     }
   }
   console.log("матрица вариантов с максимальным приоритетом: ", maxPriorityVariants);
   // найти случайный вариант с максимальным приоритетом
   maxPriorityVariantId = Math.floor(Math.random()*maxPriorityVariantsQuantity);
   console.log("номер случайного варианта с максимальным приоритетом: ", maxPriorityVariantId);
   // находим выбранный случайный вариант в матрице вариантов (номера строки и столбца ячейки, из которой начинается вариант и его номер его направления (по часовой стрелке) относительно этой ячейки)
  let variantId = 0;
  let initialCellRow, initialCellCol, initialCellVectorId; // координаты ячейки и направление вектора случайного варианта с максимальным приоритетом
  for (let i=0; i<maxPriorityVariants[0].length; i++) {
    for (let j=0; j<maxPriorityVariants[0].length; j++) {
      for(let q=0; q<8; q++) {
        if (initialCellRow==undefined || initialCellCol==undefined || initialCellVectorId==undefined) {
          if (maxPriorityVariants[i][j][q].length > 0) {
            if (variantId == maxPriorityVariantId) {
              initialCellRow = i;
              initialCellCol = j;
              initialCellVectorId = q;
            }
            else {
              variantId++;
            }
          }
        }
      }
    }
  }
  console.log("координаты ячейки и направление вектора случайного варианта с максимальным приоритетом: ", initialCellRow, ", ", initialCellCol, ", ", initialCellVectorId);
  // в матрице ячеек найти номер строки и столбца ячейки с максимальным приоритетом по варианту с максимальным приоритетом
  let maxCellPriority = 0;
  let targetCellRow, targetCellCol;
  for (let k=0; k<cellsToCapture; k++) {
    switch (initialCellVectorId) {
      case 0:
        if (cellsPriorities[initialCellRow-k][initialCellCol] > maxCellPriority && matrixArea[initialCellRow-k][initialCellCol]==0) {
          maxCellPriority = cellsPriorities[initialCellRow-k][initialCellCol];
          targetCellRow = initialCellRow-k;
          targetCellCol = initialCellCol;
        }
      break;
      case 1:
        if (cellsPriorities[initialCellRow-k][initialCellCol+k] > maxCellPriority && matrixArea[initialCellRow-k][initialCellCol+k]==0) {
          maxCellPriority = cellsPriorities[initialCellRow-k][initialCellCol+k];
          targetCellRow = initialCellRow-k;
          targetCellCol = initialCellCol+k;
        }
      break;
      case 2:
        if (cellsPriorities[initialCellRow][initialCellCol+k] > maxCellPriority && matrixArea[initialCellRow][initialCellCol+k]==0) {
          maxCellPriority = cellsPriorities[initialCellRow][initialCellCol+k];
          targetCellRow = initialCellRow;
          targetCellCol = initialCellCol+k;
        }
      break;
      case 3:
        if (cellsPriorities[initialCellRow+k][initialCellCol+k] > maxCellPriority && matrixArea[initialCellRow+k][initialCellCol+k]==0) {
          maxCellPriority = cellsPriorities[initialCellRow+k][initialCellCol+k];
          targetCellRow = initialCellRow+k;
          targetCellCol = initialCellCol+k;
        }
      break;
      case 4:
        if (cellsPriorities[initialCellRow+k][initialCellCol] > maxCellPriority && matrixArea[initialCellRow+k][initialCellCol]==0) {
          maxCellPriority = cellsPriorities[initialCellRow+k][initialCellCol];
          targetCellRow = initialCellRow+k;
          targetCellCol = initialCellCol;
        }
      break;
      case 5:
        if (cellsPriorities[initialCellRow+k][initialCellCol-k] > maxCellPriority && matrixArea[initialCellRow+k][initialCellCol-k]==0) {
          maxCellPriority = cellsPriorities[initialCellRow+k][initialCellCol-k];
          targetCellRow = initialCellRow+k;
          targetCellCol = initialCellCol-k;
        }
      break;
      case 6:
        if (cellsPriorities[initialCellRow][initialCellCol-k] > maxCellPriority && matrixArea[initialCellRow][initialCellCol-k]==0) {
          maxCellPriority = cellsPriorities[initialCellRow][initialCellCol-k];
          targetCellRow = initialCellRow;
          targetCellCol = initialCellCol-k;
        }
      break;
      case 7:
        if (cellsPriorities[initialCellRow-k][initialCellCol-k] > maxCellPriority && matrixArea[initialCellRow-k][initialCellCol-k]==0) {
          maxCellPriority = cellsPriorities[initialCellRow-k][initialCellCol-k];
          targetCellRow = initialCellRow-k;
          targetCellCol = initialCellCol-k;
        }
      break;
    }
  }
  console.log("номер строки целевой ячейки: ", targetCellRow);
  console.log("номер столбца целевой ячейки ", targetCellCol);
  // определить порядковый номер целевой ячейки в массиве area, если известны номер ее строки и столбца из матрицы matrixArea
  for (let i = 0; i < matrixArea.length; i++) {
    for (let j = 0; j < matrixArea.length; j++) {
      if (i!=targetCellRow || j!=targetCellCol) {
        targetCellNumber++;
      }
      else {
        return targetCellNumber;
      }
    }
  }
  console.log("порядковый номер ячейки в одномерном массиве(area), в которую сделать ход", targetCellNumber);
  return targetCellNumber;
}
