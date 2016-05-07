
(function() {
	'use strict';

	var chess = document.getElementById('chess');
	var context = chess.getContext('2d');
	var width = chess.width;
	var lineNum = 15;
	var padding = 15;
	var gap = (width-2*padding) / (lineNum-1);
	var me = true;
	var chessBoard = [];
	var over = false;  // gameover

	var wins = [];  // store all the win situations
	var myWin = [];
	var computerWin = [];
	var count = 0;

	var initChessBoard = function() {
		var i, j, k;

		for (i = 0; i < lineNum; i++) {
			chessBoard[i] = [];
			for (j = 0; j < lineNum; j++) {
				chessBoard[i][j] = 0;
			}
		}

		// draw chessboard
		context.strokeStyle = "#bfbfbf";
		for (i=0; i<lineNum; i++) {
			context.moveTo(padding+i*gap, padding);
			context.lineTo(padding+i*gap, width-padding);
			context.stroke();
			context.moveTo(padding, padding+i*gap);
			context.lineTo(width-padding, padding+i*gap);
			context.stroke();		
		}

		// init wins
		for (i = 0; i < lineNum; i++) {
			wins[i] = [];
			for (j = 0; j < lineNum; j++) {
				wins[i][j] = [];
			}
		}

		// horizontal wins
		for (i = 0; i < lineNum; i++) {
			for (j = 0; j < lineNum - 4; j++) {
				for (k = 0; k<5; k++) {
					wins[i][j+k][count] = true;
				}
				count++;
			}
		}

		// vertical
		for (i = 0; i<lineNum; i++) {
			for (j=0; j<lineNum-4; j++) {
				for (k=0; k<5; k++) {
					wins[j+k][i][count] = true;
				}
				count++;
			}
		}

		// forward slash
		for (i=0; i<lineNum-4; i++) {
			for (j=0; j<lineNum-4; j++) {
				for (k=0; k<5; k++) {
					wins[i+k][j+k][count] = true;
				}
				count++;
			}
		}

		// backslash
		for (i = 0; i<lineNum-4; i++) {
			for (j=lineNum-1; j>3; j--) {
				for (k=0; k<5; k++) {
					wins[i+k][j-k][count] = true;
				}
				count++;
			}
		}

		for (i=0; i<count; i++) {
			myWin[i] = 0;
			computerWin[i] = 0;
		}
	}
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
		if (over) {
			return false;
		}
		if (!me) {
			return;
		}
		var x = e.offsetX;
		var y = e.offsetY;
		var i = Math.floor(x / 30);
		var j = Math.floor(y / 30);

		if (chessBoard[i][j] === 0) {
			oneStep(i, j, me);
			chessBoard[i][j] = 1;

			for (var k=0; k<count; k++) {
				if (wins[i][j][k]) {
					myWin[k]++;
					computerWin[k] = 6;  // lose
					if (myWin[k] == 5) {
						alert('You win');
						over = true;
					}
				}
			}
			if (!over) {
				me = !me;
				computerAI();
			}
		}
	}

	var computerAI = function() {
		var myScore = [];
		var computerScore = [];
		var max = 0;
		var u = 0, v = 0;
		var i, j, k, score;
		for (i=0; i<lineNum; i++) {
			myScore[i] = [];
			computerScore[i] = [];
			for(j=0; j<lineNum; j++) {
				myScore[i][j] = 0;
				computerScore[i][j] = 0;
			}
		}
		for (i=0; i<lineNum; i++) {
			for (j=0; j<lineNum; j++) {
				if (chessBoard[i][j] == 0) {
					for (k = 0; k<count; k++) {
						if (wins[i][j][k]) {
							switch (myWin[k]) {
								case 1:
									score = 200;
									break;
								case 2:
									score = 400;
									break;
								case 3:
									score = 2000;
									break;
								case 4:
									score = 10000;
									break;
								default:
									score = 0;
									break;
							}
							myScore[i][j] += score;

							switch (computerWin[k]) {
								case 1:
									score = 220;
									break;
								case 2:
									score = 420;
									break;
								case 3:
									score = 2100;
									break;
								case 4:
									score = 20000;
									break;
								default:
									score = 0;
									break;
							}
							computerScore[i][j] += score;
						}
					}

					if (myScore[i][j] > max) {
						max = myScore[i][j];
						u = i;
						v = j;
					} else if (myScore[i][j] == max) {
						if (computerScore[i][j] > computerScore[u][v]) {
							u = i;
							v = j;
						}
					}

					if (computerScore[i][j] > max) {
						max = computerScore[i][j];
						u = i;
						v = j;
					} else if (computerScore[i][j] == max) {
						if (myScore[i][j] > myScore[u][v]) {
							u = i;
							v = j;
						}
					}
				}
			}
		}
		oneStep(u, v, me);
		chessBoard[u][v] = 2;
		for (k=0; k<count; k++) {
			if (wins[u][v][k]) {
				computerWin[k]++;
				myWin[k] = 6;  // lose
				if (computerWin[k] == 5) {
					alert('Computer win');
					over = true;
				}
			}
		}
		if (!over) {
			me = !me;
		}
	};


})();