// NOTE: The contents of this file will only be executed if
// you uncomment its entry in "assets/js/app.js".

// To use Phoenix channels, the first step is to import Socket,
// and connect at the socket path in "lib/web/endpoint.ex".
//
// Pass the token on params as below. Or remove it
// from the params if you are not using authentication.
import {Socket} from "phoenix"

let socket = new Socket("/socket", {params: {}})

// When you connect, you'll often need to authenticate the client.
// For example, imagine you have an authentication plug, `MyAuth`,
// which authenticates the session and assigns a `:current_user`.
// If the current user exists you can assign the user's token in
// the connection for use in the layout.
//
// In your "lib/web/router.ex":
//
//     pipeline :browser do
//       ...
//       plug MyAuth
//       plug :put_user_token
//     end
//
//     defp put_user_token(conn, _) do
//       if current_user = conn.assigns[:current_user] do
//         token = Phoenix.Token.sign(conn, "user socket", current_user.id)
//         assign(conn, :user_token, token)
//       else
//         conn
//       end
//     end
//
// Now you need to pass this token to JavaScript. You can do so
// inside a script tag in "lib/web/templates/layout/app.html.eex":
//
//     <script>window.userToken = "<%= assigns[:user_token] %>";</script>
//
// You will need to verify the user token in the "connect/3" function
// in "lib/web/channels/user_socket.ex":
//
//     def connect(%{"token" => token}, socket, _connect_info) do
//       # max_age: 1209600 is equivalent to two weeks in seconds
//       case Phoenix.Token.verify(socket, "user socket", token, max_age: 1209600) do
//         {:ok, user_id} ->
//           {:ok, assign(socket, :user, user_id)}
//         {:error, reason} ->
//           :error
//       end
//     end
//
// Finally, connect to the socket:
socket.connect()

export function new_game_channel(subtopic, screen_name) {
  return socket.channel(`game:${subtopic}`, {screen_name});
}

export function join(channel) {
  channel.join()
    .receive("ok", response => {
      console.log("Joined successfully!", response);
    })
    .receive("error", response => {
      console.log("Unable to join", response);
    });
}

export function leave(channel) {
  channel.leave()
    .receive("ok", response => {
      console.log("Left successfully", response)
    })
    .receive("error", response => {
      console.log("Unable to leave", response)
    })
}

let game = document.querySelector("#game");
let joinGameButton = document.querySelector("#join-game");

let gameChannel;

function joinGame(game_name, screen_name) {
  gameChannel = new_game_channel(game_name, screen_name);
  join(gameChannel);
  gameChannel.on("player_added", response => {
    console.log("Player Added", response);
  });
  gameChannel.on("player_set_islands", response => {
    console.log("Player Set Islands", response);
  });
  gameChannel.on("player_guessed_coordinate", response => {
    console.log("Player Guessed Coordinate: ", response.result);
  });
  gameChannel.on("subscribers", response => {
    console.log("These players have joined: ", response);
  });
}

function getGameName() {
  const gameNameInput = document.getElementById("game-name");
  return gameNameInput.value;
}

function getPlayerName() {
  const playerNameInput = document.getElementById("player-name");
  return playerNameInput.value;
}

joinGameButton.addEventListener("click", _event => {
  joinGame(getGameName(), getPlayerName());
});

function new_game(channel, greeting) {
  channel.push("new_game")
    .receive("ok", response => {
      console.log("New Game!", response);
    })
    .receive("error", response => {
      console.log("Unable to start a new game.", response);
    })
}

let newGame = document.querySelector("#new-game");
newGame.addEventListener("click", _event => {
  new_game(gameChannel);
});

function add_player(channel, player) {
  channel.push("add_player", player)
    .receive("error", response => {
      console.log("Unable to add new player: " + player, response);
    });
}

let addPlayer = document.querySelector("#add-player");
addPlayer.addEventListener("click", _event => {
  add_player(gameChannel, getPlayerName());
});

function position_island(channel, player, island, row, col) {
  const params = {
    player,
    island,
    row,
    col,
  };
  channel.push("position_island", params)
    .receive("ok", response => {
      console.log("Island positioned!", response);
    })
    .receive("error", response => {
      console.log("Unable to position island.", response);
    });
}

let positionIslandP2 = document.querySelector("#position-island-p2");
positionIslandP2.addEventListener("click", _event => {
  position_island(gameChannel, "player2", "atoll", 1, 1);
  position_island(gameChannel, "player2", "dot", 1, 5);
  position_island(gameChannel, "player2", "l_shape", 1, 7);
  position_island(gameChannel, "player2", "s_shape", 5, 1);
  position_island(gameChannel, "player2", "square", 5, 5);
});

let positionIslandP1 = document.querySelector("#position-island-p1");
positionIslandP1.addEventListener("click", _event => {
  position_island(gameChannel, "player1", "dot", 1, 5);
});

function set_islands(channel, player) {
  channel.push("set_islands", player)
    .receive("ok", response => {
      console.log("Here is the board:");
      console.dir(response.board);
    })
    .receive("error", response => {
      console.log("Unable to set islands for: " + player, response);
    });
}

let setIslands = document.querySelector("#set-islands");
setIslands.addEventListener("click", _event => {
  set_islands(gameChannel, getPlayerName());
});

function guess_coordinate(channel, player, row, col) {
  const params = {
    player,
    row,
    col,
  };
  channel.push("guess_coordinate", params)
    .receive("error", response => {
      console.log("Unable to guess a coordinate: " + player, response);
    });
}

let guessCoordinateP1 = document.querySelector("#guess-coordinate-p1");
guessCoordinateP1.addEventListener("click", _event => {
  guess_coordinate(gameChannel, "player1", 10, 1);
});

let guessCoordinateP2 = document.querySelector("#guess-coordinate-p2");
guessCoordinateP2.addEventListener("click", _event => {
  guess_coordinate(gameChannel, "player2", 1, 5);
});


let showSubscribers = document.querySelector("#show-subscribers");
showSubscribers.addEventListener("click", _event => {
  gameChannel.push("show_subscribers");
});

export default socket
