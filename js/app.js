MAIN_PLAYER_ID = 2980

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
  var rows = scoreEl.getElementsByClassName('score-flow')[0].getElementsByClassName('row');
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

function sumCount(scoreStr) { // ex) 8-9 -> return 17
  var total = 0
  scoreStr.split('-').forEach(s => { total += Number(s); });
  return total;
}

var GameState = class {
  constructor() {
    this.mIsFinish = false;
    this.mFirstScores = [];
    this.mSecondScores = [];
  }

  get isFinish() { return this.mIsFinish }
  get firstScores() { return this.mFirstScores }
  get secondScores() { return this.mSecondScores }

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
    this.mTournamentName = ''
    this.mTournament = 'FACTOR20'
    this.mMainPlayerID = ''
    this.mMainPlayer = {}
    this.mPlayerID = ''
    this.mPlayer = {}
    this.mFirstBall = 1 // 1: Serve -1: Receive
    var memoDefaults = []
    for (var i = 1; i <= 5; i++) {
      memoDefaults.push(`●第${i}ゲーム----------------------------`)
    }
    this.mMemo = memoDefaults.join('\n\n')
    this.mPlayerMemo = memoDefaults.join('\n\n')
    this.mPlayerPositiveAdvice = memoDefaults.join('\n\n')
    this.mPlayerChanceAdvice = memoDefaults.join('\n\n')
    this.mPlayerNextAdvice = memoDefaults.slice(0, 4).join('\n\n')
  }

  get focusGameNumber() { return this.mFocusGameNumber }
  set focusGameNumber(num) { this.mFocusGameNumber = num }
  get tournamentName() { return this.mTournamentName }
  set tournamentName(val) { this.mTournamentName = val }
  get tournament() { return this.mTournament }
  set tournament(val) { this.mTournament = val }
  get mainPlayerID() { return this.mMainPlayerID }
  set mainPlayerID(val) { this.mMainPlayerID = val }
  get playerID() { return this.mPlayerID }
  set playerID(val) { this.mPlayerID = val }
  get firstBall() { return this.mFirstBall }
  set firstBall(val) {this.mFirstBall = val }
  get memo() { return this.mMemo }
  set memo(val) {this.mMemo = val }
  get playerMemo() { return this.mPlayerMemo }
  set playerMemo(val) {this.mPlayerMemo = val }
  get playerPositiveAdvice() { return this.mPlayerPositiveAdvice }
  set playerPositiveAdvice(val) {this.mPlayerPositiveAdvice = val }
  get playerChanceAdvice() { return this.mPlayerChanceAdvice }
  set playerChanceAdvice(val) {this.mPlayerChanceAdvice = val }
  get playerNextAdvice() { return this.mPlayerNextAdvice }
  set playerNextAdvice(val) {this.mPlayerNextAdvice = val }

  get gameState() {
    return this.gameStates[this.mFocusGameNumber - 1]
  }

  get positiveAdviceForDisplay() {
    return this.playerPositiveAdvice.split('\n')[this.focusGameNumber*2 - 1]
  }

  get chanceAdviceForDisplay() {
    return this.playerChanceAdvice.split('\n')[this.focusGameNumber*2 - 1]
  }

  get nextAdviceForDisplay() {
    return this.playerNextAdvice.split('\n')[this.focusGameNumber*2 - 1]
  }

  toArrayForCSV(date, mainPlayerName, playerName) {
    var dataHash = {};
    dataHash['date'] = date;
    dataHash['tournamentName'] = this.tournamentName;
    dataHash['tournament'] = this.tournament;
    dataHash['mainPlayerID'] = this.mainPlayerID;
    dataHash['mainPlayerName'] = mainPlayerName;
    dataHash['playerID'] = this.playerID;
    dataHash['playerName'] = playerName;
    dataHash['firstBall'] = this.firstBall;
    dataHash['memo'] = this.memo;
    dataHash['playerMemo'] = this.playerMemo;
    dataHash['playerPositiveAdvice'] = this.playerPositiveAdvice;
    dataHash['playerChanceAdvice'] = this.playerChanceAdvice;
    dataHash['playerNextAdvice'] = this.playerNextAdvice;
    for (var i = 0; i < 5; i++) {
      var gameState = this.gameStates[i];
      dataHash[`gameState_${i + 1}_first`] = gameState.firstScores.toString();
      dataHash[`gameState_${i + 1}_second`] = gameState.secondScores.toString();
    }
    return [dataHash];
  }
}

