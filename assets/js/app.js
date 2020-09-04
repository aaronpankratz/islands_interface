import React from "react";
import ReactDOM from "react-dom";
import Game from './Game';

// We need to import the CSS so that webpack will load it.
// The MiniCssExtractPlugin is used to separate it out into
// its own CSS file.
import "../css/app.scss"

// webpack automatically bundles all modules in your
// entry points. Those entry points can be configured
// in "webpack.config.js".
//
// Import deps with the dep name or local files with a relative path, for example:
//
import socket from "./socket"

import "phoenix_html"
import { Socket } from "phoenix";
import SocketContext from "./SocketContext";

interface AppProps {
    socket: any;
}

interface AppState {
    info?: string;
    error?: string;
}

class App extends React.Component<AppProps, AppState> {
    timeoutId: number;

    componentWillUnmount() {
        if (this.timeoutId) {
            clearTimeout(this.timeoutId);
        }
    }

    toast = (type: string, msg: string) => {
        this.setState({
            [type]: msg,
        }, () => {
            this.timeoutId = setTimeout(() => {
                this.setState({
                    [type]: undefined,
                })
            }, 3000);
        });
    }

    info = (msg: string) => {
        this.toast('info', msg);
    }

    error = (msg: string) => {
        this.toast('error', msg);
    }

    render() {
        const {
            error,
            info,
        } = this.state;
        return (
            <SocketContext.Provider value={this.props.socket}>
                <section className="phx-hero">
                    {info && <div className="alert alert-info" role="alert">{info}</div>}
                    {error && <div className="alert alert-error" role="aler">{error}</div>}
                    <Game onInfo={this.info} onError={this.error}/>
                </section>
            </SocketContext.Provider>
        );
    }
}

const appElement = document.getElementById("app");
ReactDOM.render(<App socket={socket} />, appElement);