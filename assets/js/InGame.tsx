import React from 'react';

interface InGameProps {
    gameName: string;
    screenName: string;
}

export default class InGame extends React.Component<InGameProps> {
    render() {
        return <div>In Game {this.props.gameName} playing as {this.props.screenName}</div>
    }
}