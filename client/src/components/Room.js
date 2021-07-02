import React, { Component } from "react";
import { Container } from 'reactstrap';
import SimpleStorageContract from "../contracts/SimpleStorage.json";
import DeCallContract from "../contracts/Decall.json";
import getWeb3 from "../getWeb3";
import Call from './Call';

import "./App.css";

class Room extends Component {
  state = { 
    roomId: "",
    storageValue: 0, 
    web3: null, 
    accounts: null, 
    contract: null,
    callContract: null,
  };

  componentDidMount = async () => {
    console.log(this.props.match);
    try {
      // Get network provider and web3 instance.
      const web3 = await getWeb3();

      // Use web3 to get the user's accounts.
      const accounts = await web3.eth.getAccounts();
      web3.eth.defaultAccount = accounts[0];

      // Get the contract instance.
      const networkId = await web3.eth.net.getId();
      const deployedNetwork = SimpleStorageContract.networks[networkId];
      const instance = new web3.eth.Contract(
        SimpleStorageContract.abi,
        deployedNetwork && deployedNetwork.address,
      );

      const decappDeployedNetwork = DeCallContract.networks[networkId];
      const callContract = new web3.eth.Contract(
        DeCallContract.abi,
        decappDeployedNetwork && decappDeployedNetwork.address,
      );

      const roomId = this.props.match.params.roomId;

      // Set web3, accounts, and contract to the state, and then proceed with an
      // example of interacting with the contract's methods.
      this.setState({ 
        roomId,
        web3, 
        accounts, 
        contract: instance, 
        callContract,
      }, this.runExample);
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`,
      );
      console.error(error);
    }
  };

  runExample = async () => {
    const { accounts, contract } = this.state;

    // // Stores a given value, 5 by default.
    // await contract.methods.set(5).send({ from: accounts[0] });

    // // Get the value from the contract to prove it worked.
    // const response = await contract.methods.get().call();

    // // Update state with the result.
    // this.setState({ storageValue: response });
  };

  render() {
    if (!this.state.web3) {
      return <div>Loading Web3, accounts, and contract...</div>;
    }
    return (
      <div className="App">
        <h1>RoomId: {this.state.roomId}</h1>
        <Container>
          {this.state.callContract ? (
            <Call 
                roomId={this.state.roomId}
                callContract={this.state.callContract}
            />
          ) : null}
        </Container>
      </div>
    );
  }
}

export default Room;
