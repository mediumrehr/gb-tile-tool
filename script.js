pixels = [];

numPixels = 8
neighborPixels = 2;

generateTable('pixels-table', neighborPixels*2 + numPixels, neighborPixels*2 + numPixels);
generateMini();

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
  var cellRow = parseInt(cell.getAttribute("name").split("-")[0]) - neighborPixels;
  var cellCol = parseInt(cell.getAttribute("name").split("-")[1]) - neighborPixels;
  
  cellValue = (cellValue + 1) % 4;
  pixels[cellRow][cellCol] = cellValue;
  cell.setAttribute("value", cellValue);
  setCellColor(cell, cellValue);
  updateNeighbors();
  generateMini();
};

function cycleCellColor2(cell) {
  var cellValue = parseInt(cell.getAttribute("value"));
  cellValue = (cellValue + 1) % 4;
  cell.setAttribute("value", cellValue);
  setCellColor(cell, cellValue);
};

function updateNeighbors() {
  table = document.getElementById('pixels-table');
  rowStart = numPixels - neighborPixels;
  fullHeight = numPixels + neighborPixels*2;
  
  // update top
  for (var i=0; i<neighborPixels; i++) {
    for (var j=0; j<numPixels; j++) {
      var cell = table.rows[i].cells[neighborPixels + j];
      setCellColor(cell, pixels[rowStart + i][j]);
    }
  }
  
  // update bottom
  for (var i=0; i<neighborPixels; i++) { // rows
    for (var j=0; j<numPixels; j++) { // cols
      var cell = table.rows[neighborPixels + numPixels + i].cells[neighborPixels + j];
      setCellColor(cell, pixels[i][j]);
    }
  }

  // update right
  for (var i=0; i<fullHeight; i++) {
    for (var j=0; j<neighborPixels; j++) {
      var cell = table.rows[i].cells[numPixels + neighborPixels + j];
      if (table.rows[i].cells[neighborPixels + j].classList.contains("white")) {
        setCellColor(cell, 0);
      } else if (table.rows[i].cells[neighborPixels + j].classList.contains("lightGrey")) {
        setCellColor(cell, 1);
      } else if (table.rows[i].cells[neighborPixels + j].classList.contains("darkGrey")) {
        setCellColor(cell, 2);
      } else {
        setCellColor(cell, 3);
      }
    }
  }

  // update left
  for (var i=0; i<fullHeight; i++) {
    for (var j=0; j<neighborPixels; j++) {
      var cell = table.rows[i].cells[j];
      if (table.rows[i].cells[numPixels + j].classList.contains("white")) {
        setCellColor(cell, 0);
      } else if (table.rows[i].cells[numPixels + j].classList.contains("lightGrey")) {
        setCellColor(cell, 1);
      } else if (table.rows[i].cells[numPixels + j].classList.contains("darkGrey")) {
        setCellColor(cell, 2);
      } else {
        setCellColor(cell, 3);
      }
    }
  }
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

function gen2BPP() {
  output = document.getElementById("2BPP");
  var TBPPText = "";
  
  for (var rows=0; rows<numPixels; rows++) {
    leastSig = 0;
    mostSig = 0;
    for (var cols=0; cols<numPixels; cols++) {
      var pixelVal = pixels[rows][numPixels - cols - 1];
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
  table = document.getElementById("pixels-table");

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
    for (var i=2; i<10; i++) {
      for (var j=2; j<10; j++) {
        var cell = table.rows[i].cells[j];
        var newCellVal = pixels[i-2][j-2];
        setCellColor(cell, newCellVal);
        cell.setAttribute("value", newCellVal);
      }
    }

    // redraw mini
    generateMini();
  }
}

function showNeighbors(checkbox) {
    if (checkbox.checked) {
        var neighbors = document.getElementsByClassName("neighbor");
        while(neighbors.length > 0) {
        	neighbors[0].classList.add("neighbor-hidden");
        	neighbors[0].classList.remove("neighbor");
        }
    } else {
    	var neighbors = document.getElementsByClassName("neighbor-hidden");
        while(neighbors.length > 0) {
        	neighbors[0].classList.add("neighbor");
        	neighbors[0].classList.remove("neighbor-hidden");
        }
    }
}
