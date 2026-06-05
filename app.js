const venues = {
  tokyoDome: {
    name: "东京巨蛋",
    station: "水道桥站 A2 / 后乐园站 2 号口",
    arrival: "17:00 开演建议 14:30 到；18:00 开演建议 15:30 到",
    risk: "散场拥堵高",
    riskLevel: 3,
    beginner: 76,
    queue: "入口通常以票面 Gate 为准；经验上不要跟着 22/25 Gate 正面人流硬排，先沿外圈确认自己的 Gate，靠近 11/20/33 Gate 一侧的周边通道更适合分流。",
    lastTrain: "保守线：22:45 前离开座位区，23:15 前进入水道桥或后乐园站。回新宿/池袋/东京站方向通常还能换乘，但 23:30 后要按当天 JR/地铁末班重新确认。"
  },
  budokan: {
    name: "日本武道馆",
    station: "九段下站 2 番出口",
    arrival: "17:00 开演建议 15:00 到；18:30 开演建议 16:30 到",
    risk: "动线简单但进站排队",
    riskLevel: 2,
    beginner: 84,
    queue: "主入口拍照人流最密，先绕到北之丸公园内侧确认入场列。物贩结束后不要回到正门拍照点排队，按票面入口找工作人员确认更快。",
    lastTrain: "保守线：22:30 前离开场馆外广场，23:10 前进九段下站。半藏门线/东西线/都营新宿线可分流，回程不要压到 23:40 以后。"
  },
  makuhari: {
    name: "幕张 Messe",
    station: "海滨幕张站 南口",
    arrival: "17:00 开演建议 14:00 到；18:00 开演建议 15:00 到",
    risk: "离东京核心区远",
    riskLevel: 4,
    beginner: 62,
    queue: "展馆入口分散，先看官方 Hall 编号和入场口。不要只跟最大队伍，国际展示场 9-11 Hall 与 1-8 Hall 动线不同，先确认 Hall 再排。",
    lastTrain: "保守线：22:15 前开始往海滨幕张站走，22:50 前进站。回东京方向依赖 JR 京叶线，23:15 后换乘余量明显变小；第一次去建议住海滨幕张或舞滨附近。"
  },
  saitama: {
    name: "さいたまスーパーアリーナ",
    station: "さいたま新都心站 西口 / 北与野站",
    arrival: "17:00 开演建议 14:30 到；18:00 开演建议 15:30 到",
    risk: "容量大，换乘需缓冲",
    riskLevel: 3,
    beginner: 70,
    queue: "先确认 Level 入口和座位楼层。さいたま新都心站侧人流最大，若官方开放北与野方向动线，散场可考虑向北与野分流再换乘。",
    lastTrain: "保守线：22:30 前离开场馆平台，23:05 前进さいたま新都心站。回东京/上野/新宿方向要留换乘余量；住大宫或浦和可降低末班压力。"
  }
};

const budgetMeta = {
  low: { label: "低", pressure: 3 },
  mid: { label: "中", pressure: 2 },
  high: { label: "低", pressure: 1 }
};

const priorityMeta = {
  save: { label: "省钱" },
  stable: { label: "稳妥" },
  experience: { label: "体验优先" }
};

let activeVenue = "tokyoDome";

const artistInput = document.querySelector("#artistInput");
const budgetInput = document.querySelector("#budgetInput");
const priorityInput = document.querySelector("#priorityInput");
const firstTimeInput = document.querySelector("#firstTimeInput");
const venueTabs = document.querySelector("#venueTabs");
const generateButton = document.querySelector("#generateButton");

const verdictBadge = document.querySelector("#verdictBadge");
const verdictTitle = document.querySelector("#verdictTitle");
const budgetPressure = document.querySelector("#budgetPressure");
const trafficRisk = document.querySelector("#trafficRisk");
const beginnerScore = document.querySelector("#beginnerScore");
const venueRisk = document.querySelector("#venueRisk");
const venueName = document.querySelector("#venueName");
const arrivalText = document.querySelector("#arrivalText");
const stationText = document.querySelector("#stationText");
const queueText = document.querySelector("#queueText");
const lastTrainText = document.querySelector("#lastTrainText");
const cultureList = document.querySelector("#cultureList");

