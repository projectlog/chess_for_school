"use strict";

const PIECES = {
  w: { k: "♔", q: "♕", r: "♖", b: "♗", n: "♘", p: "♙" },
  b: { k: "♚", q: "♛", r: "♜", b: "♝", n: "♞", p: "♟" }
};

const LESSONS = [
  {
    icon: "♟", title: "체스판과 목표",
    text: "체스는 8×8, 모두 64칸인 판에서 두 사람이 겨루는 게임입니다. 밝은 칸이 오른쪽 아래에 오도록 놓고, 백이 먼저 움직입니다.",
    tips: ["목표는 상대 왕을 잡는 것이 아니라 도망갈 곳이 없게 만드는 ‘체크메이트’입니다.", "각자 왕 1, 퀸 1, 룩 2, 비숍 2, 나이트 2, 폰 8개로 시작합니다."],
    demo: "setup"
  },
  { icon: "♙", title: "폰", text: "폰은 앞으로 한 칸 움직이고, 처음 움직일 때만 두 칸 갈 수 있습니다. 하지만 상대 말을 잡을 때는 대각선 앞으로 한 칸 움직입니다.", tips: ["뒤로 갈 수 없습니다.", "끝줄에 도착하면 퀸·룩·비숍·나이트 중 하나로 승급합니다."], demo: "p" },
  { icon: "♖", title: "룩", text: "룩은 가로 또는 세로로 원하는 만큼 움직입니다. 다른 말을 뛰어넘을 수는 없습니다.", tips: ["빈 길에서 아주 강합니다.", "왕과 함께 캐슬링이라는 특별한 움직임을 할 수 있습니다."], demo: "r" },
  { icon: "♗", title: "비숍", text: "비숍은 대각선으로 원하는 만큼 움직입니다. 처음 놓인 칸의 색에서 평생 벗어나지 않습니다.", tips: ["두 비숍을 함께 쓰면 밝은 칸과 어두운 칸을 모두 지킬 수 있습니다."], demo: "b" },
  { icon: "♘", title: "나이트", text: "나이트는 ‘ㄱ’ 모양으로 움직입니다. 한 방향으로 두 칸, 그 옆으로 한 칸입니다.", tips: ["다른 말을 뛰어넘을 수 있는 유일한 말입니다.", "중앙에 가까울수록 갈 수 있는 칸이 많아집니다."], demo: "n" },
  { icon: "♕", title: "퀸", text: "퀸은 룩과 비숍의 움직임을 합친 가장 강한 말입니다. 가로, 세로, 대각선으로 원하는 만큼 움직입니다.", tips: ["강하지만 너무 일찍 앞으로 나가면 공격받기 쉽습니다."], demo: "q" },
  { icon: "♔", title: "왕과 체크", text: "왕은 모든 방향으로 한 칸 움직입니다. 왕이 상대 말에게 공격받으면 ‘체크’이며, 반드시 다음 수에 체크를 피해야 합니다.", tips: ["왕은 공격받는 칸으로 갈 수 없습니다.", "체크를 피할 방법이 없으면 체크메이트로 게임이 끝납니다."], demo: "k" },
  { icon: "🏰", title: "특별 규칙", text: "캐슬링은 왕과 룩을 한 번에 움직여 왕을 안전하게 만드는 수입니다. 앙파상과 폰 승급도 중요한 특별 규칙입니다.", tips: ["캐슬링: 왕과 해당 룩이 움직인 적 없고, 사이가 비어 있으며, 왕이 체크 중이거나 공격받는 칸을 지나면 안 됩니다.", "앙파상: 상대 폰이 처음 두 칸 전진해 내 폰 옆에 왔을 때 바로 다음 수에만 잡을 수 있습니다."], demo: "castle" }
];

