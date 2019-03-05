/** defines/inits **/

// max dimensions
var MAXROW = 2;
var MAXCOL = 3;

// generate pixel array (2 rows x 3 cols)
var pixels = generatePixelArray(MAXROW, MAXCOL);

// 0: cycle; 1: paint selected color
var paintMode = 0;
var paintColor = 0;

// create pixel artboard
var numRowTiles = document.getElementById("numRowTiles").value;
var numColTiles = document.getElementById("numColTiles").value
generateArtboard('multi-pixels-table', numRowTiles, numColTiles);

//generateMini();

// set up listeners for artboard dimension change
document.addEventListener('DOMContentLoaded', function() {
  document.querySelector('input[name="numRowTiles"]').onchange=updateArtboard;
}, false);

document.addEventListener('DOMContentLoaded', function() {
  document.querySelector('input[name="numColTiles"]').onchange=updateArtboard;
}, false);

/** functions **/

function generatePixelArray(rowTiles, colTiles) {
  var rows = rowTiles * 8;
  var cols = colTiles * 8;
  var newPixelArray = [];

  for (var row=0; row<rows; row++) {
    newRowArray = [];
    for (var col=0; col<cols; col++) {
      newRowArray.push(0);
    }
    newPixelArray.push(newRowArray);
  }
  return newPixelArray;
}

function generateArtboard(divID, numRowTiles, numColTiles) {
  table = document.getElementById(divID);
  
  totalRows = numRowTiles * 8;
  totalCols = numColTiles * 8;
  
  for (var row=0; row<totalRows; row++) {
    var pixelRow = pixels[row];
    var tabRow = table.insertRow();
    for (var col=0; col<totalCols; col++) {
      var pixelCell = 0;
      var tabCell = tabRow.insertCell();

      setCellColor(tabCell, pixelRow[col]);
      tabCell.setAttribute("value", pixelRow[col]);
      tabCell.setAttribute("name", row + "-" + col);
      tabCell.onclick = function () { changeCellColor(this); }

      borderStyle = "border-color: transparent";
      if (document.getElementById("showGrid").checked) {
        borderStyle = "border-color: #aaa;";
        if (row == 0) {
          borderStyle += "border-top-color: black;"
        }
        if (col == 0) {
          borderStyle += "border-left-color: black;"
        }
        if ((row % 8) == 7) {
          borderStyle += "border-bottom-color: black;"
        }
        if ((col % 8) == 7) {
          borderStyle += "border-right-color: black;"
        }
      } 
      tabCell.setAttribute("style", borderStyle);
    }
  }
}

function generateMini() {
  var c = document.getElementById("preview-canvas");
  var ctx = c.getContext("2d");
  ctx.clearRect(0, 0, 48, 48);
  
  var pixSize = 2;
  var numTiles = 3;
  for (var tilesX=0; tilesX<numTiles; tilesX++) {
    for (var tilesY=0; tilesY<numTiles; tilesY++) {
      for (var rows=0; rows<numPixels; rows++) {
        for (var cols=0; cols<numPixels; cols++) {
          pixVal = pixels[rows][cols];
          if (pixVal) {
            switch(pixVal) {
              case 1:
                ctx.fillStyle = '#BBB';
                break;
              case 2:
                ctx.fillStyle = '#666';
                break;
              case 3:
                ctx.fillStyle = '#000';
                break;
              default:
                break;
            }
            ctx.fillRect((cols + tilesY*numPixels)*pixSize, (rows + tilesX*numPixels)*pixSize, pixSize, pixSize);
          }
        }
      }
    }
  }
  ctx.stroke();
}

function setCellColor(cell, colorValue) {
  cell.classList.remove("white", "lightGrey", "darkGrey", "black");
  switch(colorValue) {
    case 0:
      cell.classList.add("white");
      break;
    case 1:
      cell.classList.add("lightGrey");
      break;
    case 2:
      cell.classList.add("darkGrey");
      break;
    case 3:
      cell.classList.add("black");
      break;
    default:
      cell.classList.add("white");
      break;
  }
}

function changeCellColor(cell) {
  switch(paintMode) {
    case 0: // cycle
      cycleCellColor(cell);
      break;
    case 1:
      paintCellColor(cell);
      break;

    default:
      break;
  }
}

function cycleCellColor(cell) {
  var cellValue = parseInt(cell.getAttribute("value"));
  var cellRow = parseInt(cell.getAttribute("name").split("-")[0]);
  var cellCol = parseInt(cell.getAttribute("name").split("-")[1]);
  
  cellValue = (cellValue + 1) % 4;
  pixels[cellRow][cellCol] = cellValue;
  cell.setAttribute("value", cellValue);
  setCellColor(cell, cellValue);
  //generateMini();
};

