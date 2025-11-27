// ====== ABI контракта (то, что ты прислал) ======
const ABI = [
    {
        "inputs": [],
        "name": "deposit",
        "outputs": [],
        "stateMutability": "payable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "enum RPC.Move",
                "name": "playerMove",
                "type": "uint8"
            }
        ],
        "name": "play",
        "outputs": [],
        "stateMutability": "payable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "bps",
                "type": "uint256"
            }
        ],
        "name": "setHouseEdgeBps",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "stateMutability": "payable",
        "type": "constructor"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "player",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "enum RPC.Move",
                "name": "playerMove",
                "type": "uint8"
            },
            {
                "indexed": false,
                "internalType": "enum RPC.Move",
                "name": "houseMove",
                "type": "uint8"
            },
            {
                "indexed": false,
                "internalType": "bool",
                "name": "win",
                "type": "bool"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "bet",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "payout",
                "type": "uint256"
            }
        ],
        "name": "Played",
        "type": "event"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "weiAmount",
                "type": "uint256"
            }
        ],
        "name": "setMinBetWei",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "amount",
                "type": "uint256"
            }
        ],
        "name": "withdrawOwner",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "withdrawWinnings",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "stateMutability": "payable",
        "type": "receive"
    },
    {
        "inputs": [],
        "name": "houseEdgeBps",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "minBetWei",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "owner",
        "outputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "name": "pendingWins",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    }
];

// ⚠️ Заменить на реальный адрес твоего контракта
const CONTRACT_ADDRESS = "0x4b547ecA0c2F3376E7f5e38626dCee47f03a2413";

// Локальные счётчики (для отображения только на фронте)
let userScore = 0;
let computerScore = 0;

// DOM-элементы
const userScoreSpan = document.getElementById('user-score');
const computerScoreSpan = document.getElementById('computer-score');
const resultP = document.getElementById('result-text');
const actionMsgP = document.getElementById('action-msg');

const rockDiv = document.getElementById('r');
const paperDiv = document.getElementById('p');
const scissorsDiv = document.getElementById('s');

const connectBtn = document.getElementById('connect-btn');
const walletAddrP = document.getElementById('wallet-address');
const minBetP = document.getElementById('min-bet');
const houseEdgeP = document.getElementById('house-edge');
const betInput = document.getElementById('bet-amount');

const withdrawBtn = document.getElementById('withdraw-btn');
const pendingWinsP = document.getElementById('pending-wins');

// Ethers объекты
let provider = null;
let signer = null;
let contract = null;
let currentAccount = null;

// enum Move в Solidity обычно: 0 = Rock, 1 = Paper, 2 = Scissors
const MOVE = {
    ROCK: 0,
    PAPER: 1,
    SCISSORS: 2,
};

function moveToWord(moveUint) {
    if (moveUint === MOVE.ROCK) return "Rock";
    if (moveUint === MOVE.PAPER) return "Paper";
    if (moveUint === MOVE.SCISSORS) return "Scissors";
    return "Unknown";
}

// ====== Подключение кошелька ======

async function connectWallet() {
    try {
        if (!window.ethereum) {
            alert("MetaMask is not detected. Please install MetaMask.");
            return;
        }

        provider = new ethers.providers.Web3Provider(window.ethereum);
        const accounts = await provider.send("eth_requestAccounts", []);
        currentAccount = accounts[0];
        signer = provider.getSigner();
        contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);

        walletAddrP.textContent = `Wallet: ${currentAccount}`;

        actionMsgP.textContent = "Wallet connected. You can play now.";
        await loadContractConfig();
        await updatePendingWins();
    } catch (err) {
        console.error(err);
        alert("Failed to connect wallet.");
    }
}

async function loadContractConfig() {
    try {
        const minBetWei = await contract.minBetWei();
        const houseEdgeBps = await contract.houseEdgeBps();

        const minBetEth = ethers.utils.formatEther(minBetWei);
        minBetP.textContent = `Min bet: ${minBetEth} ETH`;
        houseEdgeP.textContent = `House edge: ${houseEdgeBps.toString()} bps (${(Number(houseEdgeBps) / 100).toFixed(2)}%)`;
    } catch (err) {
        console.error("Error loading config:", err);
    }
}