function getPlan() {
  const venue = venues[activeVenue];
  const budget = budgetInput.value;
  const priority = priorityInput.value;
  const firstTime = firstTimeInput.checked;
  const budgetPressureValue = budgetMeta[budget].pressure;
  const trafficPressure = venue.riskLevel;
  const beginnerValue = Math.max(42, venue.beginner - (firstTime ? trafficPressure * 3 : 0) + (priority === "stable" ? 8 : 0));

  let verdict = {
    badge: "值得去",
    title: `${artistInput.value || "目标艺人"} 的这场可以推进`,
    text: ""
  };

  if (budget === "low" && firstTime && venue.riskLevel >= 3) {
    verdict = {
      badge: "可以等下一次",
      title: "第一次远征不建议硬冲高风险场馆",
      text: ""
    };
  } else if ((budget === "mid" && venue.riskLevel >= 3) || (budget === "low" && priority !== "save")) {
    verdict = {
      badge: "考虑替代方案",
      title: "先锁定票务和回程，再决定是否出发",
      text: ""
    };
  } else if (priority === "experience" && budget === "high") {
    verdict = {
      badge: "值得去",
      title: "适合按体验优先方案推进",
      text: ""
    };
  }

  return {
    venue,
    verdict,
    budgetPressure: budgetPressureValue,
    trafficPressure,
    beginnerValue,
    priority
  };
}

function pressureLabel(value) {
  if (value >= 4) return "高";
  if (value >= 2) return "中";
  return "低";
}

function renderCulture(plan) {
  const firstTimeTip = firstTimeInput.checked
    ? "第一次去建议提前保存票面、场馆公告、回程路线和酒店地址截图，避免现场网络或语言压力。"
    : "有经验用户也要重新确认本场规则，不同主办方对拍摄、应援物和入场检查要求会变。";

  const items = [
    {
      title: "现场礼仪",
      text: "跟随现场氛围，不随意占位、插队或遮挡他人视线；应援动作以艺人和主办规则为准。"
    },
    {
      title: "禁止携带",
      text: "大件行李、专业摄影器材、危险品通常不适合带入场内；是否可寄存要提前查场馆公告。"
    },
    {
      title: "应援与荧光棒",
      text: plan.priority === "save"
        ? "预算有限时不要盲买全套周边，优先确认官方应援物是否必要。"
        : "如果有颜色规则或曲目应援习惯，提前看官方说明和粉丝整理，避免现场临时学习。"
    },
    {
      title: "拍照规定",
      text: "日本演出多数对拍照录像限制严格，开演前也可能有场内拍摄限制。"
    },
    {
      title: "新手提醒",
      text: firstTimeTip
    }
  ];

  cultureList.innerHTML = items.map((item) => `
    <li>
      <strong>${item.title}</strong>
      ${item.text}
    </li>
  `).join("");
}

function render() {
  const plan = getPlan();

  verdictBadge.textContent = plan.verdict.badge;
  verdictTitle.textContent = plan.verdict.title;
  budgetPressure.textContent = pressureLabel(plan.budgetPressure);
  trafficRisk.textContent = pressureLabel(plan.trafficPressure);
  beginnerScore.textContent = plan.beginnerValue;

  venueRisk.textContent = plan.venue.risk;
  venueName.textContent = plan.venue.name;
  arrivalText.textContent = plan.venue.arrival;
  stationText.textContent = plan.venue.station;
  queueText.textContent = plan.venue.queue;
  lastTrainText.textContent = plan.venue.lastTrain;

  renderCulture(plan);
}

venueTabs.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-venue]");
  if (!button) return;
  activeVenue = button.dataset.venue;
  venueTabs.querySelectorAll("button").forEach((item) => {
    item.classList.toggle("is-active", item === button);
  });
  render();
});

[artistInput, budgetInput, priorityInput, firstTimeInput].forEach((control) => {
  control.addEventListener("input", render);
  control.addEventListener("change", render);
});

generateButton.addEventListener("click", render);

render();
