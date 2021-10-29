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
import axios from "axios"
import qs from 'qs'


function App() {
    const [userData, setUserDate] = useState([]);
    useEffect(() => {
        const fectdata = async () => {
            const connectWeb3 = await connect()
            const {web3, getAccount, getBlockNumber, getChainId, getBalance, getNodeInfo, getPairPriceList, gasTransfer, findLiquidity, removeLiquidity, removeEthLiquidity, erc20Approve, erc20Allowance, erc20Transfer, addETHLiquidity, addErc20Liquidity, getDeadline, dodoApi} = connectWeb3
            const defaultAccount = await getAccount()
            console.log(defaultAccount)
            // dodoswap 接口交易
            const fromTokenAddress = '0x52Ee54dd7a68e9cf131b0a57fd6015C74d7140E2'
            const toTokenAddress = '0xa71EdC38d189767582C38A3145b5873052c3e47a'
            const fromAmount = 0.01
            const slippage = 1
            const res = await dodoApi(fromTokenAddress, toTokenAddress, fromAmount, slippage)
            if (res.data) {
                console.log(res)
                const {approvefromAmount, targetApproveAddr, defaultAccount, priceImpact, resPricePerFromToken, resPricePerToToken, to, data} = res
                const isApproved = await erc20Approve('0x52Ee54dd7a68e9cf131b0a57fd6015C74d7140E2', REACT_APP_ERC20TOKEN_ABI, targetApproveAddr, approvefromAmount, defaultAccount)
                if (isApproved) {
                    web3.eth.sendTransaction({data: data, from: defaultAccount, to: to})
                }
            }


            // dodoApi(fromTokenAddress,toTokenAddress,fromAmount,slippage)
            //
            // const fromTokenAddress = '0x52Ee54dd7a68e9cf131b0a57fd6015C74d7140E2'
            // const fromTokenDecimals = 18
            // const toTokenAddress = '0xa71EdC38d189767582C38A3145b5873052c3e47a'
            // const toTokenDecimals = 18
            // const fromAmount = 0.01 * (10 ** fromTokenDecimals)
            // const slippage = 1
            // const userAddr = defaultAccount
            // const chainId = 128
            // const rpc = 'https://http-mainnet-node.huobichain.com'
            // const deadLine = await getDeadline()


            // erc20Approve('0xa71edc38d189767582c38a3145b5873052c3e47a',REACT_APP_ERC20TOKEN_ABI,'0xed7d5f38c79115ca12fe6c0041abb22f0a06c300',0,defaultAccount).then(res=>{
            //     console.log(res)
            // }).catch(e=>{
            //     console.log(e)
            // })
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
