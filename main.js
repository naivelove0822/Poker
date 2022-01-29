// 建立狀態
const GAME_STATE = {
  FirstCardAwaits: "FirstCardAwaits",
  SecondCardAwaits: "SecondCardAwaits",
  CardMatchFailed: "CardMatchFailed",
  CardMatched: "CardMatched",
  GameFinished: "GameFinished",
}



// 此處 Symbols 常數儲存的資料不會變動，因此習慣上將首字母大寫以表示此特性
const Symbols = [
  'https://assets-lighthouse.alphacamp.co/uploads/image/file/17989/__.png', // 黑桃
  'https://assets-lighthouse.alphacamp.co/uploads/image/file/17992/heart.png', // 愛心
  'https://assets-lighthouse.alphacamp.co/uploads/image/file/17991/diamonds.png', // 方塊
  'https://assets-lighthouse.alphacamp.co/uploads/image/file/17988/__.png' // 梅花
]

// 建構MVC = > View , controller(統一派發View,Modal) , Modal

// 渲染頁面 , 數字 , 花色 , 內容
const view = {
  getCardElement(index) {
    return `
    <div data-index="${index}" class="card back"></div>
    `
  },
  // 新增Content分開外殼與內容
  getCardContent(index) {
    const number = this.transformNumber((index % 13) + 1)
    const symbol = Symbols[Math.floor(index / 13)]
    return `
      <p>${number}</p>
      <img src="${symbol}" alt="Poker" />
      <p>${number}</p>
    `
  },
  transformNumber(number) {
    switch (number) {
      case 1:
        return 'A'
      case 11:
        return 'J'
      case 12:
        return 'Q'
      case 13:
        return 'K'
      default:
        return number
    }
  },
  displayCards(indexes) {
    const rootElement = document.querySelector('#cards')
    rootElement.innerHTML = indexes.map(index => this.getCardElement(index)).join('')
  },
  // 新增處理翻牌的函式
  flipCards(...cards) {
    cards.map(card => {
      if (card.classList.contains('back')) {
        // 回傳正面
        card.classList.remove('back')
        card.innerHTML = this.getCardContent(Number(card.dataset.index)) //對應到指定的卡片位置
        return
      }
      // 回傳背面
      card.classList.add('back')
      card.innerHTML = null
    })
  },
  pairCards(...cards) {
    cards.map(card => { 
      card.classList.add('paired')
    })
  },
  renderScore(score) {
    document.querySelector('.score').innerHTML = `Score: ${score}`
  },
  renderTriedTimes(times) {
    document.querySelector('.tried').innerHTML = `You've tried: ${times} times`
  },
  appendWrongAnimation(...cards) {
    cards.map(card => {
      card.classList.add('wrong')
      card.addEventListener('animationend', event => 
        event.target.classList.remove('wrong'), { once: true })
    })
  },
  // 結束時顯式的函式
  showGameFinished () {
    const div = document.createElement('div')
    div.classList.add('completed')
    div.innerHTML = `
    <p>Complete!</p>
    <p>Score: ${modal.score}</p>
    <p>You've tried: ${modal.triedTimes} times</p>
    `
    const header = document.querySelector('#header')
    header.before(div)
  }
}

// 資料
const modal = {
  // 代表被翻開的卡片
  revealedCards: [],
  // 配對成功的函式
  isRevealedCardsMatched() {
    return this.revealedCards[0].dataset.index % 13 === this.revealedCards[1].dataset.index % 13
  },
  score: 0,
  triedTimes: 0
}

// 流程
const controller = {
  // 初始設定 還沒翻牌
  currentState: GAME_STATE.FirstCardAwaits,
  generateCards() {
    view.displayCards(utility.getRandomNumberArray(52))
  },
  // 依照不同遊戲狀態,做不同行為
  dispatchCardAction(card) {
    // 判斷是否為背面不是的話直接結束
    if (!card.classList.contains('back')) {
      return
    }
    switch (this.currentState) {
      case GAME_STATE.FirstCardAwaits:
        view.flipCards(card)
        modal.revealedCards.push(card)
        this.currentState = GAME_STATE.SecondCardAwaits
        break
      case GAME_STATE.SecondCardAwaits:
        // 新增計算次數
        view.renderTriedTimes(++modal.triedTimes)
        view.flipCards(card)
        modal.revealedCards.push(card)
        if (modal.isRevealedCardsMatched()) {
          // 配對成功
          // 新增+10分
          view.renderScore(modal.score += 10)
          this.currentState = GAME_STATE.CardMatched
          view.pairCards(...modal.revealedCards)
          modal.revealedCards = []
          if (modal.score ===260) {
            console.log('showGameFinished')
            this.currentState = GAME_STATE.GameFinished
            view.showGameFinished()
            return
          }
          this.currentState = GAME_STATE.FirstCardAwaits
        } else {
          // 配對失敗
          this.currentState = GAME_STATE.CardMatchFailed
          view.appendWrongAnimation(...modal.revealedCards)
          setTimeout(this.resetCards, 1000)
        }
        break
    }
    console.log('this.currentState', this.currentState)
    console.log('revealedCards', modal.revealedCards.map(card => card.dataset.index))
  },

  // 新增setTimeout的函式
  resetCards () {
    view.flipCards(...modal.revealedCards)
    modal.revealedCards = []
    controller.currentState = GAME_STATE.FirstCardAwaits
  }
}

// 運用解構賦值與Fisher-Yates Shuffle撰寫洗牌函式
const utility = {
  getRandomNumberArray(count) {
    const number = Array.from(Array(count).keys())
    for (let index = number.length - 1; index > 0; index--) {
      let randomIndex = Math.floor(Math.random() * (index + 1))
        ;[number[index], number[randomIndex]] = [number[randomIndex], number[index]]
    }
    return number
  }
}
controller.generateCards()

// 新增監聽器點卡片時回應
document.querySelectorAll('.card').forEach(card => {
  card.addEventListener('click', event => {
    // 呼叫filpCard函式
    controller.dispatchCardAction(card)
  })
})