async function updatePendingWins() {
    if (!contract || !currentAccount) return;
    try {
        const pendingWei = await contract.pendingWins(currentAccount);
        const pendingEth = ethers.utils.formatEther(pendingWei);
        pendingWinsP.textContent = `Pending winnings: ${pendingEth} ETH`;
    } catch (err) {
        console.error("Error loading pending wins:", err);
    }
}

// ====== Игровая логика, завязанная на контракт ======

async function onUserMove(moveEnumValue) {
    if (!contract || !signer || !currentAccount) {
        alert("Connect wallet first.");
        return;
    }

    // Считываем ставку
    const betEthStr = betInput.value || "0";
    if (Number(betEthStr) <= 0) {
        alert("Bet amount must be > 0.");
        return;
    }

    try {
        const betWei = ethers.utils.parseEther(betEthStr);

        // Проверим minBetWei
        const minBetWei = await contract.minBetWei();
        if (betWei.lt(minBetWei)) {
            const minBetEth = ethers.utils.formatEther(minBetWei);
            alert(`Bet is too small. Min bet is ${minBetEth} ETH.`);
            return;
        }

        actionMsgP.textContent = "Sending transaction... please confirm in MetaMask.";

        // Вызов play(move) c value
        const tx = await contract.play(moveEnumValue, { value: betWei });
        actionMsgP.textContent = "Transaction sent. Waiting for confirmation...";

        const receipt = await tx.wait();
        actionMsgP.textContent = "Transaction confirmed. Updating result...";

        // Ищем событие Played в логе
        const playedEvent = receipt.events.find(e => e.event === "Played");
        if (!playedEvent) {
            resultP.textContent = "Game finished, but no Played event found.";
            return;
        }

        const { playerMove, houseMove, win, bet, payout } = playedEvent.args;

        handleGameResult(playerMove, houseMove, win, bet, payout);
        await updatePendingWins();
    } catch (err) {
        console.error(err);
        resultP.textContent = "Transaction failed or was rejected.";
        actionMsgP.textContent = "You can try again.";
    }
}

function handleGameResult(playerMove, houseMove, win, bet, payout) {
    const playerMoveWord = moveToWord(playerMove);
    const houseMoveWord = moveToWord(houseMove);

    if (win) {
        userScore++;
        resultP.textContent = `${playerMoveWord} (you) beats ${houseMoveWord} (house). You WIN!`;
    } else if (playerMove === houseMove) {
        resultP.textContent = `${playerMoveWord} (you) equals ${houseMoveWord} (house). It's a DRAW.`;
    } else {
        computerScore++;
        resultP.textContent = `${playerMoveWord} (you) loses to ${houseMoveWord} (house). You LOST.`;
    }

    userScoreSpan.textContent = userScore;
    computerScoreSpan.textContent = computerScore;
}

// ====== Вывод выигрыша ======

async function withdrawWinnings() {
    if (!contract || !signer || !currentAccount) {
        alert("Connect wallet first.");
        return;
    }

    try {
        actionMsgP.textContent = "Sending withdraw transaction...";
        const tx = await contract.withdrawWinnings();
        const receipt = await tx.wait();
        actionMsgP.textContent = "Withdraw completed.";
        await updatePendingWins();
    } catch (err) {
        console.error(err);
        alert("Withdraw failed or rejected.");
    }
}

// ====== Навешиваем обработчики на кнопки и выборы ======

function main() {
    connectBtn.addEventListener('click', connectWallet);
    withdrawBtn.addEventListener('click', withdrawWinnings);

    // r = ROCK, p = PAPER, s = SCISSORS
    rockDiv.addEventListener('click', () => onUserMove(MOVE.ROCK));
    paperDiv.addEventListener('click', () => onUserMove(MOVE.PAPER));
    scissorsDiv.addEventListener('click', () => onUserMove(MOVE.SCISSORS));
}

main();