const MISSIONS = [
  { name: "폰을 전진시켜요", description: "e2의 백 폰을 e4로 움직이세요.", board: "start", from: [6,4], to: [4,4], hint: "e2의 폰을 누른 뒤 두 칸 앞인 e4를 누르세요." },
  { name: "나이트는 뛰어넘어요", description: "g1의 나이트를 f3으로 움직이세요.", board: "start", from: [7,6], to: [5,5], hint: "나이트는 ㄱ 모양으로 움직입니다." },
  { name: "상대 말을 잡아요", description: "c4의 비숍으로 f7의 검은 폰을 잡으세요.", board: "bishop", from: [4,2], to: [1,5], hint: "비숍은 대각선으로 움직입니다." },
  { name: "체크를 만들어요", description: "d1의 퀸을 h5로 움직여 흑 왕을 체크하세요.", board: "queen", from: [7,3], to: [3,7], hint: "퀸은 대각선으로도 움직입니다." },
  { name: "왕을 안전하게", description: "백의 킹사이드 캐슬링을 완성하세요. 왕을 e1에서 g1로 움직이면 됩니다.", board: "castle", from: [7,4], to: [7,6], hint: "왕과 h1 룩 사이가 비어 있습니다." }
];

let soundOn = true;
let lessonIndex = 0;
let missionIndex = 0;
let missionScore = 0;
let missionState = null;
let game = null;
let selected = null;
let legalTargets = [];
let boardFlipped = false;
let aiThinking = false;
let pendingPromotion = null;

function emptyBoard() { return Array.from({ length: 8 }, () => Array(8).fill(null)); }
function piece(color, type) { return { color, type, moved: false }; }

function createInitialBoard() {
  const b = emptyBoard();
  const back = ["r","n","b","q","k","b","n","r"];
  for (let c=0;c<8;c++) {
    b[0][c] = piece("b", back[c]); b[1][c] = piece("b","p");
    b[6][c] = piece("w","p"); b[7][c] = piece("w", back[c]);
  }
  return b;
}

function cloneBoard(board) { return board.map(row => row.map(p => p ? { ...p } : null)); }
function inBounds(r,c) { return r>=0 && r<8 && c>=0 && c<8; }
function opposite(color) { return color === "w" ? "b" : "w"; }
function algebraic(r,c) { return "abcdefgh"[c] + (8-r); }

function createState(board = createInitialBoard()) {
  return { board, turn: "w", enPassant: null, history: [], moves: [], gameOver: false, winner: null, message: "" };
}

