class Game {
  constructor(playTime = 60) {
    this.score = 0;
    this.guesses = [];
    this.playTime = playTime;
    this.timeRemaining = this.playTime;
  }

  updateTime = () => {
    if (this.timeRemaining > -1) {
      $("#timer").text(this.timeRemaining);
      this.timeRemaining -= 1;
      setTimeout(this.updateTime, 1000);
    } else {
      this.gameOver(this.score);
    }
  };

  gameOver = (score) => {
    player.saveScoreAndUpdate(score);
    $("#word").prop("disabled", true);
    $("#guess button").prop("disabled", true);

    $("#plays").text(player.count);
    $("#high-score").text(player.highScore);
    $("#game-stats").append(
      "<h5>Game over!</h5> <button id='play-again'>Play again</button>"
    );
  };

  updateScore = (word) => {
    return this.score + word.length;
  };

  resetBoard = (boardData) => {
    // Update stats and enable form to start new game
    this.score = 0;
    this.guesses = [];
    this.timeRemaining = this.playTime;

    // Update board HTML
    const boardContainer = $("#game-board");
    boardContainer.empty(); // Clear existing board

    boardData.forEach((row) => {
      const rowDiv = $('<div class="row">');
      row.forEach((cell) => {
        rowDiv.append(`<div class="letter">${cell}</div>`);
      });
      boardContainer.append(rowDiv);
    });

    // Reenable the form
    $("#word").prop("disabled", false).focus();
    $("#guess button").prop("disabled", false);

    // Reset the score
    $("#current-score").text(this.score);

    // Remove the game-end elements
    $("#game-stats h5").remove();
    $("#play-again").remove();

    // Restart the timer
    this.updateTime();
  };

  submitGuess = async (guess) => {
    try {
      const res = await axios.get(`/guess?word=${guess}`);
      return res;
    } catch (e) {
      console.log(`Dagnabit! ${e}`);
    }
  };
}

const game = new Game();
$("#word").focus();
game.updateTime();

class Player {
  constructor() {
    this.count = 0;
    this.highScore = 0;
  }

  saveScoreAndUpdate = async (score) => {
    this.count += 1;
    this.highScore = score > this.highScore ? score : this.highScore;
    const data = { highScore: this.highScore, count: this.count };

    // Axios call to backend updating plays and topScore goes here
    try {
      const res = await axios({
        url: `/game-over`,
        method: "POST",
        data: data,
      });
      return res;
    } catch (e) {
      console.log(`Dagnabit! ${e}`);
    }
  };
}

const player = new Player();

// jQuery Handlers

$("#guess").on("submit", async (e) => {
  e.preventDefault();
  const guess = $("#word").val();
  if (guess != "") {
    const guessResult = await game.submitGuess(guess);
    if (
      guessResult["data"]["result"] === "ok" &&
      game.guesses.includes(guess) === false
    ) {
      game.score = game.updateScore(guess);
      $("#current-score").text(game.score);
      game.guesses.push(guess);
    }
  }
  $("#word").val("");
});

// Play again button
$(document).on("click", "#play-again", () => {
  $.getJSON("/restart", (data) => {
    // Update the board on the page with new data.board
    // Reset any game state as necessary
    game.resetBoard(data["board"]);
    // You might need to update the board display logic here
  });
});
