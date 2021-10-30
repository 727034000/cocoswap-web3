import './App.css';
import {
    REACT_APP_ERC20TOKEN_ABI,
    REACT_APP_PAIR_ABI,
    REACT_APP_ROUTER_ABI,
    REACT_APP_ETH_ADDRESS,
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
            const {web3, getAccount, getBlockNumber, getChainId, getBalance, getNodeInfo, getPairPriceList, findLiquidity, removeLiquidity, removeEthLiquidity, erc20Approve, getErc20Allowance, getErc20Decimals, getErc20balance, gasTransfer, erc20Transfer, getPairInfo, addETHLiquidity, addErc20Liquidity, getDeadline, dodoApi, swapTokensForTokens, swapTokenForETH, swapETHForToken} = connectWeb3
            const defaultAccount = await getAccount()
            const defaultChainId = await getChainId()
            const BlockNumber = await getBlockNumber()
            const defaultETH = web3.utils.toChecksumAddress(REACT_APP_ETH_ADDRESS[defaultChainId])
            console.log(defaultAccount)
            console.log(defaultChainId)
            console.log(BlockNumber)
            console.log(defaultETH)
            console.log('getBalance', await getBalance(defaultAccount))
            console.log('getNodeInfo', await getNodeInfo())
            console.log('getDeadline', await getDeadline())
            console.log('getErc20Decimals', await getErc20Decimals(defaultETH))
            console.log('getErc20balance', await getErc20balance(defaultETH, defaultAccount))
            const RouterAddress = web3.utils.toChecksumAddress('0xed7d5f38c79115ca12fe6c0041abb22f0a06c300')
            // console.log('代币授权测试',await erc20Approve(defaultETH,RouterAddress,20,defaultAccount))
            // console.log('获取代币额度',await getErc20Allowance(defaultETH,defaultAccount,RouterAddress))
            const USDT = web3.utils.toChecksumAddress('0xa71edc38d189767582c38a3145b5873052c3e47a')
            const CHG = web3.utils.toChecksumAddress('0xa6d5a19151ecd3c36c6b84fe1e11aa8fd510962d')
            const TransferTo = web3.utils.toChecksumAddress('0xc1ac5Fd459d2e89BC1B7a11Ea7b89F4c7254093F')
            // console.log('代币转账测试',await erc20Transfer(USDT,TransferTo,0.01))
            // console.log('Gas费转账测试',await gasTransfer(TransferTo,0.001))
            //console.log('查找流动性测试',await findLiquidity(defaultETH,USDT,RouterAddress,defaultAccount))
            const PairAddress = web3.utils.toChecksumAddress('0x499B6E03749B4bAF95F9E70EeD5355b138EA6C31') //HT-USDT
            // console.log('获取流动性信息测试',await getPairPriceList(PairAddress,defaultAccount))
            // console.log('根据两个代币获取交易对信息', await getPairInfo(defaultETH, USDT,RouterAddress))
            // console.log('添加HT-USDT流动性测试',await addETHLiquidity(USDT,0.01,0.01,RouterAddress))
            // console.log('代币CHG授权测试',await erc20Approve(CHG,RouterAddress,100))
            // console.log('代币USDT授权测试',await erc20Approve(USDT,RouterAddress,100))
            // console.log('添加USDT-CHG流动性测试',await addErc20Liquidity(CHG,USDT,100,0.01,RouterAddress))
            const PairAddress2 = web3.utils.toChecksumAddress('0x3844361e0d2fef2839161773920f87849a2cb39c')//CHG-USDT
            // console.log('移除CHG-USDT流动性测试',await removeLiquidity(PairAddress2,RouterAddress,0.01))
            // console.log('移除HT-USDT流动性测试',await removeEthLiquidity(PairAddress,RouterAddress,0.01))
            // console.log('代币CHG授权测试',await erc20Approve(CHG,RouterAddress,100))
            // console.log('代币USDT授权测试',await erc20Approve(USDT,RouterAddress,100))
            // console.log('CHG-USDT兑换测试',await swapTokensForTokens(CHG,USDT,0.1,5,RouterAddress))
            // console.log('USDT-CHG兑换测试', await swapTokensForTokens(USDT, CHG, 1, 5, RouterAddress))
            // console.log('HT-USDT兑换', await swapETHForToken(USDT, 0.01, 5, RouterAddress))
            // console.log('USDT-HT兑换', await swapTokenForETH(USDT, 0.01, 5, RouterAddress))
            console.log('调用dodoswap接口测试')
            //HT兑换USDT,fromAddress设为空
            //const dodoObj = {fromAddress: '', toAddress: USDT, fromAmount: 0.00001, slippage: 5}
            //USDT兑换HT,toAddress设为空
            // const dodoObj = {fromAddress: USDT, toAddress: '', fromAmount: 1, slippage: 5}
            // const txDodoApi = await dodoApi(dodoObj.fromAddress, dodoObj.toAddress, dodoObj.fromAmount, dodoObj.slippage)
            // console.log(txDodoApi)
            // if (txDodoApi.data) {
            //     let isApproved
            //     let {targetApproveAddr, data, to} = txDodoApi
            //     if (targetApproveAddr === '') {
            //         isApproved = true
            //     } else {
            //         isApproved = await erc20Approve(dodoObj.fromAddress, targetApproveAddr, dodoObj.fromAmount)
            //     }
            //     if (isApproved) {
            //         let txConfig = {
            //             data: data,
            //             from: defaultAccount,
            //             to: to,
            //         }
            //         if (targetApproveAddr === '') {
            //             txConfig.value = maxamount(dodoObj.fromAmount, 18, false)
            //         }
            //         await web3.eth.sendTransaction(txConfig)
            //     }
            // }
            // console.log('调用dodoswap接口测试结束')
            const MDX = web3.utils.toChecksumAddress('0x25D2e80cB6B86881Fd7e07dd263Fb79f4AbE033c')
            //寻找最佳兑换路径
            const list = [MDX, defaultETH, USDT]
            const m1 = await getPairInfo(MDX, defaultETH, RouterAddress)
            const m2 = await getPairInfo(defaultETH, USDT, RouterAddress)
            const m3 = await getPairInfo(MDX, USDT, RouterAddress)
            let n1 = (m1[MDX]['reserve']) / (m1[defaultETH]['reserve'])
            let n2 = (m2[defaultETH]['reserve']) / (m2[USDT]['reserve'])
            let n3 = (m3[MDX]['reserve']) / (m3[USDT]['reserve'])
            console.log(n1 * n2)
            console.log(n3)


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