function rawMoves(state, r, c, attacksOnly=false) {
  const p = state.board[r][c];
  if (!p) return [];
  const moves = [];
  const addSlide = dirs => {
    for (const [dr,dc] of dirs) {
      let nr=r+dr,nc=c+dc;
      while (inBounds(nr,nc)) {
        const t=state.board[nr][nc];
        if (!t) moves.push({r:nr,c:nc});
        else { if (t.color!==p.color) moves.push({r:nr,c:nc,capture:true}); break; }
        nr+=dr; nc+=dc;
      }
    }
  };
  if (p.type === "p") {
    const dir = p.color === "w" ? -1 : 1;
    const start = p.color === "w" ? 6 : 1;
    if (!attacksOnly && inBounds(r+dir,c) && !state.board[r+dir][c]) {
      moves.push({r:r+dir,c});
      if (r===start && !state.board[r+2*dir][c]) moves.push({r:r+2*dir,c,double:true});
    }
    for (const dc of [-1,1]) {
      const nr=r+dir,nc=c+dc;
      if (!inBounds(nr,nc)) continue;
      const t=state.board[nr][nc];
      if (attacksOnly) moves.push({r:nr,c:nc});
      else if (t && t.color!==p.color) moves.push({r:nr,c:nc,capture:true});
      else if (state.enPassant && state.enPassant.r===nr && state.enPassant.c===nc) moves.push({r:nr,c:nc,enPassant:true,capture:true});
    }
  } else if (p.type === "n") {
    for (const [dr,dc] of [[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]]) {
      const nr=r+dr,nc=c+dc; if (!inBounds(nr,nc)) continue;
      const t=state.board[nr][nc]; if (!t || t.color!==p.color) moves.push({r:nr,c:nc,capture:!!t});
    }
  } else if (p.type === "b") addSlide([[-1,-1],[-1,1],[1,-1],[1,1]]);
  else if (p.type === "r") addSlide([[-1,0],[1,0],[0,-1],[0,1]]);
  else if (p.type === "q") addSlide([[-1,-1],[-1,1],[1,-1],[1,1],[-1,0],[1,0],[0,-1],[0,1]]);
  else if (p.type === "k") {
    for (let dr=-1;dr<=1;dr++) for (let dc=-1;dc<=1;dc++) if (dr||dc) {
      const nr=r+dr,nc=c+dc; if (!inBounds(nr,nc)) continue;
      const t=state.board[nr][nc]; if (!t || t.color!==p.color) moves.push({r:nr,c:nc,capture:!!t});
    }
    if (!attacksOnly && !p.moved && !isInCheck(state,p.color)) {
      const row = p.color === "w" ? 7 : 0;
      for (const side of [{rookC:7, path:[5,6], kingC:6},{rookC:0,path:[1,2,3],kingC:2}]) {
        const rook=state.board[row][side.rookC];
        if (!rook || rook.type!=="r" || rook.color!==p.color || rook.moved) continue;
        if (side.path.some(pc => state.board[row][pc])) continue;
        const through = side.kingC===6 ? [5,6] : [3,2];
        if (through.some(pc => isSquareAttacked(state,row,pc,opposite(p.color)))) continue;
        moves.push({r:row,c:side.kingC,castle:true,rookFrom:side.rookC,rookTo:side.kingC===6?5:3});
      }
    }
  }
  return moves;
}

function findKing(state,color) {
  for (let r=0;r<8;r++) for (let c=0;c<8;c++) {
    const p=state.board[r][c]; if (p && p.color===color && p.type==="k") return [r,c];
  }
  return null;
}
function isSquareAttacked(state,r,c,byColor) {
  for (let rr=0;rr<8;rr++) for (let cc=0;cc<8;cc++) {
    const p=state.board[rr][cc]; if (!p || p.color!==byColor) continue;
    if (rawMoves(state,rr,cc,true).some(m=>m.r===r&&m.c===c)) return true;
  }
  return false;
}
function isInCheck(state,color) {
  const k=findKing(state,color); return k ? isSquareAttacked(state,k[0],k[1],opposite(color)) : false;
}

function legalMovesFor(state,r,c) {
  const p=state.board[r][c]; if (!p) return [];
  return rawMoves(state,r,c).filter(m => {
    const next = simulateMove(state,r,c,m);
    return !isInCheck(next,p.color);
  });
}

function simulateMove(state,fr,fc,move) {
  const next={...state,board:cloneBoard(state.board),enPassant:null};
  const p=next.board[fr][fc];
  next.board[move.r][move.c]={...p,moved:true}; next.board[fr][fc]=null;
  if (move.enPassant) next.board[fr][move.c]=null;
  if (move.castle) {
    next.board[move.r][move.rookTo]={...next.board[move.r][move.rookFrom],moved:true};
    next.board[move.r][move.rookFrom]=null;
  }
  if (p.type==="p" && Math.abs(move.r-fr)===2) next.enPassant={r:(fr+move.r)/2,c:fc};
  return next;
}

function allLegalMoves(state,color=state.turn) {
  const list=[];
  for (let r=0;r<8;r++) for (let c=0;c<8;c++) {
    const p=state.board[r][c]; if (!p || p.color!==color) continue;
    for (const m of legalMovesFor(state,r,c)) list.push({fr:r,fc:c,...m});
  }
  return list;
}

function moveNotation(p,fr,fc,m,captured,check,mat) {
  if (m.castle) return m.c===6 ? "O-O" : "O-O-O";
  const names={k:"K",q:"Q",r:"R",b:"B",n:"N",p:""};
  return `${names[p.type]}${captured?"x":""}${algebraic(m.r,m.c)}${m.promotion?"="+m.promotion.toUpperCase():""}${mat?"#":check?"+":""}`;
}

