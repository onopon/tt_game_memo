function loadAllPlayers() {
    var playerList = new Array();
    getPlayers().forEach(player => {
        var dataList = player.split(',');
        var playerData = {playerID: dataList[0],
            name: dataList[1],
            country: dataList[2],
            region: dataList[3],
            klass: dataList[4]};
        playerList.push(playerData);
    });
    return playerList;
}

function getLastScoreValues(scoreEl) {
    var rows = scoreEl.getElementsByClassName('row');
    var lastScoreValues = [];
    for(i = 0; i < rows.length; i++) {
        var row = rows[i];
        var scores = row.getElementsByClassName('score')[0].getElementsByTagName('input');
        var reverseScores = Array.from(scores);
        reverseScores.reverse();
        var lastScore = reverseScores.find(val => val.value !== '');
        var lastScoreVal = Number(lastScore ? lastScore.value : 0);
        lastScoreValues.push(lastScoreVal);
    }
    return lastScoreValues;
}

function isGameFinish(scoreEl) {
    scoreValues = getLastScoreValues(scoreEl);
    if ((scoreValues[0] >= 11 || scoreValues[1] >= 11) && Math.abs(scoreValues[0] - scoreValues[1]) >= 2) return true;
    if ((scoreValues[0] >= 10 && scoreValues[1] >= 10) && Math.abs(scoreValues[0] - scoreValues[1]) >= 2) return true;
    return false;
}

var GameState = class {
  constructor() {
    this.mIsFinish = false;
    this.mFirstScores = [];
    this.mSecondScores = [];
  }

  get isFinish() {
    return this.mIsFinish
  }

  get firstScores() {
    return this.mFirstScores
  }

  get secondScores() {
    return this.mSecondScores
  }

  finish(scoreEl) {
    this.mIsFinish = true;
    var rows = scoreEl.getElementsByClassName('row');
    this.setFirstScores(rows[0].getElementsByClassName('score')[0].getElementsByTagName('input'));
    this.setSecondScores(rows[1].getElementsByClassName('score')[0].getElementsByTagName('input'));
  }

  reset() {
    this.mIsFinish = false;
    this.mFirstScores = [];
    this.mSecondScores = [];
  }

  setFirstScores(inputEls) {
    this.mFirstScores = Array.from(inputEls).map(el => el.value)
  }

  setSecondScores(inputEls) {
    this.mSecondScores = Array.from(inputEls).map(el => el.value)
  }
}

var Game = class {
  constructor() {
      this.gameStates  = [new GameState(),
                          new GameState(),
                          new GameState(),
                          new GameState(),
                          new GameState()]
      this.mFocusGameNumber = 1
  }

  get focusGameNumber() {
    return this.mFocusGameNumber
  }

  set focusGameNumber(num) {
    this.mFocusGameNumber = num
  }

  get gameState() {
    return this.gameStates[this.mFocusGameNumber - 1]
  }
}

var app = new Vue({
  el: '#app',
  data: {
    playerID: "",
    allPlayers: [],
    date: "",
    today: "",
    game: new Game() 
  },
  methods: {
    initialize() {
        this.$set(this, 'allPlayers', loadAllPlayers());
        var today = new Date();
        this.$set(this, 'date', `${today.getFullYear()}/${today.getMonth()+1}/${today.getDate()}`);
        this.changeFocus(1);
    },
    addPoint(isFirstPlayer = true) {
        if (this.game.gameState.isFinish) return;
        var scoreEl = document.getElementById(`scoreBoard${this.game.focusGameNumber}`);
        var lastScoreValues = getLastScoreValues(scoreEl);
        var lastScoreValue = isFirstPlayer ? lastScoreValues[0] : lastScoreValues[1];
        var rows = scoreEl.getElementsByClassName('row');
        var row = isFirstPlayer ? rows[0] : rows[1];
        row.getElementsByClassName('score')[0].lastChild.value = lastScoreValue + 1;

        this.addScoreDOM(scoreEl);
    },
    deletePoint() {
        var scoreEl = document.getElementById(`scoreBoard${this.game.focusGameNumber}`);
        var rows = scoreEl.getElementsByClassName('row');
        for (var i = 0; i < rows.length; i++) {
            var score = rows[i].getElementsByClassName('score')[0];
            if (score.childElementCount <= 1) break;
            score.removeChild(score.lastChild);
            score.lastChild.value = "";
        }
        this.game.gameState.reset();
    },
    changeFocus(gameNumber) {
        for (var i = 1; i <= 5; i++) {
            var scoreEl = document.getElementById(`scoreBoard${i}`);
            if (i == gameNumber) {
                scoreEl.classList.add("available");
                scoreEl.classList.remove("unavailable");
                this.game.focusGameNumber = gameNumber;
            } else {
                scoreEl.classList.remove("available");
                scoreEl.classList.add("unavailable");
            }
        }
    },
    addScoreDOM(scoreEl) {
        if (isGameFinish(scoreEl)) {
            this.game.gameState.finish(scoreEl);
            this.addResultDOM(scoreEl);
            return;
        }

        var rows = scoreEl.getElementsByClassName('row')
        for (i = 0; i < rows.length; i++) {
            var input = document.createElement('input');
            input.setAttribute("type", "text");
            rows[i].getElementsByTagName('div')[0].appendChild(input);
        };
    },
    addResultDOM(scoreEl) {
        var rows = scoreEl.getElementsByClassName('row')
        var lastScoreValues = getLastScoreValues(scoreEl);
        for (i = 0; i < rows.length; i++) {
            var pTag = document.createElement('p');
            pTag.classList.add("result");
            pTag.innerHTML = lastScoreValues[i];
            rows[i].getElementsByTagName('div')[0].appendChild(pTag);
        };
    }
  },
  mounted() {
      document.addEventListener('keydown', e => {
          // スコア周りの制御
          if (e.code == `ArrowUp`) {
              e.preventDefault();
              this.addPoint(true);
          } else if (e.code == `ArrowDown`) {
              e.preventDefault();
              this.addPoint(false);
          } else if (e.code == `Backspace`) {
              e.preventDefault();
              this.deletePoint();
          }
      });
  }
});
app.initialize();

