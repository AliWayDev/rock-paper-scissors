const crypto = require("crypto");
const TableCli = require("cli-table");

class Key {
  static generateKey() {
    return crypto.randomBytes(32);
  }
}

class Table {
  static printHelpTable(moves) {
    const table = new TableCli({
      head: ["PC/USER"].concat(moves),
      colWidths: new Array(moves.length + 1).fill(12),
    });

    for (let i = 0; i < moves.length; i++) {
      const row = [moves[i]];

      for (let j = 0; j < moves.length; j++) {
        if (i === j) {
          row.push("Draw");
        } else if (
          (j > i && j <= i + Math.floor(moves.length / 2)) ||
          (j < i && i - j > Math.floor(moves.length / 2))
        ) {
          row.push("Win");
        } else {
          row.push("Lose");
        }
      }

      table.push(row);
    }

    console.log("\nHelp table:");
    console.log(table.toString());
  }
}

class Game {
  static validateArgs(args) {
    const moves = args.slice(2);

    if (moves.length < 3 || moves.length % 2 === 0) {
      console.error("Error: Invalid arguments.");

      console.log(
        "Usage: node script.js move1 move2 ... moveN (N must be odd and ≥ 3)"
      );

      process.exit(1);
    }

    if (new Set(moves).size !== moves.length) {
      console.error("Error: Moves must be unique.");

      process.exit(1);
    }

    return moves;
  }

  static determineWinner(userMove, computerMove, moves) {
    const moveCount = moves.length;
    const userIndex = moves.indexOf(userMove);
    const computerIndex = moves.indexOf(computerMove);
    const half = Math.floor(moveCount / 2);

    if (
      (computerIndex > userIndex && computerIndex <= userIndex + half) ||
      (computerIndex < userIndex &&
        computerIndex <= (userIndex + half) % moveCount)
    ) {
      return "Computer wins!";
    } else if (computerIndex === userIndex) {
      return "It's a draw!";
    } else {
      return "User wins!";
    }
  }
}

class HmacKey {
  static calculateHmac(key, move) {
    return crypto.createHmac("sha256", key).update(move).digest("hex");
  }
}

function main() {
  const moves = Game.validateArgs(process.argv);

  const key = Key.generateKey();
  const computerMove = moves[Math.floor(Math.random() * moves.length)];
  const hmacValue = HmacKey.calculateHmac(key, computerMove);

  console.log(`HMAC: ${hmacValue}`);

  console.log("Available moves:");
  moves.forEach((move, index) => {
    console.log(`${index + 1} - ${move}`);
  });
  console.log("0 - Exit");
  console.log("? - Help");

  const readline = require("readline").createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  readline.question("Enter your move: ", (userInput) => {
    if (userInput === "?") {
      Table.printHelpTable(moves);
      process.exit(0);
    }

    const userChoice = parseInt(userInput);

    if (userChoice === 0) {
      readline.close();
      process.exit(0);
    }

    if (userChoice < 1 || userChoice > moves.length) {
      console.error("Invalid move. Please try again.");
      readline.close();
      process.exit(1);
    }

    const userMove = moves[userChoice - 1];
    const result = Game.determineWinner(userMove, computerMove, moves);

    console.log(`Your move: ${userMove}`);
    console.log(`Computer move: ${computerMove}`);
    console.log(result);
    console.log(`Key: ${key.toString("hex")}`);

    readline.close();
  });
}

main();
