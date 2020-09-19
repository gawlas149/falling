const canvas = document.getElementById("canvas");
const pointsCounter = document.getElementById("pointsCounter");
const moneyCounter = document.getElementById("moneyCounter");

const ctx = canvas.getContext("2d");

const shopBackground = document.getElementById("shopBackground");
const shopMoney = document.getElementById("shopMoney");
const shopPrices = document.getElementsByClassName("upgradePrice");

const game = document.getElementById("game");

const loseScreen = document.getElementById("loseScreen");
const loseShop = document.getElementById("loseShop");
const loseReplay = document.getElementById("loseReplay");
const loseReward = document.getElementById("loseReward");

const upgradesPrice = [
  [2.5, 13.37, 149, 7000, 25000, "K"],
  [1, 30, 420, 12345, 25000, "A"],
  [3, 35, 300, 6789, 25000, "J"],
  [4.2, 25, 500, 9001, 25000, "A"],
  [5, 50, 1000, 5000, 25000, "K"],
];

let cW;
let cH;
let obstacleHeight;
let player = {
  xP: 0.5,
  yP: 0.1,
  vY: 0.0,
  vX: 0.0,
  speedX: 0.0002,
};
let obstacles = [];
let obstacleSpeed;
let obstacleSpawnInterval;
let bounceFactor = 0.8;
let gravitation = 0.0005;
let lose = 0;
let leftMobile = 0;
let rightMobile = 0;
let points = 0;
let money;
let moneyRun = 0;

let upgrades; //[ballSize, obstacleGap, obstacleSpeed, startPoints, moreMoney]
if (localStorage.getItem("upgrades") === null) {
  upgrades = [0, 0, 0, 0, 0];
} else {
  upgrades = JSON.parse(localStorage.getItem("upgrades"));
}
if (localStorage.getItem("money") === null) {
  money = 0;
} else {
  money = JSON.parse(localStorage.getItem("money"));
}
//local storage version żeby resetować postęp po updacie

//ballSize  0.04 0.035 0.03 0.025 0.02 0.15
//obstacleGap max 5
//obstacleSpeed 0.005 0.0044 0.0038 0.0032 0.0026 0.002
//startPoints points 0 3 10 15 20 30 dif 0 20 30 35 40 45
//getMoreMoney 1 1.5 2.0 2.5 3
function resizeGame() {
  let gameArea = document.getElementById("gameArea");
  let widthToHeight = 4 / 3;
  let newWidth = window.innerWidth;
  let newHeight = window.innerHeight;
  let newWidthToHeight = newWidth / newHeight;

  if (newWidthToHeight > widthToHeight) {
    newWidth = newHeight * widthToHeight;
    gameArea.style.height = newHeight + "px";
    gameArea.style.width = newWidth + "px";
  } else {
    newHeight = newWidth / widthToHeight;
    gameArea.style.width = newWidth + "px";
    gameArea.style.height = newHeight + "px";
  }

  gameArea.style.marginTop = -newHeight / 2 + "px";
  gameArea.style.marginLeft = -newWidth / 2 + "px";

  canvas.width = newWidth;
  canvas.height = newHeight;

  cW = canvas.width;
  cH = canvas.height;
  player.radius = (0.04 - 0.005 * upgrades[0]) * cH;
  obstacleHeight = 0.08 * cH;

  player.x = player.xP * cW;
  player.y = player.yP * cH;
  player.xNext = player.x + player.vX * cW;
  player.yNext = player.y + player.vY * cH;

  for (let i = 0; i < obstacles.length; i++) {
    obstacles[i].y = obstacles[i].yP * cH;
    obstacles[i].x = obstacles[i].xP * cW;
    obstacles[i].w = obstacles[i].wP * cW;
  }

  pointsCounter.style.fontSize = 0.05 * cH + "px";
  moneyCounter.style.fontSize = 0.05 * cH + "px";
  shopBackground.style.fontSize = 0.055 * cH + "px";
  loseScreen.style.fontSize = 0.07 * cH + "px";
}
window.addEventListener("resize", resizeGame);
window.addEventListener("orientationchange", resizeGame);
resizeGame();

obstacleSpeed = 0.005 - upgrades[2] * 0.0006;
obstacleSpawnInterval = 220;
let dif;
if (upgrades[3] == 0) {
  points = 0;
  dif = 0;
} else if (upgrades[3] == 1) {
  points = 3;
  dif = 20;
} else if (upgrades[3] == 2) {
  points = 10;
  dif = 30;
} else if (upgrades[3] == 3) {
  points = 15;
  dif = 35;
} else if (upgrades[3] == 4) {
  points = 20;
  dif = 40;
} else if (upgrades[3] == 5) {
  points = 30;
  dif = 45;
}
pointsCounter.innerText = `${points}P`;

