import React from 'react';
import InGame from './InGame';
import SocketContext from './SocketContext';

interface GameProps {
    onInfo: (msg: string) => void;
    onError: (msg: string) => void;
}

interface GameState {
    gameName: string;
    screenName: string;
    gameChannel?: any;
    isInGame: boolean;
}

export default class Game extends React.Component<GameProps, GameState> {
    constructor(props: GameProps) {
        super(props);
        this.state = {
            gameName: '',
            screenName: '',
            isInGame: false,
        };
    }

    onGameNameChange = (event: any) => {
        if (event.target.value === this.state.gameName) return;
        this.setState({
            gameName: event.target.value,
        });
    }

    onScreenNameChange = (event: any) => {
        if (event.target.value === this.state.screenName) return;
        this.setState({
            screenName: event.target.value,
        });
    }

    onJoinGame = (socket: any) => {
        return () => {
            const { gameName, screenName } = this.state;
            if (!gameName || !screenName) return;
            const gameChannel = socket.channel(`game:${gameName}`, { screen_name: screenName });
            gameChannel.join()
                .receive("ok", (response: any) => {
                    this.props.onInfo("Joined successfully!");
                    this.setState({
                        isInGame: true,
                    });
                    console.log(response);
                })
                .receive("error", (response: any) => {
                    this.props.onError("Unable to join");
                    console.log(response);
                });
            this.setState({
                gameChannel,
            });
        }
    }

    render() {
        const {
            gameName,
            screenName,
            isInGame,
        } = this.state;
        if (isInGame) return (
            <InGame
                gameName={gameName}
                screenName={screenName}/>
        );
        return (
            <form>
                <label>
                    Game name
                    <input type="text" value={gameName} onChange={this.onGameNameChange}/>
                </label>
                <label>
                    Screen name
                    <input type="text" value={screenName} onChange={this.onScreenNameChange}/>
                </label>
                <SocketContext.Consumer>
                    {socket => <button type="button" onClick={this.onJoinGame(socket)}>Join Game</button>}
                </SocketContext.Consumer>
            </form>
        )
    }
}