function paintCellColor(cell) {
  var cellRow = parseInt(cell.getAttribute("name").split("-")[0]);
  var cellCol = parseInt(cell.getAttribute("name").split("-")[1]);
  
  pixels[cellRow][cellCol] = paintColor;
  cell.setAttribute("value", paintColor);
  setCellColor(cell, paintColor);
  //generateMini();
}

function gen2BPP() {
  output = document.getElementById("2BPP");
  var TBPPText = "";
  
  for (var rows=0; rows<8; rows++) {
    leastSig = 0;
    mostSig = 0;
    for (var cols=0; cols<8; cols++) {
      var pixelVal = pixels[rows][7 - cols];
      switch(pixelVal) {
        case 1:
          leastSig |= 1<<cols;
          break;
        case 2:
          mostSig  |= 1<<cols;
          break;
        case 3:
          leastSig |= 1<<cols;
          mostSig  |= 1<<cols;
          break;
        default:
          break;
      }
    }
    TBPPText += "$" + leastSig.toString(16) + ", $" + mostSig.toString(16) + ", ";
  }
  TBPPText = TBPPText.toUpperCase().substring(0, TBPPText.length - 2);
  output.value = TBPPText;
}

// only generates for top left tile right now
function genTile() {
  input = document.getElementById("2BPP");
  table = document.getElementById("multi-pixels-table");

  var TBPPText = input.value;

  if (TBPPText != "") {
    // parse input
    TBPPVals = TBPPText.substring(1).split(", $");
    var numBytes = Math.floor(TBPPVals.length/2)*2; // make sure even
    // update pixels array
    for (var i=0; i<numBytes; i+=2) {
      var leastSig = parseInt(TBPPVals[i], 16);
      var mostSig = parseInt(TBPPVals[i + 1], 16);
      var row = pixels[i/2];
      for (var j=7; j>=0; j--) {
        var pixelVal = (((mostSig>>j)&0x1)<<1) + ((leastSig>>j)&0x1);
        row[7-j] = pixelVal;
      }
    }

    // redraw cells
    for (var i=0; i<8; i++) {
      for (var j=0; j<8; j++) {
        var cell = table.rows[i].cells[j];
        var newCellVal = pixels[i][j];
        setCellColor(cell, newCellVal);
        cell.setAttribute("value", newCellVal);
      }
    }

    // redraw mini
    //generateMini();
  }
}

function showGrid(checkbox) {
  var table = document.getElementById("multi-pixels-table");
  var rows = table.rows.length;
  var cols = table.rows[0].cells.length;

  if (checkbox.checked) {
    for (var row=0; row<rows; row++) {
      for (var col=0; col<cols; col++) {
        borderStyle = "border-color: #aaa;";
        if (row == 0) {
          borderStyle += "border-top-color: black;"
        }
        if (col == 0) {
          borderStyle += "border-left-color: black;"
        }
        if ((row % 8) == 7) {
          borderStyle += "border-bottom-color: black;"
        }
        if ((col % 8) == 7) {
          borderStyle += "border-right-color: black;"
        }
        table.rows[row].cells[col].setAttribute("style", borderStyle);
      }
    }
  } else {
    for (var row=0; row<rows; row++) {
      for (var col=0; col<cols; col++) {
        borderStyle = "border-color: transparent;";
        table.rows[row].cells[col].setAttribute("style", borderStyle);
      }
    }
  }
}

function copy2BPPText() {
  var TBPPText = document.getElementById("2BPP");
  TBPPText.select();
  document.execCommand("copy");
}

function updateArtboard(e) {
  // get new dimensions
  var numRowTiles = document.getElementById("numRowTiles").value;
  var numColTiles = document.getElementById("numColTiles").value;

  // make sure new dimensions are within acceptable size
  if (numRowTiles < 1) { numRowTiles = 1; }
  else if (numRowTiles > MAXROW) { numRowTiles = MAXROW; }
  document.getElementById("numRowTiles").value = numRowTiles;

  if (numColTiles < 1) { numColTiles = 1; }
  else if (numColTiles > MAXCOL) { numColTiles = MAXCOL; }
  document.getElementById("numColTiles").value = numColTiles;

  // clear table
  document.getElementById("multi-pixels-table").innerHTML = "";

  // generate updated table
  generateArtboard('multi-pixels-table', numRowTiles, numColTiles);
}

function changeColor(colorSquare) {
  var colorSquares = document.getElementsByClassName("color-square");
  switch(colorSquare.id) {
    case "white-color":
      paintColor = 0;
      break;

    case "lightGrey-color":
      paintColor = 1;
      break;

    case "darkGrey-color":
      paintColor = 2;
      break;

    case "black-color":
      paintColor = 3;
      break;

    default:
      paintColor = 0;
      break;
  }

  for (var i=0; i<colorSquares.length; i++) {
    colorSquares[i].classList.remove("selected");
  }

  colorSquare.classList.add("selected");
}

function updatePaintMode(radioButton) {
  paintMode = parseInt(radioButton.value);
}
