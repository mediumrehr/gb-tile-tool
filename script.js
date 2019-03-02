pixels = [];

numPixels = 8
neighborPixels = 2;

generateMultiTable('multi-pixels-table', 1, 3);
//generateMini();

function generateTable(divID, numRows, numCols) {
  table = document.getElementById(divID);
  
  for (var rows=0; rows<numRows; rows++) {
    var arrRow = [];
    var tabRow = table.insertRow();
    for (var cells=0; cells<numCols; cells++) {
      var arrCell = 0;
      var tabCell = tabRow.insertCell();
      if ((rows >= neighborPixels) && (rows < (neighborPixels + numPixels)) && (cells >= neighborPixels) && (cells < (neighborPixels + numPixels))) {
        tabCell.classList.add("white");
        tabCell.setAttribute("value", 0);
        tabCell.setAttribute("name", rows + "-" + cells);
        tabCell.onclick = function () { cycleCellColor(this); }
        arrRow.push(arrCell);
      } else {
        if ((rows == (neighborPixels - 1)) && (cells >= neighborPixels) && (cells < (neighborPixels + numPixels))) {
          tabCell.setAttribute("style", "border-bottom-color: black;")
        } else if ((cells == (neighborPixels - 1)) && (rows >= neighborPixels) && (rows < (neighborPixels + numPixels))) {
          tabCell.setAttribute("style", "border-right-color: black;")
        }
        tabCell.classList.add("neighbor");
      }
    }
    if ((rows >= neighborPixels) && (rows < (neighborPixels + numPixels))){
      pixels.push(arrRow);
    }
  }
}

function generateMultiTable(divID, numRowTiles, numColTiles) {
  table = document.getElementById(divID);
  
  totalRows = numRowTiles * 8;
  totalCols = numColTiles * 8;
  
  for (var rows=0; rows<totalRows; rows++) {
    var pixelRow = [];
    var tabRow = table.insertRow();
    for (var cells=0; cells<totalCols; cells++) {
      var pixelCell = 0;
      var tabCell = tabRow.insertCell();

      tabCell.classList.add("white");
      tabCell.setAttribute("value", 0);
      tabCell.setAttribute("name", rows + "-" + cells);
      tabCell.onclick = function () { cycleCellColor(this); }
      
      pixelRow.push(pixelCell);

      borderStyle = "border-color: transparent";
      if (document.getElementById("showGrid").checked) {
        borderStyle = "border-color: #aaa;";
        if (rows == 0) {
          borderStyle += "border-top-color: black;"
        }
        if (cells == 0) {
          borderStyle += "border-left-color: black;"
        }
        if ((rows % 8) == 7) {
          borderStyle += "border-bottom-color: black;"
        }
        if ((cells % 8) == 7) {
          borderStyle += "border-right-color: black;"
        }
      } 
      tabCell.setAttribute("style", borderStyle);
    }
    pixels.push(pixelRow);
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

function genTile() {
  input = document.getElementById("2BPP");
  table = document.getElementById("multi-pixels-table");

  var TBPPText = input.value;

  if (TBPPText != "") {
    // update pixels array
    pixels = [];
    TBPPVals = TBPPText.substring(1).split(", $");
    for (var i=0; i<TBPPVals.length; i+=2) {
      var leastSig = parseInt(TBPPVals[i], 16);
      var mostSig = parseInt(TBPPVals[i + 1], 16);
      var newRow = []
      for (var j=7; j>=0; j--) {
        var pixelVal = (((mostSig>>j)&0x1)<<1) + ((leastSig>>j)&0x1);
        newRow.push(pixelVal);
      }
      pixels.push(newRow);
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
    if (checkbox.checked) {

    } else {

    }
}
