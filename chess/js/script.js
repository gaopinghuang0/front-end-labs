
(function() {
	var chess = document.getElementById('chess');
	var context = chess.getContext('2d');
	var width = chess.width;
	var lineNum = 15;
	var padding = 15;
	var gap = (width-2*padding) / (lineNum-1);
	var me = true;
	var chessBoard = [];

	var initChessBoard = function() {
		for (var i = 0; i < lineNum; i++) {
			chessBoard[i] = [];
			for (var j = 0; j < lineNum; j++) {
				chessBoard[i][j] = 0;
			}
		}

		context.strokeStyle = "#bfbfbf";
		for (var i=0; i<lineNum; i++) {
			context.moveTo(padding+i*gap, padding);
			context.lineTo(padding+i*gap, width-padding);
			context.stroke();
			context.moveTo(padding, padding+i*gap);
			context.lineTo(width-padding, padding+i*gap);
			context.stroke();		
		}
	};
	initChessBoard();

	var oneStep = function(i, j, me) {
		context.beginPath();
		context.arc(padding + i*gap, padding + j*gap, 13, 0, 2 * Math.PI);
		context.closePath();
		var gradient = context.createRadialGradient(padding + i*gap + 2, padding + j*gap - 2, 13, padding + i*gap + 2, padding + j*gap - 2, 0);
		if (me) {
			gradient.addColorStop(0, '#0a0a0a');  // first
			gradient.addColorStop(1, '#636766');
		} else {
			gradient.addColorStop(0, '#d1d1d1');  // first
			gradient.addColorStop(1, '#f9f9f9');
		}
		context.fillStyle = gradient;
		context.fill();
	}

	chess.onclick = function(e) {
		var x = e.offsetX;
		var y = e.offsetY;
		var i = Math.floor(x / 30);
		var j = Math.floor(y / 30);

		if (chessBoard[i][j] === 0) {
			oneStep(i, j, me);
			if (me) {
				chessBoard[i][j] = 1;
			} else {
				chessBoard[i][j] = 2;
			}
			me = !me;
		}
	}



})();