function commitMove(state,fr,fc,m,promotionChoice=null) {
  if (state.gameOver) return;
  state.history.push({board:cloneBoard(state.board),turn:state.turn,enPassant:state.enPassant?{...state.enPassant}:null,moves:[...state.moves],gameOver:state.gameOver,winner:state.winner,message:state.message});
  const moving={...state.board[fr][fc]};
  const captured=!!state.board[m.r][m.c] || m.enPassant;
  const next=simulateMove(state,fr,fc,m);
  state.board=next.board; state.enPassant=next.enPassant;
  if (moving.type==="p" && (m.r===0 || m.r===7)) {
    const chosen=promotionChoice || "q"; state.board[m.r][m.c].type=chosen; m.promotion=chosen;
  }
  state.turn=opposite(state.turn);
  const check=isInCheck(state,state.turn);
  const replies=allLegalMoves(state,state.turn);
  const mate=check && replies.length===0;
  const stalemate=!check && replies.length===0;
  state.moves.push(moveNotation(moving,fr,fc,m,captured,check,mate));
  if (mate) { state.gameOver=true; state.winner=opposite(state.turn); state.message=`체크메이트! ${state.winner==="w"?"백":"흑"} 승리`; }
  else if (stalemate) { state.gameOver=true; state.winner=null; state.message="스테일메이트! 무승부"; }
  else state.message=check?"체크!":"";
  playTone(captured?520:360,0.08);
}

function createSquare(r,c,p,options={}) {
  const btn=document.createElement("button");
  btn.type="button"; btn.className=`square ${(r+c)%2===0?"light":"dark"}`;
  btn.dataset.r=r; btn.dataset.c=c;
  btn.setAttribute("aria-label", `${algebraic(r,c)} ${p?`${p.color==="w"?"백":"흑"} ${p.type}`:"빈칸"}`);
  if (p) btn.textContent=PIECES[p.color][p.type];
  if (options.selected) btn.classList.add("selected");
  if (options.legal) btn.classList.add(options.capture?"capture":"legal");
  if (options.check) btn.classList.add("check");
  if (options.last) btn.classList.add("last-move");
  if (options.hint) btn.classList.add("hint");
  if (options.coords) {
    if (c===0) { const s=document.createElement("span");s.className="coord rank";s.textContent=8-r;btn.appendChild(s); }
    if (r===7) { const s=document.createElement("span");s.className="coord file";s.textContent="abcdefgh"[c];btn.appendChild(s); }
  }
  return btn;
}

function renderBoard(el,state,handler,{flipped=false,hints=[]}={}) {
  el.innerHTML="";
  const rows=flipped?[7,6,5,4,3,2,1,0]:[0,1,2,3,4,5,6,7];
  const cols=flipped?[7,6,5,4,3,2,1,0]:[0,1,2,3,4,5,6,7];
  const king=findKing(state,state.turn);
  for (const r of rows) for (const c of cols) {
    const target=legalTargets.find(m=>m.r===r&&m.c===c);
    const sq=createSquare(r,c,state.board[r][c],{
      selected:selected&&selected.r===r&&selected.c===c,
      legal:!!target,capture:target?.capture,
      check:king&&king[0]===r&&king[1]===c&&isInCheck(state,state.turn),
      hint:hints.some(h=>h[0]===r&&h[1]===c),coords:true
    });
    sq.addEventListener("click",()=>handler(r,c)); el.appendChild(sq);
  }
}

