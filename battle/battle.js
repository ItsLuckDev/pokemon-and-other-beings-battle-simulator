const TURN_DELAY = 2000; // ms in cui resta visibile l'attacco nemico prima di tornare al giocatore

class Pokemon
{
  constructor(name, level, hp, moves, sprite)
  {
    this.name = name;
    this.level = level;
    this.hp = hp;
    this.maxHp = hp;
    this.moves = moves;
    this.sprite = sprite;
  }

  takeDamage(amount) { this.hp = Math.max(0, this.hp - amount);}
}

// scrive HP e percentuale nel riquadro indicato
function showHP(pkmn, elementId){
  const percentuale = Math.round(pkmn.hp / pkmn.maxHp * 100);
  document.getElementById(elementId).textContent = `HP: ${pkmn.hp} (${percentuale}%)`;
}

let enemyFound = false; // placeholder per quando ci metterò un server dietro
let enemy;

// ============= ENEMY ========================
if(!enemyFound){
  enemy = new Pokemon("MissingNo", "NaN", 150, [{ "moveName": "missingAttack", "damage": 25 }], "./img/missingNo.png");
  document.getElementById("enemyName").textContent = `${enemy.name} LV: ${enemy.level}`;
  const enemySprite = document.getElementById("enemySprite");
  enemySprite.src = enemy.sprite;
  enemySprite.alt = enemy.name;
  showHP(enemy, "enemyHP");
}

// ============== PLAYER ======================
// dichiara il pokemon del giocatore e assegna le mosse ai bottoni
let playerPkmn;
fetch("../team.json")
  .then(re => re.json())
  .then(data=>{
    playerPkmn = new Pokemon(data.Name, data.Level, data.HP, data.moves, data.Sprite);

    // nome e livello del pokemon
    document.getElementById("pokeName").textContent = `${playerPkmn.name} LV: ${playerPkmn.level}`;

    // sprite del pokemon (retro)
    const playerSprite = document.getElementById("playerSprite");
    playerSprite.src = playerPkmn.sprite;
    playerSprite.alt = playerPkmn.name;

    showHP(playerPkmn, "playerHP");

    // assegna le mosse ai bottoni nel menu del giocatore.
    for(let i = 0; i < 4; ++i){
      const btn = document.getElementById("move" + (i + 1));
      if(playerPkmn.moves[i]) btn.textContent = playerPkmn.moves[i].moveName;
      else btn.style.display = "none";
    }

    // i bottoni partono disattivati nell'HTML: si attivano solo quando playerPkmn esiste
    askMove();
  })
  // file mancante o JSON scritto male: lo diciamo invece di restare bloccati in silenzio
  .catch(() => document.getElementById("info").textContent = "Couldn't load team.json");


// =============== GIOCO ====================
// bottoni
for(let i = 0; i < 4; ++i){
  const btn = document.getElementById("move" + (i+1));
  btn.addEventListener("click", () => {
    setMovesDisabled(true);
    const move = playerPkmn.moves[i];
    enemy.takeDamage(move.damage);
    showHP(enemy, "enemyHP");
    document.getElementById("info").textContent = `${playerPkmn.name} used ${move.moveName}!`;
    checkGameOver();
    if(enemy.hp > 0) enemyMove();
  })
}

function enemyMove(){
  // Math.random() dà un numero tra 0 e 1 (escluso): * length e floor lo trasformano in un indice valido
  const randMove = enemy.moves[Math.floor(Math.random() * enemy.moves.length)];
  document.getElementById("info").textContent = `The enemy ${enemy.name} used ${randMove.moveName}!`;
  playerPkmn.takeDamage(randMove.damage);
  showHP(playerPkmn, "playerHP");
  checkGameOver();

  // il messaggio dell'attacco resta TURN_DELAY ms, poi tocca di nuovo al giocatore
  setTimeout(() => {
    if(playerPkmn.hp > 0) askMove();
  }, TURN_DELAY);
}

// chiede la prossima mossa al giocatore e riattiva i bottoni
function askMove(){
  document.getElementById("info").textContent = `What should ${playerPkmn.name} do?`;
  setMovesDisabled(false);
}

function setMovesDisabled(disabled){
  for(let i = 1; i <= 4; ++i) document.getElementById("move" + i).disabled = disabled;
}


function checkGameOver(){
  // nessuno è a 0 HP: la partita continua
  if(enemy.hp > 0 && playerPkmn.hp > 0) return;

  // schermata vittoria/sconfitta: colori e visibilità li decide il CSS con .win/.lose
  const won = enemy.hp === 0;
  const endGame = document.getElementById("endGame");
  endGame.textContent = won ? "You won!" : "You lost!";
  endGame.classList.add(won ? "win" : "lose");

  // partita finita: niente più attacchi
  setMovesDisabled(true);
}