for (let i = 0; i < dif; i++) {
  updateDifficulty();
}

function updateDifficulty() {
  obstacleSpeed += 0.00008;
  obstacleSpawnInterval -= 3.8;
}

let ticksSum = 0;
let ticksObstacle = obstacleSpawnInterval;
function tick(secondsPassed) {
  if (lose == 1) {
    return;
  }

  ticksSum += 1;
  ticksObstacle += 1;
  if (ticksObstacle >= obstacleSpawnInterval) {
    ticksObstacle = 0;
    generateObstacle();
  }
  clear();
  obstaclesMove();
  playerMove();

  // console.log(secondsPassed);

  if (dif < 20 && points >= 0) {
    if (ticksSum % 25 == 0) {
      updateDifficulty();
      dif += 1;
    }
  } else if (dif < 30 && points >= 3) {
    if (ticksSum % 25 == 0) {
      updateDifficulty();
      dif += 1;
    }
  } else if (dif < 35 && points >= 10) {
    if (ticksSum % 25 == 0) {
      updateDifficulty();
      dif += 1;
    }
  } else if (dif < 40 && points >= 15) {
    if (ticksSum % 50 == 0) {
      updateDifficulty();
      dif += 1;
    }
  } else if (dif < 45 && points >= 20) {
    if (ticksSum % 100 == 0) {
      updateDifficulty();
      dif += 1;
    }
  } else if (dif < 50 && points >= 30) {
    if (ticksSum % 100 == 0) {
      updateDifficulty();
      dif += 1;
    }
  }
}

function clear() {
  ctx.clearRect(0, 0, cW, cH);
}

keys = [];
window.addEventListener("keydown", function (e) {
  keys[e.keyCode] = true;
});
window.addEventListener("keyup", function (e) {
  keys[e.keyCode] = false;
});
let collide;
function playerMove() {
  player.xNext = player.x + player.vX * cW;
  player.yNext = player.y + player.vY * cH;
  collide = 0;
  for (let i = 0; i < obstacles.length; i++) {
    let temp = collision(obstacles[i].y, obstacles[i].x, obstacles[i].w);
    if (temp == 1) {
      collide = 1;
      // console.log("gora");
    } else if (temp == 2) {
      collide = 2;
      // console.log("dol");
    } else if (temp == 3) {
      collide = 3;
      // console.log("lewa");
    } else if (temp == 4) {
      collide = 4;
      // console.log("prawa");
    }
  }

  if (collide == 1 || collide == 2) {
    player.vY = -player.vY * bounceFactor;
  } else if (collide == 3 || collide == 4) {
    player.vX = -player.vX * bounceFactor;
  }

  player.yP += player.vY;
  player.y = player.yP * cH;
  player.vY += gravitation;

  if (player.x <= player.radius) {
    player.x = player.radius;
    player.xP = player.x / cW;
    player.vX = -player.vX * bounceFactor;
  } else {
    if (keys[37] || keys[65] || leftMobile == 1) {
      player.vX -= player.speedX;
    }
  }
  if (player.x >= cW - player.radius) {
    player.x = cW - 1.5 * player.radius;
    player.xP = player.x / cW;
    player.vX = -player.vX * bounceFactor;
  } else {
    if (keys[39] || keys[68] || rightMobile == 1) {
      player.vX += player.speedX;
    }
  }

  if (player.y + player.radius >= cH) {
    player.vY = -player.vY * bounceFactor;
    player.y = cH - player.radius;
    player.yP = player.y / cH;
    collide = 1;
  } else if (player.y <= 0) {
    for (let i = 0; i < obstacles.length; i++) {
      if (obstacles[i].y <= player.radius) {
        //przegrana
        lose = 1;
        money += moneyRun;
        money = parseFloat(money.toFixed(2));

        localStorage.setItem("money", JSON.stringify(money));
        shopMoney.innerText = `${money}$`;
        loseReward.innerText = `You got ${points} Points and ${moneyRun}$`;
        loseScreen.classList.remove("hidden");
        loseShop.onclick = () => {
          loseScreen.classList.add("hidden");
          shopEnter();
        };
        loseReplay.onclick = () => {
          loseScreen.classList.add("hidden");
          gameStart();
        };
      }
    }
  }

  player.xP += player.vX;
  player.x = player.xP * cW;

  drawCircle(player.x, player.y, "red");
}

