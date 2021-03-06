import React from "react";
import {connect} from "react-redux";
import {getBalances} from "../actions";
import store from "../store";
import SendContainer from "../containers/SendContainer";
import Balances from "../components/Balances";
import {List} from "immutable";


@connect((state) => ({
    txHashes: state.get('txHashes'),
    accounts: state.get('accounts'),
    currentAccount: state.get('currentAccount')
}))
export default class Dashboard extends React.Component {

    constructor() {
        super();
        this.state = {
            loading: true,
            intervalID: 0,
            balances: new List(),
            updater: () => {
            }
        };
        this.generateHashes = this.generateHashes.bind(this);
        this.setBalanceUpdater = this.setBalanceUpdater.bind(this);
    }

    componentWillMount() {
        //If balance is already in the store
        if (store.getState().get('balances')) {
            this.setBalanceUpdater();
            this.setState({loading: false, balances:store.getState().get('balances')});
        } else { //Wait while balance is loading to store
            let unsubscribe = store.subscribe(() => {
                    if (store.getState().get('balances')) {
                        unsubscribe();
                        this.setBalanceUpdater();
                        this.setState({loading: false, balances:store.getState().get('balances')});
                    }
                }
            );
        }
        this.setState({
            updater: store.subscribe(() => {
                let balances = store.getState().get('balances');
                if (balances) {
                    this.setState({balances:balances});
                }
            })
        });
    }

    setBalanceUpdater() {
        this.setState({intervalID: setInterval(() => getBalances(), 10000)});
    }

    componentWillUnmount() {
        clearInterval(this.state.intervalID);
        this.state.updater();
    }

    generateHashes() {
        if (this.props.txHashes) {
            let niceHashes = [];
            this.props.txHashes.forEach((hash, key) => niceHashes.push(
                <div>
                    <p className="hash">{hash}</p>
                    {(key + 1) === this.props.txHashes.size ? null :
                        <div className="hash-separator"/> }
                </div>
            ));
            return niceHashes;
        }
    }

    render() {
        let hashes = this.generateHashes();
        return ( this.state.loading ? <image src="../assets/cat1.gif" className="main-loader-cat"/>
                :
                <div>
                    <div className="col-md-6">
                        <SendContainer balances={this.state.balances}/>

                        {this.props.txHashes ?
                            <div className="transparent-box">
                                <div className="row">
                                    <h2>Transaction Hashes</h2>
                                </div>

                                <div className="row">
                                    <div className="hash-container text-center">
                                        {hashes}
                                    </div>
                                </div>
                            </div>
                            :
                            null
                        }
                    </div>
                    <div className="col-md-6">
                        <Balances currentAccount={this.props.currentAccount}
                                  accounts={this.props.accounts}
                                  balances={this.state.balances}
                        />
                    </div>
                </div>
        );

    }
}