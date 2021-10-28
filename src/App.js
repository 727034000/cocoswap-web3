import './App.css';
import {
    REACT_APP_ERC20TOKEN_ABI,
    REACT_APP_PAIR_ABI,
    REACT_APP_ROUTER_ABI,
    getTokenList,
    getPairList,
    connect
} from './api/web3'
import {useEffect, useState} from 'react'


function App() {
    const [userData, setUserDate] = useState([]);
    useEffect(() => {
        const fectdata = async () => {
            const connectWeb3 = await connect()
            const {web3, getAccount, getBlockNumber, getChainId, getBalance, getNodeInfo, getPairPriceList, gasTransfer, findLiquidity, removeLiquidity, removeEthLiquidity, erc20Approve, erc20Allowance,erc20Transfer, addETHLiquidity, addErc20Liquidity} = connectWeb3
            const defaultAccount = await getAccount()
            console.log(defaultAccount)

            // erc20Approve('0xa71edc38d189767582c38a3145b5873052c3e47a',REACT_APP_ERC20TOKEN_ABI,'0xed7d5f38c79115ca12fe6c0041abb22f0a06c300',0,defaultAccount).then(res=>{
            //     console.log(res)
            // }).catch(e=>{
            //     console.log(e)
            // })
            erc20Allowance('0xa71edc38d189767582c38a3145b5873052c3e47a',REACT_APP_ERC20TOKEN_ABI,defaultAccount,'0xed7d5f38c79115ca12fe6c0041abb22f0a06c300').then(res=>{
                console.log(res)
            }).catch(e=>{
                console.log(e)
            })
        }
        fectdata()
    }, [])
    return (
        <div className="App">
            <header className="App-header">
                web
            </header>
        </div>
    );
}

export default App;