function drawCircle(x, y, color) {
  ctx.beginPath();
  ctx.fillStyle = color;
  ctx.arc(x, y, player.radius, 0, 2 * Math.PI);
  ctx.fill();
  ctx.stroke();
}

let obstaclesToDelete;
function obstaclesMove() {
  obstaclesToDelete = [];
  for (let i = 0; i < obstacles.length; i++) {
    if (obstacles[i].yP < -obstacleHeight / cH) {
      obstaclesToDelete.push(i);
      points += 1;
      pointsCounter.innerText = `${points}P`;
      //getMoney
      let oMoney = 0;
      if (points < 10) {
        oMoney = 0.1 + (Math.random() * points) / 8;
      } else if (points < 20) {
        oMoney = 2 + (Math.random() * points) / 6;
      } else if (points < 30) {
        oMoney = 6 + (Math.random() * points) / 5;
      } else if (points < 50) {
        oMoney = 10 + (Math.random() * points) / 2;
      } else if (points < 80) {
        oMoney = 20 + Math.random() * points;
      } else {
        oMoney = 50 + Math.random() * points * 2;
      }
      oMoney = oMoney * (1 + upgrades[4] * 0.5);
      oMoney = parseFloat(oMoney.toFixed(2));
      moneyRun += oMoney;
      moneyRun = parseFloat(moneyRun.toFixed(2));
      moneyCounter.innerText = `${moneyRun}$`;
    }
  }
  for (let i = 0; i < obstaclesToDelete.length; i++) {
    obstacles.splice([obstaclesToDelete[i] - i], 1);
  }
  for (let i = 0; i < obstacles.length; i++) {
    drawRect(-2, obstacles[i].y, obstacles[i].x + 2, obstacleHeight, "blue");
    drawRect(
      obstacles[i].x + obstacles[i].w,
      obstacles[i].y,
      cW,
      obstacleHeight,
      "blue"
    );
    obstacles[i].yP -= obstacleSpeed;
    obstacles[i].y = obstacles[i].yP * cH;
  }
}

function drawRect(x, y, width, height, color) {
  ctx.beginPath();
  ctx.fillStyle = color;
  ctx.rect(x, y, width, height);
  ctx.fill();
  ctx.stroke();
}

function collision(oY, oX, oW) {
  //sprawdzanie wysokości
  if (
    player.yNext + player.radius > oY &&
    player.yNext - player.radius < oY + obstacleHeight
  ) {
    if (player.x - player.radius > oX && player.x + player.radius < oX + oW) {
      return 0;
    }
    if (player.y < oY) {
      player.y = oY - player.radius;
      player.yP = player.y / cH;
      return 1;
    }
    if (player.y > oY + obstacleHeight) {
      player.y = oY + obstacleHeight + player.radius;
      player.yP = player.y / cH;
      return 2;
    }
    if (player.x > oX && player.x < oX + oW) {
      if (player.xNext - player.radius < oX) {
        return 3;
      }
      if (player.xNext + player.radius > oX + oW) {
        return 4;
      }
    }
  }
  return 0;
}
let secondsPassed = 0;
let oldTimeStamp = 0;
function tickLoop(timeStamp) {
  secondsPassed = (timeStamp - oldTimeStamp) / 1000;
  oldTimeStamp = timeStamp;

  tick(secondsPassed);
  window.requestAnimationFrame(tickLoop);
}
tickLoop(0);

function generateObstacle() {
  obstacles.push({
    yP: 1,
    xP: Math.random() * 0.8,
    wP: Math.random() * (0.05 + upgrades[1] * 0.02) + 0.1 + upgrades[1] * 0.05,
  });
  obstacles[obstacles.length - 1].y = obstacles[obstacles.length - 1].yP * cH;
  obstacles[obstacles.length - 1].x = obstacles[obstacles.length - 1].xP * cW;
  obstacles[obstacles.length - 1].w = obstacles[obstacles.length - 1].wP * cW;
}

//sterowanie na telefonie
if (
  /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  )
) {
  const leftKey = document.createElement("div");
  leftKey.style.width = "50vw";
  leftKey.style.height = "100vh";
  leftKey.style.position = "absolute";
  leftKey.ontouchstart = () => {
    leftMobile = 1;
  };
  leftKey.ontouchend = () => {
    leftMobile = 0;
  };
  document.body.appendChild(leftKey);

  const rightKey = document.createElement("div");
  rightKey.style.width = "50vw";
  rightKey.style.height = "100vh";
  rightKey.style.position = "absolute";
  rightKey.style.left = "50vw";
  rightKey.style.top = 0;
  rightKey.ontouchstart = () => {
    rightMobile = 1;
  };
  rightKey.ontouchend = () => {
    rightMobile = 0;
  };
  document.body.appendChild(rightKey);
}

