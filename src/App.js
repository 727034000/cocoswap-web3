import './App.css';
import {
    REACT_APP_ERC20TOKEN_ABI,
    REACT_APP_PAIR_ABI,
    REACT_APP_ROUTER_ABI,
    getTokenList,
    getPairList,
    connect, maxamount
} from './api/web3'
import {useEffect, useState} from 'react'
import axios from "axios"
import qs from 'qs'


function App() {
    const [userData, setUserDate] = useState([]);
    useEffect(() => {
        const fectdata = async () => {
            const connectWeb3 = await connect()
            const {web3, getAccount, getBlockNumber, getChainId, getBalance, getNodeInfo, getPairPriceList, gasTransfer, findLiquidity, removeLiquidity, removeEthLiquidity, erc20Approve, erc20Allowance, erc20Transfer, addETHLiquidity, addErc20Liquidity, getDeadline, dodoApi,swapTokensForTokens} = connectWeb3
            const defaultAccount = await getAccount()
            console.log(defaultAccount)
            // dodoswap 接口交易
            // const fromTokenAddress = '0xe9e7cea3dedca5984780bafc599bd69add087d56'
            // const toTokenAddress = '0xf9f89ef3c1b96a662db5fc9184dbf6ca1416dfe5'
            // const fromTokenAddress = '0xf9f89ef3c1b96a662db5fc9184dbf6ca1416dfe5'
            // const toTokenAddress = '0xe9e7cea3dedca5984780bafc599bd69add087d56'
            // const fromAmount = 15000
            // const slippage = 3
            // const res = await dodoApi(fromTokenAddress, toTokenAddress, fromAmount, slippage)
            // if (res.data) {
            //     console.log(res)
            //     const {approvefromAmount, targetApproveAddr, defaultAccount, priceImpact, resPricePerFromToken, resPricePerToToken, to, data} = res
            //     const isApproved = await erc20Approve(fromTokenAddress, REACT_APP_ERC20TOKEN_ABI, targetApproveAddr, approvefromAmount, defaultAccount)
            //     if (isApproved) {
            //         web3.eth.sendTransaction({data: data, from: defaultAccount, to: to})
            //     }
            // }
            const isSwaped = await swapTokensForTokens('0xa71edc38d189767582c38a3145b5873052c3e47a','0x80861a817106665bca173db6ac2ab628a738c737',1,0.5,REACT_APP_PAIR_ABI,REACT_APP_ROUTER_ABI,'0xed7d5f38c79115ca12fe6c0041abb22f0a06c300')
            console.log(isSwaped)

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