function renderLesson() {
  const l=LESSONS[lessonIndex];
  lessonIcon.textContent=l.icon; lessonNumber.textContent=`레슨 ${lessonIndex+1}`; lessonTitle.textContent=l.title; lessonText.textContent=l.text;
  lessonTips.innerHTML=l.tips.map(t=>`<li>${t}</li>`).join("");
  learnProgress.style.width=`${((lessonIndex+1)/LESSONS.length)*100}%`; learnProgressText.textContent=`${lessonIndex+1} / ${LESSONS.length}`;
  prevLesson.disabled=lessonIndex===0; nextLesson.textContent=lessonIndex===LESSONS.length-1?"처음부터 ↺":"다음 →";
  renderMiniBoard(l.demo);
}

function renderMiniBoard(type) {
  const state=createState(emptyBoard()); let center=[4,3];
  if (type==="setup") state.board=createInitialBoard();
  else if (type==="castle") { state.board[7][4]=piece("w","k"); state.board[7][7]=piece("w","r"); center=[7,4]; }
  else {
    if(type==="p") { center=[6,3]; state.board[6][3]=piece("w","p"); }
    else state.board[4][3]=piece("w",type);
  }
  miniBoard.innerHTML=""; selected={r:center[0],c:center[1]}; legalTargets=type==="setup"?[]:rawMoves(state,center[0],center[1]);
  for(let r=0;r<8;r++) for(let c=0;c<8;c++) {
    const t=legalTargets.find(m=>m.r===r&&m.c===c);
    miniBoard.appendChild(createSquare(r,c,state.board[r][c],{selected:r===center[0]&&c===center[1],legal:!!t,capture:t?.capture}));
  }
  selected=null; legalTargets=[];
  miniCaption.textContent=type==="setup"?"백은 아래쪽에서 시작합니다.":"초록 점이 이동할 수 있는 칸입니다.";
}

function missionBoardFor(key) {
  if (key==="start") return createInitialBoard();
  const b=emptyBoard();
  if(key==="bishop") { b[7][4]=piece("w","k"); b[0][4]=piece("b","k"); b[4][2]=piece("w","b"); b[1][5]=piece("b","p"); }
  if(key==="queen") { b[7][4]=piece("w","k"); b[0][4]=piece("b","k"); b[7][3]=piece("w","q"); b[6][4]=piece("w","p"); }
  if(key==="castle") { b[7][4]=piece("w","k"); b[7][7]=piece("w","r"); b[0][4]=piece("b","k"); }
  return b;
}

function loadMission() {
  const m=MISSIONS[missionIndex]; missionState=createState(missionBoardFor(m.board)); selected=null;legalTargets=[];
  missionBadge.textContent=`미션 ${missionIndex+1}`; missionName.textContent=m.name; missionDescription.textContent=m.description;
  missionFeedback.className="feedback"; missionFeedback.textContent="말을 눌러 시작하세요.";
  prevMission.disabled=missionIndex===0; nextMission.textContent=missionIndex===MISSIONS.length-1?"처음으로 ↺":"다음 미션 →";
  renderMission();
}
function renderMission(hints=[]) { renderBoard(missionBoard,missionState,handleMissionClick,{hints}); }
function handleMissionClick(r,c) {
  const m=MISSIONS[missionIndex]; const p=missionState.board[r][c];
  if (!selected) {
    if (!p || p.color!=="w") return feedback("백 말을 먼저 선택하세요.","error");
    selected={r,c}; legalTargets=legalMovesFor(missionState,r,c); renderMission(); return;
  }
  const chosen=legalTargets.find(x=>x.r===r&&x.c===c);
  if (!chosen) { selected=null; legalTargets=[]; renderMission(); return feedback("그 칸으로는 움직일 수 없어요. 다시 생각해 보세요.","error"); }
  const correct=selected.r===m.from[0]&&selected.c===m.from[1]&&r===m.to[0]&&c===m.to[1];
  commitMove(missionState,selected.r,selected.c,chosen);
  selected=null;legalTargets=[];renderMission();
  if(correct) { missionScore+=20; missionScoreEl.textContent=missionScore; feedback("정답입니다! 아주 잘했어요. ⭐","success"); }
  else feedback("가능한 수이지만 이번 미션의 목표 수는 아니에요. 다시 시작해 보세요.","error");
}
function feedback(text,type="") { missionFeedback.className=`feedback ${type}`; missionFeedback.textContent=text; }