function shopEnter() {
  shopBackground.classList.remove("hidden");
  game.classList.add("hidden");
}

const startButton = document.getElementById("startButton");
startButton.onclick = () => {
  shopBackground.classList.add("hidden");
  game.classList.remove("hidden");
  gameStart();
};

function gameStart() {
  lose = 0;
  player.xP = 0.5;
  player.yP = 0.1;
  player.x = player.xP * cW;
  player.y = player.yP * cH;
  obstacles = [];
  obstacleSpeed = 0.0025;
  obstacleSpawnInterval = 220;
  if (upgrades[3] == 0) {
    points = 0;
    dif = 0;
  } else if (upgrades[3] == 1) {
    points = 3;
    dif = 20;
  } else if (upgrades[3] == 2) {
    points = 10;
    dif = 30;
  } else if (upgrades[3] == 3) {
    points = 15;
    dif = 35;
  } else if (upgrades[3] == 4) {
    points = 20;
    dif = 40;
  } else if (upgrades[3] == 5) {
    points = 30;
    dif = 45;
  }

  player.vY = 0.0;
  player.vX = 0.0;
  ticksSum = 0;
  ticksObstacle = obstacleSpawnInterval;
  player.radius = (0.04 - 0.005 * upgrades[0]) * cH;
  obstacleSpeed = 0.005 - upgrades[2] * 0.0006;
  for (let i = 0; i < dif; i++) {
    updateDifficulty();
  }
  moneyRun = 0;
  moneyCounter.innerText = `${moneyRun}$`;
  pointsCounter.innerText = `${points}P`;
}

const shopUpgrades = document.getElementsByClassName("shopUpgrade");
const shopUpgradeProgress = document.getElementsByClassName("upgradeProgress");

for (let i = 0; i < shopPrices.length; i++) {
  shopPrices[i].innerText = upgradesPrice[i][upgrades[i]] + "$";
}

shopMoney.innerText = `${money}$`;
for (let i = 0; i < shopUpgradeProgress.length; i++) {
  shopUpgradeProgress[i].innerText = "lvl=" + upgrades[i];
}

for (let i = 0; i < shopUpgrades.length; i++) {
  shopUpgrades[i].onmouseover = () => {
    if (upgradesPrice[i][upgrades[i]] <= money && upgrades[i] < 6) {
      shopUpgrades[i].style.backgroundColor = "rgb(199, 53, 53)";
      shopUpgrades[i].style.cursor = "pointer";
    } else {
      shopUpgrades[i].style.backgroundColor = "rgb(128, 21, 21)";
      shopUpgrades[i].style.cursor = "not-allowed";
    }
  };
  shopUpgrades[i].onmouseout = () => {
    shopUpgrades[i].style.backgroundColor = "rgb(212, 72, 72)";
  };

  shopUpgrades[i].onclick = () => {
    if (upgradesPrice[i][upgrades[i]] <= money && upgrades[i] < 6) {
      money -= upgradesPrice[i][upgrades[i]];
      money = parseFloat(money.toFixed(2));
      shopMoney.innerText = `${money}$`;

      upgrades[i] += 1;
      shopUpgradeProgress[i].innerText = "lvl=" + upgrades[i];
      localStorage.setItem("upgrades", JSON.stringify(upgrades));
      localStorage.setItem("money", JSON.stringify(money));

      for (let i = 0; i < shopPrices.length; i++) {
        shopPrices[i].innerText = upgradesPrice[i][upgrades[i]] + "$";
      }
    }
    if (upgradesPrice[i][upgrades[i]] > money && upgrades[i] < 6) {
      shopUpgrades[i].style.backgroundColor = "rgb(128, 21, 21)";
      shopUpgrades[i].style.cursor = "not-allowed";
    }
  };
}

const resetProgress = document.getElementById("resetProgressButton");
resetProgressButton.onclick = () => {
  localStorage.clear();
  upgrades = [0, 0, 0, 0, 0];
  money = 0;
  shopMoney.innerText = `${money}$`;

  for (let i = 0; i < shopUpgradeProgress.length; i++) {
    shopUpgradeProgress[i].innerText = "lvl=" + upgrades[i];
  }
  for (let i = 0; i < shopPrices.length; i++) {
    shopPrices[i].innerText = upgradesPrice[i][upgrades[i]] + "$";
  }
};
//powerupy-(pojawiają się na klockach)czyszczenie planszy, spowolnienie klocków, kulka mniejsza, dziury rosną, mniejsze odbijanie-, poruszanie się klocków,
//powerdowny-zmiana sterowania
