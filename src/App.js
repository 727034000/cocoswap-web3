import './App.css';
import {connect} from './api/web3'
import {useEffect} from 'react'

function App() {

    useEffect(() => {
        const fectdata = async () => {
            const connectWeb3 = await connect()
            const {web3, getAccount, getBlockNumber, getChainId, getBalance, getNodeInfo, getPairPriceList, gasTransfer, findLiquidity, removeLiquidity, removeEthLiquidity, erc20Approve, erc20Transfer, addETHLiquidity, addErc20Liquidity} = connectWeb3
            const defaultAccount = await getAccount()
            console.log(defaultAccount)
        }
        fectdata()
    }, [])
    return (
        <div className="App">
            <header className="App-header">
                Web3
            </header>
        </div>
    );
}

export default App;