function newGameState() {
  game=createState(); selected=null;legalTargets=[];aiThinking=false;pendingPromotion=null;
  boardFlipped=playerColor.value==="b";
  renderGame();
  if(gameMode.value==="ai" && playerColor.value==="b") setTimeout(makeAiMove,350);
}
function renderGame() {
  renderBoard(gameBoard,game,handleGameClick,{flipped:boardFlipped});
  const side=game.turn==="w"?"백":"흑";
  gameStatus.textContent=game.gameOver?game.message:`${side} 차례입니다.${game.message?` ${game.message}`:""}`;
  moveList.innerHTML="";
  for(let i=0;i<game.moves.length;i+=2) {
    const li=document.createElement("li"); li.textContent=`${game.moves[i]||""}${game.moves[i+1]?`   ${game.moves[i+1]}`:""}`; moveList.appendChild(li);
  }
}
function humanCanMove() {
  if(game.gameOver||aiThinking) return false;
  return gameMode.value==="local" || game.turn===playerColor.value;
}
function handleGameClick(r,c) {
  if(!humanCanMove()) return;
  const p=game.board[r][c];
  if(!selected) {
    if(!p||p.color!==game.turn) return;
    selected={r,c}; legalTargets=legalMovesFor(game,r,c); renderGame(); return;
  }
  if(p&&p.color===game.turn) { selected={r,c};legalTargets=legalMovesFor(game,r,c);renderGame();return; }
  const m=legalTargets.find(x=>x.r===r&&x.c===c);
  if(!m) { selected=null;legalTargets=[];renderGame();return; }
  const moving=game.board[selected.r][selected.c];
  if(moving.type==="p"&&(r===0||r===7)) {
    pendingPromotion={fr:selected.r,fc:selected.c,move:m}; showPromotion(moving.color); return;
  }
  finishHumanMove(selected.r,selected.c,m);
}
function finishHumanMove(fr,fc,m,promo=null) {
  commitMove(game,fr,fc,m,promo); selected=null;legalTargets=[];renderGame();
  if(gameMode.value==="ai"&&!game.gameOver&&game.turn!==playerColor.value) setTimeout(makeAiMove,450);
}
function makeAiMove() {
  if(game.gameOver||gameMode.value!=="ai") return;
  aiThinking=true; gameStatus.textContent="컴퓨터가 생각 중입니다…";
  setTimeout(()=>{
    const moves=allLegalMoves(game);
    if(!moves.length){aiThinking=false;renderGame();return;}
    const scored=moves.map(m=>{
      const target=game.board[m.r][m.c]; const values={p:1,n:3,b:3,r:5,q:9,k:100};
      return {m,score:(target?values[target.type]*10:0)+Math.random()*5+(m.r>=2&&m.r<=5&&m.c>=2&&m.c<=5?1:0)};
    }).sort((a,b)=>b.score-a.score);
    const choice=scored[0].m; const moving=game.board[choice.fr][choice.fc];
    commitMove(game,choice.fr,choice.fc,choice,moving.type==="p"&&(choice.r===0||choice.r===7)?"q":null);
    aiThinking=false;renderGame();
  },350);
}

function showPromotion(color) {
  promotionChoices.innerHTML="";
  for(const t of ["q","r","b","n"]) {
    const b=document.createElement("button");b.type="button";b.textContent=PIECES[color][t];
    b.addEventListener("click",()=>{promotionModal.hidden=true; const p=pendingPromotion;pendingPromotion=null;finishHumanMove(p.fr,p.fc,p.move,t);});
    promotionChoices.appendChild(b);
  }
  promotionModal.hidden=false;
}