var app = new Vue({
  el: '#app',
  data: {
    player: {},
    playerID: '',
    mainPlayer: {},
    allPlayers: [],
    date: '',
    today: '',
    game: new Game()
  },
  methods: {
    initialize() {
      this.$set(this, 'allPlayers', loadAllPlayers());
      var today = new Date();
      this.$set(this, 'date', `${today.getFullYear()}/${today.getMonth()+1}/${today.getDate()}`);
      this.game.mainPlayerID = MAIN_PLAYER_ID;
      this.$set(this, 'mainPlayer', this.allPlayers.find(p => p.playerID == this.game.mainPlayerID));
      this.changeFocus(1);
      for (var i = 1; i <= 5; i++) {
        var scoreEl = document.getElementById(`scoreBoard${i}`);
        this.addScoreDOM(scoreEl);
        this.updateService(scoreEl, i);
      }
    },
    addPoint(isFirstPlayer = true) {
      if (this.game.gameState.isFinish) return;
      var scoreEl = document.getElementById(`scoreBoard${this.game.focusGameNumber}`);
      var lastScoreValues = getLastScoreValues(scoreEl);
      var lastScoreValue = isFirstPlayer ? lastScoreValues[0] : lastScoreValues[1];
      var rows = scoreEl.getElementsByClassName('score-flow')[0].getElementsByClassName('row');
      var row = isFirstPlayer ? rows[0] : rows[1];
      row.getElementsByClassName('score')[0].lastChild.value = lastScoreValue + 1;

      this.addScoreDOM(scoreEl);
      this.updateService(scoreEl);
    },
    deletePoint() {
      var scoreEl = document.getElementById(`scoreBoard${this.game.focusGameNumber}`);
      var rows = scoreEl.getElementsByClassName('score-flow')[0].getElementsByClassName('row');
      for (var i = 0; i < rows.length; i++) {
        var score = rows[i].getElementsByClassName('score')[0];
        if (score.childElementCount <= 1) break;
        score.removeChild(score.lastChild);
        score.lastChild.value = '';
      }
      this.game.gameState.reset();
      this.updateService(scoreEl);
    },
    changeFocus(gameNumber) {
      for (var i = 1; i <= 5; i++) {
        var scoreEl = document.getElementById(`scoreBoard${i}`);
        if (i == gameNumber) {
          scoreEl.classList.add('available');
          scoreEl.classList.remove('unavailable');
          this.game.focusGameNumber = gameNumber;
        } else {
          scoreEl.classList.remove('available');
          scoreEl.classList.add('unavailable');
        }
      }
      document.activeElement.blur();
    },
    addScoreDOM(scoreEl) {
      if (isGameFinish(scoreEl)) {
        this.game.gameState.finish(scoreEl);
        this.addResultDOM(scoreEl);
        return;
      }
      var rows = scoreEl.getElementsByClassName('score-flow')[0].getElementsByClassName('row');
      for (i = 0; i < rows.length; i++) {
        var input = document.createElement('input');
        input.setAttribute('type', 'text');
        input.setAttribute('onFocus', 'this.blur()');
        rows[i].getElementsByClassName('score')[0].appendChild(input);
      };
    },
    updateService(scoreEl, focusGameNumber = this.game.focusGameNumber) {
      var rows = scoreEl.getElementsByClassName('score-flow')[0].getElementsByClassName('row');
      if (this.game.gameState.isFinish) {
        for (i = 0; i < rows.length; i++) {
          rows[i].getElementsByClassName('player-name')[0].classList.remove('server');
        }
        return;
      }
      var lastScoreValues = getLastScoreValues(scoreEl);
      var sum = lastScoreValues[0] + lastScoreValues[1];
      var gameParams = [1, -1, 1, -1, 1]
      var param = [0, 1].includes(sum % 4) ? 1 : -1
      if (sum > 20) { // デュース
        param = (sum % 2) == 0 ? 1 : -1
      }
      if (gameParams[focusGameNumber - 1] * this.game.firstBall * param == 1) {
        rows[0].getElementsByClassName('player-name')[0].classList.add('server');
        rows[1].getElementsByClassName('player-name')[0].classList.remove('server');
      } else {
        rows[0].getElementsByClassName('player-name')[0].classList.remove('server');
        rows[1].getElementsByClassName('player-name')[0].classList.add('server');
      }
    },
    updateAllServices() {
      for (var i = 1; i <= 5; i++) {
        var scoreEl = document.getElementById(`scoreBoard${i}`);
        this.updateService(scoreEl, i);
      }
    },
    addResultDOM(scoreEl) {
      this.updateService(scoreEl);
      var rows = scoreEl.getElementsByClassName('score-flow')[0].getElementsByClassName('row');
      var lastScoreValues = getLastScoreValues(scoreEl);
      for (i = 0; i < rows.length; i++) {
        var pTag = document.createElement('p');
        pTag.classList.add('result');
        pTag.innerHTML = lastScoreValues[i];
        rows[i].getElementsByClassName('score')[0].appendChild(pTag);
      };
    },
    updateMainPlayer() {
      this.$set(this, 'mainPlayer', this.allPlayers.find(p => p.playerID == this.game.mainPlayerID));
    },
    updatePlayer() {
      this.$set(this, 'player', this.allPlayers.find(p => p.playerID == this.game.playerID));
    },
    saveAsCSV() {
      var playerID = this.game.playerID || 999999;
      (new CSV(this.game.toArrayForCSV(this.date, this.mainPlayer.name, this.player.name))).save(`${this.date}_${this.game.mainPlayerID}_${playerID}.csv`);
    }
  },
  mounted() {
    document.addEventListener('keydown', e => {
      if (e.code == `Escape`) {
        document.activeElement.blur();
      }
      if (['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) return
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