function undo() {
  if(!game.history.length||aiThinking) return;
  const steps=gameMode.value==="ai"&&game.history.length>=2?2:1;
  for(let i=0;i<steps;i++) {
    const prev=game.history.pop(); if(!prev) break;
    game.board=prev.board;game.turn=prev.turn;game.enPassant=prev.enPassant;game.moves=prev.moves;game.gameOver=prev.gameOver;game.winner=prev.winner;game.message=prev.message;
  }
  selected=null;legalTargets=[];renderGame();
}

function playTone(freq=400,duration=.07) {
  if(!soundOn) return;
  try { const ac=new (window.AudioContext||window.webkitAudioContext)(); const o=ac.createOscillator(); const g=ac.createGain(); o.frequency.value=freq;o.connect(g);g.connect(ac.destination);g.gain.setValueAtTime(.05,ac.currentTime);g.gain.exponentialRampToValueAtTime(.001,ac.currentTime+duration);o.start();o.stop(ac.currentTime+duration); } catch(_) {}
}

const lessonIcon=document.getElementById("lessonIcon"), lessonNumber=document.getElementById("lessonNumber"), lessonTitle=document.getElementById("lessonTitle"), lessonText=document.getElementById("lessonText"), lessonTips=document.getElementById("lessonTips"), learnProgress=document.getElementById("learnProgress"), learnProgressText=document.getElementById("learnProgressText"), miniBoard=document.getElementById("miniBoard"), miniCaption=document.getElementById("miniCaption");
const prevLesson=document.getElementById("prevLesson"), nextLesson=document.getElementById("nextLesson");
const missionBoard=document.getElementById("missionBoard"), missionBadge=document.getElementById("missionBadge"), missionName=document.getElementById("missionName"), missionDescription=document.getElementById("missionDescription"), missionFeedback=document.getElementById("missionFeedback"), missionScoreEl=document.getElementById("missionScore"), prevMission=document.getElementById("prevMission"), nextMission=document.getElementById("nextMission");
const gameBoard=document.getElementById("gameBoard"), gameStatus=document.getElementById("gameStatus"), moveList=document.getElementById("moveList"), gameMode=document.getElementById("gameMode"), playerColor=document.getElementById("playerColor"), promotionModal=document.getElementById("promotionModal"), promotionChoices=document.getElementById("promotionChoices");

for(const tab of document.querySelectorAll(".tab")) tab.addEventListener("click",()=>{
  document.querySelectorAll(".tab").forEach(t=>t.classList.toggle("active",t===tab));
  document.querySelectorAll(".panel").forEach(p=>p.classList.remove("active"));
  document.getElementById(`${tab.dataset.mode}Panel`).classList.add("active");
});
prevLesson.addEventListener("click",()=>{if(lessonIndex>0)lessonIndex--;renderLesson();});
nextLesson.addEventListener("click",()=>{lessonIndex=lessonIndex===LESSONS.length-1?0:lessonIndex+1;renderLesson();});
prevMission.addEventListener("click",()=>{if(missionIndex>0)missionIndex--;loadMission();});
nextMission.addEventListener("click",()=>{missionIndex=missionIndex===MISSIONS.length-1?0:missionIndex+1;loadMission();});
document.getElementById("missionReset").addEventListener("click",loadMission);
document.getElementById("missionHint").addEventListener("click",()=>{const m=MISSIONS[missionIndex];feedback(m.hint);renderMission([m.from,m.to]);});
document.getElementById("newGame").addEventListener("click",newGameState);
document.getElementById("undoMove").addEventListener("click",undo);
document.getElementById("flipBoard").addEventListener("click",()=>{boardFlipped=!boardFlipped;renderGame();});
gameMode.addEventListener("change",newGameState); playerColor.addEventListener("change",newGameState);
document.getElementById("soundToggle").addEventListener("click",e=>{soundOn=!soundOn;e.currentTarget.textContent=soundOn?"🔊":"🔇";e.currentTarget.setAttribute("aria-pressed",String(soundOn));});

renderLesson(); loadMission(); newGameState();
